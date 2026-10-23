import { randomBytes, randomUUID } from "node:crypto";
import { link, lstat, mkdir, readFile, realpath, rename, unlink, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";

import { assertPathWithinRoot } from "../core/workspace/path-boundary.js";
import { renderRevisionMasterHtml } from "./revision-master-prepare.js";
import { RevisionMasterWorkspaceSchema, validateRevisionMasterResult } from "./revision-master.js";
import { ReviewWorkspaceV2Schema, validateReviewResultAgainstWorkspace } from "./v2.js";

const MAX_BODY = 64 * 1024 * 1024;
const Submission = z.strictObject({ submission_id: z.uuid(), result: z.unknown() });
const SessionState = z.strictObject({
  schema_version: z.literal("1"), workspace_id: z.string(), snapshot_id: z.string(),
  port: z.number().int().min(1).max(65535),
});

export interface ReviewResultReceipt {
  submission_id: string;
  result_path: string;
  history_path: string;
}

export interface ReviewSession {
  url: string;
  resultPath: string;
  historyDir: string;
  waitForResult(options?: { after?: string; timeoutMs?: number; signal?: AbortSignal }): Promise<ReviewResultReceipt>;
  close(): Promise<void>;
}

function inlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/** One transport bridge for both pages; failed requests retain their exact payload and identity. */
function bridge(workspace: unknown, resultPath: string, token: string): string {
  return `<script>
  window.researchspecReviewSession = (() => {
    let pending = null;
    return {
      workspace: ${inlineJson(workspace)}, resultPath: ${inlineJson(resultPath)},
      async submit(result) {
        // Export timestamps and result identities are created once per attempt, including retries.
        const content = JSON.stringify({...result, exported_at: null, result_id: null});
        if (!pending || pending.content !== content) pending = {content, body: JSON.stringify({submission_id: crypto.randomUUID(), result})};
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 30000);
        try {
          const response = await fetch('/result', {method:'POST', headers:{'Content-Type':'application/json','X-Review-Token':${inlineJson(token)}}, body:pending.body, signal:controller.signal});
          const receipt = await response.json();
          if (!response.ok) throw new Error(receipt.error || 'Result could not be saved');
          pending = null;
          return receipt;
        } finally { clearTimeout(timer); }
      }
    };
  })();
  </script>`;
}

function send(response: ServerResponse, status: number, body: unknown, html = false): void {
  response.writeHead(status, {
    "Content-Type": html ? "text/html; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "frame-ancestors 'none'",
  });
  response.end(html ? body : JSON.stringify(body));
}

async function readSubmission(request: IncomingMessage): Promise<z.infer<typeof Submission>> {
  if (Number(request.headers["content-length"]) > MAX_BODY) throw new SessionError(413, "result_too_large");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.from(chunk as Uint8Array);
    size += bytes.length;
    if (size > MAX_BODY) throw new SessionError(413, "result_too_large");
    chunks.push(bytes);
  }
  return Submission.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown);
}

class SessionError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

/** Serves only a frozen review and writes advisory result files, never semantic or workflow state. */
export async function startReviewSession(input: {
  projectRoot: string;
  workspacePath: string;
  assetPath: string;
}): Promise<ReviewSession> {
  const root = await realpath(input.projectRoot);
  const workspacePath = path.resolve(input.workspacePath);
  await assertPathWithinRoot(root, workspacePath);
  const artifactRoot = path.dirname(workspacePath);
  if (artifactRoot === root || path.relative(root, artifactRoot).split(path.sep)[0] === "researchspec") {
    throw new Error("Review session files must stay in a task directory outside researchspec/.");
  }
  if (path.basename(workspacePath) !== "workspace.json") throw new Error("Retain the review as workspace.json before opening a session.");
  const raw: unknown = JSON.parse(await readFile(workspacePath, "utf8"));
  const generic = ReviewWorkspaceV2Schema.safeParse(raw);
  const workspace = generic.success ? generic.data : RevisionMasterWorkspaceSchema.parse(raw);
  const validate = (candidate: unknown) => generic.success
    ? validateReviewResultAgainstWorkspace(candidate, workspace)
    : validateRevisionMasterResult(candidate, workspace);
  const resultPath = path.join(artifactRoot, "result.json");
  const historyDir = path.join(artifactRoot, "results");
  const statePath = path.join(artifactRoot, "review-session.json");
  const token = randomBytes(24).toString("hex");
  const identity = { schema_version: "1" as const, workspace_id: workspace.workspace_id, snapshot_id: workspace.snapshot_id };

  const safe = async (target: string) => {
    await assertPathWithinRoot(root, target);
    const info = await lstat(target).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    });
    if (info && !info.isFile()) throw new Error(`Expected a regular review file: ${target}`);
  };
  const readOptional = async (target: string): Promise<string | undefined> => {
    await safe(target);
    try { return await readFile(target, "utf8"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  };
  const publish = async (target: string, content: string, exclusive = false) => {
    await safe(target);
    const temporary = path.join(path.dirname(target), `.review-${randomUUID()}.tmp`);
    try {
      await safe(temporary);
      await writeFile(temporary, content, { flag: "wx", mode: 0o600 });
      await safe(target);
      if (exclusive) await link(temporary, target);
      else await rename(temporary, target);
    } finally { await unlink(temporary).catch(() => undefined); }
  };
  const previous = await readOptional(statePath);
  const state = previous === undefined ? undefined : SessionState.parse(JSON.parse(previous) as unknown);
  if (state && (state.workspace_id !== workspace.workspace_id || state.snapshot_id !== workspace.snapshot_id)) {
    throw new Error("Review session belongs to a different frozen snapshot.");
  }
  const previousResult = await readOptional(resultPath);
  if (previousResult !== undefined) validate(JSON.parse(previousResult) as unknown);
  await assertPathWithinRoot(root, historyDir);
  await mkdir(historyDir, { recursive: true });
  await assertPathWithinRoot(root, historyDir);
  let html = await readFile(input.assetPath, "utf8");
  if (!generic.success) html = renderRevisionMasterHtml(html, workspace);
  if (!html.includes("connect-src 'none'") || !html.includes("<script>")) throw new Error("Expected a self-contained review page template.");
  html = html.replace("connect-src 'none'", "connect-src 'self'")
    .replace("<script>", () => `${bridge(generic.success ? workspace : null, resultPath, token)}<script>`);

  const receipts: ReviewResultReceipt[] = [];
  const waiters = new Set<() => void>();
  let closed = false;
  let queue: Promise<unknown> = Promise.resolve();
  let origin = "";
  const notify = (receipt: ReviewResultReceipt) => {
    if (receipts.some((saved) => saved.submission_id === receipt.submission_id)) return;
    receipts.push(receipt);
    for (const wake of waiters) wake();
  };
  const receive = async (submission: z.infer<typeof Submission>): Promise<ReviewResultReceipt> => {
    const { submission_id: id } = submission;
    let result;
    try {
      result = validate(submission.result);
    } catch { throw new SessionError(400, "invalid_review_result"); }
    const content = JSON.stringify(result, null, 2) + "\n";
    const historyPath = path.join(historyDir, `${id}.json`);
    const receiptPath = path.join(historyDir, `${id}.receipt.json`);
    const receipt: ReviewResultReceipt = { submission_id: id, result_path: resultPath, history_path: historyPath };
    const existing = await readOptional(historyPath);
    if (existing !== undefined && !isDeepStrictEqual(JSON.parse(existing) as unknown, result)) throw new SessionError(409, "submission_identity_conflict");
    if (existing !== undefined && await readOptional(receiptPath) !== undefined) { notify(receipt); return receipt; }
    if (existing === undefined) await publish(historyPath, content, true);
    const current = await readOptional(resultPath);
    if (current !== undefined) validate(JSON.parse(current) as unknown);
    await publish(resultPath, content);
    await publish(receiptPath, JSON.stringify(receipt) + "\n", true);
    notify(receipt);
    return receipt;
  };
  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    if (request.headers.host !== new URL(origin).host) throw new SessionError(403, "invalid_host");
    if (request.method === "GET" && request.url === "/") return send(response, 200, html, true);
    if (request.method !== "POST" || request.url !== "/result") throw new SessionError(404, "unknown_review_route");
    if (request.headers.origin !== origin || request.headers["x-review-token"] !== token || request.headers["content-type"] !== "application/json") {
      throw new SessionError(403, "review_request_forbidden");
    }
    const submission = await readSubmission(request);
    const operation = queue.then(() => receive(submission));
    queue = operation.catch(() => undefined);
    send(response, 200, await operation);
  };
  const server = createServer((request, response) => {
    void handle(request, response).catch((error: unknown) => {
      const status = error instanceof SessionError ? error.status : error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500;
      send(response, status, { error: error instanceof SessionError ? error.message : status === 400 ? "invalid_review_result" : "review_save_failed" });
    });
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  await new Promise<void>((resolve, reject) => {
    const fail = (error: Error) => reject(new Error(`Cannot open review session${state ? ` on retained port ${String(state.port)}` : ""}: ${error.message}`, { cause: error }));
    server.once("error", fail);
    server.listen(state?.port ?? 0, "127.0.0.1", () => { server.off("error", fail); resolve(); });
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Review server has no TCP address.");
  origin = `http://127.0.0.1:${String(address.port)}`;
  let closing: Promise<void> | undefined;
  const close = () => {
    if (closing) return closing;
    closed = true;
    for (const wake of waiters) wake();
    const stopped = new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    server.closeAllConnections();
    closing = stopped.then(async () => { await queue; });
    return closing;
  };
  try {
    if (!state) await publish(statePath, JSON.stringify({ ...identity, port: address.port }) + "\n", true);
  } catch (error) { await close(); throw error; }
  return {
    url: origin + "/", resultPath, historyDir, close,
    waitForResult(options = {}) {
      const timeout = options.timeoutMs ?? 600_000;
      if (!Number.isFinite(timeout) || timeout < 1 || timeout > 2_147_483_647) return Promise.reject(new Error("Invalid review wait timeout."));
      const index = options.after === undefined ? -1 : receipts.findIndex((receipt) => receipt.submission_id === options.after);
      if (options.after !== undefined && index < 0) return Promise.reject(new Error("Unknown review receipt in this session."));
      return new Promise<ReviewResultReceipt>((resolve, reject) => {
        const finish = (error?: Error, receipt?: ReviewResultReceipt) => {
          clearTimeout(timer); waiters.delete(wake); options.signal?.removeEventListener("abort", abort);
          if (error) reject(error); else if (receipt) resolve(receipt);
        };
        const abort = () => finish(new Error("Review wait cancelled."));
        const wake = () => {
          if (closed) return finish(new Error("Review session closed."));
          if (receipts[index + 1]) finish(undefined, receipts[index + 1]);
        };
        const timer = setTimeout(() => finish(new Error("Review wait timed out.")), timeout);
        waiters.add(wake); options.signal?.addEventListener("abort", abort, { once: true });
        if (options.signal?.aborted) abort(); else wake();
      });
    },
  };
}
