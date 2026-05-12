import fs from 'fs';
import path from 'path';

// Local logging
const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

export async function logResult(status, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    status,
    ...details
  };
  
  const dateStr = timestamp.split('T')[0];
  const filename = status === 'success' ? `success_${dateStr}.jsonl` : `failed_${dateStr}.jsonl`;
  const filePath = path.join(LOG_DIR, filename);

  fs.appendFileSync(filePath, JSON.stringify(logEntry) + '\n');
  
  if (status === 'success') {
    console.log(`[SUCCESS] ${timestamp}: ${details.url}`);
  } else {
    console.error(`[FAILED] ${timestamp}: ${details.url} - ${details.error}`);
  }
}

export function getRecentLogs() {
  const dateStr = new Date().toISOString().split('T')[0];
  const successFile = path.join(LOG_DIR, `success_${dateStr}.jsonl`);
  const failedFile = path.join(LOG_DIR, `failed_${dateStr}.jsonl`);
  
  let logs = [];
  
  [successFile, failedFile].forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').filter(Boolean);
        lines.forEach(line => {
          try { logs.push(JSON.parse(line)); } catch(e) {}
        });
      } catch (e) {
        console.error('Error reading log file', e);
      }
    }
  });

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return logs.slice(0, 100);
}
