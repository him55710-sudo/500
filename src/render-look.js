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
 'Dark walnut':{color:'#faf4ee',roughness:.43},
 'Walnut | fine satin':{color:'#faf4ee',roughness:.43},
 'Porcelain painted window':{color:'#f3efe3',roughness:.34},
 'Window recessed stone':{color:'#acbcb8',roughness:.68},
 'Raspberry silk velvet':{color:'#be2854',roughness:.74},
 'Pearl curtain lining':{color:'#eee6d3',roughness:.83},
 'Champagne textile braid':{color:'#c5a66c',roughness:.76,metalness:0},
 'Aubusson handwoven floral wool':{color:'#f5f5f5',roughness:1},
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

const rescue={
 'Ivory lime plaster':{color:'#f5f7f5',roughness:.85},
 'Hospital sage':{color:'#4da699',roughness:.8},
 'Cotton white':{color:'#fafafa',roughness:.94},
 'Walnut':{color:'#71462f',roughness:.5},
 'Brushed warm brass':{color:'#caa15b',metalness:.78,roughness:.32},
 'Brushed nickel':{color:'#bac7d0',metalness:.8,roughness:.35},
 'Paper cream':{color:'#fcfcf9',roughness:.88},
 'Winter blue glass':{color:'#73bfeb',roughness:.18},
 'Polo navy knit':{color:'#15375e',roughness:.9},
 'TOMBOY charcoal wool':{color:'#242933',roughness:.95},
};
const kitchen={
 'Porcelain white':{color:'#fafcfb',roughness:.32},
 'Warm ceramic':{color:'#e9eff0',roughness:.65},
 'Sage enamel':{color:'#208f82',roughness:.4},
 'Paprika glaze':{color:'#c73b26',roughness:.38},
 'Rose patisserie':{color:'#e3638f',roughness:.48},
 'Brushed steel':{color:'#bcc8d1',metalness:.86,roughness:.3},
 'Oak cabinet':{color:'#ae794a',roughness:.6},
 'Powder coated shelving':{color:'#eff4f5',roughness:.65},
 'Warm terrazzo':{color:'#e5e9e6',roughness:.84},
 'Shelf price strips':{color:'#1d4f54',roughness:.65},
};
const journey={
 ...rescue,
 'Warm ivory marble':{color:'#e7edf0',roughness:.28},
 'Chapel porcelain':{color:'#f6f8fc',roughness:.52},
 'First class midnight leather':{color:'#123557',roughness:.5},
 'Longge lacquer red':{color:'#bc182e',roughness:.3},
 'Scarlet velvet':{color:'#bd1233',roughness:.9},
 'Heaven blue':{color:'#66bdec',roughness:.8},
};
const rotunda={
 'Room II blush plaster':{color:'#e8c0d4',roughness:.8},
 'Room II pearl stone':{color:'#f5f8fb',roughness:.4},
 'Room II champagne brass':{color:'#c99d50',roughness:.28,metalness:.78},
 'Still rose water':{color:'#56b9d9',roughness:.16,metalness:.12},
};

export function polishRoomMaterials(root,room){
 const palette={salon,heaven,rescue,kitchen,journey,rotunda}[room]||{};
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
   const finish=palette[material.name.replace(/\.\d+$/,'')];if(!finish)continue;
   if(finish.color)material.color.set(finish.color);
   if(finish.roughness!==undefined)material.roughness=finish.roughness;
   if(finish.metalness!==undefined)material.metalness=finish.metalness;
  }
 });
}
