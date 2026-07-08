import { addCommand } from "./commands/add.js";
import { initCommand } from "./commands/init.js";
import { listRegistryComponents } from "./utils.js";

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "init":
      await initCommand();
      break;
    case "add": {
      const overwrite = args.includes("--overwrite") || args.includes("--force");
      const component = args.find((arg) => !arg.startsWith("-"));
      if (!component) {
        console.error("Usage: npx agentle-ui add <component> [--overwrite]");
        process.exit(1);
      }
      await addCommand(component, { overwrite });
      break;
    }
    default: {
      const components = await listRegistryComponents();
      console.log("agentle-ui — A gentle UI for chaotic AI streams\n");
      console.log("Usage:");
      console.log("  npx agentle-ui init");
      console.log("  npx agentle-ui add <component>");
      console.log("\nComponents:");
      for (const name of components) {
        console.log(`  ${name}`);
      }
      break;
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
