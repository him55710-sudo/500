import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

import {movePlayer} from './movement.js';
import {polishRoomMaterials} from './render-look.js';
import {improveSalon} from './salon-upgrades.js';
import {personalPhoto,memoryPhotos,addMemorySafe,syncMemorySafe} from './personal-memories.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function poster(ctx,w,h,title,subtitle,color,index){
 ctx.fillStyle='#e5d5b2';ctx.fillRect(0,0,w,h);ctx.fillStyle=color;ctx.fillRect(25,25,w-50,h-50);
 ctx.fillStyle='#eadbb8';ctx.font='18px serif';ctx.textAlign='center';ctx.fillText('OUR LITTLE MOMENTS',w/2,60);
 // Hand-drawn temporary Shin-chan-inspired poster, not a photograph of the couple.
 ctx.fillStyle='#ecd29d';ctx.beginPath();ctx.arc(w/2,h*.4,95,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e96042';ctx.fillRect(w/2-68,h*.54,136,92);ctx.fillStyle='#eecb58';ctx.fillRect(w/2-70,h*.54+90,140,38);
 ctx.fillStyle='#f1c4a0';ctx.beginPath();ctx.ellipse(w/2,h*.40,75,65,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#1a2522';ctx.beginPath();ctx.ellipse(w/2-31,h*.39,8,10,0,0,Math.PI*2);ctx.ellipse(w/2+31,h*.39,8,10,0,0,Math.PI*2);ctx.fill();ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w/2-51,h*.34);ctx.lineTo(w/2-20,h*.32);ctx.moveTo(w/2+20,h*.32);ctx.lineTo(w/2+51,h*.34);ctx.strokeStyle='#202923';ctx.stroke();
 ctx.lineWidth=3;ctx.beginPath();ctx.arc(w/2,h*.42,20,.2,Math.PI-.2);ctx.stroke();
 ctx.fillStyle='#fff1d2';ctx.font='bold 35px "Malgun Gothic",sans-serif';ctx.fillText(title,w/2,h-111);ctx.font='19px "Malgun Gothic",sans-serif';ctx.fillText(subtitle,w/2,h-73);ctx.font='14px sans-serif';ctx.fillText('임시 포스터 · 원본으로 교체 가능',w/2,h-42);
}
function paintingTexture(withCarousel=false){return canvasTexture(1200,800,(c,w,h)=>{
 const grad=c.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#a9c9cc');grad.addColorStop(.7,'#e3b791');grad.addColorStop(1,'#688b67');c.fillStyle=grad;c.fillRect(0,0,w,h);
 c.fillStyle='#f8e1af';c.beginPath();c.arc(905,145,65,0,Math.PI*2);c.fill();
 for(let i=0;i<9;i++){c.fillStyle=i%2?'#647b7c':'#718a82';c.beginPath();c.moveTo(i*160-100,540);c.lineTo(i*160+80,280+(i%3)*65);c.lineTo(i*160+240,540);c.fill();}
 c.strokeStyle='#775746';c.lineWidth=11;c.beginPath();c.arc(320,380,190,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){let a=i*Math.PI/6;c.beginPath();c.moveTo(320,380);c.lineTo(320+Math.cos(a)*190,380+Math.sin(a)*190);c.stroke();c.fillStyle='#b5654e';c.fillRect(300+Math.cos(a)*190,370+Math.sin(a)*190,40,34);}
 c.beginPath();c.moveTo(220,640);c.lineTo(320,380);c.lineTo(420,640);c.stroke();c.fillStyle='#697e57';c.fillRect(0,620,w,180);
 c.fillStyle='#cfc091';c.beginPath();c.moveTo(380,800);c.lineTo(520,580);c.lineTo(680,580);c.lineTo(940,800);c.fill();
 if(withCarousel){c.fillStyle='#a04c4b';c.beginPath();c.moveTo(680,510);c.lineTo(850,350);c.lineTo(1020,510);c.fill();c.fillStyle='#efd3a3';c.fillRect(705,510,290,26);c.fillRect(700,668,300,27);c.strokeStyle='#dbb564';c.lineWidth=9;for(let i=0;i<5;i++){c.beginPath();c.moveTo(730+i*57,535);c.lineTo(730+i*57,667);c.stroke();c.fillStyle='#efe0bd';c.beginPath();c.ellipse(731+i*57,610,24,13,0,0,Math.PI*2);c.fill();}}else{c.strokeStyle='#bdb09b';c.setLineDash([14,14]);c.lineWidth=3;c.strokeRect(692,390,305,300);c.setLineDash([]);}
 c.fillStyle='#334f48';c.font='28px "Malgun Gothic"';c.fillText('그날, 우리가 그리던 풍경',48,65);c.font='18px "Malgun Gothic"';c.fillText('원본 그림 교체 전 · 임시 작품',48,h-28);
});}
export class World{
 constructor(canvas,onProgress){
  this.canvas=canvas;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#b5ceda');
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1));this.renderer.setSize(innerWidth,innerHeight);this.renderer.shadowMap.enabled=false;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.055,80);this.camera.position.set(0,1.65,4.4);this.yaw=0;this.pitch=-.06;this.thirdPerson=false;this.zoom=2.9;this.player=V(0,0,4.05);this.keys=new Set();this.walkTime=0;this.lastStep=0;this.sensitivity=1;this.motion=true;this.quality='auto';this.dpr=1;this.sampleTime=0;this.sampleFrames=0;this.speedScale=1;this.active=false;this.targets=[];this.ray=new THREE.Raycaster();this.hit=null;this.oldStage=-1;this.pendingAnimations=[];
  this.colliders=[[-4.85,-1.85,-4.4,-2.95],[-5.85,-4.65,-2.3,.5],[-5.3,-3.94,1.1,2.2],[-4.36,-.64,4.25,5.32]];this.wallBoxes=[new THREE.Box3(V(-6,0,-6.15),V(6,5,-5.9)),new THREE.Box3(V(-6.15,0,-6),V(-5.9,5,6)),new THREE.Box3(V(5.9,0,-6),V(6.15,5,6)),new THREE.Box3(V(-6,0,5.9),V(6,5,6.15))];
  this.scene.add(new THREE.HemisphereLight(0xf5faff,0xaaa49a,1.25));
  const pmrem=new THREE.PMREMGenerator(this.renderer);this.scene.environment=pmrem.fromScene(new RoomEnvironment(),.055).texture;pmrem.dispose();this.scene.environmentIntensity=.68;
  this.lights=[];
  const point=(p,color,intensity,distance)=>{let l=new THREE.PointLight(color,intensity,distance,2);l.position.copy(V(...p));this.scene.add(l);this.lights.push(l);return l;};
  // Cache one shadow map for immovable furniture. It is never redrawn while playing.
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.BasicShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;
  const key=new THREE.SpotLight(0xfff4e6,14,18,Math.PI*.44,.95,1.5);key.position.set(0,3.25,.3);key.target.position.set(0,0,-.7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.normalBias=.055;this.scene.add(key,key.target);this.lights.push(key);
  const fill=new THREE.DirectionalLight(0xeaf4ff,1.35);fill.position.set(-5,4,3);this.scene.add(fill);
  this.exitLight=point([3.65,1.8,-5.45],0xffdba7,0,7);
  this.collisionBoxes=[...this.wallBoxes,...this.colliders.map(([a,b,c,d])=>new THREE.Box3(V(a,0,c),V(b,1.3,d)))];
  this.avatarMixer=null;this.avatarActions=new Map();this.activeAvatarAction=null;this.avatarAnimationName='';this.avatarPose='standing';
  this.ready=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/memory-room.glb',e=>onProgress(e.loaded/(e.total||6474836))).then(async g=>{this.model=g.scene;this.scene.add(g.scene);this.model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});polishRoomMaterials(this.model,'salon');const legacyAvatar=this.model.getObjectByName('Hayoung');if(legacyAvatar)legacyAvatar.visible=false;const player=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/hayoung-casual.gltf');this.avatar=new THREE.Group();this.avatar.name='Hayoung';this.avatar.position.set(0,0,4.2);this.avatar.rotation.y=Math.PI;player.scene.name='Hayoung_Casual';player.scene.traverse(o=>{if(o.isMesh){if(o.name==='Cube'||o.name==='Icosphere')o.visible=false;o.castShadow=false;o.receiveShadow=false;}});this.avatar.add(player.scene);this.scene.add(this.avatar);this.avatarMixer=new THREE.AnimationMixer(player.scene);this.avatarActions=new Map(player.animations.map(clip=>[clip.name,this.avatarMixer.clipAction(clip)]));this.playAvatarAnimation('Idle_Neutral',0);this.avatar.visible=false;await this.addMaterials();await this.addArt();this.addTargets();this.addDust();this.model.updateMatrixWorld(true);this.model.traverse(o=>{if(o.isMesh){o.updateMatrix();o.matrixAutoUpdate=false;}});this.addContactShadows();});
  addEventListener('resize',()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);});
 }
 get(name){return this.model?.getObjectByName(name);}
 async addMaterials(){
  await this.addTextileMaterials();
  const loader=new THREE.TextureLoader();const [color,normal,rough]=await Promise.all(['/assets/wood-floor-color.jpg','/assets/wood-floor-normal.jpg','/assets/wood-floor-rough.jpg'].map(p=>loader.loadAsync(p)));color.colorSpace=THREE.SRGBColorSpace;for(const t of [color,normal,rough]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;}
  this.model.traverse(o=>{if(!o.isMesh||!o.name.startsWith('Architecture_Walnut_plank'))return;const uv=new THREE.Float32BufferAttribute(new Float32Array(o.geometry.attributes.position.count*2),2);o.geometry.setAttribute('uv',uv);const pos=o.geometry.attributes.position;o.updateWorldMatrix(true,false);const v=new THREE.Vector3();for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);uv.setXY(i,v.x/3,v.z/3);}uv.needsUpdate=true;o.material.map=color;o.material.normalMap=normal;o.material.normalScale.set(.24,.24);o.material.roughnessMap=rough;o.material.roughness=.56;o.material.color.set('#c7c3bb');o.material.needsUpdate=true;});
 }
 async addTextileMaterials(){
  const loader=new THREE.TextureLoader();
  const [normal,roughness]=await Promise.all(['woven-normal.png','woven-roughness.jpg'].map(name=>loader.loadAsync('/assets/salon/'+name)));
  for(const texture of [normal,roughness]){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=8;texture.repeat.set(42,42);}
  const materials=new Set();
  this.model.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});
  for(const m of materials){
   if(!['Aubusson handwoven floral wool','Raspberry silk velvet','Pearl curtain lining'].includes(m.name))continue;
   m.normalMap=normal;m.normalScale.set(.22,.22);m.roughnessMap=roughness;m.needsUpdate=true;
  }
 }
 plane(texture,w,h,pos,rotY=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.85,metalness:0,side:THREE.FrontSide}));m.position.copy(V(...pos));m.rotation.y=rotY;this.scene.add(m);return m;}
 label(text,p,w=1,size=44,color='#e8d5a9',rotY=0){const mesh=this.plane(canvasTexture(512,128,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle=color;c.font=`${size}px "Malgun Gothic",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,W/2,H/2);}),w,w/4,p,rotY);mesh.material.transparent=true;mesh.material.depthWrite=false;return mesh;}
 async addArt(){
  this.model.traverse(o=>{if(!o.isMesh)return;o.receiveShadow=true;for(let p=o.parent;p;p=p.parent)if(/^(Desk|MusicCabinet|CarouselConsole|TastingTable)$/.test(p.name))o.castShadow=true;});
  // Joined wall mouldings give the frame wall the proportions of a paneled salon.
  const trim=[];const box=(x,y,z,w,h,d)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);trim.push(g);};
  for(const x of [-5,-3.4,-1.8,-.2,1.4,3,4.6]){for(const dx of [-.65,.65])box(x+dx,.69,-5.80,.026,.89,.032);for(const y of [.245,1.135])box(x,y,-5.80,1.32,.026,.032);}
  for(const x of [1.72,5.27]){box(x,2.54,-5.80,.19,3.70,.14);for(const dx of [-.10,.10])box(x+dx,2.54,-5.70,.024,3.60,.03);for(const y of [.67,4.35])box(x,y,-5.71,.40,.13,.13);}
  const moulding=new THREE.Mesh(mergeGeometries(trim),new THREE.MeshStandardMaterial({color:0xd5b777,metalness:.72,roughness:.26}));this.scene.add(moulding);trim.forEach(g=>g.dispose());
  this.dollBow=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.38,8),new THREE.MeshStandardMaterial({color:0x4a2817,roughness:.55}));this.dollBow.position.set(-4.40,1.46,-.91);this.dollBow.rotation.x=.25;this.dollBow.visible=false;this.scene.add(this.dollBow);
  const frescoMap=await new THREE.TextureLoader().loadAsync('/assets/salon-fresco.png');frescoMap.colorSpace=THREE.SRGBColorSpace;frescoMap.anisotropy=4;
  const fresco=new THREE.Mesh(new THREE.CircleGeometry(2.02,80),new THREE.MeshBasicMaterial({map:frescoMap,color:0xffffff}));fresco.rotation.x=Math.PI/2;fresco.scale.x=1.3;fresco.position.set(0,4.565,-.7);this.scene.add(fresco);
  this.posters=[];const names=['100일 홍대','잣절','현수 생일','필리핀'],subs=['함께한 100번째 날','처음의 설렘','너의 하루를 축하해','우리의 푸른 여행'],colors=['#9a403f','#a18a37','#3e765a','#3f6c91'];
  const photoMaps=await Promise.all(memoryPhotos.map(p=>p?personalPhoto(p,.97/1.24):null));
  for(let i=0;i<4;i++){const p=this.plane(photoMaps[i]||canvasTexture(512,640,(c,w,h)=>poster(c,w,h,names[i],subs[i],colors[i],i)),.97,1.24,[-4.65+i*1.6,2.85,-5.66]);this.posters.push(p);this.get('MemoryFrame'+i).attach(p);}
  this.painting=this.plane(await personalPhoto('/assets/memories/hayoung-painting.png',2.15/1.48),2.15,1.48,[5.657,2.48,-1.75],-Math.PI/2);this.customPainting=true;addMemorySafe(this);
  this.label('한때 나는 너의 그림마저 사랑했어…',[5.62,1.35,-1.75],2.4,28,'#e3cfaa',-Math.PI/2);
  this.cow=this.plane(canvasTexture(1000,640,(c,w,h)=>{
   c.fillStyle='#ded1ad';c.fillRect(0,0,w,h);c.fillStyle='#775f43';c.font='25px serif';c.textAlign='center';c.fillText('THE TASTE OF OUR 100TH DAY',w/2,57);
   c.fillStyle='#95614e';c.beginPath();c.ellipse(505,315,310,160,0,0,Math.PI*2);c.fill();c.fillRect(168,207,120,165);c.fillRect(142,178,85,60);c.fillRect(280,410,48,112);c.fillRect(680,410,48,112);c.strokeStyle='#ead8ac';c.lineWidth=5;
   for(const x of [305,415,560,700]){c.beginPath();c.moveTo(x,182);c.lineTo(x,450);c.stroke();}c.beginPath();c.moveTo(258,310);c.lineTo(793,310);c.stroke();c.fillStyle='#f2e7c7';c.font='28px serif';[['A',280,270],['B',360,250],['C',485,260],['D',625,270],['E',760,300],['F',480,397]].forEach(([t,x,y])=>c.fillText(t,x,y));
   c.fillStyle='#584836';c.font='23px "Malgun Gothic"';c.fillText('가려진 덮개를 열어 이름을 확인하세요',w/2,586);
  }),1.8,1.21,[5.65,2.3,2.5],-Math.PI/2);
  this.label('현수의 스테이크',[-3.35,1.4,4.62],.85,35,'#eedbb0',Math.PI);
  this.label('홍대 알페로',[-1.67,1.4,4.62],.85,35,'#eedbb0',Math.PI);
  this.numberTiles=[];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){const num=row*3+col+1;const t=canvasTexture(256,256,c=>{c.fillStyle='#e5e1d7';c.fillRect(0,0,256,256);c.strokeStyle='#b9b5aa';c.lineWidth=1.5;c.strokeRect(10,10,236,236);c.fillStyle='#515b58';c.textAlign='center';c.textBaseline='middle';c.font='500 96px Arial';c.fillText(String(num),128,134);});const m=this.plane(t,1,1,[2.4+col*1.05,.108,.65+row*1.05]);m.name='NumberTile'+num;m.rotation.x=-Math.PI/2;this.numberTiles.push(m);const base=this.get('Tile'+num);base?.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshStandardMaterial({color:'#c5c0b5',roughness:.9});}});}
  this.label('DEAR. HAYOUNG',[-3.7,1.124,-3.3],.5,29); // face letter upward
  this.scene.children[this.scene.children.length-1].rotation.x=-Math.PI/2;
  this.placedCarousel=this.get('Carousel').clone(true);this.placedCarousel.name='PaintedCarousel';this.placedCarousel.scale.setScalar(.52);this.placedCarousel.position.set(5.38,1.8,-1.28);this.placedCarousel.visible=false;this.scene.add(this.placedCarousel);
  this.held=new THREE.Group();this.camera.add(this.held);this.scene.add(this.camera);this.heldItems={};this.thirdHeld=new THREE.Group();this.avatar.add(this.thirdHeld);this.thirdHeld.position.set(.28,.84,.18);this.thirdItems={};
  for(const [id,name,scale] of [['violin','ViolinKeyring',.9],['carousel','Carousel',.34],['beef','BeefToken',.9]]){const o=this.get(name).clone(true);o.name='Held_'+id;o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.setScalar(scale);o.visible=false;o.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;}});this.held.add(o);this.heldItems[id]=o;const third=o.clone(true);third.name='ThirdHeld_'+id;this.thirdHeld.add(third);this.thirdItems[id]=third;}this.held.position.set(.29,-.42,-.7);
  const glowTexture=canvasTexture(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,222,151,.8)');g.addColorStop(.25,'rgba(255,195,115,.2)');g.addColorStop(1,'rgba(255,195,115,0)');c.fillStyle=g;c.fillRect(0,0,128,128);});
  const sm=new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  this.lights.slice(0,5).forEach(l=>{const s=new THREE.Sprite(sm);s.position.copy(l.position);s.scale.setScalar(.7);this.scene.add(s);});
 }
 addContactShadows(){
  const map=canvasTexture(128,128,c=>{const g=c.createRadialGradient(64,64,12,64,64,64);g.addColorStop(0,'rgba(20,12,8,.55)');g.addColorStop(.6,'rgba(20,12,8,.28)');g.addColorStop(1,'rgba(20,12,8,0)');c.fillStyle=g;c.fillRect(0,0,128,128);});
  const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  for(const [x,z,w,d] of [[-3.35,-3.65,3.6,2],[-4.9,-.9,2,3.5],[-4.62,1.65,1.8,1.6],[-2.5,4.78,4.1,1.6]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);m.rotation.x=-Math.PI/2;m.position.set(x,.04,z);this.scene.add(m);}
 }
 async replacePicture(which,file){const url=URL.createObjectURL(file);try{const t=await new THREE.TextureLoader().loadAsync(url);t.colorSpace=THREE.SRGBColorSpace;const mesh=which==='painting'?this.painting:this.posters[Number(which)];mesh.material.map.dispose();mesh.material.map=t;mesh.material.needsUpdate=true;if(which==='painting')this.customPainting=true;}finally{URL.revokeObjectURL(url);}}
 addTargets(){
  const add=(id,name,desc,p,s,stage=-1)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...s),new THREE.MeshBasicMaterial({visible:false}));m.position.copy(V(...p));m.userData={id,name,desc,stage};this.scene.add(m);this.targets.push(m);};
  add('letter','현수의 편지','책상 위의 봉투 읽기',[-3.7,1.2,-3.25],[.8,.32,.65]);
  add('memory-safe','초록 액자 뒤 금고','금고를 열고 첫 선물 꺼내기',[-1.45,2.75,-5.87],[1.1,1.3,.24]);
  add('lock','일곱 자리 자물쇠','휠을 돌려 잠금 해제',[-2.65,1.32,-3.3],[.85,.6,.5]);
  for(let i=0;i<4;i++)add('frames','네 장의 추억','시간 순서대로 색 버튼 누르기',[-4.65+i*1.6,2.6,-5.43],[1.25,1.8,.6],1);
  add('violinist','바이올린 연주 인형','턱 아래로 악기를 받치는 자세',[-4.55,1.3,-.8],[.65,.8,.62]);
  add('bear','지휘자 인형','한 손에 작은 지휘봉을 든 인형',[-4.55,1.3,-1.65],[.65,.8,.58]);
  add('dancer','발레리나 인형','머리 위로 두 팔을 올린 자세',[-4.55,1.3,0],[.65,.8,.55]);
  add('carousel','작은 회전목마','음악이 들리는 소품 살펴보기',[-4.62,1.4,1.65],[.9,1.1,.9]);
  add('painting','하영의 놀이공원 그림','그림 속 비어 있는 자리', [5.45,2.4,-1.75],[.6,1.8,2.5]);
  add('bench','나무 평상','바퀴 달린 평상 옮기기',[-.55,.5,2.45],[1.3,.8,1.05]);
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)add('tile'+(r*3+c+1),(r*3+c+1)+'번 바닥 타일','잡고 있는 평상 내려놓기',[2.4+c*1.05,.13,.65+r*1.05],[.98,.22,.98],5);
  add('cow','가려진 소고기 부위표','덮개를 열고 고기 모형 놓기',[5.45,2.3,2.5],[.6,1.7,2.2]);
  add('steaks','두 접시의 스테이크','각각 맛본 뒤 투표하기',[-2.5,1.2,4.62],[3.45,.8,1],7);
  add('exit','두 번째 기억으로','다음 문 열기',[3.65,1.4,-5.35],[1.75,2.9,.9]);
 }
 addDust(){const n=120,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*10;a[i*3+1]=Math.random()*4+.3;a[i*3+2]=(Math.random()-.5)*10;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));this.dust=new THREE.Points(g,new THREE.PointsMaterial({color:0xefd4a2,size:.013,transparent:true,opacity:.22,depthWrite:false}));this.scene.add(this.dust);}
 sync(state,animate=true){
  if(!this.model)return;this.state=state;const st=state.stage;
  for(let i=0;i<4;i++){const cover=this.get('FrameCover'+i);if(!animate||this.oldStage<0)cover.position.y=st>0?4.43:2.85;else if(st>0&&this.oldStage===0)this.animate(cover.position,'y',4.43,1.4+i*.12);this.posters[i].visible=st>0;}
  syncMemorySafe(this,state,animate);
  this.get('ViolinKeyring').visible=(st===1&&state.safeOpen)||st>=3;
  if(st>=3){this.get('ViolinKeyring').position.set(-4.45,1.46,-.91);this.get('ViolinKeyring').rotation.set(0,Math.PI/2,Math.PI/2);}
  else if(st===2)this.get('ViolinKeyring').visible=false;
  this.dollBow.visible=st>=3;
  const car=this.get('Carousel');car.visible=st<4;
  if(st>=5&&!this.painted){if(!this.customPainting){this.painting.material.map.dispose();this.painting.material.map=paintingTexture(true);}this.painted=true;}this.placedCarousel.visible=st>=5;
  const bench=this.get('Bench');bench.visible=true;if(st>=6)bench.position.set(4.5,.05,2.75);
  for(const [id,o] of Object.entries(this.heldItems)){o.visible=state.inventory.includes(id);this.thirdItems[id].visible=o.visible;}
  this.get('BeefToken').visible=st>=6&&st<7&&!state.inventory.includes('beef');
  for(let i=0;i<2;i++){const cl=this.get('Cloche'+i);if(st>=7){if(animate&&this.oldStage===6){cl.visible=true;this.animate(cl.position,'y',2.5,1,()=>cl.visible=false);}else cl.visible=false;}else cl.visible=true;}
  if(!this.doorHinge)improveSalon(this);
  if(st>=8){if(animate&&this.oldStage===7)this.animate(this.doorHinge.rotation,'y',-Math.PI*.57,1.8);else this.doorHinge.rotation.y=-Math.PI*.57;this.exitLight.intensity=22;}else{this.doorHinge.rotation.y=0;this.exitLight.intensity=0;}
  this.oldStage=st;
 }
 animate(obj,key,to,duration,done){this.pendingAnimations.push({obj,key,from:obj[key],to,duration,t:0,done});}
 toggleView(force){this.thirdPerson=force??!this.thirdPerson;this.avatar.visible=this.thirdPerson;return this.thirdPerson;}
 playAvatarAnimation(name,fade=.22){const next=this.avatarActions?.get(name)||this.avatarActions?.get('Idle_Neutral')||this.avatarActions?.get('Idle');if(!next||next===this.activeAvatarAction)return;next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();if(this.activeAvatarAction)this.activeAvatarAction.crossFadeTo(next,fade,false);this.activeAvatarAction=next;this.avatarAnimationName=name;}
 applyAvatarPose(){if(this.avatarPose!=='ride'||!this.avatar)return;for(const [name,axis,value] of [['UpperLeg.L','x',1.02],['UpperLeg.R','x',1.02],['LowerLeg.L','x',-1.24],['LowerLeg.R','x',-1.24],['UpperArm.L','x',1.02],['UpperArm.R','x',1.02],['LowerArm.L','x',-.24],['LowerArm.R','x',-.24]]){const bone=this.avatar.getObjectByName(name);if(bone)bone.rotation[axis]+=value;}}
 setQuality(q){this.quality=q;this.dpr=Math.min(devicePixelRatio,q==='high'?1.3:q==='standard'?.75:1);this.renderer.setPixelRatio(this.dpr);this.renderer.setSize(innerWidth,innerHeight);this.sampleTime=0;this.sampleFrames=0;}
 blocked(x,z){
  if(this.mode==='rescue')return this.rescueRuntime.blocked(x,z);
  if(this.mode==='kitchen')return Math.hypot(x,z)>(this.kitchenRadius||15.3)||this.colliders.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22);
  if(this.mode==='rotunda')return Math.hypot(x,z)>13.25||Math.hypot(x,z)<2.62;
  if(!this.mode&&this.state?.stage>=8&&this.doorHinge?.rotation.y<-1.55&&x>3.08&&x<4.22&&z<-5.0&&z>-9.7)return false;
  const limit=this.mode==='heaven'?6.50:5.48;
  if(x<-limit||x>limit||z<-(this.mode==='heaven'?6.50:5.42)||z>(this.mode==='heaven'?6.50:5.45))return true;
  let col=this.colliders;if(!this.mode&&this.state?.stage<6&&!this.state?.inventory.includes('bench'))col=[...col,[-1.18,.08,1.95,2.98]];
  return col.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22);
 }
 lookAtPoint(p){let d=V(...p).sub(this.player.clone().add(V(0,1.63,0)));this.yaw=Math.atan2(-d.x,-d.z);this.pitch=Math.asin(THREE.MathUtils.clamp(d.y/d.length(),-.95,.95));}
 focus(id){const t=this.targets.find(t=>t.userData.id===id);if(!t)return;const p=t.position;
  if(this.mode==='rescue'){this.player.copy(p).add(V(...t.userData.offset));this.player.y=0;this.lookAtPoint(p.toArray());this.toggleView(false);return;}
  if(this.mode==='kitchen'){const direction=new THREE.Vector3(-p.x,0,-p.z).normalize();if(id==='kitchen-power')direction.set(0,0,-1);if(id==='kitchen-market')direction.set(0,0,1);this.player.copy(p).addScaledVector(direction,2.2);this.player.y=0;this.lookAtPoint([p.x,p.y,p.z]);this.toggleView(false);return;}
  let offset=V(0,0,1.7);if(['violinist','bear','dancer','carousel'].includes(id))offset=V(1.9,0,0);if(['painting','cow'].includes(id))offset=V(-1.8,0,0);if(id==='steaks')offset=V(0,0,-1.7);if(id.startsWith('tile'))offset=V(0,0,1.0);if(id==='bench')offset=V(0,0,1.5);
  this.player.set(THREE.MathUtils.clamp(p.x+offset.x,-5.3,5.3),0,THREE.MathUtils.clamp(p.z+offset.z,-5.3,5.3));this.lookAtPoint([p.x,p.y,p.z]);this.toggleView(false);
 }
 update(dt,time,onStep){
  if(!this.model)return;dt=Math.min(Math.max(dt,0),.25);
  this.avatarMixer?.update(dt);this.applyAvatarPose();
  if(this.mode==='coaster'){this.ride.update(dt);this.renderer.render(this.scene,this.camera);return;}
  for(const a of this.pendingAnimations){a.t+=dt;const f=Math.min(1,a.t/a.duration);a.obj[a.key]=THREE.MathUtils.lerp(a.from,a.to,1-(1-f)**3);if(f===1)a.done?.();}this.pendingAnimations=this.pendingAnimations.filter(a=>a.t<a.duration);
  if(this.active){
   let mx=(this.keys.has('KeyD')?1:0)-(this.keys.has('KeyA')?1:0),mz=(this.keys.has('KeyS')?1:0)-(this.keys.has('KeyW')?1:0);let moving=mx!==0||mz!==0;
   this.playAvatarAnimation(moving?'Walk':'Idle_Neutral');
   if(this.keys.has('ArrowLeft'))this.yaw+=dt*1.35;if(this.keys.has('ArrowRight'))this.yaw-=dt*1.35;if(this.keys.has('ArrowUp'))this.pitch=Math.min(1.25,this.pitch+dt);if(this.keys.has('ArrowDown'))this.pitch=Math.max(-1.25,this.pitch-dt);
   if(moving){let norm=Math.hypot(mx,mz);mx/=norm;mz/=norm;const speed=(this.state?.inventory.includes('bench')?2.8:this.keys.has('ShiftLeft')?6:3.8)*this.speedScale;
    const {dx,dz}=movePlayer(this.player,mx,mz,this.yaw,dt,speed,(x,z)=>this.blocked(x,z));this.walkTime+=dt*(speed/3.8)*9;
    if(time-this.lastStep>(speed>3?.32:.47)){this.lastStep=time;onStep?.();}
    this.avatar.rotation.y=Math.atan2(dx,dz);}
   let swing=moving?Math.sin(this.walkTime)*.48:0;
   for(const [name,sign] of [['LegL',1],['LegR',-1],['ArmL',-1],['ArmR',1]]){const limb=this.get(name);if(limb)limb.rotation.x=THREE.MathUtils.lerp(limb.rotation.x,swing*sign,.3);}
   this.avatar.position.copy(this.player);
   const forward=V(-Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch));
   if(this.state?.inventory.includes('bench')){const b=this.get('Bench');b.position.copy(this.player).add(V(-Math.sin(this.yaw)*1.3,.12,-Math.cos(this.yaw)*1.3));b.rotation.y=this.yaw;}
   this.held.visible=!this.thirdPerson;this.held.rotation.z=this.motion?Math.sin(this.walkTime)*.016:0;
   const eye=this.player.clone().add(V(0,1.63,0));
   if(this.thirdPerson){const pivot=this.player.clone().add(V(0,1.45,0));const desired=pivot.clone().sub(forward.clone().multiplyScalar(this.zoom)).add(V(0,.27,0));const direction=desired.clone().sub(pivot);const len=direction.length();direction.normalize();const ray=new THREE.Ray(pivot,direction);let distance=len;
    for(const b of this.collisionBoxes){const hit=ray.intersectBox(b,new THREE.Vector3());if(hit)distance=Math.min(distance,Math.max(.28,pivot.distanceTo(hit)-.2));}this.camera.position.copy(pivot).addScaledVector(direction,distance);this.camera.lookAt(pivot.clone().addScaledVector(forward,8));this.avatar.visible=distance>.65;
   }else{this.camera.position.copy(eye);if(this.motion&&moving)this.camera.position.y+=Math.sin(this.walkTime*2)*.009;this.camera.lookAt(eye.clone().add(forward));this.avatar.visible=false;}
  }else if(!this.started){this.camera.position.set(1.7+Math.sin(time*.1)*.18,2.25,4.9);this.camera.lookAt(-1.2,1.8,-2.4);this.avatar.visible=false;}
  if(this.state?.stage>=3&&this.state.stage<4)this.get('Carousel').rotation.y=time*.48;
  if(this.mode==='heaven'&&this.musicBox&&this.heavenMusic)this.musicBox.rotation.y=time*.30;
  this.dust.rotation.y=time*.003;
  if(this.mode==='rescue')this.rescueRuntime.afterUpdate(dt,time);
  this.camera.updateMatrixWorld();this.scene.updateMatrixWorld();
  this.ray.setFromCamera(new THREE.Vector2(),this.camera);
  let hits=this.ray.intersectObjects(this.targets,false);this.hit=null;
  for(const h of hits){const t=h.object,st=this.state?.stage||0,id=t.userData.id;
   if(!t.visible)continue;
   if(t.userData.stage>=0&&t.userData.stage!==st)continue;
   if(id==='frames'&&this.state?.framesSolved)continue;
   if(id==='memory-safe'&&(!this.state.framesSolved||st!==1))continue;
   if(id==='bench'&&(st!==5||this.state.inventory.includes('bench')))continue;if(id==='carousel'&&st>=4)continue;
   if(this.player.clone().add(V(0,1.3,0)).distanceTo(t.position)>3.05)continue;
   const front=t.position.clone().sub(this.player);if(front.length()>4)continue;
   this.hit=t.userData;break;
  }
  this.renderer.render(this.scene,this.camera);
  if(this.active&&this.quality==='auto'){
   this.sampleTime+=dt;this.sampleFrames++;
   if(this.sampleTime>=2.5){const fps=this.sampleFrames/this.sampleTime;const next=THREE.MathUtils.clamp(this.dpr+(fps<42?-.1:fps>57?.05:0),.65,Math.min(devicePixelRatio,1.15));if(Math.abs(next-this.dpr)>.01){this.dpr=next;this.renderer.setPixelRatio(next);this.renderer.setSize(innerWidth,innerHeight);}this.sampleTime=0;this.sampleFrames=0;}
  }
 }
}
