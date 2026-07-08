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

export type ThoughtStepStatus = "active" | "complete" | "error";

export interface ThoughtStep {
  id: string;
  label: string;
  detail?: string;
  status: ThoughtStepStatus;
}

export type AgentActionStatus = "running" | "success" | "error";

export interface AgentAction {
  id: string;
  name: string;
  status: AgentActionStatus;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface PromptAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

export interface SlashCommand {
  name: string;
  description: string;
  action: () => void;
}
