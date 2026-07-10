export type StreamInput = string | AsyncIterable<string> | ReadableStream<Uint8Array>;

export type StreamFactory = () => Exclude<StreamInput, string>;

export type StreamSource = StreamInput | StreamFactory;

export const BLOCK_STATUSES = ["incomplete", "complete", "stable"] as const;
export type BlockStatus = (typeof BLOCK_STATUSES)[number];

export const MARKDOWN_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "code_fence",
  "table",
  "list",
  "blockquote",
  "thematic_break",
  "html",
] as const;
export type MarkdownBlockType = (typeof MARKDOWN_BLOCK_TYPES)[number];

export interface MarkdownBlock {
  id: string;
  type: MarkdownBlockType;
  content: string;
  status: BlockStatus;
  startOffset: number;
  endOffset: number;
}

export const THOUGHT_STEP_STATUSES = ["active", "complete", "error"] as const;
export type ThoughtStepStatus = (typeof THOUGHT_STEP_STATUSES)[number];

export interface ThoughtStep {
  id: string;
  label: string;
  detail?: string;
  status: ThoughtStepStatus;
}

export const AGENT_ACTION_STATUSES = ["running", "success", "error"] as const;
export type AgentActionStatus = (typeof AGENT_ACTION_STATUSES)[number];

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
