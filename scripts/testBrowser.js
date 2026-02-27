const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting headless browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Listen to console logs
    page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}:`, msg.text()));

    // Listen to page errors (uncaught exceptions)
    page.on('pageerror', error => {
        console.error(`[Browser Page Error] uncaught exception:`, error.message);
    });

    console.log('Navigating to http://localhost:8081 ...');
    try {
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 15000 });
        console.log('Page loaded.');
    } catch (e) {
        console.error('Failed to load page:', e.message);
    }

    await browser.close();
})();
