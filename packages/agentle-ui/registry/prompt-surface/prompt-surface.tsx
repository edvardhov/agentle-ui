import { usePromptSurface, type SlashCommand } from "agentle-ui";
import { AttachmentBar } from "./attachment-bar";
import { CommandPalette } from "./command-palette";
import "./agentle.css";

export interface PromptSurfaceProps {
  commands?: SlashCommand[];
  disabled?: boolean;
  onSubmit?: (text: string, attachments: import("agentle-ui").PromptAttachment[]) => void;
}

export function PromptSurface({ commands, disabled, onSubmit }: PromptSurfaceProps) {
  const {
    text,
    setText,
    attachments,
    addAttachment,
    removeAttachment,
    filteredCommands,
    handleKeyDown,
    submit,
  } = usePromptSurface({ commands, onSubmit, disabled });

  return (
    <div className="agentle-prompt">
      <AttachmentBar attachments={attachments} onRemove={removeAttachment} />
      <div
        className="agentle-prompt__dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          for (const file of Array.from(event.dataTransfer.files)) {
            addAttachment(file);
          }
        }}
      >
        <div className="agentle-prompt__input-row">
          <textarea
            className="agentle-prompt__textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
          />
          <button
            type="button"
            className="agentle-prompt__submit"
            onClick={submit}
            disabled={disabled || !text.trim()}
          >
            Send
          </button>
        </div>
        <label className="agentle-prompt__attach">
          Attach
          <input
            type="file"
            hidden
            multiple
            onChange={(event) => {
              for (const file of Array.from(event.target.files ?? [])) {
                addAttachment(file);
              }
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {filteredCommands.length > 0 ? <CommandPalette commands={filteredCommands} /> : null}
    </div>
  );
}
