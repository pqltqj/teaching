import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleApi} from '../src/api.js';
import {allClues,jeopardyCategories,finalChallenge} from '../src/jeopardy-bank.js';
class Store{
 data=new Map();queue=Promise.resolve();
 async get(k){return structuredClone(this.data.get(k))}
 async put(k,v){this.data.set(k,structuredClone(v))}
 async delete(k){this.data.delete(k)}
 async list({prefix}){return new Map([...this.data].filter(([k])=>k.startsWith(prefix)))}
 transaction(fn){const task=this.queue.then(()=>fn(this));this.queue=task.catch(()=>{});return task}
}
const env={TEACHER_PASSWORD:'test teacher passphrase only'};
async function harness(){
 const store=new Store();
 const call=async(path,body,cookie='',origin='https://game.test')=>handleApi(new Request('https://game.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)}),env,store);
 const login=await call('/api/login',{password:env.TEACHER_PASSWORD});const cookie=login.headers.get('Set-Cookie').split(';')[0];
 let state=await(await call('/api/jeopardy',{},cookie)).json();const path='/api/jeopardy/'+state.code;
 const host=async(action,extra={})=>{state=await(await call(path+'?host=1',undefined,cookie)).json();const r=await call(path,{action,op:crypto.randomUUID(),revision:state.revision,...extra},cookie);const data=await r.json();if(r.ok)state=data;return{r,data}};
 const join=async(team=0,token=(team+1).toString().repeat(48))=>{const r=await call(path,{action:'join',token,name:'Student '+team,team});return{token,r,data:await r.json()}};
 return{store,call,cookie,path,host,join,get state(){return state}};
}
test('six categories contain thirty progressive clues, distinct prompts and a final case',()=>{
 assert.equal(jeopardyCategories.length,6);assert.equal(allClues.length,30);assert.equal(new Set(allClues.map(q=>q.id)).size,30);assert.equal(new Set(allClues.map(q=>q.prompt)).size,30);
 for(const c of jeopardyCategories)assert.deepEqual(c.clues.map(q=>q.value),[100,200,300,400,500]);
 for(const q of [...allClues,finalChallenge])for(const key of ['prompt','answer','note'])assert.ok(q[key]);
 assert.equal(jeopardyCategories[0].name,'Reproductive Anatomy');
 assert.equal(allClues[0].id,'structure-detectives-0','renaming a category must not break active games');
});
test('only actual teachers can host, control or read private answers; public views stay redacted',async()=>{
 const h=await harness();assert.equal((await h.call('/api/jeopardy',{})).status,401);
 const preview=await h.call('/api/preview/login',{password:env.TEACHER_PASSWORD});const pc=preview.headers.get('Set-Cookie').split(';')[0];assert.equal((await h.call('/api/jeopardy',{},pc)).status,401);
 await h.host('start');await h.host('pick',{id:allClues[0].id});
 const publicState=await(await h.call(h.path,undefined,h.cookie)).json();assert.equal(publicState.host,undefined);assert.equal(publicState.clue.answer,undefined);assert.equal(publicState.clue.note,undefined);
 assert.equal((await h.call(h.path+'?host=1')).status,401);
 assert.equal((await h.call(h.path,{action:'reveal',op:'bad',revision:0})).status,401);
 assert.equal((await h.call(h.path,{action:'open'},h.cookie,'https://evil.test')).status,403);
});
test('joining is idempotent and confined to the lobby; tokens never enter public or host responses',async()=>{
 const h=await harness(),p=await h.join();assert.equal(p.r.status,200);assert.equal(p.data.players.length,1);
 const again=await h.join();assert.equal(again.data.players.length,1);assert.equal(again.data.me,p.data.me);
 assert.ok(!JSON.stringify(again.data).includes(p.token));assert.ok(!JSON.stringify(h.state).includes(p.token));
 await h.host('start');assert.equal((await h.join(1)).r.status,409);await h.host('lobby');assert.equal((await h.join(1)).r.status,200);
});
test('simultaneous buzzes yield exactly one winner; repeat and expired buzzes are rejected',async()=>{
 const h=await harness(),a=await h.join(0),b=await h.join(1);
 await h.host('start');await h.host('pick',{id:allClues[0].id});assert.equal((await h.call(h.path,{action:'buzz',token:a.token})).status,409);
 await h.host('open');const results=await Promise.all([a,b].map(p=>h.call(h.path,{action:'buzz',token:p.token})));assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 assert.equal((await h.call(h.path,{action:'buzz',token:a.token})).status,409);
 await h.host('judge',{correct:false});await h.host('open');const room=await h.store.get('jeopardy:'+h.state.code);room.deadline=Date.now()-1;await h.store.put('jeopardy:'+room.code,room);
 assert.equal((await h.call(h.path,{action:'buzz',token:b.token})).status,409);
});
test('incorrect teams cannot steal again; correct scoring and retries are atomic; undo restores board',async()=>{
 const h=await harness(),a=await h.join(0),b=await h.join(1);await h.host('start');await h.host('pick',{id:allClues[0].id});await h.host('open');
 await h.call(h.path,{action:'buzz',token:a.token});await h.host('judge',{correct:false});assert.equal(h.state.teams[0].score,0);
 assert.deepEqual({correct:h.state.feedback.correct,team:h.state.feedback.team,delta:h.state.feedback.delta},{correct:false,team:0,delta:0});
 const incorrectPublic=await(await h.call(h.path)).json();assert.equal(incorrectPublic.feedback.id,h.state.feedback.id);assert.equal(incorrectPublic.clue.answer,undefined);
 await h.host('open');assert.equal((await h.call(h.path,{action:'buzz',token:a.token})).status,409);await h.call(h.path,{action:'buzz',token:b.token});
 const room=await(await h.call(h.path+'?host=1',undefined,h.cookie)).json();const op={action:'judge',correct:true,op:crypto.randomUUID(),revision:room.revision};
 let r=await h.call(h.path,op,h.cookie);const awarded=await r.json();assert.equal(awarded.teams[1].score,100);assert.equal(awarded.feedback.correct,true);assert.equal(awarded.feedback.delta,100);r=await h.call(h.path,op,h.cookie);const repeated=await r.json();assert.equal(repeated.teams[1].score,100);assert.equal(repeated.feedback.id,awarded.feedback.id,'retries must not trigger another celebration');
 const pub=await(await h.call(h.path)).json();assert.equal(pub.clue.answer,allClues[0].answer);
 await h.host('undo');assert.equal(h.state.teams[1].score,0);assert.equal(h.state.phase,'buzzed');assert.equal(h.state.used.length,0);assert.equal(h.state.feedback,null);
});
test('traditional penalties are optional; stale control actions cannot overwrite a newer game',async()=>{
 const h=await harness(),a=await h.join();let room=await h.store.get('jeopardy:'+h.state.code);room.penalties=true;await h.store.put('jeopardy:'+room.code,room);
 await h.host('start');await h.host('pick',{id:allClues[4].id});await h.host('open');await h.call(h.path,{action:'buzz',token:a.token});await h.host('judge',{correct:false});assert.equal(h.state.teams[0].score,-500);
 assert.equal((await h.call(h.path,{action:'adjust',team:0,amount:500,revision:0,op:crypto.randomUUID()},h.cookie)).status,409);
});
test('final wagering hides the clue and other responses; wagers, answer locks and scoring are bounded',async()=>{
 const h=await harness(),a=await h.join(0),b=await h.join(1);await h.host('start');await h.host('adjust',{team:0,amount:500});await h.host('final');
 let pub=await(await h.call(h.path)).json();assert.equal(pub.clue.prompt,'');assert.equal(pub.clue.answer,undefined);
 assert.equal((await h.call(h.path,{action:'wager',token:a.token,amount:501})).status,400);
 assert.equal((await h.call(h.path,{action:'wager',token:a.token,amount:400})).status,200);
 assert.equal((await h.call(h.path,{action:'wager',token:a.token,amount:100})).status,409);
 assert.equal((await h.call(h.path,{action:'wager',token:b.token,amount:-1})).status,400);
 await h.host('final-start');assert.equal((await h.call(h.path,{action:'answer',token:a.token,text:'Private response'})).status,200);
 pub=await(await h.call(h.path)).json();assert.equal(pub.final.answers,undefined);assert.equal(pub.final.wagers,undefined);assert.deepEqual(pub.final.submitted,[0]);
 assert.equal((await h.call(h.path,{action:'answer',token:a.token,text:'Replacement'})).status,409);
 await h.host('final-reveal');await h.host('final-judge',{team:0,correct:true});assert.equal(h.state.teams[0].score,900);assert.equal((await h.host('final-judge',{team:0,correct:true})).r.status,400);
});
test('rooms expire without altering bank, calendar or student draft records',async()=>{
 const h=await harness();await h.store.put('bank',{keep:true});await h.store.put('calendar:2026-10-26',{keep:true});await h.store.put('draft:example',{keep:true});
 let room=await h.store.get('jeopardy:'+h.state.code);room.expires=Date.now()-1;await h.store.put('jeopardy:'+room.code,room);assert.equal((await h.call(h.path)).status,404);
 await h.call('/api/jeopardy',{},h.cookie);assert.equal(await h.store.get('jeopardy:'+room.code),undefined);
 for(const key of ['bank','calendar:2026-10-26','draft:example'])assert.deepEqual(await h.store.get(key),{keep:true});
});
