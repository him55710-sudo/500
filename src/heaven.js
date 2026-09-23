import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {polishRoomMaterials} from './render-look.js';

// Loaded only when the player enters the bonus room. Shares the existing renderer and controller.
export async function enterHeaven(world,onProgress){
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/kitty-heaven.glb',e=>onProgress?.(e.loaded/(e.total||1)));
 const previousScene=world.scene;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#dceeff');
 scene.environment=previousScene.environment;scene.environmentIntensity=.60;
 world.scene=scene;world.salonScene=previousScene;world.model=gltf.scene;scene.add(gltf.scene);
 gltf.scene.add(world.avatar);world.avatar.visible=false;
 scene.add(world.camera);world.held.visible=false;
 scene.add(new THREE.HemisphereLight(0xfffcff,0xe8cadd,1.20));
 const sun=new THREE.DirectionalLight(0xfff9f2,1.65);sun.position.set(-3,5,3);sun.castShadow=true;
 sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:25});sun.shadow.bias=-.0003;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
 const fill=new THREE.DirectionalLight(0xdbeaff,.65);fill.position.set(5,3,-5);scene.add(fill);
 const avatarMeshes=new Set();world.avatar.traverse(o=>{if(o.isMesh)avatarMeshes.add(o);});
 gltf.scene.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=!avatarMeshes.has(o)&&!o.name.includes('Cloud')&&!o.name.includes('sky');o.receiveShadow=true;
  for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(m.map)m.map.anisotropy=4;}
 });
 polishRoomMaterials(gltf.scene,'heaven');
 world.renderer.toneMappingExposure=1.04;world.renderer.shadowMap.needsUpdate=true;
 world.mode='heaven';world.state={stage:0,inventory:[]};world.player.set(0,0,4.80);world.yaw=0;world.pitch=.01;world.toggleView(false);
 world.wallBoxes=[new THREE.Box3(new THREE.Vector3(-7,0,-7.1),new THREE.Vector3(7,6,-6.80)),new THREE.Box3(new THREE.Vector3(-7.1,0,-7),new THREE.Vector3(-6.8,6,7)),new THREE.Box3(new THREE.Vector3(6.8,0,-7),new THREE.Vector3(7.1,6,7)),new THREE.Box3(new THREE.Vector3(-7,0,6.8),new THREE.Vector3(7,6,7.1))];
 world.colliders=[[-1.85,1.85,-5.60,-1.73],[-6.65,-3.65,-4.95,-2.48],[4.15,5.60,-3.45,-.55],[-5.97,-2.95,.48,2.65],[-3.66,-2.05,2.56,4.19],[1.78,4.49,4.09,5.20]];
 world.collisionBoxes=[...world.wallBoxes,...world.colliders.map(([a,b,c,d])=>new THREE.Box3(new THREE.Vector3(a,0,c),new THREE.Vector3(b,2,d)))];
 world.pendingAnimations=[];world.targets=[];world.hit=null;
 const material=new THREE.MeshBasicMaterial({visible:false});
 function target(id,name,desc,p,size){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...p);mesh.userData={id,name,desc,stage:-1};scene.add(mesh);world.targets.push(mesh);}
 target('heaven-gift','현수가 준비한 500일 선물','리본을 풀어 편지 읽기',[3.1,1.40,4.48],[.95,.85,.8]);
 target('heaven-kitty','꼭 안아 주고 싶은 헬로키티','하영이의 커다란 공주 인형',[-4.40,1.50,1.50],[1.05,1.50,1.05]);
 target('heaven-music','헬로키티 오르골','별빛 멜로디 켜기 / 끄기',[4.05,1.50,4.55],[.9,1.15,.9]);
 for(let i=0;i<4;i++)target('heaven-photo-'+i,'헬로키티 사진 액자','가까이서 사진 보기',[6.62,2.7,(i-1.5)*1.85+1.40],[.35,1.6,1.5]);
 target('heaven-return','첫 번째 기억으로','첫 방으로 돌아가기',[0,1.6,6.64],[2.10,3.2,.35]);
 world.addDust();world.dust.material.color.set('#fff0b7');world.dust.material.size=.018;world.dust.material.opacity=.45;
 world.model.updateMatrixWorld(true);world.scene.updateMatrixWorld(true);
 // Static palace geometry never changes; only the small music-box group rotates.
 world.model.traverse(o=>{if(o.isMesh&&!avatarMeshes.has(o)){o.updateMatrix();o.matrixAutoUpdate=false;}});
 world.musicBox=world.get('Kitty_music_box');world.heavenMusic=true;
}
