<p align="center">
  <img alt="agentle ui" src="https://raw.githubusercontent.com/edvardhov/agentle-ui/main/assets/agentle-ui-light.svg" width="340" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agentle-ui"><img src="https://img.shields.io/npm/v/agentle-ui.svg" alt="npm version" /></a>
  <a href="https://github.com/edvardhov/agentle-ui/actions/workflows/ci.yml"><img src="https://github.com/edvardhov/agentle-ui/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="https://github.com/edvardhov/agentle-ui/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/agentle-ui.svg" alt="license" /></a>
  <a href="https://bundlephobia.com/package/agentle-ui"><img src="https://img.shields.io/badge/gzipped-5.34%20kB-blue" alt="bundle size" /></a>
</p>

<p align="center"><strong>A gentle UI for chaotic AI streams.</strong></p>

Headless React hooks and copy-paste templates for AI-native presentation. Zero vendor lock-in — accepts raw strings or streams from any backend.

**Node.js >= 18** · **React >= 18** · **ESM + CJS**

[Documentation](https://edvardhov.github.io/agentle-ui) · [npm](https://www.npmjs.com/package/agentle-ui) · [GitHub](https://github.com/edvardhov/agentle-ui)

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

## Streaming from fetch

Growing strings are **auto-detected** as live streams — incomplete blocks stay pending until tokens stop arriving.

```tsx
import { useState, useEffect } from "react";
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

export function StreamedAnswer({ url }: { url: string }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const response = await fetch(url, { signal: controller.signal });
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setContent((current) => current + decoder.decode(value, { stream: true }));
      }
    })();

    return () => controller.abort();
  }, [url]);

  return <MarkdownStabilizer content={content} />;
}
```

For manual control, pass `isComplete` or tune `settleMs` on the headless hook:

```tsx
import { useStabilizedMarkdown } from "agentle-ui";

const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content, {
  isComplete: false, // set true when your backend signals done
  settleMs: 32,      // auto-detect idle window (defaults to debounceMs)
});
```

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

- `collectStreamInput`, `getStreamInputKey`
- `parseThoughtJsonLine`, `mergeThoughtSteps`, `buildThoughtSummary`, `getActiveThoughtStep`, `isThoughtStreamComplete`

## Documentation

Full docs, live demos, and integration recipes: [edvardhov.github.io/agentle-ui](https://edvardhov.github.io/agentle-ui)

Package on npm: [npmjs.com/package/agentle-ui](https://www.npmjs.com/package/agentle-ui)

## License

MIT
