import { describe, expect, it } from "vitest";
import { openAIStreamToText, parseSSE } from "./sse";

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encode(chunk));
      }
      controller.close();
    },
  });
}

describe("parseSSE", () => {
  it("parses event and data fields across blank-line boundaries", async () => {
    const stream = makeStream([
      "event: message\n",
      "data: hello\n",
      "\n",
      "data: world\n\n",
    ]);

    const messages = await collect(parseSSE(stream));

    expect(messages).toEqual([
      { event: "message", data: "hello" },
      { data: "world" },
    ]);
  });

  it("joins multi-line data fields", async () => {
    const stream = makeStream(["data: line1\n", "data: line2\n\n"]);

    const messages = await collect(parseSSE(stream));

    expect(messages).toEqual([{ data: "line1\nline2" }]);
  });

  it("ignores comment lines", async () => {
    const stream = makeStream([": ping\n", "data: ok\n\n"]);

    const messages = await collect(parseSSE(stream));

    expect(messages).toEqual([{ data: "ok" }]);
  });
});

describe("openAIStreamToText", () => {
  it("yields content deltas and skips [DONE]", async () => {
    const stream = makeStream([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);

    const text = await collect(openAIStreamToText(stream));

    expect(text).toEqual(["Hel"]);
  });

  it("yields reasoning deltas when field is reasoning", async () => {
    const reasoningStream = makeStream([
      'data: {"choices":[{"delta":{"reasoning":"Thinking"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Answer"}}]}\n\n',
    ]);
    const contentStream = makeStream([
      'data: {"choices":[{"delta":{"reasoning":"Thinking"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Answer"}}]}\n\n',
    ]);

    const reasoning = await collect(openAIStreamToText(reasoningStream, { field: "reasoning" }));
    const content = await collect(openAIStreamToText(contentStream, { field: "content" }));

    expect(reasoning).toEqual(["Thinking"]);
    expect(content).toEqual(["Answer"]);
  });

  it("ignores malformed frames", async () => {
    const stream = makeStream([
      "data: not-json\n\n",
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
    ]);

    const text = await collect(openAIStreamToText(stream));

    expect(text).toEqual(["ok"]);
  });
});
