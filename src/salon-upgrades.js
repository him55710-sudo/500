import * as THREE from 'three';

// Subtract the door aperture from triangles, including the merged wall/mouldings.
// Keep all interpolated attributes so textures and lighting survive the cut.
export function subtractBox(geometry, matrix, bounds) {
 const source=geometry.index?geometry.toNonIndexed():geometry;
 const names=Object.keys(source.attributes), attrs=source.attributes;
 const output=Object.fromEntries(names.map(n=>[n,[]]));
 const point=new THREE.Vector3();let changed=false;
 const vertex=i=>{const a={};for(const n of names){const attr=attrs[n];a[n]=Array.from({length:attr.itemSize},(_,j)=>attr.getComponent(i,j));}point.fromArray(a.position).applyMatrix4(matrix);a.world=point.toArray();return a;};
 const mix=(a,b,t)=>Object.fromEntries([...names,'world'].map(n=>[n,a[n].map((v,k)=>v+(b[n][k]-v)*t)]));
 const emit=poly=>{for(let j=1;j<poly.length-1;j++)for(const v of [poly[0],poly[j],poly[j+1]])for(const n of names)output[n].push(...v[n]);};
 for(let i=0;i<attrs.position.count;i+=3){
  const tri=[vertex(i),vertex(i+1),vertex(i+2)];
  if([0,1,2].some(a=>tri.every(v=>v.world[a]<bounds.min[a])||tri.every(v=>v.world[a]>bounds.max[a]))){emit(tri);continue;}
  let remaining=tri;changed=true;
  for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
   if(!remaining.length)continue;
   const edge=sign===1?bounds.min[axis]:bounds.max[axis],inside=[],outside=[];
   for(let j=0;j<remaining.length;j++){
    const a=remaining[j],b=remaining[(j+1)%remaining.length],da=(a.world[axis]-edge)*sign,db=(b.world[axis]-edge)*sign;
    (da>=0?inside:outside).push(a);
    if((da>=0)!==(db>=0)){const v=mix(a,b,da/(da-db));inside.push(v);outside.push(v);}
   }
   emit(outside);remaining=inside;
  }
 }
 if(!changed){if(source!==geometry)source.dispose();return geometry;}
 const result=new THREE.BufferGeometry();for(const n of names)result.setAttribute(n,new THREE.Float32BufferAttribute(output[n],attrs[n].itemSize));
 result.computeBoundingBox();result.computeBoundingSphere();if(source!==geometry)source.dispose();return result;
}

export function improveSalon(world) {
 const door=world.get('ExitDoor');world.scene.updateMatrixWorld(true);
 const aperture={min:[2.80,.015,-6.35],max:[4.50,3.15,-5.60]};
 world.scene.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material)||!o.geometry.attributes.position)return;
  for(let p=o;p;p=p.parent)if(p===door)return;
  const b=new THREE.Box3().setFromObject(o);
  if(!b.intersectsBox(new THREE.Box3(new THREE.Vector3(...aperture.min),new THREE.Vector3(...aperture.max))))return;
  const g=subtractBox(o.geometry,o.matrixWorld,aperture);if(g!==o.geometry)o.geometry=g;
 });
 // Left hinge; the door swings away from the room without changing its closed pose.
 const hinge=new THREE.Group();hinge.name='ExitHinge';hinge.position.set(2.825,0,-5.77);world.scene.add(hinge);hinge.attach(door);world.doorHinge=hinge;
 world.wallBoxes.splice(0,1,new THREE.Box3(new THREE.Vector3(-6,0,-6.15),new THREE.Vector3(2.80,5,-5.9)),new THREE.Box3(new THREE.Vector3(4.50,0,-6.15),new THREE.Vector3(6,5,-5.9)));
 world.collisionBoxes=[...world.wallBoxes,...world.colliders.map(([a,b,c,d])=>new THREE.Box3(new THREE.Vector3(a,0,c),new THREE.Vector3(b,1.3,d)))];
 const mat=new THREE.MeshStandardMaterial({color:'#d9d3c5',roughness:.85});
 const box=(p,s,m=mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);world.scene.add(o);return o;};
 for(const x of [2.795,4.505])box([x,1.575,-5.975],[.04,3.15,.7]);
 box([3.65,3.16,-5.975],[1.75,.045,.7]);
 box([3.65,0,-8],[3.0,.06,4.5]);
 for(const x of [2.05,5.25]){box([x,.9,-8.1],[.07,.07,4.3]);for(const z of [-6.3,-7.5,-8.7,-10])box([x,.45,z],[.045,.9,.045]);}
 const sky=new THREE.MeshBasicMaterial({color:'#c6dff0'});box([3.65,3.7,-10.5],[5,8,.08],sky);
 world.label('NEXT MEMORY  /  BOARDING',[3.65,2.5,-10.42],2.5,27,'#536d7a');
 world.exitLight.position.set(3.65,2.4,-6.8);
}
