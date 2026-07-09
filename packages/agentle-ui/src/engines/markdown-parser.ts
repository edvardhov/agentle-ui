import {
  CODE_FENCE_CLOSE_COUNT,
  MAX_HEADING_LEVEL,
  TABLE_MIN_ROWS,
  THEMATIC_BREAK_MIN_CHARS,
} from "../constants";
import type { BlockStatus, MarkdownBlock, MarkdownBlockType } from "../types";

const HEADING_PATTERN = new RegExp(`^#{1,${MAX_HEADING_LEVEL}}\\s`);
const THEMATIC_BREAK_PATTERN = new RegExp(
  `^(-{${THEMATIC_BREAK_MIN_CHARS},}|_{${THEMATIC_BREAK_MIN_CHARS},}|\\*{${THEMATIC_BREAK_MIN_CHARS},})$`,
);

function blockId(type: MarkdownBlockType, startOffset: number): string {
  return `${type}:${startOffset}`;
}

interface ParseState {
  blocks: MarkdownBlock[];
  parsedUpTo: number;
}

export class MarkdownCompletenessParser {
  private state: ParseState = { blocks: [], parsedUpTo: 0 };
  private lastText = "";
  private lastStreamComplete: boolean | null = null;

  reset(): void {
    this.state = { blocks: [], parsedUpTo: 0 };
    this.lastText = "";
    this.lastStreamComplete = null;
  }

  parse(text: string, streamComplete = false): MarkdownBlock[] {
    if (text.length < this.state.parsedUpTo) {
      this.reset();
    }

    if (text === this.lastText && streamComplete === this.lastStreamComplete) {
      return this.state.blocks;
    }

    if (this.lastText.length > 0 && text !== this.lastText && !text.startsWith(this.lastText)) {
      this.reset();
    }

    const isPrefixExtension = this.lastText.length > 0 && text.startsWith(this.lastText);
    let prefixBlocks: MarkdownBlock[] = [];
    let parseFromOffset = 0;

    if (isPrefixExtension && this.state.blocks.length > 0) {
      prefixBlocks = this.state.blocks.slice(0, -1);
      parseFromOffset = this.state.blocks[this.state.blocks.length - 1]!.startOffset;
    }

    const tailBlocks = parseBlocksFrom(text, parseFromOffset, streamComplete);
    const blocks = parseFromOffset === 0 ? tailBlocks : [...prefixBlocks, ...tailBlocks];

    this.state.blocks = blocks;
    this.state.parsedUpTo = text.length;
    this.lastText = text;
    this.lastStreamComplete = streamComplete;
    return blocks;
  }
}

function lineIndexAtOffset(text: string, targetOffset: number): number {
  if (targetOffset === 0) return 0;

  const lines = text.split("\n");
  let offset = 0;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    const lineEnd = offset + line.length;
    if (targetOffset <= lineEnd) {
      return index;
    }
    offset = lineEnd + 1;
  }

  return lines.length;
}

function parseBlocksFrom(
  text: string,
  startOffset: number,
  streamComplete: boolean,
): MarkdownBlock[] {
  const lines = text.split("\n");
  const blocks: MarkdownBlock[] = [];
  let offset = startOffset;
  let index = lineIndexAtOffset(text, startOffset);

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const lineStart = offset;
    const lineEnd = offset + line.length;

    if (line.trim() === "") {
      offset = lineEnd + 1;
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const fenceResult = parseCodeFence(lines, index, lineStart);
      blocks.push(fenceResult.block);
      index = fenceResult.nextIndex;
      offset = fenceResult.nextOffset;
      continue;
    }

    if (HEADING_PATTERN.test(line)) {
      blocks.push(createBlock("heading", sliceLines(lines, index, index + 1), lineStart, lineEnd));
      offset = lineEnd + 1;
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteResult = parseBlockquote(lines, index, lineStart);
      blocks.push(quoteResult.block);
      index = quoteResult.nextIndex;
      offset = quoteResult.nextOffset;
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableResult = parseTable(lines, index, lineStart, streamComplete && index >= lines.length - 1);
      blocks.push(tableResult.block);
      index = tableResult.nextIndex;
      offset = tableResult.nextOffset;
      continue;
    }

    if (THEMATIC_BREAK_PATTERN.test(line.trim())) {
      blocks.push(createBlock("thematic_break", line, lineStart, lineEnd, "stable"));
      offset = lineEnd + 1;
      index += 1;
      continue;
    }

    if (/^(\s*)([-*+]|\d+\.)\s/.test(line)) {
      const listResult = parseList(lines, index, lineStart, streamComplete);
      blocks.push(listResult.block);
      index = listResult.nextIndex;
      offset = listResult.nextOffset;
      continue;
    }

    const paragraphResult = parseParagraph(lines, index, lineStart);
    blocks.push(paragraphResult.block);
    index = paragraphResult.nextIndex;
    offset = paragraphResult.nextOffset;
  }

  return blocks;
}

function createBlock(
  type: MarkdownBlockType,
  content: string,
  startOffset: number,
  endOffset: number,
  status?: BlockStatus,
): MarkdownBlock {
  return {
    id: blockId(type, startOffset),
    type,
    content,
    status: status ?? inferStatus(type, content),
    startOffset,
    endOffset,
  };
}

function inferStatus(type: MarkdownBlockType, content: string): BlockStatus {
  if (type === "thematic_break" || type === "heading") {
    return "stable";
  }

  if (type === "code_fence") {
    const fenceCount = (content.match(/^```/gm) ?? []).length;
    return fenceCount >= CODE_FENCE_CLOSE_COUNT ? "complete" : "incomplete";
  }

  if (type === "table") {
    const rows = content.split("\n").filter(Boolean);
    if (rows.length < TABLE_MIN_ROWS) return "incomplete";
    const hasSeparator = rows.some((row) => /^\|?[\s:-]+\|/.test(row));
    return hasSeparator ? "complete" : "incomplete";
  }

  if (type === "list") {
    return "complete";
  }

  if (type === "blockquote") {
    return content.endsWith("\n") ? "complete" : "stable";
  }

  if (type === "paragraph") {
    return content.endsWith("\n\n") || !content.includes("\n") ? "stable" : "complete";
  }

  return "complete";
}

function sliceLines(lines: string[], start: number, end: number): string {
  return lines.slice(start, end).join("\n");
}

function parseCodeFence(
  lines: string[],
  startIndex: number,
  startOffset: number,
): { block: MarkdownBlock; nextIndex: number; nextOffset: number } {
  let index = startIndex;
  let content = "";
  let offset = startOffset;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    content += (content ? "\n" : "") + line;
    const endOffset = offset + line.length;
    index += 1;

    if (index > startIndex + 1 && /^```/.test(line)) {
      return {
        block: createBlock("code_fence", content, startOffset, endOffset, "complete"),
        nextIndex: index,
        nextOffset: endOffset + 1,
      };
    }

    offset = endOffset + 1;
  }

  return {
    block: createBlock("code_fence", content, startOffset, offset, "incomplete"),
    nextIndex: index,
    nextOffset: offset,
  };
}

function parseBlockquote(
  lines: string[],
  startIndex: number,
  startOffset: number,
): { block: MarkdownBlock; nextIndex: number; nextOffset: number } {
  let index = startIndex;
  let offset = startOffset;
  const collected: string[] = [];

  while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) {
    collected.push(lines[index] ?? "");
    offset += (lines[index]?.length ?? 0) + 1;
    index += 1;
  }

  const content = collected.join("\n");
  return {
    block: createBlock("blockquote", content, startOffset, offset - 1, "stable"),
    nextIndex: index,
    nextOffset: offset,
  };
}

function isTableStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";
  if (!line.includes("|")) return false;
  const next = lines[index + 1] ?? "";
  return /^\|?[\s:-]+\|/.test(next) || line.trim().startsWith("|");
}

function parseTable(
  lines: string[],
  startIndex: number,
  startOffset: number,
  atStreamEnd: boolean,
): { block: MarkdownBlock; nextIndex: number; nextOffset: number } {
  let index = startIndex;
  let offset = startOffset;
  const collected: string[] = [];

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.includes("|") && collected.length > 0) break;
    if (!line.includes("|")) break;
    collected.push(line);
    offset += line.length + 1;
    index += 1;
  }

  const content = collected.join("\n");
  const rows = collected.filter(Boolean);
  const hasSeparator = rows.some((row) => /^\|?[\s:-]+\|/.test(row));
  const status: BlockStatus =
    rows.length >= TABLE_MIN_ROWS && hasSeparator ? "complete" : atStreamEnd ? "complete" : "incomplete";

  return {
    block: createBlock("table", content, startOffset, offset - 1, status),
    nextIndex: index,
    nextOffset: offset,
  };
}

function parseList(
  lines: string[],
  startIndex: number,
  startOffset: number,
  streamComplete: boolean,
): { block: MarkdownBlock; nextIndex: number; nextOffset: number } {
  let index = startIndex;
  let offset = startOffset;
  const collected: string[] = [];

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") break;
    if (collected.length > 0 && !/^(\s*)([-*+]|\d+\.)\s/.test(line) && !/^\s+/.test(line)) {
      break;
    }
    if (/^(\s*)([-*+]|\d+\.)\s/.test(line) || (collected.length > 0 && /^\s+/.test(line))) {
      collected.push(line);
      offset += line.length + 1;
      index += 1;
      continue;
    }
    break;
  }

  const content = collected.join("\n");
  // Complete when followed by a blank line / next block, or when the stream has ended.
  const atEndOfDocument = index >= lines.length;
  const status: BlockStatus = streamComplete || !atEndOfDocument ? "complete" : "incomplete";

  return {
    block: createBlock("list", content, startOffset, offset - 1, status),
    nextIndex: index,
    nextOffset: offset,
  };
}

function parseParagraph(
  lines: string[],
  startIndex: number,
  startOffset: number,
): { block: MarkdownBlock; nextIndex: number; nextOffset: number } {
  let index = startIndex;
  let offset = startOffset;
  const collected: string[] = [];

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") break;
    if (
      /^```/.test(line) ||
      HEADING_PATTERN.test(line) ||
      /^>\s?/.test(line) ||
      isTableStart(lines, index) ||
      /^(\s*)([-*+]|\d+\.)\s/.test(line)
    ) {
      break;
    }
    collected.push(line);
    offset += line.length + 1;
    index += 1;
  }

  const content = collected.join("\n");
  const status: BlockStatus = "stable";

  return {
    block: createBlock("paragraph", content, startOffset, offset - 1, status),
    nextIndex: index,
    nextOffset: offset,
  };
}

export function partitionBlocks(blocks: MarkdownBlock[]): {
  renderedBlocks: MarkdownBlock[];
  pendingBlocks: MarkdownBlock[];
} {
  const renderedBlocks = blocks.filter(
    (block) => block.status === "complete" || block.status === "stable",
  );
  const pendingBlocks = blocks.filter((block) => block.status === "incomplete");
  return { renderedBlocks, pendingBlocks };
}

export function flushIncompleteBlocks(blocks: MarkdownBlock[]): MarkdownBlock[] {
  return blocks.map((block) =>
    block.status === "incomplete" ? { ...block, status: "complete" as const } : block,
  );
}
