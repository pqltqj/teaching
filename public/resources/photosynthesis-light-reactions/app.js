'use strict';
const $=s=>document.querySelector(s);
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const levels=['Plant','Leaf','Cell','Chloroplast','Thylakoid'];
const levelStarts=[0,2,4,6,8];
const sections=[['Big picture','old-1'],['Chloroplast','old-7'],['Light & pigments','visible'],['Photosystems','old-13'],['Electron transfer','oil-rig'],['H⁺ and ATP','old-25'],['Connections','old-28']].map(([name,id])=>({name,start:steps.findIndex(s=>s.id===id)}));
let index=0,revealed=false;
const assets={
 plant:{file:'banana.png',size:[1280,960],target:[320,30,365,530],targetName:'Leaf',caption:'Banana · <i>Musa</i> sp.',alt:'Banana plant with broad green leaves'},
 leaf:{file:'leaf-tissue.png',size:[1280,854],target:[440,330,115,205],targetName:'One leaf cell',caption:'A leaf contains layers of cells. The bright outline marks a cell.',alt:'A diagram of leaf tissue showing cells and green chloroplasts'},
 leafmicro:{file:'leaf-micrograph.png',size:[2426,1320],target:[1340,220,130,270],targetName:'Mesophyll cell',caption:'Leaf tissue under a microscope · a representative leaf specimen',alt:'A microscope cross-section through a leaf, with palisade and spongy mesophyll'},
 plantcell:{file:'plant-cell.png',size:[3840,2830],target:[2010,2080,265,410],targetName:'Chloroplast',caption:'One plant cell contains many organelles.',alt:'Plant cell diagram showing chloroplasts, a nucleus, vacuole, cell wall and membrane'},
 cells:{file:'cells-user.png',size:[1200,675],target:[574,77,50,66],targetName:'One chloroplast',caption:'Still photograph · cytoplasmic streaming occurs within each living cell.',alt:'Microscope photograph of plant cells containing many green chloroplasts'},
 chloroplast:{file:'chloroplast-user.png',size:[867,658],target:[205,220,120,152],targetName:'Granum',caption:'A chloroplast contains stacks of thylakoids surrounded by stroma.',alt:'Cutaway chloroplast with thylakoid stacks and a magnified granum'},
 thylakoid:{file:'chloroplast-user.png',size:[867,658],view:[450,395,410,245],target:[493,451,150,16],targetName:'Lumen',caption:'Granum = a stack · thylakoid = one sac · lumen = the space inside',alt:'Magnified cutaway of stacked thylakoid sacs and their internal space'},
 locations:{file:'reaction-overview.png',size:[1508,901],caption:'Light reactions at thylakoids · Calvin cycle in the stroma',alt:'Overview of light reactions and the Calvin cycle inside a chloroplast'},
 membrane:{file:'membrane-blank.png',size:[1855,848],caption:'Build the pathway one answer at a time · red = electrons · blue = H⁺',alt:'Simplified electron transport chain with photosystems II and I, water splitting, NADPH and ATP synthase'},
 summary:{file:'reaction-overview.png',size:[1508,901],caption:'ATP and NADPH connect the light reactions to carbon fixation.',alt:'Light reactions supply ATP and NADPH to the Calvin cycle in the stroma'}
};
Object.assign(assets,{photosystem:{file:'photosystem-blank.png',size:[1630,1125],alt:'Photosystem in a thylakoid membrane'},excitation:{file:'excitation-blank.png',size:[622,580],alt:'Chlorophyll excitation and relaxation'},orbit:{file:'excitation-blank.png',size:[622,580],alt:'Simplified model of an electron moving between energy levels'}});
const phaseTargets={0:[175,190,210,515],1:[175,190,210,515],2:[128,683,365,130],3:[376,391,600,367],4:[573,294,93,501],5:[848,187,313,520],6:[1080,215,452,245],7:[70,721,1690,110],8:[1514,20,285,787],9:[1512,79,315,203],10:[1514,20,285,787]};
function assetFor(step){
 if(step.scene==='foundation')return foundationAsset(step);
 let a=assets[step.scene];if(!a)return null;a={...a}; if(step.scene==='chloroplast')return {...a,file:step.focus==='stack'?'granum-blank.png':'chloroplast-blank.png',size:step.focus==='stack'?[851,850]:[600,400],target:null}; if(step.scene==='thylakoid')return {...a,file:step.focus==='membrane'?'overview-blank.png':'chloroplast-blank.png',size:step.focus==='membrane'?[1508,901]:[600,400],view:null,target:null};
 if(step.scene==='chloroplast'&&step.focus==='stack'){a.view=[450,395,410,245];a.target=[490,433,160,24];a.targetName='One thylakoid';a.caption='One granum is a stack of thylakoid sacs.';}
 if(step.scene==='thylakoid'&&step.focus==='membrane'){a.target=[488,429,167,12];a.targetName='Thylakoid membrane';}
 if(step.scene==='locations')return {...a,file:!step.focus?(revealed?'overview-cycle.png':'overview-blank.png'):step.focus==='products'?(revealed?'overview-no-sugars.png':'overview-no-energy-or-sugars.png'):revealed?'reaction-overview.png':'overview-no-sugars.png',target:null};
 if(step.scene==='locations'){
   if(step.focus==='products'){a.target=[635,442,230,214];a.targetName='ATP + NADPH';}
   else if(step.focus==='sugar'){a.target=[917,578,325,221];a.targetName='Sugars';}
   else{a.target=[920,329,200,255];a.targetName='Calvin cycle';}
 }
 if(step.scene==='membrane'){a.target=phaseTargets[step.phase];a.targetName='';a.isPathway=true;}
 return a;
}
function svgImage(a,withFocus=true){
 const view=a.view||[0,0,...a.size];
 const cropId='crop-'+a.file.replace(/[^a-z0-9]/gi,'')+'-'+view.join('-');
 let marks='';
 if(withFocus&&revealed&&a.target){
   const [x,y,w,h]=a.target;const isZoom=!a.isPathway;
   const font=Math.max(view[2],view[3])/42;
   marks=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w,h)/12}" class="${isZoom?'zoom-target':'focus-ring'} focus-pulse"/>`;
   // A label is included only where the target has enough surrounding space.
   if(a.targetName&&h>35&&view[2]>500){const ty=y>font*2?y-font*.6:y+h+font*1.5;marks+=`<text x="${x+w/2}" y="${ty}" text-anchor="middle" class="zoom-label" style="font-size:${font}px">${escapeText(a.targetName)}</text>`;}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeText(a.alt)}"><defs><clipPath id="${cropId}"><rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}"/></clipPath></defs><g clip-path="url(#${cropId})"><image href="assets/${a.file}" width="${a.size[0]}" height="${a.size[1]}"/>${marks}</g></svg>`;
}
function scene(step){
 const custom=customScene(step,revealed);if(custom)return custom;
 if(step.scene==='organisms'&&!revealed)return svgImage(assets.plant,false);
 if(step.scene==='organisms')return `<div class="organisms"><figure><img src="assets/banana.png" alt="Banana plant"><figcaption>Banana · <i>Musa</i> sp.</figcaption></figure><figure><img src="assets/euglena.png" alt="Euglena, a single-celled photosynthetic protist"><figcaption><i>Euglena</i> · single-celled protist</figcaption></figure></div>`;
 if(step.scene==='particles')return `<div class="particle-board"><div class="particle"><span class="particle-icon e">e⁻</span><h2>Electron</h2><p>${revealed?'Negative charge':'?'}</p></div><div class="particle"><span class="particle-icon h">H⁺</span><h2>Hydrogen ion</h2><p>${revealed?'Positive charge':'?'}</p></div></div>`;
 return svgImage(assetFor(step));
}
function sectionIndex(){let n=0;sections.forEach((s,i)=>{if(index>=s.start)n=i;});return n;}
function render(){
 const step=steps[index];const a=assetFor(step);const sec=sectionIndex();
 $('#counter').textContent=`${index+1} / ${steps.length}`;$('#question').textContent=step.title;
 $('#answer').innerHTML=step.answer;$('#answer').classList.toggle('shown',revealed);$('#answer').setAttribute('aria-hidden',String(!revealed));$('#answer-prompt').hidden=revealed;
 $('#scene').innerHTML=scene(step);
 $('#figure-caption').innerHTML=step.scene==='plant'||step.scene==='organisms'&&!revealed?assets.plant.caption:'';
 $('#reveal').textContent=revealed?'Hide answer':'Reveal answer';$('#reveal').setAttribute('aria-expanded',String(revealed));$('#reveal').setAttribute('aria-controls','answer');
 $('#back').disabled=index===0;$('#next').textContent=index===steps.length-1?'Restart ↺':'Next →';$('#jump').value=String(index);
 $('#trail').innerHTML=levels.map((l,i)=>`${i?'<span class="chevron" aria-hidden="true">›</span>':''}<button data-level="${i}" class="${i===step.level?'current':i>step.level?'future':''}" ${i===step.level?'aria-current="location"':''}>${l}</button>`).join('');
 $('#sections').innerHTML=sections.map((s,i)=>`<button data-section="${i}" class="${i===sec?'current':i<sec?'complete':''}" aria-label="Section ${i+1}: ${escapeText(s.name)}" ${i===sec?'aria-current="step"':''}><span class="square" aria-hidden="true"></span><span class="section-title">${escapeText(s.name)}</span></button>`).join('');
 $('#enlarge').hidden=!a;
}
function go(n,animate=true){
 const previous=steps[index];const previousAsset=previous.scene==='organisms'?assets.plant:assetFor(previous);const oldMarkup=previous.scene==='organisms'?svgImage(assets.plant,false):$('#scene').innerHTML;const prevIndex=index;
 index=Math.max(0,Math.min(steps.length-1,n));revealed=false;history.replaceState(null,'',`#${index+1}`);render();
 $('#scene').classList.remove('enter');$('#bridge').classList.remove('travel');
 if(animate&&index!==prevIndex){void $('#scene').offsetWidth;$('#scene').classList.add('enter');
   const next=steps[index];const zoomForward=index===prevIndex+1&&previousAsset?.target&&(next.level>previous.level||previous.scene==='chloroplast'&&next.focus==='stack');
   if(zoomForward){const v=previousAsset.view||[0,0,...previousAsset.size],t=previousAsset.target,r=$('#scene').getBoundingClientRect(),scale=Math.min(r.width/v[2],r.height/v[3]);const ox=(r.width-v[2]*scale)/2,oy=(r.height-v[3]*scale)/2;$('#bridge').innerHTML=`<div>${oldMarkup}</div>`;$('#bridge').style.setProperty('--zoom-x',`${(ox+(t[0]+t[2]/2-v[0])*scale)/r.width*100}%`);$('#bridge').style.setProperty('--zoom-y',`${(oy+(t[1]+t[3]/2-v[1])*scale)/r.height*100}%`);void $('#bridge').offsetWidth;$('#bridge').classList.add('travel');}
 }
}
function toggle(){revealed=!revealed;render();}
$('#jump').innerHTML=steps.map((s,i)=>`<option value="${i}">${i+1}</option>`).join('');
$('#reveal').addEventListener('click',toggle);$('#back').addEventListener('click',()=>go(index-1));$('#next').addEventListener('click',()=>go(index===steps.length-1?0:index+1));$('#jump').addEventListener('change',e=>go(Number(e.target.value)));
$('#trail').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(b)go(levelStarts[Number(b.dataset.level)]);});
$('#sections').addEventListener('click',e=>{const b=e.target.closest('[data-section]');if(b)go(sections[Number(b.dataset.section)].start);});

$('#enlarge').addEventListener('click',()=>{const a=assetFor(steps[index]);if(!a)return;$('#picture').innerHTML=scene(steps[index]);$('#picture-title').textContent=steps[index].scene==='membrane'?'The light reactions':'Structure view';$('#picture-dialog p').textContent='Click × or press Escape to return.';$('#picture-dialog').showModal();});
async function full(){try{if(document.fullscreenElement)await document.exitFullscreen();else{await document.documentElement.requestFullscreen();if(!document.fullscreenElement)$('#status').textContent='Use your browser’s full-screen control (often F11).';}}catch{$('#status').textContent='Use your browser’s full-screen control (often F11).';}}
$('#fullscreen').addEventListener('click',full);document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'Exit full screen ⛶':'Full screen ⛶';});
document.querySelectorAll('dialog .close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowRight'){e.preventDefault();go(Math.min(index+1,steps.length-1));}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}else if(e.key===' '||e.key==='Enter'){if(/BUTTON|A/.test(document.activeElement.tagName))return;e.preventDefault();toggle();}else if(e.key.toLowerCase()==='f')full();});
window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1),10)-1;if(Number.isInteger(n)&&n>=0&&n<steps.length)go(n);});
const initial=parseInt(location.hash.slice(1),10)-1;go(Number.isInteger(initial)&&initial>=0&&initial<steps.length?initial:0,false);
