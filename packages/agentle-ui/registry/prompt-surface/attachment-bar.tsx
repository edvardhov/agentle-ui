import type { PromptAttachment } from "agentle-ui";

interface AttachmentBarProps {
  attachments: PromptAttachment[];
  onRemove: (id: string) => void;
}

export function AttachmentBar({ attachments, onRemove }: AttachmentBarProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="agentle-prompt__attachments">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="agentle-prompt__attachment">
          {attachment.preview ? (
            <img src={attachment.preview} alt={attachment.name} className="agentle-prompt__preview" />
          ) : (
            <span className="agentle-prompt__file">{attachment.name}</span>
          )}
          <button
            type="button"
            className="agentle-prompt__remove"
            onClick={() => onRemove(attachment.id)}
            aria-label={`Remove ${attachment.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
