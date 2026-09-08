const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const results = [];
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 375, height: 812 },
    { name: 'small-mobile', width: 320, height: 568 },
  ]) {
    await page.setViewport(viewport);
    await page.goto(process.env.NAVBAR_URL || 'http://127.0.0.1:4173/', { waitUntil: 'networkidle0' });
    const before = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="i41 工具导航"]');
      const toggle = document.querySelector('button[aria-controls="mobile-menu"]');
      const desktop = nav.querySelector('.lg\\:flex');
      const visibleDesktopLinks = [...desktop.querySelectorAll('a')].filter((link) => getComputedStyle(link).display !== 'none');
      return {
        viewportWidth: innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        navClientWidth: nav.clientWidth,
        navScrollWidth: nav.scrollWidth,
        toggleDisplay: getComputedStyle(toggle).display,
        toggleText: toggle.textContent.trim(),
        toggleFontFamily: getComputedStyle(toggle).fontFamily,
        toggleFontSize: getComputedStyle(toggle).fontSize,
        desktopDisplay: getComputedStyle(desktop).display,
        desktopLinksSingleLine: visibleDesktopLinks.every((link) => getComputedStyle(link).whiteSpace === 'nowrap') && new Set(visibleDesktopLinks.map((link) => link.getBoundingClientRect().top)).size === 1,
        desktopLinks: visibleDesktopLinks.map((link) => ({ text: link.childNodes[0]?.textContent?.trim() || '', fontSize: getComputedStyle(link).fontSize, whiteSpace: getComputedStyle(link).whiteSpace, height: link.getBoundingClientRect().height })),
      };
    });
    if (before.toggleDisplay !== 'none') {
      await page.click('button[aria-controls="mobile-menu"]');
      await page.waitForSelector('#mobile-menu');
    }
    const after = await page.evaluate(() => {
      const menu = document.querySelector('#mobile-menu');
      return {
        menuOpen: Boolean(menu),
        menuRight: menu?.getBoundingClientRect().right ?? null,
        menuWidth: menu?.getBoundingClientRect().width ?? null,
        documentScrollWidthAfterOpen: document.documentElement.scrollWidth,
        mobileLinks: menu ? [...menu.querySelectorAll('a')].map((link) => ({ text: link.firstElementChild?.textContent, fontFamily: getComputedStyle(link).fontFamily, fontSize: getComputedStyle(link).fontSize, right: link.getBoundingClientRect().right })) : [],
      };
    });
    results.push({ viewport, ...before, ...after });
  }
  await browser.close();

  const desktop = results[0];
  if (desktop.desktopDisplay !== 'flex' || !desktop.desktopLinksSingleLine || desktop.documentScrollWidth !== desktop.viewportWidth) throw new Error(`desktop geometry failed: ${JSON.stringify(desktop)}`);
  for (const mobile of results.slice(1)) {
    if (mobile.toggleDisplay === 'none' || mobile.toggleText !== '☰菜单' || mobile.toggleFontSize !== '13px') throw new Error(`mobile toggle failed: ${JSON.stringify(mobile)}`);
    if (!mobile.menuOpen || mobile.documentScrollWidthAfterOpen !== mobile.viewportWidth || mobile.menuRight > mobile.viewportWidth) throw new Error(`mobile overflow failed: ${JSON.stringify(mobile)}`);
    if (!mobile.mobileLinks.every((link) => link.fontSize === '13px' && link.right <= mobile.viewportWidth)) throw new Error(`mobile links failed: ${JSON.stringify(mobile)}`);
  }
  console.log(JSON.stringify(results, null, 2));
})();
