import {jeopardyCategories,allClues,finalChallenge} from './jeopardy-bank.js';
const ttl=12*60*60*1000;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>{const e=new Error(message);e.status=status;throw e};
const tokenOK=t=>typeof t==='string'&&/^[a-f0-9]{48}$/.test(t);
const clean=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=max?s.trim():null;
const active=r=>r.current==='final'?finalChallenge:allClues.find(c=>c.id===r.current);
const scoreState=r=>structuredClone({scores:r.teams.map(t=>t.score),used:r.used,current:r.current,phase:r.phase,buzz:r.buzz,excluded:r.excluded,deadline:r.deadline,final:r.final,control:r.control});
function view(r,host=false){
 const clue=active(r),shown=r.phase==='reveal'||r.phase==='ended';
 return {code:r.code,revision:r.revision,expires:r.expires,phase:r.phase,current:r.current,used:r.used,control:r.control,penalties:r.penalties,duration:r.duration,deadline:r.deadline,serverTime:Date.now(),teams:r.teams.map(t=>({...t})),players:r.players.map(p=>({id:p.id,name:p.name,team:p.team})),buzz:r.buzz,excluded:r.excluded,feedback:r.feedback||null,categories:jeopardyCategories.map(c=>({name:c.name,clues:c.clues.map(q=>({id:q.id,value:q.value}))})),clue:clue?{prompt:r.phase==='wager'&&!host?'':clue.prompt,value:r.current==='final'?null:clue.value,category:r.current==='final'?finalChallenge.category:jeopardyCategories.find(c=>c.clues.some(q=>q.id===r.current)).name,...(host||shown?{answer:clue.answer,note:clue.note}:{})}:null,final:r.final?{...((host||shown)?{wagers:r.final.wagers,answers:r.final.answers}:{}),submitted:Object.keys(r.final.answers).map(Number),wagered:Object.keys(r.final.wagers).map(Number),graded:r.final.graded}:null,...(host?{host:true,canUndo:!!r.undo}:{})};
}
export async function handleJeopardy(request,storage,isTeacher,readJson){
 const path=new URL(request.url).pathname,parts=path.split('/').filter(Boolean),method=request.method;
 try {
  if(parts.length===2){
   if(!isTeacher)return json({error:'Sign in as a teacher to host a game.'},401);
   if(method==='GET'){
    const rooms=await storage.list({prefix:'jeopardy:'});
    return json({teacher:true,rooms:[...rooms.values()].filter(r=>r.expires>Date.now()).map(r=>({code:r.code,phase:r.phase,players:r.players.length,created:r.created})).sort((a,b)=>b.created-a.created)});
   }
   const body=await readJson(request,3000);if(!body)fail('Invalid game settings.');
   return await storage.transaction(async txn=>{
    const rooms=await txn.list({prefix:'jeopardy:'});let count=0;
    for(const [key,room]of rooms)if(room.expires<=Date.now())await txn.delete(key);else count++;
    if(count>=20)fail('There are already 20 active games. End an older game first.',429);
    let code;for(let i=0;i<10;i++){code=String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);if(!await txn.get('jeopardy:'+code))break;code=null}if(!code)fail('Please try creating a game again.',503);
    const names=Array.isArray(body.names)?body.names:[];
    const r={code,created:Date.now(),expires:Date.now()+ttl,revision:0,teams:[0,1,2].map((id)=>({id,name:clean(names[id],24)||['Team DNA','Team Gametes','Team Zygote'][id],score:0})),players:[],phase:'lobby',current:null,used:[],control:0,buzz:null,excluded:[],deadline:null,duration:[20,30,45,60].includes(body.duration)?body.duration:30,penalties:body.penalties===true,ops:[],undo:null,final:null};
    await txn.put('jeopardy:'+code,r);return json(view(r,true),201);
   });
  }
  const code=parts[2];if(!/^\d{6}$/.test(code)||parts.length>3)fail('Game not found.',404);
  if(method==='GET'){
   const r=await storage.get('jeopardy:'+code);if(!r||r.expires<=Date.now())fail('This game has expired or does not exist.',404);
   // Host state is opt-in: a teacher can open the projector without exposing answers.
   const host=new URL(request.url).searchParams.get('host')==='1';if(host&&!isTeacher)fail('Teacher sign-in required.',401);
   return json(view(r,host));
  }
  const body=await readJson(request,5000);if(!body)fail('Invalid action.');
  return await storage.transaction(async txn=>{
   const r=await txn.get('jeopardy:'+code);if(!r||r.expires<=Date.now())fail('This game has expired or does not exist.',404);
   const action=body.action;
   if(['join','buzz','wager','answer'].includes(action)){
    if(!tokenOK(body.token))fail('Rejoin this game to reconnect.');
    let player=r.players.find(p=>p.token===body.token);
    if(action==='join'){
     if(player)return json({...view(r),me:player.id});
     if(r.phase!=='lobby')fail('Joining is closed. Ask your teacher to reopen the lobby.',409);
     if(r.players.length>=120)fail('This game is full.',409);
     const name=clean(body.name,24);if(!name||![0,1,2].includes(body.team))fail('Enter a nickname and select one of the three teams.');
     player={id:crypto.randomUUID(),token:body.token,name,team:body.team};r.players.push(player);
    }else{
     if(!player)fail('Join this game before playing.',401);
     if(action==='buzz'){
      if(r.phase!=='open'||r.deadline<=Date.now()||r.buzz||r.excluded.includes(player.team))fail('Buzzers are closed or your team has already tried.',409);
      r.buzz={team:player.team,player:player.id,name:player.name};r.deadline=null;r.phase='buzzed';
     }
     if(action==='wager'){
      if(r.phase!=='wager'||r.final.wagers[player.team]!==undefined)fail('Your team wager is already locked or wagering has closed.',409);
      if(!Number.isSafeInteger(body.amount)||body.amount<0||body.amount>Math.max(0,r.teams[player.team].score))fail('Wager a whole number between zero and your team score.');
      r.final.wagers[player.team]=body.amount;
     }
     if(action==='answer'){
      if(r.phase!=='final'||r.deadline<=Date.now()||r.final.answers[player.team]!==undefined)fail('Your team answer is already locked or time has ended.',409);
      const text=clean(body.text,120);if(!text)fail('Enter an answer of up to 120 characters.');r.final.answers[player.team]=text;
     }
    }
    r.revision++;await txn.put('jeopardy:'+code,r);return json({...view(r),me:player.id});
   }
   if(!isTeacher)fail('Teacher sign-in required.',401);
   if(typeof body.op!=='string'||body.op.length>80)fail('Invalid operation.');
   if(r.ops.includes(body.op))return json(view(r,true));
   if(body.revision!==r.revision)fail('The game changed. The latest state has been loaded; please try again.',409);
   const snapshot=scoreState(r);let keepUndo=true;
   switch(action){
    case 'start':if(!['lobby','board'].includes(r.phase))fail('Return to the board before starting.');r.phase='board';break;
    case 'lobby':if(!['board','lobby'].includes(r.phase))fail('Finish the current clue first.');r.phase='lobby';break;
    case 'pick':{
     if(r.phase!=='board')fail('Return to the board to choose a clue.');const clue=allClues.find(c=>c.id===body.id);if(!clue||r.used.includes(body.id))fail('Choose an unused clue.');
     r.current=body.id;r.phase='thinking';r.buzz=null;r.excluded=[];r.deadline=null;break;
    }
    case 'open':if(!['thinking','closed'].includes(r.phase)||!r.current||r.current==='final')fail('Choose an unrevealed clue first.');if(r.excluded.length===3)fail('Every team has tried this clue. Reveal the answer.');r.phase='open';r.deadline=Date.now()+r.duration*1000;break;
    case 'close':if(!['open','thinking'].includes(r.phase))fail('Buzzers are not open.');r.phase='closed';r.deadline=null;break;
    case 'judge':{
     if(r.phase!=='buzzed'||!r.buzz||typeof body.correct!=='boolean')fail('Wait for a team to buzz.');const team=r.buzz.team,value=active(r).value;
     if(body.correct){r.teams[team].score+=value;r.control=team;r.phase='reveal';if(!r.used.includes(r.current))r.used.push(r.current)}
     else {if(r.penalties)r.teams[team].score-=value;r.excluded.push(team);r.phase='closed';r.buzz=null}
     r.feedback={id:crypto.randomUUID(),correct:body.correct,team,delta:body.correct?value:r.penalties?-value:0,at:Date.now()};r.deadline=null;break;
    }
    case 'reveal':if(!r.current||r.current==='final'||!['thinking','open','closed','buzzed'].includes(r.phase))fail('Choose an unrevealed clue first.');r.phase='reveal';r.deadline=null;if(!r.used.includes(r.current))r.used.push(r.current);break;
    case 'board':if(r.phase!=='reveal'||r.current==='final')fail('Reveal the current clue before returning to the board.');r.phase='board';r.current=null;r.buzz=null;r.excluded=[];r.deadline=null;break;
    case 'adjust':if(![0,1,2].includes(body.team)||!Number.isSafeInteger(body.amount)||Math.abs(body.amount)>5000)fail('Choose a team and a whole-number adjustment up to 5,000 points.');r.teams[body.team].score+=body.amount;break;
    case 'undo':if(!r.undo)fail('Nothing to undo.');Object.assign(r,{...r.undo,teams:r.teams.map((t,i)=>({...t,score:r.undo.scores[i]}))});delete r.scores;r.undo=null;keepUndo=false;break;
    case 'final':if(r.phase!=='board')fail('Return to the board first.');r.current='final';r.phase='wager';r.final={wagers:{},answers:{},graded:[]};r.buzz=null;r.deadline=null;break;
    case 'final-start':if(r.phase!=='wager')fail('Open final wagering first.');for(let t=0;t<3;t++)r.final.wagers[t]??=0;r.phase='final';r.deadline=Date.now()+60000;break;
    case 'final-reveal':if(r.phase!=='final')fail('Start the final challenge first.');r.phase='reveal';r.deadline=null;break;
    case 'final-judge':if(r.current!=='final'||r.phase!=='reveal'||![0,1,2].includes(body.team)||typeof body.correct!=='boolean'||r.final.graded.includes(body.team))fail('This final response cannot be scored.');{const delta=(body.correct?1:-1)*r.final.wagers[body.team];r.teams[body.team].score+=delta;r.final.graded.push(body.team);r.feedback={id:crypto.randomUUID(),correct:body.correct,team:body.team,delta,at:Date.now()};}break;
    case 'end':r.phase='ended';r.deadline=null;r.expires=Math.min(r.expires,Date.now()+60*60*1000);break;
    default:fail('Unknown game action.');
   }
   if(['pick','open','reveal','board','undo','final','final-start','final-reveal','end'].includes(action))r.feedback=null;
   if(keepUndo)r.undo=snapshot;r.ops.push(body.op);r.ops=r.ops.slice(-100);r.revision++;await txn.put('jeopardy:'+code,r);return json(view(r,true));
  });
 }catch(error){if(error.status)return json({error:error.message},error.status);throw error}
}
