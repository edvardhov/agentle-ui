import { useStabilizedMarkdown, type StreamInput } from "agentle-ui";
import { BlockRenderer } from "./block-renderer";
import { BlockSkeleton } from "./block-skeleton";
import "./agentle.css";

export interface MarkdownStabilizerProps {
  content: StreamInput;
}

export function MarkdownStabilizer({ content }: MarkdownStabilizerProps) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content);

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
