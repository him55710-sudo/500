import fs from 'node:fs/promises';
const dir='public/assets/rescue';
const url='https://img.danuri.io/catalog-image/906/742/049/25701d9e15254902a2fbe1ac68f417a5.jpg';const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Polo photo '+r.status);await fs.writeFile(dir+'/polo-navy.jpg',Buffer.from(await r.arrayBuffer()));
const clothes=JSON.parse(await fs.readFile(dir+'/garments-source.json'));
const replacement=await(await fetch('https://fakestoreapi.com/products/16')).json();const replacementImage=await fetch(replacement.image);await fs.writeFile(dir+'/garment-f16.jpg',Buffer.from(await replacementImage.arrayBuffer()));clothes[15]={id:'garment-f16',name:replacement.title,image:replacement.image,category:replacement.category,source:'https://fakestoreapi.com/products/16',photo:'/assets/rescue/garment-f16.jpg'};
const names=['블루 블랙 체크 셔츠','블랙 그래픽 티셔츠','레드 체크 셔츠','쇼트 슬리브 셔츠','그린 체크 셔츠','블루 튜닉','블루 & 퍼플 탑','소프트 그린 탑','걸 패턴 탑','그레이 튜닉','블랙 오프숄더 드레스','코르셋 레더 드레스','그레이 드레스','폴카 도트 드레스','새틴 퍼플 드레스','후드 레더 재킷','슬림 코튼 헨리','코튼 재킷','슬림 베이직 셔츠','퍼플 3-in-1 재킷'];
// Backpacks are not garments: replace the one non-clothing entry with the next clothing photograph.
for(let i=0;i<clothes.length;i++){clothes[i].name=names[i]||clothes[i].name;}
const catalog=[...clothes];catalog.splice(5,0,{id:'polo-navy',name:'POLO RALPH LAUREN · 남색 니트 집업',brand:'POLO RALPH LAUREN',detail:'풀 지퍼 코튼 스웨터 · 네이비',photo:'/assets/rescue/polo-navy.jpg',source:'https://prod.danawa.com/info/?pcode=49742906'});catalog.splice(15,0,{id:'tomboy-coat',name:'STUDIO TOMBOY · 싱글 오버사이즈 코트',brand:'STUDIO TOMBOY',detail:'패치 포켓 · 블랙 울 코트',photo:'/assets/rescue/tomboy-coat.jpg',source:'https://www.shinsegaev.com/goods/initDetailGoods.siv?goods_no=2308864546'});
await fs.writeFile(dir+'/catalog.json',JSON.stringify(catalog,null,2));console.log('22 garment catalog prepared.');
