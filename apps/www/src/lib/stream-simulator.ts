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
  if (nextChar === "\n") return 1;
  if (/[.,!?;:]/.test(nextChar)) return 1 + Math.floor(Math.random() * 2);
  if (nextChar === "|" || nextChar === "`") return 1 + Math.floor(Math.random() * 3);
  return 2 + Math.floor(Math.random() * 6);
}

function pickDelay(previousChar: string | undefined): number {
  if (!previousChar) return 20;
  if (previousChar === "\n") return 80 + Math.random() * 120;
  if (/[.,!?]/.test(previousChar)) return 60 + Math.random() * 80;
  if (previousChar === "|") return 40 + Math.random() * 60;
  return 15 + Math.random() * 35;
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
