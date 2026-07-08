import { useStabilizedMarkdown } from "agentle-ui";
import { BlockRenderer } from "@registry/markdown-stabilizer/block-renderer";
import { BlockSkeleton } from "@registry/markdown-stabilizer/block-skeleton";
import "@registry/shared/agentle.css";

interface GentleMarkdownProps {
  content: string;
  isComplete: boolean;
}

export function GentleMarkdown({ content, isComplete }: GentleMarkdownProps) {
  const { renderedBlocks, pendingBlocks, isStreaming } = useStabilizedMarkdown(content, {
    isComplete,
  });

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
