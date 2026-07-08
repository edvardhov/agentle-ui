import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";

export function CliPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>Reference</Pill>
        <h1 className="doc-header__title">CLI</h1>
        <p className="doc-header__lead">
          Initialize your project and copy styled component templates into your codebase.
        </p>
      </header>

      <AnchorHeading id="init" level={2}>
        init
      </AnchorHeading>
      <CodeBlock language="bash" code="npx agentle-ui init" />
      <p>
        Creates <code>agentle-ui.json</code> and a <code>components/agentle/</code> directory in
        your project root.
      </p>

      <AnchorHeading id="add" level={2}>
        add
      </AnchorHeading>
      <CodeBlock language="bash" code="npx agentle-ui add markdown-stabilizer" />
      <p>Copies template files to your project and installs component dependencies.</p>

      <AnchorHeading id="components" level={2}>
        Available components
      </AnchorHeading>
      <PropsTable
        title="Registry components"
        rows={[
          { name: "markdown-stabilizer", type: "component", description: "Buffered markdown rendering + react-markdown." },
          { name: "thought-visualizer", type: "component", description: "Agent thought step UI with collapse summary." },
          { name: "action-card", type: "component", description: "Tool call cards with JSON blocks." },
          { name: "prompt-surface", type: "component", description: "Prompt input with attachments and slash commands." },
        ]}
      />

      <AnchorHeading id="config" level={2}>
        agentle-ui.json
      </AnchorHeading>
      <CodeBlock
        language="json"
        filename="agentle-ui.json"
        code={`{
  "$schema": "./schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`}
      />
    </>
  );
}
