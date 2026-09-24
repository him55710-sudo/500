import fs from 'node:fs';
const p='src/main.js';let s=fs.readFileSync(p,'utf8');
s=s.replace("sound,onBonus:()=>enterPrincess(heavenPreview)","sound,onNext:()=>enterJourneyChapter(heavenPreview),onBonus:()=>enterPrincess(heavenPreview)");
const entry=`async function enterJourneyChapter(preview=heavenPreview){
 heavenPreview=preview;modalType='travel';$('#modal-backdrop').hidden=true;$('#welcome').hidden=true;$('#hud').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='301~400일, 우리 둘의 중국 여행을 준비하고 있어요…';if(world){world.active=false;world.keys.clear();}if(document.pointerLockElement)document.exitPointerLock();
 try{await sound.start();await ensureWorld();state.journey=loadJourney(state.journey);const [{enterJourney},{JourneyController}]=await Promise.all([import('./journey-world.js'),import('./journey-ui.js')]);await enterJourney(world,state.journey);
 journey=new JourneyController({world,getState:()=>state.journey,setState:(s,tick=false)=>{const before=state.journey;state.journey=s;if(s.completed&&!before.completed)state.journal.push('301~400일 · 지옥 감옥에서 현수를 구하고, 천국 교회와 퍼스트 클래스를 지나 연태의 용가훠궈에 도착했다. 좋아하는 다섯 메뉴와 ZAGEE 안의 열쇠. 이제 500일로.');if(!tick||s.arrived&&!before.arrived){save();updateHUD();}},showModal,closeModal,toast,subtitle,sound});
 state.stage=8;state.completed=true;state.location='journey';save();if(!started)requestAnimationFrame(loop);started=true;world.started=true;world.active=true;modalType=null;lastHit=null;prev=performance.now();
 document.body.classList.remove('coaster','kitchen','heaven','dark','rescue');document.body.classList.add('journey');if($('#rescue-alert'))$('#rescue-alert').hidden=true;rescue?.audio.pause();$('.chapter .eyebrow').textContent='CHAPTER 04 · DAY 301 — 400';$('.chapter span:last-child').textContent='지옥에서 천국까지, 우리 둘의 중국 여행';sound.setKitchen(false);sound.setRide(false);sound.setHeaven(false);sound.musicActive=false;sound.musicFile?.pause();sound.pause(false);applySettings();$('#loading').hidden=true;$('#hud').hidden=false;updateHUD();installTestHooks();capture();subtitle(state.journey.freed?'우리의 중국 여행을 이어가 보자.':'겨우 구한 현수가 이번에는 철창 안에 있어. 책상의 휴대폰에 단서가 남아 있다.',7000);
 }catch(e){errorScreen(e);}
}

`;
if(!s.includes('async function enterJourneyChapter('))s=s.replace('async function enterPrincess(',entry+'async function enterPrincess(');
s=s.replace("if(world.mode==='rescue'){rescue.interact(id);return;}","if(world.mode==='journey'){journey.interact(id);return;}\n if(world.mode==='rescue'){rescue.interact(id);return;}");
s=s.replace("if(world?.mode==='rescue'){rescue.hint();return;}","if(world?.mode==='journey'){journey.hint();return;}\n if(world?.mode==='rescue'){rescue.hint();return;}");
s=s.replace("if(e.code==='KeyE')interact();","if(e.code==='KeyC'&&world.mode==='journey')journey.camera();\n if(e.code==='KeyE')interact();");
s=s.replace("if(world.mode==='rescue'){if(!world.rescueRuntime)return;", "if(world.mode==='journey'){const paused=['pause','settings'].includes(modalType);journey?.tick(dt,!!modalType);world.journeyRuntime.update(paused?0:dt,now/1000);if(paused)return;}\n if(world.mode==='rescue'){if(!world.rescueRuntime)return;");
s=s.replace("else if(modalType&&world.mode!=='rescue')return;","else if(modalType&&!['rescue','journey'].includes(world.mode))return;");
s=s.replace("if(saved){$('#continue')", "if(new URLSearchParams(location.search).get('preview')==='journey'){$('#princess-preview').hidden=false;$('#princess-preview').textContent='301~400일 · 중국 여행 미리보기';$('#princess-preview').onclick=()=>enterJourneyChapter(true);}\nif(saved){$('#continue')");
s=s.replace("view:()=>({mode:world.mode||'salon',", "view:()=>({mode:world.mode||'salon',journey:world.journeyRuntime?{zone:world.journeyRuntime.state.zone,transition:!!world.journeyRuntime.transition,cameraOn:world.journeyRuntime.cameraOn,scanAligned:world.journeyRuntime.scanAligned(),npc:world.journeyRuntime.npc?.position.toArray(),flight:world.journeyRuntime.state.flight}:null,");
fs.writeFileSync(p,s);
let u=fs.readFileSync('src/rescue-ui.js','utf8');u=u.replace('다음 이야기는 이곳에서 이어질 거야.','지옥과 천국을 지나, 우리 둘의 중국 여행이 기다려.').replace('<button id="rescue-rest"','<button id="rescue-next-chapter" class="primary">301~400일 · 중국 여행으로</button><button id="rescue-rest"').replace("$('#rescue-rest').onclick=", "$('#rescue-next-chapter').onclick=()=>this.onNext();$('#rescue-rest').onclick=");fs.writeFileSync('src/rescue-ui.js',u);
