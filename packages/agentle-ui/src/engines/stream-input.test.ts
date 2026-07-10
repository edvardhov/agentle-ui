import { describe, expect, it } from "vitest";
import {
  collectStreamInput,
  collectStreamSource,
  createStreamSource,
  getStreamSourceKey,
  subscribeToStreamSource,
} from "./stream-input";

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

  it("resolves createStreamSource through factory and keeps a stable key", async () => {
    let created = 0;
    const source = createStreamSource(() => {
      created += 1;
      return (async function* () {
        yield `branded-${created}`;
      })();
    });

    expect(getStreamSourceKey(source)).toBe(getStreamSourceKey(source));

    const first = await collectStreamSource(source);
    const second = await collectStreamSource(source);

    expect(first).toBe("branded-1");
    expect(second).toBe("branded-2");
  });

  it("propagates async iterable errors via listener", async () => {
    const boom = new Error("stream failed");

    const source = () =>
      (async function* () {
        yield "partial";
        throw boom;
      })();

    const errors: unknown[] = [];
    const unsubscribe = subscribeToStreamSource(source, (_chunk, done, error) => {
      if (error !== undefined) errors.push(error);
      if (done && error === undefined) unsubscribe();
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    expect(errors).toEqual([boom]);
  });

  it("propagates ReadableStream errors via listener", async () => {
    const boom = new Error("read failed");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("partial"));
        controller.error(boom);
      },
    });

    const errors: unknown[] = [];
    await new Promise<void>((resolve) => {
      subscribeToStreamSource(stream, (_chunk, done, error) => {
        if (error !== undefined) errors.push(error);
        if (done) resolve();
      });
    });

    expect(errors).toEqual([boom]);
  });

  it("rejects collectStreamInput when stream errors", async () => {
    const boom = new Error("collect failed");

    await expect(
      collectStreamInput(
        (async function* () {
          yield "x";
          throw boom;
        })(),
      ),
    ).rejects.toBe(boom);
  });
});
