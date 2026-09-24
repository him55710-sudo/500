import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';
import {finishDetailSurfaces} from './detail-surfaces.js';

let library;
export const detailColliders={
 rescue:[[-5.82,-4.78,-.5,2.6],[8.63,11.37,3.92,4.86],[21.6,26.4,4.15,4.85],[18.65,19.55,-4.25,-3.35],[28.25,28.95,3.85,4.55]],
 rotunda:[[-8.55,-6.85,.95,4.65],[6.85,8.55,.95,4.65]],
};
export async function addInteriorDetails(world,room){
 if(!library)library=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/details/interiors.glb').catch(e=>{library=null;throw e;});
 const gltf=await library,source=gltf.scene.getObjectByName('Design_'+room);
 if(!source)throw new Error(`공간 디테일이 없어요: ${room}`);
 const root=source.clone(true),materials=new Map();
 root.traverse(o=>{
  if(!o.isMesh)return;o.castShadow=!o.name.includes('daylight');o.receiveShadow=true;
  const copy=m=>{if(!materials.has(m))materials.set(m,m.clone());return materials.get(m);};
  o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);
 });
 root.userData.referenceStudy='docs/공간-조작-리디자인.md';world.model.add(root);world.interiorDetails=root;
 await finishDetailSurfaces(root);
 world.renderer.shadowMap.needsUpdate=true;
 return root;
}
