/**
 * Throttle function execution using RAF (Request Animation Frame)
 * This ensures updates happen at most once per frame (~60fps)
 */
export function throttleRAF<T extends (...args: any[]) => void>(fn: T): T {
  let rafId: number | null = null;
  let lastArgs: any[] | null = null;

  const throttled = (...args: any[]) => {
    lastArgs = args;

    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      if (lastArgs) {
        fn(...lastArgs);
        lastArgs = null;
      }
      rafId = null;
    });
  };

  return throttled as T;
}

/**
 * Throttle function execution with a time interval
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;
  let lastCallTime = 0;

  const throttled = (...args: any[]) => {
    const now = Date.now();
    lastArgs = args;

    if (now - lastCallTime >= delay) {
      // Execute immediately if enough time has passed
      fn(...args);
      lastCallTime = now;
      lastArgs = null;
    } else if (!timeoutId) {
      // Schedule execution for later
      const remaining = delay - (now - lastCallTime);
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          fn(...lastArgs);
          lastCallTime = Date.now();
          lastArgs = null;
        }
        timeoutId = null;
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return throttled as T & { cancel: () => void };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

/**
 * Batch multiple operations together
 */
export class BatchProcessor<T> {
  private batch: T[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly delay: number;
  private readonly maxBatchSize: number;
  private readonly processFn: (items: T[]) => void;

  constructor(
    processFn: (items: T[]) => void,
    delay: number = 100,
    maxBatchSize: number = 50
  ) {
    this.processFn = processFn;
    this.delay = delay;
    this.maxBatchSize = maxBatchSize;
  }

  add(item: T): void {
    this.batch.push(item);

    // Process immediately if batch is full
    if (this.batch.length >= this.maxBatchSize) {
      this.flush();
      return;
    }

    // Schedule processing
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.batch.length > 0) {
      const items = [...this.batch];
      this.batch = [];
      this.processFn(items);
    }
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.batch = [];
  }

  size(): number {
    return this.batch.length;
  }
}

/**
 * Create a rate limiter that ensures a function is called at most N times per interval
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private readonly maxCalls: number;
  private readonly interval: number;
  private callCount = 0;
  private resetTimer: NodeJS.Timeout | null = null;

  constructor(maxCalls: number, interval: number) {
    this.maxCalls = maxCalls;
    this.interval = interval;
  }

  async execute<T>(fn: () => T | Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    const process = () => {
      if (this.callCount >= this.maxCalls) {
        // Wait for reset
        if (!this.resetTimer) {
          this.resetTimer = setTimeout(() => {
            this.callCount = 0;
            this.resetTimer = null;
            this.processing = false;
            this.processQueue();
          }, this.interval);
        }
        return;
      }

      const fn = this.queue.shift();
      if (fn) {
        this.callCount++;
        fn();

        // Process next immediately if we haven't hit the limit
        if (this.queue.length > 0 && this.callCount < this.maxCalls) {
          setImmediate(process);
        } else {
          this.processing = false;
          if (this.queue.length > 0) {
            this.processQueue();
          }
        }
      } else {
        this.processing = false;
      }
    };

    process();
  }

  cancel(): void {
    this.queue = [];
    this.processing = false;
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}
