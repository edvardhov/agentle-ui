import {
  copyRegistryFile,
  getProjectRoot,
  installDependencies,
  loadConfig,
  loadRegistryComponent,
  resolveTargetPath,
} from "../utils.js";

export async function addCommand(componentName: string): Promise<void> {
  const cwd = getProjectRoot();
  const config = await loadConfig(cwd);

  if (!config) {
    console.error("agentle-ui is not initialized. Run: npx agentle-ui init");
    process.exit(1);
  }

  let manifest;
  try {
    manifest = await loadRegistryComponent(componentName);
  } catch {
    console.error(`Unknown component: ${componentName}`);
    console.error("Available: markdown-stabilizer");
    process.exit(1);
  }

  for (const file of manifest.files) {
    const targetPath = resolveTargetPath(cwd, file.target);
    await copyRegistryFile(componentName, file.name, targetPath);
    console.log(`Added ${file.target}`);
  }

  const deps = manifest.dependencies.filter((dep) => dep !== "agentle-ui");
  if (deps.length > 0) {
    console.log(`Installing dependencies: ${deps.join(", ")}`);
    await installDependencies(cwd, deps);
  }

  console.log(`\nDone. Import from "@/components/agentle/${componentName}" or the copied path.`);
}
