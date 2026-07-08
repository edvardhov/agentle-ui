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

const DELAY_INITIAL_MS = 20;
const DELAY_NEWLINE_MS = 120;
const DELAY_SENTENCE_MS = 80;
const DELAY_PIPE_MS = 50;
const DELAY_DEFAULT_MS = 25;

/**
 * Yields word-sized tokens (never splits mid-word) so markdown syntax like
 * "# Streaming" is not broken into "# S" + "treaming", which produces
 * garbled headings such as "S# Streaming..." on naive re-parse.
 */
export async function* simulateTokenStream(
  text: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const lines = text.split("\n");
  let isFirstToken = true;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    if (signal?.aborted) return;

    const line = lines[lineIndex] ?? "";
    const tokens = line.match(/\S+\s*/g);

    if (tokens) {
      for (const token of tokens) {
        if (signal?.aborted) return;
        yield token;
        const delay = isFirstToken ? DELAY_INITIAL_MS : pickDelay(token.at(-1));
        isFirstToken = false;
        await sleep(delay, signal);
      }
    }

    if (lineIndex < lines.length - 1) {
      yield "\n";
      await sleep(DELAY_NEWLINE_MS, signal);
    }
  }
}

function pickDelay(previousChar: string | undefined): number {
  if (!previousChar) return DELAY_DEFAULT_MS;
  if (previousChar === "\n") return DELAY_NEWLINE_MS;
  if (/[.,!?]/.test(previousChar)) return DELAY_SENTENCE_MS;
  if (previousChar === "|") return DELAY_PIPE_MS;
  return DELAY_DEFAULT_MS;
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
