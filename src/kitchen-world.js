import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {recipes,recipeKeys,lineSeven} from './kitchen-data.js';
import {stations,ROOM_RADIUS,WALK_RADIUS,powerPosition,entryPosition,exitPosition,courierStart,courierEnd,storeColliders,marketTargets} from './kitchen-layout.js';
import {CookingEffects} from './kitchen-effects.js';
export {stations};
const v=p=>new THREE.Vector3(...p);
export function stationPoint(key,x,y,z){const [cx,cz,a]=stations[key];return [cx+x*Math.cos(a)+z*Math.sin(a),y,cz-x*Math.sin(a)+z*Math.cos(a)];}
function foodSource(key,progress){
 const stages={chili:['Pan_raw','Pan_raw','Pan_raw','Pan_cooked','Pan_cooked','Pan_sauced','Pan_sauced','SideShrimp','FriedRice','Dish_chili'],chicken:['GiftParcel','GiftParcel','GiftParcel','ChickenEmpty','ChickenRice','ChickenFried','Dish_chicken','Dish_chicken'],garlic:['Pan_raw','Pan_raw','Pan_raw','Pan_cooked','Pan_cooked','RiceOnly','Dish_garlic'],pepero:['WaterPot','WaterPot','ChocolateChunks','ChocolateBowl','PeperoCoated','Dish_pepero','Dish_pepero','Dish_pepero']};
 return stages[key][Math.min(progress,stages[key].length-1)];
}
export async function enterKitchen(world,state){
 const [asset,photoTextures]=await Promise.all([new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/day-200-kitchen.glb'),Promise.all(recipeKeys.map(key=>new THREE.TextureLoader().loadAsync('/assets/food-reference/'+key+'.jpg')))]);
 const old=world.scene,scene=new THREE.Scene();scene.background=new THREE.Color('#030705');scene.environment=old.environment;
 world.scene=scene;world.model=asset.scene;scene.add(asset.scene,world.camera);asset.scene.add(world.avatar);world.avatar.position.set(7,0,10);world.avatar.rotation.set(0,Math.PI,0);world.avatarPose='standing';world.playAvatarAnimation('Idle_Neutral');
 world.mode='kitchen';world.state={stage:0,inventory:[]};world.kitchenRadius=WALK_RADIUS;world.player.set(...entryPosition);world.lookAtPoint(powerPosition);world.toggleView(false);world.ride=null;world.pendingAnimations=[];world.targets=[];world.keys.clear();world.hit=null;
 world.camera.up.set(0,1,0);world.camera.far=80;world.camera.updateProjectionMatrix();world.renderer.shadowMap.enabled=false;world.renderer.toneMappingExposure=1.1;
 const hemi=new THREE.HemisphereLight('#fff3dd','#647165',0),sun=new THREE.DirectionalLight('#fff0de',0);sun.position.set(6,6,8);scene.add(hemi,sun);
 const fill=new THREE.DirectionalLight('#e7f0ff',0);fill.position.set(-10,5,-8);scene.add(fill);
 const targetMaterial=new THREE.MeshBasicMaterial({visible:false});
 function target(id,name,desc,p,size){const t=new THREE.Mesh(new THREE.BoxGeometry(...size),targetMaterial);t.position.set(...p);t.userData={id,name,desc,stage:-1};scene.add(t);world.targets.push(t);}
 target('kitchen-power','빛나는 7호선 노선도','짧게 일한 곳부터 오래 일한 곳까지',powerPosition,[4.7,2.1,.4]);
 for(const [id,name,p,size] of marketTargets)target(id,name,'진열대 앞에서 E · 재료와 포장 용품 담기',p,size);
 for(const key of recipeKeys)target('cook-'+key,recipes[key].name,recipes[key].clock+' 요리방 · 레시피와 조리대',stationPoint(key,0,1.6,-.9),[4,2,4]);
 target('kitchen-courier','도착한 배달기사','반반 닭다리 상자 받기',[courierEnd[0],1.2,courierEnd[2]],[1.4,2,1.1]);
 target('kitchen-exit','다음 기억으로','네 가지 음식을 완성하고 문 열기',exitPosition,[2.8,3,1.1]);
 const exitRoot=new THREE.Group();exitRoot.position.set(exitPosition[0],0,exitPosition[2]);exitRoot.rotation.y=.63;scene.add(exitRoot);
 const brass=new THREE.MeshStandardMaterial({color:'#b99550',metalness:.65,roughness:.35}),doorPaint=new THREE.MeshStandardMaterial({color:'#304f40',roughness:.5});
 function doorPart(x,y,z,w,h,d,material,parent=exitRoot){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 doorPart(-1.35,1.9,0,.16,3.8,.25,brass);doorPart(1.35,1.9,0,.16,3.8,.25,brass);doorPart(0,3.82,0,2.85,.16,.25,brass);
 const exitHinge=new THREE.Group();exitHinge.position.set(-1.25,0,0);exitRoot.add(exitHinge);doorPart(1.25,1.85,0,2.48,3.65,.13,doorPaint,exitHinge);doorPart(2.22,1.75,.12,.08,.34,.08,brass,exitHinge);
 const exitGlass=new THREE.MeshStandardMaterial({color:'#8ba889',emissive:'#c8f0a0',emissiveIntensity:0,roughness:.3});doorPart(1.25,2.25,.08,1.95,2,.03,exitGlass,exitHinge);
 const labels=[];
 function label(text,p,width,size=32,color='#263c2e',angle=0,lit=false){const l=world.label(text,p,width,size,color,angle);if(lit){l.material=new THREE.MeshBasicMaterial({map:l.material.map,transparent:true,depthWrite:false});}else labels.push(l);return l;}
 label('200 MARKET  ·  오늘도 너와 함께',[0,4.65,5.10],9.8,27);
 label('네 가지 마음을 완성하면 열리는 문',[exitPosition[0],4.2,exitPosition[2]],3.7,27,'#fff0ce',.63);
 for(const key of recipeKeys){const a=stations[key][2];label(recipes[key].clock+'  /  '+recipes[key].name,stationPoint(key,0,3.04,-3.09),5.7,32,'#ffefd9',a);label('E · 레시피 / 작업대',stationPoint(key,0,1.48,-.89),2.4,30,'#fff1da',a);}
 for(const [x,text] of [[-4.5,'BAKERY · 베이커리'],[0,'PANTRY · 소스 / 조미료'],[4.5,'DRINKS · 음료 / 간식']])label(text,[x,2.62,4.04],1.3,18,'#fff5d9');
 label('FRESH · 과일과 채소',[0,1.2,7.77],5.5,26,'#fff2cf');label('FROZEN · 새우',[-7.5,.67,7.77],2.05,27,'#fff2cf');
 label('COLD · 냉장 / 해산물',[-7.35,3.03,0],6.6,27,'#fff2cf',Math.PI/2);label('DAIRY · 우유 / 디저트',[7.35,3.03,0],6.6,27,'#fff2cf',-Math.PI/2);
 recipeKeys.forEach((key,i)=>{const tex=photoTextures[i];tex.colorSpace=THREE.SRGBColorSpace;const ratio=tex.image.width/tex.image.height,width=1.85,height=width/ratio;world.plane(tex,width,height,stationPoint(key,-1.85,2.3,-3.065),stations[key][2]);label('실제 음식 · 형태 참고',stationPoint(key,-1.85,1.55,-3.02),1.9,23,'#334d3c',stations[key][2]);});
 for(const key of recipeKeys){const arrow=label(recipes[key].clock+' ↑',stationPoint(key,0,.03,5.4),2.1,32,'#345641',stations[key][2]);arrow.rotation.x=-Math.PI/2;}
 label('7호선  ·  불을 켜는 기억',[powerPosition[0],2.86,powerPosition[2]-.12],4.1,32,'#c5ff7a',Math.PI,true);
 label('짧게 일한 학원  <  <  오래 일한 학원',[powerPosition[0],1.15,powerPosition[2]-.14],4.1,24,'#b8ff80',Math.PI,true);
 // The line is readable before all the other lights come on.
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#051009';ctx.fillRect(0,0,1536,512);ctx.strokeStyle='#aaff66';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(50,250);ctx.lineTo(1480,250);ctx.stroke();
 lineSeven.forEach((name,i)=>{const x=50+i*95;ctx.fillStyle='#caff90';ctx.beginPath();ctx.arc(x,250,10,0,7);ctx.fill();ctx.save();ctx.translate(x,i%2?290:205);ctx.rotate(-.62);ctx.font='22px Malgun Gothic';ctx.textAlign=i===15?'right':'left';ctx.fillText(name,0,0);ctx.restore();});
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const board=new THREE.Mesh(new THREE.PlaneGeometry(4.3,1.4),new THREE.MeshBasicMaterial({map}));board.position.set(powerPosition[0],2.08,powerPosition[2]-.12);board.rotation.y=Math.PI;scene.add(board);
 world.colliders=storeColliders.map(box=>[...box]);
 for(const key of recipeKeys){const [cx,cz,a]=stations[key];if(Math.abs(Math.sin(a))<.5){world.colliders.push([cx-3.1,cx+3.1,cz+(a===0?-2.52:.88),cz+(a===0?-.88:2.52)]);for(const s of [-1,1])world.colliders.push([cx+s*3.5-.15,cx+s*3.5+.15,cz-3.4,cz+3.4]);}else{world.colliders.push([cx+(cx>0?.88:-2.52),cx+(cx>0?2.52:-.88),cz-3.1,cz+3.1]);for(const s of [-1,1])world.colliders.push([cx-3.4,cx+3.4,cz+s*3.5-.15,cz+s*3.5+.15]);}}
 world.wallBoxes=[];for(let i=0;i<64;i++){const a=i*Math.PI/32;world.wallBoxes.push(new THREE.Box3(v([(ROOM_RADIUS-.2)*Math.cos(a)-.4,0,(ROOM_RADIUS-.2)*Math.sin(a)-.4]),v([(ROOM_RADIUS-.2)*Math.cos(a)+.4,7,(ROOM_RADIUS-.2)*Math.sin(a)+.4])));}
 world.collisionBoxes=[...world.wallBoxes,...world.colliders.map(([a,b,c,d])=>new THREE.Box3(v([a,0,c]),v([b,3.5,d])))];
 const prototypes={};for(const name of ['Dish_chili','Dish_chicken','Dish_garlic','Dish_pepero','Pan_raw','Pan_cooked','Pan_sauced','ChocolateBowl','GiftParcel','ChickenEmpty','ChickenRice','ChickenFried','PeperoCoated','RiceOnly','FriedRice','SideShrimp','WaterPot','ChocolateChunks']){prototypes[name]=world.get(name);prototypes[name].visible=false;}
 const displays={};for(const key of recipeKeys){const root=new THREE.Group();root.position.set(...stationPoint(key,1.9,1.26,-1.6));root.rotation.y=stations[key][2];scene.add(root);displays[key]=root;}
 const courier=new THREE.Group();scene.add(courier);for(const name of ['CourierBody','CourierLegL','CourierLegR','CourierArmL','CourierArmR','CourierBox'])courier.add(world.get(name));courier.visible=false;
 world.addDust();world.dust.material.color.set('#d3c19c');world.dust.material.opacity=.12;
 const effects=Object.fromEntries(['chili','garlic','pepero'].map(key=>[key,new CookingEffects(scene,stationPoint(key,.1,1.31,-1.65))]));
 const emissive=[];const seen=new Set();asset.scene.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m.emissiveIntensity>0&&!seen.has(m)&&!m.name.includes('phosphorescent')){emissive.push([m,m.emissiveIntensity]);seen.add(m);m.emissiveIntensity=0;}});
 const runtime={prototypes,displays,courier,effects,state,setHeat(key,heat){effects[key]?.setHeat(heat);},lastVersion:'',lightAmount:state.lights?1:0,arrivalSound:false,handoffAt:null,
  sync(s){if(s.received&&!this.state.received)this.handoffAt=Date.now();this.state=s;const signature=JSON.stringify(s.progress);if(this.lastVersion!==signature){for(const key of recipeKeys){const group=displays[key];group.clear();
    const source=foodSource(key,s.progress[key]);
    const food=prototypes[source].clone(true);food.visible=s.progress[key]>0;group.add(food);group.userData.source=source;
   }this.lastVersion=signature;}},
  update(dt,now){this.lightAmount=THREE.MathUtils.damp(this.lightAmount,this.state.lights?1:0,2.3,dt);const f=this.lightAmount;hemi.intensity=1.6*f;sun.intensity=1.9*f;fill.intensity=.7*f;scene.environmentIntensity=.6*f;scene.background.setRGB(.008+.19*f,.012+.22*f,.011+.17*f);labels.forEach(l=>l.visible=f>.1);world.dust.visible=f>.2;emissive.forEach(([m,strength])=>m.emissiveIntensity=strength*f);for(const fx of Object.values(effects)){fx.root.visible=f>.2;fx.update(dt);}
   exitHinge.rotation.y=THREE.MathUtils.damp(exitHinge.rotation.y,this.state.completed?-1.7:0,2.6,dt);exitGlass.emissiveIntensity=this.state.completed?.8:0;
   world.targets.forEach(t=>{const id=t.userData.id;t.visible=id==='kitchen-power'||this.state.lights;if(id==='kitchen-courier')t.visible=this.state.orderAt!==null&&now>=this.state.orderAt+10000&&!this.state.received;});
   const elapsed=this.state.orderAt===null?-1:(now-this.state.orderAt)/1000,handoff=this.handoffAt===null?null:(now-this.handoffAt)/1000;courier.visible=elapsed>=7&&(!this.state.received||(handoff!==null&&handoff<3));
   if(courier.visible){const t=THREE.MathUtils.clamp((elapsed-7)/3,0,1),leaving=handoff!==null&&handoff>1;courier.position.set(THREE.MathUtils.lerp(courierStart[0],courierEnd[0],t),0,THREE.MathUtils.lerp(courierStart[2],courierEnd[2],t)+(leaving?(handoff-1)*2.7:0));courier.rotation.y=leaving?0:Math.PI;for(const [name,sign] of [['CourierLegL',1],['CourierLegR',-1]])courier.getObjectByName(name).rotation.x=t<1||leaving?Math.sin(elapsed*10)*.14*sign:0;const box=courier.getObjectByName('CourierBox');box.visible=handoff===null||handoff<.85;box.position.z=handoff!==null?Math.min(handoff,.85)*.4:t>=1?.14:0;for(const name of ['CourierArmL','CourierArmR'])courier.getObjectByName(name).position.z=box.visible?box.position.z*.65:0;}
  }
 };world.kitchenRuntime=runtime;runtime.sync(state);runtime.update(0,Date.now());return runtime;
}

export class FoodPreview{
 constructor(canvas,runtime,key,progress){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.3));this.renderer.setSize(canvas.clientWidth||500,270,false);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
  this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight('#fff9e6','#584532',2));const sun=new THREE.DirectionalLight('#fff3df',3);sun.position.set(3,5,4);this.scene.add(sun);
  const source=progress>=recipes[key].steps.length?'Dish_'+key:runtime.displays[key].userData.source||'Dish_'+key;this.food=runtime.prototypes[source].clone(true);this.food.visible=true;this.scene.add(this.food);
  this.camera=new THREE.PerspectiveCamera(36,(canvas.clientWidth||500)/270,.01,30);this.camera.position.set(.1,1.7,1.85);this.camera.lookAt(0,.05,0);this.fx=new CookingEffects(this.scene,[0,-.075,0],.53);if(key==='pepero'&&progress>0&&progress<5)this.fx.setSteam(.8);this.render=()=>this.renderer.render(this.scene,this.camera);this.render();this.stopped=false;let prior=performance.now();const tick=now=>{if(this.stopped)return;this.fx.update(Math.min((now-prior)/1000,.05));prior=now;this.render();this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);
  this.drag=false;this.x=0;canvas.onpointerdown=e=>{this.drag=true;this.x=e.clientX;canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!this.drag)return;this.food.rotation.y+=(e.clientX-this.x)*.015;this.x=e.clientX;this.render();};canvas.onpointerup=()=>this.drag=false;
 }
 setHeat(heat){this.fx.setHeat(heat);}
 dispose(){this.stopped=true;cancelAnimationFrame(this.frame);this.fx.dispose();this.renderer.dispose();this.renderer.forceContextLoss();}
}
