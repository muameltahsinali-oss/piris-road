// Real-time browser verification of the motion layer.
// Usage: node verify.js <baseUrl> <outDir>
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.argv[3] || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--hide-scrollbars', '--no-first-run', '--disable-extensions'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text().slice(0, 200));
  });

  // ---------------- 1. Home intro timeline ----------------
  await page.evaluateOnNewDocument(() => {
    window.__t0 = performance.now();
    window.__samples = [];
    const sample = () => {
      const q = (s) => document.querySelector(s);
      const pre = q('.preloader-root');
      const chars = [...document.querySelectorAll('h1 .split-char')];
      const mid = chars[Math.floor(chars.length / 2)];
      const card = q('.hero-cta-blobs');
      const liquid = q('[data-tilt]');
      const brand = [...document.querySelectorAll('section .split-char')].find((c) => c.closest('[class*="writing-mode"]'));
      window.__samples.push({
        t: Math.round(performance.now() - window.__t0),
        preloader: pre ? getComputedStyle(pre).opacity : 'removed',
        h1Chars: chars.length,
        midCharOpacity: mid ? (+getComputedStyle(mid).opacity).toFixed(2) : null,
        midCharTransform: mid ? getComputedStyle(mid).transform.slice(0, 38) : null,
        card: card ? card.className.includes('wow-in') + ' op=' + (+getComputedStyle(card).opacity).toFixed(2) : null,
        liquidFilter: liquid ? liquid.style.filter || 'none' : null,
        brandCharOpacity: brand ? (+getComputedStyle(brand).opacity).toFixed(2) : null,
      });
    };
    const iv = setInterval(sample, 250);
    setTimeout(() => clearInterval(iv), 6000);
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, 'intro_0400.png') });
  await sleep(1100);
  await page.screenshot({ path: path.join(OUT, 'intro_1500.png') });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, 'intro_3000.png') });
  await sleep(3200);
  const samples = await page.evaluate(() => window.__samples);
  console.log('\n=== HERO INTRO TIMELINE (every 500ms) ===');
  samples.filter((_, i) => i % 2 === 0).forEach((s) => console.log(JSON.stringify(s)));

  // Mouse over hero: tilt + particles
  await page.mouse.move(1100, 450);
  await sleep(60);
  await page.mouse.move(1180, 420, { steps: 8 });
  await sleep(120);
  const heroFx = await page.evaluate(() => {
    const tilt = document.querySelector('[data-tilt]');
    const canvas = document.querySelector('section canvas');
    let painted = 0;
    if (canvas) {
      const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 0) painted++;
    }
    return { tiltTransform: tilt?.style.transform, particlePixelsSampled: painted };
  });
  console.log('\n=== HERO POINTER FX ===', JSON.stringify(heroFx));
  await page.screenshot({ path: path.join(OUT, 'hero_pointer.png') });

  // Magnetic button
  const btn = await page.$('a[href="/contact"]');
  if (btn) {
    const b = await btn.boundingBox();
    await page.mouse.move(b.x + b.width * 0.9, b.y + b.height * 0.9, { steps: 5 });
    await sleep(500);
    const mag = await page.evaluate(() => {
      const a = document.querySelector('a[href="/contact"]');
      const wrap = a.parentElement;
      return { wrapperTransform: getComputedStyle(wrap).transform, splitChars: a.querySelectorAll('div,span').length };
    });
    console.log('=== MAGNETIC BUTTON ===', JSON.stringify(mag));
  }

  // ---------------- 2. Scroll through home ----------------
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('\n=== SCROLL PASS === document height', docH);
  const probes = [];
  const shots = [];
  for (let y = 0; y < docH; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(650);
    const m = await page.evaluate(() => {
      const wowAll = document.querySelectorAll('.wow').length;
      const wowIn = document.querySelectorAll('.wow.wow-in').length;
      const cards = [...document.querySelectorAll('[data-scene="card"]')].map((c) => {
        const tr = getComputedStyle(c).transform;
        const m = tr.match(/matrix\(([^)]+)\)/);
        return m ? Math.round(+m[1].split(',')[4]) : 0;
      });
      const pinSpacers = document.querySelectorAll('.pin-spacer').length;
      const pinned = [...document.querySelectorAll('[data-scene="pin"]')].map((p) => getComputedStyle(p).position + '@' + Math.round(p.getBoundingClientRect().top));
      const big = document.querySelector('[data-scene="big-title"]');
      const hand = document.querySelector('[data-scene="hand-1"]');
      const cloud = document.querySelector('[data-scene="cloud-1"]');
      const odo = [...document.querySelectorAll('[aria-label="50"],[aria-label="350"],[aria-label="5"]')].map((o) => o.getAttribute('aria-label') + ':' + (o.querySelector('span > span[style]')?.style.transform || ''));
      return {
        scrollY: Math.round(window.scrollY),
        wow: wowIn + '/' + wowAll,
        processCardsX: cards.join(','),
        pinSpacers,
        pin: pinned.join(' '),
        bigTitle: big ? getComputedStyle(big).transform.slice(0, 30) : '',
        hand1: hand ? getComputedStyle(hand).transform.slice(0, 40) : '',
        cloud1: cloud ? getComputedStyle(cloud).transform.slice(0, 40) : '',
        odometers: odo.join(' '),
      };
    });
    probes.push(m);
    if (y % 2100 === 0) {
      const f = path.join(OUT, `scroll_${String(y).padStart(5, '0')}.png`);
      await page.screenshot({ path: f });
      shots.push(f);
    }
  }
  probes.forEach((p) => console.log(JSON.stringify(p)));

  // ---------------- 3. Arabic page: no splitting, no errors ----------------
  await page.goto(BASE + '/ar', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(2500);
  const ar = await page.evaluate(() => ({
    dir: document.documentElement.dir,
    splitChars: document.querySelectorAll('.split-char').length,
    hiddenSplit: [...document.querySelectorAll('.split-pending')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
    h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' '),
  }));
  console.log('\n=== ARABIC ===', JSON.stringify(ar));
  await page.screenshot({ path: path.join(OUT, 'ar_hero.png') });

  // ---------------- 4. About: testimonials + timeline ----------------
  await page.goto(BASE + '/about', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(2000);
  const aboutH = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < aboutH; y += 900) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(500);
  }
  const about = await page.evaluate(() => ({
    wow: document.querySelectorAll('.wow.wow-in').length + '/' + document.querySelectorAll('.wow').length,
    splitDone: document.querySelectorAll('.split-char').length,
  }));
  console.log('\n=== ABOUT ===', JSON.stringify(about));

  // ---------------- 5. Mobile width: no horizontal overflow, pins off ----------------
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(2500);
  const mobile = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    pinSpacers: document.querySelectorAll('.pin-spacer').length,
  }));
  console.log('\n=== MOBILE 390px ===', JSON.stringify(mobile));
  await page.screenshot({ path: path.join(OUT, 'mobile_hero.png') });

  console.log('\n=== CONSOLE ERRORS/WARNINGS (' + errors.length + ') ===');
  [...new Set(errors)].slice(0, 25).forEach((e) => console.log(' -', e));
  await browser.close();
})().catch((e) => {
  console.error('FAILED', e);
  process.exit(1);
});
