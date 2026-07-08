import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";
import { ActionCardDemo } from "../components/demos/action-card-demo";

export function ActionCardPage() {
  return (
    <>
      <header className="doc-header">
        <Pill>v0.5</Pill>
        <h1 className="doc-header__title">Action Card</h1>
        <p className="doc-header__lead">
          Collapsible cards for agent tool calls — running, success, and error states with JSON
          input/output and duration formatting.
        </p>
      </header>

      <ActionCardDemo />

      <AnchorHeading id="install" level={2}>
        Install template
      </AnchorHeading>
      <CodeBlock language="bash" code="npx agentle-ui add action-card" />

      <AnchorHeading id="usage" level={2}>
        Usage
      </AnchorHeading>
      <CodeBlock
        code={`import { useActionState } from "agentle-ui";

const { actions, runningCount, toggleExpanded, isExpanded, formatDuration } =
  useActionState(agentActions);`}
      />

      <AnchorHeading id="hook-returns" level={2}>
        useActionState returns
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "actions", type: "AgentAction[]", description: "Actions with auto timestamps." },
          { name: "runningCount", type: "number", description: "Count of running actions." },
          { name: "toggleExpanded", type: "(id: string) => void", description: "Toggle card body." },
          { name: "isExpanded", type: "(id: string) => boolean", description: "Expanded state lookup." },
          { name: "formatDuration", type: "(action: AgentAction) => string", description: 'Returns "Nms" or "N.Ns".' },
        ]}
      />

      <AnchorHeading id="template-props" level={2}>
        ActionCard props
      </AnchorHeading>
      <PropsTable
        rows={[
          {
            name: "action",
            type: "AgentAction | AgentAction[]",
            description: "One or more agent actions to display.",
          },
        ]}
      />
    </>
  );
}
