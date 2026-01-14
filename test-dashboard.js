import puppeteer from 'puppeteer';

async function testDashboard() {
  const API_KEY = process.env.AHREFS_API_KEY || 'cInkDpPjuTZJKa7LnndHObWv8bs1bFYcRRnFTj_r';

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport larger
  await page.setViewport({ width: 1920, height: 1080 });

  // Capture console and network
  page.on('console', msg => console.log(`[Console] ${msg.type()}: ${msg.text()}`));
  page.on('response', response => {
    if (response.url().includes('localhost:3001')) {
      console.log(`[API] ${response.status()} ${response.url().substring(0, 100)}`);
    }
  });

  console.log('Opening dashboard...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  await page.screenshot({ path: 'test-01-initial.png', fullPage: true });
  console.log('Screenshot: test-01-initial.png');

  // Enter API key
  const apiKeyInput = await page.$('input[type="password"]');
  if (apiKeyInput) {
    await apiKeyInput.click({ clickCount: 3 }); // Select all
    await apiKeyInput.type(API_KEY);
    console.log('Entered API key');
  }

  // Enter brand name
  const brandInput = await page.$('input[placeholder*="Brand name"]');
  if (brandInput) {
    await brandInput.type('Ahrefs');
    console.log('Entered brand: Ahrefs');
  }

  // Click Add Brand
  const addBtn = await page.evaluateHandle(() => {
    return [...document.querySelectorAll('button')].find(b => b.textContent.includes('Add Brand'));
  });
  if (addBtn) {
    await addBtn.click();
    console.log('Clicked Add Brand');
  }

  await page.screenshot({ path: 'test-02-brand-added.png', fullPage: true });
  console.log('Screenshot: test-02-brand-added.png');

  // Click Fetch Data
  const fetchBtn = await page.$('.fetch-btn');
  if (fetchBtn) {
    await fetchBtn.click();
    console.log('Clicked Fetch Data');
  }

  // Wait for API responses
  await new Promise(r => setTimeout(r, 5000));

  await page.screenshot({ path: 'test-03-after-fetch.png', fullPage: true });
  console.log('Screenshot: test-03-after-fetch.png');

  // Check for errors
  const errorBanner = await page.$('.error-banner');
  if (errorBanner) {
    const errorText = await page.evaluate(el => el.textContent, errorBanner);
    console.log(`ERROR BANNER: ${errorText}`);
  }

  // Check what data sections exist
  const sections = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h2, h3')];
    return headings.map(h => h.textContent);
  });
  console.log('Sections found:', sections);

  // Check if charts have data
  const chartInfo = await page.evaluate(() => {
    const charts = document.querySelectorAll('.recharts-wrapper');
    return `Found ${charts.length} Recharts components`;
  });
  console.log(chartInfo);

  // Scroll down and take more screenshots
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.screenshot({ path: 'test-04-scrolled.png', fullPage: true });
  console.log('Screenshot: test-04-scrolled.png');

  await browser.close();
  console.log('\nTest complete!');
}

testDashboard().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
