import { describe, expect, it, vi } from "vitest";
import { PaintScheduler, StreamStore } from "./scheduler";

describe("PaintScheduler", () => {
  it("emits on trailing flush after a burst of notifies", async () => {
    vi.useFakeTimers();
    const scheduler = new PaintScheduler(16);
    let notifications = 0;

    scheduler.subscribe(() => {
      notifications += 1;
    });

    for (let index = 0; index < 20; index += 1) {
      scheduler.notify();
    }

    expect(notifications).toBe(0);

    await vi.runAllTimersAsync();

    expect(notifications).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});

describe("StreamStore", () => {
  it("notifies subscribers once on flush even after scheduler dispose", () => {
    const scheduler = new PaintScheduler(0);
    const store = new StreamStore({ value: 0 }, scheduler);
    let notifications = 0;

    store.subscribe(() => {
      notifications += 1;
    });

    scheduler.dispose();
    store.flush({ value: 1 });

    expect(notifications).toBe(1);
    expect(store.getSnapshot().value).toBe(1);
  });
});
