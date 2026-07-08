import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addCommand } from "./commands/add.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { CONFIG_FILENAME, getProjectRoot } from "./utils.js";

vi.mock("./utils.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils.js")>();
  return {
    ...actual,
    installDependencies: vi.fn().mockResolvedValue(undefined),
  };
});

describe("CLI", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(join(tmpdir(), "agentle-cli-"));
    await writeFile(join(tempDir, "package.json"), JSON.stringify({ name: "test-app" }));
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it("finds the nearest package.json when cwd is nested", async () => {
    const { mkdir } = await import("node:fs/promises");
    const nested = join(tempDir, "src", "app");
    await mkdir(nested, { recursive: true });

    expect(getProjectRoot(nested)).toBe(tempDir);
  });

  it("init writes agentle-ui.json and creates components directory", async () => {
    await initCommand();

    const configRaw = await readFile(join(tempDir, CONFIG_FILENAME), "utf8");
    expect(JSON.parse(configRaw)).toMatchObject({
      style: "default",
      tsx: true,
    });

    const { access } = await import("node:fs/promises");
    await expect(access(join(tempDir, "components", "agentle"))).resolves.toBeUndefined();
  });

  it("add copies registry files and skips existing files without overwrite", async () => {
    await initCommand();
    await addCommand("markdown-stabilizer");

    const target = join(tempDir, "components/agentle/markdown-stabilizer.tsx");
    const firstContent = await readFile(target, "utf8");
    expect(firstContent).toContain("MarkdownStabilizer");

    await writeFile(target, "// user edited\n");
    await addCommand("markdown-stabilizer");

    const afterSkip = await readFile(target, "utf8");
    expect(afterSkip).toBe("// user edited\n");

    await addCommand("markdown-stabilizer", { overwrite: true });
    const afterOverwrite = await readFile(target, "utf8");
    expect(afterOverwrite).toContain("MarkdownStabilizer");
  });

  it("exits on unknown component", async () => {
    await initCommand();
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`process.exit:${code ?? 0}`);
    }) as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(addCommand("not-a-component")).rejects.toThrow("process.exit:1");

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("list prints available components", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await listCommand();

    expect(logSpy.mock.calls.flat().join("\n")).toContain("markdown-stabilizer");
    logSpy.mockRestore();
  });
});
