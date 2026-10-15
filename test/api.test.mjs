import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleApi} from '../src/api.js';

class Store {
  data = new Map();
  async get(k){return structuredClone(this.data.get(k))}
  async put(k,v){this.data.set(k,structuredClone(v))}
  async delete(k){this.data.delete(k)}
  async list({prefix}){return new Map([...this.data].filter(([k])=>k.startsWith(prefix)))}
}
const env={TEACHER_PASSWORD:'a long test-only teacher password'};
const sample={courses:[{id:'biology30',name:'Biology 30',sets:[{date:'2026-10-15',title:'Private set',questions:Array.from({length:6},(_,i)=>({question:'SECRET question '+i,answer:'SECRET answer '+i}))}]}]};
function client(storage){return async(path,body,cookie='',origin='https://review.test')=>handleApi(new Request('https://review.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)}),env,storage)}
test('private import, locking, persistence, logout, and invalid input',async()=>{
  const storage=new Store(),call=client(storage);
  assert.equal((await call('/api/import',sample)).status,401);
  assert.equal((await call('/api/login',{password:env.TEACHER_PASSWORD},'','https://evil.test')).status,403);
  assert.equal((await call('/api/login',{password:'wrong'})).status,401);
  const login=await call('/api/login',{password:env.TEACHER_PASSWORD});assert.equal(login.status,200);
  const setCookie=login.headers.get('Set-Cookie');assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/Secure/);assert.match(setCookie,/SameSite=Strict/);
  const cookie=setCookie.split(';')[0];
  assert.equal((await call('/api/import',sample,cookie)).status,200);
  let bank=await call('/api/bank');assert.doesNotMatch(await bank.clone().text(),/SECRET/);assert.equal((await bank.json()).courses[0].sets[0].locked,true);
  assert.equal((await call('/api/lock',{course:'biology30',date:'2026-10-15',locked:false},cookie)).status,200);
  assert.match(await (await call('/api/bank')).text(),/SECRET question/);
  await call('/api/import',sample,cookie);assert.equal((await (await call('/api/bank')).json()).courses[0].sets[0].locked,false);
  await call('/api/lock',{course:'biology30',date:'2026-10-15',locked:true},cookie);
  assert.doesNotMatch(await (await call('/api/bank')).text(),/SECRET/);
  assert.doesNotMatch(await (await call('/api/bank',undefined,cookie)).text(),/SECRET/);
  assert.equal((await client(storage)('/api/bank')).status,200);
  assert.equal((await call('/api/lock',{course:'missing',date:'2026-10-15',locked:false},cookie)).status,404);
  assert.equal((await call('/api/lock',{course:'biology30',date:'2026-10-15',locked:'false'},cookie)).status,400);
  assert.equal((await call('/api/import',{courses:[{...sample.courses[0],sets:[{...sample.courses[0].sets[0],questions:[]}]}]},cookie)).status,400);
  await call('/api/logout',{},cookie);assert.equal((await call('/api/lock',{course:'biology30',date:'2026-10-15',locked:false},cookie)).status,401);
});
test('password guessing is rate limited and expired sessions are denied',async()=>{
  const storage=new Store(),call=client(storage);
  for(let i=0;i<20;i++)assert.equal((await call('/api/login',{password:'wrong'})).status,401);
  assert.equal((await call('/api/login',{password:env.TEACHER_PASSWORD})).status,429);
  await storage.delete('login-rate');const response=await call('/api/login',{password:env.TEACHER_PASSWORD});const cookie=response.headers.get('Set-Cookie').split(';')[0];
  const key='session:'+cookie.split('=')[1],session=await storage.get(key);session.expires=0;await storage.put(key,session);
  assert.equal((await call('/api/import',sample,cookie)).status,401);
});
test('missing or weak server secret fails closed',async()=>{
  const response=await handleApi(new Request('https://review.test/api/bank'),{},new Store());assert.equal(response.status,503);
});

test('device preview reads locked sets without teacher privileges or public unlocking', async()=>{
 const storage=new Store(),call=client(storage);
 await storage.put('bank',sample);
 assert.equal((await call('/api/preview/bank')).status,401);
 assert.equal((await call('/api/preview/login',{password:'wrong'})).status,401);
 const login=await call('/api/preview/login',{password:env.TEACHER_PASSWORD});
 assert.equal(login.status,200);
 const cookie=login.headers.get('Set-Cookie').split(';')[0];
 assert.match(cookie,/__Host-review-preview=/);
 assert.match(login.headers.get('Set-Cookie'),/Max-Age=1800/);
 const preview=await (await call('/api/preview/bank',undefined,cookie)).json();
 assert.equal(preview.teacher,false);
 assert.equal(preview.courses[0].sets[0].locked,true);
 assert.equal(preview.courses[0].sets[0].questions.length,6);
 for(const cookies of ['',cookie])assert.doesNotMatch(await (await call('/api/bank',undefined,cookies)).text(),/SECRET/);
 assert.equal((await call('/api/lock',{course:'biology30',date:'2026-10-15',locked:false},cookie)).status,401);
 assert.equal((await call('/api/import',sample,cookie)).status,401);
 assert.equal((await call('/api/lock',{course:'biology30',date:'2026-10-15',locked:false},cookie.replace('__Host-review-preview','__Host-review-session'))).status,401);
 await call('/api/preview/logout',{},cookie);
 assert.equal((await call('/api/preview/bank',undefined,cookie)).status,401);
 const second=await call('/api/preview/login',{password:env.TEACHER_PASSWORD});const next=second.headers.get('Set-Cookie').split(';')[0];
 const key='session:'+next.split('=')[1];const session=await storage.get(key);session.expires=0;await storage.put(key,session);
 assert.equal((await call('/api/preview/bank',undefined,next)).status,401);
});
