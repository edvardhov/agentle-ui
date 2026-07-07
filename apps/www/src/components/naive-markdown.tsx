import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NaiveMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

export function NaiveMarkdown({ content, isStreaming = false }: NaiveMarkdownProps) {
  return (
    <div className="pane-content naive">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      {isStreaming ? (
        <span className="streaming-cursor" aria-hidden="true">
          ▍
        </span>
      ) : null}
    </div>
  );
}
