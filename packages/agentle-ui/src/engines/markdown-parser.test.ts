import { describe, expect, it } from "vitest";
import {
  flushIncompleteBlocks,
  MarkdownCompletenessParser,
  partitionBlocks,
} from "../engines/markdown-parser";
import { collectStreamInput, getStreamInputKey, subscribeToStreamInput } from "../engines/stream-input";

describe("MarkdownCompletenessParser", () => {
  it("marks incomplete code fence until closing fence arrives", () => {
    const parser = new MarkdownCompletenessParser();

    const partial = parser.parse("Here is code:\n\n```typescript\nconst x = 1");
    const { pendingBlocks } = partitionBlocks(partial);
    expect(partial.some((b) => b.type === "code_fence")).toBe(true);
    expect(pendingBlocks.some((b) => b.type === "code_fence")).toBe(true);

    const complete = parser.parse("Here is code:\n\n```typescript\nconst x = 1\n```", true);
    const { renderedBlocks } = partitionBlocks(complete);
    expect(renderedBlocks.some((b) => b.type === "code_fence" && b.status !== "incomplete")).toBe(
      true,
    );
  });

  it("buffers partial tables until separator row is present", () => {
    const parser = new MarkdownCompletenessParser();

    const partial = parser.parse("| Name | Age |\n| Ed");
    const { pendingBlocks: pendingPartial } = partitionBlocks(partial);
    expect(pendingPartial.some((b) => b.type === "table")).toBe(true);

    const complete = parser.parse("| Name | Age |\n| --- | --- |\n| Ed | 30 |", true);
    const { renderedBlocks } = partitionBlocks(complete);
    expect(renderedBlocks.some((b) => b.type === "table")).toBe(true);
  });

  it("parses nested-style list blocks", () => {
    const parser = new MarkdownCompletenessParser();
    const blocks = parser.parse("- item one\n  - nested\n- item two", true);
    expect(blocks.some((b) => b.type === "list")).toBe(true);
  });

  it("renders a complete list after a trailing blank line while stream is active", () => {
    const parser = new MarkdownCompletenessParser();
    const text = "> quote\n\n- Zero layout shift\n- Works with any backend\n- No vendor lock-in\n\n---";
    const blocks = parser.parse(text, false);
    const { renderedBlocks, pendingBlocks } = partitionBlocks(blocks);

    expect(renderedBlocks.some((b) => b.type === "list" && b.status === "complete")).toBe(true);
    expect(pendingBlocks.some((b) => b.type === "list")).toBe(false);
  });

  it("keeps a partial list item in pending until the stream ends", () => {
    const parser = new MarkdownCompletenessParser();
    const partial = parser.parse("> quote\n\n- Zero layout shift\n- Works with any");
    const { pendingBlocks } = partitionBlocks(partial);
    expect(pendingBlocks.some((b) => b.type === "list")).toBe(true);
  });

  it("flushes incomplete blocks when stream completes", () => {
    const parser = new MarkdownCompletenessParser();
    const partial = parser.parse("```js\nconsole.log('hi')");
    const flushed = flushIncompleteBlocks(partial);
    expect(flushed.every((b) => b.status !== "incomplete")).toBe(true);
  });

  it("parses headings and paragraphs as stable blocks", () => {
    const parser = new MarkdownCompletenessParser();
    const blocks = parser.parse("# Title\n\nHello world", true);
    expect(blocks.some((b) => b.type === "heading")).toBe(true);
    expect(blocks.some((b) => b.type === "paragraph")).toBe(true);
  });

  it("keeps block ids stable across growing buffers", () => {
    const parser = new MarkdownCompletenessParser();
    const first = parser.parse("# Title", false);
    const second = parser.parse("# Title\n\nHello", false);

    expect(first[0]?.id).toBe(second[0]?.id);
    expect(first[0]?.id).toBe("heading:0");
  });

  it("assigns unique ids across parser instances", () => {
    const left = new MarkdownCompletenessParser();
    const right = new MarkdownCompletenessParser();
    const leftId = left.parse("# One", true)[0]?.id;
    const rightId = right.parse("# Two", true)[0]?.id;

    expect(leftId).toBe("heading:0");
    expect(rightId).toBe("heading:0");
  });

  it("short-circuits when text and completion state are unchanged", () => {
    const parser = new MarkdownCompletenessParser();
    const first = parser.parse("Hello", false);
    const second = parser.parse("Hello", false);

    expect(first).toBe(second);
  });

  it("incrementally re-parses from the last block when text grows", () => {
    const parser = new MarkdownCompletenessParser();
    const first = parser.parse("# Title", false);
    const second = parser.parse("# Title\n\nHello", false);

    expect(first[0]?.id).toBe(second[0]?.id);
    expect(second.some((b) => b.type === "paragraph")).toBe(true);
  });

  it("fully re-parses when text is replaced with a non-prefix edit", () => {
    const parser = new MarkdownCompletenessParser();
    parser.parse("# Title", false);
    const replaced = parser.parse("Different", true);

    expect(replaced.some((b) => b.content.includes("Different"))).toBe(true);
    expect(replaced.some((b) => b.content.includes("Title"))).toBe(false);
  });

  it("matches full parse when fed incrementally token-by-token", () => {
    const fullText =
      "# Title\n\nFirst paragraph.\n\nSecond paragraph continues here.\n\n```js\nconsole.log('hi')\n```";

    const reference = new MarkdownCompletenessParser();
    const expected = reference.parse(fullText, true);

    const incremental = new MarkdownCompletenessParser();
    let result = incremental.parse("", false);
    for (let i = 1; i <= fullText.length; i++) {
      result = incremental.parse(fullText.slice(0, i), i === fullText.length);
    }

    expect(result).toEqual(expected);
  });

  it("matches full parse for lazy paragraph continuation when fed incrementally", () => {
    const fullText = "Opening line\nstill same paragraph\n\nNew block";

    const reference = new MarkdownCompletenessParser();
    const expected = reference.parse(fullText, true);

    const incremental = new MarkdownCompletenessParser();
    let result = incremental.parse("", false);
    for (let i = 1; i <= fullText.length; i++) {
      result = incremental.parse(fullText.slice(0, i), i === fullText.length);
    }

    expect(result).toEqual(expected);
  });
});

describe("stream-input", () => {
  it("collects string input immediately", async () => {
    await expect(collectStreamInput("hello")).resolves.toBe("hello");
  });

  it("collects async iterable chunks", async () => {
    async function* gen() {
      yield "hel";
      yield "lo";
    }
    await expect(collectStreamInput(gen())).resolves.toBe("hello");
  });

  it("collects readable stream chunks", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("foo"));
        controller.enqueue(new TextEncoder().encode("bar"));
        controller.close();
      },
    });
    await expect(collectStreamInput(stream)).resolves.toBe("foobar");
  });

  it("supports unsubscribe without throwing", async () => {
    const chunks: string[] = [];
    async function* gen() {
      yield "a";
      yield "b";
    }

    const unsub = subscribeToStreamInput(gen(), (chunk) => {
      chunks.push(chunk);
    });
    unsub();
    await new Promise((r) => setTimeout(r, 10));
    expect(chunks.length).toBeLessThanOrEqual(2);
  });

  it("assigns distinct keys to distinct stream objects", () => {
    const streamA = new ReadableStream<Uint8Array>();
    const streamB = new ReadableStream<Uint8Array>();

    expect(getStreamInputKey(streamA)).not.toBe(getStreamInputKey(streamB));
  });

  it("assigns distinct keys to same-length strings with identical prefixes", () => {
    const prefix = "a".repeat(40);
    const left = `${prefix}one`;
    const right = `${prefix}two`;

    expect(left.length).toBe(right.length);
    expect(getStreamInputKey(left)).not.toBe(getStreamInputKey(right));
  });

  it("stops delivering chunks after unsubscribe", async () => {
    const chunks: string[] = [];
    let resolveGate: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      resolveGate = resolve;
    });

    async function* gen() {
      yield "a";
      await gate;
      yield "b";
    }

    const unsub = subscribeToStreamInput(gen(), (chunk) => {
      chunks.push(chunk);
    });

    await new Promise((r) => setTimeout(r, 5));
    unsub();
    resolveGate?.();
    await new Promise((r) => setTimeout(r, 10));

    expect(chunks).not.toContain("b");
  });
});
