const cookieName = '__Host-review-session';
const sessionMs = 8 * 60 * 60 * 1000;
const json = (body, status = 200, extra = {}) => Response.json(body, {status, headers: {'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', ...extra}});
const digest = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
async function matches(a, b) {
  const x = await digest(a), y = await digest(b);
  let different = 0;
  for (let i = 0; i < x.length; i++) different |= x[i] ^ y[i];
  return different === 0;
}
function sessionToken(request) {
  return (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1) || '';
}
async function teacher(request, env, storage) {
  const token = sessionToken(request);
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const session = await storage.get('session:' + token);
  if (!session || session.expires <= Date.now()) { if (session) await storage.delete('session:' + token); return false; }
  // Rotating the configured password immediately invalidates existing sessions.
  return matches(session.passwordFingerprint, String(await digest(env.TEACHER_PASSWORD || '')));
}
function validateBank(bank) {
  if (!bank || !Array.isArray(bank.courses) || bank.courses.length > 30) return false;
  const ids = new Set();
  return bank.courses.every(c => {
    if (!c || !/^[a-zA-Z0-9_-]{1,80}$/.test(c.id) || ids.has(c.id) || typeof c.name !== 'string' || !Array.isArray(c.sets) || c.sets.length > 2000) return false;
    ids.add(c.id); const dates = new Set();
    return c.sets.every(s => {
      if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s.date) || dates.has(s.date) || typeof s.title !== 'string' || !Array.isArray(s.questions) || s.questions.length !== 6) return false;
      dates.add(s.date);
      return s.questions.every(q => q && typeof q.question === 'string' && q.question.length > 0 && q.question.length <= 10000 && typeof q.answer === 'string' && q.answer.length > 0 && q.answer.length <= 10000);
    });
  });
}
export async function handleApi(request, env, storage) {
  const path = new URL(request.url).pathname, method = request.method;
  if (!['GET', 'POST'].includes(method)) return json({error: 'Method not allowed.'}, 405);
  if (method === 'POST') {
    if (request.headers.get('Origin') !== new URL(request.url).origin) return json({error: 'Invalid request origin.'}, 403);
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return json({error: 'JSON required.'}, 415);
  }
  if (!env.TEACHER_PASSWORD || env.TEACHER_PASSWORD.length < 16) return json({error: 'Teacher password must be configured before opening this site.'}, 503);
  if (path === '/api/login' && method === 'POST') {
    const rate = await storage.get('login-rate') || {count: 0, until: 0};
    if (rate.until > Date.now() && rate.count >= 20) return json({error: 'Too many attempts. Try again in ten minutes.'}, 429);
    const body = await readJson(request, 2000);
    if (!body || typeof body.password !== 'string') return json({error: 'Enter your teacher password.'}, 400);
    // Reserve an attempt before hashing so concurrent guesses cannot bypass the limit.
    await storage.put('login-rate', {count: rate.until > Date.now() ? rate.count + 1 : 1, until: rate.until > Date.now() ? rate.until : Date.now() + 600000});
    if (!await matches(body.password, env.TEACHER_PASSWORD)) return json({error: 'Incorrect teacher password.'}, 401);
    await storage.delete('login-rate');
    const sessions = await storage.list({prefix: 'session:'});
    for (const [key, value] of sessions) if (value.expires <= Date.now()) await storage.delete(key);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    await storage.put('session:' + token, {expires: Date.now() + sessionMs, passwordFingerprint: String(await digest(env.TEACHER_PASSWORD))});
    return json({teacher: true}, 200, {'Set-Cookie': `${cookieName}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${sessionMs / 1000}`});
  }
  if (path === '/api/logout' && method === 'POST') {
    await storage.delete('session:' + sessionToken(request));
    return json({teacher: false}, 200, {'Set-Cookie': `${cookieName}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`});
  }
  const isTeacher = await teacher(request, env, storage);
  if (path === '/api/bank' && method === 'GET') {
    const bank = await storage.get('bank');
    if (!bank) return json({teacher: isTeacher, courses: [], needsImport: true});
    const courses = [];
    for (const course of bank.courses) {
      const sets = [];
      for (const set of course.sets) {
        const locked = (await storage.get('lock:' + course.id + ':' + set.date)) !== false;
        sets.push({date: set.date, title: set.title, locked, count: set.questions.length, questions: locked ? [] : set.questions});
      }
      courses.push({id: course.id, name: course.name, sets});
    }
    return json({teacher: isTeacher, courses});
  }
  if (!isTeacher) return json({error: 'Sign in with your teacher password.'}, 401);
  if (path === '/api/lock' && method === 'POST') {
    const body = await readJson(request, 2000);
    if (!body || typeof body.locked !== 'boolean') return json({error: 'Invalid lock setting.'}, 400);
    const bank = await storage.get('bank');
    if (!bank?.courses.find(c => c.id === body.course)?.sets.some(s => s.date === body.date)) return json({error: 'Set not found.'}, 404);
    await storage.put('lock:' + body.course + ':' + body.date, body.locked);
    return json({ok: true});
  }
  if (path === '/api/import' && method === 'POST') {
    const body = await readJson(request, 1500000);
    if (!validateBank(body)) return json({error: 'Choose a review bank JSON file with unique courses and dates and exactly six questions per set.'}, 400);
    // Replace the bank without overwriting lock settings. New sets default to locked.
    const bank = {courses: body.courses.map(c => ({id: c.id, name: c.name, sets: c.sets.map(s => ({date: s.date, title: s.title, questions: s.questions.map(q => ({question: q.question, answer: q.answer}))}))}))};
    await storage.put('bank', bank);
    return json({ok: true});
  }
  return json({error: 'Not found.'}, 404);
}
async function readJson(request, max) {
  if (Number(request.headers.get('Content-Length') || 0) > max) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0; const chunks = [];
  while (true) {
    const {value, done} = await reader.read(); if (done) break;
    size += value.length;
    if (size > max) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { return null; }
}
