import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movePlayer} from '../src/movement.js';
test('walking distance is equal at 10, 30 and 144 FPS',()=>{
 for(const fps of [10,30,144]){const p={x:0,z:0};for(let i=0;i<fps;i++)movePlayer(p,0,-1,0,1/fps,3.8,()=>false);assert.ok(Math.abs(p.z+3.8)<1e-8);}
});
test('diagonals are normalized and large frames cannot tunnel through a thin wall',()=>{
 const p={x:0,z:0};movePlayer(p,1,-1,0,.25,6,()=>false);assert.ok(Math.abs(Math.hypot(p.x,p.z)-1.5)<1e-8);
 const q={x:0,z:0};movePlayer(q,1,0,0,.25,6,x=>x>.45&&x<.65);assert.ok(q.x<=.45);
});
