<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/agentle-ui-dark.svg" />
    <img alt="agentle ui" src="assets/agentle-ui-light.svg" width="340" />
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

| Component | Description |
| --- | --- |
| Markdown Stabilizer | Buffers incomplete markdown blocks to prevent layout shift |
| Thought Visualizer | Shows what the agent is doing instead of a spinner |
| Action Card | Transparent tool-call UI for agentic actions |
| Prompt Surface | Multi-line input with attachments and slash commands |

## Bundle size

Core hooks: **5.34 KB** gzipped, under a **15 KB** CI budget (`size-limit`).

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

Live docs, demos, and integration recipes: [edvardhov.github.io/agentle-ui](https://edvardhov.github.io/agentle-ui)

Package on npm: [npmjs.com/package/agentle-ui](https://www.npmjs.com/package/agentle-ui)

For local development:

```bash
pnpm dev
```

## License

MIT
