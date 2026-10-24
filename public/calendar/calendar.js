const $ = selector => document.querySelector(selector);
const courses = [{id:'biology30',name:'Biology 30'},{id:'chemistry20',name:'Chemistry 20'},{id:'biology20',name:'Biology 20'}];
const fields = [...courses.map(c => c.id), 'note'];
let state = null, month = 9, editing = null, signature = '', loading = false;
const dateText = (date, options) => new Intl.DateTimeFormat('en-CA', {...options,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
function el(tag, cls, text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
async function api(path,body){const response=await fetch(path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const result=await response.json();if(!response.ok){const error=new Error(result.error||'Unable to save. Please try again.');error.status=response.status;throw error}return result}
function message(text){$('#message').textContent=text}
function emptyDay(){return {biology30:'',chemistry20:'',biology20:'',note:'',revision:0}}
function render(){
  const title=dateText(`2026-${String(month+1).padStart(2,'0')}-01`,{month:'long',year:'numeric'});
  $('#month').textContent=title;document.title=title+' · Class calendar';$('#previous').disabled=month===9;$('#next').disabled=month===11;
  const calendar=$('#calendar');calendar.replaceChildren();
  for(const day of ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'])calendar.append(el('div','weekday',day));
  $('#teacher').textContent=state?.teacher?'Sign out':'Teacher sign in';
  $('#access').textContent=state?.teacher?'Teacher signed in. Choose Edit on any day to change its plans.':'View only. Sign in as a teacher to edit plans.';
  if(!state){calendar.setAttribute('aria-busy','true');return}
  calendar.setAttribute('aria-busy','false');
  const start=new Date(Date.UTC(2026,month,1)).getUTCDay(),count=new Date(Date.UTC(2026,month+1,0)).getUTCDate();
  const cells=Math.ceil((start+count)/7)*7;
  for(let i=0;i<cells;i++){
    const number=i-start+1;const day=el('article','day');
    if(number<1||number>count){day.classList.add('outside');day.setAttribute('aria-hidden','true');calendar.append(day);continue}
    const date=`2026-${String(month+1).padStart(2,'0')}-${String(number).padStart(2,'0')}`;day.dataset.date=date;
    day.setAttribute('aria-label',dateText(date,{weekday:'long',month:'long',day:'numeric',year:'numeric'}));
    if(i%7===0||i%7===6)day.classList.add('weekend');
    const top=el('div','day-top'),time=el('time','day-number',String(number));time.dateTime=date;top.append(time);day.append(top);
    if(date<'2026-10-26'){day.classList.add('before-start');calendar.append(day);continue}
    if(state.teacher){const button=el('button','edit-day','Edit');button.setAttribute('aria-label','Edit '+dateText(date,{month:'long',day:'numeric'}));button.onclick=()=>openDay(date);top.append(button)}
    const entry=state.days[date]||emptyDay();
    // Preserve the three class blocks in their actual timetable order.
    for(const c of courses)if(entry[c.id]){const item=el('div','day-entry '+c.id);item.append(el('strong','',c.name),el('p','',entry[c.id]));day.append(item)}
    if(entry.note)day.append(el('div','day-note',entry.note));
    calendar.append(day);
  }
}
async function refresh(){if(loading)return;loading=true;try{const next=await api('/api/calendar');const nextSignature=JSON.stringify(next);state=next;if(signature!==nextSignature){signature=nextSignature;render()}$('#retry').hidden=true;message('')}catch(error){message('Calendar unavailable. '+error.message);$('#retry').hidden=false;if(!state)$('#access').textContent='Unable to load calendar.'}finally{loading=false}}
$('#previous').onclick=()=>{if(month>9){month--;render()}};$('#next').onclick=()=>{if(month<11){month++;render()}};$('#retry').onclick=refresh;
$('#teacher').onclick=async()=>{if(state?.teacher){try{await api('/api/logout',{});await refresh()}catch(error){message(error.message)}return}$('#login-error').textContent='';$('#login').showModal();$('#password').focus()};
$('#login-cancel').onclick=()=>$('#login').close();$('#login').addEventListener('close',()=>{$('#password').value='';$('#login-error').textContent=''});
$('#login-form').onsubmit=async event=>{event.preventDefault();$('#login-submit').disabled=true;try{await api('/api/login',{password:$('#password').value});$('#login').close();await refresh()}catch(error){$('#login-error').textContent=error.message}finally{$('#login-submit').disabled=false}};
function openDay(date){if(!state?.teacher)return;const day=state.days[date]||emptyDay();editing={date,revision:day.revision};$('#edit-title').textContent=dateText(date,{weekday:'long',month:'long',day:'numeric',year:'numeric'});for(const field of fields)$('#edit-'+field).value=day[field];$('#edit-error').textContent='';$('#editor').showModal();$('#edit-biology30').focus()}
function dirty(){if(!editing)return false;const day=state.days[editing.date]||emptyDay();return fields.some(field=>$('#edit-'+field).value!==day[field])}
function closeEditor(){if(dirty()&&!confirm('Discard your unsaved calendar changes?'))return;$('#editor').close()}
$('#edit-cancel').onclick=closeEditor;$('#editor').addEventListener('cancel',event=>{event.preventDefault();closeEditor()});$('#editor').addEventListener('close',()=>{editing=null;refresh()});
$('#edit-form').onsubmit=async event=>{event.preventDefault();if(!editing)return;$('#save').disabled=true;$('#edit-cancel').disabled=true;try{const body={...editing,...Object.fromEntries(fields.map(field=>[field,$('#edit-'+field).value]))};const saved=await api('/api/calendar',body);state.days[saved.date]=saved.day;signature=JSON.stringify(state);$('#editor').close();render();message('Changes saved.')}catch(error){$('#edit-error').textContent=error.status===401?'Your teacher session has ended. Copy your edits before closing, then sign in again.':error.message}finally{$('#save').disabled=false;$('#edit-cancel').disabled=false}};
window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue=''}});
window.addEventListener('focus',()=>{if(!$('#editor').open&&!$('#login').open)refresh()});
setInterval(()=>{if(!document.hidden&&!$('#editor').open&&!$('#login').open)refresh()},30000);
function showTheme(){const dark=document.documentElement.dataset.theme==='dark';$('#theme').textContent=dark?'☀️':'🌙';$('#theme').setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode')}
$('#theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('review-theme',document.documentElement.dataset.theme)}catch{}showTheme()};
render();showTheme();refresh();
