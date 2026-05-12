/**
 * Returns a promise that resolves after a given number of milliseconds.
 * Useful for simulating typing and reading delays.
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sleeps for a random amount of time between min and max (inclusive).
 * Uses process.env.MIN_DELAY_MS and process.env.MAX_DELAY_MS if arguments are not provided.
 */
export async function randomDelay(min = null, max = null) {
  const minDelay = min || parseInt(process.env.MIN_DELAY_MS || '3000', 10);
  const maxDelay = max || parseInt(process.env.MAX_DELAY_MS || '8000', 10);
  
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await sleep(delay);
}
