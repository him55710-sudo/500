import fs from 'node:fs/promises';
async function edit(file,fn){const src=await fs.readFile(file,'utf8');await fs.writeFile(file,fn(src));}
function replace(s,a,b){if(!s.includes(a))throw new Error('Missing edit anchor: '+a.slice(0,100));return s.replace(a,b);}
await edit('src/main.js',s=>{
 s=s.replaceAll("$('#view-btn span').textContent=world.thirdPerson?'3인칭':'1인칭';",'');
 s=replace(s,"$('#view-btn').onclick=()=>{world.toggleView();updateHUD();};",'');
 s=replace(s,"if(e.code==='KeyV'){world.toggleView();updateHUD();}",'');
 s=s.replace(/^\$\('#scene'\)\.addEventListener\('wheel'.*\r?\n/m,'');
 s=s.replaceAll('화면 클릭: 시선 조작 · 3인칭은 우클릭 드래그','화면 클릭: 시선 조작 · Tab: 커서 해제');
 s=s.replaceAll('V로 탑승 시점 전환 · Esc로 일시정지','1인칭으로 탑승 중 · Esc로 일시정지');
 s=s.replaceAll('열차는 자동으로 운행해. V로 1인칭과 3인칭을 바꿀 수 있어.','열차는 자동으로 운행해. 하영이의 눈높이에서 다음 장소로 이동해.');
 s=s.replaceAll('WASD 이동 · V 시점 전환 · Shift 빠르게 걷기','WASD 이동 · 마우스 시선 · Shift 빠르게 걷기');
 s=s.replaceAll('WASD 이동 · 1인칭: 마우스 이동만으로 시선 조절 · 3인칭: 우클릭 회전<br>휠: 3인칭 거리 조절 · V: 1/3인칭 전환 · Shift: 빠르게 걷기','WASD 이동 · 마우스로 시선 조절 · 1인칭 전용<br>우클릭 드래그로도 시선 조절 · Shift: 빠르게 걷기');
 return s;
});
await edit('index.html',s=>s.replace('<button id="view-btn">V <span>1인칭</span></button>','').replace('1인칭 마우스 시선 <span>·</span> 3인칭 우클릭 회전 <span>·</span> 휠 줌','마우스 시선 <span>·</span> E 상호작용'));
await edit('src/world.js',s=>{
 s=replace(s,'toggleView(force){this.thirdPerson=force??!this.thirdPerson;this.avatar.visible=this.thirdPerson;return this.thirdPerson;}','toggleView(){this.thirdPerson=false;this.avatar.visible=false;return false;}');
 const start=s.indexOf('   if(this.thirdPerson){const pivot='),end=s.indexOf('\n  }else if(!this.started)',start);
 if(start<0||end<0)throw new Error('Missing third-person camera block');
 return s.slice(0,start)+'   this.camera.position.copy(eye);if(this.motion&&moving)this.camera.position.y+=Math.sin(this.walkTime*2)*.009;this.camera.lookAt(eye.clone().add(forward));this.avatar.visible=false;'+s.slice(end);
});
await edit('src/transfer.js',s=>{
 s=s.replaceAll('world.toggleView(true)','world.toggleView(false)').replaceAll('avatar.visible=true','avatar.visible=false').replaceAll('avatar.visible=world.thirdPerson','avatar.visible=false');
 s=s.replace(' // A close over-the-shoulder chase keeps Hayoung readable while the track sweeps behind her.',' // The complete ride is seen from the front seat at Hayoung’s eye level.');
 s=s.replace('cameraOffset=new THREE.Vector3(2.3,1.65,-2.35),','');
 const start=s.indexOf('   if(world.thirdPerson){'),end=s.indexOf('   world.camera.updateMatrixWorld();status(phase)',start);
 if(start<0||end<0)throw new Error('Missing coaster camera block');
 return s.slice(0,start)+"   world.camera.position.copy(target);if(world.motion){const shake=.004+speedFactor*.012;world.camera.position.addScaledVector(pose.up,Math.sin(elapsed*29)*shake);}world.camera.up.copy(world.motion?pose.up:new THREE.Vector3(0,1,0));world.camera.lookAt(target.clone().addScaledVector(pose.forward,15));\n"+s.slice(end);
});
await edit('src/rescue-ui.js',s=>s.replace("$('#view-btn span').textContent=this.world.thirdPerson?'3인칭':'1인칭';",'').replaceAll('this.world.toggleView(true)','this.world.toggleView(false)'));
await edit('src/rescue-world.js',s=>s.replaceAll('world.toggleView(room===3)','world.toggleView(false)').replace('world.avatar.visible=true;world.playAvatarAnimation(\'Walk\');world.camera.position.set(world.player.x-3,2.4,3.3);world.camera.lookAt(world.player.clone().add(v(1,1.2,0)));',"world.avatar.visible=false;world.playAvatarAnimation('Walk');world.camera.position.copy(world.player).add(v(0,1.63,0));world.camera.lookAt(world.player.clone().add(v(3,1.63,0)));"));
console.log('Global first-person controls and chapter cameras updated.');
