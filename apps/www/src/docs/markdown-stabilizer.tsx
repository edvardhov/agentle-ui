import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";
import { MarkdownStabilizerDemo } from "../components/demos/markdown-stabilizer-demo";

const HOOK_OPTIONS = [
  {
    name: "debounceMs",
    type: "number",
    default: "16",
    description: "Frame-aligned paint debounce in milliseconds.",
  },
  {
    name: "flushOnComplete",
    type: "boolean",
    default: "true",
    description: "Flush incomplete blocks when the stream finishes.",
  },
  {
    name: "onBlockRendered",
    type: "(block: MarkdownBlock) => void",
    description: "Called once when a block first enters the rendered set.",
  },
  {
    name: "isComplete",
    type: "boolean",
    default: "true",
    description: "For string input, set false while tokens are still arriving.",
  },
];

const HOOK_RETURNS = [
  { name: "renderedBlocks", type: "MarkdownBlock[]", description: "Complete blocks ready to paint." },
  { name: "pendingBlocks", type: "MarkdownBlock[]", description: "Incomplete blocks shown as skeletons." },
  { name: "isStreaming", type: "boolean", description: "True while input is still arriving." },
  { name: "isComplete", type: "boolean", description: "True when the stream has finished." },
];

export function MarkdownStabilizerPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>v0.1</Pill>
        <h1 className="doc-header__title">Markdown Stabilizer</h1>
        <p className="doc-header__lead">
          Safely buffers incoming AI markdown and renders complete blocks only — preventing layout
          shift from broken code fences, tables, and lists.
        </p>
      </header>

      <MarkdownStabilizerDemo />

      <AnchorHeading id="install" level={2}>
        Install template
      </AnchorHeading>
      <CodeBlock language="bash" code="npx agentle-ui add markdown-stabilizer" />

      <AnchorHeading id="usage" level={2}>
        Usage
      </AnchorHeading>
      <CodeBlock
        code={`import { useStabilizedMarkdown } from "agentle-ui";

const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content, {
  isComplete: !isStreaming,
});`}
      />

      <AnchorHeading id="hook-options" level={2}>
        useStabilizedMarkdown options
      </AnchorHeading>
      <PropsTable rows={HOOK_OPTIONS} />

      <AnchorHeading id="hook-returns" level={2}>
        Returns
      </AnchorHeading>
      <PropsTable rows={HOOK_RETURNS} />

      <AnchorHeading id="template-props" level={2}>
        MarkdownStabilizer props
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "content",
            type: "StreamInput",
            description: "Markdown string, async generator, or ReadableStream.",
          },
        ]}
      />
    </>
  );
}
