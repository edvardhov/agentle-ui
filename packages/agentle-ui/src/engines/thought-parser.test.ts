import { describe, expect, it } from "vitest";
import {
  buildThoughtSummary,
  mergeThoughtSteps,
  parseThoughtJsonLine,
} from "../engines/thought-parser";

describe("thought-parser", () => {
  it("parses valid JSON lines", () => {
    const step = parseThoughtJsonLine(
      '{"id":"1","label":"Searching the web...","status":"active"}',
    );
    expect(step).toEqual({
      id: "1",
      label: "Searching the web...",
      status: "active",
    });
  });

  it("merges updates for the same step id", () => {
    const first = parseThoughtJsonLine(
      '{"id":"1","label":"Searching the web...","status":"active"}',
    )!;
    const second = parseThoughtJsonLine(
      '{"id":"1","label":"Searching the web...","status":"complete"}',
    )!;

    const merged = mergeThoughtSteps([first], second);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.status).toBe("complete");
  });

  it("builds a summary from completed steps", () => {
    const summary = buildThoughtSummary([
      { id: "1", label: "Searching the web...", status: "complete" },
      { id: "2", label: "Reading 3 files...", status: "complete" },
    ]);
    expect(summary).toBe("Searching the web and reading 3 files");
  });

  it("returns null summary when no completed steps", () => {
    expect(
      buildThoughtSummary([{ id: "1", label: "Searching...", status: "active" }]),
    ).toBeNull();
  });
});
