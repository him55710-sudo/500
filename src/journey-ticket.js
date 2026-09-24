const plane='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M57 29 37 19V7c0-7-10-7-10 0v12L7 29v6l20-5v16l-8 6v5l13-3 13 3v-5l-8-6V30l20 5z" fill="currentColor"/></svg>';

export function ticketMarkup(s){
 const boarded=['plane','restaurant','threshold'].includes(s.zone),ready=s.served;
 const status=boarded?'탑승 완료':ready?'탑승 준비 완료':'탑승권 발급 완료';
 const next=boarded?'여행을 이어가세요':ready?'열린 탑승문으로 이동하세요':s.bowl?'승무원에게 한 그릇을 건네세요':s.zone==='church'?'탑승권의 좌석 번호를 찾아보세요':'2층으로 가는 작은 계단을 찾으세요';
 const copy=boarded?(s.arrived?'연태에 도착했어요. 현수와 다음 기억을 만나러 가요.':'기내 좌석은 자유롭게 선택할 수 있어요. 현수가 옆에 앉을 거예요.'):ready?'승무원 옆, FIRST CLASS 안내판 아래 문이 열렸어요. 문 안으로 걸어가면 기내로 이어져요.':s.bowl?'6B에서 찾은 육회비빔밥을 챙겼어요. 탑승문 앞에 기다리는 승무원에게 가져가 보세요.':'GATE와 SEAT에 다음 기억의 단서가 있어요. 탑승권은 화면 아래에서 언제든 다시 볼 수 있어요.';
 return `<div class="ticket-layout">
  <article class="memory-pass" aria-label="현수의 인천에서 연태로 가는 탑승권">
   <header class="ticket-brand"><div><span class="ticket-airline-icon">${plane}</span><span>OUR MEMORY<small>AIRLINES</small></span></div><b>FIRST CLASS</b></header>
   <div class="ticket-main"><div class="ticket-route"><div><small>FROM · 출발</small><strong>ICN</strong><span>인천 Incheon</span></div><div class="ticket-route-line"><span>${plane}</span><small>함께 떠나는 여행</small></div><div><small>TO · 도착</small><strong>YNT</strong><span>연태 Yantai</span></div></div>
    <dl class="ticket-person"><div><dt>PASSENGER · 승객</dt><dd>YIM HYUNSU</dd></div><div><dt>DATE · 출발일</dt><dd>16 MAY 2026</dd></div></dl>
    <div class="ticket-clues"><div><span>GATE <small>게이트</small></span><strong>2F</strong><p>위층으로 이어지는 단서</p></div><div><span>SEAT <small>좌석</small></span><strong>6B</strong><p>꼭 기억해 둘 좌석 번호</p></div></div>
   </div>
   <div class="ticket-tear" aria-hidden="true"><i></i><span></span><i></i></div>
   <footer class="ticket-stub"><div><b>HYUNSU × HAYOUNG</b><span>우리 둘의 중국 여행 · 301–400일</span></div><div class="ticket-code" aria-hidden="true"><div></div><small>ICN · YNT · 160526</small></div></footer>
  </article>
  <aside class="ticket-guide"><span class="ticket-status"><i></i>${status}</span><p class="ticket-guide-kicker">YOUR NEXT STEP</p><h3>${next}</h3><p>${copy}</p>
   <ol class="ticket-steps"><li class="done"><span>01</span><div><b>탑승권 받기</b><small>QR 인식 완료</small></div></li><li class="${s.zone!=='hell'||s.bowl||ready?'done':'current'}"><span>02</span><div><b>GATE 2F 찾기</b><small>탑승권이 가리키는 곳으로</small></div></li><li class="${s.bowl||ready?'done':s.zone==='church'?'current':''}"><span>03</span><div><b>SEAT 6B 살펴보기</b><small>좌석에 남은 기억 찾기</small></div></li><li class="${boarded?'done':s.bowl||ready?'current':''}"><span>04</span><div><b>비행기 탑승문으로</b><small>승무원의 안내를 따라 탑승</small></div></li></ol>
   ${s.seat?`<p class="ticket-chosen-seat">선택한 기내 좌석 <b>${s.seat}</b></p>`:''}
   <button id="journey-ticket-continue" class="primary">${boarded?'여행 계속하기':ready?'탑승문으로 가기':'탑승권 챙기고 계속하기'} <span aria-hidden="true">→</span></button><small class="ticket-save-note">자동 보관됨 · T를 눌러 언제든 다시 보기</small>
  </aside>
 </div>`;
}
