import type { StreamInput } from "../types";

export type StreamUnsubscribe = () => void;
export type StreamListener = (chunk: string, done: boolean) => void;

const textDecoder = new TextDecoder();

export function subscribeToStreamInput(
  input: StreamInput,
  listener: StreamListener,
): StreamUnsubscribe {
  let cancelled = false;

  if (typeof input === "string") {
    listener(input, true);
    return () => {
      cancelled = true;
    };
  }

  if (isReadableStream(input)) {
    void consumeReadableStream(input, listener, () => cancelled);
    return () => {
      cancelled = true;
    };
  }

  void consumeAsyncIterable(input, listener, () => cancelled);
  return () => {
    cancelled = true;
  };
}

async function consumeReadableStream(
  stream: ReadableStream<Uint8Array>,
  listener: StreamListener,
  isCancelled: () => boolean,
): Promise<void> {
  const reader = stream.getReader();
  try {
    while (!isCancelled()) {
      const { value, done } = await reader.read();
      if (isCancelled()) return;
      if (value) {
        listener(textDecoder.decode(value, { stream: !done }), false);
      }
      if (done) {
        listener("", true);
        return;
      }
    }
  } catch {
    if (!isCancelled()) {
      listener("", true);
    }
  } finally {
    reader.releaseLock();
  }
}

async function consumeAsyncIterable(
  iterable: AsyncIterable<string>,
  listener: StreamListener,
  isCancelled: () => boolean,
): Promise<void> {
  try {
    for await (const chunk of iterable) {
      if (isCancelled()) return;
      listener(chunk, false);
    }
    if (!isCancelled()) {
      listener("", true);
    }
  } catch {
    if (!isCancelled()) {
      listener("", true);
    }
  }
}

function isReadableStream(value: StreamInput): value is ReadableStream<Uint8Array> {
  return typeof value === "object" && value !== null && "getReader" in value;
}

export async function collectStreamInput(input: StreamInput): Promise<string> {
  if (typeof input === "string") {
    return input;
  }

  let result = "";
  return new Promise((resolve) => {
    subscribeToStreamInput(input, (chunk, done) => {
      result += chunk;
      if (done) {
        resolve(result);
      }
    });
  });
}
