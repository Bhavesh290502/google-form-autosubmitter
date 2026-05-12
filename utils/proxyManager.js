import fs from 'fs';
import path from 'path';

const PROXIES_FILE = path.join(process.cwd(), 'proxies.txt');

export function getRandomProxy() {
  if (!fs.existsSync(PROXIES_FILE)) {
    return null;
  }

  const content = fs.readFileSync(PROXIES_FILE, 'utf-8');
  const proxies = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  if (proxies.length === 0) {
    return null;
  }

  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
  return randomProxy;
}
