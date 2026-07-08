import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useThoughtStream } from "../hooks/use-thought-stream";

describe("useThoughtStream", () => {
  it("returns structured steps immediately", () => {
    const steps = [
      { id: "1", label: "Searching the web...", status: "active" as const },
      { id: "2", label: "Reading files...", status: "complete" as const },
    ];

    const { result } = renderHook(() => useThoughtStream(steps));

    expect(result.current.steps).toHaveLength(2);
    expect(result.current.activeStep?.id).toBe("1");
    expect(result.current.isComplete).toBe(false);
  });

  it("builds summary when stream completes", async () => {
    async function* stream() {
      yield '{"id":"1","label":"Searching the web...","status":"complete"}\n';
      yield '{"id":"2","label":"Reading 3 files...","status":"complete"}\n';
    }

    const { result } = renderHook(() => useThoughtStream(stream()));

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.summary).toContain("Searching the web");
  });
});
