import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePromptSurface } from "../hooks/use-prompt-surface";

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

  it("submits trimmed text and clears input", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => usePromptSurface({ onSubmit }));

    act(() => {
      result.current.setText("  Hello agent  ");
    });

    act(() => {
      result.current.submit();
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
});
