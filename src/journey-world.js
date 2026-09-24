import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {polishRoomMaterials} from './render-look.js';
import {installHyunsu} from './hyunsu-character.js';
import {addInteriorDetails} from './interior-details.js';
import {menu} from './journey-state.js';
const V=(...p)=>new THREE.Vector3(...p);
const clamp=THREE.MathUtils.clamp;
function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
export async function enterJourney(world,state){
 const asset=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/journey/journey-room.glb');
 const scene=new THREE.Scene();scene.environment=world.scene.environment;scene.environmentIntensity=.6;scene.background=new THREE.Color('#1e1017');scene.fog=new THREE.Fog('#1e1017',22,65);
 world.scene=scene;world.model=asset.scene;scene.add(asset.scene,world.camera,world.avatar);world.mode='journey-loading';world.rescueRuntime=null;world.kitchenRuntime=null;world.state={stage:0,inventory:[]};world.targets=[];world.keys.clear();world.hit=null;world.ride=null;world.pendingAnimations=[];world.avatarPose='standing';world.camera.up.set(0,1,0);world.camera.far=110;world.camera.updateProjectionMatrix();world.renderer.toneMappingExposure=.95;world.renderer.shadowMap.enabled=true;
 const get=n=>asset.scene.getObjectByName(n);
 asset.scene.traverse(o=>{if(/^(Reference_|FoodPreview_|SourceZagee|SourceKey)/.test(o.name))o.visible=false;});
 const hemi=new THREE.HemisphereLight('#ffffff','#34465a',1);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff9f3',2.2);sun.position.set(0,6,4);sun.target.position.set(0,0,-3);scene.add(sun,sun.target);
 const lamps=[];for(const [p,c,int,d] of [[[0,1,-3],'#ff4b09',25,16],[[0,11,0],'#fff4d5',90,22],[[24,9,0],'#f4f6ff',70,22],[[50,7,-3],'#ffb259',130,30],[[50,3,-18.5],'#ffedcc',15,8]]){const l=new THREE.PointLight(c,int,d,1.8);l.position.set(...p);scene.add(l);lamps.push(l);}
 asset.scene.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=!/Lava|Roof|Architecture|Restaurant |Chapel /.test(o.name);for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.map)m.map.anisotropy=4;if(m.name.startsWith('MI_Hair_1'))m.color.set('#30221a');if(m.name==='Longge lacquer red'){m.color.set('#791522');m.roughness=.57;}if(m.name==='Scarlet velvet')m.color.set('#9b172a');}}});
 await addInteriorDetails(world,'journey');polishRoomMaterials(asset.scene,'journey');
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.camera.near=.5;sun.shadow.camera.far=40;sun.shadow.bias=-.0003;sun.shadow.normalBias=.04;
 const magma=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float time;float hash(vec2 n){return fract(sin(dot(n,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec2 uv=(p.xy+p.z*.37)*1.6+vec2(time*.09,-time*.12);float n=noise(uv)*.57+noise(uv*2.3)*.28+noise(uv*5.7)*.15;float cracks=pow(1.-abs(n-.49)*2.,9.);vec3 c=mix(vec3(.085,.009,.012),vec3(.92,.065,.004),smoothstep(.28,.53,n));c=mix(c,vec3(1.,.52,.022),cracks);gl_FragColor=vec4(c,1.);}`});
 for(const name of ['LavaRiver','LavaFalls'])get(name)?.traverse(o=>{if(o.isMesh)o.material=magma;});
 const stoneMat=new THREE.MeshStandardMaterial({color:'#211b20',roughness:.98});const stones=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),stoneMat,76),dummy=new THREE.Object3D();
 for(let i=0;i<76;i++){const side=i%4,u=((i*1.618)%1)*14-7;dummy.position.set(side<2?u:(side===2?-7.7:7.7),.5+(i%5)*.83,side<2?(side===0?-7.8:7.8):u);dummy.scale.set(.55+(i%3)*.3,.7+(i%4)*.23,.7);dummy.rotation.set(i*.67,i*.49,0);dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);}stones.castShadow=true;stones.receiveShadow=true;scene.add(stones);
 const loader=new THREE.TextureLoader();const [steak,receipt,cupWrap]=await Promise.all(['meaty.webp','entry-receipt.png','zagee-wrap.webp'].map(n=>loader.loadAsync('/assets/journey/'+n)));for(const t of [steak,receipt,cupWrap])t.colorSpace=THREE.SRGBColorSpace;
 const photo=world.plane(steak,2.43,1.367,[-5.1,1.6,-6.765]);photo.material=new THREE.MeshBasicMaterial({map:steak});
 world.label('□  □  □  □  □',[-5.1,.73,-6.72],2.1,42,'#fce7b9');
 const screen=world.plane(receipt,.47,1.02,[.7,1.65,-5.39]);screen.material=new THREE.MeshBasicMaterial({map:receipt});
 const lockedMap=texture(512,320,c=>{c.fillStyle='#101c31';c.fillRect(0,0,512,320);c.textAlign='center';c.fillStyle='#f3dfb8';c.font='26px sans-serif';c.fillText('H Y U N S U',256,100);c.font='18px sans-serif';c.fillText('PASSWORD  _ _ _ _ _',256,176);});
 const lockScreen=world.plane(lockedMap,1.64,.99,[.7,1.65,-5.38]);
 const phoneMap=texture(256,480,c=>{c.fillStyle='#b4cbdf';c.fillRect(0,0,256,480);c.fillStyle='#ffeb52';c.fillRect(52,105,186,82);c.fillStyle='#fff';c.fillRect(16,220,225,60);c.fillStyle='#172c38';c.font='20px sans-serif';c.fillText('5.16 어디 갈까?',67,149);c.font='17px sans-serif';c.fillText('222.44.444.66.1',25,257);});
 const phoneFace=world.plane(phoneMap,.27,.5,[-1.1,1.023,-4.95]);phoneFace.rotation.x=-Math.PI/2;
 world.label('현수의 감옥',[-5,3.96,-3.88],2.7,38,'#ebc687');world.label('작은 계단 ↑ 2F',[6.1,1.7,5.72],2,34,'#efddbb');
 const targetMat=new THREE.MeshBasicMaterial({visible:false});
 function target(id,name,desc,p,size,zone,offset=[0,0,1.6]){const t=new THREE.Mesh(new THREE.BoxGeometry(...size),targetMat);t.position.set(...p);t.userData={id,name,desc,stage:-1,zone,offset};scene.add(t);world.targets.push(t);return t;}
 target('journey-phone','책상 위 휴대폰','현수와 하영의 카톡 대화',[-1.1,1.06,-4.95],[.6,.3,.8],'hell');
 target('journey-lock','다섯 글자 자물쇠','현수가 갇힌 감옥 열기',[-3.8,1.45,-3.77],[.6,.7,.6],'hell');
 target('journey-photo','함께 먹었던 저녁 사진','사진 밑 다섯 칸 살펴보기',[-5.1,1.5,-6.55],[2.5,1.8,.3],'hell',[0,0,1.5]);
 target('journey-computer','현수의 컴퓨터','다섯 글자 비밀번호 입력',[.7,1.6,-5.4],[1.9,1.3,.3],'hell');
 target('journey-passport','여권과 여행 사진','중국 여행 소품 살펴보기',[2,.98,-5],[.8,.3,.8],'hell');
 target('journey-up','2층으로 가는 작은 계단','계단을 따라 올라가기',[6.15,.9,5.85],[2.3,1.7,.6],'hell',[0,0,1.6]);
 target('journey-down','아래층 계단','지옥의 책상으로 돌아가기',[6.15,6.7,-6.7],[2.3,1.6,.7],'church',[0,0,-.9]);
 for(let row=1;row<=6;row++)for(const [col,x]of [['A',-3.1],['B',1.5]])target('journey-pew-'+row+col,row+col+' 교회 좌석','좌석 아래 살펴보기',[x,6.65,5.9-(row-1)*1.65],[2.65,1.1,.7],'church',[0,0,1.0]);
 const crewTarget=target('journey-attendant','화가 난 승무원','길을 막고 있는 승무원',[2.5,6.75,-6.25],[.9,1.9,.8],'church');
 const boardTarget=target('journey-board','2F · 비행기 탑승문','승무원에게 탑승 안내 받기',[2.5,7.4,-7.72],[2.8,3.2,.35],'church');
 const gateStatus=world.label('탑승 대기 · 승무원에게 문의',[2.5,9.15,-7.66],2.7,29,'#f4d79d');
 const gateReady=world.label('탑승 시작 · 문 안으로 걸어오세요',[2.5,9.15,-7.66],2.7,27,'#b9ffe0');
 const gateLamp=new THREE.PointLight('#f0ce82',8,5,2);gateLamp.position.set(2.5,8.8,-8.8);scene.add(gateLamp);
 for(const [i,z]of [4,.2,-3.6].entries())for(const [col,x]of [['A',21.4],['B',26.6]])target('journey-seat-'+(i+1)+col,'FIRST '+(i+1)+col,'원하는 자리에 앉아 출발',[x,6.8,z],[1.35,1.7,1.9],'plane',[col==='A'?1.9:-1.9,0,0]);
 target('journey-land','비행기 출구','도착 후 레드카펫으로 내려가기',[24,7.2,-10.35],[2.4,2.6,.5],'plane');
 target('journey-dine','우리 둘의 식탁','현수와 나란히 앉기',[50,.9,.45],[3.2,1.5,1.5],'restaurant',[0,0,1.5]);
 target('journey-hyunsu','현수','함께 앉아 이야기 나누기',[52,1,.1],[1,2,1],'restaurant',[0,0,1.6]);
 target('journey-exit','500일로 향하는 문','컵에서 찾은 열쇠 사용',[50,1.6,-15.3],[2.8,3.2,.4],'restaurant');
 const bowl=new THREE.Group();scene.add(bowl);bowl.position.set(1.5,6.52,-2.35);
 function mesh(g,c,parent,p){const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:.57}));m.position.set(...p);parent.add(m);return m;}
 mesh(new THREE.CylinderGeometry(.3,.19,.17,24),'#312824',bowl,[0,0,0]);mesh(new THREE.CylinderGeometry(.26,.26,.018,24),'#f4e7d4',bowl,[0,.09,0]);
 for(let i=0;i<12;i++)mesh(new THREE.CapsuleGeometry(.025,.18,2,6),i%2?'#aa3045':'#3d9144',bowl,[Math.sin(i)*.15,.12,Math.cos(i)*.15]).rotation.z=1.3;
 mesh(new THREE.SphereGeometry(.07,16,10),'#ffb925',bowl,[0,.16,0]);
 const cup=new THREE.Group();cup.name='ZAGEE';scene.add(cup);cup.position.set(51,1.2,-.95);
 const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.115,.085,.29,48,1,true),new THREE.MeshStandardMaterial({map:cupWrap,color:'#ffffff',roughness:.78}));cup.add(wrap);wrap.rotation.y=-Math.PI/2;
 mesh(new THREE.CylinderGeometry(.125,.125,.045,32),'#101819',cup,[0,.17,0]);mesh(new THREE.CylinderGeometry(.01,.01,.27,8),'#f3ead9',cup,[.064,.3,0]).rotation.z=-.09;
 const key=new THREE.Group();scene.add(key);const ring=new THREE.Mesh(new THREE.TorusGeometry(.075,.016,8,20),new THREE.MeshStandardMaterial({color:'#ebc06a',metalness:.8,roughness:.25}));key.add(ring);mesh(new THREE.BoxGeometry(.025,.19,.025),'#ebc06a',key,[0,-.14,0]);mesh(new THREE.BoxGeometry(.075,.027,.025),'#ebc06a',key,[.025,-.22,0]);key.position.set(51,1.48,-.95);key.visible=false;
 const foods=[];const plateMat=new THREE.MeshStandardMaterial({color:'#bb232f',roughness:.34});
 for(const [i,f]of menu.entries()){
  const group=new THREE.Group();group.name='Food_'+f.id;scene.add(group);
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(.3,.23,.075,24),plateMat);group.add(plate);mesh(new THREE.CylinderGeometry(.264,.264,.015,24),'#fff1cd',group,[0,.047,0]);
  if(f.id==='watermelon'){for(let k=0;k<3;k++){const sl=mesh(new THREE.CylinderGeometry(.16,.16,.055,12,1,false,0,Math.PI),'#ec4b58',group,[.11*(k-1),.09,.02]);sl.rotation.z=1.1;mesh(new THREE.TorusGeometry(.163,.015,6,16,Math.PI),'#5c883b',sl,[0,.03,0]).rotation.x=Math.PI/2;}}
  else if(['beef','brisket'].includes(f.id)){for(let k=0;k<5;k++){const m=mesh(new THREE.CylinderGeometry(.055,.055,.25,10),f.color,group,[.075*(k-2),.12,0]);m.rotation.x=Math.PI/2;mesh(new THREE.TorusGeometry(.039,.012,6,12),'#efd1bf',m,[0,.127,0]).rotation.x=Math.PI/2;}}
  else if(['bokchoy','cilantro'].includes(f.id)){for(let k=0;k<7;k++){const a=k*2.4;const leaf=mesh(new THREE.SphereGeometry(.07,8,6),f.color,group,[Math.sin(a)*.14,.13,Math.cos(a)*.14]);leaf.scale.set(.65,1.5,1.1);mesh(new THREE.CylinderGeometry(.02,.026,.16,6),'#c8dc9c',group,[Math.sin(a)*.1,.1,Math.cos(a)*.1]).rotation.z=.7;}}
  else if(f.id==='noodles'){for(let k=0;k<15;k++){const n=mesh(new THREE.TorusGeometry(.09,.009,5,16),f.color,group,[(k%3-1)*.075,.075+Math.floor(k/3)*.013,0]);n.rotation.x=1.25;}}
  else if(f.id==='mushroom'){for(let k=0;k<4;k++){const x=(k%2-.5)*.2,z=(Math.floor(k/2)-.5)*.19;mesh(new THREE.CylinderGeometry(.025,.03,.13,8),'#e8d9c5',group,[x,.12,z]);mesh(new THREE.SphereGeometry(.085,10,6),f.color,group,[x,.2,z]).scale.y=.5;}}
  else for(let k=0;k<5;k++){const m=mesh(f.id==='tofu'?new THREE.BoxGeometry(.12,.1,.13):new THREE.SphereGeometry(.072,9,7),f.color,group,[(k%3-1)*.13,.13,Math.floor(k/3)*.13-.05]);if(f.id==='chicken')m.scale.set(1.3,.8,1);if(f.id==='quail')m.scale.set(.8,1.15,.8);}
  const servedPlate=group.clone(true);scene.add(servedPlate);servedPlate.visible=false;
  const label=world.label(f.name,[0,.5,0],.72,32,'#fff1d5');scene.remove(label);group.add(label);
  const t=target('journey-food-'+f.id,f.name,'레일에서 집어 현수에게 주기',[0,0,0],[.65,.55,.65],'restaurant',[0,0,1.7]);foods.push({group,servedPlate,target:t,id:f.id,phase:i/menu.length*Math.PI*2});
 }
 await installHyunsu(asset.scene,['JourneyHyunsu']);
 const npc=get('JourneyHyunsu'),attendant=get('JourneyAttendant'),door=get('PrisonDoor');
 const gateLeft=get('BoardingDoorLeft'),gateRight=get('BoardingDoorRight');
 if(gateLeft)gateLeft.position.x=state.served?.27:1.75;if(gateRight)gateRight.position.x=state.served?4.73:3.25;
 // The previous chapter authored hidden base heads alongside detailed heads.
 for(const root of [npc,attendant]){for(const o of root?.children||[])if(/^Head/.test(o.name)||/^Attendant_Head/.test(o.name))o.visible=false;}
 const emberGeo=new THREE.BufferGeometry(),pos=new Float32Array(90*3);for(let i=0;i<90;i++){pos[i*3]=(Math.random()-.5)*15;pos[i*3+1]=Math.random()*5;pos[i*3+2]=(Math.random()-.5)*15;}emberGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));const embers=new THREE.Points(emberGeo,new THREE.PointsMaterial({color:'#ff993e',size:.033,transparent:true,opacity:.75}));scene.add(embers);
 world.colliders=[];world.collisionBoxes=[];world.wallBoxes=[];world.addDust();world.dust.visible=false;world.toggleView(false);
 const rt={world,state,npc,attendant,foods,gateLeft,gateRight,cameraOn:false,scanProgress:0,flightElapsed:state.flight,transition:null,time:0,standingAfterFlight:false,
  gateClear(){return this.state.served&&gateLeft?.position.x<.45&&gateRight?.position.x>4.55;},
  place(zone){world.active=true;world.avatarPose='standing';const p=zone==='hell'?[0,0,4.6]:zone==='church'?[6.25,5.8,-7.0]:zone==='plane'?[24,5.8,6.7]:zone==='restaurant'?[50,4.8,12.5]:[50,0,-13.4];world.player.set(...p);world.lookAtPoint(zone==='hell'?[-2,1.5,-5]:zone==='church'?[-1,7.2,0]:zone==='plane'?[24,7,-8]:[50,2,-7]);this.light(zone);if(npc&&state.freed)npc.position.copy(world.player).add(V(.85,0,.5));},
  light(zone){const x=zone==='plane'?24:['restaurant','threshold'].includes(zone)?50:0;sun.position.set(x-3,zone==='church'||zone==='plane'?14:9,4);sun.target.position.set(x,zone==='church'||zone==='plane'?6:0,-4);const hell=zone==='hell';scene.background.set(hell?'#150a10':zone==='church'?'#e6e8df':zone==='plane'?'#adc5dc':'#36151c');scene.fog.color.copy(scene.background);hemi.intensity=hell?.24:zone==='restaurant'?.55:.7;sun.intensity=hell?.35:1.4;scene.environmentIntensity=hell?.08:.32;world.renderer.shadowMap.needsUpdate=true;lamps[0].intensity=hell?18:0;},
  sync(s){const old=this.state;this.state=s;
   if(old.zone!==s.zone){this.cameraOn=false;this.scanProgress=0;if(['hell','church'].includes(old.zone)&&['hell','church'].includes(s.zone)){this.transition={t:0,up:s.zone==='church'};world.active=false;world.keys.clear();}else this.place(s.zone);this.light(s.zone);}
   if(s.arrived&&!old.arrived){world.active=true;world.avatarPose='standing';this.standingAfterFlight=true;world.player.set(24,5.8,0);world.lookAtPoint([24,7,-10]);}
   screen.visible=s.computer;lockScreen.visible=!s.computer;photo.visible=s.freed;bowl.visible=s.zone==='church'&&!s.bowl&&!s.served;cup.visible=s.tea;key.visible=s.cupInspected&&!s.key;embers.visible=s.zone==='hell';
   for(const t of world.targets){const id=t.userData.id;t.visible=t.userData.zone===s.zone;if(id==='journey-photo')t.visible&&=s.freed;if(id==='journey-lock')t.visible&&=!s.freed;if(id.startsWith('journey-food-'))t.visible&&=s.dining&&!s.satisfied&&!s.chosen.includes(id.slice(13))&&!s.rejected.includes(id.slice(13));if(id==='journey-hyunsu')t.visible&&=s.dining;if(id==='journey-attendant'){t.userData.name=s.served?'미소 짓는 승무원':'화가 난 승무원';t.userData.desc=s.served?'즐거운 여행 되세요!':'배고픈 승무원에게 말 걸기';}}
   for(const f of foods){const i=s.chosen.indexOf(f.id);f.servedPlate.visible=i>=0;f.servedPlate.position.set(49+i*.66,1.07,-.84);}
   gateStatus.visible=!s.served;gateReady.visible=s.served;gateLamp.color.set(s.served?'#b9ffe0':'#f0ce82');boardTarget.userData.desc=s.served?'열린 문 안으로 걸어가 탑승':'탑승 대기 · 승무원에게 말 걸기';
   if(attendant){attendant.position.set(s.served?4.5:2.5,5.8,-6.25);attendant.rotation.y=s.served?-.65:0;crewTarget.position.x=attendant.position.x;}
  },
  ground(x,z){if(this.state.zone==='church')return 5.8;if(this.state.zone==='plane')return 5.8;if(['restaurant','threshold'].includes(this.state.zone)&&x>47.35&&x<52.65&&z>3.8)return clamp((z-3.8)/7*4.8,0,4.8);return 0;},
  blocked(x,z){const s=this.state;
   if(this.transition||s.seat&&!s.arrived&&s.zone==='plane')return true;
   if(s.zone==='hell'){if(Math.abs(x)>7.6||Math.abs(z)>7.6)return true;if(x>4.9&&z<5.5)return true;if(x> -2.15&&x<2.85&&z> -6.1&&z< -4.27)return true;if(!s.freed&&x< -3&&z< -3.6)return true;return false;}
   if(s.zone==='church'){if(x>1.3&&x<3.7&&z< -7.2&&z> -11.05)return z< -7.4&&!this.gateClear();if(x< -7.6||x>7.6||z< -7.6||z>7.6)return true;if(x>5&&z> -6)return true;for(let row=1;row<=6;row++){const zz=5.9-(row-1)*1.65;if(Math.abs(z-zz)<.48&&((x> -4.63&&x< -1.55)||(x>-.05&&x<3.04)))return true;}return false;}
   if(s.zone==='plane'){if(x<19.35||x>28.65||z< -10.5||z>8.4)return true;for(const zz of [4,.2,-3.6])if(Math.abs(z-zz)<1.42&&(Math.abs(x-21.4)<1.16||Math.abs(x-26.6)<1.16))return true;return false;}
   if(s.completed&&z< -15)return x<48.7||x>51.3||z< -20.5;
   if(x<38.5||x>61.5||z< -15.4||z>13.5)return true;if(z>4&&(x<47.4||x>52.6))return true;if(z<.55&&z> -8.55&&x>42.3&&x<57.7)return true;return false;
  },
  focus(t){world.player.copy(t.position).add(V(...t.userData.offset));world.player.y=this.ground(world.player.x,world.player.z);world.lookAtPoint(t.position.toArray());world.toggleView(false);},
  scanAligned(){if(!this.cameraOn||!this.state.computer||this.state.zone!=='hell')return false;const qr=V(.7,1.69,-5.375),p=qr.clone().project(world.camera);return Math.abs(p.x)<.15&&Math.abs(p.y)<.19&&p.z<1&&world.camera.position.distanceTo(qr)<2.8;},
  update(dt,time){this.time+=dt;magma.uniforms.time.value=this.time;const s=this.state;
   if(door)door.rotation.y=THREE.MathUtils.damp(door.rotation.y,s.freed?-1.65:0,3,dt);
   if(gateLeft)gateLeft.position.x=THREE.MathUtils.damp(gateLeft.position.x,s.served?.27:1.75,3,dt);
   if(gateRight)gateRight.position.x=THREE.MathUtils.damp(gateRight.position.x,s.served?4.73:3.25,3,dt);
   for(const n of ['FinalDoor','FinalDoorHandle']){const d=get(n);if(d)d.position.x=THREE.MathUtils.damp(d.position.x,s.completed?3:0,2,dt);}
   const num=get('FinalDoorNumber_500');if(num)num.position.x=THREE.MathUtils.damp(num.position.x,s.completed?53:50,2,dt);
   if(this.transition){this.transition.t+=dt;const f=clamp(this.transition.t/4.8,0,1),u=this.transition.up?f:1-f;world.player.set(6.25,u*5.8,6.1-u*13);world.yaw=this.transition.up?0:Math.PI;world.pitch=-.07;world.active=false;if(f===1){this.transition=null;world.active=true;this.place(s.zone);}}
   const a=embers.geometry.attributes.position;for(let i=0;i<a.count;i++){a.array[i*3+1]+=dt*.38;if(a.array[i*3+1]>5)a.array[i*3+1]=0;}a.needsUpdate=true;lamps[0].intensity=s.zone==='hell'?18+Math.sin(this.time*1.7)*2:0;
   for(const f of foods){const a=f.phase+this.time*.105;f.group.position.set(50+7*Math.cos(a),1.11,-4+2.1*Math.sin(a));f.target.position.copy(f.group.position).add(V(0,.2,0));f.group.visible=!s.chosen.includes(f.id)&&!s.rejected.includes(f.id);f.group.rotation.y=-a;}
   if(npc&&s.freed){if(s.dining&&['restaurant','threshold'].includes(s.zone)){npc.position.set(52,-.32,.12);npc.rotation.y=Math.PI;for(const o of npc.children)if(/Leg/.test(o.name))o.rotation.x=-1.25;}
    else if(s.zone==='plane'&&s.seat&&!s.arrived){const row=+s.seat[0],x=s.seat[1]==='A'?26.6:21.4;npc.position.set(x,6.04,[4,.2,-3.6][row-1]);npc.rotation.y=Math.PI;}
    else{const goal=world.player.clone().add(V(.85,0,.75));const d=npc.position.distanceTo(goal);if(d>15)npc.position.copy(goal);else if(d>.3)npc.position.lerp(goal,1-Math.exp(-dt*3));npc.position.y=world.player.y;npc.lookAt(world.player.x,npc.position.y,world.player.z);for(const o of npc.children)if(/Leg/.test(o.name))o.rotation.x=d>.6?Math.sin(this.time*8)*.3*(o.name.includes('-1')?-1:1):0;}}
  },
  afterUpdate(dt,time){const s=this.state;if(this.transition){world.camera.position.copy(world.player).add(V(0,1.63,0));world.camera.lookAt(world.player.clone().add(V(0,1.6,this.transition.up?-3:3)));world.avatar.visible=false;}
   if(world.active&&s.zone==='church'&&this.gateClear()&&world.player.z< -9.1&&world.player.x>1.3&&world.player.x<3.7)this.onBoard?.();
   if(s.zone==='plane'&&s.seat&&!s.arrived){world.active=false;world.avatar.visible=false;const z=[4,.2,-3.6][+s.seat[0]-1],x=s.seat[1]==='A'?21.4:26.6;world.player.set(x,5.8,z);world.camera.position.set(x,7.05,z+.18);const shake=world.motion?Math.sin(s.flight*32)*.017:0;world.camera.lookAt(x+shake,7.3+Math.sin(Math.min(1,s.flight/5)*Math.PI)*.75,z-8);world.camera.rotation.z=world.motion?Math.sin(s.flight*15)*.005:0;}
   if(key.visible){key.rotation.y=this.time;key.position.y=1.5+Math.sin(this.time*2)*.04;}
  }
 };
 world.journeyRuntime=rt;world.mode='journey';rt.place(state.zone);rt.sync(state);
 return rt;
}
