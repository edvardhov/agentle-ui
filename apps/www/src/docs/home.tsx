import { Link } from "react-router-dom";
import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { MarkdownStabilizerDemo } from "../components/demos/markdown-stabilizer-demo";

const PILLARS = [
  {
    title: "Markdown Stabilizer",
    path: "/markdown-stabilizer",
    description: "Buffer incomplete markdown blocks to prevent layout shift during streaming.",
  },
  {
    title: "Thought Visualizer",
    path: "/thought-visualizer",
    description: "Show what the agent is doing instead of a generic spinner.",
  },
  {
    title: "Action Card",
    path: "/action-card",
    description: "Transparent, collapsible UI for agent tool calls.",
  },
  {
    title: "Prompt Surface",
    path: "/prompt-surface",
    description: "Multi-line input with attachments and slash commands.",
  },
];

export function HomePage() {
  return (
    <>
      <header className="doc-hero">
        <Pill>Presentation primitives for AI-native apps</Pill>
        <h1 className="doc-hero__title">A gentle UI for chaotic AI streams.</h1>
        <p className="doc-hero__lead">
          agentle-ui is the polish layer between raw model output and a calm, premium interface.
          Hooks accept strings or streams. Styled templates copy into your repo. React is the only
          peer dependency.
        </p>
        <div className="doc-hero__actions">
          <Link to="/getting-started" className="btn btn--primary">
            Get started
          </Link>
          <a
            href="https://github.com/edvardhov/agentle-ui"
            className="btn btn--ghost"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </header>

      <MarkdownStabilizerDemo compact autoStart />

      <AnchorHeading id="pillars" level={2}>
        Four pillars
      </AnchorHeading>
      <div className="pillar-grid">
        {PILLARS.map((pillar) => (
          <Link key={pillar.path} to={pillar.path} className="pillar-card">
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </Link>
        ))}
      </div>

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

      <AnchorHeading id="works-with" level={2}>
        Works with what you already use
      </AnchorHeading>
      <p className="doc-lead">
        Building on assistant-ui, the Vercel AI SDK, LangGraph, or your own SSE pipeline? Pass model
        output into agentle-ui hooks or copy the styled templates wherever you render responses. See{" "}
        <Link to="/recipes">integration recipes</Link> for source-specific glue, or the{" "}
        <Link to="/example">example chat</Link> for all four pillars composed.
      </p>
    </>
  );
}
