import type { MarkdownBlock } from "agentle-ui";

interface BlockSkeletonProps {
  type: MarkdownBlock["type"];
}

export function BlockSkeleton({ type }: BlockSkeletonProps) {
  const className = [
    "agentle-skeleton",
    type === "code_fence" ? "agentle-skeleton--code" : "",
    type === "table" ? "agentle-skeleton--table" : "",
    type === "heading" ? "agentle-skeleton--heading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className} aria-hidden="true" role="presentation" />;
}
