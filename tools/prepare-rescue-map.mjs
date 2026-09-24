import fs from 'node:fs/promises';
import {inRing} from '../src/rescue-map.js';
const dir='public/assets/rescue',countries=JSON.parse(await fs.readFile(dir+'/countries.geojson')),states=JSON.parse(await fs.readFile(dir+'/states.geojson'));
const texas=states.features.find(f=>f.properties.name==='Texas');if(!texas)throw Error('Missing Texas boundary');
const us=states.features.filter(f=>f.properties.admin==='United States of America'&&f.properties.type==='State');
if(us.length!==50)throw Error('The US atlas must contain exactly 50 states');
const regions=countries.features.filter(f=>f.properties.ADMIN!=='Antarctica').map(f=>({name:f.properties.ADMIN,geometry:f.geometry}));regions.unshift(...us.map(f=>({name:f.properties.name,geometry:f.geometry})));
await fs.writeFile(dir+'/regions.json',JSON.stringify(regions));
const project=([lon,lat])=>[(lon+180)*4,(90-lat)*4];const path=g=>(g.type==='Polygon'?[g.coordinates]:g.coordinates).map(poly=>poly.map(ring=>ring.map((p,i)=>(i?'L':'M')+project(p).map(v=>v.toFixed(1)).join(',')).join('')+'Z').join('')).join('');
const grid=Array.from({length:13},(_,i)=>`<path d="M${i*120},0V720"/>`).join('')+Array.from({length:7},(_,i)=>`<path d="M0,${i*120}H1440"/>`).join('');
const labels=[['NORTH AMERICA',-110,48],['SOUTH AMERICA',-62,-37],['EUROPE',18,57],['AFRICA',18,8],['ASIA',94,47],['AUSTRALIA',134,-29],['PACIFIC OCEAN',-150,-8],['ATLANTIC OCEAN',-28,15],['INDIAN OCEAN',78,-25]];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="720" viewBox="0 0 1440 720"><rect width="1440" height="720" fill="#dce7e7"/><g stroke="#b6cdcd" stroke-width=".5">${grid}</g><g fill="#f2ead8" stroke="#7f9186" stroke-width="1.2">${regions.slice(1).map(f=>`<path d="${path(f.geometry)}"/>`).join('')}</g><g fill="none" stroke="#9b9c88" stroke-width=".7">${states.features.filter(f=>f.properties.admin==='United States of America').map(f=>`<path d="${path(f.geometry)}"/>`).join('')}</g><g font-family="Georgia,serif" font-size="13" letter-spacing="3" fill="#667d7b" text-anchor="middle">${labels.map(([n,x,y])=>`<text x="${project([x,y])[0]}" y="${project([x,y])[1]}">${n}</text>`).join('')}</g></svg>`;
await fs.writeFile(dir+'/world-map.svg',svg);console.log('Natural Earth map and precise Texas/Brazil hit areas saved.');

// A separate, readable atlas: lower 48 plus geographically independent AK/HI insets.
// Screen positions are never converted to global longitude across these insets.
const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const mainland=([lon,lat])=>[45+(lon+125)*17,55+(50-lat)*24];
const alaska=([lon,lat])=>[55+((lon>0?lon-360:lon)+180)*6,760+(72-lat)*7];
const hawaii=([lon,lat])=>[485+(lon+161)*26,772+(23-lat)*26];
const callouts={VT:[1090,70],NH:[1230,120],MA:[1110,175],RI:[1230,230],CT:[1110,285],NJ:[1230,340],DE:[1110,395],MD:[1230,450],WV:[1110,505],VA:[1230,560],NC:[1110,615],SC:[1230,670]};
const offsets={MI:[8,-2],FL:[18,40],LA:[-4,20],KY:[5,7],TN:[-15,10],NY:[-3,-12],IA:[0,-6],IL:[-10,-8],IN:[10,17],OH:[-8,-22],MS:[-15,19],AL:[4,-18],GA:[16,15]};
function polygons(g){return g.type==='Polygon'?[g.coordinates]:g.coordinates;}
function contains(g,p){return polygons(g).some(r=>inRing(...p,r[0])&&!r.slice(1).some(h=>inRing(...p,h)));}
function insidePoint(f){
 const initial=[f.properties.longitude,f.properties.latitude];if(contains(f.geometry,initial))return initial;
 // Label centres may be offshore (Hawaii); find an actual land point for a selected pin.
 const rings=polygons(f.geometry).map(p=>p[0]);let best=null,bestDistance=Infinity;
 for(const ring of rings){const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys),dx=Math.max(...xs)-minX,dy=Math.max(...ys)-minY;if(dx>180)continue;
  for(let x=1;x<12;x++)for(let y=1;y<12;y++){const p=[minX+dx*x/12,minY+dy*y/12],d=Math.hypot(p[0]-initial[0],p[1]-initial[1]);if(d<bestDistance&&contains(f.geometry,p)){best=p;bestDistance=d;}}
 }if(!best)throw Error('No land point for '+f.properties.name);return best;
}
const records=us.map(f=>{const {name,name_ko:label,postal:code}=f.properties,project=code==='AK'?alaska:code==='HI'?hawaii:mainland,[lon,lat]=insidePoint(f),[x,y]=project([lon,lat]);return {name,label,code,lon,lat,x,y};});
await fs.writeFile('src/rescue-us-states.js','// Natural Earth Admin-1 metadata. Regenerate with tools/prepare-rescue-map.mjs.\nexport const usStates='+JSON.stringify(records,null,1)+';\n');
const captions=[];
const groups=us.map((f,i)=>{const r=records[i],project=r.code==='AK'?alaska:r.code==='HI'?hawaii:mainland;
 const d=polygons(f.geometry).map(poly=>poly.map(ring=>ring.map((p,j)=>(j?'L':'M')+project(p).map(v=>v.toFixed(1)).join(',')).join('')+'Z').join('')).join('');
 const [lx,ly]=callouts[r.code]||[r.x+(offsets[r.code]?.[0]||0),r.y+(offsets[r.code]?.[1]||0)];
 captions.push(`<g class="us-state us-state-caption" data-label-for="${r.code}" aria-hidden="true">${callouts[r.code]?`<path class="us-state-leader" d="M${r.x},${r.y}L${lx-25},${ly}"/><circle cx="${r.x}" cy="${r.y}" r="3" class="us-state-dot"/><rect class="us-state-label-hit" x="${lx-65}" y="${ly-20}" width="130" height="46" rx="8"/>`:''}<text class="us-state-label" x="${lx}" y="${ly}" text-anchor="middle"><tspan class="us-state-ko">${xml(r.label)}</tspan><tspan class="us-state-en" x="${lx}" dy="18">${xml(r.name)}</tspan></text></g>`);
 return `<g class="us-state" data-state="${r.code}" tabindex="0" role="button" aria-label="${xml(r.label+' · '+r.name)}"><title>${xml(r.label+' · '+r.name)}</title><path class="us-state-shape" d="${d}"/></g>`;
}).join('');
await fs.writeFile(dir+'/us-map.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" aria-label="미국 50개 주 상세 지도"><defs><style>.us-state-shape{fill:#f7f3e7;stroke:#82988a;stroke-width:1.3;fill-rule:evenodd}.us-state{cursor:pointer;outline:none}.us-state:hover .us-state-shape,.us-state:focus .us-state-shape{fill:#d0e5db;stroke:#245b48;stroke-width:2.5}.us-state-label{fill:#213c35;font-family:'Noto Sans KR','Malgun Gothic',sans-serif;paint-order:stroke;stroke:#f7f3e7;stroke-width:3px;stroke-linejoin:round}.us-state-ko{font-size:17px;font-weight:650}.us-state-en{font-size:12px;font-weight:500}.us-state-leader{fill:none;stroke:#738e82;stroke-width:1}.us-state-dot{fill:#496a5d}.us-state-label-hit{fill:#f7f3e7;stroke:#c5d2c7}.us-state:focus .us-state-label-hit,.us-state:hover .us-state-label-hit{stroke:#245b48;stroke-width:2.5}</style></defs><rect width="1440" height="960" fill="#e0edec"/><g fill="none" stroke="#afc4bc" stroke-dasharray="5 5"><rect x="32" y="738" width="402" height="202" rx="12"/><rect x="463" y="738" width="240" height="202" rx="12"/></g>${groups}${captions.join('')}<g fill="#526e64" font-family="'Malgun Gothic',sans-serif" font-size="16"><text x="748" y="810">미국 · 50개 주</text><text x="748" y="844">주 영역이나 이름을 눌러 선택한 핀을 놓으세요.</text><text x="748" y="885" font-size="13">알래스카·하와이는 별도 축척으로 표시합니다.</text><text x="748" y="910" font-size="12">지도 경계 · Natural Earth / Public Domain</text></g></svg>`);
console.log('50 bilingual state labels, keyboard targets and AK/HI insets saved.');
