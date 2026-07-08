import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, "..", "..");
export const REGISTRY_ROOT = join(PACKAGE_ROOT, "registry");
export const CONFIG_FILENAME = "agentle-ui.json";

export interface AgentleConfig {
  $schema?: string;
  style: string;
  rsc: boolean;
  tsx: boolean;
  aliases: {
    components: string;
    utils: string;
  };
}

export interface RegistryComponent {
  name: string;
  type: string;
  description: string;
  dependencies: string[];
  files: Array<{ name: string; target: string; source?: string }>;
}

export function getProjectRoot(startDir = process.cwd()): string {
  let dir = resolve(startDir);

  while (true) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      return resolve(startDir);
    }

    dir = parent;
  }
}

export function getConfigPath(cwd = process.cwd()): string {
  return join(cwd, CONFIG_FILENAME);
}

export async function loadConfig(cwd = process.cwd()): Promise<AgentleConfig | null> {
  const configPath = getConfigPath(cwd);
  if (!existsSync(configPath)) {
    return null;
  }
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as AgentleConfig;
}

export async function writeConfig(cwd: string, config: AgentleConfig): Promise<void> {
  await writeFile(getConfigPath(cwd), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function resolveTargetPath(cwd: string, target: string): string {
  return join(cwd, target);
}

export async function copyRegistryFile(
  componentName: string,
  fileName: string,
  targetPath: string,
  sourcePath?: string,
  overwrite = false,
): Promise<boolean> {
  if (!overwrite && existsSync(targetPath)) {
    return false;
  }

  const source = sourcePath
    ? join(REGISTRY_ROOT, sourcePath)
    : join(REGISTRY_ROOT, componentName, fileName);
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(source, targetPath);
  return true;
}

export async function listRegistryComponents(): Promise<string[]> {
  const entries = await readdir(REGISTRY_ROOT);
  return entries
    .filter((entry) => entry.endsWith(".json") && entry !== "schema.json")
    .map((entry) => entry.replace(/\.json$/, ""))
    .sort();
}

export async function loadRegistryComponent(name: string): Promise<RegistryComponent> {
  const manifestPath = join(REGISTRY_ROOT, `${name}.json`);
  const raw = await readFile(manifestPath, "utf8");
  return JSON.parse(raw) as RegistryComponent;
}

export function detectPackageManager(cwd: string): "pnpm" | "npm" | "yarn" {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

export async function installDependencies(
  cwd: string,
  deps: string[],
): Promise<void> {
  if (deps.length === 0) return;

  const pm = detectPackageManager(cwd);
  const { execSync } = await import("node:child_process");
  const cmd =
    pm === "pnpm"
      ? `pnpm add ${deps.join(" ")}`
      : pm === "yarn"
        ? `yarn add ${deps.join(" ")}`
        : `npm install ${deps.join(" ")}`;

  execSync(cmd, { cwd, stdio: "inherit" });
}

export async function getDefaultConfig(): Promise<AgentleConfig> {
  const schemaPath = join(REGISTRY_ROOT, "schema.json");
  const raw = await readFile(schemaPath, "utf8");
  return JSON.parse(raw) as AgentleConfig;
}
