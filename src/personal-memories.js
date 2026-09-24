import * as THREE from 'three';
export {memoryPhotos} from './memory-data.js';
export async function personalPhoto(path,aspect){
 const image=await new THREE.ImageLoader().loadAsync(path),c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024/aspect);
 const ctx=c.getContext('2d');ctx.fillStyle='#f3ede1';ctx.fillRect(0,0,c.width,c.height);
 const scale=Math.min(c.width/image.width,c.height/image.height);ctx.drawImage(image,(c.width-image.width*scale)/2,(c.height-image.height*scale)/2,image.width*scale,image.height*scale);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
export function addMemorySafe(world){
 const group=new THREE.Group();group.name='MemorySafe';group.position.set(-1.45,2.85,-5.59);world.scene.add(group);world.memorySafe=group;
 const dark=new THREE.MeshStandardMaterial({color:'#24312f',metalness:.65,roughness:.35}),brass=new THREE.MeshStandardMaterial({color:'#cba267',metalness:.7,roughness:.3});
 const cube=(p,s,m,parent=group)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);parent.add(o);return o;};
 cube([0,0,-.10],[1.1,1.34,.12],dark);cube([0,-.55,.09],[1,.09,.33],brass);
 for(const x of [-.55,.55])cube([x,0,.07],[.07,1.34,.34],dark);for(const y of [-.65,.65])cube([0,y,.07],[1.1,.07,.34],dark);
 const hinge=new THREE.Group();hinge.position.set(-.53,0,.25);group.add(hinge);world.safeHinge=hinge;cube([.53,0,0],[1.06,1.27,.06],dark,hinge);
 const knob=new THREE.Mesh(new THREE.TorusGeometry(.14,.025,8,28),brass);knob.position.set(.8,0,.06);hinge.add(knob);
 world.scene.updateMatrixWorld(true);const frame=world.get('MemoryFrame2'),pivot=new THREE.Group();pivot.position.set(-2.10,2.85,-5.32);world.scene.add(pivot);pivot.attach(frame);world.memoryFrameHinge=pivot;
 const violin=world.get('ViolinKeyring');violin.position.set(-1.45,2.53,-5.34);violin.scale.multiplyScalar(1.2);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.075,.008,8,28),new THREE.MeshStandardMaterial({color:'#dbe1e4',metalness:.95,roughness:.2}));ring.position.set(-.14,.07,.035);violin.add(ring);
 const shape=new THREE.CatmullRomCurve3([[-.09,-.12,0],[-.02,-.1,0],[-.07,-.03,0],[-.13,-.09,0],[-.05,-.19,0],[-.04,-.08,0],[-.11,.02,0],[-.08,.065,0],[-.05,.025,0]].map(p=>new THREE.Vector3(...p)));
 const clef=new THREE.Mesh(new THREE.TubeGeometry(shape,36,.008,6,false),brass);clef.position.set(-.12,0,.04);violin.add(clef);group.visible=false;
}
