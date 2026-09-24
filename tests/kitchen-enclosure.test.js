import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {stations,kitchenWalls} from '../src/kitchen-layout.js';

await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(fileURLToPath(new URL('../public/assets/day-200-kitchen.glb',import.meta.url)));
function convert(node){
 const group=new THREE.Group();group.name=node.getName();group.applyMatrix4(new THREE.Matrix4().fromArray(node.getMatrix()));
 for(const primitive of node.getMesh()?.listPrimitives()||[]){
  const p=primitive.getAttribute('POSITION'),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(p.getArray(),3,p.getNormalized()));
  if(primitive.getIndices())geometry.setIndex(new THREE.BufferAttribute(primitive.getIndices().getArray(),1));
  const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:primitive.getMaterial()?.getDoubleSided()?THREE.DoubleSide:THREE.FrontSide}));group.add(mesh);
 }
 for(const child of node.listChildren())group.add(convert(child));return group;
}
const model=new THREE.Group();for(const node of doc.getRoot().getDefaultScene().listChildren())model.add(convert(node));model.updateMatrixWorld(true);
const point=(key,x,y,z)=>{const [cx,cz,a]=stations[key];return new THREE.Vector3(cx+x*Math.cos(a)+z*Math.sin(a),y,cz-x*Math.sin(a)+z*Math.cos(a));};
function cast(key,origin,direction,far=9){return new THREE.Raycaster(point(key,...origin),point(key,...direction).sub(point(key,0,0,0)).normalize(),0,far).intersectObject(model.getObjectByName('Bay_'+key),true);}

test('exported cooking-room walls close every upper angle and the front corners',()=>{
 for(const key of Object.keys(stations)){
  for(const y of [3.65,5,7.7])for(let i=0;i<360;i++){
   const a=i*Math.PI/180;assert.ok(cast(key,[0,y,0],[Math.cos(a),0,Math.sin(a)]).length,`${key}: wall gap at height ${y}, angle ${i}`);
  }
  for(const side of [-1,1])assert.ok(cast(key,[side*3,1.63,1.8],[side*.5,0,.35],1).length,`${key}: open front corner`);
  assert.equal(cast(key,[0,1.63,0],[0,0,1],4).length,0,`${key}: real doorway must remain open`);
 }
});

test('wall collision volumes seal the corners while preserving a walkable doorway',()=>{
 for(const key of Object.keys(stations)){
  const boxes=kitchenWalls.filter(w=>w.name.startsWith(key+'-')).map(w=>new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(...w.center),new THREE.Vector3(...w.size)));
  for(const side of [-1,1])assert.ok(boxes.some(b=>b.containsPoint(point(key,side*3.5,1.63,2.15))));
  assert.ok(boxes.some(b=>b.containsPoint(point(key,0,1.63,-3.24))),'back wall needs collision');
  for(let z=1.6;z<=2.8;z+=.1)assert.ok(boxes.every(b=>!b.containsPoint(point(key,0,1.63,z))),'opening is traversable');
 }
});
