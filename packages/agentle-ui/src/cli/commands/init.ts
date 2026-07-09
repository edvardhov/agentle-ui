import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  getDefaultConfig,
  getProjectRoot,
  hasPathAlias,
  listRegistryComponents,
  loadConfig,
  printPathAliasWarning,
  writeConfig,
} from "../utils.js";

export async function initCommand(): Promise<void> {
  const cwd = getProjectRoot();
  const existing = await loadConfig(cwd);

  if (existing) {
    console.log("agentle-ui is already initialized.");
    return;
  }

  const config = await getDefaultConfig();
  await writeConfig(cwd, config);
  await mkdir(join(cwd, "components", "agentle"), { recursive: true });

  if (!(await hasPathAlias(cwd, config.aliases.components))) {
    printPathAliasWarning(config.aliases.components);
  }

  const components = await listRegistryComponents();

  console.log("Created agentle-ui.json");
  console.log("Created components/agentle/");
  console.log("\nAvailable components:");
  for (const name of components) {
    console.log(`  npx agentle-ui add ${name}`);
  }
}
