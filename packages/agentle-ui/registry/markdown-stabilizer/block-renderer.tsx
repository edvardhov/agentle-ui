import type { MarkdownBlock } from "agentle-ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlockRendererProps {
  block: MarkdownBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  return (
    <div className="agentle-markdown__block" data-block-type={block.type}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
    </div>
  );
}
