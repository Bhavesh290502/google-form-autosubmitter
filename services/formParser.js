import axios from 'axios';
import { getRandomHeaders } from '../utils/headers.js';

/**
 * Parses a Google Form viewform URL and extracts formId, field IDs, and labels.
 * Detects CAPTCHA and login requirements.
 */
export async function parseGoogleForm(url) {
  try {
    const response = await axios.get(url, { headers: getRandomHeaders() });
    const html = response.data;

    // Detect protections
    const hasCaptcha = html.includes('reCAPTCHA') || html.includes('hCaptcha');
    const requiresLogin = html.includes('Sign in to continue');

    // Extract form Action ID
    const formActionMatch = html.match(/<form action="([^"]+)"/);
    const formAction = formActionMatch ? formActionMatch[1] : null;

    if (!formAction) {
      throw new Error('Could not find form action URL. Ensure this is a valid Google Form.');
    }

    // Extract FBZX
    const fbzxMatch = html.match(/name="fbzx" value="([^"]+)"/);
    const fbzx = fbzxMatch ? fbzxMatch[1] : null;

    // Robust extraction from FB_PUBLIC_LOAD_DATA_
    const fields = [];
    try {
      const dataMatch = html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\s*<\/script>/s) || html.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*\]);/);
      if (dataMatch && dataMatch[1]) {
        const formData = JSON.parse(dataMatch[1]);
        const questions = formData[1][1];
        
        for (const q of questions) {
          const title = q[1];
          const inputArr = q[4];
          if (inputArr && inputArr[0] && inputArr[0][0]) {
            const entryId = `entry.${inputArr[0][0]}`;
            fields.push({
              id: entryId,
              label: title || entryId
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse FB_PUBLIC_LOAD_DATA_', e);
    }

    // Fallback regex if data parsing failed
    if (fields.length === 0) {
      const entryRegex = /name="(entry\.\d+)"/g;
      let match;
      const addedEntries = new Set();
      while ((match = entryRegex.exec(html)) !== null) {
        if (!addedEntries.has(match[1])) {
          fields.push({
            id: match[1],
            label: `Field ${match[1]}`
          });
          addedEntries.add(match[1]);
        }
      }
    }

    return {
      actionUrl: formAction,
      fbzx,
      fields,
      protections: {
        hasCaptcha,
        requiresLogin
      }
    };
  } catch (error) {
    throw new Error(`Failed to parse form: ${error.message}`);
  }
}
