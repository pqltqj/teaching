'use strict';
const foundationFiles={visible:['light-spectrum.png',867,610],'photon-energy':['light-spectrum.png',867,610],pigment:['cells-user.png',1200,675],'chlorophyll-types':['pigment-spectra.png',709,742],absorption:['pigment-spectra.png',709,742],green:['banana.png',1280,960],action:['pigment-spectra.png',709,742],carotenoids:['carrots.jpg',3413,2133],photoprotection:['photosystem-blank.png',1630,1125],autumn:['autumn.jpg',4938,3291],'oil-rig':['oil-rig.png',2235,1479],'atp-structure':['atp-molecule-reference.png',777,742],'atp-cycle':['atp-cycle.png',925,216]};
function foundationAsset(step){const [file,w,h]=foundationFiles[step.focus];return {file,size:[w,h],alt:step.title,target:null};}
function fsvg(body,alt){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${alt}"><rect width="1200" height="650" fill="#fbfaf6"/><defs><linearGradient id="visible-band"><stop stop-color="#473b92"/><stop offset=".18" stop-color="#186ac4"/><stop offset=".37" stop-color="#17a877"/><stop offset=".58" stop-color="#eee555"/><stop offset=".77" stop-color="#f09b36"/><stop offset="1" stop-color="#d43242"/></linearGradient><marker id="f-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#435773"/></marker></defs>${body}</svg>`;}
function ft(x,y,text,anchor='middle',extra=''){return captureText(x,y,text,anchor,'foundation-text '+extra);}
function fl(d,extra=''){return `<path d="${d}" class="foundation-line ${extra}"/>`;}
function foundationScene(step,show){
 const f=step.focus,a=foundationAsset(step);
 if(f==='visible'){
  if(show)return diagram(a.file,...a.size,'','Electromagnetic spectrum and visible-light wavelengths');
  return fsvg(`<rect x="150" y="190" width="900" height="180" rx="4" fill="url(#visible-band)"/>${[400,450,500,550,600,650,700,750].map((v,i)=>ft(150+i*900/7,430,String(v))).join('')}${ft(600,520,'Wavelength (nm)')}`,'Light colours and wavelengths');
 }
 if(f==='photon-energy')return waveScene(show);
 if(f==='pigment'||f==='green')return pigmentScene(show,f==='green');
 if(['chlorophyll-types','absorption','action'].includes(f)){
  let mark='';if(show&&f==='absorption')mark='<g class="new-layer"><rect x="114" y="27" width="133" height="607" class="zoom-target"/><rect x="422" y="27" width="96" height="607" class="zoom-target"/></g>';
  return diagram(a.file,...a.size,mark,'Supplied graph of chlorophyll absorption and photosynthesis action spectra');
 }
 if(f==='carotenoids')return foodScene(show);
 if(f==='photoprotection')return protectionScene(show);
 if(f==='autumn')return diagram(a.file,...a.size,'','Green and yellow autumn leaves');
 if(f==='oil-rig'){
  if(!show)return diagram(a.file,...a.size,'','Oil rig photograph as a mnemonic cue');
  return fsvg(`<image href="assets/oil-rig.png" x="25" y="75" width="560" height="460" preserveAspectRatio="xMidYMid meet"/>${ft(900,145,'OIL')}${ft(900,210,'Oxidation Is Loss','middle','f-small')}${ft(900,330,'RIG')}${ft(900,395,'Reduction Is Gain','middle','f-small')}${ft(900,515,'of electrons','middle','f-small')}`,'OIL RIG: oxidation is loss and reduction is gain of electrons');
 }
 if(f==='atp-structure')return atpStructure(show);
 if(f==='atp-cycle')return atpCycle(show);
 return null;
}
function waveScene(show){
 const wave=(y,period,color)=>{let d='';for(let x=150;x<=1040;x+=5)d+=`${x===150?'M':'L'} ${x} ${y+45*Math.sin((x-150)/period*Math.PI*2)} `;return `<path d="${d}" fill="none" stroke="${color}" stroke-width="7"/>`;};
 return fsvg(`${wave(200,120,'#5e4bba')}${wave(420,300,'#d94c4e')}${ft(95,210,'Blue','middle','f-small')}${ft(95,430,'Red','middle','f-small')}${show?`<g class="new-layer">${ft(600,100,'Shorter wavelength → more energy per photon','middle','f-small')}${ft(600,555,'Longer wavelength → less energy per photon','middle','f-small')}</g>`:''}`,'Blue and red light waves with different wavelengths');
}
function pigmentScene(show,green){
 const incoming=['#4f46af','#2185cf','#36a568','#e5bc32','#d7484a'];
 let b=`<ellipse cx="650" cy="330" rx="150" ry="190" fill="#638b59" stroke="#345241" stroke-width="5"/>`;
 if(green)b+=`<path d="M 650 155 V 505 M 650 260 L 565 210 M 650 340 L 735 285 M 650 420 L 565 365" stroke="#cfdfb6" stroke-width="5" fill="none"/>`;
 b+=incoming.map((c,i)=>`<path d="M 80 ${175+i*75} L 470 ${260+i*35}" stroke="${c}" stroke-width="8" fill="none"/>`).join('');
 if(show)b+=`<g class="new-layer"><path d="M 605 280 L 960 150 M 790 370 L 1090 450" stroke="#349054" stroke-width="10" fill="none"/>${ft(1020,110,'Reflected green','middle','f-small')}${ft(980,520,'Transmitted green','middle','f-small')}${ft(650,590,'Blue and red light are absorbed','middle','f-small')}</g>`;
 return fsvg(b,show?'Pigments absorb blue and red light; more green light is reflected or transmitted':'White light contains different wavelengths');
}
function foodScene(show){
 const foods=[['carrots.jpg','Carrot','β-carotene'],['tomatoes-sharp.jpg','Tomato','Lycopene'],['corn.jpg','Yellow corn','Lutein + zeaxanthin']];
 return `<div class="food-gallery">${foods.map(([file,name,pigment])=>`<figure><img src="assets/${file}" alt="${name}"><figcaption>${name}<span class="food-pigment">${show?pigment:'&nbsp;'}</span></figcaption></figure>`).join('')}</div>`;
}
function protectionScene(show){
 const light='<path d="M 160 100 L 200 140 L 180 175 L 245 170 L 230 220 L 330 270 M 330 70 L 355 110 L 340 145 L 405 140 L 390 195 L 450 240" class="protect-light"/>';
 let b=`${light}<circle cx="420" cy="340" r="110" fill="#5f8c67" stroke="#325442" stroke-width="5"/><circle cx="790" cy="340" r="85" fill="#e5a341" stroke="#a36a24" stroke-width="5"/>`;
 if(show)b+=`<g class="new-layer">${ft(420,510,'Photosystem','middle')}${ft(790,510,'Carotenoid','middle')}<path d="M 540 340 L 690 340" class="foundation-line" marker-end="url(#f-arrow)"/><path d="M 890 340 C 930 285 960 395 1000 340 S 1080 395 1120 340" class="heat-ray protect-heat"/>${ft(1025,245,'Heat','middle')}${ft(600,610,'Excess energy is dissipated; oxidative damage is reduced','middle','f-small')}</g>`;
 return fsvg(b,show?'Carotenoids dissipate excess excitation energy as heat and help protect photosystems':'Bright light reaches a photosystem and accessory pigment');
}
function atpStructure(show){
 let b=`<g stroke="#59467e" stroke-width="7" stroke-linejoin="round"><path d="M 115 260 L 170 175 L 285 155 L 365 245 L 330 355 L 205 385 Z" fill="#64c9b7"/><path d="M 365 245 L 470 240 L 515 350 L 410 420 L 330 355 Z" fill="#64c9b7"/><path d="M 515 350 L 605 395 M 757 365 L 825 245 L 880 245 M 970 245 H 995 M 1085 245 H 1110" fill="none"/><path d="M 605 395 L 700 325 L 800 395 L 765 510 L 640 510 Z" fill="#c69cdb"/>${[925,1040,1155].map(x=>`<circle cx="${x}" cy="245" r="45" fill="#f4cf70"/>`).join('')}</g>`;
 if(show)b+=`<g class="new-layer">${ft(315,100,'Adenine')}${fl('M 315 120 L 315 165')}${ft(700,260,'Ribose')}${fl('M 700 280 L 700 320')}${[925,1040,1155].map(x=>ft(x,258,'P')).join('')}${ft(1025,370,'3 phosphate groups','middle','f-small')}<path d="M 115 545 V 565 H 800 V 545" class="foundation-line"/>${ft(455,610,'Adenosine = adenine + ribose','middle','f-small')}${ft(770,70,'ATP = adenosine triphosphate','middle','f-small')}</g>`;
 return fsvg(b,show?'Simplified ATP: fused adenine rings, ribose and three phosphate groups; adenine plus ribose is adenosine':'Unlabelled simplified ATP structure').replace('viewBox="0 0 1200 650"','viewBox="0 0 1240 650"');
}
function atpCycle(show){
 let b=`<ellipse cx="600" cy="150" rx="130" ry="60" fill="#f5ca5f"/>${ft(600,163,'ATP')}${ft(600,495,'ADP + Pᵢ')}<path d="M 460 175 C 230 260 285 400 470 440" class="foundation-line" marker-end="url(#f-arrow)"/><path d="M 745 435 C 950 345 930 245 750 185" class="foundation-line" marker-end="url(#f-arrow)"/>`;
 if(show)b+=`<g class="new-layer">${ft(155,255,'Energy released','middle','f-small')}${ft(155,295,'for cellular work','middle','f-small')}${ft(1040,325,'Energy input','middle','f-small')}${ft(1040,365,'rebuilds ATP','middle','f-small')}${ft(600,590,'ATP + water → ADP + phosphate + usable energy','middle','f-small')}</g>`;
 return fsvg(b,show?'ATP hydrolysis releases usable energy; energy input rebuilds ATP from ADP and phosphate':'ATP cycles with ADP and phosphate');
}
