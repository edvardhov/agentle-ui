import type { SlashCommand } from "agentle-ui";

interface CommandPaletteProps {
  commands: SlashCommand[];
}

export function CommandPalette({ commands }: CommandPaletteProps) {
  return (
    <div className="agentle-prompt__palette" role="listbox">
      {commands.map((command) => (
        <button
          key={command.name}
          type="button"
          className="agentle-prompt__command"
          onClick={command.action}
        >
          <span className="agentle-prompt__command-name">/{command.name}</span>
          <span className="agentle-prompt__command-desc">{command.description}</span>
        </button>
      ))}
    </div>
  );
}
