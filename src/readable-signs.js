import * as THREE from 'three';

// Signs remain real scene geometry: walls still occlude them. An opaque backing
// and unlit text make them legible against furniture and under dim lighting.
export function readableSign(scene,{id,lines,position,width,height=width/4,rotation=0,color='#f7eedc',background='#202c2b',fontSize=58}){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(128,Math.round(1024*height/width));
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
 c.fillStyle=background;c.fillRect(0,0,W,H);c.strokeStyle=color;c.globalAlpha=.35;c.lineWidth=3;c.strokeRect(9,9,W-18,H-18);c.globalAlpha=1;
 c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';
 const lineHeight=(H-32)/lines.length;
 for(let i=0;i<lines.length;i++){
  let size=Math.min(fontSize,lineHeight*.7);c.font=`500 ${size}px "Noto Sans KR","Malgun Gothic",sans-serif`;
  if(c.measureText(lines[i]).width>W-64){size*= (W-64)/c.measureText(lines[i]).width;c.font=`500 ${size}px "Noto Sans KR","Malgun Gothic",sans-serif`;}
  c.fillText(lines[i],W/2,16+lineHeight*(i+.5));
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
 const material=new THREE.MeshBasicMaterial({map,toneMapped:false,side:THREE.FrontSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
 mesh.position.set(...position);mesh.rotation.y=rotation;mesh.name=id||'ReadableSign';mesh.userData.readableSign=true;mesh.userData.text=lines.join('\n');scene.add(mesh);return mesh;
}

export function hideModelSigns(model,predicate){model.traverse(o=>{if(o.isMesh&&predicate(o.name,o))o.visible=false;});}
