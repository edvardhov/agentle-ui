import { Link } from "react-router-dom";
import { AnchorHeading } from "../components/docs/anchor-heading";
import { Callout } from "../components/docs/callout";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";

const PILLARS = [
  {
    title: "Markdown Stabilizer",
    path: "/markdown-stabilizer",
    hook: "useStabilizedMarkdown",
    template: "markdown-stabilizer",
    component: "MarkdownStabilizer",
  },
  {
    title: "Thought Visualizer",
    path: "/thought-visualizer",
    hook: "useThoughtStream",
    template: "thought-visualizer",
    component: "ThoughtVisualizer",
  },
  {
    title: "Action Card",
    path: "/action-card",
    hook: "useActionState",
    template: "action-card",
    component: "ActionCard",
  },
  {
    title: "Prompt Surface",
    path: "/prompt-surface",
    hook: "usePromptSurface",
    template: "prompt-surface",
    component: "PromptSurface",
  },
] as const;

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

      <AnchorHeading id="hooks" level={2}>
        Hooks
      </AnchorHeading>
      <p>
        Use hooks when you want full control over markup and styling. Each pillar has a headless hook
        — see the <Link to="/api-reference#hooks">API reference</Link> for full signatures. For
        wiring real model output into these hooks, see{" "}
        <Link to="/recipes">Integration recipes</Link>.
      </p>
      <ul>
        {PILLARS.map((pillar) => (
          <li key={pillar.hook}>
            <code>{pillar.hook}</code> —{" "}
            <Link to={pillar.path}>{pillar.title}</Link>
          </li>
        ))}
      </ul>
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

      <AnchorHeading id="templates" level={2}>
        Templates
      </AnchorHeading>
      <p>
        Copy a styled registry template into your repo with the CLI, then own the pixels. Each
        component page covers install, usage, and live demos. For a composed agent screen using all
        four templates, see the <Link to="/example">Example chat</Link>.
      </p>
      <ul>
        {PILLARS.map((pillar) => (
          <li key={pillar.template}>
            <code>npx agentle-ui add {pillar.template}</code> →{" "}
            <Link to={pillar.path}>{pillar.component}</Link>
          </li>
        ))}
      </ul>
      <p>
        Learn more in the <Link to="/cli">CLI reference</Link>.
      </p>
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
