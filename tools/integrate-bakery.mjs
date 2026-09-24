import fs from 'node:fs';
function once(s,a,b){if(!s.includes(a)||s.indexOf(a)!==s.lastIndexOf(a))throw new Error('Expected one integration anchor: '+a);return s.replace(a,b);}
let s=fs.readFileSync('src/main.js','utf8');
s=once(s,"import './journey.css';","import './journey.css';\nimport './bakery.css';\nimport {loadBakery,bakeryObjective} from './bakery-state.js';");
s=once(s,'let journey;','let journey;\nlet bakery;');
s=once(s,'function updateHUD(){',`function updateHUD(){
 if(world.mode==='bakery'){
  const s=state.bakery;$('#objective-label').textContent='DAY 401 — 500 · 01 / DAEJEON';$('#objective-text').textContent=bakeryObjective(s);
  $('#progress').innerHTML=[s.safeOpen,s.cakeTaken,s.letterTaken].map(done=>'<i class="'+(done?'done':'')+'"></i>').join('');
  $('#inventory').innerHTML=(s.letterTaken?'<button id="bakery-letter-inventory">편지 조각 1/3</button>':'')+(s.cakeTaken?'<span class="bag-chip">망고시루 케이크</span>':'');
  if($('#bakery-letter-inventory'))$('#bakery-letter-inventory').onclick=()=>bakery.letter();$('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';document.body.classList.remove('dark');return;
 }
`);
s=once(s,"if(state.completed&&state.location==='journey')await enterJourneyChapter(false);","if(state.completed&&state.location==='bakery')await enterBakeryChapter(false);else if(state.completed&&state.location==='journey')await enterJourneyChapter(false);");
s=once(s,'async function enterPrincess(preview=false){',`async function enterBakeryChapter(preview=heavenPreview){
 heavenPreview=preview;modalType='travel';$('#modal-backdrop').hidden=true;$('#welcome').hidden=true;$('#hud').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='401~500일, 첫 번째 세계 성심당으로…';if(world){world.active=false;world.keys.clear();}if(document.pointerLockElement)document.exitPointerLock();
 try{await sound.start();await ensureWorld();state.bakery=loadBakery(state.bakery);const [{enterBakery},{BakeryController}]=await Promise.all([import('./bakery-world.js'),import('./bakery-ui.js')]);await enterBakery(world,state.bakery);
 bakery=new BakeryController({world,getState:()=>state.bakery,setState:s=>{const before=state.bakery;state.bakery=s;if(s.letterTaken&&!before.letterTaken)state.journal.push('401~500일 · 성심당 명란바게트 쟁반 아래에서 편지 첫 조각 1/3을 찾았다.');if(s.cakeTaken&&!before.cakeTaken)state.journal.push('401~500일 · 판매 데스크의 빵값 합계로 금고를 열고 망고시루 케이크를 꺼냈다.');save();updateHUD();},showModal,closeModal,toast,subtitle,sound});
 state.stage=8;state.completed=true;state.location='bakery';save();if(!started)requestAnimationFrame(loop);started=true;world.started=true;world.active=true;modalType=null;lastHit=null;prev=performance.now();
 document.body.classList.remove('coaster','kitchen','heaven','dark','rescue','journey','arrival','arrival-doorway');document.body.classList.add('bakery');for(const id of ['rescue-alert','journey-flight','journey-camera'])if($('#'+id))$('#'+id).hidden=true;rescue?.audio.pause();$('.chapter .eyebrow').textContent='CHAPTER 05 · DAY 401 — 500';$('.chapter span:last-child').textContent='세계의 공간 · 첫 번째, 대전 성심당';sound.setKitchen(false);sound.setRide(false);sound.setHeaven(false);sound.musicActive=false;sound.musicFile?.pause();sound.pause(false);applySettings();$('#loading').hidden=true;$('#hud').hidden=false;updateHUD();installTestHooks();capture();subtitle('데스크에 빵이 놓여 있어. 그 아래 잠긴 금고에는 무엇이 있을까?',7000);
 }catch(e){errorScreen(e);}
}

async function enterPrincess(preview=false){`);
s=once(s,"if(world.mode==='journey'){journey.interact(id);return;}","if(world.mode==='bakery'){bakery.interact(id);return;}\n if(world.mode==='journey'){journey.interact(id);return;}");
s=once(s,'function showHint(){',"function showHint(){\n if(world?.mode==='bakery'){bakery.hint();return;}");
s=once(s,"if(world.mode==='journey'){const paused=['pause','settings'].includes(modalType);","if(world.mode==='bakery'){const paused=['pause','settings'].includes(modalType);world.bakeryRuntime.update(paused?0:dt);if(paused)return;}\n if(world.mode==='journey'){const paused=['pause','settings'].includes(modalType);");
s=once(s,"else if(modalType&&!['rescue','journey'].includes(world.mode))return;","else if(modalType&&!['rescue','journey','bakery'].includes(world.mode))return;");
s=once(s,"if(new URLSearchParams(location.search).get('preview')==='journey')", "if(new URLSearchParams(location.search).get('preview')==='bakery'){$('#princess-preview').hidden=false;$('#princess-preview').textContent='401~500일 · 성심당 금고와 편지 미리보기';$('#princess-preview').onclick=()=>enterBakeryChapter(true);}\nif(new URLSearchParams(location.search).get('preview')==='journey')");
s=once(s,"view:()=>({mode:world.mode||'salon',", "view:()=>({bakery:world.bakeryRuntime?{safeAngle:world.bakeryRuntime.safe.rotation.y,cakeVisible:world.bakeryRuntime.cake.visible,letterVisible:world.bakeryRuntime.letter.visible}:null,mode:world.mode||'salon',");
s=once(s,"showModal,closeModal,toast,subtitle,sound});\n state.stage=8;state.completed=true;state.location='journey';", "showModal,closeModal,toast,subtitle,sound,onNext:()=>enterBakeryChapter(heavenPreview)});\n state.stage=8;state.completed=true;state.location='journey';");
fs.writeFileSync('src/main.js',s);
let ui=fs.readFileSync('src/journey-ui.js','utf8');
ui=once(ui,'<button id="journey-finish-rest" class="primary">열린 문 앞에서 함께 쉬기</button>','<button id="journey-enter-bakery" class="primary">첫 번째 세계, 성심당으로</button><button id="journey-finish-rest" class="secondary">열린 문 앞에서 함께 쉬기</button>');
ui=once(ui,"if($('#journey-finish-rest'))$('#journey-finish-rest').onclick=()=>this.closeModal();", "if($('#journey-enter-bakery'))$('#journey-enter-bakery').onclick=()=>this.onNext?.();if($('#journey-finish-rest'))$('#journey-finish-rest').onclick=()=>this.closeModal();");
fs.writeFileSync('src/journey-ui.js',ui);
