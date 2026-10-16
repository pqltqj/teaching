import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

test('old website links and www forward to the primary .ca address',async()=>{
 for(const host of ['josey.fun','www.josey.fun','www.ejosey.ca']){
  const r=await worker.fetch(new Request('https://'+host+'/resources/reproductive-technology/?lesson=1'),{});
  assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://ejosey.ca/resources/reproductive-technology/?lesson=1');
 }
});
test('primary domain serves assets directly with existing security headers',async()=>{
 let requested;
 const env={ASSETS:{fetch:async request=>{requested=request.url;return new Response('Case study')}}};
 const r=await worker.fetch(new Request('https://ejosey.ca/resources/reproductive-technology/'),env);
 assert.equal(r.status,200);assert.equal(await r.text(),'Case study');assert.equal(requested,'https://ejosey.ca/resources/reproductive-technology/');assert.match(r.headers.get('Content-Security-Policy'),/connect-src 'self'/);
});
test('primary domain uses the existing review bank and shared recovery namespace',async()=>{
 const names=[];const env={REVIEW:{idFromName:name=>{names.push(name);return name},get:()=>({fetch:async()=>Response.json({ok:true})})}};
 assert.equal((await worker.fetch(new Request('https://ejosey.ca/api/bank'),env)).status,200);assert.equal(names[0],'bank');
 const body={code:'A'.repeat(24)};
 const r=await worker.fetch(new Request('https://ejosey.ca/api/drafts/load',{method:'POST',headers:{Origin:'https://ejosey.ca','Content-Type':'application/json'},body:JSON.stringify(body)}),env);
 assert.equal(r.status,200);assert.match(names[1],/^student-draft:/);
});

test('primary domain upgrades plain HTTP to HTTPS',async()=>{
 const r=await worker.fetch(new Request('http://ejosey.ca/resources/?course=biology30'),{});
 assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://ejosey.ca/resources/?course=biology30');
});
