'use strict';
// One controller owns a serial save queue. Revision checks protect a draft that
// has also been opened elsewhere; retries reuse the same mutation identifier.
window.createRecovery=({getDraft,applyDraft})=>{
  const key='bio30-reproductive-recovery-v1',q=s=>document.querySelector(s);
  let meta=null,timer,busy=false,paused=false,ready=false,epoch=0,notice='';
  try{const m=JSON.parse(localStorage.getItem(key));if(m&&/^[A-F0-9]{24}$/.test(m.code)&&Number.isSafeInteger(m.revision))meta=m}catch{}
  const snapshot=()=>JSON.stringify(getDraft());
  const format=code=>code.match(/.{1,4}/g).join('-');
  function persist(){try{if(meta)localStorage.setItem(key,JSON.stringify(meta));else localStorage.removeItem(key)}catch{}}
  function paint(message=notice){
    notice=message;q('#recoveryCode').textContent=meta?format(meta.code):'Your code appears when you start working.';
    q('#copyRecovery').hidden=!meta;q('#saveOnline').hidden=!meta;q('#newRecovery').hidden=!paused;
    q('#cloudStatus').textContent=message||(meta?'Ready to back up.':'Answers also save on this browser.');
  }
  async function request(action,body){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try{const r=await fetch('/api/drafts/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:controller.signal});const data=await r.json();if(!r.ok){const e=Error(data.error||'Online backup unavailable.');e.status=r.status;throw e}return data}finally{clearTimeout(timeout)}
  }
  function newCode(){meta={code:Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase(),revision:0,confirmedSnapshot:'',savedAt:null,pending:null};persist();paint('Preparing online backup…')}
  function conflict(){paused=true;paint('Newer work exists on another tab or device. Recover that saved work, or keep this version with a new code.');}
  function schedule(delay=900){clearTimeout(timer);timer=setTimeout(sync,delay)}
  function savedMessage(){return 'Saved online · '+new Date(meta.savedAt).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
  async function sync(){
    clearTimeout(timer);if(!ready||busy||paused||!meta)return;
    if(!navigator.onLine){paint('Offline · online backup will resume when connected.');schedule(15000);return}
    busy=true;const started=epoch;
    try{
      while(meta&&!paused&&started===epoch){
        if(!meta.pending){const value=snapshot();if(value===meta.confirmedSnapshot){paint(savedMessage());break}meta.pending={code:meta.code,revision:meta.revision,mutation:crypto.randomUUID(),draft:JSON.parse(value)};persist()}
        const pending=meta.pending;paint('Saving online…');const result=await request('save',pending);
        if(started!==epoch)break;
        meta.revision=result.revision;meta.savedAt=result.savedAt;meta.confirmedSnapshot=JSON.stringify(pending.draft);meta.pending=null;persist();
      }
    }catch(error){if(started===epoch){if(error.status===409)conflict();else{paint('Online backup pending · your work is still on this browser. Retrying…');schedule(15000)}}}
    finally{busy=false;if(started!==epoch&&meta&&!paused)schedule(0)}
  }
  async function init(){
    if(!meta){const d=getDraft();if(d.name||d.answers.some(a=>a.trim())||d.read.length)newCode()}paint(meta?'Checking saved work…':'');const started=epoch;
    try{
      if(meta&&!meta.pending){const remote=await request('load',{code:meta.code});if(started!==epoch)return;
        if(remote.revision!==meta.revision){if(snapshot()!==meta.confirmedSnapshot){conflict();return}applyDraft(remote.draft);meta.revision=remote.revision;meta.savedAt=remote.savedAt;meta.confirmedSnapshot=snapshot();persist()}
      }
    }catch(error){if(error.status===404&&meta?.revision>0){paused=true;paint('Saved draft unavailable. Keep this code and download a draft backup.')}else if(meta)paint('Online backup pending · checking again when connected.')}
    finally{ready=true;if(meta&&!paused)schedule(0)}
  }
  function changed(){if(!meta)newCode();if(!paused){paint(navigator.onLine?'Changes waiting to back up…':'Offline · online backup will resume when connected.');schedule()}}
  function forget(){epoch++;clearTimeout(timer);meta=null;paused=false;persist();paint('Answers also save on this browser.')}
  q('#copyRecovery').onclick=async()=>{try{await navigator.clipboard.writeText(format(meta.code));paint('Recovery code copied. Keep it somewhere you can find it.')}catch{paint('Select and copy the recovery code above.')}};
  q('#saveOnline').onclick=()=>{if(!meta)newCode();sync()};
  q('#newRecovery').onclick=()=>{if(!confirm('Save the work currently on this browser under a new code? The earlier code will still open the earlier saved draft.'))return;epoch++;paused=false;newCode();schedule(0)};
  q('#openRecovery').onclick=()=>{q('#recoverError').textContent='';q('#recoverDialog').showModal();q('#recoverInput').focus()};
  q('#closeRecovery').onclick=()=>q('#recoverDialog').close();
  q('#recoverForm').onsubmit=async event=>{
    event.preventDefault();const code=q('#recoverInput').value.toUpperCase().replace(/[\s-]/g,'');if(!/^[A-F0-9]{24}$/.test(code)){q('#recoverError').textContent='Enter all six groups of your recovery code.';return}
    const submit=q('#recoverSubmit');submit.disabled=true;q('#recoverError').textContent='Opening saved work…';
    try{const remote=await request('load',{code});const d=getDraft();if((d.name||d.answers.some(a=>a.trim())||d.read.length)&&!confirm('Replace the draft on this browser with the saved work for this code? Download a draft backup first if you want to keep both.')){q('#recoverError').textContent='Your current draft has been kept.';return}
      epoch++;clearTimeout(timer);applyDraft(remote.draft);meta={code,revision:remote.revision,confirmedSnapshot:snapshot(),savedAt:remote.savedAt,pending:null};paused=false;persist();paint('Draft recovered · '+savedMessage().toLowerCase());q('#recoverDialog').close();q('#recoverInput').value='';
    }catch(error){q('#recoverError').textContent=error.status?error.message:'Could not connect. Your current draft has been kept. Try again when connected.'}finally{submit.disabled=false}
  };
  window.addEventListener('online',()=>schedule(0));window.addEventListener('offline',()=>{if(meta)paint('Offline · online backup will resume when connected.')});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sync()});
  window.addEventListener('beforeunload',event=>{if(meta&&(meta.pending||snapshot()!==meta.confirmedSnapshot)){event.preventDefault();event.returnValue=''}});
  setInterval(()=>{if(meta&&!paused&&!busy&&ready&&navigator.onLine)sync()},15000);
  return {init,changed,forget};
};
