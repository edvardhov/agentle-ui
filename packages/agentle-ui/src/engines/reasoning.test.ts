import { describe, expect, it } from "vitest";
import { parseThoughtJsonLine } from "./thought-parser";
import { openAIReasoningToThoughts, textToThoughtStep } from "./reasoning";

async function collect(iterable: AsyncIterable<string>): Promise<string[]> {
  const lines: string[] = [];
  for await (const line of iterable) {
    lines.push(line);
  }
  return lines;
}

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe("textToThoughtStep", () => {
  it("yields active lines per token and a final complete line", async () => {
    async function* source() {
      yield "Let";
      yield " me";
      yield " think";
    }

    const lines = await collect(textToThoughtStep(source()));

    expect(lines).toHaveLength(4);
    expect(parseThoughtJsonLine(lines[0]!)).toMatchObject({
      id: "reasoning",
      label: "Thinking…",
      status: "active",
      detail: "Let",
    });
    expect(parseThoughtJsonLine(lines[2]!)).toMatchObject({
      status: "active",
      detail: "Let me think",
    });
    expect(parseThoughtJsonLine(lines[3]!)).toMatchObject({
      id: "reasoning",
      label: "Thought process",
      status: "complete",
      detail: "Let me think",
    });
  });

  it("emits nothing for an empty stream", async () => {
    async function* source() {
      // no tokens
    }

    const lines = await collect(textToThoughtStep(source()));
    expect(lines).toEqual([]);
  });

  it("respects custom labels and ids", async () => {
    async function* source() {
      yield "x";
    }

    const lines = await collect(
      textToThoughtStep(source(), {
        id: "r1",
        label: "Working…",
        completedLabel: "Done thinking",
      }),
    );

    expect(parseThoughtJsonLine(lines[0]!)).toMatchObject({
      id: "r1",
      label: "Working…",
      status: "active",
    });
    expect(parseThoughtJsonLine(lines[1]!)).toMatchObject({
      id: "r1",
      label: "Done thinking",
      status: "complete",
    });
  });
});

describe("openAIReasoningToThoughts", () => {
  it("maps reasoning SSE deltas to NDJSON thought lines", async () => {
    const stream = makeStream([
      'data: {"choices":[{"delta":{"reasoning":"Hel"}}]}\n\n',
      'data: {"choices":[{"delta":{"reasoning":"lo"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);

    const lines = await collect(openAIReasoningToThoughts(stream));

    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(parseThoughtJsonLine(lines[0]!)).toMatchObject({
      status: "active",
      detail: "Hel",
    });
    expect(parseThoughtJsonLine(lines.at(-1)!)).toMatchObject({
      status: "complete",
      detail: "Hello",
    });
  });
});
