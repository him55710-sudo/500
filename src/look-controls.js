// Match a CSS pixel of motion to the projected view at the screen centre.
// Render resolution, devicePixelRatio and frame duration must not change the gain.
export function lookRadiansPerPixel(fov,height,sensitivity=1){
 return 2*Math.tan(fov*Math.PI/360)/Math.max(1,height)*sensitivity;
}

// A released cursor never steers the camera. Locked motion has no screen edge.
export function createLookControls(canvas,{canLook,rotate,onDrag=()=>{}}){
 let pointer=null,lastX=0,lastY=0,cursorReleased=false;
 const locked=()=>document.pointerLockElement===canvas;
 function cancel(){
  const id=pointer;pointer=null;
  if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  canvas.classList.remove('is-looking');onDrag(false);
 }
 function down(e){
  if(e.button!==2||!canLook()||locked())return;
  e.preventDefault();pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;
  canvas.setPointerCapture(pointer);canvas.classList.add('is-looking');onDrag(true);
 }
 function move(e){
  if(locked())return;
  if(!canLook()){cancel();return;}
  if(pointer===null)return;
  if(e.pointerId!==pointer)return;
  if(!(e.buttons&2)){cancel();return;}
  // No interpolation or queued deltas: the next rendered frame uses this angle.
  const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
  rotate(dx,dy);
 }
 function lockedMove(e){if(locked()&&canLook())rotate(e.movementX,e.movementY);}
 function lockChanged(){if(locked())cursorReleased=false;cancel();}
 function release(e){if(e.pointerId===pointer&&!(e.buttons&2))cancel();}
 function visibility(){if(document.hidden)cancel();}
 canvas.addEventListener('pointerdown',down);
 canvas.addEventListener('pointermove',move);
 canvas.addEventListener('pointerup',release);
 canvas.addEventListener('pointercancel',cancel);
 canvas.addEventListener('lostpointercapture',cancel);
 document.addEventListener('mousemove',lockedMove);
 document.addEventListener('pointerlockchange',lockChanged);
 document.addEventListener('visibilitychange',visibility);
 window.addEventListener('blur',cancel);
 return {cancel,releaseCursor(){cursorReleased=true;cancel();},resume(){cursorReleased=false;cancel();},
  get cursorReleased(){return cursorReleased;},get dragging(){return pointer!==null;},dispose(){
  cancel();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);
  canvas.removeEventListener('pointerup',release);canvas.removeEventListener('pointercancel',cancel);
  canvas.removeEventListener('lostpointercapture',cancel);document.removeEventListener('mousemove',lockedMove);
  document.removeEventListener('pointerlockchange',lockChanged);document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('blur',cancel);
 }};
}
