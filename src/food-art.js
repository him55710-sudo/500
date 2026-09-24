import './food-art.css';
import photos from './beef-photos.json';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function beefPhotoCredits(){
 return `<details class="food-photo-credits"><summary>실제 사진 출처 · 라이선스</summary><ul>${photos.map((p,i)=>`<li>${String.fromCharCode(65+i)} · ${escape(p.author)} · <a href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">원본</a> · <a href="${escape(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(p.license)}</a></li>`).join('')}</ul></details>`;
}

export function cutCardMarkup(name,index){
 const label=String.fromCharCode(65+index);
 return `<button class="cut food-cut" data-cut="${name}" aria-label="${label} 부위 이름 덮개 열기"><img class="cut-photo" src="/assets/beef-photos/${photos[index].file}" alt="${label} 구역의 실제 고기 사진" width="960" height="720"><span class="cut-cover"><b>${label}</b><span class="cut-name">부위 이름 열기</span><small class="cut-action">덮개를 눌러 확인</small></span></button>`;
}

export function revealCutCard(button,name){
 button.classList.add('revealed');button.querySelector('.cut-name').textContent=name;
 button.querySelector('.cut-action').textContent='한 번 더 눌러 고기 놓기';
 button.setAttribute('aria-label',name+' 부위에 고기 놓기');
 button.querySelector('.cut-photo').alt=name+'의 실제 사진';
}

export function steakPhotoMarkup(id){
 return `<div class="steak-photo steak-photo-${id}" role="img" aria-label="${id==='hyunsu'?'가정식':'레스토랑 스타일'} 스테이크 재현 이미지"></div>`;
}
