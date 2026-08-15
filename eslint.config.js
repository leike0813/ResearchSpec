import js from "@eslint/js";
import tseslint from "typescript-eslint";

const tsFiles = ["src/**/*.ts", "tests/**/*.ts", "harness/**/*.ts"];

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "references/**",
      ".*/**",
      "tests/**/*.legacy.ts",
      "tests/helpers/arsu-journey.ts",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["eslint.config.js"],
  },
  {
    ...js.configs.recommended,
    files: tsFiles,
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: tsFiles,
  })),
  {
    files: tsFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
);
