'use strict';
const asset='../photosynthesis-light-reactions/assets/';
const txt=(x,y,s,cls='',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s.split('|').map((line,i)=>`<tspan x="${x}" dy="${i?30:0}">${line}</tspan>`).join('')}</text>`;
const rect=(x,y,w,h,fill='#fff',stroke='#a6b2c1',r=16)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const path=(d,cls='')=>`<path d="${d}" class="route ${cls}"/>`;
const arrow=(x,y,a,b,cls='')=>path(`M ${x} ${y} L ${a} ${b}`,cls);
const atom=(x,y,newC=false)=>`<circle cx="${x}" cy="${y}" r="13" class="${newC?'new-carbon':'carbon'}"/>`;
const atoms=(x,y,n,newFirst=false)=>Array.from({length:n},(_,i)=>atom(x+(i-(n-1)/2)*30,y,newFirst&&i===0)).join('');
const molecule=(x,y,label,n,fill='#edf2fa',newFirst=false)=>`${rect(x-125,y-48,250,108,fill)}${txt(x,y-10,label,'molecule-name')}${atoms(x,y+25,n,newFirst)}`;
const pill=(x,y,label,fill='#e4ebf6',w=180)=>`${rect(x-w/2,y-27,w,54,fill)}${txt(x,y+9,label)}`;
function svg(body,title){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 550" role="img" aria-label="${title}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#46617f"/></marker><linearGradient id="leaf-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#afcda1"/><stop offset="1" stop-color="#5a965b"/></linearGradient></defs><rect width="1100" height="550" fill="#faf9f5"/>${body}</svg>`;}
function cycle(r,highlight='all'){
 const show=n=>r&&(highlight==='all'||highlight===n);
 return svg(`${path('M 550 120 C 810 120 845 443 560 445 C 275 447 290 120 530 120',r?'flow':'')}
 ${pill(550,120,show('fix')?'1. Carbon fixation':'1',show('fix')?'#fff0c3':'#e9edf3',280)}
 ${pill(800,325,show('reduce')?'2. Reduction':'2',show('reduce')?'#e2ecff':'#e9edf3',250)}
 ${pill(300,325,show('regen')?'3. Regeneration':'3',show('regen')?'#e3eedc':'#e9edf3',260)}
 ${txt(550,282,'Calvin cycle','large')}${r?'<circle r="9" class="cycle-dot" fill="#d78b25"/>':''}${txt(550,318,'Stroma','small')}
 ${r?`${txt(550,44,'CO₂')}${arrow(550,55,550,85)}${arrow(723,424,925,465)}${txt(969,476,'G3P')}`:''}`, 'The three stages of the Calvin cycle');
}
function overview(r,mode){
 let b=`<image href="${asset}overview-blank.png" x="90" y="0" width="920" height="550"/>`;
 if(mode==='location'){
  if(r)b+=`<ellipse cx="680" cy="310" rx="135" ry="90" class="highlight"/>${txt(680,316,'Stroma','large')}`;
 }else{
  b+=`<circle cx="720" cy="290" r="76" fill="#c9e1f9" stroke="#4783b1" stroke-width="4"/>${txt(720,282,'Calvin|cycle')}`;
  if(mode==='summary'||mode==='stop'||mode==='dark'||mode==='purpose')b+=txt(362,300,'Light|reactions');
  if(r&&(mode==='purpose'||mode==='inputs'||mode==='summary'||mode==='stop'||mode==='dark')){
   b+=`${txt(720,90,'CO₂')}${arrow(720,105,720,200,'flow')}${arrow(450,265,625,265,'flow')}${pill(540,235,'ATP','#ffedbb',105)}${arrow(450,330,625,330,'flow')}${pill(540,378,'NADPH','#e4e8fa',150)}`;
   if(mode==='summary'||mode==='purpose')b+=`${arrow(720,377,720,438,'flow')}${txt(720,475,'G3P')}`;
   if(mode==='dark')b+=`${rect(90,42,330,72,'#fff')} ${txt(255,86,'No direct light absorption','small')}`;
   if(mode==='stop')b+=`${rect(80,36,470,75,'#fff4ee','#bc6f54')}${txt(315,82,'No new ATP or NADPH','small')}`;
  }
  if(mode==='recycle'){
   b+=`${arrow(450,245,625,245)}${txt(535,221,'ATP + NADPH','small')}`;
   if(r)b+=`${path('M 645 355 Q 550 435 442 355','flow')}${txt(545,448,'ADP + Pᵢ + NADP⁺','small')}`;
  }
 }
 return svg(b,'Chloroplast with thylakoids and the Calvin cycle in the surrounding stroma');
}
function fixation(r,mode){
 const known=['rubisco','split'].includes(mode);
 let b=`${molecule(200,315,known||r&&mode==='acceptor'?'RuBP':mode==='fixation'?'Organic molecule':'?',5)}${molecule(200,100,'CO₂',1,'#fff0d5',true)}${arrow(200,160,437,255)}${arrow(327,315,437,315)}`;
 if(mode==='rubisco')b+=`${pill(550,100,r?'Rubisco':'?',r?'#fff0c3':'#edf0f5',210)}${path('M 550 130 L 550 224')}`;
 if(mode==='fixation'){
  b+=`${rect(460,228,310,150,'#e5edf8')}${txt(615,278,r?'Carbon is fixed':'?')}${atoms(615,325,6,true)}`;
  if(r)b+=`${atom(0,0,true).replace('<circle','<circle class="new-carbon carbon-move"').replace('class="new-carbon"','')}${txt(615,420,'CO₂ carbon becomes part|of an organic molecule','small')}`;
 }else if(mode==='acceptor'){
  b+=`${rect(475,240,400,135,'#fff')}${txt(675,290,r?'Ribulose bisphosphate':'?')}${txt(675,335,r?'5 carbons':'','small')}`;
 }else{
  b+=`${molecule(570,295,'Unstable 6C',6,'#fff0d5',true)}${txt(570,390,'6 carbons','small')}`;
  if(mode==='split'){
   b+=`${path('M 700 275 Q 760 205 820 205',r?'flow':'')}${path('M 700 320 Q 760 380 820 380',r?'flow':'')}`;
   if(r)b+=`${molecule(960,195,'3-PGA',3,'#e5edf8',true)}${molecule(960,375,'3-PGA',3)}${txt(970,485,'2 × 3 carbons','small')}`;
   else b+=`${pill(955,205,'?', '#edf0f5',180)}${pill(955,380,'?','#edf0f5',180)}`;
  }
 }
 b+=txt(550,530,'Each circle represents one carbon atom.','tiny');
 return svg(b,'Carbon fixation: one carbon from CO₂ joins five-carbon RuBP, forming an unstable six-carbon compound that splits into two three-carbon molecules');
}
function reduction(r,mode){
 let b='';
 if(mode==='phosphorylate'){
  b+=`${molecule(210,300,'3-PGA',3)}${arrow(352,300,715,300,r?'flow':'')}${molecule(880,300,r?'1,3-BPG':'?',3,'#e3e9f9')}${txt(880,400,r?'DPGA in the notes':'','small')}`;
  if(r)b+=`${pill(480,130,'ATP','#ffedbb',130)}${pill(645,130,'ADP','#fff',130)}${path('M 480 165 Q 480 210 540 270','flow')}${arrow(550,130,570,130)}${txt(530,460,'A phosphate is transferred to 3-PGA.','small')}<g class="traveller" style="offset-path:path('M 480 165 Q 480 240 550 300')"><circle r="23" fill="#ffe0a0" stroke="#ad7c2d" stroke-width="2"/>${txt(0,9,'P','small')}</g>`;
 }else if(mode==='reduce'){
  b+=`${molecule(210,300,'1,3-BPG',3)}${arrow(352,300,715,300,r?'flow':'')}${molecule(880,300,r?'G3P':'?',3,'#e0eeda')}`;
  b+=`${pill(480,130,'NADPH','#e4e8fa',150)}`;
  if(r)b+=`${pill(690,130,'NADP⁺','#fff',145)}${arrow(568,130,602,130)}${path('M 475 165 Q 475 220 540 270','flow')}${txt(470,235,'electrons','small','end')}${txt(880,416,'Pᵢ released','small')}${txt(550,487,'Carbon gains electrons: reduction.','small')}<g class="traveller" style="offset-path:path('M 475 165 Q 475 235 550 300')"><circle r="28" fill="#d7e6ff" stroke="#496c9c" stroke-width="2"/>${txt(0,9,'2e⁻','small')}</g>`;
 }else{
  b+=`${rect(200,135,700,270,'#e3eedc')}${atoms(550,270,3)}${txt(550,210,r?'G3P / PGAL':'?','large')}`;
  if(r)b+=`${txt(550,340,'Glyceraldehyde 3-phosphate','small')}${arrow(920,270,1010,270)}${txt(550,465,'3-carbon sugar → glucose and other organic molecules','small')}`;
 }
 return svg(b,'Reduction uses ATP and electrons from NADPH to convert three-carbon compounds into G3P');
}
function partition(r){
 let b=txt(550,52,'After 3 CO₂ are fixed: 6 G3P are formed');
 for(let i=0;i<(r?5:6);i++){
  let x=160+(i%3)*230,y=180+Math.floor(i/3)*135;
  b+=`${rect(x-85,y-45,170,90,i===5&&r?'#fff0c3':'#e3eedc')}${txt(x,y-10,'G3P','small')}${atoms(x,y+20,3)}`;
 }
 if(r){b+=`${path('M 275 370 Q 130 455 420 468','flow')}${txt(445,475,'5 stay','', 'start')}${path('M 720 315 Q 800 315 832 315','flow')}${rect(850,235,210,155,'#fff0c3')}${txt(955,275,'1 net G3P|leaves')}${atoms(955,355,3)}${txt(955,442,'3 carbons for|building sugars','small')}`;}
 return svg(b,'Six G3P molecules are formed: five regenerate RuBP, and one net G3P leaves the cycle');
}
function regenerate(r){
 let b=`${txt(240,80,'5 G3P')}${txt(240,122,'5 × 3 = 15 carbons','small')}`;
 for(let i=0;i<5;i++)b+=`${atoms(240,190+i*55,3)}`;
 b+=`${arrow(365,300,710,300,r?'flow':'')}`;
 if(r){b+=`${pill(520,170,'ATP → ADP','#ffedbb',210)}${txt(520,370,'Rearrangement','small')}${txt(865,80,'3 RuBP')}${txt(865,122,'3 × 5 = 15 carbons','small')}`;for(let i=0;i<3;i++)b+=`${atoms(865,205+i*85,5)}`;b+=txt(550,498,'The CO₂ acceptor is regenerated.','small');}
 else b+=`${rect(760,175,255,250,'#eaf0f8')}${txt(887,305,'?','large')}`;
 return svg(b,'Regeneration uses ATP to rearrange fifteen carbons in five G3P into three five-carbon RuBP molecules');
}
function budget(r,glucose=false){
 let b=`${txt(550,65,glucose?'Carbon for one glucose':'One net G3P','large')}${rect(90,120,280,290,'#fff0d5')}${rect(410,120,280,290,'#fff0c3')}${rect(730,120,280,290,'#e6e9f8')}`;
 ['CO₂','ATP','NADPH'].forEach((s,i)=>{b+=txt(230+i*320,185,s);b+=txt(230+i*320,300,r?String((glucose?[6,18,12]:[3,9,6])[i]):'?','large');});
 if(r)b+=txt(550,480,glucose?'2 net G3P (3C + 3C) → carbon for glucose (6C)':'Per CO₂: 3 ATP and 2 NADPH','small');
 return svg(b,'The carbon and energy budget of the Calvin cycle');
}
function fate(r,mode){
 let b='';
 if(mode==='fates'){
  b+=`${pill(550,75,'G3P','#e3eedc',160)}${arrow(550,110,550,160)}${pill(550,205,'Glucose / sugars','#fff0c3',260)}`;
  const labels=['Cellular|respiration','Starch','Cellulose','Sucrose'];
  [165,420,680,935].forEach((x,i)=>{b+=path(`M 550 240 Q ${x} 275 ${x} 335`,r?'flow':'');b+=rect(x-115,350,230,140,i===0?'#fff0d5':'#e8edf5');b+=txt(x,404,r?labels[i]:'?');if(r)b+=txt(x,464,['ATP for cells','Storage','Cell walls','Transport'][i],'small');});
 }else if(mode==='polymers'){
  [275,825].forEach((x,col)=>{b+=rect(x-230,95,460,350,col?'#e4ebf6':'#fff0d5');b+=txt(x,155,r?(col?'Cellulose':'Starch'):'?','large');for(let j=0;j<3;j++)for(let i=0;i<6;i++)b+=`<rect x="${x-165+i*55}" y="${212+j*42}" width="40" height="28" rx="5" fill="${col?'#7497bd':'#d7ac60'}"/>`;if(r)b+=txt(x,394,col?'Structure: plant cell walls':'Storage: many glucose units','small');});
 }else if(mode==='transport'){
  b+=`<path d="M 360 120 Q 180 0 150 160 Q 130 270 360 220 Z" fill="url(#leaf-gradient)" stroke="#447448" stroke-width="3"/><path d="M 300 200 Q 550 230 550 380" fill="none" stroke="#587e51" stroke-width="12"/>${path('M 550 350 Q 450 450 330 480')}${path('M 550 350 Q 650 450 770 480')}${txt(260,95,'Leaf')}${txt(550,530,'Roots and other growing tissues','small')}`;
  if(r)b+=`${pill(775,190,'Sucrose','#fff0c3',180)}${txt(775,240,'Transport in phloem','small')}${path('M 755 270 Q 650 325 580 350','flow')}`;
 }else if(mode==='animals'){
  b+=`${pill(550,75,'Glucose','#fff0c3',180)}`;
  [210,550,890].forEach((x,i)=>{b+=`${path(`M 550 110 Q ${x} 170 ${x} 220`,r?'flow':'')}${rect(x-150,245,300,205,'#e8edf5')}${txt(x,300,r?['Respiration','Glycogen','Fat'][i]:'?')}`;if(r)b+=txt(x,365,['ATP for cells','Liver and muscles','Adipose tissue'][i],'small');});
  if(r)b+=txt(550,505,'Unused glucose can be stored; excess energy can become fat.','small');
 }else{
  b+=`<ellipse cx="270" cy="275" rx="155" ry="215" fill="#c4d9ad" stroke="#6f9655" stroke-width="4"/>`;
  for(let i=0;i<8;i++)b+=`<ellipse cx="${210+(i%2)*115}" cy="${140+Math.floor(i/2)*85}" rx="35" ry="22" fill="#74a655"/>`;
  b+=txt(270,525,'Photosynthetic alga','small');
  b+=`${arrow(470,275,660,275,r?'flow':'')}${rect(710,160,290,230,'#fff0d5')}${txt(855,230,r?'Oils / lipids':'?','large')}`;
  if(r)b+=`${txt(855,295,'Processed into|biofuels','small')}`;
 }
 return svg(b,'Uses of the organic molecules produced through photosynthesis');
}
function drawDiagram(mode,r){
 if(['purpose','location','dark','inputs','recycle','summary','stop'].includes(mode))return overview(r,mode);
 if(mode==='leaf')return svg(`<image href="${asset}leaf-tissue.png" x="20" y="15" width="820" height="520"/>${r?`${txt(935,105,'CO₂')}${path('M 925 130 Q 1000 440 410 495 L 410 480 Q 435 438 500 420','flow')}${txt(930,340,'Stoma','small')}${path('M 880 350 L 410 480')}`:''}`,'Leaf cross-section: carbon dioxide enters through stomata and diffuses to photosynthetic cells');
 if(mode==='carriers')return svg(`${rect(90,105,440,340,'#fff0c3')}${rect(570,105,440,340,'#e6e9f8')}${txt(310,185,'ATP','large')}${txt(790,185,'NADPH','large')}${txt(310,300,r?'Energy':'?','large')}${txt(790,300,r?'Electrons':'?','large')}${r?`${txt(310,375,'Powers reactions','small')}${txt(790,375,'Reduces carbon','small')}`:''}`,'ATP provides energy and NADPH provides electrons for reducing carbon');
 if(mode==='cycle')return cycle(r);
 if(['fixation','acceptor','rubisco','split'].includes(mode))return fixation(r,mode);
 if(['phosphorylate','reduce','product'].includes(mode))return reduction(r,mode);
 if(mode==='partition')return partition(r);
 if(mode==='regenerate')return regenerate(r);
 if(mode==='budget'||mode==='glucose-budget')return budget(r,mode==='glucose-budget');
 return fate(r,mode);
}

function diagram(mode,r){const image=drawDiagram(mode,r);return r?image:image.replace(/aria-label="[^"]*"/,'aria-label="Diagram for the current question; answer labels are hidden"');}
