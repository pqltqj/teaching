import {readJson} from './api.js';

const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
export const normalizeCode=value=>typeof value==='string'?value.toUpperCase().replace(/[\s-]/g,''):'';
export function validDraft(d){
  return d && d.activity==='bio30-unitb-human-reproductive-technology' && d.version===1 &&
    typeof d.name==='string' && d.name.length<=120 && typeof d.className==='string' && d.className.length<=80 &&
    Array.isArray(d.answers) && d.answers.length===6 && d.answers.every(a=>typeof a==='string'&&a.length<=20000) &&
    Array.isArray(d.read) && d.read.length<=7 && d.read.every(id=>typeof id==='string'&&id.length<=80) &&
    d.extensionVersion===2 && (d.updated===undefined||(typeof d.updated==='string'&&d.updated.length<=40)) && (d.previousExtension===null || (typeof d.previousExtension?.question==='string'&&d.previousExtension.question.length<=1000&&typeof d.previousExtension.answer==='string'&&d.previousExtension.answer.length<=20000));
}

// Public requests are routed to a separate object for each unguessable code.
// Drafts never share the object that stores teacher sessions and review answers.
export async function routeDraft(request,env){
  const url=new URL(request.url);
  if(request.method!=='POST')return reply({error:'Use a recovery code to open a draft.'},405);
  if(request.headers.get('Origin')!==url.origin)return reply({error:'Invalid request origin.'},403);
  if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return reply({error:'JSON required.'},415);
  if(!['/api/drafts/load','/api/drafts/save'].includes(url.pathname))return reply({error:'Not found.'},404);
  const body=await readJson(request,1000000),code=normalizeCode(body?.code);
  if(!/^[A-F0-9]{24}$/.test(code))return reply({error:'Enter the complete recovery code.'},400);
  if(url.pathname.endsWith('/save')&&(!validDraft(body.draft)||!Number.isSafeInteger(body.revision)||body.revision<0||!/^[a-f0-9-]{36}$/.test(body.mutation||'')))return reply({error:'This draft could not be saved. Download a draft backup and try again.'},400);
  if(url.pathname.endsWith('/save')&&body.revision===0&&request.headers.has('CF-Connecting-IP')){
    const ip=request.headers.get('CF-Connecting-IP');
    const limit=await env.REVIEW.get(env.REVIEW.idFromName('draft-creation-rate:'+ip)).fetch(new Request(url.origin+'/internal/draft-rate',{method:'POST'}));
    if(limit.status===429)return reply({error:'Too many new drafts. Keep working in this browser and try the backup again later.'},429);
  }
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code))),b=>b.toString(16).padStart(2,'0')).join('');
  return env.REVIEW.get(env.REVIEW.idFromName('student-draft:'+hash)).fetch(new Request(request.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,code:undefined})}));
}

export async function handleDraft(request,storage){
  const body=await readJson(request,1000000),load=new URL(request.url).pathname.endsWith('/load');
  if(load){const record=await storage.get('draft');return record?reply({draft:record.draft,revision:record.revision,savedAt:record.savedAt}):reply({error:'No saved draft was found. Check the code and try again.'},404)}
  if(!validDraft(body?.draft)||!Number.isSafeInteger(body.revision)||body.revision<0||!/^[a-f0-9-]{36}$/.test(body.mutation||''))return reply({error:'Invalid draft.'},400);
  const result=await storage.transaction(async tx=>{
    const old=await tx.get('draft');
    // A lost response can be retried without duplicating or losing an update.
    if(old?.mutation===body.mutation)return {revision:old.revision,savedAt:old.savedAt};
    if((old?.revision||0)!==body.revision)return {conflict:true};
    const draft=Object.fromEntries(['activity','version','name','className','answers','read','extensionVersion','previousExtension','updated'].filter(k=>body.draft[k]!==undefined).map(k=>[k,body.draft[k]]));
    const record={draft,revision:body.revision+1,mutation:body.mutation,savedAt:new Date().toISOString()};
    await tx.put('draft',record);return {revision:record.revision,savedAt:record.savedAt};
  });
  return result.conflict?reply({error:'This draft has newer work saved from another tab or device. Your local work has been kept.'},409):reply(result);
}

export async function draftRate(storage){
  // High enough for a school sharing an IP; only initial saves count.
  const allowed=await storage.transaction(async tx=>{const now=Date.now(),old=await tx.get('rate'),rate=old&&old.until>now?old:{count:0,until:now+3600000};if(rate.count>=1000)return false;rate.count++;await tx.put('rate',rate);return true});
  return reply({ok:allowed},allowed?200:429);
}
