import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {OBB} from 'three/addons/math/OBB.js';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {addMemorySafe,syncMemorySafe,memorySafeAngles} from '../src/personal-memories.js';

await MeshoptDecoder.ready;
const document=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(fileURLToPath(new URL('../public/assets/memory-room.glb',import.meta.url)));
function fixture(){
 const material=new THREE.MeshBasicMaterial();
 function convert(node){
  const group=new THREE.Group();group.name=node.getName();group.applyMatrix4(new THREE.Matrix4().fromArray(node.getMatrix()));
  for(const prim of node.getMesh()?.listPrimitives()||[]){
   const geom=new THREE.BufferGeometry(),position=prim.getAttribute('POSITION');geom.setAttribute('position',new THREE.BufferAttribute(position.getArray().slice(),3,position.getNormalized()));
   if(prim.getIndices())geom.setIndex(new THREE.BufferAttribute(prim.getIndices().getArray().slice(),1));
   const mesh=new THREE.Mesh(geom,material);mesh.name=node.getName();group.add(mesh);
  }
  for(const child of node.listChildren())group.add(convert(child));
  return group;
 }
 const model=new THREE.Group();for(const node of document.getRoot().getDefaultScene().listChildren())model.add(convert(node));
 const scene=new THREE.Scene();scene.add(model);
 const world={scene,model,get:name=>model.getObjectByName(name),pending:[],animate(object,key,to,duration,done){this.pending.push({object,key,to,duration,done});}};
 addMemorySafe(world);return world;
}
function meshes(root){const result=[];root.traverse(o=>{if(o.isMesh)result.push(o);});return result;}
function bounds(mesh){mesh.geometry.computeBoundingBox();const obb=new OBB().fromBox3(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);mesh.geometry.boundingBox.getCenter(obb.center).applyMatrix4(mesh.matrixWorld);return obb;}

test('actual GLB picture clears the recessed safe throughout both opening arcs',()=>{
 const world=fixture(),frameMeshes=meshes(world.memoryFrameHinge.getObjectByName('MemoryFrame2')),safeMeshes=meshes(world.memorySafe);
 const adjacent=[...meshes(world.get('MemoryFrame1')),...meshes(world.get('MemoryFrame3'))];
 const check=()=>{
  world.scene.updateMatrixWorld(true);
  for(const f of frameMeshes)for(const other of [...safeMeshes,...adjacent])assert.equal(bounds(f).intersectsOBB(bounds(other)),false,`frame intersects ${other.name} at ${world.memoryFrameHinge.rotation.y}: ${JSON.stringify([new THREE.Box3().setFromObject(f),new THREE.Box3().setFromObject(other)])}`);
  for(const door of meshes(world.safeHinge))for(const other of adjacent)assert.equal(bounds(door).intersectsOBB(bounds(other)),false,`safe door intersects adjacent ${other.name}`);
 };
 for(let i=0;i<=60;i++){world.memoryFrameHinge.rotation.y=memorySafeAngles.frame*i/60;check();}
 for(let i=0;i<=60;i++){world.safeHinge.rotation.y=memorySafeAngles.door*i/60;check();}
 // The actual wall mesh must no longer obstruct the safe's interior.
 const ray=new THREE.Raycaster(new THREE.Vector3(-1.45,2.85,-5.3),new THREE.Vector3(0,0,-1),0,.9);
 assert.equal(ray.intersectObjects(meshes(world.model).filter(m=>m.name.startsWith('Architecture_')),false).length,0);
});

test('rapid safe opening waits for the picture, and save restoration snaps to clear poses',()=>{
 const world=fixture();
 syncMemorySafe(world,{stage:1,framesSolved:false,safeOpen:false},false);
 const solved={stage:1,framesSolved:true,safeOpen:false};syncMemorySafe(world,solved);
 syncMemorySafe(world,{...solved,safeOpen:true});
 assert.equal(world.pending.length,1);assert.equal(world.safeHinge.rotation.y,0);
 const frameAnimation=world.pending.shift();frameAnimation.object[frameAnimation.key]=frameAnimation.to;frameAnimation.done();
 assert.equal(world.pending.length,1);assert.equal(world.pending[0].object,world.safeHinge.rotation);
 syncMemorySafe(world,{...solved,safeOpen:true});assert.equal(world.pending.length,1,'do not restart an opening door');
 syncMemorySafe(world,{...solved,safeOpen:true},false);
 assert.equal(world.memoryFrameHinge.rotation.y,memorySafeAngles.frame);assert.equal(world.safeHinge.rotation.y,memorySafeAngles.door);
});
