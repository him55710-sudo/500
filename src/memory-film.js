import './memory-film.css';
import {filmPhotos, OPENING_MS, PHOTO_MS, CLOSING_MS} from './memory-film-data.js';
import {MemoryFilmAudio} from './memory-film-audio.js';

export function initMemoryFilm() {
  const root = document.createElement('main');
  root.id = 'memory-film';
  root.tabIndex = -1;
  root.setAttribute('aria-label', '우리의 500일, 하영에게 보내는 추억 필름');
  root.innerHTML = `
    <div class="film-ambient" aria-hidden="true"></div>
    <div class="film-grain" aria-hidden="true"></div>
    <header class="film-header">
      <a class="film-brand" href="${location.pathname}" aria-label="게임 첫 화면으로">500<span>우리의 오백 번째 페이지</span></a>
      <span class="film-dedication">FOR HAYOUNG, WITH LOVE</span>
      <button class="film-sound" type="button" aria-pressed="true">♫ <span>음악 켜짐</span></button>
    </header>
    <div class="film-stage"></div>
    <div class="film-loading" role="status" hidden>다음 기억을 꺼내는 중…</div>
    <p class="film-announcement" aria-live="polite" aria-atomic="true"></p>
    <footer class="film-footer">
      <div class="film-meta"><span class="film-chapter">A LITTLE FILM ABOUT US</span><span class="film-counter">27개의 기억 · 약 3분</span></div>
      <div class="film-controls" hidden>
        <button class="film-prev" type="button" aria-label="이전 장면">←</button>
        <button class="film-pause" type="button" aria-label="일시정지">Ⅱ</button>
        <button class="film-next" type="button" aria-label="다음 장면">→</button>
      </div>
      <span class="film-time">현수가, 하영에게</span>
      <progress class="film-progress" value="0" max="1" aria-label="추억 필름 재생 진행"></progress>
    </footer>`;
  document.body.append(root);
  document.body.classList.add('watching-memory-film');
  document.title = '우리의 500일 — 하영아 사랑해 ♥';

  const $ = selector => root.querySelector(selector);
  const stage = $('.film-stage');
  const audio = new MemoryFilmAudio();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  let index = -1, elapsed = 0, playing = false, begun = false, loading = false;
  let frame = 0, previousTime = 0, revision = 0, disposed = false;
  const total = OPENING_MS + filmPhotos.length * PHOTO_MS + CLOSING_MS;
  const duration = () => index < 0 ? OPENING_MS : index < filmPhotos.length ? PHOTO_MS : CLOSING_MS;
  const ending = () => index > filmPhotos.length;
  const timecode = ms => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

  function loadPhoto(photoIndex) {
    if (!filmPhotos[photoIndex]) return Promise.resolve(true);
    if (cache.has(photoIndex)) return cache.get(photoIndex);
    const pending = new Promise(resolve => {
      const image = new Image();
      const timeout = setTimeout(() => finish(false), 12000);
      function finish(ok) { clearTimeout(timeout); image.onload = image.onerror = null; resolve(ok); }
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = filmPhotos[photoIndex].src;
    });
    cache.set(photoIndex, pending);
    return pending;
  }

  function updateControls() {
    root.classList.toggle('film-paused', !playing || loading);
    root.classList.toggle('film-reduced-motion', motion.matches);
    $('.film-controls').hidden = !begun || ending();
    $('.film-prev').disabled = index < 0;
    $('.film-pause').textContent = playing ? 'Ⅱ' : '▷';
    $('.film-pause').setAttribute('aria-label', playing ? '일시정지' : '계속 재생');
    $('.film-sound').setAttribute('aria-pressed', String(audio.enabled));
    $('.film-sound span').textContent = audio.enabled ? '음악 켜짐' : '음악 꺼짐';
    $('.film-loading').hidden = !loading;
  }

  function setPlaying(value) {
    playing = value && !ending() && !disposed;
    if (playing && !loading) void audio.play().then(updateControls);
    else audio.pause();
    previousTime = 0;
    updateControls();
  }

  function updateProgress() {
    const time = ending() ? total : index < 0 ? elapsed : OPENING_MS + Math.min(index, filmPhotos.length) * PHOTO_MS + elapsed;
    $('.film-progress').value = Math.min(1, time / total);
    if (begun) $('.film-time').textContent = ending() ? 'TO BE CONTINUED, TOGETHER' : `${timecode(time)} / ${timecode(total)}`;
  }

  function swap(scene) {
    for (const old of [...stage.children]) {
      if (old.classList.contains('is-leaving')) old.remove();
      else { old.classList.add('is-leaving'); old.setAttribute('aria-hidden', 'true'); old.inert = true; setTimeout(() => old.remove(), 1400); }
    }
    stage.append(scene);
  }

  async function go(nextIndex) {
    const request = ++revision;
    index = Math.max(-1, Math.min(filmPhotos.length + 1, nextIndex));
    root.dataset.scene = index < 0 ? 'opening' : index < filmPhotos.length ? 'photo' : index === filmPhotos.length ? 'letter' : 'final';
    root.dataset.index = String(index);
    elapsed = 0; previousTime = 0;
    loading = index >= 0 && index < filmPhotos.length;
    if (loading) audio.pause();
    updateControls();
    const loaded = loading ? await loadPhoto(index) : true;
    if (request !== revision || disposed) return;
    loading = false; previousTime = 0;
    const scene = document.createElement('section');
    scene.className = 'film-scene';
    scene.style.setProperty('--scene-duration', `${duration() + 1400}ms`);
    if (index < 0) {
      scene.classList.add('film-opening');
      scene.innerHTML = `<span class="film-ghost-number" aria-hidden="true">500</span>
        <div class="film-title-card"><p class="film-eyebrow">현수가 하영에게 보내는 작은 영화</p>
        <h1>너와 함께한<br><em>오백 번의 하루.</em></h1>
        <span class="film-fine-line" aria-hidden="true"></span>
        <p class="film-intro-copy">수많은 순간을 지나, 오늘의 우리에게.<br>이제 가장 소중한 기억들을 꺼내 볼게.</p>
        <button class="film-start" type="button">우리의 500일 재생 <span aria-hidden="true">↗</span></button>
        <p class="film-intro-note">27장의 사진에 담은, 너에게 하고 싶은 말.</p></div>`;
      scene.querySelector('.film-start').hidden = begun;
      scene.querySelector('.film-start').onclick = () => {
        begun = true;
        scene.querySelector('.film-start').hidden = true;
        scene.querySelector('.film-intro-note').textContent = '우리의 이야기가 시작돼.';
        root.focus({preventScroll: true});
        setPlaying(true);
      };
      $('.film-chapter').textContent = 'A LITTLE FILM ABOUT US';
      $('.film-counter').textContent = '27개의 기억 · 약 3분';
    } else if (index < filmPhotos.length) {
      const photo = filmPhotos[index];
      scene.classList.add('film-photo-scene');
      scene.dataset.drift = String(index % 3);
      const background = document.createElement('img');
      background.className = 'film-photo-haze'; background.src = photo.src; background.alt = ''; background.setAttribute('aria-hidden', 'true');
      const figure = document.createElement('figure'); figure.className = 'film-photo-frame';
      const image = document.createElement('img'); image.className = 'film-photo'; image.src = photo.src; image.alt = photo.alt;
      figure.append(image);
      const copy = document.createElement('div'); copy.className = 'film-photo-copy';
      const label = document.createElement('span'); label.className = 'film-photo-title'; label.textContent = photo.title;
      const caption = document.createElement('p'); caption.textContent = photo.caption;
      copy.append(label, caption);
      scene.append(background, figure, copy);
      if (!loaded) {
        image.hidden = true; background.hidden = true;
        const error = document.createElement('div'); error.className = 'film-photo-error';
        error.innerHTML = '<p>사진을 불러오지 못했어요.</p><button type="button">이 사진 다시 불러오기</button>';
        error.querySelector('button').onclick = () => { cache.delete(index); void go(index); };
        figure.append(error); setPlaying(false);
      }
      $('.film-chapter').textContent = photo.chapter;
      $('.film-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${filmPhotos.length}`;
      $('.film-announcement').textContent = `${index + 1}번째 기억. ${photo.caption.replace('\n', ' ')}`;
      void loadPhoto(index + 1); void loadPhoto(index + 2);
    } else if (index === filmPhotos.length) {
      scene.classList.add('film-letter');
      scene.innerHTML = `<div class="film-title-card"><p class="film-eyebrow">500 DAYS, AND ALL THE DAYS TO COME</p>
        <h2>함께한 500일보다<br><em>함께할 날들이 더 많기를.</em></h2>
        <span class="film-fine-line" aria-hidden="true"></span>
        <p class="film-intro-copy">이 이야기의 마지막에<br>가장 하고 싶었던 말.</p></div>`;
      $('.film-chapter').textContent = '우리의 다음 페이지';
      $('.film-announcement').textContent = '함께한 500일보다 함께할 날들이 더 많기를. 이 이야기의 마지막에 가장 하고 싶었던 말.';
    } else {
      scene.classList.add('film-final');
      scene.innerHTML = `<div class="film-final-halo" aria-hidden="true"></div><div class="film-title-card">
        <p class="film-eyebrow">MY FAVORITE PART OF EVERY DAY IS YOU</p>
        <svg class="film-heart" viewBox="0 0 120 110" aria-hidden="true"><path pathLength="1" d="M60 96C52 89 10 63 10 34C10 8 45 1 60 27C75 1 110 8 110 34C110 63 68 89 60 96Z"/></svg>
        <h2 class="film-love">하영아 사랑해 <span class="film-sr-only">♥</span></h2>
        <p class="film-final-copy">나의 500일이 되어 줘서 고마워.<br>우리의 다음 페이지도, 함께.</p>
        <span class="film-signature">언제나 네 편, 현수가</span>
        <div class="film-final-actions"><button class="film-replay" type="button">처음부터 다시 보기 ↺</button><a href="${location.pathname}">첫 화면으로 ↗</a></div></div>`;
      scene.querySelector('.film-replay').onclick = () => { audio.reset(); void go(-1); setPlaying(true); root.focus({preventScroll: true}); };
      $('.film-chapter').textContent = '500일, 그리고 앞으로도';
      $('.film-announcement').textContent = '하영아 사랑해 ♥ 나의 500일이 되어 줘서 고마워. 우리의 다음 페이지도, 함께.';
      playing = false;
      // Let the last notes resolve, then release the audio device.
      setTimeout(() => { if (ending() && !disposed) audio.pause(); }, 4500);
    }
    swap(scene);
    if (playing) void audio.play().then(updateControls);
    updateControls(); updateProgress();
  }

  function tick(now) {
    if (disposed) return;
    if (playing && !loading && !document.hidden) {
      if (previousTime) elapsed += Math.min(now - previousTime, 250);
      audio.update(); updateProgress();
      if (elapsed >= duration()) void go(index + 1);
    }
    previousTime = now;
    frame = requestAnimationFrame(tick);
  }

  $('.film-pause').onclick = () => setPlaying(!playing);
  $('.film-prev').onclick = () => { if (begun) void go(index - 1); };
  $('.film-next').onclick = () => { if (begun) void go(index + 1); };
  $('.film-sound').onclick = () => {
    audio.enabled = !audio.enabled;
    if (playing && !loading && audio.enabled) void audio.play().then(updateControls);
    else audio.pause();
    updateControls();
  };
  root.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); setPlaying(false); }
    if (!begun || ending() || event.repeat) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); void go(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); void go(index + 1); }
    if (event.code === 'Space' && !event.target.closest('button,a')) { event.preventDefault(); setPlaying(!playing); }
  });
  const onVisibility = () => { if (document.hidden) setPlaying(false); };
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', updateControls);
  function dispose() {
    disposed = true; revision++; cancelAnimationFrame(frame); audio.dispose();
    document.removeEventListener('visibilitychange', onVisibility);
    motion.removeEventListener('change', updateControls);
  }
  addEventListener('pagehide', event => { if (event.persisted) setPlaying(false); else dispose(); });
  void loadPhoto(0); void loadPhoto(1);
  void go(-1);
  frame = requestAnimationFrame(tick);
  root.focus({preventScroll: true});
  return {dispose};
}
