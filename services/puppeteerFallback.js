import puppeteer from 'puppeteer';
import { randomDelay } from '../utils/delay.js';
import { getRandomProxy } from '../utils/proxyManager.js';

/**
 * Fallback to using Puppeteer for CAPTCHA or JS-heavy forms.
 */
export async function fallbackPuppeteerSubmit(formUrl, formData) {
  let browser;
  try {
    const proxyUrl = getRandomProxy();
    const args = ['--no-sandbox', '--disable-setuid-sandbox'];
    let proxyAuth = null;

    if (proxyUrl) {
      try {
        const parsedUrl = new URL(proxyUrl);
        args.push(`--proxy-server=${parsedUrl.protocol}//${parsedUrl.host}`);
        if (parsedUrl.username || parsedUrl.password) {
          proxyAuth = {
            username: decodeURIComponent(parsedUrl.username),
            password: decodeURIComponent(parsedUrl.password)
          };
        }
        console.log(`[Puppeteer] Using proxy: ${parsedUrl.host}`);
      } catch (err) {
        console.error('Invalid proxy URL format:', proxyUrl);
      }
    }

    const puppeteerOptions = {
      headless: "new",
      args
    };

    if (process.env.USE_REAL_CHROME === 'true') {
      puppeteerOptions.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      puppeteerOptions.userDataDir = 'C:\\Users\\91843\\AppData\\Local\\Google\\Chrome\\User Data';
      puppeteerOptions.headless = false; // Usually better to run non-headless when using a real profile
      console.log('[Puppeteer] Launching using REAL Chrome profile to inherit Google Logins...');
    }

    browser = await puppeteer.launch(puppeteerOptions);
    
    const page = await browser.newPage();
    
    if (proxyAuth) {
      await page.authenticate(proxyAuth);
    }
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    
    // Use Google Forms native pre-fill parameters via URL!
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
      params.append(key, value);
    }
    const prefillUrl = `${formUrl}?${params.toString()}`;
    
    await page.goto(prefillUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await randomDelay(1000, 2000);

    // Attempt to submit
    const submitButtonSelector = 'div[role="button"][aria-label="Submit"]'; // Adjust selector if needed
    try {
      await page.waitForSelector(submitButtonSelector, { timeout: 5000 });
      await page.click(submitButtonSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch(err) {
      console.warn("Could not find native submit button, trying generic click.");
      // Fallback: hit Enter on the last input
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
    }

    await browser.close();
    return { success: true, message: 'Submitted via Puppeteer' };
  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Puppeteer submission failed: ${error.message}`);
  }
}
