import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  getDefaultConfig,
  getProjectRoot,
  loadConfig,
  writeConfig,
} from "../utils.js";

export async function initCommand(): Promise<void> {
  const cwd = getProjectRoot();
  const existing = await loadConfig(cwd);

  if (existing) {
    console.log("agentle-ui is already initialized.");
    return;
  }

  const config = await getDefaultConfig(cwd);
  await writeConfig(cwd, config);
  await mkdir(join(cwd, "components", "agentle"), { recursive: true });

  console.log("Created agentle-ui.json");
  console.log("Created components/agentle/");
  console.log("\nNext: npx agentle-ui add markdown-stabilizer");
}
