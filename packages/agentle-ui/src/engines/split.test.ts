import { describe, expect, it } from "vitest";
import { splitReadableStream } from "./split";

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) result += decoder.decode(value);
  }
  return result;
}

function makeStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

describe("splitReadableStream", () => {
  it("splits a stream into two identical branches", async () => {
    const [left, right] = splitReadableStream(makeStream("hello"), 2);

    const [leftText, rightText] = await Promise.all([readStream(left), readStream(right)]);

    expect(leftText).toBe("hello");
    expect(rightText).toBe("hello");
  });

  it("splits a stream into three identical branches", async () => {
    const [a, b, c] = splitReadableStream(makeStream("abc"), 3);

    const texts = await Promise.all([readStream(a), readStream(b), readStream(c)]);

    expect(texts).toEqual(["abc", "abc", "abc"]);
  });

  it("accepts a Response body", async () => {
    const response = new Response(makeStream("ok"));
    const [branch] = splitReadableStream(response, 1);

    expect(await readStream(branch)).toBe("ok");
  });

  it("throws when branches is less than 1", () => {
    expect(() => splitReadableStream(makeStream("x"), 0)).toThrow(RangeError);
  });
});
