'use strict';
// The original artwork stays underneath separately authored, reversible layers.
function diagram(file,w,h,body,alt){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${alt}" preserveAspectRatio="xMidYMid meet"><image href="assets/${file}" width="${w}" height="${h}" preserveAspectRatio="none"/>${body}</svg>`;}
function label(x,y,text,anchor='start',cls='diagram-label'){return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${text}</text>`;}
function leader(d){return `<path d="${d}" class="diagram-line"/>`;}
function customScene(step,show){
 if(step.scene==='foundation')return foundationScene(step,show);
 if(['photosystem','orbit','excitation'].includes(step.scene))return captureScene(step,show);
 if(step.scene==='chloroplast'&&step.focus==='whole'){
  const lines=leader('M 100 260 L 87 352')+leader('M 210 227 L 196 325')+leader('M 274 234 L 320 335')+leader('M 59 284 L 59 63')+leader('M 350 96 L 467 33')+leader('M 350 175 L 467 116');
  const labels=label(50,379,'Thylakoid')+label(167,350,'Stroma')+label(324,360,'Thylakoid lumen')+label(36,26,'Intermembrane')+label(36,49,'space')+label(478,28,'Outer')+label(478,51,'membrane')+label(478,111,'Inner')+label(478,134,'membrane');
  return diagram('chloroplast-blank.png',600,400,show?`<g class="new-layer">${lines}${labels}</g>`:'','Chloroplast cutaway'+(show?'; thylakoid, stroma and thylakoid lumen labelled':''));
 }
 if(step.scene==='chloroplast'&&step.focus==='stack'){
  const labels=label(86,261,'Chloroplast','start','diagram-label granum-label')+label(526,219,'Granum','middle','diagram-label granum-label')+label(526,255,'(stack of thylakoids)','middle','diagram-label granum-label')+label(651,625,'Thylakoid','start','diagram-label granum-label')+label(651,659,'membrane','start','diagram-label granum-label');
  return diagram('granum-blank.png',851,850,show?`<g class="new-layer">${labels}</g>`:'','Chloroplast magnified to a stack of thylakoids'+(show?'; granum and thylakoid membrane labelled':'')).replace('viewBox="0 0 851 850"','viewBox="20 150 815 550"');
 }
 if(step.scene==='thylakoid'&&step.focus==='spaces'){
  return diagram('chloroplast-blank.png',600,400,show?`<g class="new-layer">${leader('M 274 234 L 320 335')}${label(324,360,'Lumen')}${leader('M 210 227 L 196 325')}${label(167,350,'Stroma')}</g>`:'','Space inside a thylakoid and fluid outside it');
 }
 const lightSite=label(455,455,'Light reactions','middle','diagram-label overview-label')+label(455,510,'Thylakoid membrane','middle','diagram-label overview-label');
 if(step.scene==='thylakoid'&&step.focus==='membrane')return diagram('overview-blank.png',1508,901,show?`<g class="new-layer">${lightSite}</g>`:'','Chloroplast showing the location of the light reactions');
 if(step.scene==='locations'&&!step.focus)return locationReveal(show);
 if(step.scene==='locations'&&step.focus)return productReveal(step.focus,show);
 if(step.scene==='cells')return diagram('cells-user.png',1200,675,'','Still photograph of plant cells containing chloroplasts; cytoplasmic streaming occurs within each living cell');
 if(step.scene==='membrane')return membraneScene(step.phase,show);
 return null;
}
function membraneScene(phase,show){
 const stage=phase===10?9:phase-(show?0:1);
 const active=show?phase:-1;
 const defs=`<defs>${[['electron','#df2638'],['proton','#1476b8'],['light','#e7a400'],['reaction','#171717']].map(([id,c])=>`<marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${c}"/></marker>`).join('')}</defs>`;
 const txt=(x,y,t,small=false,anchor='start')=>label(x,y,t,anchor,'membrane-label'+(small?' membrane-small':''));
 const path=(d,kind,n)=>`<path d="${d}" class="${kind}-path ${active===n?'active-path':''}"/>`;
 const particle=(x,y,t,proton=false)=>`<g><circle cx="${x}" cy="${y}" r="24" class="${proton?'proton-particle':'membrane-particle'}"/>${label(x,y+11,t,'middle','membrane-label membrane-small')}</g>`;
 const group=(n,body)=>stage>=n?`<g data-layer="${n}" class="${active===n?'new-layer':''}">${body}</g>`:'';
 let b=defs+txt(35,110,'Stroma')+txt(35,817,'Lumen')+txt(25,326,'Thylakoid',true)+txt(25,363,'membrane',true);
 b+=group(0,txt(269,490,'Photosystem',true,'middle')+txt(269,529,'II',true,'middle')+txt(110,175,'Light',true)+path('M 150 195 Q 110 225 165 252 T 192 310 L 224 363','light',0));
 b+=group(1,path('M 272 581 Q 320 540 404 558','electron',1)+particle(270,582,'e⁻'));
 b+=group(2,txt(118,762,'2 H₂O')+`<path d="M 190 730 Q 270 658 352 740" fill="none" stroke="#171717" stroke-width="5" marker-end="url(#reaction-arrow)"/>`+path('M 209 711 Q 250 680 268 609','electron',2)+txt(313,789,'4')+`<circle cx="365" cy="778" r="25" fill="#f7c2c7" stroke="#d88f99" stroke-width="3"/>`+txt(365,789,'H⁺',true,'middle')+txt(401,789,'+ O₂'));
 b+=group(3,path('M 620 569 Q 690 544 744 611 Q 791 660 829 680','electron',3)+path('M 900 692 Q 996 676 1038 566','electron',3)+particle(738,605,'e⁻')+particle(862,690,'e⁻')+txt(400,250,'Electron transport chain',true));
 b+=group(4,path('M 615 344 L 615 712','proton',4)+particle(615,311,'H⁺',true)+particle(615,762,'H⁺',true));
 b+=group(5,txt(1040,490,'Photosystem',true,'middle')+txt(1040,529,'I',true,'middle')+txt(906,175,'Light',true)+path('M 875 195 Q 845 222 897 250 T 925 310 L 968 363','light',5)+path('M 1091 463 Q 1150 380 1248 410 L 1287 411','electron',5)+particle(1209,415,'e⁻'));
 b+=group(6,path('M 1355 390 L 1408 329','electron',6)+particle(1336,408,'e⁻')+txt(1090,256,'NADP⁺ + 2 e⁻ + H⁺ → NADPH',true));
 b+=group(7,[760,1030,1215,1400].map((x,i)=>particle(x,785-(i%2)*38,'H⁺',true)).join('')+txt(1090,114,'H⁺ concentration: lower',true)+txt(1000,823,'H⁺ concentration: higher',true));
 b+=group(8,txt(1760,548,'ATP',true,'middle')+txt(1760,586,'synthase',true,'middle')+path('M 1665 727 L 1665 95','proton',8)+particle(1665,51,'H⁺',true));
 b+=group(9,txt(1510,155,'ADP + Pᵢ',true)+txt(1757,155,'ATP',true,'middle')+`<path d="M 1550 178 Q 1655 257 1750 181" class="diagram-line" marker-end="url(#electron-arrow)"/>`);
 if(phase===10&&show)b+=`<rect x="1510" y="20" width="300" height="790" rx="18" class="focus-ring"/>`;
 return diagram('membrane-blank.png',1855,848,b,'Light reaction pathway, progressively revealed: '+Math.max(0,stage+1)+' of 10 layers');
}
