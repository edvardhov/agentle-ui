function toReadableStream(
  source: ReadableStream<Uint8Array> | Response,
): ReadableStream<Uint8Array> {
  if (typeof Response !== "undefined" && source instanceof Response) {
    if (!source.body) {
      throw new Error("Response has no body");
    }
    return source.body;
  }
  return source as ReadableStream<Uint8Array>;
}

export function splitReadableStream(
  source: ReadableStream<Uint8Array> | Response,
  branches = 2,
): ReadableStream<Uint8Array>[] {
  if (branches < 1) {
    throw new RangeError("branches must be at least 1");
  }

  const stream = toReadableStream(source);
  if (branches === 1) {
    return [stream];
  }

  const result: ReadableStream<Uint8Array>[] = [];
  let current = stream;

  for (let i = 0; i < branches - 1; i += 1) {
    const [left, right] = current.tee();
    result.push(left);
    current = right;
  }

  result.push(current);
  return result;
}
