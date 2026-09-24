import * as THREE from 'three';
// Small reusable gas jets and steam points keep the effect light enough for the web game.
export class CookingEffects{
 constructor(scene,position=[0,0,0],radius=.46){
  this.root=new THREE.Group();this.root.position.set(...position);scene.add(this.root);this.heat='off';this.residual=0;this.time=0;this.radius=radius;
  const flameCanvas=document.createElement('canvas');flameCanvas.width=32;flameCanvas.height=128;const flameContext=flameCanvas.getContext('2d');const flameGlow=flameContext.createRadialGradient(16,86,1,16,86,58);flameGlow.addColorStop(0,'rgba(235,250,255,1)');flameGlow.addColorStop(.16,'rgba(124,219,255,.95)');flameGlow.addColorStop(.5,'rgba(24,121,255,.7)');flameGlow.addColorStop(1,'rgba(0,70,255,0)');flameContext.fillStyle=flameGlow;flameContext.beginPath();flameContext.moveTo(16,2);flameContext.bezierCurveTo(10,40,-4,88,6,119);flameContext.quadraticCurveTo(16,135,26,119);flameContext.bezierCurveTo(38,90,24,43,16,2);flameContext.fill();this.flameTexture=new THREE.CanvasTexture(flameCanvas);
  this.blue=new THREE.MeshBasicMaterial({map:this.flameTexture,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  this.core=new THREE.MeshBasicMaterial({map:this.flameTexture,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  this.flames=new THREE.InstancedMesh(new THREE.PlaneGeometry(.09,.19),this.blue,24);this.inner=new THREE.InstancedMesh(new THREE.PlaneGeometry(.07,.16),this.core,24);this.flames.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.inner.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.root.add(this.flames,this.inner);
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(32,32,1,32,32,31);gradient.addColorStop(0,'rgba(255,255,255,.6)');gradient.addColorStop(.45,'rgba(255,255,255,.2)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);this.texture=new THREE.CanvasTexture(c);
  this.positions=new Float32Array(15*3);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3));this.steam=new THREE.Points(geometry,new THREE.PointsMaterial({map:this.texture,size:.31,transparent:true,opacity:.3,depthWrite:false,color:'#fff4de'}));this.root.add(this.steam);
  this.flames.frustumCulled=this.inner.frustumCulled=this.steam.frustumCulled=false;
  this.light=new THREE.PointLight('#ffc066',0,2.4,2);this.light.position.y=.18;this.root.add(this.light);this.dummy=new THREE.Object3D();this.update(0);
 }
 setHeat(heat){this.heat=heat;if(heat!=='off')this.residual=1;}
 setSteam(amount){this.residual=Math.max(this.residual,amount);}
 update(dt){
  this.time+=dt;const on=this.heat!=='off',power=this.heat==='medium'?1:.5;this.flames.visible=this.inner.visible=on;this.light.intensity=on?.7*power*(.93+Math.sin(this.time*15)*.07):0;
  if(on)for(let i=0;i<24;i++){const a=i*Math.PI/12,flicker=.82+.18*Math.sin(this.time*19+i*2.13);this.dummy.position.set(Math.cos(a)*this.radius,.06*power,Math.sin(a)*this.radius);this.dummy.scale.set(1,flicker*power,1);this.dummy.rotation.set(0,-a,Math.sin(this.time*7+i)*.12);this.dummy.updateMatrix();this.flames.setMatrixAt(i,this.dummy.matrix);this.dummy.rotation.y+=Math.PI/2;this.dummy.updateMatrix();this.inner.setMatrixAt(i,this.dummy.matrix);}
  if(on){this.flames.instanceMatrix.needsUpdate=true;this.inner.instanceMatrix.needsUpdate=true;this.residual=1;}else this.residual=Math.max(0,this.residual-dt*.055);
  this.steam.visible=this.residual>.01;this.steam.material.opacity=.27*this.residual;
  for(let i=0;i<15;i++){const t=(this.time*.24+i/15)%1,a=i*2.4;this.positions[i*3]=Math.cos(a)*.23+Math.sin(this.time*1.2+i)*t*.12;this.positions[i*3+1]=.12+t*.9;this.positions[i*3+2]=Math.sin(a)*.23+Math.cos(this.time+i)*t*.12;}
  this.steam.geometry.attributes.position.needsUpdate=true;
 }
 dispose(){this.root.removeFromParent();this.root.traverse(o=>{o.geometry?.dispose();});this.blue.dispose();this.core.dispose();this.steam.material.dispose();this.texture.dispose();this.flameTexture.dispose();}
}
