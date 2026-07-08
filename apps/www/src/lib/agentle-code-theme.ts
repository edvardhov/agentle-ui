import type { PrismTheme } from "prism-react-renderer";

export const agentleCodeTheme: PrismTheme = {
  plain: {
    color: "#e4e4e7",
    backgroundColor: "#18181b",
  },
  styles: [
    {
      types: ["comment", "prolog", "cdata"],
      style: {
        color: "#71717a",
        fontStyle: "italic",
      },
    },
    {
      types: ["string", "attr-value", "inserted", "url"],
      style: {
        color: "#e4e4e7",
      },
    },
    {
      types: ["number", "boolean"],
      style: {
        color: "#fca5a5",
      },
    },
    {
      types: ["keyword", "tag", "operator", "atrule"],
      style: {
        color: "#a5b4fc",
      },
    },
    {
      types: ["function", "builtin", "changed"],
      style: {
        color: "#818cf8",
      },
    },
    {
      types: ["class-name", "maybe-class-name"],
      style: {
        color: "#c4b5fd",
      },
    },
    {
      types: ["punctuation", "selector", "doctype"],
      style: {
        color: "#c4b5fd",
      },
    },
    {
      types: ["property", "constant", "symbol"],
      style: {
        color: "#ddd6fe",
      },
    },
    {
      types: ["variable", "parameter"],
      style: {
        color: "#fafafa",
      },
    },
    {
      types: ["deleted"],
      style: {
        color: "#fca5a5",
        fontStyle: "italic",
      },
    },
    {
      types: ["namespace"],
      style: {
        color: "#a1a1aa",
      },
    },
  ],
};
