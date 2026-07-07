import type { BlockStatus, MarkdownBlock, MarkdownBlockType } from "../types";

let blockCounter = 0;

function nextBlockId(): string {
  blockCounter += 1;
  return `block-${blockCounter}`;
}

interface ParseState {
  blocks: MarkdownBlock[];
  parsedUpTo: number;
}

export class MarkdownCompletenessParser {
  private state: ParseState = { blocks: [], parsedUpTo: 0 };

  reset(): void {
    this.state = { blocks: [], parsedUpTo: 0 };
    blockCounter = 0;
  }

  parse(text: string, streamComplete = false): MarkdownBlock[] {
    if (text.length < this.state.parsedUpTo) {
      this.reset();
    }

    const newText = text.slice(this.state.parsedUpTo);
    if (newText.length === 0 && !streamComplete) {
      return this.state.blocks;
    }

    const working = text;
    const lines = working.split("\n");
    const blocks: MarkdownBlock[] = [];
    let offset = 0;
    let index = 0;

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

      if (/^#{1,6}\s/.test(line)) {
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

      if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
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

      const paragraphResult = parseParagraph(lines, index, lineStart, streamComplete);
      blocks.push(paragraphResult.block);
      index = paragraphResult.nextIndex;
      offset = paragraphResult.nextOffset;
    }

    this.state.blocks = blocks;
    this.state.parsedUpTo = text.length;
    return blocks;
  }
}

function createBlock(
  type: MarkdownBlockType,
  content: string,
  startOffset: number,
  endOffset: number,
  status?: BlockStatus,
): MarkdownBlock {
  return {
    id: nextBlockId(),
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
    return fenceCount >= 2 ? "complete" : "incomplete";
  }

  if (type === "table") {
    const rows = content.split("\n").filter(Boolean);
    if (rows.length < 2) return "incomplete";
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
    rows.length >= 2 && hasSeparator ? "complete" : atStreamEnd ? "complete" : "incomplete";

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
  streamComplete: boolean,
): { block: MarkdownBlock; nextIndex: number; nextOffset: number } {
  let index = startIndex;
  let offset = startOffset;
  const collected: string[] = [];

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") break;
    if (
      /^```/.test(line) ||
      /^#{1,6}\s/.test(line) ||
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
  const status: BlockStatus = streamComplete ? "stable" : "stable";

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
