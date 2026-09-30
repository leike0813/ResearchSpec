import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repoRoot, ".harness-dist");
const require = createRequire(import.meta.url);
const compiler = require.resolve("typescript/bin/tsc");
const previewMode = process.argv.includes("--review-workspace");

if (!previewMode) await rm(outputRoot, { recursive: true, force: true });

const compiled = spawnSync(process.execPath, [compiler, "-p", path.join(repoRoot, "tsconfig.harness.json")], {
  cwd: repoRoot,
  stdio: "inherit",
});
if (compiled.error) throw compiled.error;
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

if (previewMode) {
  const { REVIEW_PREVIEW_CASES, renderReviewWorkspacePreview, reviewWorkspacePreviewSamples } = await import(pathToFileURL(path.join(outputRoot, "harness/review-workspace-preview.js")).href);
  const sourceHtml = await readFile(path.join(repoRoot, "review-workspace/index.html"), "utf8");
  const previewRoot = path.join(outputRoot, "review-workspace");
  const samples = reviewWorkspacePreviewSamples();
  await mkdir(previewRoot, { recursive: true });
  for (const { id } of REVIEW_PREVIEW_CASES) {
    await writeFile(path.join(previewRoot, `${id}.html`), renderReviewWorkspacePreview(sourceHtml, samples[id]), "utf8");
  }
  const { prepareRevisionMasterPreviews, REVISION_MASTER_PREVIEW_CASES } = await import(pathToFileURL(path.join(outputRoot, "harness/revision-master-preview.js")).href);
  await prepareRevisionMasterPreviews(repoRoot, previewRoot);
  for (const item of REVISION_MASTER_PREVIEW_CASES) {
    const file = path.join(previewRoot, `${item.id}.html`);
    const html = await readFile(file, "utf8");
    const menu = `<nav aria-label="开发预览" style="padding:8px">${[...REVIEW_PREVIEW_CASES, ...REVISION_MASTER_PREVIEW_CASES].map((entry) => `<a style="margin-right:12px" href="${entry.id}.html">${entry.label}</a>`).join("")}</nav>`;
    await writeFile(file, html.replace("</body>", `${menu}</body>`));
  }
  const url = pathToFileURL(path.join(previewRoot, "article-rendered.html")).href;
  process.stdout.write(`ResearchSpec review preview: ${url}\n`);
  if (!process.argv.includes("--no-open")) {
    const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer.exe" : "xdg-open";
    const opener = spawn(command, [url], { detached: true, stdio: "ignore" });
    opener.once("error", () => process.stderr.write(`Could not open the browser; open ${url} manually.\n`));
    opener.once("spawn", () => opener.unref());
  }
} else {
  const server = spawnSync(process.execPath, [path.join(outputRoot, "harness/server.js"), ...process.argv.slice(2)], {
    cwd: repoRoot,
    env: { ...process.env, RESEARCHSPEC_REPO_ROOT: repoRoot },
    stdio: "inherit",
  });
  if (server.error) throw server.error;
  process.exitCode = server.status ?? 1;
}
