const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = process.argv[2];
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  });

  // 1. Reduced motion
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
  await sleep(1200);
  const rm = await page.evaluate(() => ({
    preloader: !!document.querySelector('.preloader-root'),
    hiddenWow: [...document.querySelectorAll('.wow')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
    hiddenSplit: [...document.querySelectorAll('.split-pending')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
    splitChars: document.querySelectorAll('.split-char').length,
    pinSpacers: document.querySelectorAll('.pin-spacer').length,
  }));
  console.log('reduced-motion', JSON.stringify(rm));

  // 2. Client-side navigation: home -> about -> home keeps scenes working
  const p2 = await browser.newPage();
  p2.on('pageerror', (e) => errs.push('nav: ' + e.message));
  await p2.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
  await sleep(4000);
  await p2.evaluate(() => document.querySelector('footer a[href="/about"]').click());
  await sleep(4000);
  const onAbout = await p2.evaluate(() => ({ path: location.pathname, scrollY: window.scrollY, wow: document.querySelectorAll('.wow').length, preloader: !!document.querySelector('.preloader-root') }));
  await p2.evaluate(() => document.querySelector('footer a[href="/"]').click());
  await sleep(4000);
  const top = await p2.evaluate(() => {
    const sec = document.querySelector('[data-scene="card"]').closest('section');
    return Math.round(sec.getBoundingClientRect().top + window.scrollY);
  });
  await p2.evaluate((y) => window.scrollTo(0, y + 900), top);
  await sleep(900);
  const back = await p2.evaluate(() => ({
    path: location.pathname,
    pinSpacers: document.querySelectorAll('.pin-spacer').length,
    cardLefts: [...document.querySelectorAll('[data-scene="card"]')].map((c) => Math.round(c.getBoundingClientRect().left)).join(','),
    h1Chars: document.querySelectorAll('h1 .split-char').length,
  }));
  console.log('after client nav: about', JSON.stringify(onAbout), 'home', JSON.stringify(back));
  console.log('errors', errs.length, errs.slice(0, 5));
  await browser.close();
})();
