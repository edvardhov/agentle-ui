import { describe, expect, it } from "vitest";
import { collectStreamSource, getStreamSourceKey, subscribeToStreamSource } from "./stream-input";

describe("stream-input factories", () => {
  it("creates a fresh stream on each subscription", async () => {
    let created = 0;

    const source = () => {
      created += 1;
      return (async function* () {
        yield `chunk-${created}`;
      })();
    };

    const first = await collectStreamSource(source);
    const second = await collectStreamSource(source);

    expect(first).toBe("chunk-1");
    expect(second).toBe("chunk-2");
  });

  it("keeps a stable key for the same factory reference", () => {
    const source = () =>
      (async function* () {
        yield "x";
      })();

    expect(getStreamSourceKey(source)).toBe(getStreamSourceKey(source));
  });

  it("delivers output when subscribed twice sequentially", async () => {
    const source = () =>
      (async function* () {
        yield "hello";
      })();

    const chunks: string[] = [];
    const unsubscribeFirst = subscribeToStreamSource(source, (chunk) => {
      if (chunk) chunks.push(`first:${chunk}`);
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribeFirst();

    const unsubscribeSecond = subscribeToStreamSource(source, (chunk) => {
      if (chunk) chunks.push(`second:${chunk}`);
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribeSecond();

    expect(chunks).toEqual(["first:hello", "second:hello"]);
  });
});
