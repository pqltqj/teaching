'use strict';
function captureScene(step,show){
 if(step.scene==='orbit')return orbitScene(show);
 if(step.scene==='excitation')return relaxationScene(show);
 return photosystemScene(step.focus,show);
}
function orbitScene(show){
 const frame=`<rect width="1200" height="680" fill="#fbfaf6"/>${captureDefs()}<path d="M 140 555 L 140 85" class="capture-leader" marker-end="url(#capture-red)"/><text x="85" y="325" text-anchor="middle" transform="rotate(-90 85 325)" class="capture-label">Electron energy</text><path d="M 260 480 H 640 M 260 180 H 640" class="energy-level"/>`;
 const labels=show?`<g class="new-layer">${captureText(735,180,'Excited state')}${captureText(735,225,'Higher energy','start','capture-small')}${captureText(735,480,'Ground state')}${captureText(735,525,'Lower energy','start','capture-small')}${captureText(220,335,'Photon','start','capture-small')}<path d="M 240 355 L 275 385 L 265 410 L 320 403 L 310 443 L 370 430 L 430 475" class="capture-photon" pathLength="1"/><path d="M 450 455 L 450 225" class="excitation-rise" pathLength="1"/><path d="M 438 225 L 450 205 L 462 225 Z" class="excitation-tip"/></g>`:'';
 const electron=`<g class="${show?'level-electron':''}" transform="translate(450 ${show?180:480})"><circle r="25" fill="#fff8f3" stroke="#d52f48" stroke-width="4"/>${captureText(0,11,'e⁻','middle','capture-small')}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680" role="img" aria-label="Electron energy-level diagram${show?': absorption of a photon raises the electron from ground state to excited state':''}">${frame}${labels}${electron}</svg>`;
}
function locationReveal(show){
 if(!show)return diagram('overview-blank.png',1508,901,'','Unlabelled chloroplast with thylakoids');
 const text=`<g class="new-layer">${captureText(1005,425,'Calvin','middle')}${captureText(1005,470,'cycle','middle')}${captureText(790,655,'Stroma','middle')}${captureLeader('M 790 625 L 815 540')}</g>`;
 return diagram('overview-cycle.png',1508,901,text,'Calvin cycle located in the chloroplast stroma; central molecules hidden');
}
function productReveal(focus,show){
 const file=focus==='products'?(show?'overview-no-sugars.png':'overview-no-energy-or-sugars.png'):show?'reaction-overview.png':'overview-no-sugars.png';
 const alt=show?'Photosynthesis overview with products revealed':focus==='products'?'Photosynthesis overview with light-reaction products hidden':'Photosynthesis overview with carbohydrate products hidden';
 return diagram(file,1508,901,'',alt);
}
function captureText(x,y,lines,anchor='start',extra=''){
 return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="capture-label ${extra}">${lines.split('|').map((s,i)=>`<tspan x="${x}" dy="${i?'1.2em':0}">${s}</tspan>`).join('')}</text>`;
}
function captureLeader(d){return `<path d="${d}" class="capture-leader"/>`;}
function captureDefs(){return `<defs><marker id="capture-gold" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d69700"/></marker><marker id="capture-red" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d52f48"/></marker></defs>`;}
function photosystemScene(focus,show){
 let b=captureDefs();
 if(show){
  b+=`<g class="new-layer">${captureText(1180,290,'Stroma')}${captureText(1180,900,'Thylakoid lumen')}${captureText(1180,740,'Thylakoid|membrane')}${captureLeader('M 1150 745 L 1100 610')}</g>`;
  if(focus==='structure'){
   b+=`<g class="new-layer">${captureText(1180,425,'Light-harvesting|complexes')}${captureLeader('M 1160 440 L 910 390')}${captureText(1180,610,'Pigment molecules')}${captureLeader('M 1160 610 L 890 625')}${captureText(650,225,'Photosystem = proteins + pigments','middle')}</g>`;

  }
  if(focus==='energy'){
   b+=`<g class="new-layer">${captureText(1180,420,'Reaction centre')}${captureLeader('M 1160 430 L 735 555')}${captureText(1180,580,'Special pair of|chlorophyll a|molecules')}${captureLeader('M 1160 630 L 710 690')}${captureText(200,225,'Photon')}${captureText(440,930,'Energy passes between pigments','middle','capture-small')}</g>`;
   b+=`<path d="M 280 250 L 310 278 L 300 304 L 350 299 L 340 340 L 390 332 L 382 370 L 450 377 L 480 393" class="capture-photon" pathLength="1"/>`;
   b+=`<path d="M 490 398 Q 410 430 440 508 Q 530 498 515 583 Q 435 572 440 667 Q 460 680 520 706 Q 580 605 650 680" class="energy-route"/>`;
   b+=`<g class="energy-bead" transform="translate(650 680)"><circle r="22" fill="#ffe85d" stroke="#8e6200" stroke-width="4"/></g>`;
  }
  if(focus==='electron'){
   b+=`<g class="new-layer">${captureText(1180,380,'Primary electron|acceptor')}${captureLeader('M 1160 395 L 685 440')}${captureText(1180,595,'Reaction centre')}${captureLeader('M 1160 605 L 735 560')}${captureText(665,950,'Special pair of chlorophyll a','middle')}${captureLeader('M 665 915 L 665 735')}</g>`;
   b+=`<ellipse cx="665" cy="685" rx="62" ry="50" class="special-pair-glow"/><path d="M 665 635 L 665 495" class="capture-electron-path"/>`;
   b+=`<g class="centre-electron" transform="translate(665 440)"><circle r="28" fill="#fff8f3" stroke="#d52f48" stroke-width="4"/>${captureText(0,11,'e⁻','middle')}</g>`;
  }
 }
 return diagram('photosystem-blank.png',1630,1125,b,'Photosystem'+(show?': '+focus+' revealed':' with labels hidden')).replace('viewBox="0 0 1630 1125"','viewBox="115 175 1515 810"');
}

function relaxationScene(show){
 let b=captureDefs();
 if(show){
  b+=`<g class="new-layer"><path d="M 50 490 L 50 45" class="capture-leader" marker-end="url(#capture-red)"/><text x="25" y="275" text-anchor="middle" transform="rotate(-90 25 275)" class="capture-label capture-small">Electron energy</text>
  ${captureText(295,474,'Chlorophyll','middle','capture-small')}${captureText(295,506,'molecule','middle','capture-small')}${captureText(405,76,'Excited state','start','capture-small')}${captureText(405,446,'Ground state','start','capture-small')}${captureText(80,260,'Photon','start','capture-small')}
  <path d="M 105 280 L 140 300 L 128 330 L 180 325 L 170 365 L 220 355 L 210 390 L 273 422" class="capture-photon" pathLength="1"/>
  <path d="M 292 400 L 292 112" class="chlorophyll-rise"/><path d="M 313 105 C 460 155 475 325 318 411" class="energy-down"/>
  <path d="M 415 188 L 437 170 L 433 213 L 466 198 L 459 240 L 499 228 L 522 261" class="heat-ray"/>${captureText(550,221,'Heat','start','capture-small')}
  <path d="M 413 285 L 444 271 L 437 309 L 473 299 L 467 338 L 505 324 L 529 362" class="light-ray"/>${captureText(548,347,'Light','start','capture-small')}${captureText(548,380,'(fluorescence)','start','capture-small')}
  ${captureText(350,600,'Isolated chlorophyll','middle','capture-small')}
  <g class="chlorophyll-electron" transform="translate(292 422)"><circle r="17" fill="#fff8f3" stroke="#d52f48" stroke-width="3"/>${captureText(0,8,'e⁻','middle','tiny-label')}</g>
  <path d="M 755 60 V 615" stroke="#d7dee6" stroke-width="2"/>
  ${captureText(1060,65,'Electron transport chain','middle')}
  <path d="M 790 180 H 910 M 940 280 H 1060 M 1140 380 H 1260" class="acceptor-level"/>
  ${captureText(850,230,'Donor','middle','capture-small')}${captureText(1000,330,'Acceptor','middle','capture-small')}${captureText(1200,430,'Next carrier','middle','capture-small')}
  <path d="M 880 190 L 975 263 M 1030 292 L 1176 364" class="capture-electron-path"/>
  <g class="chain-drop-electron" transform="translate(1200 380)"><circle r="17" fill="#fff8f3" stroke="#d52f48" stroke-width="3"/>${captureText(0,8,'e⁻','middle','tiny-label')}</g>
  <path d="M 1070 425 L 1070 475" stroke="#d69700" stroke-width="6" marker-end="url(#capture-gold)"/>
  ${captureText(1070,525,'Energy released','middle')}${captureText(1070,570,'helps build the H⁺ gradient','middle','capture-small')}
  </g>`;
 }
 return diagram('excitation-blank.png',622,580,b,'Separate diagrams'+(show?': isolated chlorophyll excitation and return to ground state; downhill electron transfers through an electron transport chain release energy':' with labels hidden')).replace('viewBox="0 0 622 580"','viewBox="0 0 1400 650"').replace('<image ','<rect width="1400" height="650" fill="white"/><image ');
}
