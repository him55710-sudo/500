// Native scrolling makes every vignette reversible and keyboard accessible.
export function initPrologue() {
  const root = document.querySelector('#welcome');
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const links = [...root.querySelectorAll('.story-index a')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = root.querySelector('#story-motion');
  let paused = motion.matches, frame = 0, metrics = [], lastChapter = -1;
  const clamp = value => Math.max(0, Math.min(1, value));
  function measure() {
    metrics = chapters.map(chapter => ({ top: chapter.offsetTop, height: chapter.offsetHeight }));
    schedule();
  }
  function render() {
    frame = 0;
    if (root.hidden || document.hidden) return;
    const scroll = root.scrollTop, height = root.clientHeight;
    let current = 0;
    chapters.forEach((chapter, index) => {
      const { top, height: chapterHeight } = metrics[index];
      const progress = clamp((scroll - top) / Math.max(1, chapterHeight - height));
      chapter.classList.toggle('is-visible', scroll + height > top && scroll < top + chapterHeight);
      chapter.style.setProperty('--p', paused ? 1 : progress.toFixed(4));
      if (scroll >= top - height * 0.35) current = index;
    });
    root.style.setProperty('--story-progress', clamp(scroll / Math.max(1, root.scrollHeight - height)));
    if (lastChapter !== current) {
      lastChapter = current;
      root.dataset.tone = chapters[current].dataset.tone || 'paper';
      root.querySelector('.story-current').textContent = `0${current + 1}`;
      links.forEach((link, index) => {
        if (index === current) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    }
  }
  function schedule() {
    if (!frame && !root.hidden && !document.hidden) frame = requestAnimationFrame(render);
  }
  function setMotion(value) {
    paused = value;
    root.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '모션 켜기' : '모션 줄이기';
    schedule();
  }
  root.addEventListener('scroll', schedule, { passive: true });
  root.querySelectorAll('a[href^="#story-"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      root.scrollTo({ top: target.offsetTop, behavior: paused ? 'instant' : 'smooth' });
      target.focus({ preventScroll: true });
    });
  });
  toggle.addEventListener('click', () => setMotion(!paused));
  motion.addEventListener('change', event => setMotion(event.matches));
  document.addEventListener('visibilitychange', schedule);
  new ResizeObserver(measure).observe(root);
  new MutationObserver(() => {
    if (root.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      root.classList.add('story-suspended');
    } else {
      root.classList.remove('story-suspended');
      measure();
    }
  }).observe(root, { attributes: true, attributeFilter: ['hidden'] });
  setMotion(paused);
  measure();
}
