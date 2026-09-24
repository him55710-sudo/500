import architecture from './kitchen-architecture.json' with {type:'json'};
export {architecture as kitchenArchitecture};
// Coordinates shared by navigation, interactions and the expanded Blender layout.
export const ROOM_RADIUS=22;
export const WALK_RADIUS=21.3;
export const stations={kimchi:[0,-16,0],pepero:[16,0,-Math.PI/2],chili:[0,16,Math.PI],chicken:[-16,0,Math.PI/2]};
export const kitchenWalls=Object.entries(stations).flatMap(([key,[cx,cz,a]])=>architecture.walls.map(wall=>{
 const [x,y,z]=wall.center,[w,h,d]=wall.size,east=Math.abs(Math.sin(a))>.5;
 return {name:`${key}-${wall.name}`,center:[cx+x*Math.cos(a)+z*Math.sin(a),y,cz-x*Math.sin(a)+z*Math.cos(a)],size:east?[d,h,w]:[w,h,d]};
}));
export const powerPosition=[8.6,2.1,17.8];
export const entryPosition=[8.6,0,14.95];
export const exitPosition=[-13.2,1.7,-16.2];
export const courierStart=[15,0,13],courierEnd=[10.6,0,8.7];
export const storeColliders=[...[-4.5,0,4.5].map(x=>[x-.68,x+.68,-4,4]),[-3.5,3.5,5.88,7.74],[-9.05,-7.35,-3.84,3.84],[7.35,9.05,-3.84,3.84],[-8.86,-6.14,5.65,7.75],[6,9,5.83,7.55],[6.2,11,17.72,17.92]];
export const marketTargets=[
 ['kitchen-market','과일·채소와 장보기', [0,1.3,8.05],[6.8,1.8,.5]],
 ['kitchen-market-dairy','우유·버터·디저트 냉장고',[6.95,1.6,0],[.5,2.8,7.6]],
 ['kitchen-market-seafood','생선·달걀 냉장 쇼케이스',[-6.95,1.6,0],[.5,2.8,7.6]],
 ['kitchen-market-seafood','새우 냉동 쇼케이스',[-7.5,1.3,8],[2.6,1.8,.5]],
 ['kitchen-market-pack','도시락·포장 용품',[-4.5,1.5,4.3],[1.35,2.4,.5]],
 ['kitchen-market-pantry','소스·향신료·조미료',[0,1.5,4.3],[1.35,2.4,.5]],
 ['kitchen-market-drinks','음료·간식',[4.5,1.5,4.3],[1.35,2.4,.5]],
 ...[-4.5,0,4.5].flatMap((x,i)=>[-1,1].map(side=>['kitchen-market-'+['bakery','pantry','drinks'][i],'편의점 양면 진열대',[x+side*.8,1.45,0],[.5,2.3,7.4]]))
];
