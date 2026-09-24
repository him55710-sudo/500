import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {polishRoomMaterials} from './render-look.js';
import {addInteriorDetails,detailColliders} from './interior-details.js';
import {arrivalBlocked} from './arrival-state.js';
const v=p=>new THREE.Vector3(...p),loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const phases={boarding:'하영이가 탑승하고 있어요',lift:'천천히, 하늘 가까이',drop:'우리의 다음 기억을 향해서',corkscrew:'두 번의 회전, 꼭 잡아!',return:'두 번째 방이 가까워지고 있어요',arrival:'구름 위 원형 홀에 도착했어요'};

export function trackPose(path,distance){
 const a=path.samples;let lo=0,hi=a.length-1;
 while(lo<hi){const mid=(lo+hi)>>1;if(a[mid].s<distance)lo=mid+1;else hi=mid;}
 const j=Math.max(1,lo),p=a[j-1],q=a[j],t=THREE.MathUtils.clamp((distance-p.s)/(q.s-p.s),0,1);
 const position=v(p.p).lerp(v(q.p),t),forward=v(q.p).sub(v(p.p)).normalize(),up=v(p.up).lerp(v(q.up),t).normalize();
 if(distance<0)position.addScaledVector(forward,distance);
 const right=new THREE.Vector3().crossVectors(forward,up).normalize();up.crossVectors(right,forward).normalize();
 const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,forward.clone().negate()));
 return {position,forward,up,quaternion,phase:q.phase};
}

function sceneFor(world,color,fogDensity=.0018){
 const previous=world.scene;
 if(world.mode==='coaster'||world.mode==='rotunda'){
  const geometries=new Set(),materials=new Set();
  previous.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(p===world.avatar||p===world.camera)return;geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
  for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}
 }
 const scene=new THREE.Scene();scene.background=new THREE.Color(color);scene.fog=new THREE.FogExp2(color,fogDensity);scene.environment=world.scene.environment;scene.environmentIntensity=.4;
 scene.add(new THREE.HemisphereLight('#f5faff','#546b82',.95));const sun=new THREE.DirectionalLight('#fffaf3',2.1);sun.position.set(-35,70,30);scene.add(sun);
 world.scene=scene;scene.add(world.camera);world.camera.far=650;world.camera.updateProjectionMatrix();world.camera.up.set(0,1,0);
 world.renderer.shadowMap.enabled=false;world.renderer.toneMappingExposure=1;world.targets=[];world.hit=null;world.pendingAnimations=[];world.keys.clear();world.held.visible=false;world.thirdHeld.visible=false;
 return scene;
}
function placard(world,text,position,width=4){const p=world.label(text,position,width,31,'#183b57');p.material.depthWrite=true;return p;}

export async function beginTransfer(world,{onStatus,onArrive,onSound,onProgress}){
 const [environment,car,arrival,data]=await Promise.all([loader.loadAsync('/assets/coaster-environment.glb'),loader.loadAsync('/assets/coaster-car.glb'),loader.loadAsync('/assets/room-two-rotunda.glb'),fetch('/assets/coaster-path.json').then(r=>{if(!r.ok)throw new Error('레일 경로를 불러오지 못했어요.');return r.json();})]);
 onProgress?.(1);if(!world.mode)world.salonScene=world.scene;const scene=sceneFor(world,'#c5dfec');scene.add(environment.scene);world.model=environment.scene;world.mode='coaster';world.state={stage:0,inventory:[]};world.toggleView(false);
 const cars=[];for(let i=0;i<6;i++){const c=car.scene.clone(true);c.name='CoasterCar'+i;scene.add(c);cars.push(c);}
 arrival.scene.position.set(55,2,110);arrival.scene.rotation.y=Math.PI;scene.add(arrival.scene);
 const bridge=new THREE.Mesh(new THREE.BoxGeometry(3.7,.18,17),new THREE.MeshStandardMaterial({color:'#eee4d5',roughness:.85}));bridge.position.set(55,2.22,92.5);scene.add(bridge);
 for(const c of cars){const badge=world.label('BLACK HOLE 2000',[0,.78,-1.715],1.35,25,'#fff4da');c.add(badge);badge.rotation.y=Math.PI;}
 const avatar=world.avatar;cars[0].add(avatar);avatar.rotation.set(0,Math.PI,0);avatar.position.set(-.43,.08,-.68);avatar.visible=false;
 world.avatarPose='standing';world.playAvatarAnimation('Walk',0);
 placard(world,'BLACK HOLE 2000',[-1.5,5.55,74.65],5.3);
 placard(world,'HAYOUNG  ·  NEXT MEMORY',[-2.8,3.4,39],2.6);
 placard(world,'02  /  THE CIRCULAR ROOM',[58,4.5,87],5);
 let elapsed=0,distance=30,speed=0,finished=false,lastPhase='';
 // The complete ride is seen from the front seat at Hayoung’s eye level.
 const localEye=new THREE.Vector3(-.43,1.62,-.78),baseFov=world.camera.fov;
 function status(phase){if(phase!==lastPhase){lastPhase=phase;onStatus?.(phases[phase]);}}
 world.ride={cars,path:data,get progress(){return distance/data.length;},get phase(){return lastPhase;},get distance(){return distance;},get speed(){return speed;},
  update(dt){
   if(!world.active||finished)return;elapsed+=dt;
   const front=trackPose(data,distance);let phase=elapsed<4?'boarding':front.phase;
   if(elapsed>=4){
    const remaining=data.length-distance;
    let target=front.phase==='lift'?5.8:THREE.MathUtils.clamp(Math.sqrt(Math.max(36,2*9.8*(34.7-front.position.y)))*.85,9,24);
    if(remaining<46)target=Math.min(target,Math.max(2,Math.sqrt(remaining)*1.25));
    speed=THREE.MathUtils.damp(speed,target,1.2,dt);distance=Math.min(data.length,distance+speed*dt);
   }
   for(let i=0;i<cars.length;i++){const pose=trackPose(data,distance-i*3.9);cars[i].position.copy(pose.position);cars[i].quaternion.copy(pose.quaternion);}
   // The initial four seconds show Hayoung stepping from the platform into her seat.
   const board=THREE.MathUtils.smoothstep(elapsed,0,3.2);avatar.position.x=THREE.MathUtils.lerp(-2.75,-.43,board);avatar.position.y=THREE.MathUtils.lerp(.30,.08,board);
   avatar.rotation.y=THREE.MathUtils.lerp(Math.PI/2,Math.PI,THREE.MathUtils.smoothstep(board,.5,1));
   const boarding=elapsed<3.15;world.playAvatarAnimation(boarding?'Walk':'Idle_Neutral');world.avatarPose=boarding?'standing':'ride';
   world.player.copy(cars[0].position);cars[0].updateMatrixWorld(true);avatar.visible=false;
   const pose=trackPose(data,distance),target=cars[0].localToWorld(localEye.clone());
   const speedFactor=THREE.MathUtils.clamp(speed/24,0,1),desiredFov=baseFov+(world.motion?7*speedFactor:0);if(Math.abs(world.camera.fov-desiredFov)>.05){world.camera.fov=THREE.MathUtils.damp(world.camera.fov,desiredFov,4,dt);world.camera.updateProjectionMatrix();}
   world.camera.position.copy(target);if(world.motion){const shake=.004+speedFactor*.012;world.camera.position.addScaledVector(pose.up,Math.sin(elapsed*29)*shake);}world.camera.up.copy(world.motion?pose.up:new THREE.Vector3(0,1,0));world.camera.lookAt(target.clone().addScaledVector(pose.forward,15));
   world.camera.updateMatrixWorld();status(phase);onSound?.(speed,phase,dt);
   if(distance>=data.length){finished=true;speed=0;status('arrival');onSound?.(0,'arrival',dt);onArrive();}
  }
 };
 world.ride.update(0);
}

export async function enterRotunda(world,state,{onEnter}={}){
 const gltf=await loader.loadAsync('/assets/room-two-rotunda.glb');const scene=sceneFor(world,'#eadce6',.003);scene.add(gltf.scene);world.model=gltf.scene;
 world.avatar.rotation.set(0,Math.PI,0);world.avatar.position.set(0,0,10);gltf.scene.add(world.avatar);
 world.avatarPose='standing';world.playAvatarAnimation('Idle_Neutral');
 world.mode='rotunda';world.state={stage:0,inventory:[]};world.player.set(0,0,10.6);world.yaw=-.16;world.pitch=-.26;world.toggleView(false);world.thirdHeld.visible=true;world.ride=null;
 world.wallBoxes=[];world.colliders=detailColliders.rotunda;world.collisionBoxes=world.colliders.map(([a,b,c,d])=>new THREE.Box3(v([a,0,c]),v([b,1,d])));
 for(let i=0;i<48;i++){const a=i*Math.PI*2/48,x=13.8*Math.cos(a),z=13.8*Math.sin(a);world.collisionBoxes.push(new THREE.Box3(v([x-.55,0,z-.55]),v([x+.55,7,z+.55])));}
 placard(world,'200일  /  우리의 네 가지 식탁',[0,4.1,-12.58],3.3);
 const south=placard(world,'02  ·  OUR NEXT CHAPTER',[0,4.1,13.22],3.3);south.rotation.y=Math.PI;
 const material=new THREE.MeshBasicMaterial({visible:false});
 function target(id,name,desc,p,size){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),material);o.position.set(...p);o.userData={id,name,desc,stage:-1,offset:[0,0,1.7]};scene.add(o);world.targets.push(o);return o;}
 const brass=new THREE.MeshStandardMaterial({color:'#c69a48',metalness:.78,roughness:.25});
 const wood=new THREE.MeshStandardMaterial({color:'#223d3a',roughness:.55});
 const dark=new THREE.MeshBasicMaterial({color:'#010403'});
 function box(parent,p,size,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);o.position.set(...p);parent.add(o);return o;}
 // A solid panelled door hides a lightless vestibule until the floor key is used.
 for(const x of [-1.43,1.43])box(scene,[x,1.97,-12.8],[.22,3.94,.35],brass);
 box(scene,[0,3.93,-12.8],[3.08,.2,.35],brass);
 box(scene,[0,1.95,-15.45],[3.2,3.9,.15],dark);
 box(scene,[0,-.04,-14.1],[3.1,.12,3.1],dark);
 box(scene,[0,3.96,-14.1],[3.1,.15,3.1],dark);
 for(const x of [-1.48,1.48])box(scene,[x,1.96,-14.1],[.15,4,3.1],dark);
 const hinge=new THREE.Group();hinge.position.set(-1.27,0,-12.8);scene.add(hinge);
 box(hinge,[1.27,1.89,0],[2.54,3.78,.17],wood);
 for(const y of [.9,2.62]){
  box(hinge,[1.27,y,.1],[2.16,1.44,.05],brass);
  box(hinge,[1.27,y,.135],[2.07,1.35,.05],wood);
 }
 box(hinge,[2.2,1.76,.14],[.16,.43,.08],brass);
 box(hinge,[2.13,1.83,.23],[.29,.07,.09],brass);
 const keyhole=new THREE.Mesh(new THREE.CircleGeometry(.045,16),dark);keyhole.position.set(2.2,1.64,.19);hinge.add(keyhole);
 const doorTarget=target('arrival-door','잠긴 요리방 문','열쇠 구멍이 있는 문 · E로 살펴보기',[0,1.65,-12.6],[2.55,3.4,.5]);
 // The key rests on the floor: raised metal, two teeth and a round bow, with a quiet glint.
 const key=new THREE.Group();key.position.set(1.35,.10,7.65);key.rotation.y=-.48;scene.add(key);
 const bow=new THREE.Mesh(new THREE.TorusGeometry(.19,.045,8,28),brass);bow.rotation.x=Math.PI/2;key.add(bow);
 box(key,[.38,0,0],[.43,.075,.085],brass);
 box(key,[.55,0,.10],[.09,.075,.2],brass);box(key,[.39,0,.085],[.08,.075,.17],brass);
 const glint=new THREE.PointLight('#ffe5a2',1.5,2);glint.position.set(1.5,.45,7.7);scene.add(glint);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.575,48),new THREE.MeshBasicMaterial({color:'#b38a3b',transparent:true,opacity:.35,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(1.55,.018,7.7);scene.add(ring);
 const keyTarget=target('arrival-key','바닥에 떨어진 열쇠','E · 황동 열쇠 줍기',[1.55,.20,7.7],[1.1,.38,.9]);
 let current=state,entering=false;
 world.arrivalRuntime={
  hinge,key,get state(){return current;},
  sync(next,snap=false){current=next;key.visible=keyTarget.visible=ring.visible=glint.visible=!next.keyTaken;doorTarget.visible=!next.doorUnlocked;if(snap)hinge.rotation.y=next.doorUnlocked?-Math.PI*.52:0;},
  blocked:(x,z)=>arrivalBlocked(x,z,hinge.rotation.y)||world.colliders.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22),
  update(dt,time){hinge.rotation.y=THREE.MathUtils.damp(hinge.rotation.y,current.doorUnlocked?-Math.PI*.52:0,3.5,dt);ring.material.opacity=.28+Math.sin(time*2)*.1;glint.intensity=1.3+Math.sin(time*2)*.35;},
  afterUpdate(){if(world.active&&!entering&&current.doorUnlocked&&hinge.rotation.y< -1.45&&world.player.z< -14.2&&Math.abs(world.player.x)<1.08){entering=true;onEnter?.();}}
 };
 world.arrivalRuntime.sync(state,true);
 // Rose sky and restrained cloud clusters beyond the open dome.
 const cloudMat=new THREE.MeshBasicMaterial({color:'#fff7ee'}),cloudGeo=new THREE.SphereGeometry(1,12,8);
 for(let i=0;i<28;i++){const a=i*.9,o=new THREE.Mesh(cloudGeo,cloudMat);o.position.set(Math.cos(a)*(22+i%4*3),8+(i%5)*2,Math.sin(a)*(22+i%4*3));o.scale.set(6,1.8,3.2);scene.add(o);}
 world.addDust();world.dust.material.color.set('#fff1df');world.dust.material.opacity=.20;
 world.scene.updateMatrixWorld(true);await addInteriorDetails(world,'rotunda');polishRoomMaterials(world.model,'rotunda');world.renderer.toneMappingExposure=1;
}
