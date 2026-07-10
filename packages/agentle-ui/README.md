<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/edvardhov/agentle-ui/main/assets/agentle-ui-dark.svg" />
    <img alt="agentle ui" src="https://raw.githubusercontent.com/edvardhov/agentle-ui/main/assets/agentle-ui-light.svg" width="340" />
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agentle-ui"><img src="https://img.shields.io/npm/v/agentle-ui.svg" alt="npm version" /></a>
  <a href="https://github.com/edvardhov/agentle-ui/actions/workflows/ci.yml"><img src="https://github.com/edvardhov/agentle-ui/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="https://github.com/edvardhov/agentle-ui/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/agentle-ui.svg" alt="license" /></a>
  <a href="https://bundlephobia.com/package/agentle-ui"><img src="https://img.shields.io/badge/gzipped-5.34%20kB-blue" alt="bundle size" /></a>
</p>

<p align="center"><strong>A gentle UI for chaotic AI streams.</strong></p>

<p align="center">
  Headless React hooks and copy-paste templates for AI-native presentation.<br />
  Stabilizes streaming markdown into stable blocks — not a typewriter or character-stream effect.<br />
  Zero vendor lock-in — accepts raw strings or streams from any backend.
</p>

<p align="center">
  <strong>Node.js &gt;= 18</strong> &nbsp;·&nbsp; <strong>React &gt;= 18</strong> &nbsp;·&nbsp; <strong>ESM + CJS</strong>
</p>

<p align="center">
  <a href="https://edvardhov.github.io/agentle-ui">Documentation</a>
  &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/agentle-ui">npm</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/edvardhov/agentle-ui">GitHub</a>
</p>

<br />

## Install

```bash
npm i agentle-ui
npx agentle-ui init
npx agentle-ui add markdown-stabilizer
```

## Quick start (styled template)

```tsx
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

export function Answer({ content }: { content: string }) {
  return <MarkdownStabilizer content={content} />;
}
```

The CLI copies `MarkdownStabilizer` plus `agentle.css`. Import the CSS once in your app entry or layout.

## Three input shapes

| Concern | Component / hook | What you pass |
|--------|------------------|---------------|
| Answer markdown | `MarkdownStabilizer` / `useStabilizedMarkdown` | Growing string or `StreamSource` of text |
| Thinking | `ThoughtVisualizer` / `useThoughtStream` | NDJSON thought lines or `ThoughtStep[]` |
| Tools | `ActionCard` / `useActionState` | `AgentAction[]` (app state, not a stream) |

Raw `delta.reasoning` tokens are not thought steps. SSE frames are not markdown. Map your backend to strings or NDJSON, or use the optional adapters below.

## Streaming (any backend)

Accumulate tokens into a growing string in your transport layer. Pass `isComplete` when your backend signals done — this is the production path.

```tsx
import { useState, useEffect } from "react";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

export function StreamedAnswer({ url }: { url: string }) {
  const [content, setContent] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setContent("");
    setDone(false);

    void (async () => {
      const response = await fetch(url, { signal: controller.signal });
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      while (true) {
        const { value, done: eof } = await reader.read();
        if (eof) break;
        setContent((current) => current + decoder.decode(value, { stream: true }));
      }
      setDone(true);
    })();

    return () => controller.abort();
  }, [url]);

  return <MarkdownStabilizer content={content} isComplete={done} />;
}
```

**Production guidance**

- Prefer **`isComplete`** when your transport has a done signal (SSE end, fetch complete, SDK `done` event).
- Use **`settleMs`** auto-settle only for firehose text with no explicit end event (demos, replays).
- Pass a **`StreamSource` factory** (`() => stream`) for live async iterables — creates a fresh stream per subscription (StrictMode-safe).

Headless control:

```tsx
import { useStabilizedMarkdown } from "agentle-ui";

const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content, {
  isComplete: done,
});
```

## OpenAI-compatible SSE (optional adapters)

Most real backends stream SSE JSON, not plain text. Use `parseSSE` / `openAIStreamToText` to extract text tokens first:

```tsx
import { openAIStreamToText } from "agentle-ui";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

export function AnswerFromSSE({ url }: { url: string }) {
  return (
    <MarkdownStabilizer
      content={() =>
        (async function* () {
          const res = await fetch(url);
          if (!res.body) return;
          yield* openAIStreamToText(res.body);
        })()
      }
    />
  );
}
```

For free-text `delta.reasoning`, use **`textToThoughtStep`** (generic bridge) or **`openAIReasoningToThoughts`** (OpenAI SSE sugar) with `ThoughtVisualizer`.

Dual-channel bodies (reasoning + content in one response): use **`splitReadableStream(body, 2)`** in a single owner effect, or route both deltas into two state strings in one fetch loop. Tee branches are single-consumption — do not attach two remounting hooks to split branches under StrictMode.

## Headless hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useStabilizedMarkdown` | `renderedBlocks`, `pendingBlocks`, `isStreaming`, `isComplete` | Buffer incomplete markdown blocks to prevent layout shift |
| `useThoughtStream` | `steps`, `activeStep`, `isComplete`, `summary`, `reducedMotion` | Show agent thinking steps instead of a spinner |
| `useActionState` | `actions`, `runningCount`, `toggleExpanded`, `isExpanded`, `formatDuration` | Track tool-call expansion and live duration |
| `usePromptSurface` | `text`, `setText`, `attachments`, `filteredCommands`, `handleKeyDown`, `submit`, … | Multi-line input with attachments and slash commands |

## CLI

```bash
npx agentle-ui init                        # Create agentle-ui.json + components/agentle/
npx agentle-ui add markdown-stabilizer     # Copy template files
npx agentle-ui add <component> --overwrite # Replace existing copied files
npx agentle-ui list                        # List available components
```

Available components: `markdown-stabilizer`, `thought-visualizer`, `action-card`, `prompt-surface`.

## Utilities

Also exported for custom integrations:

- `parseSSE`, `openAIStreamToText` — parse OpenAI-compatible SSE and extract `delta.content` or `delta.reasoning`
- `textToThoughtStep`, `openAIReasoningToThoughts` — map free-text reasoning into a single collapsible ThoughtStep (NDJSON)
- `splitReadableStream` — vendor-neutral `ReadableStream` fan-out via native `tee()`
- `collectStreamInput`, `collectStreamSource`, `getStreamInputKey`, `getStreamSourceKey`
- `parseThoughtJsonLine`, `mergeThoughtSteps`, `buildThoughtSummary`, `getActiveThoughtStep`, `isThoughtStreamComplete`

Stream hooks accept `StreamSource`: a string, stream, async iterable, or factory `() => stream` (StrictMode-safe).

## Documentation

Full docs, live demos, and integration recipes: [edvardhov.github.io/agentle-ui](https://edvardhov.github.io/agentle-ui)

Package on npm: [npmjs.com/package/agentle-ui](https://www.npmjs.com/package/agentle-ui)

## License

MIT
