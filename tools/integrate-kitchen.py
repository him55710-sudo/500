from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/main.js';s=p.read_text(encoding='utf-8')
def replace(old,new):
 global s
 assert old in s,old[:100]
 s=s.replace(old,new,1)
replace("import './transfer.css';","import './transfer.css';\nimport './kitchen.css';\nimport {loadKitchen} from './kitchen-state.js';\nimport {recipes,recipeKeys,ingredients} from './kitchen-data.js';\nimport {memoryPhotos} from './personal-memories.js';")
replace('let world;','let world;\nlet kitchen;')
replace('function updateHUD(){',"""function updateHUD(){
 if(world.mode==='kitchen'){
  const s=state.cooking,complete=recipeKeys.filter(k=>s.progress[k]>=recipes[k].steps.length).length;
  $('#objective-label').textContent='DAY 200 · '+(s.lights?'OUR FOUR KITCHENS':'FIND THE FIRST LIGHT');
  $('#objective-text').textContent=!s.lights?'어둠 속 연두색 7호선 노선도를 찾아 E로 살펴봐.':s.completed?'네 가지 요리가 완성됐어. 다음 기억으로 향하는 문을 찾아봐.':`중앙 마트에서 재료를 챙기고 네 요리방을 완성해 줘. ${complete} / 4`;
  $('#progress').innerHTML=recipeKeys.map(k=>`<i class="${s.progress[k]>=recipes[k].steps.length?'done':''}"></i>`).join('');
  $('#inventory').replaceChildren();for(const [key,count] of Object.entries(s.bag)){const el=document.createElement('span');el.className='bag-chip';el.textContent=ingredients[key][0]+' ×'+count;$('#inventory').appendChild(el);}
  $('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';document.body.classList.toggle('dark',!s.lights);return;
 }
""")
replace("function showModal(type,kicker,title,html){","function showModal(type,kicker,title,html){\n kitchen?.closeView();")
replace(" const old=modalType;modalType=null;"," kitchen?.closeView();\n const old=modalType;modalType=null;")
replace("state.location==='rotunda'","['rotunda','kitchen'].includes(state.location)")
a=s.index('async function arriveRotunda(){');b=s.index('async function enterPrincess',a)
s=s[:a]+"""async function arriveRotunda(){
 modalType='travel';$('#modal-backdrop').hidden=true;$('#loading').hidden=false;$('#loading-label').textContent='200일의 요리방을 준비하고 있어요…';world.active=false;
 try{
  state.cooking=loadKitchen(state.cooking);const [{enterKitchen},{KitchenController}]=await Promise.all([import('./kitchen-world.js'),import('./kitchen-ui.js')]);
  await enterKitchen(world,state.cooking);sound.setRide(false);sound.setKitchen(true);sound.pause(false);
  kitchen=new KitchenController({world,getState:()=>state.cooking,setState:s=>{const wasComplete=state.cooking.completed;state.cooking=s;if(s.completed&&!wasComplete)state.journal.push('200일 · 칠리새우 볶음밥, 반반 닭다리 도시락, 작은 새우 도시락과 수제 빼빼로. 함께 먹을 한 끼를 정성껏 준비했다.');save();updateHUD();},showModal,closeModal,toast,sound,onExit:()=>enterPrincess(false)});
  state.location='kitchen';save();document.body.classList.remove('coaster','heaven');document.body.classList.add('kitchen');
  $('.chapter .eyebrow').textContent='CHAPTER 02 · DAY 200';$('.chapter span:last-child').textContent='우리의 네 가지 식탁';
  $('#loading').hidden=true;$('#hud').hidden=false;modalType=null;lastHit=null;prev=performance.now();world.active=true;world.started=true;updateHUD();installTestHooks();capture();subtitle(state.cooking.lights?'다시 왔네. 준비하던 한 끼를 이어서 완성해 보자.':'불이 꺼져 있어. 현수가 수학을 가르치던 세 역의 기억이 필요해.',8500);
 }catch(e){errorScreen(e);}
}
"""+s[b:]
replace(" document.body.classList.remove('coaster');document.body.classList.add('heaven');sound.setRide(false);"," document.body.classList.remove('coaster','kitchen','dark');document.body.classList.add('heaven');sound.setKitchen(false);sound.setRide(false);")
replace(" if(state.stage!==1){toast(state.stage>1?", " if(state.framesSolved&&state.stage===1){showSafe();return;}\n if(state.stage!==1){toast(state.stage>1?")
replace('짱구 포스터에 담긴 날들을','사진과 액자에 담긴 날들을')
replace('<span class="frame-icon">${icon}</span>', '<span class="frame-icon">${memoryPhotos[[\'red\',\'yellow\',\'green\',\'blue\'].indexOf(id)]?`<img class="memory-photo" src="${memoryPhotos[[\'red\',\'yellow\',\'green\',\'blue\'].indexOf(id)]}" alt="${title}">`:icon}</span>')
replace('function showDoll(id){',"""function showSafe(){
 if(!state.framesSolved||state.stage!==1){toast('아직 액자 뒤 금고에 닿을 수 없어.');return;}
 showModal('safe','A GIFT BEHIND THE MEMORY','초록 액자 뒤의 작은 금고',state.safeOpen?`<img class="keepsake-photo" src="/assets/memories/violin-keyring.png" alt="실제 바이올린 키링"><p class="body-copy">2025년 5월 14일.<br>하영의 생일을 위해 준비했던 현수의 첫 선물.</p><button id="take-violin" class="primary">바이올린 키링 꺼내기</button>`:`<p class="body-copy">추억의 순서가 맞자 금고의 잠금이 풀렸다.<br>손잡이를 돌려 안을 살펴보자.</p><button id="open-memory-safe" class="primary">금고 손잡이 돌리기</button>`);
 if($('#open-memory-safe'))$('#open-memory-safe').onclick=()=>{dispatch({type:'open-safe'});showSafe();};
 if($('#take-violin'))$('#take-violin').onclick=()=>{dispatch({type:'take-violin'});resume();};
}
function showDoll(id){""")
replace('<div class="item-drawing">${correct?\'♬\':\'♟\'}</div>', '<div class="item-drawing">${correct?\'<img class="keepsake-photo" src="/assets/memories/violin-keyring.png" alt="바이올린 키링">\':\'♟\'}</div>')
replace("placed?'그림을 그렸던 그 장소':'놀이공원에 빠진 것',`", "placed?'그림을 그렸던 그 장소':'놀이공원에 빠진 것',`<img class=\"painting-photo\" src=\"/assets/memories/hayoung-painting.png\" alt=\"하영이 그린 놀이공원\">")
replace(" if(world.mode==='rotunda'){", " if(world.mode==='kitchen'){kitchen.interact(id);return;}\n if(world.mode==='rotunda'){")
replace("else if(id==='frames')showFrames();", "else if(id==='frames')showFrames();else if(id==='memory-safe')showSafe();")
replace('function showHint(){',"""function showHint(){
 if(world?.mode==='kitchen'){showModal('hint','200 DAYS · HINT','현수에게 물어보기',`<p class="body-copy">${state.cooking.lights?'중앙 마트에서 재료를 챙긴 뒤, 12시 칠리새우 · 3시 치킨 · 6시 작은 새우 · 9시 빼빼로를 만들어 줘.<br>조리대의 레시피에 순서와 불 세기, 계량 방법이 적혀 있어.':'연두색 노선도에서 현수가 짧게 일한 학원부터 오래 일한 학원까지 세 역을 눌러 줘.'}</p><p class="notice">막히면 현수에게 카톡·전화로 물어봐도 좋아.</p>`);return;}
""")
replace(" requestAnimationFrame(loop);if(!world?.model||document.hidden||modalType){prev=now;return;}const dt=Math.min((now-prev)/1000,.25);prev=now;world.update(dt,now/1000,()=>sound.effect('step'));", " requestAnimationFrame(loop);if(!world?.model||document.hidden){prev=now;return;}const dt=Math.min((now-prev)/1000,.25);prev=now;\n if(world.mode==='kitchen'){kitchen?.tick();world.kitchenRuntime.update(dt,Date.now());if(modalType){world.update(dt,now/1000);return;}}else if(modalType)return;\n world.update(dt,now/1000,()=>sound.effect('step'));")
replace("if(saved){$('#continue').hidden=false;", "if(new URLSearchParams(location.search).get('preview')==='kitchen'){ $('#princess-preview').hidden=false;$('#princess-preview').textContent='200일 요리방 미리보기';$('#princess-preview').onclick=async()=>{heavenPreview=true;await startGame(false);await arriveRotunda();};}\nif(saved){$('#continue').hidden=false;")
replace('assets:()=>({violin:', 'assets:()=>({safeVisible:world.memorySafe?.visible,safeAngle:world.safeHinge?.rotation.y,photoSources:memoryPhotos,violin:')
p.write_text(s,encoding='utf-8')
print('Integrated kitchen and personal memories')
