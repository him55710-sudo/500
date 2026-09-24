import './style.css';
import {initPrologue} from './prologue.js';
import {cutCardMarkup,revealCutCard,steakPhotoMarkup} from './food-art.js';
import './heaven.css';
import './scene-clarity.css';
import './transfer.css';
import './kitchen.css';
import './rescue.css';
import {loadRescue,rescueObjectives} from './rescue-state.js';
import {loadKitchen} from './kitchen-state.js';
import {recipes,recipeKeys,ingredients} from './kitchen-data.js';
import {memoryPhotos} from './memory-data.js';
import {letterMarkup,hintMarkup,hintCardMarkup,journalMarkup} from './story-ui.js';
import {Soundscape} from './audio.js';
import {initialState,transition,loadState,SAVE_KEY,objectives,hints} from './state.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const sound=new Soundscape();
let state=initialState(),saved=null,started=false,modalType=null,toastTimer,subtitleTimer,dragging=false,lastX=0,lastY=0,focusReturn=null;
const settings={volume:.65,sensitivity:1,scares:true,motion:true,quality:'auto',voice:false,speed:1,version:2};
try{saved=loadState(localStorage.getItem(SAVE_KEY));const old=JSON.parse(localStorage.getItem('hayoung500.settings')||'{}');Object.assign(settings,old);if(old.version!==2){settings.quality='auto';settings.version=2;}}catch{}
const itemLabels={violin:'바이올린 키링',carousel:'회전목마',bench:'나무 평상',beef:'고기 모형'};
const itemIcons={violin:'♬',carousel:'♜',bench:'▤',beef:'◈'};
let world;
let kitchen;
let rescue;
let heavenPreview=false;
const revealedHints=new Map();
function errorScreen(e){$('#loading').hidden=false;$('#loading-label').textContent='3D 방을 불러오지 못했어요. 새로고침해 주세요. '+e.message;$('#welcome').hidden=true;console.error(e);}
let worldPromise;
async function ensureWorld(){
 if(!worldPromise)worldPromise=(async()=>{const {World}=await import('./world.js');world=new World($('#scene'),v=>{$('#load-progress').style.width=`${Math.min(99,v*100)}%`;});await world.ready;applySettings();world.sync(state,false);installTestHooks();rafDirection=world.player.clone();return world;})();
 return worldPromise;
}

function save(){if(heavenPreview)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{toast('이 브라우저에서는 저장을 사용할 수 없어요. 현재 플레이는 계속할 수 있어요.');}}
function saveSettings(){try{localStorage.setItem('hayoung500.settings',JSON.stringify(settings));}catch{}}
function applySettings(){sound.setVolume(settings.volume);if(world){world.sensitivity=settings.sensitivity;world.speedScale=settings.speed;world.motion=settings.motion;world.setQuality(settings.quality);}}
function toast(text){if(!text)return;$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5000);}
function subtitle(text,duration=7000){$('#subtitle').textContent=text;clearTimeout(subtitleTimer);subtitleTimer=setTimeout(()=>$('#subtitle').textContent='',duration);if(settings.voice&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.94;u.volume=settings.volume*.8;speechSynthesis.speak(u);}}
function updateHUD(){
 if(world.mode==='rescue'){
  const s=state.rescue;$('#objective-label').textContent='DAY 201 — 300 · SAVE HYUNSU';$('#objective-text').textContent=rescueObjectives[s.room];
  $('#progress').innerHTML=[s.healed,s.warmed,s.fed,s.completed].map(done=>'<i class="'+(done?'done':'')+'"></i>').join('');
  $('#inventory').replaceChildren();for(const item of [s.medicine?'현수의 약':null,s.paid.length&&!s.warmed?'계산한 쇼핑백':null,s.board?'텍사스 vs 브라질 이름판':null,s.holding?'현수의 손을 잡고 있어 ♡':null].filter(Boolean)){const el=document.createElement('span');el.className='bag-chip';el.textContent=item;$('#inventory').appendChild(el);}
  $('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';document.body.classList.remove('dark');return;
 }

 if(world.mode==='kitchen'){
  const s=state.cooking,complete=recipeKeys.filter(k=>s.progress[k]>=recipes[k].steps.length).length;
  $('#objective-label').textContent='DAY 200 · '+(s.lights?'OUR FOUR KITCHENS':'FIND THE FIRST LIGHT');
  $('#objective-text').textContent=!s.lights?'어둠 속 연두색 7호선 노선도를 찾아 E로 살펴봐.':s.completed?'네 가지 요리가 완성됐어. 다음 기억으로 향하는 문을 찾아봐.':`중앙 마트에서 재료를 챙기고 네 요리방을 완성해 줘. ${complete} / 4`;
  $('#progress').innerHTML=recipeKeys.map(k=>`<i class="${s.progress[k]>=recipes[k].steps.length?'done':''}"></i>`).join('');
  $('#inventory').replaceChildren();for(const [key,count] of Object.entries(s.bag)){const el=document.createElement('span');el.className='bag-chip';el.textContent=ingredients[key][0]+' ×'+count;$('#inventory').appendChild(el);}
  $('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';document.body.classList.toggle('dark',!s.lights);return;
 }

 if(world.mode==='coaster'||world.mode==='rotunda'){
  $('#objective-label').textContent=world.mode==='coaster'?'ON OUR WAY TO MEMORY 02':'CHAPTER 02 · THE CIRCULAR ROOM';
  $('#objective-text').textContent=world.mode==='coaster'?'V로 탑승 시점 전환 · Esc로 일시정지': '큰 원형 홀을 자유롭게 걸어 봐. 반대편 입구는 헬로키티 공주방으로 이어져.';
  $('#progress').innerHTML='';$('#inventory').replaceChildren();$('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';return;
 }
 if(world.mode==='heaven'){
  $('#objective-label').textContent='A LITTLE HEAVEN FOR HAYOUNG';$('#objective-text').textContent='이제는 네가 좋아하는 것들로 가득한 곳. 인형과 액자, 선물을 E로 살펴봐.';
  $('#progress').innerHTML='';$('#inventory').replaceChildren();$('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';return;
 }
 const obj=objectives[state.stage];$('#objective-label').textContent=`MEMORY ${String(Math.min(state.stage+1,8)).padStart(2,'0')} / 08`;
 $('#objective-text').textContent=state.stage===0&&state.letterRead?'편지 속 단서로 책상의 자물쇠를 열어 보자.':obj[1];
 $('#progress').innerHTML=Array.from({length:8},(_,i)=>`<i class="${i<state.stage?'done':i===state.stage?'current':''}"></i>`).join('');
 $('#inventory').replaceChildren();for(const item of state.inventory){let b=document.createElement('button');b.className=item===state.selected?'active':'';b.textContent=`${itemIcons[item]} ${itemLabels[item]}`;b.setAttribute('aria-label',itemLabels[item]+' 선택');b.onclick=()=>dispatch({type:'select',item});$('#inventory').appendChild(b);}
 $('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';
}
function dispatch(e){
 const result=transition(state,e);if(!result.ok){sound.effect('error');toast(result.message);return result;}
 const prior=state.stage;state=result.state;save();updateHUD();world.sync(state);if(result.message)toast(result.message);
 if(result.effect==='music'){sound.startMusic();subtitle('♬ 인생의 회전목마 — 선반 쪽에서 음악 소리가 들린다.');}
 else if(result.effect==='reveal'){sound.effect('reveal');if(settings.scares){setTimeout(()=>{sound.effect('scare');$('#flash').classList.add('active');setTimeout(()=>$('#flash').classList.remove('active'),220);},500);}subtitle('“우리 추억을… 얼마나 기억하는지 한번 보자.”');}
 else if(result.effect==='painting'){sound.effect('painting');subtitle('“뭐… 많이 나아졌네. 이 그림을 어디서 그렸는지도 기억할까?”',8000);}
 else if(result.effect==='hatch'){sound.effect('hatch');subtitle(e.type==='open-safe'?'금고 안에는 작은 바이올린 키링이 놓여 있다. 네 생일을 위해 준비했던 첫 선물.':'“용케도 맞췄네… 500일은 기억도 못하면서… 100일 기념일은 기억하냐?”',9000);}
 else if(result.effect==='steaks'){sound.effect('steaks');subtitle('“예상 외로군… 그럼 더 맛있는 스테이크를 골라라!”');}
 else if(result.effect==='door'){sound.effect('door');subtitle('“역시 내 스테이크지? …사실, 너랑 먹어서 더 맛있었어.”',9000);}
 else if(result.effect==='complete')showEnding();else if(result.effect)sound.effect(result.effect);
 return result;
}
function showModal(type,kicker,title,html){
 kitchen?.closeView();
 modalType=type;focusReturn=document.activeElement;if(world){world.active=false;world.keys.clear();}dragging=false;if(document.pointerLockElement)document.exitPointerLock();
 $('#modal').dataset.kind=type;$('#modal').classList.add('story-dialog');$('#modal-backdrop').classList.add('story-backdrop');$('#modal').scrollTop=0;
 $('#modal-kicker').textContent=kicker;$('#modal-title').textContent=title;$('#modal-body').innerHTML=html;$('#modal-backdrop').hidden=false;$('#resume-capture').hidden=true;$('#prompt').hidden=true;
 if(type==='pause'||type==='settings')sound.pause(true);
 requestAnimationFrame(()=>$('#modal').querySelector('button:not(.close),input,select')?.focus());
}
function closeModal(){
 if(modalType==='ending'){return;}
 kitchen?.closeView();
 const old=modalType;modalType=null;lastHit=null;$('#modal-backdrop').hidden=true;if(world){world.active=started;world.keys.clear();}if(started){sound.pause(false);$('#resume-capture').hidden=!!document.pointerLockElement;}
 if(focusReturn?.isConnected&&focusReturn!==document.body)focusReturn.focus();
}
function resume(){closeModal();if(started)capture();}
async function capture(){if(!started||modalType)return;try{await $('#scene').requestPointerLock();}catch{$('#resume-capture').textContent='우클릭 드래그로 둘러보기 · 방향키도 가능';}if(modalType){if(document.pointerLockElement)document.exitPointerLock();return;}world.active=true;}
async function startGame(continuing=false){
 $('#start').disabled=true;$('#continue').disabled=true;$('#loading').hidden=false;
 await sound.start();try{await ensureWorld();}catch(e){errorScreen(e);return;}
 $('#loading').hidden=true;prev=performance.now();if(!started)requestAnimationFrame(loop);

 state=continuing&&saved?saved:initialState();if(!continuing)world.player.set(0,0,4.05);world.yaw=0;world.pitch=-.08;started=true;world.started=true;world.active=true;world.toggleView(false);world.sync(state,false);$('#welcome').hidden=true;$('#hud').hidden=false;
 await sound.start();applySettings();if(state.stage>=3)sound.startMusic();updateHUD();save();
 if(state.completed&&state.location==='rescue')await enterRescueChapter(false);else if(state.completed&&state.location==='heaven')await enterPrincess(false);else if(state.completed&&['rotunda','kitchen'].includes(state.location))await arriveRotunda();else if(state.completed&&state.location==='coaster')await travelToRoomTwo();else if(state.completed)showEnding();else{capture();subtitle('하영아. 방탈출을 풀며 우리의 추억을 잘 떠올려봐. 먼저 책상 위 편지부터.',7500);}
}
async function travelToRoomTwo(){
 modalType='travel';$('#modal-backdrop').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='다음 기억으로 가는 열차를 준비하고 있어요…';world.active=false;world.keys.clear();
 try{
  const {beginTransfer}=await import('./transfer.js');
  await beginTransfer(world,{onStatus:text=>subtitle(text,12000),onArrive:arriveRotunda,onSound:(speed,phase,dt)=>sound.updateRide(speed,phase,dt)});
  state.location='coaster';save();sound.setRide(true);sound.pause(false);document.body.classList.remove('heaven');document.body.classList.add('coaster');
  $('.chapter .eyebrow').textContent='BETWEEN OUR MEMORIES';$('.chapter span:last-child').textContent='블랙홀 2000 · 두 번째 방으로';
  $('#loading').hidden=true;modalType=null;lastHit=null;prev=performance.now();world.active=true;world.started=true;updateHUD();installTestHooks();capture();
 }catch(e){errorScreen(e);}
}
async function arriveRotunda(){
 modalType='travel';$('#modal-backdrop').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='200일의 요리방을 준비하고 있어요…';world.active=false;
 try{
  state.cooking=loadKitchen(state.cooking);const [{enterKitchen},{KitchenController}]=await Promise.all([import('./kitchen-world.js'),import('./kitchen-ui.js')]);
  await enterKitchen(world,state.cooking);sound.setRide(false);sound.setKitchen(true);sound.pause(false);
  kitchen=new KitchenController({world,getState:()=>state.cooking,setState:s=>{const wasComplete=state.cooking.completed;state.cooking=s;if(s.completed&&!wasComplete)state.journal.push('200일 · 칠리새우 볶음밥, 반반 닭다리 도시락, 작은 새우 도시락과 수제 빼빼로. 함께 먹을 한 끼를 정성껏 준비했다.');save();updateHUD();},showModal,closeModal,toast,sound,onExit:()=>enterRescueChapter(heavenPreview)});
  state.location='kitchen';save();document.body.classList.remove('coaster','heaven');document.body.classList.add('kitchen');
  $('.chapter .eyebrow').textContent='CHAPTER 02 · DAY 200';$('.chapter span:last-child').textContent='우리의 네 가지 식탁';
  $('#loading').hidden=true;$('#hud').hidden=false;modalType=null;lastHit=null;prev=performance.now();world.active=true;world.started=true;updateHUD();installTestHooks();capture();subtitle(state.cooking.lights?'다시 왔네. 준비하던 한 끼를 이어서 완성해 보자.':'불이 꺼져 있어. 현수가 수학을 가르치던 세 역의 기억이 필요해.',8500);
 }catch(e){errorScreen(e);}
}
async function enterRescueChapter(preview=heavenPreview){
 heavenPreview=preview;modalType='travel';$('#modal-backdrop').hidden=true;$('#welcome').hidden=true;$('#hud').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='201~300일, 현수를 구할 기억들을 준비하고 있어요…';if(world){world.active=false;world.keys.clear();}if(document.pointerLockElement)document.exitPointerLock();
 try{await sound.start();await ensureWorld();state.rescue=loadRescue(state.rescue);const [{enterRescue},{RescueController}]=await Promise.all([import('./rescue-world.js'),import('./rescue-ui.js')]);await enterRescue(world,state.rescue);
 rescue=new RescueController({world,getState:()=>state.rescue,setState:s=>{const before=state.rescue;state.rescue=s;for(const [key,note] of [['healed','대상 트로피 사이에서 약을 찾아 아픈 현수에게 주었다.'],['warmed','남색 폴로 니트 집업과 TOMBOY 코트로 현수를 따뜻하게 해 주었다.'],['fed','텍사스와 브라질의 핀으로 가고 싶던 식당을 맞혔다.'],['completed','규모 6.2의 지진. 손을 꼭 잡고 함께 400일 방으로 탈출했다.']])if(s[key]&&!before[key])state.journal.push('201~300일 · '+note);save();updateHUD();},showModal,closeModal,toast,subtitle,sound,onBonus:()=>enterPrincess(heavenPreview)});
 state.stage=8;state.completed=true;state.location='rescue';save();if(!started)requestAnimationFrame(loop);started=true;world.started=true;world.active=true;modalType=null;lastHit=null;prev=performance.now();
 document.body.classList.remove('coaster','kitchen','heaven','dark');document.body.classList.add('rescue');$('.chapter .eyebrow').textContent='CHAPTER 03 · DAY 201 — 300';$('.chapter span:last-child').textContent='현수를 구해라';sound.setKitchen(false);sound.setRide(false);sound.setHeaven(false);sound.musicActive=false;sound.musicFile?.pause();sound.pause(false);applySettings();$('#loading').hidden=true;$('#hud').hidden=false;updateHUD();installTestHooks();capture();subtitle('하영아, 이번에는 네가 나를 구해 줄 차례야. 아프고 춥고 배고팠던 그날들을 기억해 줘.',8500);
 }catch(e){errorScreen(e);}
}

async function enterPrincess(preview=false){
 heavenPreview=preview;modalType='travel';$('#modal-backdrop').hidden=true;$('#welcome').hidden=true;$('#hud').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='하영이만을 위한 구름 위 공주방을 준비하고 있어요…';
 if(world){world.active=false;world.keys.clear();}if(document.pointerLockElement)document.exitPointerLock();
 try{
  await sound.start();await ensureWorld();const {enterHeaven}=await import('./heaven.js');
  await enterHeaven(world,v=>$('#load-progress').style.width=`${Math.min(99,v*100)}%`);
  if(!started)requestAnimationFrame(loop);started=true;world.started=true;world.active=true;modalType=null;lastHit=null;prev=performance.now();
  document.body.classList.remove('coaster','kitchen','dark','rescue');if($('#rescue-alert'))$('#rescue-alert').hidden=true;rescue?.audio.pause();document.body.classList.add('heaven');sound.setKitchen(false);sound.setRide(false);$('#loading').hidden=true;$('#hud').hidden=false;
  $('.chapter .eyebrow').textContent='AFTER THE ESCAPE';$('.chapter span:last-child').textContent='하영이의 구름 위 공주방';
  if(!preview){state.location='heaven';save();}applySettings();sound.setHeaven(true);sound.pause(false);updateHUD();installTestHooks();capture();
  subtitle('놀랐지? 여기는 하영이가 좋아하는 것들로만 채운 방이야. 500일 동안 함께해 줘서 고마워.',11000);
 }catch(e){errorScreen(e);}
}
function heavenInteract(id){
 sound.effect('chime');
 if(id==='heaven-gift')showModal('gift','500 DAYS, STILL YOU','하영이만을 위한 선물',`<div class="letter-paper">하영아,<br><br>삐친 척하느라 힘들었지?<br>우리의 추억을 하나씩 찾아와 줘서 고마워.<br><br>이번에는 네가 좋아하는 것으로만 채워 봤어.<br>분홍색 리본, 포근한 인형, 그리고 헬로키티까지.<br><br><strong>500일 동안 함께해 줘서 고마워.<br>앞으로도 내 옆에서 많이 웃어 줘.</strong><span class="signature">— 현수가</span></div>`);
 else if(id==='heaven-kitty'){showModal('kitty','A VERY SOFT HUG','공주 헬로키티를 꼭 안아 주기',`<div class="kitty-photo" style="background-position:0 0"></div><p class="body-copy">하영이가 좋아하는 헬로키티.<br>여기서는 한참 쉬어 가도 괜찮아.</p><button id="hug-kitty" class="primary">포근하게 안아 주기 ♡</button>`);$('#hug-kitty').onclick=()=>{closeModal();sound.effect('chime');subtitle('꼬옥— 오늘의 공주님은 정하영. ♡',6000);};}
 else if(id==='heaven-music'){world.heavenMusic=!world.heavenMusic;sound.heavenMusic=world.heavenMusic;toast(world.heavenMusic?'별빛 오르골을 켰어요.':'오르골을 잠시 쉬게 했어요.');}
 else if(id.startsWith('heaven-photo-')){const i=+id.split('-').at(-1);showModal('gallery','HELLO KITTY GALLERY',['분홍 드레스를 입은 공주','구름 위에서 보내는 하트','달콤한 오후의 티타임','함께라서 더 포근한 날'][i],`<div class="kitty-photo" style="background-position:${i%2?100:0}% ${i>1?100:0}%"></div>`);}
 else if(id==='heaven-return'){if(!heavenPreview){state.location='salon';save();}location.reload();}
}
function showLetter(){
 dispatch({type:'read-letter'});sound.effect('paper');showModal('letter','THE 500TH MEMORY / LETTER 01','하영에게 남긴 편지',letterMarkup());$('#letter-close').onclick=resume;$('#letter-help').onclick=showHint;
}
const dialChars=['ABCDEFGHIJKLMNOPQRSTUVWXYZ','ABCDEFGHIJKLMNOPQRSTUVWXYZ','ABCDEFGHIJKLMNOPQRSTUVWXYZ','ABCDEFGHIJKLMNOPQRSTUVWXYZ','0123456789','0123456789','0123456789'];
let dialValues=[0,0,0,0,0,0,0];
function showLock(){
 if(state.stage>0){toast('철컥. 자물쇠는 이미 열려 있다.');return;}
 showModal('lock','PUZZLE 00 · THE ALTERNATIVE','오늘부터 다른 거 마실 거야',`<p class="body-copy">편지에 남긴 현수의 말. 그가 새로 고른 음료는 무엇일까?</p><div class="padlock"><div class="shackle"></div><div class="lock-case"><span class="lock-label">LETTERS · 4 &nbsp; / &nbsp; NUMBERS · 3</span><div class="dial-row">${dialChars.map((ch,i)=>`<div class="dial" data-index="${i}"><button class="dial-up" data-i="${i}" aria-label="${i+1}번째 휠 증가">⌃</button><output id="dial-${i}" aria-live="polite">${ch[dialValues[i]]}</output><button class="dial-down" data-i="${i}" aria-label="${i+1}번째 휠 감소">⌄</button></div>`).join('')}</div></div></div><p class="notice">위·아래 버튼 또는 각 휠 위에서 마우스 휠로 돌릴 수 있다.</p><div class="puzzle-error" id="lock-error" role="status"></div><div class="modal-actions"><button id="try-lock" class="primary">자물쇠 당겨 보기 <span>↗</span></button><button id="re-read" class="secondary">편지 다시 읽기</button></div>`);
 const turn=(i,delta)=>{dialValues[i]=(dialValues[i]+delta+dialChars[i].length)%dialChars[i].length;$(`#dial-${i}`).textContent=dialChars[i][dialValues[i]];sound.effect('dial');};
 $$('.dial-up').forEach(b=>b.onclick=()=>turn(+b.dataset.i,1));$$('.dial-down').forEach(b=>b.onclick=()=>turn(+b.dataset.i,-1));$$('.dial').forEach(d=>d.addEventListener('wheel',e=>{e.preventDefault();turn(+d.dataset.index,e.deltaY<0?1:-1);},{passive:false}));
 $('#try-lock').onclick=()=>{const r=dispatch({type:'lock',code:dialValues.map((v,i)=>dialChars[i][v]).join('')});if(r.ok)resume();else $('#lock-error').textContent=r.message;};$('#re-read').onclick=showLetter;
}
let sequence=[];
function showFrames(){
 if(state.framesSolved&&state.stage===1){showSafe();return;}
 if(state.stage!==1){toast(state.stage>1?'네 장의 추억은 모두 제자리를 찾았다.':'액자 앞에 벨벳 덮개가 내려와 있다.');return;}
 sequence=[];
 showModal('frames','PUZZLE 01 · OUR TIMELINE','처음부터, 차례대로',`<p class="body-copy">네 장의 액자, 서로 다른 네 번의 추억.<br>사진과 액자에 담긴 날들을 <b>오래된 기억부터</b> 눌러 보자.</p><div class="frame-buttons">${[['red','빨강','100일 홍대','♥','#b55b57'],['yellow','노랑','잣절','☀','#c9ab4e'],['green','초록','현수 생일','✦','#5e9973'],['blue','파랑','필리핀','≈','#588dae']].map(([id,name,title,icon,col])=>`<button class="frame-choice" data-color="${id}" style="--frame:${col}"><span class="frame-icon">${memoryPhotos[['red','yellow','green','blue'].indexOf(id)]?`<img class="memory-photo" src="${memoryPhotos[['red','yellow','green','blue'].indexOf(id)]}" alt="${title}">`:icon}</span><b>${title}</b><small>${name} 테두리</small></button>`).join('')}</div><div class="sequence" id="sequence"></div><p id="frame-error" class="puzzle-error" role="status"></p><button id="sequence-reset" class="secondary">순서 다시 누르기</button>`);
 const draw=()=>$('#sequence').innerHTML=Array.from({length:4},(_,i)=>`<span>${sequence[i]?({red:'빨강',yellow:'노랑',green:'초록',blue:'파랑'})[sequence[i]]:i+1}</span>`).join('');draw();
 $$('.frame-choice').forEach(b=>b.onclick=()=>{if(sequence.length===4)sequence=[];sequence.push(b.dataset.color);sound.effect('dial');draw();if(sequence.length===4){const r=dispatch({type:'frames',order:sequence});if(r.ok){resume();subtitle('“2025년 5월 14일. 너의 생일을 위해 준비한, 나의 첫 선물.”',8000);}else $('#frame-error').textContent=r.message;}});$('#sequence-reset').onclick=()=>{sequence=[];draw();$('#frame-error').textContent='';};
}
function showSafe(){
 if(!state.framesSolved||state.stage!==1){toast('아직 액자 뒤 금고에 닿을 수 없어.');return;}
 showModal('safe','A GIFT BEHIND THE MEMORY','초록 액자 뒤의 작은 금고',state.safeOpen?`<img class="keepsake-photo" src="/assets/memories/violin-keyring.png" alt="실제 바이올린 키링"><p class="body-copy">2025년 5월 14일.<br>하영의 생일을 위해 준비했던 현수의 첫 선물.</p><button id="take-violin" class="primary">바이올린 키링 꺼내기</button>`:`<p class="body-copy">추억의 순서가 맞자 금고의 잠금이 풀렸다.<br>손잡이를 돌려 안을 살펴보자.</p><button id="open-memory-safe" class="primary">금고 손잡이 돌리기</button>`);
 if($('#open-memory-safe'))$('#open-memory-safe').onclick=()=>{dispatch({type:'open-safe'});showSafe();};
 if($('#take-violin'))$('#take-violin').onclick=()=>{dispatch({type:'take-violin'});resume();};
}
function showDoll(id){
 const correct=id==='violinist',has=state.inventory.includes('violin');
 if(state.stage>=3){subtitle('♬ 인생의 회전목마 — 음악이 들리는 선반을 찾아보자.');return;}
 showModal('doll','PUZZLE 02 · THE FIRST GIFT',correct?'비어 있는 두 손':'또 다른 음악 인형',`<div class="item-drawing">${correct?'<img class="keepsake-photo" src="/assets/memories/violin-keyring.png" alt="바이올린 키링">':'♟'}</div><p class="body-copy">${correct?'한쪽 팔을 턱 밑으로 올리고, 다른 팔은 활을 켜듯 들고 있다. 손에 꼭 맞을 작은 악기가 필요해 보인다.':'지휘봉을 들거나 발레 자세를 취한 인형이다. 이 자세에는 바이올린이 잘 맞지 않아 보인다.'}</p>${has?'<p class="notice">가진 물건 · 바이올린 키링<br>2025 / 05 / 14 — 하영의 생일을 위해 준비한 현수의 첫 선물.</p><div class="modal-actions"><button id="give-violin" class="primary">바이올린 키링 건네기</button></div>':'<p class="notice">아직 건넬 물건이 없다.</p>'}<p id="doll-error" class="puzzle-error" role="status"></p>`);
 if(has)$('#give-violin').onclick=()=>{const r=dispatch({type:'give-violin',doll:id});if(r.ok)resume();else $('#doll-error').textContent=r.message;};
}
function showCarousel(){
 if(state.stage===3){showModal('carousel','PUZZLE 03 · MERRY-GO-ROUND','음악이 머무는 곳',`<div class="item-drawing">♜</div><p class="body-copy">작은 말들이 빙글빙글 돌아간다.<br>바이올린의 선율과 맞춰 움직이는 회전목마.<br>이 작은 놀이기구가 어울릴 곳이 있을까?</p><p class="notice">곡 단서 · 인생의 회전목마${sound.musicFile?'':'<br>현재는 임시 왈츠가 재생 중이다. 설정에서 보유한 실제 음원을 선택할 수 있다.'}</p><div class="modal-actions"><button id="take-carousel" class="primary">회전목마 집어 들기</button></div>`);$('#take-carousel').onclick=()=>{dispatch({type:'take-carousel'});resume();};}
 else toast('아직 멈춰 있는 작은 회전목마다.');
}
function showPainting(){
 const placed=state.stage>=5;
 showModal('painting','PUZZLE 04 · YOUR LITTLE WORLD',placed?'그림을 그렸던 그 장소':'놀이공원에 빠진 것',`<img class="painting-photo" src="/assets/memories/hayoung-painting.png" alt="하영이 그린 놀이공원"><p class="letter-paper">${placed?'뭐… 딱히 마음에 들지는 않지만 그래도 많이 나아졌네…<br><br>그치만 너는 저 장소가 어딘지도 모를 거야.<br>다음 장소에나 들어가야 기억하겠지….<br>너는 항상 기억을 하지 못했어, 나와의 추억을….<br><br>이 그림이 어디서 창작되었는지도 모르겠지<br>ㅋㅋㅋㅋ……ㅜㅠㅠㅠ':'한때 나는 너의 그림마저 사랑했어…<br>근데 지금 다시 생각하면 아니야…..<br>넌 그림을 참 못 그려….<br><br><strong>놀이공원에 이런 것 하나 없다니….</strong>'}</p>${state.inventory.includes('carousel')?'<div class="modal-actions"><button id="place-carousel" class="primary">빈 놀이공원에 회전목마 놓기</button></div>':''}${placed?'<p class="notice">바닥에는 1~9가 적힌 타일, 방 안에는 옮길 수 있는 평상이 있다.</p>':''}`);
 if($('#place-carousel'))$('#place-carousel').onclick=()=>{dispatch({type:'place-carousel'});showPainting();};
}
function showCow(){
 if(state.stage<6){toast('부위 이름마다 덮개가 씌워져 있다. 여기에 올릴 무언가가 필요해 보인다.');return;}
 if(state.stage>6){toast('살치살. 100일 홍대에서의 저녁을 기억했다.');return;}
 const cuts=['안심','살치살','등심','채끝','우둔살','갈비'],revealed=new Set();
 showModal('cow','PUZZLE 06 · THE TASTE OF DAY 100','그날, 우리가 먹었던 부위',`<p class="body-copy">“500일은 기억도 못하면서… 100일 기념일은 기억하냐?”<br>고기의 모양과 결을 살펴보자. 이름 덮개를 열고, 같은 칸을 다시 눌러 고기 모형을 놓자.</p><div class="cuts">${cuts.map(cutCardMarkup).join('')}</div><p id="cut-error" class="puzzle-error" role="status"></p><p class="notice">가진 물건 · 고기 모형. 정답이 아니면 다시 다른 부위에 놓을 수 있다.</p><p class="food-image-note">부위별 실제 사진을 참고해 만든 재현 이미지입니다.</p>`);
 $$('.cut').forEach(b=>b.onclick=()=>{const cut=b.dataset.cut;if(!revealed.has(cut)){revealed.add(cut);revealCutCard(b,cut);sound.effect('paper');}else{const r=dispatch({type:'place-beef',cut});if(r.ok)resume();else $('#cut-error').textContent=r.message;}});
}
function showSteaks(){
 if(state.stage!==7){toast(state.stage>7?'현수의 스테이크에 남긴 한 표.':'아직 접시를 덮고 있는 뚜껑이 열리지 않는다.');return;}
 showModal('steaks','PUZZLE 07 · A VERY FAIR VOTE','더 맛있는 스테이크는?',`<p class="body-copy">“아니… 이 문제를 맞추다니, 예상 외로군….<br>그럼 두 개의 스테이크 중 더 맛있는 것을 골라라.”</p><div class="taste-grid">${[['hyunsu','현수의 스테이크','정성을 담은 집밥'],['alpero','홍대 알페로 스테이크','100일의 특별한 저녁']].map(([id,title,desc])=>`<div class="taste-card">${steakPhotoMarkup(id)}<p>${title}</p><small>${desc}</small><button class="secondary taste" data-which="${id}">${state.tasted.includes(id)?'✓ 시식 완료 · 다시 맛보기':'E · 한 입 시식하기'}</button></div>`).join('')}</div><div id="vote-area" class="modal-actions" ${state.tasted.length!==2?'hidden':''}><button id="vote-hyunsu" class="primary">현수의 스테이크에 투표</button><button id="vote-alpero" class="secondary">알페로에 투표</button></div><p id="vote-message" class="puzzle-error" role="status">${state.tasted.length<2?'두 접시를 모두 맛보면 투표할 수 있다.':''}</p><p class="food-image-note">게임을 위한 재현 이미지이며 실제 식당·기념일 식사 사진은 아닙니다.</p>`);
 $$('.taste').forEach(b=>b.onclick=()=>{const r=dispatch({type:'taste',which:b.dataset.which});b.textContent='✓ 시식 완료 · 다시 맛보기';$('#vote-message').textContent=r.message;if(state.tasted.length===2)$('#vote-area').hidden=false;});
 $('#vote-hyunsu').onclick=()=>{const r=dispatch({type:'vote',which:'hyunsu'});if(r.ok)resume();};$('#vote-alpero').onclick=()=>{const r=dispatch({type:'vote',which:'alpero'});$('#vote-message').textContent=r.message;};
}
function interact(){
 if(!started||modalType||!world.hit)return;const {id}=world.hit;
 if(world.mode==='rescue'){rescue.interact(id);return;}
 if(world.mode==='kitchen'){kitchen.interact(id);return;}
 if(world.mode==='rotunda'){if(id==='rotunda-princess')enterPrincess(false);else if(id==='rotunda-return')travelToRoomTwo();return;}
 if(world.mode==='heaven'){heavenInteract(id);return;}
 if(id==='letter')showLetter();else if(id==='lock')showLock();else if(id==='frames')showFrames();else if(id==='memory-safe')showSafe();else if(['violinist','bear','dancer'].includes(id))showDoll(id);else if(id==='carousel')showCarousel();else if(id==='painting')showPainting();else if(id==='bench')dispatch({type:'take-bench'});else if(id.startsWith('tile'))dispatch({type:'place-bench',tile:+id.slice(4)});else if(id==='cow')showCow();else if(id==='steaks')showSteaks();else if(id==='exit'){if(state.stage===8&&world.doorHinge.rotation.y> -1.55)toast('문이 열리고 있어요. 잠시만 기다려 줘.');else dispatch({type:'exit'});}
}
function showJournal(){showModal('journal','OUR MEMORY BOOK','잊지 않으려고, 적어 둔 것들',journalMarkup(state.journal));$('#journal-close').onclick=resume;}
function showHint(){
 if(world?.mode==='rescue'){rescue.hint();return;}
 if(world?.mode==='kitchen'){showModal('hint','200 DAYS · HINT','현수에게 물어보기',`<p class="body-copy">${state.cooking.lights?'중앙 마트에서 재료를 챙긴 뒤, 12시 칠리새우 · 3시 치킨 · 6시 작은 새우 · 9시 빼빼로를 만들어 줘.<br>조리대의 레시피에 순서와 불 세기, 계량 방법이 적혀 있어.':'연두색 노선도에서 현수가 짧게 일한 학원부터 오래 일한 학원까지 세 역을 눌러 줘.'}</p><p class="notice">막히면 현수에게 카톡·전화로 물어봐도 좋아.</p>`);return;}

 if(world?.mode==='coaster'||world?.mode==='rotunda'){showModal('hint','OUR NEXT MEMORY','두 번째 방으로 가는 길',`<p class="body-copy">열차는 자동으로 운행해. V로 1인칭과 3인칭을 바꿀 수 있어.<br>도착한 원형 홀에서는 WASD로 걸어 다닐 수 있어.<br>홀 반대편 입구에서 E를 누르면 헬로키티 공주방으로 이어져.</p>`);return;}
 if(world?.mode==='heaven'){showModal('hint','YOU CAN REST HERE','이 방에서는 마음껏 쉬어 가',`<p class="body-copy">퍼즐을 풀고 도착한 하영이의 공주방이야.<br>커다란 헬로키티 인형, 벽의 사진 액자,<br>입구 옆 선물과 오르골을 가까이에서 E로 눌러 봐.</p><p class="notice">WASD 이동 · V 시점 전환 · Shift 빠르게 걷기<br>분홍색 입구 문에서 첫 방의 시작 화면으로 돌아갈 수 있어.</p>`);return;}
 const stage=state.stage;let count=revealedHints.get(stage)||0;
 const objective=stage===0&&state.letterRead?'편지 속 음료와 자물쇠':objectives[stage][0];
 showModal('hint','A LITTLE HELP, A LOT OF LOVE','한 번만 도와줄게.',hintMarkup(stage,objective,count));
 const updateHints=()=>{const button=$('#next-hint');button.textContent=['첫 단서 펼치기 ↗','한 걸음 더 알려 줘 ↗','마지막 단서 펼치기 · 정답에 가까움 ↗','세 장을 모두 펼쳤어'][count];button.disabled=count>=hints[stage].length;$('#hint-progress').textContent=`${count} / ${hints[stage].length}장의 단서를 펼쳤어`;$$('.hint-steps li').forEach((el,i)=>el.classList.toggle('revealed',i<count));};
 for(let i=0;i<count;i++)$('#hint-text').insertAdjacentHTML('beforeend',hintCardMarkup(i,hints[stage][i]));updateHints();
 $('#next-hint').onclick=()=>{if(count>=hints[stage].length)return;$('#hint-text').insertAdjacentHTML('beforeend',hintCardMarkup(count,hints[stage][count]));count++;revealedHints.set(stage,count);updateHints();sound.effect('paper');};
 $('#copy-hint').onclick=async()=>{const field=$('#hint-question'),status=$('#copy-status');try{await navigator.clipboard.writeText(field.value);status.textContent='질문을 복사했어. 현수에게 보내 줘.';}catch{field.focus();field.select();status.textContent='질문을 선택했어. Ctrl+C로 복사해 줘.';}};
 $('#hint-close').onclick=resume;
}
function showSettings(){
 showModal('settings','MAKE YOURSELF COMFORTABLE','조작과 분위기',`<div class="settings-row"><label for="volume">전체 소리</label><input id="volume" type="range" min="0" max="100" value="${settings.volume*100}"></div><div class="settings-row"><label for="sensitivity">마우스 감도</label><input id="sensitivity" type="range" min="30" max="180" value="${settings.sensitivity*100}"></div><div class="settings-row"><label for="speed">이동 속도</label><select id="speed"><option value="0.8" ${settings.speed===.8?'selected':''}>여유롭게</option><option value="1" ${settings.speed===1?'selected':''}>빠르고 편하게 · 기본</option><option value="1.3" ${settings.speed===1.3?'selected':''}>더 빠르게</option></select></div><div class="settings-row"><label for="scares">짧은 놀람 연출<br><small>액자가 드러날 때 조명과 장치 소리</small></label><input id="scares" type="checkbox" ${settings.scares?'checked':''}></div><div class="settings-row"><label for="motion">걸을 때 미세한 화면 움직임</label><input id="motion" type="checkbox" ${settings.motion?'checked':''}></div><div class="settings-row"><label for="voice">대사 읽어 주기<br><small>기기의 한국어 음성 사용</small></label><input id="voice" type="checkbox" ${settings.voice?'checked':''}></div><div class="settings-row"><label for="quality">그래픽 품질</label><select id="quality"><option value="auto" ${settings.quality==='auto'?'selected':''}>자동 · 프레임에 맞춰 조절</option><option value="high" ${settings.quality==='high'?'selected':''}>선명하게 · 높은 해상도</option><option value="standard" ${settings.quality==='standard'?'selected':''}>가볍게 · 성능 우선</option></select></div><details class="spoiler"><summary>사진·그림·음원 개인화</summary><p class="notice">선택한 파일은 이 기기 안에서만 읽으며 업로드하지 않습니다.<br>현재 세션에 적용되고 새로고침하면 다시 선택해야 합니다.<br>세 장의 추억 사진과 놀이공원 그림은 실제 자료이며,<br>현수 생일 액자와 캐릭터는 창작 이미지입니다.</p><div class="file-field"><label for="music-file">인생의 회전목마 · 보유한 음원 파일</label><input id="music-file" type="file" accept="audio/*"></div><div class="file-field"><label for="art-slot">교체할 이미지</label><select id="art-slot"><option value="0">100일 홍대 · 빨강</option><option value="1">잣절 · 노랑</option><option value="2">현수 생일 · 초록</option><option value="3">필리핀 · 파랑</option><option value="painting">하영의 놀이공원 그림</option></select><input id="art-file" type="file" accept="image/*"></div><p class="choice-note" id="file-status"></p></details><div class="modal-actions"><button id="settings-done" class="primary">설정 저장하고 돌아가기</button></div>`);
 for(const id of ['volume','sensitivity'])$('#'+id).oninput=e=>{settings[id]=+e.target.value/100;applySettings();saveSettings();};
 for(const id of ['scares','motion','voice'])$('#'+id).onchange=e=>{settings[id]=e.target.checked;applySettings();saveSettings();};$('#speed').onchange=e=>{settings.speed=+e.target.value;applySettings();saveSettings();};$('#quality').onchange=e=>{settings.quality=e.target.value;applySettings();saveSettings();};
 $('#music-file').onchange=async e=>{try{let f=e.target.files[0];if(!f)return;if(f.size>60*1024*1024)throw new Error('60MB 이하 음원을 골라 주세요.');await sound.loadMusic(f);sound.pause(true);$('#file-status').textContent='음원 적용: '+f.name;}catch(e){$('#file-status').textContent=e.message;}};
 $('#art-file').onchange=async e=>{try{let f=e.target.files[0];if(!f)return;if(f.size>15*1024*1024)throw new Error('15MB 이하 이미지를 골라 주세요.');await ensureWorld();await world.replacePicture($('#art-slot').value,f);$('#file-status').textContent='이미지 적용: '+f.name;}catch(e){$('#file-status').textContent='이미지를 읽을 수 없습니다. '+e.message;}};
 $('#settings-done').onclick=()=>{saveSettings();closeModal();};
}
function showPause(){
 showModal('pause','TAKE YOUR TIME','잠시 쉬어 가도 괜찮아',`<p class="body-copy">여기에는 시간 제한이 없다.<br>우리의 기억을 천천히 둘러봐.</p><p class="notice">WASD 이동 · 마우스로 시선 조절 · 우클릭 드래그로 회전<br>휠: 3인칭 거리 조절 · V: 1/3인칭 전환 · Shift: 빠르게 걷기<br>E: 상호작용 · J: 기억 노트 · H: 힌트 · Esc: 일시정지<br>방향키로도 시선을 조절할 수 있다. 퍼즐은 마우스와 키보드 Tab/Enter로 조작.</p><div class="modal-actions"><button id="resume" class="primary">기억 속으로 돌아가기</button><button id="settings" class="secondary">소리·연출·개인화 설정</button><button id="restart" class="secondary">처음부터 다시</button></div><p class="notice">진행은 이 브라우저에 자동 저장됩니다.</p>`);
 $('#resume').onclick=resume;$('#settings').onclick=showSettings;$('#restart').onclick=()=>{showModal('restart','A NEW BEGINNING','처음부터 다시 시작할까?',`<p class="body-copy">현재 방의 진행 기록을 지우고 편지부터 다시 시작합니다.</p><div class="modal-actions"><button id="confirm-restart" class="primary">처음부터 시작</button><button id="cancel-restart" class="secondary">취소</button></div>`);$('#cancel-restart').onclick=showPause;$('#confirm-restart').onclick=()=>location.assign(location.pathname); // actual reset below
  $('#confirm-restart').onclick=()=>{try{localStorage.removeItem(SAVE_KEY);}catch{}location.reload();};};
}
function showEnding(){
 showModal('ending','CHAPTER 01 · COMPLETE','첫 번째 기억을 되찾았다',`<div class="ending-stamp">1 / 5</div><p class="ending-text">삐친 척했지만,<br>사실 네가 기억해 줘서 기뻐.<br><span class="name-tag">500일 동안, 그리고 앞으로도.</span></p><p class="body-copy">문 너머의 열차를 타고<br>구름 위, 커다란 원형 홀로 가자.</p><div class="modal-actions"><button id="enter-heaven" class="primary">롤러코스터 타고 두 번째 방으로 ↗</button><button id="explore-again" class="secondary">첫 방 다시 둘러보기</button><button id="ending-journal" class="secondary">되찾은 기억 보기</button></div>`);$('#enter-heaven').onclick=travelToRoomTwo;$('#explore-again').onclick=()=>{modalType='explore';resume();};$('#ending-journal').onclick=showJournal;
}
$('#close-modal').onclick=()=>{if(modalType==='ending'){$('#explore-again').click();}else closeModal();};$('#start').onclick=()=>startGame(false);$('#continue').onclick=()=>startGame(true);$('#menu-btn').onclick=showPause;$('#hint-btn').onclick=showHint;$('#journal-btn').onclick=showJournal;$('#intro-settings').onclick=showSettings;$('#view-btn').onclick=()=>{world.toggleView();updateHUD();};$('#resume-capture').onclick=capture;
$('#scene').addEventListener('click',()=>{if(!document.pointerLockElement&&started&&!modalType)capture();});$('#scene').addEventListener('contextmenu',e=>e.preventDefault());$('#scene').addEventListener('mousedown',e=>{if(e.button===2&&started&&!modalType){dragging=true;lastX=e.clientX;lastY=e.clientY;}});addEventListener('mouseup',()=>dragging=false);
addEventListener('mousemove',e=>{if(!started||modalType)return;if(document.pointerLockElement||dragging){const dx=document.pointerLockElement?e.movementX:e.clientX-lastX,dy=document.pointerLockElement?e.movementY:e.clientY-lastY;world.yaw-=dx*.002*settings.sensitivity;world.pitch=Math.max(-1.32,Math.min(1.25,world.pitch-dy*.002*settings.sensitivity));lastX=e.clientX;lastY=e.clientY;}});
$('#scene').addEventListener('wheel',e=>{if(!started||modalType)return;e.preventDefault();if(!world.thirdPerson&&e.deltaY>0)world.toggleView(true);else if(world.thirdPerson){world.zoom=Math.max(.3,Math.min(4.5,world.zoom+Math.sign(e.deltaY)*.3));if(world.zoom<=.45){world.toggleView(false);world.zoom=2.9;}}updateHUD();},{passive:false});
document.addEventListener('pointerlockchange',()=>{$('#resume-capture').hidden=!!document.pointerLockElement||!started||!!modalType;});
document.addEventListener('pointerlockerror',()=>{$('#resume-capture').textContent='우클릭 드래그로 둘러보기 · 방향키도 가능';});
addEventListener('blur',()=>{world?.keys.clear();dragging=false;if(started&&!modalType)showPause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){world?.keys.clear();if(started&&!modalType)showPause();}});
document.addEventListener('keydown',e=>{
 if(modalType){
  if(e.code==='Escape'){e.preventDefault();closeModal();return;}
  if(e.key==='Tab'){const focusables=$$('#modal button:not([disabled]),#modal input,#modal select,#modal textarea,#modal summary').filter(el=>el.offsetParent!==null);const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  return;
 }
 if(!started)return;
 if(e.code==='Tab'){e.preventDefault();if(document.pointerLockElement)document.exitPointerLock();else capture();return;}
 if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)){e.preventDefault();world.keys.add(e.code);}
 if(e.repeat)return;
 if(e.code==='KeyE')interact();if(e.code==='KeyV'){world.toggleView();updateHUD();}if(e.code==='KeyJ')showJournal();if(e.code==='KeyH')showHint();if(e.code==='Escape')showPause();
});
addEventListener('keyup',e=>world?.keys.delete(e.code));
let prev=performance.now(),saveAt=0;
let rafDirection,uiAt=0,lastHit=null;
function loop(now){
 requestAnimationFrame(loop);if(!world?.model||document.hidden){prev=now;return;}const dt=Math.min((now-prev)/1000,.25);prev=now;
 if(world.mode==='rescue'){if(!world.rescueRuntime)return;const paused=['pause','settings'].includes(modalType);rescue?.tick(paused);world.rescueRuntime.update(paused?0:dt,now/1000);if(paused)return;}
 if(world.mode==='kitchen'){kitchen?.tick();world.kitchenRuntime.update(dt,Date.now());if(modalType){world.update(dt,now/1000);return;}}else if(modalType&&world.mode!=='rescue')return;
 world.update(dt,now/1000,()=>sound.effect('step'));
 if(started&&!modalType){state.elapsed+=dt;const hit=world.hit;if(hit?.id!==lastHit){lastHit=hit?.id;$('#prompt').hidden=!hit;$('#crosshair').classList.toggle('target',!!hit);if(hit){$('#target-label').textContent=hit.name;$('#target-desc').textContent=hit.desc;}}if(state.stage===8&&!state.completed&&Math.abs(world.player.x-3.65)<.65&&world.player.z<-6.8)dispatch({type:'exit'});if(now-saveAt>10000){saveAt=now;save();}}
 sound.update(world.camera.position,world.camera.getWorldDirection(rafDirection),now/1000);
}
$('#loading').hidden=true;$('#welcome').hidden=false;$('#start').disabled=false;
initPrologue();
$('#princess-preview').onclick=()=>enterPrincess(true);
$('#princess-preview').hidden=new URLSearchParams(location.search).get('preview')!=='heaven';
if(import.meta.env.DEV&&new URLSearchParams(location.search).get('preview')==='transfer'){
 $('#princess-preview').hidden=false;$('#princess-preview').textContent='롤러코스터 → 두 번째 방 미리보기';
 $('#princess-preview').onclick=async()=>{heavenPreview=true;await startGame(false);await travelToRoomTwo();};
}
if(new URLSearchParams(location.search).get('preview')==='kitchen'){ $('#princess-preview').hidden=false;$('#princess-preview').textContent='200일 요리방 미리보기';$('#princess-preview').onclick=async()=>{heavenPreview=true;await startGame(false);await arriveRotunda();};}
if(new URLSearchParams(location.search).get('preview')==='rescue'){$('#princess-preview').hidden=false;$('#princess-preview').textContent='201~300일 · 현수를 구해라 미리보기';$('#princess-preview').onclick=()=>enterRescueChapter(true);}
if(saved){$('#continue').hidden=false;$('#continue').textContent=`이어 하기 · ${Math.min(saved.stage,8)} / 8개 기억`;}
function installTestHooks(){
 // Test-only navigation: never changes puzzle state; browser tests still interact with the real UI.
 if(import.meta.env.DEV&&new URLSearchParams(location.search).has('e2e'))window.__roomTest={focus:id=>world.focus(id),read:()=>structuredClone(state),view:()=>({mode:world.mode||'salon',rescue:world.rescueRuntime?{transition:!!world.rescueRuntime.transition,doors:world.rescueRuntime.doors.map(d=>d.rotation.y),room:world.rescueRuntime.state.room,npc:world.rescueRuntime.people[3].position.toArray(),cabinet:world.get('CabinetDoor').rotation.y,coat:world.rescueRuntime.people[1].children.filter(c=>c.name.startsWith('Coat')).map(c=>c.visible)}:null,doorAngle:world.doorHinge?.rotation.y,rideProgress:world.ride?.progress,ridePhase:world.ride?.phase,thirdPerson:world.thirdPerson,position:world.player.toArray(),camera:world.camera.position.toArray(),drawCalls:world.renderer.info.render.calls,triangles:world.renderer.info.render.triangles,pixelRatio:world.renderer.getPixelRatio(),quality:world.quality,lights:world.scene.children.filter(o=>o.isLight).length}),assets:()=>({safeVisible:world.memorySafe?.visible,safeAngle:world.safeHinge?.rotation.y,photoSources:memoryPhotos,violin:world.get('ViolinKeyring')?.visible,carousel:world.get('Carousel')?.visible,held:Object.fromEntries(Object.entries(world.heldItems).map(([k,v])=>[k,v.visible])),audio:sound.ctx?.state,music:sound.musicActive}),setPosition:(x,z)=>{world.player.set(x,0,z);},look:(x,y,z)=>world.lookAtPoint([x,y,z]),targets:()=>world.targets.map(t=>({id:t.userData.id,p:t.position.toArray()})),advanceRide:seconds=>{if(world.mode==='coaster')for(let t=0;t<seconds;t+=1/60){if(!world.ride)break;world.ride.update(1/60);}},ready:true};
}
addEventListener('beforeunload',()=>{if(started)save();});
