/* retryWithBackoff utility
   - maxRetries default 3
   - baseMs default 200
   - exponential backoff with jitter
*/

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseMs = 200,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxRetries) {
        throw err;
      }
      const backoff = Math.pow(2, attempt) * baseMs;
      const jitter = Math.floor(Math.random() * baseMs);
      const wait = backoff + jitter;
      await new Promise((res) => setTimeout(res, wait));
      attempt++;
    }
  }
}
