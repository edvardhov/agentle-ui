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
    selectedCommandIndex,
    activeCommand,
    handleKeyDown,
    submit,
  } = usePromptSurface({ commands, onSubmit, disabled });

  const paletteOpen = filteredCommands.length > 0;
  const activeDescendantId = paletteOpen && activeCommand
    ? `agentle-command-${activeCommand.name}`
    : undefined;

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
            role="combobox"
            aria-expanded={paletteOpen}
            aria-controls={paletteOpen ? "agentle-command-palette" : undefined}
            aria-activedescendant={activeDescendantId}
          />
          <div className="agentle-prompt__actions">
            <label className="agentle-prompt__attach" aria-label="Attach files" title="Attach files">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="agentle-prompt__attach-icon">
                <path
                  d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a1.5 1.5 0 1 1-2.12-2.12l8.49-8.48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="file"
                hidden
                multiple
                disabled={disabled}
                onChange={(event) => {
                  for (const file of Array.from(event.target.files ?? [])) {
                    addAttachment(file);
                  }
                  event.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              className="agentle-prompt__submit"
              onClick={submit}
              disabled={disabled || !text.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      {paletteOpen ? (
        <div id="agentle-command-palette">
          <CommandPalette commands={filteredCommands} selectedIndex={selectedCommandIndex} />
        </div>
      ) : null}
    </div>
  );
}
