import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";
import { ThoughtVisualizerDemo } from "../components/demos/thought-visualizer-demo";

export function ThoughtVisualizerPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>v0.5</Pill>
        <h1 className="doc-header__title">Thought Visualizer</h1>
        <p className="doc-header__lead">
          Show users what the agent is doing — searching, reading, writing — instead of a static
          spinner.
        </p>
      </header>

      <ThoughtVisualizerDemo />

      <AnchorHeading id="install" level={2}>
        Install template
      </AnchorHeading>
      <CodeBlock language="bash" code="npx agentle-ui add thought-visualizer" />

      <AnchorHeading id="usage" level={2}>
        Usage
      </AnchorHeading>
      <CodeBlock
        code={`import { useThoughtStream } from "agentle-ui";

const { steps, activeStep, isComplete, summary } = useThoughtStream(thoughtStream);`}
      />

      <AnchorHeading id="hook-options" level={2}>
        useThoughtStream options
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "collapseOnComplete",
            type: "boolean",
            default: "true",
            description: "Collapse steps into a summary line when the stream completes.",
          },
          {
            name: "reducedMotion",
            type: "boolean",
            description: "Override prefers-reduced-motion detection.",
          },
        ]}
      />

      <AnchorHeading id="hook-returns" level={2}>
        Returns
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "steps", type: "ThoughtStep[]", description: "All parsed thought steps." },
          { name: "activeStep", type: "ThoughtStep | null", description: "Currently active step." },
          { name: "isComplete", type: "boolean", description: "True when the stream has finished." },
          { name: "summary", type: "string | null", description: "Collapsed summary when complete." },
          { name: "reducedMotion", type: "boolean", description: "Resolved reduced-motion preference." },
        ]}
      />

      <AnchorHeading id="template-props" level={2}>
        ThoughtVisualizer props
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "thoughts",
            type: "StreamInput | ThoughtStep[]",
            description: "NDJSON stream, string buffer, or static step array.",
          },
        ]}
      />
    </>
  );
}
