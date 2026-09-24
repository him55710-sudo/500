import test from 'node:test';
import assert from 'node:assert/strict';
import {lookRadiansPerPixel} from '../src/look-controls.js';

test('default gain matches projected pixels and scales with viewport/FOV, not frame count',()=>{
 for(const height of [600,900,1440])for(const fov of [50,65,85]){
  const gain=lookRadiansPerPixel(fov,height),focalPixels=height/(2*Math.tan(fov*Math.PI/360));
  assert.ok(Math.abs(focalPixels*gain-1)<1e-12);
  for(const events of [1,5,120])assert.ok(Math.abs(Array(events).fill(180/events).reduce((angle,dx)=>angle+dx*gain,0)-180*gain)<1e-12);
 }
 assert.equal(lookRadiansPerPixel(65,900,2),lookRadiansPerPixel(65,900)*2);
 assert.equal(lookRadiansPerPixel(65,1800)*2,lookRadiansPerPixel(65,900));
});
