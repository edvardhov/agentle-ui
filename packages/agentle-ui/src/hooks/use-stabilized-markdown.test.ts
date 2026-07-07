import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStabilizedMarkdown } from "../hooks/use-stabilized-markdown";

describe("useStabilizedMarkdown", () => {
  it("returns stable blocks for complete string input", () => {
    const { result } = renderHook(() =>
      useStabilizedMarkdown("# Hello\n\nWorld"),
    );

    expect(result.current.isComplete).toBe(true);
    expect(result.current.renderedBlocks.length).toBeGreaterThan(0);
    expect(result.current.pendingBlocks).toHaveLength(0);
  });

  it("keeps incomplete code fence in pending during stream", async () => {
    async function* makeStream() {
      yield "# Demo\n\n";
      yield "```typescript\n";
      yield "const answer = 42;\n";
      await new Promise((r) => setTimeout(r, 5));
      yield "```";
    }

    const stream = makeStream();
    const { result } = renderHook(() => useStabilizedMarkdown(stream));

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.renderedBlocks.some((b) => b.type === "code_fence")).toBe(true);
    expect(result.current.pendingBlocks).toHaveLength(0);
  });
});
