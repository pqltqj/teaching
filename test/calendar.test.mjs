import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleApi} from '../src/api.js';
import {calendarDate, calendarState, updateCalendar} from '../src/calendar.js';
import {calendarCourses, calendarSeed} from '../src/calendar-seed.js';

class Store {
  data = new Map(); queue = Promise.resolve();
  async get(key){return structuredClone(this.data.get(key))}
  async put(key,value){this.data.set(key,structuredClone(value))}
  async delete(key){this.data.delete(key)}
  async list({prefix}){return new Map([...this.data].filter(([key])=>key.startsWith(prefix)))}
  transaction(fn){const pending=this.queue.then(()=>fn(this));this.queue=pending.catch(()=>{});return pending}
}
const env={TEACHER_PASSWORD:'a test-only teacher password'};
function client(storage){return (path,body,cookie='',origin='https://calendar.test')=>handleApi(new Request('https://calendar.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)}),env,storage)}
const day=(date='2026-10-26',revision=0)=>({date,revision,biology30:'Updated review',chemistry20:'Quiz',biology20:'Respiration',note:''});

test('planner seed includes only requested courses and October 26 onward, including November 30',()=>{
  assert.deepEqual(calendarCourses.map(c=>c.name),['Biology 30','Science 10 (Block 2)','Chemistry 20','Biology 20']);
  for(const date of Object.keys(calendarSeed))assert.equal(calendarDate(date),true,date);
  assert.equal(calendarSeed['2026-10-27'].biology30,'Reproduction test');
  assert.equal(calendarSeed['2026-10-27'].chemistry20,'Net ionic equations (p. 6)');
  assert.equal(calendarSeed['2026-11-30'].biology30,'DNA');
  assert.equal(calendarSeed['2026-12-18'].note,'PLF');
  assert.equal(calendarSeed['2026-12-31'].note,'Christmas break');
  assert.equal(calendarSeed['2026-11-03'].science10,'Mitosis and telomeres');
  assert.equal(calendarSeed['2026-11-30'].science10,'DNA');
  assert.equal(calendarSeed['2026-12-11'].science10,'DNA and RNA test');
  for(const [date,day] of Object.entries(calendarSeed)) if(date<'2026-11-01'||day.note) assert.equal(day.science10,undefined);
});

test('calendar reads publicly, but writes require teacher login and a same-origin JSON request',async()=>{
  const storage=new Store(),call=client(storage);
  let r=await call('/api/calendar');assert.equal(r.status,200);
  assert.equal((await r.json()).teacher,false);
  assert.match(r.headers.get('Cache-Control'),/no-store/);
  assert.equal((await call('/api/calendar',day())).status,401);
  const login=await call('/api/login',{password:env.TEACHER_PASSWORD});
  const cookie=login.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await call('/api/calendar',day(),cookie,'https://evil.test')).status,403);
  assert.equal((await call('/api/calendar',day(),cookie)).status,200);
  const updated=await (await call('/api/calendar',undefined,cookie)).json();
  assert.equal(updated.teacher,true);assert.equal(updated.days['2026-10-26'].biology30,'Updated review');
  await call('/api/logout',{},cookie);
  assert.equal((await call('/api/calendar',day('2026-10-26',1),cookie)).status,401);
});

test('preview-only sessions cannot edit the calendar',async()=>{
  const call=client(new Store());
  const r=await call('/api/preview/login',{password:env.TEACHER_PASSWORD});
  const cookie=r.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await (await call('/api/calendar',undefined,cookie)).json()).teacher,false);
  assert.equal((await call('/api/calendar',day(),cookie)).status,401);
});

test('teacher edits survive a fresh reader and do not alter the review bank or draft storage',async()=>{
  const storage=new Store();await storage.put('bank',{unchanged:true});await storage.put('draft:example',{unchanged:true});
  await updateCalendar(storage,day());
  const next=await calendarState(storage,false);
  assert.equal(next.days['2026-10-26'].revision,1);
  assert.equal(next.days['2026-10-26'].biology30,'Updated review');
  assert.deepEqual(await storage.get('bank'),{unchanged:true});
  assert.deepEqual(await storage.get('draft:example'),{unchanged:true});
});

test('date bounds, impossible dates, content limits, and malformed revisions are rejected',async()=>{
  for(const date of ['2026-10-25','2026-11-31','2027-01-01','2026-12-32','2026-11-1'])assert.equal(calendarDate(date),false,date);
  for(const body of [null,day('2026-10-25'),day('2026-11-31'),{...day(),revision:-1},{...day(),revision:'0'},{...day(),note:'x'.repeat(1501)},{...day(),biology30:null}])assert.equal((await updateCalendar(new Store(),body)).status,400);
});

test('stale and concurrent edits cannot silently overwrite newer changes; unrelated days can save',async()=>{
  const storage=new Store();
  const results=await Promise.all([updateCalendar(storage,day()),updateCalendar(storage,{...day(),biology30:'Competing edit'})]);
  assert.deepEqual(results.map(r=>r.status),[200,409]);
  assert.equal((await updateCalendar(storage,day('2026-10-27'))).status,200);
  assert.equal((await updateCalendar(storage,day('2026-10-26',1))).status,200);
});

test('clearing entries persists as blank instead of restoring the printed plan',async()=>{
  const storage=new Store();
  assert.equal((await updateCalendar(storage,{date:'2026-10-26',revision:0,biology30:'',chemistry20:'',biology20:'',note:''})).status,200);
  const saved=(await calendarState(storage,false)).days['2026-10-26'];
  assert.equal(saved.biology30,'');assert.equal(saved.chemistry20,'');assert.equal(saved.biology20,'');
});

test('legacy saved days receive Science 10 without replacing saved fields; old clients preserve it', async()=>{
 const storage=new Store();
 await storage.put('calendar:2026-11-03',{biology30:'Teacher plan',chemistry20:'Saved chemistry',biology20:'Saved biology',note:'Saved note',revision:4});
 let state=await calendarState(storage,false);
 assert.equal(state.days['2026-11-03'].science10,'Mitosis and telomeres');
 assert.equal(state.days['2026-11-03'].biology30,'Teacher plan');
 assert.equal(state.days['2026-11-03'].revision,4);
 assert.equal((await updateCalendar(storage,day('2026-11-03',4))).status,200);
 state=await calendarState(storage,false);
 assert.equal(state.days['2026-11-03'].science10,'Mitosis and telomeres');
 assert.equal((await updateCalendar(storage,{...day('2026-11-03',5),science10:''})).status,200);
 assert.equal((await calendarState(storage,false)).days['2026-11-03'].science10,'');
 assert.equal((await updateCalendar(storage,{...day(),science10:null})).status,400);
 assert.equal((await updateCalendar(storage,{...day(),science10:'x'.repeat(1501)})).status,400);
});
