import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
