export const initialArrival = () => ({keyTaken:false,doorUnlocked:false});

export function loadArrival(raw){
 const keyTaken=raw?.keyTaken===true;
 return {keyTaken,doorUnlocked:keyTaken&&raw?.doorUnlocked===true};
}

export function arrivalTransition(current,type){
 const deny=message=>({state:current,ok:false,message});
 if(type==='take-key'){
  if(current.keyTaken)return deny('열쇠는 이미 챙겼어.');
  return {state:{...current,keyTaken:true},ok:true,message:'바닥에서 작은 황동 열쇠를 주웠다. 홀 반대편 문의 열쇠일까?'};
 }
 if(type==='unlock-door'){
  if(current.doorUnlocked)return deny('문은 열려 있어. 안으로 걸어 들어가 보자.');
  if(!current.keyTaken)return deny('문이 잠겨 있어. 내린 곳의 바닥에 무언가 반짝였던 것 같아.');
  return {state:{...current,doorUnlocked:true},ok:true,message:'철컥. 열쇠가 맞는다. 열린 문 안은 어둡다… 천천히 들어가 보자.'};
 }
 return deny('먼저 바닥과 문을 살펴보자.');
}

// The circular landing has one usable exit. The door leaf is checked in hinge-local space.
export function arrivalBlocked(x,z,doorAngle){
 const passage=Math.abs(x)<1.08&&z<-12.35&&z>-15.3;
 if(Math.hypot(x,z)>13.25&&!passage)return true;
 if(Math.hypot(x,z)<2.62)return true;
 if(passage&&z<-12.45&&doorAngle> -1.45)return true;
 const dx=x+1.27,dz=z+12.8,c=Math.cos(doorAngle),s=Math.sin(doorAngle);
 const localX=c*dx-s*dz,localZ=s*dx+c*dz;
 return localX>-.22&&localX<2.76&&Math.abs(localZ)<.32;
}
