// Consume elapsed time in short collision steps: a slow frame must not slow walking.
export function movePlayer(position, mx, mz, yaw, seconds, speed, blocked) {
 const length=Math.hypot(mx,mz);if(!length)return {dx:0,dz:0};
 mx/=length;mz/=length;
 const elapsed=Math.max(0,Math.min(seconds,.25)),steps=Math.max(1,Math.ceil(elapsed/(1/60)));
 const dx=(mx*Math.cos(yaw)+mz*Math.sin(yaw))*elapsed*speed/steps;
 const dz=(-mx*Math.sin(yaw)+mz*Math.cos(yaw))*elapsed*speed/steps;
 for(let i=0;i<steps;i++){
  if(!blocked(position.x+dx,position.z))position.x+=dx;
  if(!blocked(position.x,position.z+dz))position.z+=dz;
 }
 return {dx,dz};
}
