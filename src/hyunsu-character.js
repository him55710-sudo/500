import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer/decoder';

export const HYUNSU_ASSET='/assets/characters/hyunsu.glb';
let template;
async function loadTemplate(){
 if(!template)template=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(HYUNSU_ASSET).then(g=>{
  const character=g.scene.getObjectByName('HyunsuMaster');
  if(!character)throw new Error('현수 캐릭터를 불러오지 못했어요.');
  character.traverse(o=>{
   if(!o.isMesh)return;
   o.castShadow=true;o.receiveShadow=true;
   for(const m of Array.isArray(o.material)?o.material:[o.material]){
    if(m.map)m.map.anisotropy=4;
    if(m.name.startsWith('MI_Hair_1'))m.color.set('#30221a');
    if(m.name.startsWith('Polo navy knit')){m.color.set('#15375e');m.roughness=.9;}
    if(m.name.startsWith('TOMBOY charcoal wool')){m.color.set('#242933');m.roughness=.95;}
   }
  });
  return character;
 }).catch(error=>{template=null;throw error;});
 return template;
}

// All chapters instantiate the same exported head, body proportions and wardrobe.
// Only the original placement/pose is retained from chapter-authored placeholders.
export async function installHyunsu(root,names){
 const canonical=await loadTemplate();
 return names.map(name=>{
  const previous=root.getObjectByName(name);
  if(!previous)throw new Error(`현수 배치가 없어요: ${name}`);
  const next=canonical.clone(true);next.name=name;
  next.position.copy(previous.position);next.quaternion.copy(previous.quaternion);next.scale.copy(previous.scale);
  next.userData={...next.userData,characterId:'hyunsu-v1',sourceAsset:HYUNSU_ASSET};
  previous.parent.add(next);previous.removeFromParent();
  return next;
 });
}
