<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/agentle-ui-dark.svg" />
    <img alt="agentle ui" src="assets/agentle-ui-light.svg" width="340" />
  </picture>
</p>

<p align="center"><strong>A gentle UI for chaotic AI streams.</strong></p>

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

<MarkdownStabilizer content={streamOrString} />;
```

## Pillars

| Component           | Status | Description                                                |
| ------------------- | ------ | ---------------------------------------------------------- |
| Markdown Stabilizer | v0.1   | Buffers incomplete markdown blocks to prevent layout shift |
| Thought Visualizer  | v0.5   | Shows what the agent is doing instead of a spinner         |
| Action Card         | v0.5   | Transparent tool-call UI for agentic actions               |
| Prompt Surface      | v0.5   | Multi-line input with attachments and slash commands       |

## Bundle size

Core hooks: **4.58 KB** gzipped (budget: 15 KB).

## Monorepo

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

- `packages/agentle-ui` — npm package (hooks, engines, CLI, registry templates)
- `apps/www` — documentation site with live demos

## Documentation

```bash
pnpm dev
```

Open the local docs site for getting started guides, API reference, CLI docs, and live demos for all four pillars.

## License

MIT
