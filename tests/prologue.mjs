import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = process.env.GAME_BASE_URL || 'http://127.0.0.1:5179/';
const origin = new URL(baseURL).origin;
await fs.mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
// Other game assets can be edited in parallel; HMR must not restart a playthrough.
await page.routeWebSocket('**', socket => socket.close());
const errors = [], assets = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (/\.glb(?:\?|$)/.test(request.url())) assets.push(request.url()); });
page.on('response', response => { if (new URL(response.url()).origin === origin && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const chapter = async (id, progress = 0) => {
  await page.evaluate(({ id, progress }) => {
    const root = document.querySelector('#welcome'), section = document.getElementById(id);
    root.scrollTo({ top: section.offsetTop + Math.max(0, section.offsetHeight - root.clientHeight) * progress, behavior: 'instant' });
  }, { id, progress });
  await page.waitForFunction(({ id, progress }) => Math.abs(Number(document.getElementById(id).style.getPropertyValue('--p')) - progress) < .02, { id, progress });
};
const shot = name => page.screenshot({ path: `test-results/prologue-${name}.png` });
try {
  await page.goto(new URL('?e2e=1', baseURL).href, { waitUntil: 'networkidle' });
  await shot('desktop');
  assert.equal(await page.locator('[data-chapter]').count(), 5);
  await page.mouse.move(600, 450);
  await page.mouse.wheel(0, 390);
  await page.waitForFunction(() => Number(document.querySelector('#story-forgotten').style.getPropertyValue('--p')) > .2);
  const animated = await page.locator('.calendar').evaluate(el => getComputedStyle(el).transform);
  await chapter('story-forgotten');
  assert.notEqual(await page.locator('.calendar').evaluate(el => getComputedStyle(el).transform), animated);
  console.log('PASS: real mouse wheel animates calendar; scrolling back rewinds');

  for (const id of ['story-trip', 'story-door', 'story-letter']) {
    await chapter(id, .9);
    await shot(id.replace('story-', ''));
    assert.equal(await page.locator('.story-index a[aria-current]').getAttribute('href'), `#${id}`);
  }
  await chapter('story-door', 0);
  const openDoor = await page.locator('.door-slab').evaluate(el => getComputedStyle(el).transform);
  await chapter('story-door', 1);
  assert.notEqual(await page.locator('.door-slab').evaluate(el => getComputedStyle(el).transform), openDoor);
  assert.equal(await page.locator('.lock-sound').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
  assert.equal(await page.locator('#welcome').getAttribute('data-tone'), 'night');
  console.log('PASS: journey, closing door, letter, chapter navigation and dark theme');
  assert.deepEqual(assets, [], 'The intro must not load a 3D room');

  await page.locator('#story-motion').click();
  assert.equal(await page.locator('#story-motion').getAttribute('aria-pressed'), 'true');
  await page.locator('.story-skip').click();
  await page.locator('#start').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.activeElement.id), 'story-begin');
  await shot('begin');
  await page.locator('#intro-settings').click();
  await page.locator('#settings-done').click();
  await page.locator('.story-replay').click();
  assert.equal(await page.evaluate(() => document.querySelector('#welcome').scrollTop), 0);
  console.log('PASS: motion toggle, skip, focus, settings and replay');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#story-motion').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.hero-spark').evaluate(el => getComputedStyle(el).animationName), 'none');
  console.log('PASS: system reduced-motion preference');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const size of [{ width: 390, height: 844 }, { width: 375, height: 667 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    for (const id of ['story-forgotten', 'story-trip', 'story-door', 'story-letter', 'story-begin']) {
      await chapter(id, id === 'story-begin' ? 0 : .85);
      const width = await page.locator('#welcome').evaluate(el => [el.scrollWidth, el.clientWidth]);
      assert.ok(width[0] <= width[1] + 1, `${id} horizontal overflow at ${size.width}`);
      const title = await page.locator(`#${id} h1, #${id} h2`).boundingBox();
      assert.ok(title.x >= 0 && title.x + title.width <= size.width + 1, `${id} clipped title`);
      if (size.width === 390) await shot(`mobile-${id.replace('story-', '')}`);
    }
  }
  console.log('PASS: portrait, small phone and landscape layouts have no horizontal overflow');

  await page.setViewportSize({ width: 1280, height: 800 });
  await chapter('story-begin');
  await page.locator('#start').click();
  await page.waitForFunction(() => window.__roomTest?.ready, null, { timeout: 120000 });
  await page.locator('#hud').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#welcome').evaluate(el => el.hidden), true);
  await page.evaluate(() => window.__roomTest.focus('letter'));
  await page.locator('#prompt').waitFor({ state: 'visible' });
  await page.keyboard.press('KeyE');
  await page.locator('.letter-paper').waitFor({ state: 'visible' });
  assert.deepEqual(errors, []);
  console.log('PASS: first memory opens, original letter puzzle remains playable, no runtime or asset errors');
} catch (error) {
  await shot('failure');
  console.error('Browser errors:', errors);
  throw error;
} finally {
  await browser.close();
}
