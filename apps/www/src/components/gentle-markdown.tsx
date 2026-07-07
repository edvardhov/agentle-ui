import { useStabilizedMarkdown, type StreamInput } from "agentle-ui";
import { BlockRenderer } from "./agentle/block-renderer";
import { BlockSkeleton } from "./agentle/block-skeleton";
import "./agentle/agentle.css";

interface GentleMarkdownProps {
  content: StreamInput;
}

export function GentleMarkdown({ content }: GentleMarkdownProps) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content);

  return (
    <div
      className="pane-content agentle-markdown"
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
