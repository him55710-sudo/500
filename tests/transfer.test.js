import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {subtractBox} from '../src/salon-upgrades.js';
import {trackPose} from '../src/transfer.js';

test('door aperture removes the solid wall while retaining both sides',()=>{
 const geometry=new THREE.BoxGeometry(12,5,.18).translate(0,2.5,-6);
 const cut=subtractBox(geometry,new THREE.Matrix4(),{min:[2.8,.015,-6.35],max:[4.5,3.15,-5.6]});
 const mesh=new THREE.Mesh(cut,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();
 const hits=x=>new THREE.Raycaster(new THREE.Vector3(x,1.6,0),new THREE.Vector3(0,0,-1)).intersectObject(mesh).length;
 assert.equal(hits(3.65),0);assert.ok(hits(2)>0);assert.ok(hits(5)>0);
 assert.ok(new THREE.Raycaster(new THREE.Vector3(3.65,4,0),new THREE.Vector3(0,0,-1)).intersectObject(mesh).length>0);
});
test('ride poses stay on the exported rails and avoid discontinuous camera turns',()=>{
 const path=JSON.parse(fs.readFileSync(new URL('../public/assets/coaster-path.json',import.meta.url)));
 let previous=null;const phases=new Set();
 for(const sample of path.samples){
  const pose=trackPose(path,sample.s);phases.add(pose.phase);
  assert.ok(pose.position.distanceTo(new THREE.Vector3(...sample.p))<.001);
  assert.ok(Math.abs(pose.quaternion.length()-1)<.0001);
  if(previous)assert.ok(previous.angleTo(pose.quaternion)<THREE.MathUtils.degToRad(12),'abrupt track orientation');
  previous=pose.quaternion;
 }
 assert.deepEqual([...phases],['lift','drop','corkscrew','return']);
 assert.ok(path.length>600&&path.length<800);
});
