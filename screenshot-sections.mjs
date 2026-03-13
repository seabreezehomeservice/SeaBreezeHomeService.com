import puppeteer from 'puppeteer';

const dir = 'C:/Users/austi/OneDrive/Desktop/seabreeze-website/temporary screenshots';
const browser = await puppeteer.launch({
  executablePath: 'C:/Users/austi/.cache/puppeteer/chrome/win64-146.0.7680.66/chrome-win64/chrome.exe',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')));

for (const sel of ['#hero','#services','#why','#reviews','#faq']) {
  const el = await page.$(sel);
  if (el) {
    await el.screenshot({ path: `${dir}/sec-${sel.slice(1)}.png` });
    console.log('saved', sel);
  }
}
await browser.close();
