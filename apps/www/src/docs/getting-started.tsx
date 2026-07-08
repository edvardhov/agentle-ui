import { AnchorHeading } from "../components/docs/anchor-heading";
import { Callout } from "../components/docs/callout";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";

export function GettingStartedPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>Guide</Pill>
        <h1 className="doc-header__title">Getting Started</h1>
        <p className="doc-header__lead">
          Install the headless hooks via npm, initialize your project, and copy styled templates with
          the CLI.
        </p>
      </header>

      <AnchorHeading id="install" level={2}>
        Install
      </AnchorHeading>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`npm i agentle-ui
npx agentle-ui init
npx agentle-ui add markdown-stabilizer`}
      />

      <Callout title="Peer dependencies">
        agentle-ui requires <code>react</code> and <code>react-dom</code> (v18+). The markdown
        stabilizer template also installs <code>react-markdown</code> and <code>remark-gfm</code>.
      </Callout>

      <AnchorHeading id="headless-hook" level={2}>
        Headless hook
      </AnchorHeading>
      <p>Use hooks when you want full control over markup and styling.</p>
      <CodeBlock
        code={`import { useStabilizedMarkdown } from "agentle-ui";

export function Answer({ content, done }: { content: string; done: boolean }) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content, {
    isComplete: done,
  });

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
}`}
      />

      <AnchorHeading id="styled-template" level={2}>
        Styled template
      </AnchorHeading>
      <p>Copy a registry template into your repo and own the pixels.</p>
      <CodeBlock
        code={`import { MarkdownStabilizer } from "@/components/agentle/markdown-stabilizer";

<MarkdownStabilizer content={streamOrString} />`}
      />

      <AnchorHeading id="bundle-size" level={2}>
        Bundle size
      </AnchorHeading>
      <p>
        Core hooks ship at <strong>4.58 KB</strong> gzipped (budget: 15 KB). Styled templates are
        copied into your codebase and tree-shaken with your app.
      </p>
    </>
  );
}
