import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";
import { cliSidebar } from "./sidebars.cli";

const sidebars: SidebarsConfig = {
  docs: [
    "index",
    "quick-start",
    "installation",
    {
      type: "category",
      label: "CLI Reference",
      link: { type: "doc", id: "cli/index" },
      items: cliSidebar,
    },
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/workflow",
        "guides/skills",
        "guides/plugins",
        "guides/literature",
        "guides/selector-protocol",
      ],
    },
    {
      type: "category",
      label: "Reference",
      items: [
        "reference/glossary",
        "reference/user-model",
      ],
    },
    "faq",
  ],
};

export default sidebars;
