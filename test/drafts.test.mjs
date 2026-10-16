import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeDraft,handleDraft,draftRate} from '../src/drafts.js';
class Store{data=new Map();queue=Promise.resolve();async get(k){return structuredClone(this.data.get(k))}async put(k,v){this.data.set(k,structuredClone(v))}transaction(fn){const run=this.queue.then(()=>fn(this));this.queue=run.catch(()=>{});return run}}
function setup(){const objects=new Map();return {REVIEW:{idFromName:n=>n,get:n=>({fetch:async r=>{if(!objects.has(n))objects.set(n,new Store());return new URL(r.url).pathname==='/internal/draft-rate'?draftRate(objects.get(n)):handleDraft(r,objects.get(n))}})}}}
const sample=()=>({activity:'bio30-unitb-human-reproductive-technology',version:1,name:'Student é',className:'',answers:['First line\nSecond line 🧬','two','three','four','five','optional'],read:['iui','gift'],extensionVersion:2,previousExtension:null,updated:'2026-10-15T20:00:00.000Z'});
const call=(env,action,body,origin='https://review.test')=>routeDraft(new Request('https://review.test/api/drafts/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify(body)}),env);
test('exact recovery, isolation, idempotent retry and stale-write protection',async()=>{
 const env=setup(),code='A'.repeat(24),draft=sample(),mutation=crypto.randomUUID();
 assert.equal((await call(env,'load',{code})).status,404);
 const first=await call(env,'save',{code,draft,revision:0,mutation});assert.equal(first.status,200);assert.equal((await first.json()).revision,1);
 assert.equal((await (await call(env,'save',{code,draft,revision:0,mutation})).json()).revision,1);
 assert.deepEqual((await (await call(env,'load',{code:code.toLowerCase().match(/.{4}/g).join('-')})).json()).draft,draft);
 assert.equal((await call(env,'load',{code:'B'.repeat(24)})).status,404);
 const changed={...draft,answers:draft.answers.map(a=>a+' updated')};
 const results=await Promise.all([call(env,'save',{code,draft:changed,revision:1,mutation:crypto.randomUUID()}),call(env,'save',{code,draft,revision:1,mutation:crypto.randomUUID()})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 assert.equal((await (await call(env,'load',{code})).json()).revision,2);
});
test('40 students save and recover independently on a shared school IP',async()=>{
 const env=setup();await Promise.all(Array.from({length:40},async(_,i)=>{const code=i.toString(16).padStart(24,'0'),draft={...sample(),name:'Student '+i,answers:Array(6).fill('Answer from '+i)};assert.equal((await call(env,'save',{code,draft,revision:0,mutation:crypto.randomUUID()})).status,200);assert.deepEqual((await (await call(env,'load',{code})).json()).draft,draft)}));
});
test('rejects cross-site requests, malformed codes, oversized drafts and invalid versions',async()=>{
 const env=setup(),code='C'.repeat(24),body={code,draft:sample(),revision:0,mutation:crypto.randomUUID()};
 assert.equal((await call(env,'save',body,'https://evil.test')).status,403);assert.equal((await call(env,'load',{code:'1234'})).status,400);
 for(const draft of [{...sample(),answers:['lost']},{...sample(),version:8},{...sample(),answers:Array(6).fill('x'.repeat(20001))}])assert.equal((await call(env,'save',{...body,draft})).status,400);
 assert.equal((await call(env,'save',{...body,revision:-1})).status,400);
 const unicode={...sample(),answers:Array(6).fill('🧬'.repeat(9999))};assert.equal((await call(env,'save',{...body,draft:unicode})).status,200);assert.deepEqual((await (await call(env,'load',{code})).json()).draft,unicode);
});
