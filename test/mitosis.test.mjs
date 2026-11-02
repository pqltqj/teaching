import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ensureMitosisReview,mitosisReview} from '../src/mitosis-review.js';
class Store {data=new Map();queue=Promise.resolve();async get(k){return structuredClone(this.data.get(k))}async put(k,v){this.data.set(k,structuredClone(v))}transaction(fn){const p=this.queue.then(()=>fn(this));this.queue=p.catch(()=>{});return p}}
test('mitosis addition preserves existing courses, questions and locks and runs once',async()=>{
 const s=new Store();const old={courses:[{id:'biology30',sets:[{date:'2026-10-15',title:'Existing',questions:[]}]},{id:'biology20',sets:[]}]};await s.put('bank',old);await s.put('lock:biology30:2026-10-15',false);
 await Promise.all([ensureMitosisReview(s),ensureMitosisReview(s)]);
 const bank=await s.get('bank');assert.equal(bank.courses[0].sets.length,2);assert.deepEqual(bank.courses[0].sets[0],old.courses[0].sets[0]);assert.deepEqual(bank.courses[1],old.courses[1]);assert.equal(await s.get('lock:biology30:2026-10-15'),false);assert.equal(await s.get('lock:biology30:2026-11-02'),true);
 await s.put('lock:biology30:2026-11-02',false);await ensureMitosisReview(s);assert.equal(await s.get('lock:biology30:2026-11-02'),false);
 assert.equal(mitosisReview.questions.length,6);assert.match(mitosisReview.questions[2].question,/diploid.*n = 3.*metaphase/);assert.match(mitosisReview.questions[2].answer,/6 X-shaped/);for(const q of mitosisReview.questions){assert.ok(q.question.length<90);assert.ok(q.answer.length<160);}assert.doesNotMatch(JSON.stringify(mitosisReview),/interphase|cytokinesis|cancer|S phase|G1|G2/i);
});
test('revising November 2 preserves its lock and leaves absent banks alone',async()=>{
 const s=new Store();await ensureMitosisReview(s);assert.equal(await s.get('bank'),undefined);
 const bank={courses:[{id:'biology30',sets:[{date:'2026-11-02',title:'Existing',questions:[]}]}]};await s.put('bank',bank);await s.put('lock:biology30:2026-11-02',false);await ensureMitosisReview(s);const saved=await s.get('bank');assert.deepEqual(saved.courses[0].sets,[mitosisReview]);assert.equal(await s.get('lock:biology30:2026-11-02'),false);
});
