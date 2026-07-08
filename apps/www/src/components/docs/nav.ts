export interface NavItem {
  label: string;
  path: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Introduction",
    items: [
      { label: "Home", path: "/" },
      { label: "Getting Started", path: "/getting-started" },
      { label: "Concepts", path: "/concepts" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Recipes", path: "/recipes" },
      { label: "Example chat", path: "/example" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Markdown Stabilizer", path: "/markdown-stabilizer" },
      { label: "Thought Visualizer", path: "/thought-visualizer" },
      { label: "Action Card", path: "/action-card" },
      { label: "Prompt Surface", path: "/prompt-surface" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "CLI", path: "/cli" },
      { label: "API Reference", path: "/api-reference" },
    ],
  },
];

export const PACKAGE_VERSION = "0.1.0";
export const GITHUB_URL = "https://github.com/edvardhov/agentle-ui";
