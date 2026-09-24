import test from 'node:test';
import assert from 'node:assert/strict';
import {layout} from '../src/junction-state.js';
import {mazeCells,mazePoint,mazeWalls} from '../src/junction-world.js';
test('larger maze connects every chamber, collectible and stage with player clearance',()=>{
 const cells=mazeCells(),walls=mazeWalls(),seen=new Set(['10,20']),q=['10,20'];
 for(let i=0;i<q.length;i++){const [c,r]=q[i].split(',').map(Number);for(const [dx,dz] of [[0,1],[1,0],[0,-1],[-1,0]]){const n=`${c+dx},${r+dz}`;if(cells.has(n)&&!seen.has(n)){seen.add(n);q.push(n);}}}
 assert.equal(seen.size,cells.size);assert.equal(layout.columns*layout.cellSize,42);assert.ok(layout.stats.deadEnds>=14);
 for(const p of [...layout.minions,[17,15],[3,7],[10,10],[10,0]])assert.ok(seen.has(p.join(',')),`reachable ${p}`);
 for(const p of layout.openCells){const [x,z]=mazePoint(p);assert.ok(!walls.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22),`clear ${p}`);}
 for(const room of layout.rooms){let entrances=0;for(let z=room.z-2;z<=room.z+2;z++)for(let x=room.x-2;x<=room.x+2;x++)if((Math.abs(x-room.x)===2||Math.abs(z-room.z)===2)&&cells.has(`${x},${z}`))entrances++;assert.equal(entrances,1);}
 assert.ok(layout.red[0]>layout.signal[0]&&layout.red[2]>layout.signal[2]);assert.ok(layout.blue[0]<layout.signal[0]&&layout.blue[2]<layout.signal[2]);
 assert.deepEqual([layout.red[0]+layout.blue[0],layout.red[2]+layout.blue[2]],[layout.signal[0]*2,layout.signal[2]*2]);
});
