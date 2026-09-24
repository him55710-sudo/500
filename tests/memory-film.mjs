import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {filmPhotos} from '../src/memory-film-data.js';

const base = process.env.FILM_TEST_URL || 'http://127.0.0.1:5179';
const browser = await chromium.launch({headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
const errors = [], checks = [], assets = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.url().includes('/assets/prologue/') && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
page.on('request', r => assets.push(r.url()));
const check = text => { checks.push(text); console.log(text); };
const active = () => page.locator('.film-scene:not(.is-leaving)');
const shot = name => page.screenshot({path: `test-results/memory-film-${name}.png`});
async function scene(index) {
  await page.waitForFunction(i => document.querySelector('#memory-film')?.dataset.index === String(i) && document.querySelector('.film-loading')?.hidden, index);
}
async function noOverlap() {
  assert.equal(await page.evaluate(() => {
    const photo = document.querySelector('.film-scene:not(.is-leaving) .film-photo-frame')?.getBoundingClientRect();
    const copy = document.querySelector('.film-scene:not(.is-leaving) .film-photo-copy')?.getBoundingClientRect();
    const footer = document.querySelector('.film-footer').getBoundingClientRect();
    return photo && copy && (photo.bottom > copy.top || copy.bottom > footer.top);
  }), false);
}
try {
  await page.goto(`${base}/?preview=prologue`);
  await page.locator('.film-start').waitFor();
  await page.waitForTimeout(1600); await shot('opening');
  assert.equal(await page.locator('#welcome').isVisible(), false);
  assert.equal(assets.some(url => url.endsWith('.glb')), false);
  await page.evaluate(() => localStorage.setItem('film-save-sentinel', 'preserved'));
  await page.locator('.film-start').click();
  await scene(0);
  await page.locator('.film-pause').click();
  const paused = await page.locator('.film-progress').getAttribute('value');
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.film-progress').getAttribute('value'), paused);
  assert.equal(await page.locator('.film-pause').getAttribute('aria-label'), '계속 재생');
  check('Opening automatically advances; pause freezes the playback clock');

  const seen = [];
  for (let index = 0; index < filmPhotos.length; index++) {
    await scene(index);
    const image = active().locator('.film-photo');
    await image.waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('.film-scene:not(.is-leaving) .film-photo');
      return image?.complete && image.naturalWidth > 0;
    });
    const src = await image.getAttribute('src');
    seen.push(src); assert.equal(src, filmPhotos[index].src);
    assert.equal(await active().locator('.film-photo-copy p').innerText(), filmPhotos[index].caption);
    if ([0, 3, 9, 20, 26].includes(index)) {
      await page.waitForTimeout(1450); await noOverlap(); await shot(`photo-${index + 1}`);
    }
    if (index === 3) {
      await page.locator('.film-prev').click(); await scene(2);
      await page.locator('.film-next').click(); await scene(3);
    }
    if (index < filmPhotos.length - 1) await page.locator('.film-next').click();
  }
  assert.equal(new Set(seen).size, 27);
  check('All 27 actual photos load in album order; every caption matches; previous/next work');

  for (const viewport of [{width: 390, height: 844}, {width: 360, height: 640}, {width: 844, height: 390}]) {
    await page.setViewportSize(viewport); await noOverlap();
    await shot(`photo-${viewport.width}x${viewport.height}`);
  }
  await page.setViewportSize({width: 1440, height: 1000});
  await page.locator('.film-pause').click();
  await scene(27); await scene(28); await page.waitForTimeout(4000);
  assert.match(await active().locator('h2').innerText(), /하영아 사랑해/);
  assert.equal(await active().locator('.film-heart').count(), 1);
  await shot('final-desktop');
  await page.waitForTimeout(1200); await scene(28);
  assert.equal(await page.locator('.film-controls').isVisible(), false);
  assert.equal(await page.locator('.film-progress').getAttribute('value'), '1');
  await page.setViewportSize({width: 390, height: 844}); await shot('final-mobile');
  check('The final photo plays fully, the closing letter advances, and the love message and heart remain');

  await page.locator('.film-replay').click(); await scene(-1);
  await page.locator('.film-next').click(); await scene(0);
  await page.locator('.film-pause').click();
  await page.emulateMedia({reducedMotion: 'reduce'});
  assert.equal(await active().locator('.film-photo').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.locator('.film-sound').click();
  assert.equal(await page.locator('.film-sound').getAttribute('aria-pressed'), 'false');
  await page.locator('.film-brand').click(); await page.locator('#welcome').waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('film-save-sentinel')), 'preserved');
  check('Replay, reduced motion, music toggle and return to the game preserve stored data');

  await page.route('**/memory-01.webp', route => route.fulfill({status: 200, body: 'invalid image', contentType: 'image/webp'}));
  await page.goto(`${base}/?preview=prologue`);
  await page.locator('.film-start').click(); await page.locator('.film-next').click(); await scene(0);
  await page.locator('.film-photo-error').waitFor();
  assert.equal(await page.locator('.film-pause').getAttribute('aria-label'), '계속 재생');
  await page.unroute('**/memory-01.webp');
  await page.locator('.film-photo-error button').click(); await scene(0);
  await page.waitForFunction(() => document.querySelector('.film-scene:not(.is-leaving) .film-photo')?.naturalWidth > 0);
  check('A failed image pauses instead of skipping a memory; retry recovers the photo');
  assert.deepEqual(errors, []);
  await fs.writeFile('test-results/memory-film-report.json', JSON.stringify({ok: true, checks, errors, photos: seen.length}, null, 2));
} catch (error) {
  await shot('failure');
  await fs.writeFile('test-results/memory-film-report.json', JSON.stringify({ok: false, checks, errors, error: error.stack}, null, 2));
  throw error;
} finally { await browser.close(); }
