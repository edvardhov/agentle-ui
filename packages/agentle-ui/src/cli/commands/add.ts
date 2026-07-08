import {
  copyRegistryFile,
  getProjectRoot,
  installDependencies,
  listRegistryComponents,
  loadConfig,
  loadRegistryComponent,
  resolveTargetPath,
} from "../utils.js";

export async function addCommand(
  componentName: string,
  options: { overwrite?: boolean } = {},
): Promise<void> {
  const cwd = getProjectRoot();
  const config = await loadConfig(cwd);

  if (!config) {
    console.error("agentle-ui is not initialized. Run: npx agentle-ui init");
    process.exit(1);
  }

  const available = await listRegistryComponents();

  let manifest;
  try {
    manifest = await loadRegistryComponent(componentName);
  } catch {
    console.error(`Unknown component: ${componentName}`);
    console.error(`Available: ${available.join(", ")}`);
    process.exit(1);
  }

  let addedCount = 0;
  let skippedCount = 0;

  for (const file of manifest.files) {
    const targetPath = resolveTargetPath(cwd, file.target);
    const copied = await copyRegistryFile(
      componentName,
      file.name,
      targetPath,
      file.source,
      options.overwrite,
    );
    if (copied) {
      console.log(`Added ${file.target}`);
      addedCount += 1;
    } else {
      console.warn(`Skipped ${file.target} (already exists; pass --overwrite to replace)`);
      skippedCount += 1;
    }
  }

  if (addedCount === 0 && skippedCount > 0) {
    console.log("\nNo files copied. Re-run with --overwrite to replace existing files.");
    return;
  }

  const deps = manifest.dependencies.filter((dep) => dep !== "agentle-ui");
  if (deps.length > 0 && addedCount > 0) {
    console.log(`Installing dependencies: ${deps.join(", ")}`);
    await installDependencies(cwd, deps);
  }

  console.log(`\nDone. Import from "@/components/agentle/${componentName}" or the copied path.`);
}
