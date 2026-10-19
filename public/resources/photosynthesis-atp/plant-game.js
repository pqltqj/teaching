(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const cards = [
    {id:'ghost-pipe',name:'Ghost pipe',species:'Monotropa uniflora',plant:true,photo:false,
      explanation:'A flowering plant without chlorophyll. It gets carbon compounds through fungi connected to other plants, rather than making sugars by photosynthesis.'},
    {id:'venus-flytrap',name:'Venus flytrap',species:'Dionaea muscipula',plant:true,photo:true,
      explanation:'It makes sugars by photosynthesis. The animals it catches supply mineral nutrients, including nitrogen, rather than replacing its need for light.'},
    {id:'living-stones',name:'Living stones',species:'Lithops aucampiae',plant:true,photo:true,
      explanation:'Those stone-like structures are thick succulent leaves. Translucent leaf windows let light reach the photosynthetic tissue inside.'},
    {id:'giant-kelp',name:'Giant kelp',species:'Macrocystis pyrifera',plant:false,photo:true,
      explanation:'Giant kelp is a brown alga, not a land plant. Its cells contain chloroplasts and carry out photosynthesis, even though it looks brown.'},
    {id:'reindeer-lichen',name:'Reindeer lichen',species:'Cladonia rangiferina',plant:false,photo:true,partner:true,
      explanation:'A lichen is a partnership involving a fungus and a photosynthetic partner. Here, the algae make sugars by photosynthesis; the fungus itself does not.'},
    {id:'rafflesia',name:'Rafflesia',species:'Rafflesia arnoldi',plant:true,photo:false,
      explanation:'This enormous flower belongs to a parasitic plant. It gets water and organic nutrients from its host vine and does not photosynthesize.'},
    {id:'birds-nest-orchid',name:'Bird’s-nest orchid',species:'Neottia nidus-avis',plant:true,photo:false,
      explanation:'It is an orchid, so it is a flowering plant. It gets its carbon compounds through fungi instead of photosynthesis.'},
    {id:'parrot-waxcap',name:'Parrot waxcap',species:'Gliophorus psittacinus',plant:false,photo:false,
      explanation:'It is a fungus. Its green colour does not mean it photosynthesizes: fungi get organic nutrients from other sources.'},
    {id:'dead-leaf-butterfly',name:'Dead-leaf butterfly',species:'Kallima inachus',plant:false,photo:false,
      explanation:'Those are wings, not leaves. This butterfly is an animal that gets its energy from food. Its leaf-like appearance is camouflage.'},
    {id:'bulbasaur',name:'Bulbasaur',species:null,bonus:true,
      explanation:'Yes! Bulbasaur can learn Synthesis.'}
  ];
  let assets = null;
  let mode = 'plant';
  let deck = [];
  let position = 0;
  let answers = [];
  let face = 'front';
  let answered = false;
  let loading = true;
  let flipTimer;
  const title = byId('plant-game-title');
  const card = byId('organism-card');
  const front = byId('organism-front');
  const back = byId('organism-back');
  const yes = byId('organism-yes');
  const no = byId('organism-no');
  const clearEffects = () => { if (typeof window.clearEffect === 'function') window.clearEffect(); };

  function shuffle(items) {
    const result = [...items];
    for (let i=result.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }
  function setName(commonId,speciesId,item) {
    byId(commonId).textContent=item.name;
    const species=byId(speciesId);
    species.textContent=item.species || 'Pokédex #0001';
    species.classList.toggle('fictional',!!item.bonus);
  }
  function expected(item) { return item.bonus ? true : item[mode]; }
  function answerText(item) {
    if(item.bonus) return 'Yes — Synthesis!';
    if(mode==='plant') return item.plant ? 'Yes — it’s a plant.' : 'No — it isn’t a plant.';
    if(item.partner) return 'Yes — through its algal partner.';
    return item.photo ? 'Yes — it photosynthesizes.' : 'No — it doesn’t photosynthesize.';
  }
  function setFace(next) {
    const changed=face!==next;
    clearTimeout(flipTimer);
    face=next;
    const isBack=next==='back';
    card.classList.toggle('flipped',isBack);
    front.inert=isBack;
    back.inert=!isBack;
    front.setAttribute('aria-hidden',String(isBack));
    back.setAttribute('aria-hidden',String(!isBack));
    const enableControls=()=>{
      yes.disabled=answered;no.disabled=answered;
      byId('organism-next').disabled=!answered;
      byId('organism-front-next').disabled=!answered;
      if(isBack&&!byId('plant-game-page').hidden)byId('organism-next').focus({preventScroll:true});
    };
    if(changed&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      yes.disabled=true;no.disabled=true;
      byId('organism-next').disabled=true;
      byId('organism-front-next').disabled=true;
      flipTimer=setTimeout(enableControls,540);
    }else enableControls();
  }
  function updateMode() {
    for(const key of ['plant','photo'])byId('mode-'+key).setAttribute('aria-pressed',String(key===mode));
    title.textContent=mode==='plant'?'Plant or not?':'Photosynthesis?';
    byId('organism-round-note').textContent=mode==='plant'?'Is it a land plant? Look closely, then choose.':'Can photosynthesis happen here? Count living photosynthetic partners, too.';
  }
  function render() {
    if(loading)return;
    clearEffects();
    const item=deck[position];
    answered=answers[position]!==undefined;
    updateMode();
    byId('organism-card-count').textContent=(item.bonus?'Bonus · ':'')+(position+1)+' / '+deck.length;
    const progress=byId('organism-progress');
    progress.max=deck.length;progress.value=position;
    setName('organism-common','organism-species',item);
    setName('organism-back-common','organism-back-species',item);
    const photo=byId('organism-photo');
    photo.src=assets[item.id].file;
    photo.alt=item.bonus?'Bulbasaur pixel sprite':item.name+' ('+item.species+')';
    photo.style.objectPosition=assets[item.id].position || 'center';
    photo.classList.toggle('pokemon-sprite',!!item.bonus);
    byId('organism-photo-wrap').classList.toggle('pokemon-frame',!!item.bonus);
    byId('organism-question').textContent=item.bonus?'Can Bulbasaur use photosynthesis?':mode==='plant'?'Is it a plant?':'Can photosynthesis happen here?';
    byId('organism-front-tag').textContent=mode==='plant'?'Plant or not?':'Photosynthesis?';
    byId('organism-front-tag').hidden=!!item.bonus;
    yes.disabled=answered;no.disabled=answered;
    byId('organism-front-next').hidden=!answered;
    byId('organism-hint').textContent=answered?'Answer checked. Continue when ready.':'Choose Yes or No to flip the card.';
    byId('organism-back-answer').textContent=answerText(item);
    byId('organism-explanation').textContent=item.explanation;
    byId('organism-fact-plant').textContent=item.plant?'Plant: Yes':'Plant: No';
    byId('organism-fact-plant').hidden=!!item.bonus;
    byId('organism-fact-photo').textContent=item.bonus?'Move: Synthesis':item.partner?'Photosynthesis: Algal partner':item.photo?'Photosynthesis: Yes':'Photosynthesis: No';
    const last=position===deck.length-1;
    byId('organism-next').textContent=last?'See score →':'Next card →';
    byId('organism-front-next').textContent=last?'See score →':'Next card →';
    setFace(answered?'back':'front');
  }
  function start(nextMode=mode,items=null) {
    clearEffects();mode=nextMode;
    deck=items || [...shuffle(cards.filter(c=>!c.bonus)),cards.find(c=>c.bonus)];
    position=0;answers=[];answered=false;
    byId('organism-live').textContent='';
    byId('organism-score').hidden=true;byId('organism-play').hidden=false;
    render();
  }
  function choose(value) {
    if(loading||answered||face!=='front')return;
    const correct=value===expected(deck[position]);
    answers[position]={chosen:value,correct};answered=true;
    byId('organism-result').textContent=correct?'✓ Correct':'× Not quite';
    byId('organism-result').className='organism-result '+(correct?'is-correct':'is-wrong');
    byId('organism-your-answer').textContent='You chose '+(value?'Yes':'No')+'.';
    byId('organism-live').textContent=(correct?'Correct. ':'Not quite. ')+answerText(deck[position])+' '+deck[position].explanation;
    render();
    byId('organism-next').focus({preventScroll:true});
    if(typeof window.feedback==='function')window.feedback(correct);
  }
  function finish() {
    clearEffects();
    const score=answers.filter(a=>a.correct).length;
    byId('organism-play').hidden=true;byId('organism-score').hidden=false;
    byId('organism-card-count').textContent=deck.length+' cards';
    byId('organism-score-value').textContent=score+' / '+deck.length;
    byId('organism-score-percent').textContent=Math.round(score/deck.length*100)+'%';
    byId('organism-score-message').textContent=score===deck.length?'Every card correct!':score>=deck.length*.7?'Good spotting. Take another look at the tricky ones.':'Some convincing disguises! Try again with what you’ve learned.';
    byId('organism-other-round').textContent=mode==='plant'?'Try the photosynthesis round':'Try the plant round';
    const list=byId('organism-missed');list.replaceChildren();
    deck.forEach((item,i)=>{
      if(answers[i].correct)return;
      const row=document.createElement('li');
      const name=document.createElement('strong');name.textContent=item.name;
      const answer=document.createElement('span');answer.textContent=answerText(item);
      row.append(name,answer);list.append(row);
    });
    byId('organism-missed-wrap').hidden=list.childElementCount===0;
    byId('organism-retry-missed').hidden=list.childElementCount===0;
    byId('organism-score-heading').focus({preventScroll:true});
    byId('organism-live').textContent='Round complete. '+score+' out of '+deck.length+' correct.';
  }
  function next() {
    if(!answered)return;
    if(position===deck.length-1){finish();return;}
    position++;render();
    byId('organism-question').focus({preventScroll:true});
  }
  yes.addEventListener('click',()=>choose(true));no.addEventListener('click',()=>choose(false));
  byId('organism-next').addEventListener('click',next);
  byId('organism-front-next').addEventListener('click',next);
  byId('organism-see-photo').addEventListener('click',()=>{clearEffects();setFace('front');byId('organism-front-next').focus({preventScroll:true});});
  byId('organism-restart').addEventListener('click',()=>{start();byId('organism-question').focus({preventScroll:true});});
  byId('organism-play-again').addEventListener('click',()=>{start();byId('organism-question').focus({preventScroll:true});});
  byId('organism-other-round').addEventListener('click',()=>{start(mode==='plant'?'photo':'plant');byId('organism-question').focus({preventScroll:true});});
  byId('organism-retry-missed').addEventListener('click',()=>{
    const missed=deck.filter((_,i)=>!answers[i].correct);start(mode,shuffle(missed));byId('organism-question').focus({preventScroll:true});
  });
  byId('mode-plant').addEventListener('click',()=>{if(mode!=='plant')start('plant');});
  byId('mode-photo').addEventListener('click',()=>{if(mode!=='photo')start('photo');});
  document.addEventListener('keydown',event=>{
    if(byId('plant-game-page').hidden||loading||byId('organism-play').hidden||event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA/.test(event.target.tagName))return;
    if(event.key==='ArrowRight'&&answered){event.preventDefault();next();}
    if(!answered&&event.key.toLowerCase()==='y'){event.preventDefault();choose(true);}
    if(!answered&&event.key.toLowerCase()==='n'){event.preventDefault();choose(false);}
  });
  const path=new URL('plant-game-assets/manifest.json',document.currentScript.src);
  async function load() {
    try {
      const response=await fetch(path);if(!response.ok)throw new Error('Images unavailable');
      assets=await response.json();
      for(const item of cards){if(!assets[item.id]?.file)throw new Error('Missing photograph');assets[item.id].file=new URL(assets[item.id].file,path).href;}
      loading=false;byId('organism-loading').hidden=true;byId('organism-play').hidden=false;
      start();
      const preload=deck.slice(0,3);for(const item of preload){const image=new Image();image.src=assets[item.id].file;}
    } catch {
      byId('organism-loading-message').textContent='The photographs couldn’t load. Please try again.';
      byId('organism-load-retry').hidden=false;
    }
  }
  byId('organism-load-retry').addEventListener('click',()=>{byId('organism-load-retry').hidden=true;byId('organism-loading-message').textContent='Loading photographs…';load();});
  byId('organism-photo').addEventListener('error',()=>{byId('organism-photo-status').hidden=false;});
  byId('organism-photo').addEventListener('load',()=>{byId('organism-photo-status').hidden=true;});
  window.plantGame={enter(){if(!loading)updateMode();}};
  load();
})();

