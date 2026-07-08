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

  it("flushes incomplete code fence when isComplete flips after rapid updates", async () => {
    const broken = "```typescript\nconst x = 1;\n";

    const { result, rerender } = renderHook(
      ({ content, isComplete }: { content: string; isComplete: boolean }) =>
        useStabilizedMarkdown(content, { isComplete }),
      { initialProps: { content: "", isComplete: false } },
    );

    for (let i = 1; i <= broken.length; i += 2) {
      rerender({ content: broken.slice(0, i), isComplete: false });
    }

    rerender({ content: broken, isComplete: true });

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
      expect(result.current.pendingBlocks).toHaveLength(0);
      expect(result.current.renderedBlocks.some((b) => b.type === "code_fence")).toBe(true);
    });
  });

  it("flushes when only isComplete flips without a content change", async () => {
    const broken = "# Broken code fence\n\n```typescript\nexport function incomplete() {\n  return \"still streaming\n";

    const { result, rerender } = renderHook(
      ({ content, isComplete }: { content: string; isComplete: boolean }) =>
        useStabilizedMarkdown(content, { isComplete }),
      { initialProps: { content: broken, isComplete: false } },
    );

    expect(result.current.pendingBlocks.some((b) => b.type === "code_fence")).toBe(true);

    rerender({ content: broken, isComplete: true });

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.pendingBlocks).toHaveLength(0);
      expect(result.current.renderedBlocks.some((b) => b.type === "code_fence")).toBe(true);
    });
  });

  it("flushes after hook remount when stream completes", async () => {
    const broken = "# Broken code fence\n\n```typescript\nexport function incomplete() {\n  return \"still streaming\n";

    const { unmount } = renderHook(
      ({ content, isComplete }: { content: string; isComplete: boolean }) =>
        useStabilizedMarkdown(content, { isComplete }),
      { initialProps: { content: broken, isComplete: false } },
    );

    unmount();

    const { result } = renderHook(
      ({ content, isComplete }: { content: string; isComplete: boolean }) =>
        useStabilizedMarkdown(content, { isComplete }),
      { initialProps: { content: broken, isComplete: true } },
    );

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
      expect(result.current.pendingBlocks).toHaveLength(0);
      expect(result.current.renderedBlocks.some((b) => b.type === "code_fence")).toBe(true);
    });
  });
});
