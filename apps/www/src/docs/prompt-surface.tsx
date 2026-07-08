import { AnchorHeading } from "../components/docs/anchor-heading";
import { CodeBlock } from "../components/docs/code-block";
import { Pill } from "../components/docs/pill";
import { PropsTable } from "../components/docs/props-table";
import { PromptSurfaceDemo } from "../components/demos/prompt-surface-demo";

export function PromptSurfacePage() {
  return (
    <>
      <header className="doc-header">
        <Pill>v0.5</Pill>
        <h1 className="doc-header__title">Prompt Surface</h1>
        <p className="doc-header__lead">
          Multi-line prompt input with file attachments, drag-and-drop, and slash commands.
        </p>
      </header>

      <PromptSurfaceDemo />

      <AnchorHeading id="install" level={2}>
        Install template
      </AnchorHeading>
      <CodeBlock language="bash" code="npx agentle-ui add prompt-surface" />

      <AnchorHeading id="usage" level={2}>
        Usage
      </AnchorHeading>
      <CodeBlock
        code={`import { usePromptSurface } from "agentle-ui";

const { text, setText, attachments, submit, handleKeyDown, filteredCommands } =
  usePromptSurface({ commands, onSubmit });`}
      />

      <AnchorHeading id="hook-options" level={2}>
        usePromptSurface options
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "commands", type: "SlashCommand[]", default: "[]", description: "Available slash commands." },
          { name: "maxAttachments", type: "number", default: "5", description: "Maximum file attachments." },
          { name: "maxFileSize", type: "number", default: "5242880", description: "Max file size in bytes (5 MiB)." },
          { name: "onSubmit", type: "(text, attachments) => void", description: "Called on submit." },
          { name: "disabled", type: "boolean", default: "false", description: "Disable input and submit." },
        ]}
      />

      <AnchorHeading id="hook-returns" level={2}>
        Returns
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "text", type: "string", description: "Current input value." },
          { name: "setText", type: "(value: string) => void", description: "Update text; detects slash commands." },
          { name: "attachments", type: "PromptAttachment[]", description: "Attached files." },
          { name: "addAttachment", type: "(file: File) => void", description: "Add a file attachment." },
          { name: "removeAttachment", type: "(id: string) => void", description: "Remove attachment by id." },
          { name: "submit", type: "() => void", description: "Submit trimmed text and attachments." },
          { name: "handleKeyDown", type: "KeyboardEvent handler", description: "Enter to submit, Escape to dismiss palette." },
          { name: "filteredCommands", type: "SlashCommand[]", description: "Commands matching current slash query." },
          { name: "activeCommand", type: "SlashCommand | null", description: "First matching slash command." },
        ]}
      />

      <AnchorHeading id="template-props" level={2}>
        PromptSurface props
      </AnchorHeading>
      <PropsTable
        rows={[
          { name: "commands", type: "SlashCommand[]", description: "Slash commands for the palette." },
          { name: "disabled", type: "boolean", description: "Disable the surface." },
          { name: "onSubmit", type: "(text, attachments) => void", description: "Submit handler." },
        ]}
      />
    </>
  );
}
