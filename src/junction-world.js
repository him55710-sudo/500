import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {installHyunsu} from './hyunsu-character.js';
import {layout,redLines} from './junction-state.js';
const V=(...a)=>new THREE.Vector3(...a),clamp=THREE.MathUtils.clamp;
export const mazePoint=([c,r])=>[(c-(layout.columns-1)/2)*layout.cellSize,r*layout.cellSize];
const shifts={red:[layout.red[0]+6.8,0,layout.red[2]+3.5],blue:[layout.blue[0]-6.8,0,layout.blue[2]+3.5],signal:[layout.signal[0],0,layout.signal[2]+3.5]};
const at=(zone,p)=>p.map((v,i)=>v+shifts[zone][i]);
export function mazeWalls(){const cells=mazeCells(),walls=[],h=layout.cellSize/2;for(let r=0;r<layout.rows;r++)for(let c=0;c<layout.columns;c++)if(!cells.has(c+','+r)){const [x,z]=mazePoint([c,r]);walls.push([x-h,x+h,z-h,z+h]);}return walls;}

export function mazeCells(){if(layout.openCells)return new Set(layout.openCells.map(p=>p.join(',')));const cells=new Set();for(const points of [layout.route,...layout.branches])for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=Math.sign(b[0]-a[0]),dz=Math.sign(b[1]-a[1]),n=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);for(let j=0;j<=n;j++)cells.add(`${a[0]+dx*j},${a[1]+dz*j}`);}return cells;}
function panel(scene,pos,w,h,color='#cce7fa'){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.position.set(...pos);scene.add(mesh);let last='';
 return {mesh,draw(lines){let text=lines.join('\n');if(text===last)return;last=text;ctx.fillStyle='#060f1c';ctx.fillRect(0,0,1024,512);ctx.strokeStyle=color;ctx.lineWidth=4;ctx.strokeRect(20,20,984,472);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 45px "Malgun Gothic",sans-serif';lines.forEach((s,i)=>ctx.fillText(s,512,256+(i-(lines.length-1)/2)*86,940));texture.needsUpdate=true;}};
}
export async function enterJunction(world,state){
 const asset=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/world-spaces/junction-finale.glb');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#090310');scene.environment=world.scene.environment;scene.environmentIntensity=.14;world.scene=scene;world.model=asset.scene;scene.add(asset.scene,world.camera,world.avatar);world.mode='junction-loading';world.state={stage:0,inventory:[]};world.targets=[];world.keys.clear();world.hit=null;world.ride=null;world.pendingAnimations=[];world.avatarPose='standing';world.camera.up.set(0,1,0);world.camera.far=90;world.camera.updateProjectionMatrix();world.renderer.toneMappingExposure=.96;world.bakeryRuntime=null;world.journeyRuntime=null;world.rescueRuntime=null;world.kitchenRuntime=null;world.arrivalRuntime=null;
 world.held.visible=false;for(const a of Object.values(world.heldItems))a.visible=false;
 const get=n=>asset.scene.getObjectByName(n),coat=get('RewardCoat'),ipad=get('IPad'),envelope=get('Envelope');
 for(const n of ['RedScreen','BlueScreen','SignalRed','SignalYellow','SignalBlue','Minion_0','Minion_1','Minion_2','JunctionHyunsu'])if(!get(n))throw new Error('강당 오브젝트 누락: '+n);
 asset.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 const [npc]=await installHyunsu(asset.scene,['JunctionHyunsu']);npc.position.set(2.3,0,-7.7);
 scene.add(new THREE.HemisphereLight('#9a77d4','#120919',.65));const sun=new THREE.DirectionalLight('#ab8ce3',1.0);sun.position.set(-10,24,30);sun.target.position.set(0,0,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-32,right:32,top:36,bottom:-36,near:.1,far:80});sun.shadow.normalBias=.035;scene.add(sun,sun.target);
 for(const [pos,color,power] of [[at('red',[-6.8,3.8,-3.1]),'#fa3657',22],[at('blue',[6.8,3.8,-3.1]),'#3477ff',26],[at('signal',[0,4.2,-2.7]),'#b085ef',28],[[0,5,-8],'#bcb1ee',55]]){const l=new THREE.PointLight(color,power,8,2);l.position.set(...pos);scene.add(l);}
 world.renderer.shadowMap.enabled=true;world.renderer.shadowMap.autoUpdate=false;world.renderer.shadowMap.needsUpdate=true;
 const targets={},invisible=new THREE.MeshBasicMaterial({visible:false});
 const target=(id,name,desc,p,size=[1,1,1],offset=[0,0,1.65])=>{const t=new THREE.Mesh(new THREE.BoxGeometry(...size),invisible);const zone=id.startsWith('junction-red')||id==='junction-green-button'?'red':['junction-blue','junction-victory','junction-top','junction-bin','junction-coat'].includes(id)?'blue':id==='junction-yellow'?'signal':null;t.position.set(...(zone?at(zone,p):p));t.userData={id,name,desc,stage:-1,offset};scene.add(t);world.targets.push(t);targets[id]=t;return t;};
 target('junction-red','빨강 모니터','USB와 방향키 잠금, 빨강·초록 버튼',[-6.8,1.82,-3.75],[2.5,1.4,.2]);
 target('junction-red-button','빨강 버튼','현재 구절에 빨강 한 번 입력',[-7.42,1.25,-3.05],[.38,.20,.38],[0,0,1.0]);
 target('junction-green-button','초록 버튼','현재 구절에 초록 한 번 입력',[-6.18,1.25,-3.05],[.38,.20,.38],[0,0,1.0]);
 target('junction-blue','파랑 모니터','BLUE에 남은 것, 그 사이의 시간',[6.8,1.82,-3.75],[2.45,1.4,.2]);
 target('junction-victory','VICTORY 탄산수','탄산수 집기',[5.6,1.42,-3.36],[.35,.65,.35],[0,0,1.2]);
 target('junction-top','T.O.P 커피','커피 집기',[7.9,1.42,-3.36],[.35,.65,.35],[0,0,1.2]);
 target('junction-bin','쓰레기통','들고 있는 물건 버리기',[8.6,.55,-3.3],[.95,1,.95]);
 target('junction-coat','뒤에 +5가 새겨진 옷','직접 들어 뒤쪽 살펴보기',[6.8,.77,-2.70],[1.2,.85,.2],[0,0,1.1]);
 target('junction-yellow','가운데 신호등과 제단','미니언 인형 세 개 놓기',[0,1.0,-2.7],[2.4,.8,.9]);
 target('junction-hyunsu','현수','옷을 입히고 마음 전하기',[2.3,1.15,-7.7],[1.1,2,.85],[0,0,1.7]);
 target('junction-ipad','세 빛이 남긴 아이패드','현수의 마지막 편지 읽기',[0,1.65,-8],[1.1,1.5,.25]);
 target('junction-envelope','편지봉투','500일 편지 직접 쓰기',[2.4,.75,-7.5],[.85,.7,.25],[1.25,0,1.25]);
 layout.minions.forEach(([c,r],i)=>target('junction-minion-'+i,'미니언 인형 '+(i+1),'인형 챙기기',[mazePoint([c,r])[0],.53,mazePoint([c,r])[1]],[.8,1,.8],[0,0,.7]));
 const walls=mazeWalls();
 const prop=(zone,[a,b,c,d])=>[a+shifts[zone][0],b+shifts[zone][0],c+shifts[zone][2],d+shifts[zone][2]];
 const props=[prop('red',[-8.23,-5.37,-4.36,-2.94]),prop('blue',[5.37,8.23,-4.36,-2.94]),prop('signal',[-1.18,1.18,-3.14,-2.27]),prop('signal',[-.75,.75,-4.2,-3.2]),prop('blue',[8.13,9.07,-3.77,-2.83])];
 world.colliders=[...walls,...props];const wallBoxes=walls.map(([a,b,c,d])=>new THREE.Box3(V(a,0,c),V(b,layout.wallHeight,d)));world.wallBoxes=wallBoxes;world.collisionBoxes=[...wallBoxes,...props.map(([a,b,c,d])=>new THREE.Box3(V(a,0,c),V(b,1.3,d)))];
 world.addDust();world.dust.visible=false;world.toggleView(false);
 const redPanel=panel(scene,at('red',[-6.8,1.82,-3.727]),2.2,1.06,'#ff8a94'),bluePanel=panel(scene,at('blue',[6.8,1.82,-3.727]),2.2,1.06,'#7dcfff');
 const ipadPanel=panel(scene,[0,1.66,-7.935],.84,1.12,'#f4d3e1');ipadPanel.draw(['하영아,','잘 지냈지?','500']);
 // Clone lamp materials so activating one colour never changes another prop.
 const lamps=['Red','Yellow','Blue'].map(cc=>{const meshes=[];get('Signal'+cc).traverse(o=>{if(o.isMesh){o.material=o.material.clone();meshes.push(o);}});return meshes;});
 function beam(a,b,color,r=.11){const d=b.clone().sub(a),group=new THREE.Group();scene.add(group);for(const [rad,op]of [[r*3,.10],[r,.66],[r*.20,.94]]){const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,d.length(),16,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());group.add(m);}return group;}
 const origins=[V(...at('red',[-6.8,2.55,-3.8])),V(...at('blue',[6.8,2.55,-3.8])),V(...at('signal',[0,4.1,-3.7]))],colors=['#ff274b','#287aff','#ffd943'];const beams=origins.map((p,i)=>beam(p,V(p.x,13,p.z),colors[i]));const joins=origins.map((p,i)=>beam(V(p.x,6.5,p.z),V(0,6.5,-8),colors[i],.065));const centerBeam=beam(V(0,6.5,-8),V(0,1.4,-8),'#ffe9e1',.17);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.58,.045,10,48),new THREE.MeshBasicMaterial({color:'#ffdaca',transparent:true,opacity:.8}));halo.rotation.x=Math.PI/2;halo.position.set(0,6.5,-8);scene.add(halo);
 const outfit=[];npc.traverse(o=>{if(!o.isMesh)return;const source=Array.isArray(o.material)?o.material:[o.material];const mats=source.map(m=>{if(!/Polo navy knit|TOMBOY charcoal wool/.test(m.name))return m;const copy=m.clone();outfit.push({material:copy,color:copy.color.clone()});return copy;});o.material=Array.isArray(o.material)?mats:mats[0];});
 const cloth=new THREE.Group();npc.add(cloth);const clothMark=world.label('+5',[0,1.2,-.25],.42,70,'#ef2448',Math.PI);scene.remove(clothMark);cloth.add(clothMark);
 const heldCoat=coat.clone(true);heldCoat.position.set(.43,-.47,-.85);heldCoat.scale.multiplyScalar(.35);heldCoat.rotation.y=Math.PI;world.camera.add(heldCoat);
 const offered=layout.minions.map((_,i)=>{const m=get('Minion_'+i).clone(true);m.scale.multiplyScalar(.52);m.position.set(...at('signal',[(i-1)*.67,1.03,-2.7]));scene.add(m);return m;});
 const heartShape=new THREE.Shape();for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,x=16*Math.sin(a)**3,y=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);i?heartShape.lineTo(x*.035,y*.035):heartShape.moveTo(x*.035,y*.035);}const heartGeo=new THREE.ExtrudeGeometry(heartShape,{depth:.13,bevelEnabled:true,bevelSize:.025,bevelThickness:.035,bevelSegments:2,steps:1});
 const hearts=[-.58,.58].map(x=>{const m=new THREE.Mesh(heartGeo,new THREE.MeshStandardMaterial({color:'#ff507c',emissive:'#eb164c',emissiveIntensity:.5,metalness:.2,roughness:.26}));m.position.set(x,9,-8);scene.add(m);return m;});
 const confetti=[];for(let i=0;i<50;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.055,.15),new THREE.MeshBasicMaterial({color:[0xff7498,0xffd97d,0xcaf6ff][i%3],side:THREE.DoubleSide}));scene.add(m);confetti.push(m);}
 const rt={state,time:0,npc,coat,heldCoat,ipad,beams,lamps,hearts,targets,
  sync(s){this.state=s;for(let i=0;i<3;i++){get('Minion_'+i).visible=!s.minions.includes(i);targets['junction-minion-'+i].visible=!s.minions.includes(i);offered[i].visible=s.offered;}
   for(const [id,node]of [['victory','VictoryBottle'],['top','TopCoffee']]){get(node).visible=!s.drinks.includes(id);targets['junction-'+id].visible=!s.drinks.includes(id);}
   coat.visible=s.coatSpawned&&!s.coatTaken;targets['junction-coat'].visible=coat.visible;heldCoat.visible=s.coatTaken&&!s.dressed;cloth.visible=s.dressed;outfit.forEach(({material,color})=>material.color.copy(s.dressed?new THREE.Color('#e8dfcc'):color));
   const tablet=s.yellowSolved&&!s.letterSent;ipad.visible=tablet;ipadPanel.mesh.visible=tablet;targets['junction-ipad'].visible=s.phase==='tablet';envelope.visible=s.tabletRead&&!s.letterSent;targets['junction-envelope'].visible=envelope.visible;
   const done=[s.redSolved,s.yellowSolved,s.blueSolved];lamps.forEach((ms,i)=>ms.forEach(m=>{const c=new THREE.Color([0xff183d,0xffd131,0x177aff][i]);m.material.color.copy(c).multiplyScalar(done[i]?1:.09);m.material.emissive.copy(c);m.material.emissiveIntensity=done[i]?3:0;}));
   beams[0].visible=s.redSolved;beams[1].visible=s.blueSolved;beams[2].visible=s.yellowSolved;joins.forEach(o=>o.visible=s.yellowSolved);centerBeam.visible=s.yellowSolved&&!s.letterSent;halo.visible=s.yellowSolved;
   redPanel.draw(s.redSolved?['RED / COMPLETE','빛이 기억을 잇는다']:s.redPowered?[redLines[Math.floor(s.redPresses/2)],`${s.redPresses%2} / 2`]:['POWER OFF','START → RED',s.usbInserted?'방향키 암호':'USB를 연결해 주세요']);
   bluePanel.draw(s.blueSolved?['BLUE / COMPLETE','+5를 기억해']:s.bluePowered?['붉은색, 푸른색, 그 사이 (__)','그 짧은 시간~','노란색 빛을 내는 저기 저 신호등']:['POWER OFF','BLUE','남겨 둘 것, 버릴 것']);
   world.renderer.shadowMap.needsUpdate=true;
  },
  blocked(x,z){if(x< -20.8||x>20.8||z<layout.bounds[2]||z>layout.bounds[3])return true;return world.colliders.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22);},
  canReach(t){const eye=world.player.clone().add(V(0,1.63,0)),d=t.position.clone().sub(eye),len=d.length();const ray=new THREE.Ray(eye,d.normalize());return !wallBoxes.some(b=>{const p=ray.intersectBox(b,V(0,0,0));return p&&p.distanceTo(eye)<len-.12;});},
  focus(t){let p=t.position.clone().add(V(...t.userData.offset));if(this.blocked(p.x,p.z)){for(const [x,z]of [[0,.7],[.7,0],[-.7,0],[0,-.7]]){const q=t.position.clone().add(V(x,0,z));if(!this.blocked(q.x,q.z)){p=q;break;}}}world.player.set(p.x,0,p.z);world.lookAtPoint(t.position.toArray());world.toggleView(false);},
  update(dt){this.time+=dt;const s=this.state,t=s.phaseTime;const cine=['collapse','recovery','walk','hearts','complete'].includes(s.phase);if(cine)world.active=false;
   if(s.phase==='collapse'){npc.rotation.z=-clamp((t-2)/2,0,1)*1.42;npc.position.y=clamp((t-2)/2,0,1)*.27;npc.rotation.x=Math.sin(t*17)*.04*(t<2?1:0);}
   else if(['tablet','letter'].includes(s.phase)){npc.rotation.z=-1.42;npc.position.y=.27;}
   else if(s.phase==='recovery'){npc.rotation.z=-(1-clamp((t-3)/2.4,0,1))*1.42;npc.position.y=(1-clamp((t-3)/2.4,0,1))*.27;npc.rotation.x=t<3?Math.sin(t*22)*.05:0;}
   else{npc.rotation.z=0;npc.rotation.x=0;npc.position.y=0;}
   if(['walk','hearts','complete'].includes(s.phase)){const f=s.phase==='walk'?clamp(t/6,0,1):1;npc.position.set(THREE.MathUtils.lerp(2.3,-.55,f),0,THREE.MathUtils.lerp(-7.7,-8,f));world.player.set(THREE.MathUtils.lerp(3.4,.8,f),0,THREE.MathUtils.lerp(-6.6,-6.9,f));world.avatar.visible=false;world.camera.position.copy(world.player).add(V(0,1.63,0));world.camera.lookAt(npc.position.x+(s.phase==='walk'?0:.3),s.phase==='walk'?1.55:2.05,-8);heldCoat.visible=false;}
   else if(cine){world.camera.position.copy(world.player).add(V(0,1.63,0));world.camera.lookAt(npc.position.x,.7+(1-Math.abs(npc.rotation.z)/1.42)*.85,-7.7);world.avatar.visible=false;}
   else if(this.lastCine){world.player.set(3.7,0,-6.0);world.lookAtPoint([0,1.7,-8]);}
   this.lastCine=cine;
   if(s.yellowSolved){const drop=s.phase==='collapse'?clamp((t-4)/4,0,1):1;ipad.position.y=1+(1-drop)*4.6;ipadPanel.mesh.position.y=1.66+(1-drop)*4.6;halo.rotation.z=this.time*.5;}
   hearts.forEach((h,i)=>{h.visible=['hearts','complete'].includes(s.phase);h.position.y=s.phase==='complete'?2.8:9-clamp(t/4,0,1)*6.2;h.rotation.y=Math.sin(this.time*.5)*.2;});
   confetti.forEach((m,i)=>{m.visible=s.phase==='hearts'||s.completed;m.position.set(Math.sin(i*4.7)*3.1,2+((i*.31-this.time*.55)%5+5)%5,-8+Math.cos(i*3.7)*2);m.rotation.set(this.time+i,i*.7,this.time*.5);});
  },
  afterUpdate(){const s=this.state;if(['collapse','recovery','walk','hearts','complete'].includes(s.phase))this.update(0);},
  dispose(){heldCoat.removeFromParent();}
 };
 world.junctionRuntime=rt;world.mode='junction';rt.sync(state);if(state.phase==='explore'){world.player.set(...layout.spawn);world.lookAtPoint([0,1.4,38]);}else{world.player.set(3.7,0,-6);world.lookAtPoint([0,1.6,-8]);}world.active=true;return rt;
}
