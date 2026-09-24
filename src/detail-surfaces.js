import * as THREE from 'three';

let maps;
async function textures(){
 if(!maps)maps=Promise.all(['salon/morning-sky.jpg','wood-floor-normal.jpg','salon/woven-normal.png','salon/woven-roughness.jpg'].map(p=>new THREE.TextureLoader().loadAsync('/assets/'+p))).catch(e=>{maps=null;throw e;});
 return maps;
}
// Project in world metres so the batched, quantized Blender meshes retain a stable scale.
function projectUV(mesh,sky=false){
 mesh.geometry=mesh.geometry.clone();const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal;
 const uv=new THREE.Float32BufferAttribute(new Float32Array(p.count*2),2),point=new THREE.Vector3(),normal=new THREE.Vector3(),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
 for(let i=0;i<p.count;i++){
  point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);
  normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();
  if(sky)uv.setXY(i,(point.z+.35)/2.8,(point.y-1.05)/2.2);
  else if(Math.abs(normal.y)>.65)uv.setXY(i,point.x,point.z);
  else if(Math.abs(normal.x)>.65)uv.setXY(i,point.z,point.y);
  else uv.setXY(i,point.x,point.y);
 }
 g.setAttribute('uv',uv);
}
export async function finishDetailSurfaces(root){
 let needed=false;root.traverse(o=>{if(['Detail daylight','Detail oak','Detail linen','Detail teal upholstery'].includes(o.material?.name))needed=true;});
 if(!needed)return;
 const [sky,woodNormal,weave,weaveRoughness]=await textures();
 sky.colorSpace=THREE.SRGBColorSpace;
 for(const t of [woodNormal,weave,weaveRoughness]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;}
 woodNormal.repeat.set(.5,.5);weave.repeat.set(10,10);weaveRoughness.repeat.set(10,10);
 root.updateWorldMatrix(true,true);
 root.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material))return;const m=o.material;
  if(m.name==='Detail daylight'){
   projectUV(o,true);o.material=new THREE.MeshBasicMaterial({map:sky,color:'#e4f5ff'});o.castShadow=false;
  }else if(m.name==='Detail oak'){
   projectUV(o);m.normalMap=woodNormal;m.normalScale.set(.2,.2);m.color.set('#c4a57b');m.roughness=.76;m.needsUpdate=true;
  }else if(['Detail linen','Detail teal upholstery'].includes(m.name)){
   projectUV(o);m.normalMap=weave;m.normalScale.set(.13,.13);m.roughnessMap=weaveRoughness;m.roughness=.94;m.needsUpdate=true;
  }
 });
}
