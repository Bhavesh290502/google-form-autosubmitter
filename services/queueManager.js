import fs from 'fs';
import csvParser from 'csv-parser';
import { submitSingle } from './submissionEngine.js';
import { randomDelay } from '../utils/delay.js';

export async function processBulk(formUrl, csvFilePath, fieldMapping) {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Processing ${results.length} entries...`);
        for (const row of results) {
          try {
            // Map CSV row to Google Form entry IDs based on fieldMapping
            // example fieldMapping: { "wallet": "entry.12345", "twitter": "entry.67890" }
            const formData = {};
            for (const [csvCol, entryId] of Object.entries(fieldMapping)) {
              if (row[csvCol]) {
                formData[entryId] = row[csvCol];
              }
            }
            
            await submitSingle(formUrl, formData);
            // Additional delay between bulk submissions
            await randomDelay(2000, 5000); 
          } catch (error) {
            console.error(`Error submitting row:`, error.message);
            // Optional: Implement exponential backoff retry here
          }
        }
        
        // Cleanup file
        fs.unlinkSync(csvFilePath);
        resolve(true);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
