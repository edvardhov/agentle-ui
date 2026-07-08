import type { SlashCommand } from "agentle-ui";

interface CommandPaletteProps {
  commands: SlashCommand[];
  selectedIndex: number;
}

export function CommandPalette({ commands, selectedIndex }: CommandPaletteProps) {
  return (
    <div className="agentle-prompt__palette" role="listbox">
      {commands.map((command, index) => (
        <button
          key={command.name}
          id={`agentle-command-${command.name}`}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          data-active={index === selectedIndex ? "true" : undefined}
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
