import { DEFAULT_DEBOUNCE_MS } from "../constants";

export type SchedulerListener = () => void;

export class PaintScheduler {
  private listeners = new Set<SchedulerListener>();
  private rafId: number | null = null;
  private trailingTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private debounceMs: number;
  private dirty = false;

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
      this.emit();
      return;
    }

    this.dirty = true;

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        if (this.dirty) {
          this.dirty = false;
          this.emit();
        }
      });
    }

    if (this.trailingTimeoutId !== null) {
      clearTimeout(this.trailingTimeoutId);
    }

    this.trailingTimeoutId = setTimeout(() => {
      this.trailingTimeoutId = null;
      if (this.dirty) {
        this.dirty = false;
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        this.emit();
      }
    }, this.debounceMs);
  }

  flush(): void {
    this.cancelPending();
    this.emit();
  }

  cancelPending(): void {
    if (this.trailingTimeoutId !== null) {
      clearTimeout(this.trailingTimeoutId);
      this.trailingTimeoutId = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.dirty = false;
  }

  dispose(): void {
    this.cancelPending();
    this.listeners.clear();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
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
      this.notifyListeners();
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
    this.scheduler.cancelPending();
    this.notifyListeners();
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

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
