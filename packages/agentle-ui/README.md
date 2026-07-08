<p align="center">
  <img alt="agentle ui" src="https://raw.githubusercontent.com/edvardhov/agentle-ui/main/assets/agentle-ui-light.svg" width="340" />
</p>

<p align="center"><strong>A gentle UI for chaotic AI streams.</strong></p>

Headless React hooks and copy-paste templates for AI-native presentation. Zero vendor lock-in — accepts raw strings or streams from any backend.

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

Or copy a styled template:

```tsx
import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

<MarkdownStabilizer content={streamOrString} />;
```

## Hooks

| Hook | Purpose |
|------|---------|
| `useStabilizedMarkdown` | Buffer incomplete markdown blocks to prevent layout shift |
| `useThoughtStream` | Show agent thinking steps instead of a spinner |
| `useActionState` | Track tool-call expansion and duration |
| `usePromptSurface` | Multi-line input with attachments and slash commands |

## CLI

```bash
npx agentle-ui init                        # Create agentle-ui.json + components/agentle/
npx agentle-ui add markdown-stabilizer     # Copy template files
npx agentle-ui add <component> --overwrite # Replace existing copied files
npx agentle-ui list                        # List available components
```

Available components: `markdown-stabilizer`, `thought-visualizer`, `action-card`, `prompt-surface`.

## Documentation

Full docs, live demos, and integration recipes: [github.com/edvardhov/agentle-ui](https://github.com/edvardhov/agentle-ui)

## License

MIT
