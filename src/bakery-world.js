import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import layout from './bakery-layout.json' with {type:'json'};
const V=(...p)=>new THREE.Vector3(...p);
export async function enterBakery(world,state){
 const asset=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/world-spaces/sungsimdang-room.glb');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#d3c5ac');scene.environment=world.scene.environment;scene.environmentIntensity=.45;
 world.scene=scene;world.model=asset.scene;scene.add(asset.scene,world.camera,world.avatar);world.mode='bakery-loading';world.state={stage:0,inventory:[]};world.targets=[];world.keys.clear();world.hit=null;world.ride=null;world.pendingAnimations=[];world.avatarPose='standing';world.camera.up.set(0,1,0);world.camera.far=55;world.camera.updateProjectionMatrix();world.renderer.toneMappingExposure=1.05;
 world.journeyRuntime=null;world.rescueRuntime=null;world.kitchenRuntime=null;world.arrivalRuntime=null;
 const get=n=>asset.scene.getObjectByName(n),safe=get('BakerySafeHinge'),cake=get('MangoSiruCake'),letter=get('BakeryLetterFragment'),drawer=get('BakeryCashDrawer'),keyItem=get('BakeryCakeKey'),usb=get('BakeryCakeUSB'),gate=get('Gate_01_to_02_Pivot');
 if(!safe||!cake||!letter)throw new Error('성심당 퍼즐 모델을 찾을 수 없습니다.');
 asset.scene.traverse(o=>{if(o.isMesh){o.castShadow=!o.name.startsWith('Removable ceiling');o.receiveShadow=true;}});
 scene.add(new THREE.HemisphereLight('#fff8e9','#766f57',1.3));
 const key=new THREE.DirectionalLight('#fff1d4',2.0);key.position.set(-2,3.8,3);key.target.position.set(0,0,-1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:30});key.shadow.bias=-.0004;key.shadow.normalBias=.035;scene.add(key,key.target);
 for(const p of [[-3.2,2.8,.1],[1,2.8,.1],[4.5,2.8,-2.3],[4,2.8,3],[-3.8,2.7,-4.5]]){const l=new THREE.PointLight('#ffe8bd',14,8,2);l.position.set(...p);scene.add(l);}
 const safeLight=new THREE.PointLight('#fff1c5',.35,1.8,2);safeLight.position.set(1,1.38,-4.1);scene.add(safeLight);
 world.renderer.shadowMap.enabled=true;world.renderer.shadowMap.autoUpdate=false;world.renderer.shadowMap.needsUpdate=true;
 const mat=new THREE.MeshBasicMaterial({visible:false});
 function target(id,name,desc,p,size,offset=[0,0,1.65]){const t=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);t.position.set(...p);t.userData={id,name,desc,stage:-1,offset};scene.add(t);world.targets.push(t);return t;}
 target('bakery-order','계산을 기다리는 빵','데스크 위 빵의 품목과 수량 확인',layout.order,[2.5,.3,1.75],[0,0,1.7]);
 const registerTarget=target('bakery-register','계산대 키패드','빵값 합계로 비밀번호 입력',layout.register,[1.18,.93,.16],[0,0,1.75]);
 const keyTarget=target('bakery-key','열린 서랍 속 열쇠','망고시루 금고 열쇠 챙기기',layout.key,[.5,.20,.48],[0,0,1.0]);
 const safeTarget=target('bakery-safe','망고시루 금고','계산대에서 얻은 열쇠로 열기',layout.safe,[1.45,.68,.12],[0,0,1.35]);
 const letterTarget=target('bakery-letter','쟁반 아래 종이 귀퉁이','명란바게트 옆에 숨겨진 종이',layout.letter,[.28,.14,.40],[-1.15,0,.75]);
 const cakeTarget=target('bakery-cake','망고시루 케이크','열린 금고에서 케이크 꺼내기',layout.cake,[.68,.50,.65],[0,0,1.8]);
 target('bakery-next','포스텍으로 향하는 문','두 번째 기억의 장소',layout.gate,[2.03,2.7,.2],[0,0,1.65]);
 for(const [id,name,x,z]of [['soboro','튀김소보로',-2.25,2.13],['guma','튀소구마',-.65,2.13],['buchu','판타롱부추빵',.95,2.13],['baguette','명란바게트',-2.25,.50],['meari','보문산메아리',-.65,.50]]){
  target('bakery-price-'+id,name+' 가격표','개당 가격 확인',[x+layout.displayShift[0],1.29,z],[.85,.32,.10],z<1?[0,0,-1.8]:[0,0,1.35]);
 }
 world.colliders=layout.colliders;
 world.wallBoxes=[new THREE.Box3(V(-8.4,0,-7),V(8.4,4.3,-6.552)),new THREE.Box3(V(-8.4,0,-7),V(-7.98,4.3,7)),new THREE.Box3(V(7.98,0,-7),V(8.4,4.3,7)),new THREE.Box3(V(-8.4,0,6.72),V(8.4,4.3,7.14))];
 world.collisionBoxes=[...world.wallBoxes,...world.colliders.map(([a,b,c,d])=>new THREE.Box3(V(a,0,c),V(b,1.2,d)))];world.addDust();world.dust.visible=false;world.toggleView(false);
 const drawerZ=drawer.position.z;
 const rt={state,safe,cake,letter,drawer,gate,usb,drawerZ,
  sync(s){this.state=s;cake.visible=!s.cakeTaken;letter.visible=!s.letterTaken;letterTarget.visible=!s.letterTaken;cakeTarget.visible=s.safeOpen&&!s.cakeTaken;safeTarget.visible=!s.safeOpen;keyItem.visible=!s.keyTaken;keyTarget.visible=s.drawerOpen&&!s.keyTaken;usb.visible=s.bites===3&&!s.usbTaken;registerTarget.userData.desc=s.drawerOpen?'잠금 해제 · 아래 서랍 확인':'빵값 합계로 비밀번호 입력';safeLight.intensity=s.safeOpen?.6:.1;world.renderer.shadowMap.needsUpdate=true;},
  update(dt){const before=safe.rotation.y,previousDrawer=drawer.position.z,previousGate=gate.rotation.y;safe.rotation.y=THREE.MathUtils.damp(before,this.state.safeOpen?-1.85:0,4,dt);drawer.position.z=THREE.MathUtils.damp(drawer.position.z,drawerZ+(this.state.drawerOpen?.62:0),4,dt);keyTarget.position.z=layout.key[2]-.62+drawer.position.z-drawerZ;gate.rotation.y=THREE.MathUtils.damp(gate.rotation.y,this.state.usbTaken?-1.55:0,3,dt);if(Math.abs(safe.rotation.y-before)+Math.abs(drawer.position.z-previousDrawer)+Math.abs(gate.rotation.y-previousGate)>.0001)world.renderer.shadowMap.needsUpdate=true;},
  blocked(x,z){const [left,right,back,front]=layout.bounds;if(x<left||x>right||z<back||z>front)return true;return world.colliders.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22);},
  focus(t){let p=t.position.clone().add(V(...t.userData.offset));if(this.blocked(p.x,p.z)){p=t.position.clone().add(V(0,0,1.6));if(this.blocked(p.x,p.z))p.set(-3.8,0,.8);}world.player.set(p.x,0,p.z);world.lookAtPoint(t.position.toArray());world.toggleView(false);}
 };
 world.bakeryRuntime=rt;world.mode='bakery';safe.rotation.y=state.safeOpen?-1.85:0;drawer.position.z=drawerZ+(state.drawerOpen?.62:0);gate.rotation.y=state.usbTaken?-1.55:0;rt.sync(state);world.player.set(...layout.spawn);world.lookAtPoint([2.9,1.45,-2.6]);world.active=true;return rt;
}
