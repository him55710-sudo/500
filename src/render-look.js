// Colour and surface tuning stays separate from geometry and puzzle behaviour.
const salon={
 'Petrol painted plaster':{color:'#f7ecdf',roughness:.64},
 'Panel | midnight jade':{color:'#e8d5bd',roughness:.44},
 'Salon carved ivory':{color:'#fff5e6',roughness:.35},
 'Aged brass':{color:'#dcb878',metalness:.82,roughness:.24},
 'Brass edges':{color:'#edcf91',metalness:.76,roughness:.21},
 'Oxblood velvet':{color:'#75172b',roughness:.78},
 'Blue rain glass':{color:'#2e789a',metalness:.30,roughness:.15},
 'Ceramic cream':{color:'#fff7e8',roughness:.22},
 'Calacatta warm marble':{color:'#faf3e7',metalness:.05,roughness:.27},
 'Hand painted miniature':{roughness:.28},
 'Dark walnut':{color:'#c3b5a4',roughness:.43},
 'Walnut | fine satin':{color:'#d6c8b6',roughness:.43},
 'Porcelain painted window':{color:'#f3efe3',roughness:.34},
 'Window recessed stone':{color:'#acbcb8',roughness:.68},
 'Raspberry silk velvet':{color:'#b44460',roughness:.69},
 'Pearl curtain lining':{color:'#eee6d3',roughness:.83},
 'Champagne textile braid':{color:'#c5a66c',roughness:.76,metalness:0},
 'Aubusson handwoven floral wool':{color:'#aaa89f',roughness:1},
 'Frame red':{color:'#d52749',metalness:.18,roughness:.25},
 'Frame yellow':{color:'#edbd23',metalness:.18,roughness:.25},
 'Frame green':{color:'#219f69',metalness:.18,roughness:.25},
 'Frame blue':{color:'#2867cf',metalness:.18,roughness:.25},
 'Sage foliage':{color:'#498846',roughness:.60},
 'Letter paper':{color:'#fff5dc',roughness:.80},
 'Antique silver mirror':{color:'#bcc9d4',metalness:.93,roughness:.14},
};
const heaven={
 'Petal pink plaster':{color:'#f7cfdf',roughness:.64},
 'Blush velvet':{color:'#f79bbb',roughness:.69},
 'Ribbon rose':{color:'#e92375',metalness:.10,roughness:.27},
 'Rose quartz silk':{color:'#ed649b',metalness:.04,roughness:.28},
 'Lilac silk':{color:'#b58cde',metalness:.04,roughness:.32},
 'Champagne gold':{color:'#e7c17d',metalness:.82,roughness:.21},
 'Pearl porcelain':{color:'#fff7f5',metalness:.05,roughness:.22},
 'Pistachio porcelain':{color:'#80d5b5',metalness:.03,roughness:.28},
 'Rose leaves':{color:'#50906c',roughness:.61},
 'Cloud window daylight':{color:'#8fccff',roughness:.80},
 'Soft silver mirror':{color:'#d7edf4',metalness:.94,roughness:.11},
};

export function polishRoomMaterials(root,room){
 const palette=room==='heaven'?heaven:salon;
 const seen=new Set();
 root.traverse(object=>{
  if(!object.isMesh)return;
  if(room==='salon'&&object.name.startsWith('Architecture_Ivory_linen')&&!Array.isArray(object.material)){
   // The ceiling is painted plaster; retain linen textures on frames and props.
   object.material=object.material.clone();object.material.map=null;
   object.material.color.set('#f1e9db');object.material.roughness=.64;
  }
  for(const material of (Array.isArray(object.material)?object.material:[object.material])){
   // Shared materials must be treated once, not darkened once per mesh.
   if(seen.has(material))continue;seen.add(material);
   if(material.map)material.map.anisotropy=8;
   const finish=palette[material.name];if(!finish)continue;
   if(finish.color)material.color.set(finish.color);
   if(finish.roughness!==undefined)material.roughness=finish.roughness;
   if(finish.metalness!==undefined)material.metalness=finish.metalness;
  }
 });
}
