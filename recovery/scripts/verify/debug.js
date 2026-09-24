const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = process.argv[2];
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));

  await page.goto(BASE + '/about', { waitUntil: 'load', timeout: 120000 });
  for (const wait of [500, 2500, 5000]) {
    await sleep(wait === 500 ? 500 : 2000);
    const s = await page.evaluate(() => ({
      preloader: !!document.querySelector('.preloader-root'),
      pending: document.querySelectorAll('.split-pending').length,
      pendingHidden: [...document.querySelectorAll('.split-pending')].filter((e) => getComputedStyle(e).visibility === 'hidden').length,
      chars: document.querySelectorAll('.split-char').length,
      firstPendingText: document.querySelector('.split-pending')?.textContent.slice(0, 40),
      firstPendingHTML: document.querySelector('.split-pending')?.innerHTML.slice(0, 120),
    }));
    console.log('about @', wait, JSON.stringify(s));
  }

  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
  await sleep(4500);
  const target = await page.evaluateHandle(() => document.querySelector('.hero-cta-blobs a[href="/contact"]'));
  const box = await target.asElement().boundingBox();
  console.log('hero button box', box);
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3, { steps: 6 });
  await sleep(350);
  const mag = await page.evaluate(() => {
    const a = document.querySelector('.hero-cta-blobs a[href="/contact"]');
    return {
      wrapper: getComputedStyle(a.parentElement).transform,
      chars: a.querySelectorAll('.split-char, div[style*="translate"]').length,
      text: a.innerText,
    };
  });
  console.log('magnetic', JSON.stringify(mag));

  // header inline menu
  const toggle = await page.$('header button[aria-expanded]');
  await toggle.click();
  await sleep(900);
  const menu = await page.evaluate(() => {
    const nav = document.querySelector('header nav[aria-label="Main"]');
    const ul = nav.querySelector('ul');
    return { navWidth: Math.round(nav.getBoundingClientRect().width), ulOpacity: getComputedStyle(ul).opacity, links: [...nav.querySelectorAll(':scope > ul > li > a')].map((a) => a.innerText) };
  });
  console.log('inline menu', JSON.stringify(menu));
  await page.screenshot({ path: 'out/header_open.png', clip: { x: 700, y: 0, width: 740, height: 220 } });
  await browser.close();
})();
