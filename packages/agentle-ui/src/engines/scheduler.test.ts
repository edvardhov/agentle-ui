import { describe, expect, it } from "vitest";
import { PaintScheduler, StreamStore } from "./scheduler";

describe("StreamStore", () => {
  it("notifies subscribers on flush even after scheduler dispose", () => {
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
