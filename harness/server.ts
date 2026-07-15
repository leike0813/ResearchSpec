import { createServer, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import MarkdownIt from "markdown-it";

import { loadHarnessCatalog, readHarnessFile, type HarnessFileContent, type LoadedHarnessCatalog } from "./catalog.js";

const DEFAULT_PORT = 4173;
export const HARNESS_DEFAULT_HOST = "0.0.0.0";
const MAX_TEXT_PREVIEW_BYTES = 1024 * 1024;
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

export interface SkillHarnessServerOptions {
  repoRoot: string;
  publicRoot?: string;
}

export function createSkillHarnessServer(options: SkillHarnessServerOptions): Server {
  const repoRoot = path.resolve(options.repoRoot);
  const publicRoot = path.resolve(options.publicRoot ?? path.join(repoRoot, "harness/public"));
  let currentCatalog: Promise<LoadedHarnessCatalog> | undefined;
  const catalog = (refresh = false): Promise<LoadedHarnessCatalog> => {
    if (refresh || !currentCatalog) currentCatalog = loadHarnessCatalog(repoRoot);
    return currentCatalog;
  };
  return createServer((request, response) => {
    void handleRequest(publicRoot, catalog, request.method ?? "GET", request.url ?? "/", response).catch((error: unknown) => {
      sendJson(response, 500, { error: { code: "harness_internal_error", message: error instanceof Error ? error.message : String(error) } });
    });
  });
}

async function handleRequest(publicRoot: string, catalog: (refresh?: boolean) => Promise<LoadedHarnessCatalog>, method: string, requestUrl: string, response: ServerResponse): Promise<void> {
  if (method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: { code: "method_not_allowed", message: "The Skill harness is read-only." } });
    return;
  }

  let url: URL;
  try { url = new URL(requestUrl, `http://${HARNESS_DEFAULT_HOST}`); }
  catch {
    sendJson(response, 400, { error: { code: "invalid_url", message: "The request URL is invalid." } });
    return;
  }

  if (url.pathname === "/api/catalog") {
    const loaded = await catalog(true);
    sendJson(response, 200, loaded.catalog);
    return;
  }

  const skillRoute = matchSkillRoute(url.pathname);
  if (skillRoute?.kind === "detail") {
    const loaded = await catalog();
    const skill = loaded.catalog.skills.find((item) => item.skill_id === skillRoute.skillId);
    if (!skill) sendJson(response, 404, { error: { code: "skill_not_found", message: "Unknown Skill." } });
    else sendJson(response, 200, skill);
    return;
  }
  if (skillRoute?.kind === "file") {
    const loaded = await catalog();
    const file = await readHarnessFile(loaded, skillRoute.skillId, skillRoute.filePath);
    if (!file) {
      sendJson(response, 404, { error: { code: "skill_file_not_found", message: "Unknown or unsafe Skill file." } });
      return;
    }
    if (url.searchParams.get("raw") === "1") sendRaw(response, file);
    else sendFilePreview(response, skillRoute.skillId, file);
    return;
  }

  const staticFile = staticPath(url.pathname);
  if (!staticFile) {
    sendJson(response, 404, { error: { code: "not_found", message: "Route not found." } });
    return;
  }
  const absolutePath = path.join(publicRoot, staticFile);
  const content = await readFile(absolutePath);
  send(response, 200, content, staticFile.endsWith(".html") ? "text/html; charset=utf-8" : staticFile.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8");
}

function sendFilePreview(response: ServerResponse, skillId: string, file: HarnessFileContent): void {
  const rawUrl = fileUrl(skillId, file.metadata.path, true);
  if (file.metadata.kind === "image" || file.metadata.kind === "binary" || file.bytes.byteLength > MAX_TEXT_PREVIEW_BYTES) {
    sendJson(response, 200, {
      ...file.metadata,
      source: null,
      rendered_html: null,
      preview_truncated: file.metadata.kind !== "image" && file.bytes.byteLength > MAX_TEXT_PREVIEW_BYTES,
      raw_url: rawUrl,
    });
    return;
  }

  const source = file.bytes.toString("utf8");
  sendJson(response, 200, {
    ...file.metadata,
    source,
    rendered_html: file.metadata.kind === "markdown" ? renderHarnessMarkdown(source, skillId, file.metadata.path) : null,
    preview_truncated: false,
    raw_url: rawUrl,
  });
}

function sendRaw(response: ServerResponse, file: HarnessFileContent): void {
  const disposition = file.metadata.kind === "image" ? "inline" : "attachment";
  response.setHeader("Content-Disposition", `${disposition}; filename*=UTF-8''${encodeURIComponent(path.posix.basename(file.metadata.path))}`);
  send(response, 200, file.bytes, file.metadata.content_type);
}

export function renderHarnessMarkdown(source: string, skillId: string, filePath: string): string {
  const markdown = new MarkdownIt({ html: false, linkify: true, typographer: false });
  const defaultLink = markdown.renderer.rules.link_open ?? ((tokens, index, options, _environment, renderer) => renderer.renderToken(tokens, index, options));
  const defaultImage = markdown.renderer.rules.image ?? ((tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options));

  markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
    const hrefIndex = tokens[index]?.attrIndex("href") ?? -1;
    const href = hrefIndex >= 0 ? tokens[index]?.attrs?.[hrefIndex]?.[1] : undefined;
    if (href) {
      const rewritten = rewriteMarkdownTarget(href, skillId, filePath, false);
      tokens[index]?.attrSet("href", rewritten);
      if (isExternal(href)) {
        tokens[index]?.attrSet("target", "_blank");
        tokens[index]?.attrSet("rel", "noopener noreferrer");
      }
    }
    return defaultLink(tokens, index, options, environment, renderer);
  };
  markdown.renderer.rules.image = (tokens, index, options, environment, renderer) => {
    const srcIndex = tokens[index]?.attrIndex("src") ?? -1;
    const src = srcIndex >= 0 ? tokens[index]?.attrs?.[srcIndex]?.[1] : undefined;
    if (src) tokens[index]?.attrSet("src", rewriteMarkdownTarget(src, skillId, filePath, true));
    return defaultImage(tokens, index, options, environment, renderer);
  };
  return markdown.render(source);
}

function rewriteMarkdownTarget(target: string, skillId: string, ownerPath: string, raw: boolean): string {
  if (target.startsWith("#") || isExternal(target)) return target;
  const withoutFragment = target.split("#", 1)[0]?.split("?", 1)[0] ?? "";
  if (!withoutFragment || withoutFragment.startsWith("/") || withoutFragment.includes("\\")) return "#";
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(ownerPath), withoutFragment));
  if (resolved === ".." || resolved.startsWith("../")) return "#";
  return raw ? fileUrl(skillId, resolved, true) : `#/skills/${encodeURIComponent(skillId)}/files/${encodePath(resolved)}`;
}

function matchSkillRoute(pathname: string): { kind: "detail"; skillId: string } | { kind: "file"; skillId: string; filePath: string } | undefined {
  const segments = decodeSegments(pathname);
  if (!segments || segments[0] !== "api" || segments[1] !== "skills" || !segments[2]) return undefined;
  if (segments.length === 3) return { kind: "detail", skillId: segments[2] };
  if (segments[3] !== "files" || segments.length < 5) return undefined;
  return { kind: "file", skillId: segments[2], filePath: segments.slice(4).join("/") };
}

function decodeSegments(pathname: string): string[] | undefined {
  try { return pathname.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment)); }
  catch { return undefined; }
}

function staticPath(pathname: string): string | undefined {
  if (pathname === "/") return "index.html";
  if (pathname === "/app.js") return "app.js";
  if (pathname === "/styles.css") return "styles.css";
  return undefined;
}

function fileUrl(skillId: string, filePath: string, raw: boolean): string {
  return `/api/skills/${encodeURIComponent(skillId)}/files/${encodePath(filePath)}${raw ? "?raw=1" : ""}`;
}

function encodePath(value: string): string { return value.split("/").map(encodeURIComponent).join("/"); }
function isExternal(value: string): boolean { return /^(?:https?:|mailto:)/i.test(value); }

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  send(response, status, Buffer.from(`${JSON.stringify(value)}\n`, "utf8"), "application/json; charset=utf-8");
}

function send(response: ServerResponse, status: number, content: Uint8Array, contentType: string): void {
  if (response.headersSent) return;
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.setHeader(name, value);
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", contentType);
  response.statusCode = status;
  response.end(content);
}

function parsePort(args: readonly string[], environment: NodeJS.ProcessEnv): number {
  const index = args.indexOf("--port");
  const candidate = index >= 0 ? args[index + 1] : environment.PORT;
  const port = candidate === undefined ? DEFAULT_PORT : Number(candidate);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Harness port must be an integer between 1 and 65535.");
  return port;
}

async function main(): Promise<void> {
  const repoRoot = process.env.RESEARCHSPEC_REPO_ROOT ?? process.cwd();
  const port = parsePort(process.argv.slice(2), process.env);
  const server = createSkillHarnessServer({ repoRoot });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, HARNESS_DEFAULT_HOST, resolve);
  });
  process.stdout.write(`ResearchSpec Skill harness: http://${HARNESS_DEFAULT_HOST}:${String(port)}\n`);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
