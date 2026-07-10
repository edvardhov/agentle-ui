export interface SSEMessage {
  event?: string;
  data: string;
}

export interface OpenAIStreamToTextOptions {
  /** Delta field to yield. Default: "content" */
  field?: "content" | "reasoning";
}

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

export async function* parseSSE(
  source: ReadableStream<Uint8Array> | Response,
): AsyncIterable<SSEMessage> {
  const stream = toReadableStream(source);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let event: string | undefined;
  let dataLines: string[] = [];

  const flush = (): SSEMessage | null => {
    if (dataLines.length === 0 && event === undefined) {
      return null;
    }
    const message: SSEMessage = {
      data: dataLines.join("\n"),
      ...(event !== undefined ? { event } : {}),
    };
    event = undefined;
    dataLines = [];
    return message;
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line === "") {
          const message = flush();
          if (message) {
            yield message;
          }
          continue;
        }

        if (line.startsWith(":")) {
          continue;
        }

        const colonIndex = line.indexOf(":");
        const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
        const rawValue = colonIndex === -1 ? "" : line.slice(colonIndex + 1);
        const valueText = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;

        if (field === "event") {
          event = valueText;
        } else if (field === "data") {
          dataLines.push(valueText);
        }
      }
    }

    if (buffer.trim()) {
      const colonIndex = buffer.indexOf(":");
      const field = colonIndex === -1 ? buffer : buffer.slice(0, colonIndex);
      const rawValue = colonIndex === -1 ? "" : buffer.slice(colonIndex + 1);
      const valueText = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;
      if (field === "event") {
        event = valueText;
      } else if (field === "data") {
        dataLines.push(valueText);
      }
    }

    const finalMessage = flush();
    if (finalMessage) {
      yield finalMessage;
    }
  } finally {
    reader.releaseLock();
  }
}

function extractOpenAIDelta(data: string, field: "content" | "reasoning"): string | null {
  if (data === "[DONE]") {
    return null;
  }

  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{ delta?: Record<string, unknown> }>;
    };
    const delta = parsed.choices?.[0]?.delta;
    if (!delta) return null;

    const value = delta[field];
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export async function* openAIStreamToText(
  source: ReadableStream<Uint8Array> | Response,
  options: OpenAIStreamToTextOptions = {},
): AsyncIterable<string> {
  const field = options.field ?? "content";

  for await (const message of parseSSE(source)) {
    const chunk = extractOpenAIDelta(message.data, field);
    if (chunk) {
      yield chunk;
    }
  }
}
