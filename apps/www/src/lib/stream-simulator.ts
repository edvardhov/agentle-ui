export const DEMO_MARKDOWN = `# Streaming Markdown Demo

Here is a paragraph that arrives token by token, simulating a real LLM response with varied pacing.

## Feature Comparison

| Feature | Naive Render | agentle-ui |
| --- | --- | --- |
| Code blocks | Jumps mid-fence | Buffered until complete |
| Tables | Breaks on partial rows | Stable skeleton |
| Lists | Reflows constantly | Calm commits |

\`\`\`typescript
interface StreamResult {
  tokens: string[];
  stabilized: boolean;
}

export function summarize(input: StreamResult): string {
  return \`Received \${input.tokens.length} tokens\`;
}
\`\`\`

> agentle-ui buffers incomplete structures and only paints when visually complete.

- Zero layout shift during stream
- Works with any backend
- No vendor lock-in

---

**Try it:** press Replay to stream the same content side by side.
`;

const CHUNK_SIZE_NEWLINE = 1;
const CHUNK_SIZE_PUNCTUATION_MIN = 1;
const CHUNK_SIZE_PUNCTUATION_RANGE = 2;
const CHUNK_SIZE_PIPE_MIN = 1;
const CHUNK_SIZE_PIPE_RANGE = 3;
const CHUNK_SIZE_DEFAULT_MIN = 2;
const CHUNK_SIZE_DEFAULT_RANGE = 6;

const DELAY_INITIAL_MS = 20;
const DELAY_NEWLINE_MIN_MS = 80;
const DELAY_NEWLINE_RANGE_MS = 120;
const DELAY_SENTENCE_MIN_MS = 60;
const DELAY_SENTENCE_RANGE_MS = 80;
const DELAY_PIPE_MIN_MS = 40;
const DELAY_PIPE_RANGE_MS = 60;
const DELAY_DEFAULT_MIN_MS = 15;
const DELAY_DEFAULT_RANGE_MS = 35;

export async function* simulateTokenStream(
  text: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  let index = 0;

  while (index < text.length) {
    if (signal?.aborted) return;

    const chunkSize = pickChunkSize(text, index);
    yield text.slice(index, index + chunkSize);
    index += chunkSize;

    const delay = pickDelay(text[index - 1]);
    await sleep(delay, signal);
  }
}

function pickChunkSize(text: string, index: number): number {
  const nextChar = text[index] ?? " ";
  if (nextChar === "\n") return CHUNK_SIZE_NEWLINE;
  if (/[.,!?;:]/.test(nextChar)) {
    return CHUNK_SIZE_PUNCTUATION_MIN + Math.floor(Math.random() * CHUNK_SIZE_PUNCTUATION_RANGE);
  }
  if (nextChar === "|" || nextChar === "`") {
    return CHUNK_SIZE_PIPE_MIN + Math.floor(Math.random() * CHUNK_SIZE_PIPE_RANGE);
  }
  return CHUNK_SIZE_DEFAULT_MIN + Math.floor(Math.random() * CHUNK_SIZE_DEFAULT_RANGE);
}

function pickDelay(previousChar: string | undefined): number {
  if (!previousChar) return DELAY_INITIAL_MS;
  if (previousChar === "\n") return DELAY_NEWLINE_MIN_MS + Math.random() * DELAY_NEWLINE_RANGE_MS;
  if (/[.,!?]/.test(previousChar)) return DELAY_SENTENCE_MIN_MS + Math.random() * DELAY_SENTENCE_RANGE_MS;
  if (previousChar === "|") return DELAY_PIPE_MIN_MS + Math.random() * DELAY_PIPE_RANGE_MS;
  return DELAY_DEFAULT_MIN_MS + Math.random() * DELAY_DEFAULT_RANGE_MS;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
