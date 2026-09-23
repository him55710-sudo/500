import './food-art.css';

export function cutCardMarkup(name,index){
 const label=String.fromCharCode(65+index);
 return `<button class="cut food-cut" data-cut="${name}" aria-label="${label} 부위 이름 덮개 열기"><span class="cut-photo cut-photo-${index}" role="img" aria-label="${label} 구역의 고기 사진"></span><span class="cut-cover"><b>${label}</b><span class="cut-name">부위 이름 열기</span><small class="cut-action">덮개를 눌러 확인</small></span></button>`;
}

export function revealCutCard(button,name){
 button.classList.add('revealed');button.querySelector('.cut-name').textContent=name;
 button.querySelector('.cut-action').textContent='한 번 더 눌러 고기 놓기';
 button.setAttribute('aria-label',name+' 부위에 고기 놓기');
 button.querySelector('.cut-photo').setAttribute('aria-label',name+'의 형태와 마블링 재현 이미지');
}

export function steakPhotoMarkup(id){
 return `<div class="steak-photo steak-photo-${id}" role="img" aria-label="${id==='hyunsu'?'가정식':'레스토랑 스타일'} 스테이크 재현 이미지"></div>`;
}
