import type { StreamFactory, StreamInput, StreamSource } from "../types";

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export type StreamUnsubscribe = () => void;
export type StreamListener = (chunk: string, done: boolean) => void;

const textDecoder = new TextDecoder();
let streamObjectIdCounter = 0;
const streamObjectIds = new WeakMap<object, number>();

function getStreamObjectId(value: object): number {
  let id = streamObjectIds.get(value);
  if (id === undefined) {
    id = ++streamObjectIdCounter;
    streamObjectIds.set(value, id);
  }
  return id;
}

export function isStreamFactory(value: StreamSource): value is StreamFactory {
  return typeof value === "function";
}

export function resolveStreamSource(source: StreamSource): StreamInput {
  return isStreamFactory(source) ? source() : source;
}

export function subscribeToStreamSource(
  source: StreamSource,
  listener: StreamListener,
): StreamUnsubscribe {
  return subscribeToStreamInput(resolveStreamSource(source), listener);
}

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

export function getStreamSourceKey(source: StreamSource): string {
  if (isStreamFactory(source)) {
    return `factory:${getStreamObjectId(source)}`;
  }
  return getStreamInputKey(source);
}

export function getStreamInputKey(input: StreamInput): string {
  if (typeof input === "string") {
    return `string:${input.length}:${hashString(input)}`;
  }
  if (isReadableStream(input)) {
    return `stream:readable:${getStreamObjectId(input)}`;
  }
  return `stream:async:${getStreamObjectId(input)}`;
}

export function isReadableStream(value: StreamInput): value is ReadableStream<Uint8Array> {
  return typeof value === "object" && value !== null && "getReader" in value;
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

export async function collectStreamSource(source: StreamSource): Promise<string> {
  return collectStreamInput(resolveStreamSource(source));
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
