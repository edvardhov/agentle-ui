import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useActionState } from "../hooks/use-action-state";

describe("useActionState", () => {
  it("auto-expands running actions", () => {
    const { result } = renderHook(() =>
      useActionState({
        id: "1",
        name: "web_search",
        status: "running",
      }),
    );

    expect(result.current.isExpanded("1")).toBe(true);
    expect(result.current.runningCount).toBe(1);
  });

  it("toggles expanded state", () => {
    const { result } = renderHook(() =>
      useActionState({
        id: "1",
        name: "web_search",
        status: "success",
        startedAt: 0,
        completedAt: 1200,
      }),
    );

    act(() => {
      result.current.toggleExpanded("1");
    });

    expect(result.current.isExpanded("1")).toBe(true);
    expect(result.current.formatDuration(result.current.actions[0]!)).toBe("1.2s");
  });

  it("captures timestamps when running actions transition to success", () => {
    const { result, rerender } = renderHook(({ action }) => useActionState(action), {
      initialProps: {
        action: {
          id: "1",
          name: "web_search",
          status: "running" as const,
        },
      },
    });

    const startedAt = result.current.actions[0]?.startedAt;
    expect(startedAt).toBeTypeOf("number");

    rerender({
      action: {
        id: "1",
        name: "web_search",
        status: "success" as const,
        startedAt,
      },
    });

    expect(result.current.actions[0]?.completedAt).toBeTypeOf("number");
  });

  it("reports live duration while an action is running", async () => {
    vi.useFakeTimers();
    const startedAt = Date.now();

    const { result } = renderHook(() =>
      useActionState(
        {
          id: "1",
          name: "web_search",
          status: "running",
          startedAt,
        },
        { tickMs: 500 },
      ),
    );

    expect(result.current.formatDuration(result.current.actions[0]!)).toMatch(/\d+ms|\d+\.\d+s/);

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const duration = result.current.formatDuration(result.current.actions[0]!);
    expect(duration).not.toBe("");
    expect(duration).toMatch(/\d+ms|\d+\.\d+s/);

    vi.useRealTimers();
  });
});
