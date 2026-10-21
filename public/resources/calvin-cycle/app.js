'use strict';
const $=s=>document.querySelector(s);
let index=0,revealed=false;
const navigationLabels=['The big picture','Stage 1','Stage 2','Stage 3','Using the sugars'];
function render(){
 const s=steps[index];
 $('#question').textContent=s.q;$('#counter').textContent=`${index+1} / ${steps.length}`;
 $('#stage').textContent=revealed?sections[s.section]:navigationLabels[s.section];
 $('#scene').innerHTML=diagram(s.scene,revealed);
 $('#answer').innerHTML=revealed?s.a:'';$('#answer').classList.toggle('shown',revealed);
 $('#prompt').hidden=revealed;$('#reveal').textContent=revealed?'Hide answer':'Reveal answer';$('#reveal').setAttribute('aria-expanded',String(revealed));
 $('#back').disabled=index===0;$('#next').textContent=index===steps.length-1?'Restart ↺':'Next →';$('#jump').value=String(index);
 $('#sections').innerHTML=navigationLabels.map((name,n)=>`<button data-section="${n}" class="${n===s.section?'current':n<s.section?'complete':''}" ${n===s.section?'aria-current="step"':''}><span class="square" aria-hidden="true"></span><span>${name}</span></button>`).join('');
}
function go(n){index=Math.max(0,Math.min(steps.length-1,n));revealed=false;history.replaceState(null,'',`#${index+1}`);render();}
function toggle(){revealed=!revealed;render();}
$('#jump').innerHTML=steps.map((s,n)=>`<option value="${n}">${n+1}</option>`).join('');
$('#jump').addEventListener('change',e=>go(Number(e.target.value)));
$('#reveal').addEventListener('click',toggle);$('#back').addEventListener('click',()=>go(index-1));$('#next').addEventListener('click',()=>go(index===steps.length-1?0:index+1));
$('#sections').addEventListener('click',e=>{const b=e.target.closest('[data-section]');if(b)go(steps.findIndex(s=>s.section===Number(b.dataset.section)));});
$('#enlarge').addEventListener('click',()=>{$('#picture').innerHTML=diagram(steps[index].scene,revealed);$('#picture-dialog').showModal();});
$('#sources-button').addEventListener('click',()=>$('#sources-dialog').showModal());
document.querySelectorAll('.close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
async function full(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}}
$('#fullscreen').addEventListener('click',full);document.addEventListener('fullscreenchange',()=>$('#fullscreen').textContent=document.fullscreenElement?'Exit full screen ⛶':'Full screen ⛶');
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();go(Math.min(index+1,steps.length-1));}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}else if((e.key===' '||e.key==='Enter')&&!/BUTTON|A/.test(document.activeElement.tagName)){e.preventDefault();toggle();}else if(e.key.toLowerCase()==='f')full();});
window.addEventListener('hashchange',()=>{const n=Number(location.hash.slice(1))-1;if(Number.isInteger(n)&&n>=0&&n<steps.length)go(n);});
const first=Number(location.hash.slice(1))-1;go(Number.isInteger(first)&&first>=0&&first<steps.length?first:0);

