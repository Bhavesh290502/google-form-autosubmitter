import axios from 'axios';
import { getRandomHeaders } from '../utils/headers.js';
import { randomDelay } from '../utils/delay.js';
import { fallbackPuppeteerSubmit } from './puppeteerFallback.js';
import { logResult } from '../utils/logger.js';
import { getRandomProxy } from '../utils/proxyManager.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

/**
 * Submit a single entry to the form using fetch/axios
 */
export async function submitSingle(formUrl, formData, usePuppeteer = false) {
  // Add randomized human-like delay
  await randomDelay();

  if (usePuppeteer) {
    return await fallbackPuppeteerSubmit(formUrl, formData);
  }

  try {
    const submitUrl = formUrl.replace('/viewform', '/formResponse');
    
    // First, fetch the form to get a fresh fbzx token
    const getRes = await axios.get(formUrl, { headers: getRandomHeaders() });
    const html = getRes.data;
    
    const fbzxMatch = html.match(/name="fbzx"\s+value="([^"]+)"/);
    const fbzx = fbzxMatch ? fbzxMatch[1] : '';
    
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
      params.append(key, value);
    }
    
    // Append Google Forms hidden required fields to prevent 401 Unauthorized
    params.append('fvv', '1');
    params.append('pageHistory', '0');
    if (fbzx) {
      params.append('fbzx', fbzx);
      params.append('partialResponse', `[null,null,"${fbzx}"]`);
    }

    const headers = {
      ...getRandomHeaders(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': formUrl
    };

    const axiosConfig = { headers };
    const proxyUrl = getRandomProxy();
    if (proxyUrl) {
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
    }

    const response = await axios.post(submitUrl, params.toString(), axiosConfig);
    
    if (response.status === 200 || response.status === 302) {
      await logResult('success', { url: formUrl, data: formData });
      return { success: true, message: 'Form submitted successfully' };
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    await logResult('failed', { url: formUrl, data: formData, error: error.message });
    throw error;
  }
}
