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
      const component = args[0];
      if (!component) {
        console.error("Usage: npx agentle-ui add <component>");
        process.exit(1);
      }
      await addCommand(component);
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
