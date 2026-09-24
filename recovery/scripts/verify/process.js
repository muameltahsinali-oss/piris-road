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
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
  await sleep(4000);
  const info = async (label) => {
    const r = await page.evaluate(() => {
      const sec = document.querySelector('[data-scene="card"]').closest('section');
      const heading = sec.querySelector('h2');
      const cards = [...sec.querySelectorAll('[data-scene="card"]')].map((c) => Math.round(c.getBoundingClientRect().left));
      return {
        sectionTop: Math.round(sec.getBoundingClientRect().top),
        headingWidth: Math.round(heading.getBoundingClientRect().width),
        cardLefts: cards.join(','),
      };
    });
    console.log(label, JSON.stringify(r));
  };
  const top = await page.evaluate(() => {
    const sec = document.querySelector('[data-scene="card"]').closest('section');
    return Math.round(sec.getBoundingClientRect().top + window.scrollY);
  });
  for (const off of [0, 300, 600, 900, 1100]) {
    await page.evaluate((y) => window.scrollTo(0, y), top + off);
    await sleep(700);
    await info('offset ' + off);
    if (off === 0 || off === 1100) await page.screenshot({ path: `out/process_${off}.png` });
  }
  await browser.close();
})();
