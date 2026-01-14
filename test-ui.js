import puppeteer from 'puppeteer';

async function testUI() {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  const consoleMessages = [];
  const networkErrors = [];

  // Capture console messages
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(`[Browser] ${text}`);
  });

  // Capture network errors
  page.on('requestfailed', request => {
    const error = `${request.url()}: ${request.failure()?.errorText}`;
    networkErrors.push(error);
    console.log(`[Network Error] ${error}`);
  });

  // Capture successful requests to our API
  page.on('response', response => {
    if (response.url().includes('localhost:3001')) {
      console.log(`[API Response] ${response.url()} - ${response.status()}`);
    }
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Take a screenshot
  await page.screenshot({ path: 'screenshot-initial.png', fullPage: true });
  console.log('\nScreenshot saved: screenshot-initial.png');

  // Check if the page loaded
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Try to add a brand and test API call
  console.log('\n--- Interacting with UI ---');

  // Type in API key field (use a fake key for testing)
  const apiKeyInput = await page.$('input[type="password"]');
  if (apiKeyInput) {
    await apiKeyInput.type('test-api-key-12345');
    console.log('Entered test API key');
  }

  // Type in brand name field
  const brandInput = await page.$('input[placeholder*="Brand name"]');
  if (brandInput) {
    await brandInput.type('Ahrefs');
    console.log('Entered brand name: Ahrefs');
  }

  // Click Add Brand button
  const addButtons = await page.$$('button');
  for (const btn of addButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Add Brand')) {
      await btn.click();
      console.log('Clicked Add Brand button');
      break;
    }
  }

  await page.screenshot({ path: 'screenshot-after-add.png', fullPage: true });
  console.log('Screenshot saved: screenshot-after-add.png');

  // Click Fetch Data button
  console.log('\n--- Clicking Fetch Data ---');
  const fetchButton = await page.$('.fetch-btn');
  if (fetchButton) {
    await fetchButton.click();
    console.log('Clicked Fetch Data button');

    // Wait for the request
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.screenshot({ path: 'screenshot-after-fetch.png', fullPage: true });
    console.log('Screenshot saved: screenshot-after-fetch.png');
  }

  // Check for error message
  const errorBanner = await page.$('.error-banner');
  if (errorBanner) {
    const errorText = await page.evaluate(el => el.textContent, errorBanner);
    console.log(`\nError displayed in UI: ${errorText}`);
  }

  console.log('\n--- Summary ---');
  console.log(`Console messages: ${consoleMessages.length}`);
  console.log(`Network errors: ${networkErrors.length}`);

  if (networkErrors.length > 0) {
    console.log('\nNetwork Errors:');
    networkErrors.forEach(e => console.log(`  - ${e}`));
  }

  await browser.close();
  console.log('\nTest complete.');
}

testUI().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
