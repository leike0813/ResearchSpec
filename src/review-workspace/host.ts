import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

import { reviewBlocksFromPandocAst } from "./render.js";

const execFileAsync = promisify(execFile);

/** Normalize HTML already rendered on the user's host; this never runs project hooks. */
export async function reviewBlocksFromHostHtml(input: {
  htmlPath: string;
  sourcePath: string;
  imageIds?: Readonly<Record<string, string>>;
  fallbacks?: Array<{ text: string; source_path: string; note: string }>;
}) {
  const { stdout } = await execFileAsync("pandoc", ["-f", "html", "-t", "json", input.htmlPath], { maxBuffer: 64 * 1024 * 1024 });
  return reviewBlocksFromPandocAst(JSON.parse(stdout) as unknown, input.sourcePath, input.imageIds, input.fallbacks);
}

/** Convert LaTeX through the host Pandoc parser when no richer HTML render is available. */
export async function reviewBlocksFromHostLatex(input: {
  texPath: string;
  sourcePath: string;
  imageIds?: Readonly<Record<string, string>>;
  fallbacks?: Array<{ text: string; source_path: string; note: string }>;
}) {
  const source = await readFile(input.texPath, "utf8");
  const { stdout } = await execFileAsync("pandoc", ["-f", "latex", "-t", "json", input.texPath], { maxBuffer: 64 * 1024 * 1024 });
  const knownCommands = new Set(["documentclass", "usepackage", "begin", "end", "section", "subsection", "subsubsection", "paragraph", "textbf", "textit", "emph", "footnote", "cite", "citep", "citet", "ref", "label", "includegraphics", "input", "include", "caption", "item", "frac", "sqrt", "alpha", "beta", "gamma", "delta", "theta", "sum", "int", "left", "right", "mathrm", "mathbf", "text", "%"]);
  const knownEnvironments = new Set(["document", "abstract", "equation", "align", "itemize", "enumerate", "table", "tabular", "figure", "quote", "verbatim", "center"]);
  const fallbacks = [...(input.fallbacks ?? [])];
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if ([...line.matchAll(/\\([A-Za-z@]+)\b/g)].some((match) => !knownCommands.has(match[1] ?? "")) || [...line.matchAll(/\\begin\{([^}]+)\}/g)].some((match) => !knownEnvironments.has(match[1] ?? ""))) {
      fallbacks.push({ text: line, source_path: input.sourcePath, note: "Uncertain LaTeX conversion near line " + String(index + 1) });
    }
  }
  return reviewBlocksFromPandocAst(JSON.parse(stdout) as unknown, input.sourcePath, input.imageIds, fallbacks);
}
