/* Simple Circuit Breaker implementation
   Usage:
     const cb = new CircuitBreaker({ failureThreshold: 5, successThreshold: 2, timeoutMs: 30000 });
     await cb.call(() => someRemoteCall());
*/

type CBState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state: CBState = "CLOSED";
  private lastFailureAt: number | null = null;

  constructor(
    private failureThreshold = 5,
    private successThreshold = 2,
    private timeoutMs = 30_000,
  ) {}

  private now() {
    return Date.now();
  }

  private isTimeoutExpired() {
    if (!this.lastFailureAt) return true;
    return this.now() - this.lastFailureAt > this.timeoutMs;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN" && !this.isTimeoutExpired()) {
      throw new Error("Circuit is open");
    }

    if (this.state === "OPEN" && this.isTimeoutExpired()) {
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successCount += 1;
      if (this.successCount >= this.successThreshold) {
        this.reset();
      }
    } else {
      this.reset();
    }
  }

  private onFailure() {
    this.failureCount += 1;
    this.lastFailureAt = this.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  private reset() {
    this.failureCount = 0;
    this.successCount = 0;
    this.state = "CLOSED";
    this.lastFailureAt = null;
  }

  getState(): CBState {
    return this.state;
  }
}
