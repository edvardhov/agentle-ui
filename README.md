# agentle-ui

**A gentle UI for chaotic AI streams.**

Presentation primitives for AI-native applications. Zero vendor lock-in.

`agentle-ui` is the polish layer between chaotic AI output and a calm, premium UI. It does not manage chat state, model routing, or backends. It accepts raw strings or streams and makes them feel stable.

## Install

```bash
npm i agentle-ui
npx agentle-ui init
npx agentle-ui add markdown-stabilizer
```

## Quick start

```tsx
import { useStabilizedMarkdown } from "agentle-ui";

export function Answer({ content }: { content: string }) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content);

  return (
    <div data-streaming={isStreaming}>
      {renderedBlocks.map((block) => (
        <div key={block.id}>{block.content}</div>
      ))}
      {pendingBlocks.map((block) => (
        <div key={block.id} aria-hidden="true" />
      ))}
    </div>
  );
}
```

Or copy the styled template:

```tsx
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

<MarkdownStabilizer content={streamOrString} />
```

## Pillars

| Component           | Status  | Description                                                |
| ------------------- | ------- | ---------------------------------------------------------- |
| Markdown Stabilizer | v0.1    | Buffers incomplete markdown blocks to prevent layout shift |
| Thought Visualizer  | planned | Shows what the agent is doing instead of a spinner         |
| Action Card         | planned | Transparent tool-call UI for agentic actions               |
| Prompt Surface      | planned | Multi-line input with attachments and slash commands       |

## Works with what you already use

Building on [assistant-ui](https://github.com/assistant-ui/assistant-ui), the Vercel AI SDK, LangGraph, or your own SSE pipeline? `agentle-ui` handles the presentation layer — stable markdown, visible agent activity, tool transparency, and prompt input.

Use it wherever you already render model output. Pass strings or streams into the hooks or copy the styled templates. React is the only peer dependency.

## Bundle size

Core hooks: **2.54 KB** gzipped (budget: 15 KB).

## Monorepo

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

- `packages/agentle-ui` — npm package (hooks, engines, CLI)
- `packages/registry` — component templates
- `apps/www` — jank vs gentle demo site

## Demo

```bash
pnpm dev
```

Open the local Vite app to compare naive markdown rendering against stabilized rendering with live layout-shift counters.

## License

MIT
