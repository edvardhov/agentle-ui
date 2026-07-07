export type StreamInput = string | AsyncIterable<string> | ReadableStream<Uint8Array>;

export type BlockStatus = "incomplete" | "complete" | "stable";

export type MarkdownBlockType =
  | "paragraph"
  | "heading"
  | "code_fence"
  | "table"
  | "list"
  | "blockquote"
  | "thematic_break"
  | "html";

export interface MarkdownBlock {
  id: string;
  type: MarkdownBlockType;
  content: string;
  status: BlockStatus;
  startOffset: number;
  endOffset: number;
}
