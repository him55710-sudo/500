import './story-ui.css';

export const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(path)=>`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true">${path}</svg>`;
const envelope=icon('<rect x="4" y="7" width="24" height="18" rx="2"/><path d="m5 9 11 9L27 9M5 24l8-8m14 8-8-8"/>');
const bookmark=icon('<path d="M9 4h14v24l-7-5-7 5V4Z"/><path d="M13 10h6m-6 5h6"/>');
const heart=icon('<path d="M16 26C9 21 4 17 4 11a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 6-5 10-12 15Z"/>');
export const hintTitles=['작은 실마리','한 걸음 더','마지막 단서'];

export function letterMarkup(){return `
 <div class="letter-layout">
  <article class="letter-paper keepsake-paper">
   <div class="letter-postmark"><span>PRIVATE CORRESPONDENCE<br><b>FROM. HYUNSU</b></span><span class="paper-stamp" aria-hidden="true">♡<small>500 DAYS</small></span></div>
   <p class="letter-salutation">정하영,,,,</p>
   <div class="letter-lines"><p>너는 우리의 <strong>500</strong>일 기념일을 까먹었지…<br>어떻게 네가 나한테 그럴 수가 있어.<br>너는 나를 버린 거야….</p><p>네가 좋아하던 <strong>오로나민 C</strong>도<br>이제 절대 안 먹을 거야….<br>오늘을 기점으로 나는 <strong>다른 거</strong> 마실 거야.</p><p class="letter-last-word">됐어!</p></div>
   <span class="signature"><small>아주 많이 삐친,</small>현수가.</span><span class="paper-fold" aria-hidden="true"></span>
  </article>
  <aside class="letter-margin">
   <div class="margin-icon">${envelope}</div><span class="story-label">BETWEEN THE LINES</span><h3>투덜거리는 말 사이에,<br>작은 단서가 있어.</h3><p>서두르지 말고 한 줄씩 읽어 봐.<br>현수가 굳이 적어 둔 말에는<br>이유가 있을지도 몰라.</p>
   <div class="letter-next"><span class="story-label">읽고 나서</span><p>책상 위 상자를 살펴보자.<br>일곱 자리 영어·숫자 자물쇠가<br>잠겨 있어.</p></div>
   <p class="letter-keep">${bookmark}<span>편지는 책상에서<br>언제든 다시 읽을 수 있어.</span></p>
  </aside>
 </div>
 <div class="story-bottom"><span>인터넷 사용 가능 · 힌트는 현수에게</span><div class="story-actions"><button id="letter-help" class="secondary">조금 막혔어</button><button id="letter-close" class="primary">편지 접어 두기 <span aria-hidden="true">↗</span></button></div></div>`;}

export function hintMarkup(stage,objective,revealed=0){
 const question=`현수야, 「${objective}」에서 막혔어. 정답 말고 힌트 하나만 줄 수 있어?`;
 return `<p class="story-intro">혼자 오래 고민하지 않아도 괜찮아.<br>우리 둘이 만든 기억이니까, 도움도 같이 나눠 갖자.</p>
 <div class="hint-contact native-help"><div class="sender-mark" aria-hidden="true">h<span>♡</span></div><div class="hint-contact-copy"><span class="story-label">YOUR ONE & ONLY HELPLINE</span><h3>현수에게 물어보기</h3><p>질문을 복사해서 카톡으로 보내거나 전화해 줘.<br>인터넷에서 찾아봐도 괜찮아.</p></div><span class="contact-caption">FROM H.<br>WITH LOVE.</span></div>
 <div class="hint-message"><label for="hint-question"><span class="story-label">지금 우리가 풀고 있는 기억</span><b>${String(Math.min(stage+1,8)).padStart(2,'0')} <span>/</span> ${escapeText(objective)}</b></label><textarea id="hint-question" rows="2" readonly aria-label="현수에게 보낼 질문">${escapeText(question)}</textarea><div class="hint-copy-row"><span id="copy-status" role="status" aria-live="polite">내 말투로 바꿔 보내도 좋아.</span><button id="copy-hint" class="secondary">질문 복사 <span aria-hidden="true">↗</span></button></div></div>
 <details class="spoiler hint-envelope" ${revealed?'open':''}><summary><span class="hint-envelope-icon">${envelope}</span><span><b>현수의 답장이 늦는다면</b><small>게임 속 보조 힌트를 한 장씩 열어 보기</small></span><span class="disclosure-mark" aria-hidden="true">+</span></summary><div class="hint-envelope-body"><p class="hint-warning">첫 카드는 작은 실마리, 마지막 카드는 정답에 가까워.<br>필요한 만큼만 펼쳐 봐.</p><ol class="hint-steps" aria-label="힌트 공개 단계">${hintTitles.map((name,i)=>`<li data-hint-step="${i}"><span>${String(i+1).padStart(2,'0')}</span>${name}</li>`).join('')}</ol><div id="hint-text" class="hint-cards" aria-live="polite" aria-relevant="additions"></div><button id="next-hint" class="primary">첫 단서 펼치기 <span aria-hidden="true">↗</span></button><p id="hint-progress" class="hint-progress"></p></div></details>
 <div class="story-bottom"><span>잠깐 쉬어 가도 괜찮아. 시간 제한은 없어.</span><button id="hint-close" class="secondary">다시 생각해 볼게 <span aria-hidden="true">↗</span></button></div>`;
}

export function hintCardMarkup(index,text){return `<article class="hint-card" data-hint-card="${index}"><div><span class="hint-card-number">0${index+1}</span><h3>${hintTitles[index]}</h3>${index===2?'<small>정답에 가까운 힌트</small>':''}</div><p>${escapeText(text)}</p></article>`;}

export function journalMarkup(entries){return `<div class="journal-cover"><span class="journal-emblem">${heart}</span><div><span class="story-label">LITTLE MOMENTS, KEPT FOREVER</span><p>함께 떠올린 순간은<br>여기에 한 장씩 남겨 둘게.</p></div><span class="journal-count"><b>${entries.length}</b><small>/ 8개의 기억</small></span></div><div class="journal-progress" aria-label="8개 중 ${entries.length}개 기억 완료">${Array.from({length:8},(_,i)=>`<span class="${i<entries.length?'remembered':''}">${String(i+1).padStart(2,'0')}</span>`).join('')}</div>${entries.length?`<ol class="journal-list memory-pages">${entries.map((note,i)=>`<li><span class="memory-page-number">${String(i+1).padStart(2,'0')}</span><div><small>되찾은 기억</small><p>${escapeText(note)}</p></div><span class="memory-check" aria-label="완료">✓</span></li>`).join('')}</ol>`:`<div class="journal-empty">${envelope}<h3>아직 비어 있는 첫 페이지.</h3><p>책상 위 편지부터 펼쳐 봐.<br>하나씩 풀다 보면, 이곳이 우리 이야기로 채워질 거야.</p></div>`}<div class="story-bottom"><span>풀어낸 기억은 이 브라우저에 자동으로 남겨 둘게.</span><button id="journal-close" class="secondary">기억 속으로 돌아가기 <span aria-hidden="true">↗</span></button></div>`;}
