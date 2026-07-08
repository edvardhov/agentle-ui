import { DEFAULT_DEBOUNCE_MS } from "../constants";

export type SchedulerListener = () => void;

export class PaintScheduler {
  private listeners = new Set<SchedulerListener>();
  private pending = false;
  private rafId: number | null = null;
  private debounceMs: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(debounceMs = DEFAULT_DEBOUNCE_MS) {
    this.debounceMs = debounceMs;
  }

  setDebounceMs(ms: number): void {
    this.debounceMs = ms;
  }

  subscribe(listener: SchedulerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(): void {
    if (this.debounceMs <= 0) {
      this.flush();
      return;
    }

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      this.scheduleFrame();
    }, this.debounceMs);
  }

  flush(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pending = false;
    for (const listener of this.listeners) {
      listener();
    }
  }

  dispose(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.listeners.clear();
  }

  private scheduleFrame(): void {
    if (this.pending) return;
    this.pending = true;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.pending = false;
      for (const listener of this.listeners) {
        listener();
      }
    });
  }
}

export class StreamStore<T> {
  private snapshot: T;
  private version = 0;
  private scheduler: PaintScheduler;
  private listeners = new Set<() => void>();

  constructor(initial: T, scheduler: PaintScheduler) {
    this.snapshot = initial;
    this.scheduler = scheduler;
    this.scheduler.subscribe(() => {
      for (const listener of this.listeners) {
        listener();
      }
    });
  }

  getSnapshot(): T {
    return this.snapshot;
  }

  getVersion(): number {
    return this.version;
  }

  update(next: T): void {
    this.snapshot = next;
    this.version += 1;
    this.scheduler.notify();
  }

  flush(next: T): void {
    this.snapshot = next;
    this.version += 1;
    this.scheduler.flush();
    for (const listener of this.listeners) {
      listener();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    this.listeners.clear();
  }
}
