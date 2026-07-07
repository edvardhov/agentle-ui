import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NaiveMarkdownProps {
  content: string;
}

export function NaiveMarkdown({ content }: NaiveMarkdownProps) {
  return (
    <div className="pane-content naive">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      <span className="streaming-cursor" aria-hidden="true">
        ▍
      </span>
    </div>
  );
}
