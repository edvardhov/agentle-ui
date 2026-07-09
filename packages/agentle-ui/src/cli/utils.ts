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
  const excluded = new Set(["schema.json", "config.schema.json", "default-config.json"]);
  const entries = await readdir(REGISTRY_ROOT);
  return entries
    .filter((entry) => entry.endsWith(".json") && !excluded.has(entry))
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
): Promise<boolean> {
  if (deps.length === 0) return true;

  const pm = detectPackageManager(cwd);
  const { execSync } = await import("node:child_process");
  const cmd =
    pm === "pnpm"
      ? `pnpm add ${deps.join(" ")}`
      : pm === "yarn"
        ? `yarn add ${deps.join(" ")}`
        : `npm install ${deps.join(" ")}`;

  try {
    execSync(cmd, { cwd, stdio: "inherit" });
    return true;
  } catch {
    console.warn("\nDependency install failed. Run manually:");
    console.warn(`  ${cmd}`);
    return false;
  }
}

export async function getDefaultConfig(): Promise<AgentleConfig> {
  const configPath = join(REGISTRY_ROOT, "default-config.json");
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as AgentleConfig;
}

export function formatComponentImportPath(config: AgentleConfig, componentName: string): string {
  const base = config.aliases.components.replace(/\/$/, "");
  return `${base}/agentle/${componentName}`;
}

function getAliasPathKey(alias: string): string {
  const trimmed = alias.replace(/\/$/, "");
  const slashIndex = trimmed.indexOf("/");
  if (slashIndex === -1) {
    return `${trimmed}/*`;
  }
  return `${trimmed.slice(0, slashIndex)}/*`;
}

export async function hasPathAlias(cwd: string, alias: string): Promise<boolean> {
  const pathKey = getAliasPathKey(alias);
  const configFiles = ["tsconfig.json", "jsconfig.json"];

  for (const file of configFiles) {
    const filePath = join(cwd, file);
    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const raw = await readFile(filePath, "utf8");
      const config = JSON.parse(raw) as {
        compilerOptions?: { paths?: Record<string, string[]> };
      };
      const paths = config.compilerOptions?.paths;
      if (!paths) {
        continue;
      }

      if (pathKey in paths) {
        return true;
      }

      const aliasRoot = alias.split("/")[0];
      if (aliasRoot && Object.keys(paths).some((key) => key.startsWith(aliasRoot))) {
        return true;
      }
    } catch {
      // ignore invalid JSON or unsupported config shapes
    }
  }

  return false;
}

export function printPathAliasWarning(alias: string): void {
  const pathKey = getAliasPathKey(alias);
  console.warn(`\nWarning: no TypeScript path alias found for "${alias}".`);
  console.warn("Copied components import from this alias. Add to tsconfig.json:\n");
  console.warn(
    JSON.stringify(
      {
        compilerOptions: {
          baseUrl: ".",
          paths: {
            [pathKey]: ["./*"],
          },
        },
      },
      null,
      2,
    ),
  );
}
