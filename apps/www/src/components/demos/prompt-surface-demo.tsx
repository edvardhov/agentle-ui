import { useState } from "react";
import type { PromptAttachment } from "agentle-ui";
import { PromptSurface } from "@registry/prompt-surface/prompt-surface";
import { LiveDemo } from "../docs/live-demo";
import "@registry/shared/agentle.css";

export function PromptSurfaceDemo() {
  const [lastSubmission, setLastSubmission] = useState<{
    text: string;
    attachments: PromptAttachment[];
  } | null>(null);

  return (
    <LiveDemo
      title="Prompt input"
      description="Multi-line input with attachments and slash commands. Press Enter to send, Shift+Enter for newline."
    >
      <div className="demo-panel demo-panel--prompt">
        <PromptSurface
          commands={[
            {
              name: "replay",
              description: "Replay the last agent session",
              action: () => setLastSubmission((current) => current),
            },
            {
              name: "clear",
              description: "Clear the submission log",
              action: () => setLastSubmission(null),
            },
          ]}
          onSubmit={(text, attachments) => setLastSubmission({ text, attachments })}
        />
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
