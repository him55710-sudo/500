import {regionAt,regionLabel,usStates} from './rescue-map.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
export function openRescueMap(controller){
 const {regions,usMapSvg}=controller.world.rescueRuntime;
 controller.showModal('rescue-map','03 · TWO PLACES, ONE TABLE','어디로 먹으러 갈까?',`
  <p class="rescue-lead">핀을 고른 다음, 지도에서 장소를 찾아 눌러 줘. 미국은 상세 지도에서 50개 주 이름을 볼 수 있어.</p>
  <div class="rescue-map-tools"><div class="map-pin-tools"><button data-pin="blue" class="pin-tool blue">파란 핀 · 첫 번째</button><button data-pin="red" class="pin-tool red">빨간 핀 · 두 번째</button></div>
   <div class="map-view-tools" aria-label="지도 선택"><button id="map-world" data-map-view="world">세계지도</button><button id="map-zoom" data-map-view="us">미국 확대 · 50개 주</button></div></div>
  <div class="map-navigation"><span id="map-location" role="status">세계지도에서 장소를 찾아 줘.</span><div><button id="map-smaller" aria-label="지도 축소">−</button><output id="map-scale">100%</output><button id="map-larger" aria-label="지도 확대">＋</button><button id="map-reset">크기 초기화</button></div></div>
  <div class="rescue-map-scroll"><div id="rescue-map-surface" tabindex="0" role="group" aria-label="세계지도. 방향키로 이동하고 Enter로 핀 놓기"></div></div>
  <p id="map-help" class="rescue-map-help"></p>
  <div class="rescue-answer"><span id="map-blue">(　)</span><b>vs</b><span id="map-red">(　)</span></div>
  <div class="modal-actions"><button id="rescue-board" class="primary">이름판 완성해서 가져가기</button></div><p id="rescue-message" role="status"></p>`);
 const surface=$('#rescue-map-surface'),scroll=$('.rescue-map-scroll');
 let view='world',zoom=1,cursor={x:.5,y:.5},drag=null,dragged=false;
 const draw=()=>{
  const s=controller.getState();
  $('#map-pins').replaceChildren();
  for(const color of ['blue','red']){
   const p=s.pins[color];$('#map-'+color).textContent='( '+regionLabel(p?.region)+' )';if(!p)continue;
   const state=usStates.find(r=>r.name===p.region);if(view==='us'&&!state)continue;
   const pin=document.createElement('span');pin.className='map-pin '+color;pin.textContent='●';pin.setAttribute('aria-label',`${color==='blue'?'파란':'빨간'} 핀 · ${regionLabel(p.region)}`);
   pin.style.left=(view==='us'?state.x/1440*100:(p.lon+180)/3.6)+'%';pin.style.top=(view==='us'?state.y/960*100:(90-p.lat)/1.8)+'%';$('#map-pins').append(pin);
  }
  $$('[data-pin]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pin===controller.color));
 };
 const place=(lon,lat,region=regionAt(regions,lon,lat))=>{
  if(controller.getState().fed)return;
  if(controller.act({type:'pin',color:controller.color,lon,lat,region})){draw();$('#map-location').textContent=`${controller.color==='blue'?'파란':'빨간'} 핀 · ${regionLabel(region)}`;}
 };
 const resize=()=>{
  const width=(view==='us'?Math.max(scroll.clientWidth,1100):scroll.clientWidth)*zoom;
  surface.style.width=width+'px';$('#map-scale').textContent=Math.round(zoom*100)+'%';$('#map-smaller').disabled=zoom<=1;$('#map-larger').disabled=zoom>=2.5;
 };
 const render=()=>{
  surface.classList.toggle('us-detail',view==='us');surface.setAttribute('aria-label',view==='us'?'미국 50개 주 지도. Tab으로 주를 고르고 Enter로 핀 놓기':'세계지도. 방향키로 이동하고 Enter로 핀 놓기');
  surface.innerHTML=(view==='us'?usMapSvg:'<img src="/assets/rescue/world-map.svg" alt="국가와 미국 주 경계가 표시된 세계지도" draggable="false">')+'<span id="map-key-cursor" hidden>+</span><div id="map-pins"></div>';
  $$('[data-map-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mapView===view));
  $('#map-help').textContent=view==='us'?'주 영역 또는 이름을 클릭 · Tab / Enter로 선택 · 드래그와 스크롤로 이동 · ＋로 글씨 확대':'지도 클릭으로 핀 놓기 · 방향키 / Enter로 선택 · 미국은 「미국 확대 · 50개 주」에서 자세히 보기';
  $('#map-location').textContent=view==='us'?'미국 50개 주 · 한글 / 영문 이름':'세계지도에서 장소를 찾아 줘.';
  resize();scroll.scrollTo(0,0);draw();
 };
 const changeZoom=next=>{const x=(scroll.scrollLeft+scroll.clientWidth/2)/surface.clientWidth,y=(scroll.scrollTop+scroll.clientHeight/2)/surface.clientHeight;zoom=Math.max(1,Math.min(2.5,next));resize();scroll.scrollTo(x*surface.clientWidth-scroll.clientWidth/2,y*surface.clientHeight-scroll.clientHeight/2);};
 $$('[data-map-view]').forEach(b=>b.onclick=()=>{view=b.dataset.mapView;zoom=1;cursor={x:.5,y:.5};render();});
 $$('[data-pin]').forEach(b=>b.onclick=()=>{controller.color=b.dataset.pin;draw();});
 $('#map-smaller').onclick=()=>changeZoom(zoom-.25);$('#map-larger').onclick=()=>changeZoom(zoom+.25);$('#map-reset').onclick=()=>changeZoom(1);
 surface.onclick=e=>{
  if(dragged){dragged=false;return;}
  if(view==='us'){const target=e.target.closest('[data-state],[data-label-for]'),code=target?.dataset.state||target?.dataset.labelFor,s=usStates.find(s=>s.code===code);if(s)place(s.lon,s.lat,s.name);return;}
  const r=surface.getBoundingClientRect();cursor={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};place(cursor.x*360-180,90-cursor.y*180);
 };
 surface.onkeydown=e=>{
  const state=e.target.closest('[data-state]');
  if(view==='us'){if(state&&['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();const s=usStates.find(s=>s.code===state.dataset.state);place(s.lon,s.lat,s.name);}return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter'].includes(e.key))return;e.preventDefault();e.stopPropagation();
  if(e.key==='Enter')place(cursor.x*360-180,90-cursor.y*180);
  else{cursor.x=Math.max(0,Math.min(1,cursor.x+(e.key==='ArrowRight'?.005:e.key==='ArrowLeft'?-.005:0)));cursor.y=Math.max(0,Math.min(1,cursor.y+(e.key==='ArrowDown'?.005:e.key==='ArrowUp'?-.005:0)));const c=$('#map-key-cursor');c.hidden=false;c.style.left=cursor.x*100+'%';c.style.top=cursor.y*100+'%';c.scrollIntoView({block:'nearest',inline:'nearest'});}
 };
 surface.onpointerdown=e=>{if(e.button!==0||e.pointerType==='touch')return;dragged=false;drag={x:e.clientX,y:e.clientY,left:scroll.scrollLeft,top:scroll.scrollTop};};
 surface.onpointermove=e=>{
  if(!drag||!(e.buttons&1))return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)dragged=true;
  if(dragged){surface.setPointerCapture(e.pointerId);surface.classList.add('is-panning');scroll.scrollTo(drag.left-dx,drag.top-dy);}
 };
 surface.onpointerup=e=>{drag=null;surface.classList.remove('is-panning');if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);};
 surface.onpointercancel=()=>{drag=null;dragged=false;surface.classList.remove('is-panning');};
 $('#rescue-board').onclick=()=>{if(controller.act({type:'board'}))controller.closeModal();};
 render();
}
