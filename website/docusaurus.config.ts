import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { cliSidebar } from "./sidebars.cli";

const config: Config = {
  title: "ResearchSpec",
  tagline: "Agent-neutral, spec-driven academic research framework",
  favicon: "img/favicon.ico",

  url: "https://leike0813.github.io",
  baseUrl: "/ResearchSpec/",

  organizationName: "leike0813",
  projectName: "ResearchSpec",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-Hans"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/researchspec-social-card.png",
    navbar: {
      title: "ResearchSpec",
      logo: {
        alt: "ResearchSpec",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Documentation",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/leike0813/ResearchSpec",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Quick Start",
              to: "/quick-start",
            },
            {
              label: "CLI Reference",
              to: "/cli",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/leike0813/ResearchSpec",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ResearchSpec contributors. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
