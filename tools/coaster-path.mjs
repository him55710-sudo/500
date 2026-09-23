import {CatmullRomCurve3,Vector3,Quaternion} from 'three';
import fs from 'node:fs/promises';
const samples=[];
function segment(points,phase,roll=()=>0){
 const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal');
 const count=Math.ceil(curve.getLength()/.65);
 for(let i=samples.length?1:0;i<=count;i++){
  const t=i/count,p=curve.getPointAt(t),forward=curve.getTangentAt(t).normalize();
  const right=new Vector3().crossVectors(forward,new Vector3(0,1,0)).normalize();
  const up=new Vector3().crossVectors(right,forward).normalize().applyQuaternion(new Quaternion().setFromAxisAngle(forward,roll(t)));
  samples.push({p:p.toArray(),up:up.toArray(),roll:roll(t),phase});
 }
}
segment([[0,2,75],[0,2,60],[0,2,45],[0,2,30],[0,4,18],[0,18,-14],[0,33.5,-43],[0,34.7,-51]],'lift');
segment([[0,34.7,-51],[-2,33,-58],[-9,15,-76],[-20,4,-89],[-38,7,-88],[-57,22,-67],[-65,23,-47],[-64,17,-29],[-53,12,-22],[-40,12,-11],[-30,12,0]],'drop',t=>Math.sin(t*Math.PI)*-.5);
const cork=[];for(let i=0;i<=160;i++){const t=i/160,a=t*Math.PI*4;cork.push([-30+58*t,12+5*(1-Math.cos(a)),5*Math.sin(a)]);}
segment(cork,'corkscrew',t=>-t*Math.PI*4);
segment([[28,12,0],[35,10,12],[44,7,25],[62,6,28],[77,13,14],[83,18,-9],[76,19,-28],[61,11,-36],[43,4,-29],[34,4,-13],[38,6,23],[44,4,42],[55,2,55],[55,2,70],[55,2,85]],'return',t=>.65*Math.sin(t*Math.PI*2));
// Blend the joins between authored sections, avoiding instant changes in pitch.
for(let pass=0;pass<12;pass++){
 const old=samples.map(s=>new Vector3(...s.p));
 for(let i=1;i<samples.length-1;i++)samples[i].p=old[i].multiplyScalar(.5).addScaledVector(old[i-1],.25).addScaledVector(old[i+1],.25).toArray();
}
let distance=0;for(let i=0;i<samples.length;i++){
 const s=samples[i],forward=new Vector3(...samples[Math.min(i+1,samples.length-1)].p).sub(new Vector3(...samples[Math.max(0,i-1)].p)).normalize();
 const right=new Vector3().crossVectors(forward,new Vector3(0,1,0)).normalize();
 s.up=new Vector3().crossVectors(right,forward).normalize().applyQuaternion(new Quaternion().setFromAxisAngle(forward,s.roll)).toArray();delete s.roll;
 if(i)distance+=new Vector3(...s.p).distanceTo(new Vector3(...samples[i-1].p));s.s=+distance.toFixed(5);
}
await fs.writeFile('public/assets/coaster-path.json',JSON.stringify({name:'Black Hole 2000 · Memory Transfer',reference:'https://rcdb.com/1345.htm',adaptation:'Photo-referenced lift, drop, double corkscrew and train. Condensed connecting bends and a fictional arrival station; not a surveyed replica.',samples,length:distance}));
console.log({samples:samples.length,length:distance,height:Math.max(...samples.map(s=>s.p[1]))});
