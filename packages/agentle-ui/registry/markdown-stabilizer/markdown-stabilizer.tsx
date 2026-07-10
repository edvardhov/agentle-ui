import { useStabilizedMarkdown, type StreamSource } from "agentle-ui";
import { BlockRenderer } from "./block-renderer";
import { BlockSkeleton } from "./block-skeleton";
import "./agentle.css";

export interface MarkdownStabilizerProps {
  content: StreamSource;
  isComplete?: boolean;
  settleMs?: number;
  onError?: (error: unknown) => void;
}

export function MarkdownStabilizer({ content, isComplete, settleMs, onError }: MarkdownStabilizerProps) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content, {
    isComplete,
    settleMs,
    onError,
  });

  return (
    <div
      className="agentle-markdown"
      data-streaming={isStreaming ? "true" : "false"}
      aria-live="polite"
      aria-busy={isStreaming}
    >
      {renderedBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
      {pendingBlocks.map((block) => (
        <BlockSkeleton key={block.id} type={block.type} />
      ))}
    </div>
  );
}
