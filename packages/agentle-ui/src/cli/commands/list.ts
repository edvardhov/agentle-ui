import { listRegistryComponents } from "../utils.js";

export async function listCommand(): Promise<void> {
  const components = await listRegistryComponents();

  console.log("Available components:\n");
  for (const name of components) {
    console.log(`  ${name}`);
  }
}
