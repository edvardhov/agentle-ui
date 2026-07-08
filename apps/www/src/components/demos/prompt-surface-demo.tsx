import { useMemo, useState } from "react";
import type { PromptAttachment, SlashCommand } from "agentle-ui";
import { PromptSurface } from "@registry/prompt-surface/prompt-surface";
import { CustomizePanel } from "../docs/customize-panel";
import { LiveDemo } from "../docs/live-demo";
import "@registry/shared/agentle.css";

interface CommandDef {
  name: string;
  description: string;
}

const DEFAULT_COMMANDS: CommandDef[] = [
  { name: "replay", description: "Replay the last agent session" },
  { name: "clear", description: "Clear the submission log" },
];

function createCommandDef(): CommandDef {
  return { name: "new-command", description: "Describe what this command does" };
}

export function PromptSurfaceDemo() {
  const [commandDefs, setCommandDefs] = useState<CommandDef[]>(DEFAULT_COMMANDS);
  const [lastSubmission, setLastSubmission] = useState<{
    text: string;
    attachments: PromptAttachment[];
  } | null>(null);
  const [commandLog, setCommandLog] = useState<string | null>(null);

  const commands = useMemo<SlashCommand[]>(
    () =>
      commandDefs.map((command) => ({
        name: command.name,
        description: command.description,
        action: () => {
          if (command.name === "clear") {
            setLastSubmission(null);
            setCommandLog("ran /clear");
            return;
          }
          if (command.name === "replay") {
            setCommandLog("ran /replay");
            return;
          }
          setCommandLog(`ran /${command.name}`);
        },
      })),
    [commandDefs],
  );

  const updateCommand = (index: number, patch: Partial<CommandDef>) => {
    setCommandDefs((current) =>
      current.map((command, commandIndex) =>
        commandIndex === index ? { ...command, ...patch } : command,
      ),
    );
  };

  const removeCommand = (index: number) => {
    setCommandDefs((current) => current.filter((_, commandIndex) => commandIndex !== index));
  };

  return (
    <LiveDemo
      title="Prompt input"
      description="Multi-line input with attachments and slash commands. Press Enter to send, Shift+Enter for newline."
      footer={
        <CustomizePanel>
          {commandDefs.map((command, index) => (
            <div className="field-row" key={`${index}-${command.name}`}>
              <input
                className="field-row__input"
                value={command.name}
                placeholder="Command name"
                onChange={(event) => updateCommand(index, { name: event.target.value })}
              />
              <input
                className="field-row__input"
                value={command.description}
                placeholder="Description"
                onChange={(event) => updateCommand(index, { description: event.target.value })}
              />
              <button
                type="button"
                className="field-row__remove"
                aria-label={`Remove command ${index + 1}`}
                onClick={() => removeCommand(index)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="customize__add"
            onClick={() => setCommandDefs((current) => [...current, createCommandDef()])}
          >
            Add command
          </button>
        </CustomizePanel>
      }
    >
      <div className="demo-panel demo-panel--prompt">
        <PromptSurface
          commands={commands}
          onSubmit={(text, attachments) => setLastSubmission({ text, attachments })}
        />
        {commandLog ? (
          <div className="prompt-log">
            <p className="prompt-log__label">Last command</p>
            <p className="prompt-log__text">{commandLog}</p>
          </div>
        ) : null}
        {lastSubmission ? (
          <div className="prompt-log">
            <p className="prompt-log__label">Last submission</p>
            <p className="prompt-log__text">{lastSubmission.text}</p>
            {lastSubmission.attachments.length > 0 ? (
              <p className="prompt-log__meta">
                {lastSubmission.attachments.length} attachment
                {lastSubmission.attachments.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </LiveDemo>
  );
}
