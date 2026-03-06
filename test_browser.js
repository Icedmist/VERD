const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
     if (window.AppState) window.AppState.set('user', {uid: '123', email: 'demo@verd.app', displayName: 'Farmer'});
     window.location.hash = '#/dashboard';
  });
  await page.waitForTimeout(2000);
  
  const content = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
  console.log(content);
  await browser.close();
})();
