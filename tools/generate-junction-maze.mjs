import fs from 'node:fs';
// 21 x 21 occupancy grid; each chamber is hidden behind a side entrance.
const N=21,key=(x,z)=>`${x},${z}`,dirs=[[0,-1],[1,0],[0,1],[-1,0]];
const rooms=[{x:17,z:14,door:[15,15]},{x:3,z:6,door:[5,7]}];
function flood(cells,start,goal){const queue=[start],prev=new Map([[start,null]]);for(let i=0;i<queue.length;i++){const p=queue[i];if(p===goal)break;const [x,z]=p.split(',').map(Number);for(const [dx,dz] of dirs){const q=key(x+dx,z+dz);if(cells.has(q)&&!prev.has(q)){prev.set(q,p);queue.push(q);}}}return prev;}
function compress(path){return path.filter((p,i)=>!i||i===path.length-1||(p[0]-path[i-1][0]!==path[i+1][0]-p[0])||(p[1]-path[i-1][1]!==path[i+1][1]-p[1]));}
let result;
for(let seed=2026;seed<20000;seed++){
 let v=seed;const rand=()=>((v=(Math.imul(v,1664525)+1013904223)>>>0)/4294967296);
 const cells=new Set(['9,19']),seen=new Set(['9,19']),stack=[[9,19]];
 while(stack.length){const [x,z]=stack.at(-1),ns=dirs.map(([dx,dz])=>[x+dx*2,z+dz*2]).filter(([a,b])=>a>0&&a<N-1&&b>0&&b<N-1&&!seen.has(key(a,b)));if(!ns.length){stack.pop();continue;}const [a,b]=ns[Math.floor(rand()*ns.length)];cells.add(key((x+a)/2,(z+b)/2));cells.add(key(a,b));seen.add(key(a,b));stack.push([a,b]);}
 for(const room of rooms)for(let z=room.z-2;z<=room.z+2;z++)for(let x=room.x-2;x<=room.x+2;x++){const edge=Math.abs(x-room.x)===2||Math.abs(z-room.z)===2;if(edge)cells.delete(key(x,z));else cells.add(key(x,z));}
 rooms.forEach(r=>cells.add(key(...r.door)));
 for(let z=9;z<=11;z++)for(let x=9;x<=11;x++)cells.add(key(x,z));
 for(const p of [[10,20],[10,19],[10,0],[10,1]])cells.add(key(...p));
 const reachable=flood(cells,'10,20');
 if(!['17,15','3,7','10,10','10,0'].every(p=>reachable.has(p))||reachable.size<180)continue;
 const path=[];for(let p='17,15';p;p=reachable.get(p))path.push(p.split(',').map(Number));path.reverse();const route=compress(path);
 if(route.length<12||route.length>18||path.length<30||path.length>52)continue;
 const connected=new Set(reachable.keys());
 const deadEnds=[...connected].filter(p=>{const [x,z]=p.split(',').map(Number);return dirs.filter(([dx,dz])=>connected.has(key(x+dx,z+dz))).length===1;}).length;
 if(deadEnds<10)continue;
 result={version:2,seed,cellSize:2,columns:N,rows:N,wallHeight:2.8,openCells:[...connected].map(p=>p.split(',').map(Number)).sort((a,b)=>a[1]-b[1]||a[0]-b[0]),route,branches:[],rooms,minions:[[18,15],[4,7],[11,11]],spawn:[0,0,42.5],red:[14,1.65,28],blue:[-14,1.65,12],signal:[0,2.8,20],circle:[0,.05,-8],bounds:[-25.8,25.8,-12.4,44],stats:{openCells:connected.size,deadEnds,redSteps:path.length-1,redTurns:route.length-1}};break;
}
if(!result)throw new Error('No suitable maze');
fs.writeFileSync('src/junction-layout.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({seed:result.seed,stats:result.stats,route:result.route}));
