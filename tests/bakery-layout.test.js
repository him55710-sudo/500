import test from 'node:test';
import assert from 'node:assert/strict';
import layout from '../src/bakery-layout.json' with {type:'json'};

test('expanded bakery has separate order, PIN terminal and safe, with walkable approaches',()=>{
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
 assert.ok(distance(layout.order,layout.register)>5);
 assert.ok(distance(layout.safe,layout.register)>3.5);
 assert.ok(distance(layout.safe,layout.order)>7);
 const [left,right,back,front]=layout.bounds;
 assert.ok((right-left)*(front-back)>180);
 const blocked=(x,z)=>x<left||x>right||z<back||z>front||layout.colliders.some(([a,b,c,d])=>x>a-.22&&x<b+.22&&z>c-.22&&z<d+.22);
 const step=.1,key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`;
 const start=key(layout.spawn[0],layout.spawn[2]),queue=[start],seen=new Set([start]);
 for(let i=0;i<queue.length;i++){const [x,z]=queue[i].split(',').map(Number);for(const [dx,dz]of [[0,1],[0,-1],[1,0],[-1,0]]){const next=`${x+dx},${z+dz}`;if(!seen.has(next)&&!blocked((x+dx)*step,(z+dz)*step)){seen.add(next);queue.push(next);}}}
 for(const [name,p,dx,dz]of [['order',layout.order,0,1.7],['register',layout.register,0,1.75],['key',layout.key,0,1],['safe',layout.safe,0,1.35],['cake',layout.cake,0,1.8],['letter',layout.letter,-1.15,.75],['exit',layout.gate,0,1.65]])assert.ok(seen.has(key(p[0]+dx,p[2]+dz)),`${name} must have a connected approach`);
});
