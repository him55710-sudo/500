import fs from 'node:fs/promises';
let main=await fs.readFile('src/main.js','utf8');
main=main.replace("import './kitchen.css';","import './kitchen.css';\nimport './rescue.css';\nimport {loadRescue,rescueObjectives} from './rescue-state.js';");
main=main.replace('let kitchen;','let kitchen;\nlet rescue;');
main=main.replace('function updateHUD(){',`function updateHUD(){
 if(world.mode==='rescue'){
  const s=state.rescue;$('#objective-label').textContent='DAY 201 — 300 · SAVE HYUNSU';$('#objective-text').textContent=rescueObjectives[s.room];
  $('#progress').innerHTML=[s.healed,s.warmed,s.fed,s.completed].map(done=>'<i class="'+(done?'done':'')+'"></i>').join('');
  $('#inventory').replaceChildren();for(const item of [s.medicine?'현수의 약':null,s.paid.length&&!s.warmed?'계산한 쇼핑백':null,s.board?'텍사스 vs 브라질 이름판':null,s.holding?'현수의 손을 잡고 있어 ♡':null].filter(Boolean)){const el=document.createElement('span');el.className='bag-chip';el.textContent=item;$('#inventory').appendChild(el);}
  $('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';document.body.classList.remove('dark');return;
 }
`);
main=main.replace("if(state.completed&&state.location==='heaven')", "if(state.completed&&state.location==='rescue')await enterRescueChapter(false);else if(state.completed&&state.location==='heaven')");
main=main.replace('onExit:()=>enterPrincess(heavenPreview)', 'onExit:()=>enterRescueChapter(heavenPreview)');
const entry=`async function enterRescueChapter(preview=heavenPreview){
 heavenPreview=preview;modalType='travel';$('#modal-backdrop').hidden=true;$('#welcome').hidden=true;$('#hud').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='201~300일, 현수를 구할 기억들을 준비하고 있어요…';if(world){world.active=false;world.keys.clear();}if(document.pointerLockElement)document.exitPointerLock();
 try{await sound.start();await ensureWorld();state.rescue=loadRescue(state.rescue);const [{enterRescue},{RescueController}]=await Promise.all([import('./rescue-world.js'),import('./rescue-ui.js')]);await enterRescue(world,state.rescue);
 rescue=new RescueController({world,getState:()=>state.rescue,setState:s=>{const before=state.rescue;state.rescue=s;for(const [key,note] of [['healed','대상 트로피 사이에서 약을 찾아 아픈 현수에게 주었다.'],['warmed','남색 폴로 니트 집업과 TOMBOY 코트로 현수를 따뜻하게 해 주었다.'],['fed','텍사스와 브라질의 핀으로 가고 싶던 식당을 맞혔다.'],['completed','규모 6.2의 지진. 손을 꼭 잡고 함께 400일 방으로 탈출했다.']])if(s[key]&&!before[key])state.journal.push('201~300일 · '+note);save();updateHUD();},showModal,closeModal,toast,subtitle,sound,onBonus:()=>enterPrincess(heavenPreview)});
 state.stage=8;state.completed=true;state.location='rescue';save();if(!started)requestAnimationFrame(loop);started=true;world.started=true;world.active=true;modalType=null;lastHit=null;prev=performance.now();
 document.body.classList.remove('coaster','kitchen','heaven','dark');document.body.classList.add('rescue');$('.chapter .eyebrow').textContent='CHAPTER 03 · DAY 201 — 300';$('.chapter span:last-child').textContent='현수를 구해라';sound.setKitchen(false);sound.setRide(false);sound.setHeaven(false);sound.musicActive=false;sound.musicFile?.pause();sound.pause(false);applySettings();$('#loading').hidden=true;$('#hud').hidden=false;updateHUD();installTestHooks();capture();subtitle('하영아, 이번에는 네가 나를 구해 줄 차례야. 아프고 춥고 배고팠던 그날들을 기억해 줘.',8500);
 }catch(e){errorScreen(e);}
}
`;
main=main.replace('async function enterPrincess(preview=false){',entry+'\nasync function enterPrincess(preview=false){');
main=main.replace("document.body.classList.remove('coaster','kitchen','dark');", "document.body.classList.remove('coaster','kitchen','dark','rescue');if($('#rescue-alert'))$('#rescue-alert').hidden=true;rescue?.audio.pause();");
main=main.replace("if(world.mode==='kitchen'){kitchen.interact(id);return;}", "if(world.mode==='rescue'){rescue.interact(id);return;}\n if(world.mode==='kitchen'){kitchen.interact(id);return;}");
main=main.replace("if(world?.mode==='kitchen'){showModal('hint'", "if(world?.mode==='rescue'){rescue.hint();return;}\n if(world?.mode==='kitchen'){showModal('hint'");
main=main.replace("if(world.mode==='kitchen'){kitchen?.tick();", "if(world.mode==='rescue'){const paused=['pause','settings'].includes(modalType);rescue?.tick(paused);world.rescueRuntime.update(paused?0:dt,now/1000);if(paused)return;}\n if(world.mode==='kitchen'){kitchen?.tick();");
main=main.replace("}else if(modalType)return;\n world.update", "}else if(modalType&&world.mode!=='rescue')return;\n world.update");
main=main.replace("if(saved){$('#continue').hidden=false;", "if(new URLSearchParams(location.search).get('preview')==='rescue'){$('#princess-preview').hidden=false;$('#princess-preview').textContent='201~300일 · 현수를 구해라 미리보기';$('#princess-preview').onclick=()=>enterRescueChapter(true);}\nif(saved){$('#continue').hidden=false;");
main=main.replace("mode:world.mode||'salon',", "mode:world.mode||'salon',rescue:world.rescueRuntime?{transition:!!world.rescueRuntime.transition,doors:world.rescueRuntime.doors.map(d=>d.rotation.y),room:world.rescueRuntime.state.room,npc:world.rescueRuntime.people[3].position.toArray(),cabinet:world.get('CabinetDoor').rotation.y,coat:world.rescueRuntime.people[1].children.filter(c=>c.name.startsWith('Coat')).map(c=>c.visible)}:null,");
await fs.writeFile('src/main.js',main);
let world=await fs.readFile('src/world.js','utf8');world=world.replace('blocked(x,z){',"blocked(x,z){\n  if(this.mode==='rescue')return this.rescueRuntime.blocked(x,z);");world=world.replace("const p=t.position;", "const p=t.position;\n  if(this.mode==='rescue'){this.player.copy(p).add(V(...t.userData.offset));this.player.y=0;this.lookAtPoint(p.toArray());this.toggleView(false);return;}");world=world.replace('this.camera.updateMatrixWorld();this.scene.updateMatrixWorld();',"if(this.mode==='rescue')this.rescueRuntime.afterUpdate(dt,time);\n  this.camera.updateMatrixWorld();this.scene.updateMatrixWorld();");await fs.writeFile('src/world.js',world);
let kitchen=await fs.readFile('src/kitchen-ui.js','utf8');kitchen=kitchen.replace('이제 하영이가 좋아하는 공주방에서 쉬어 가자.','이제 201~300일의 기억으로 가자. 이번에는 현수에게 하영이의 도움이 필요해.').replace('헬로키티 공주방으로 ♡','201~300일 · 현수를 구해라 →');await fs.writeFile('src/kitchen-ui.js',kitchen);
console.log('Rescue chapter connected to kitchen, save/resume, HUD, controls and preview.');
