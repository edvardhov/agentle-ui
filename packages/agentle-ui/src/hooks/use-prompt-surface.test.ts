import { renderHook, act } from "@testing-library/react";
import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { usePromptSurface } from "../hooks/use-prompt-surface";

function keyDown(
  result: { current: ReturnType<typeof usePromptSurface> },
  key: string,
) {
  act(() => {
    result.current.handleKeyDown({
      key,
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent<HTMLTextAreaElement>);
  });
}

describe("usePromptSurface", () => {
  it("filters slash commands", () => {
    const replay = vi.fn();
    const { result } = renderHook(() =>
      usePromptSurface({
        commands: [{ name: "replay", description: "Replay session", action: replay }],
      }),
    );

    act(() => {
      result.current.setText("/rep");
    });

    expect(result.current.filteredCommands).toHaveLength(1);
    expect(result.current.activeCommand?.name).toBe("replay");
  });

  it("submits trimmed text and clears input", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => usePromptSurface({ onSubmit }));

    act(() => {
      result.current.setText("  Hello agent  ");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(onSubmit).toHaveBeenCalledWith("Hello agent", []);
    expect(result.current.text).toBe("");
  });

  it("respects max attachment count", () => {
    const { result } = renderHook(() => usePromptSurface({ maxAttachments: 1 }));

    act(() => {
      result.current.addAttachment(new File(["a"], "a.txt", { type: "text/plain" }));
      result.current.addAttachment(new File(["b"], "b.txt", { type: "text/plain" }));
    });

    expect(result.current.attachments).toHaveLength(1);
  });

  it("keeps isSubmitting true while async onSubmit is pending", async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    const { result } = renderHook(() => usePromptSurface({ onSubmit }));

    act(() => {
      result.current.setText("Hello");
    });

    let submitPromise: Promise<void> | undefined;
    act(() => {
      submitPromise = result.current.submit();
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSubmit?.();
      await submitPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.text).toBe("");
  });

  it("navigates slash commands with arrow keys and selects highlighted command", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() =>
      usePromptSurface({
        commands: [
          { name: "alpha", description: "First", action: first },
          { name: "beta", description: "Second", action: second },
        ],
      }),
    );

    act(() => {
      result.current.setText("/");
    });

    expect(result.current.selectedCommandIndex).toBe(0);
    expect(result.current.activeCommand?.name).toBe("alpha");

    keyDown(result, "ArrowDown");
    expect(result.current.selectedCommandIndex).toBe(1);
    expect(result.current.activeCommand?.name).toBe("beta");

    keyDown(result, "Enter");
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(result.current.text).toBe("");
  });
});
