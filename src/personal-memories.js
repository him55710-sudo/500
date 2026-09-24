import * as THREE from 'three';
import {subtractBox} from './salon-upgrades.js';
export {memoryPhotos} from './memory-data.js';
export const memorySafeAngles={frame:-Math.PI*.60,door:Math.PI*.60};
export async function personalPhoto(path,aspect){
 const image=await new THREE.ImageLoader().loadAsync(path),c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024/aspect);
 const ctx=c.getContext('2d');ctx.fillStyle='#f3ede1';ctx.fillRect(0,0,c.width,c.height);
 const scale=Math.min(c.width/image.width,c.height/image.height);ctx.drawImage(image,(c.width-image.width*scale)/2,(c.height-image.height*scale)/2,image.width*scale,image.height*scale);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
export function addMemorySafe(world){
 // Recess the safe into a real aperture, behind the closed picture's backing.
 const aperture={min:[-2.01,2.17,-6.34],max:[-.89,3.53,-5.86]};
 const opening=new THREE.Box3(new THREE.Vector3(...aperture.min),new THREE.Vector3(...aperture.max));
 world.model.updateMatrixWorld(true);
 world.model.traverse(o=>{
  if(!o.isMesh||!o.name.startsWith('Architecture_')||!o.geometry.attributes.position)return;
  if(!new THREE.Box3().setFromObject(o).intersectsBox(opening))return;
  o.geometry=subtractBox(o.geometry,o.matrixWorld,aperture);
 });
 const group=new THREE.Group();group.name='MemorySafe';group.position.set(-1.45,2.85,-5.96);world.scene.add(group);world.memorySafe=group;
 const dark=new THREE.MeshStandardMaterial({color:'#24312f',metalness:.65,roughness:.35}),brass=new THREE.MeshStandardMaterial({color:'#cba267',metalness:.7,roughness:.3});
 const cube=(p,s,m,parent=group)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);parent.add(o);return o;};
 cube([0,0,-.29],[1.08,1.32,.045],dark).name='Safe back';
 cube([0,-.55,-.14],[.96,.05,.26],brass).name='Safe shelf';
 for(const x of [-.52,.52])cube([x,0,-.14],[.06,1.32,.32],dark).name='Safe side';
 for(const y of [-.63,.63])cube([0,y,-.14],[1.08,.06,.32],dark).name='Safe rim';
 const hinge=new THREE.Group();hinge.name='Safe right hinge';hinge.position.set(.49,0,.045);group.add(hinge);world.safeHinge=hinge;
 cube([-.49,0,0],[.98,1.19,.045],dark,hinge).name='Safe door';
 const knob=new THREE.Mesh(new THREE.TorusGeometry(.105,.018,8,28),brass);knob.name='Safe handle';knob.position.set(-.76,0,.045);hinge.add(knob);
 const plate=cube([-.49,0,-.027],[.86,1.06,.012],new THREE.MeshStandardMaterial({color:'#4c5e58',metalness:.35,roughness:.6}),hinge);plate.name='Safe door inner lining';
 world.scene.updateMatrixWorld(true);
 const frame=world.get('MemoryFrame2'),pivot=new THREE.Group();pivot.name='Memory frame left hinge';pivot.position.set(-2.10,2.85,-5.68);world.scene.add(pivot);pivot.attach(frame);world.memoryFrameHinge=pivot;
 // Small hinge knuckles make the edge-mounted pivot readable in the room.
 for(const y of [-.48,.48]){
  const pin=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.14,12),brass);pin.position.set(0,y,0);pivot.add(pin);
 }
 const violin=world.get('ViolinKeyring');violin.position.set(-1.45,2.62,-6.12);violin.scale.multiplyScalar(1.2);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.075,.008,8,28),new THREE.MeshStandardMaterial({color:'#dbe1e4',metalness:.95,roughness:.2}));ring.position.set(-.14,.07,.035);violin.add(ring);
 const shape=new THREE.CatmullRomCurve3([[-.09,-.12,0],[-.02,-.1,0],[-.07,-.03,0],[-.13,-.09,0],[-.05,-.19,0],[-.04,-.08,0],[-.11,.02,0],[-.08,.065,0],[-.05,.025,0]].map(p=>new THREE.Vector3(...p)));
 const clef=new THREE.Mesh(new THREE.TubeGeometry(shape,36,.008,6,false),brass);clef.position.set(-.12,0,.04);violin.add(clef);group.visible=false;
}

export function syncMemorySafe(world,state,animate=true){
 const frameOpen=!!state.framesSolved||state.stage>=2,doorOpen=frameOpen&&!!state.safeOpen;
 world.memorySafe.visible=frameOpen;
 world.safeDoorWanted=doorOpen;
 const openDoor=()=>{
  if(!world.safeDoorWanted||world.safeDoorWasOpen)return;
  world.safeDoorWasOpen=true;
  world.animate(world.safeHinge.rotation,'y',memorySafeAngles.door,.8);
 };
 if(!animate){
  world.memoryFrameHinge.rotation.y=frameOpen?memorySafeAngles.frame:0;
  world.safeHinge.rotation.y=doorOpen?memorySafeAngles.door:0;
  world.safeWasOpen=frameOpen;world.safeDoorWasOpen=doorOpen;
  return;
 }
 if(world.safeWasOpen!==frameOpen){
  world.safeWasOpen=frameOpen;
  if(frameOpen)world.animate(world.memoryFrameHinge.rotation,'y',memorySafeAngles.frame,1.2,openDoor);
  else world.memoryFrameHinge.rotation.y=0;
 }
 // A fast click may request the safe while the frame is still moving. Queue it
 // until the frame has cleared the opening instead of swinging through it.
 if(doorOpen&&world.memoryFrameHinge.rotation.y<=memorySafeAngles.frame+.001)openDoor();
 if(!doorOpen){world.safeDoorWasOpen=false;world.safeHinge.rotation.y=0;}
}
