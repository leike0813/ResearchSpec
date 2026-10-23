import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, readdir, rename, rmdir, symlink, writeFile } from "node:fs/promises";
import { createServer, request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { assembleReviewWorkspace, createReviewWorkspaceResultV2, createRevisionMasterResult, reviewBlocksFromMarkdown, startReviewSession } from "../src/review-workspace.js";
import { revisionMasterFixture } from "./helpers/revision-master.js";

async function fixture(revisionMaster = false) {
  const root = await mkdtemp(path.join(tmpdir(), "rs-session-"));
  const dir = path.join(root, "reviews", "candidate");
  await mkdir(dir, { recursive: true });
  const generic = assembleReviewWorkspace({
    frozen: { workspace_id: "review", entry_path: "paper.md", files: [{ path: "paper.md", sha256: "a".repeat(64) }], capture_limitations: [] },
    format: "markdown", adapter: "annotation-intake", title: "Review", blocks: reviewBlocksFromMarkdown("# Review\n\nVisible selection text.\n", "paper.md"),
  });
  const revision = revisionMasterFixture();
  const workspace = revisionMaster ? revision : generic;
  const workspacePath = path.join(dir, "workspace.json");
  await writeFile(workspacePath, JSON.stringify(workspace));
  const input = { projectRoot: root, workspacePath, assetPath: path.resolve("review-workspace", revisionMaster ? "revision-master.html" : "index.html") };
  const result = (number = 1) => revisionMaster
    ? createRevisionMasterResult({ workspace: revision, revision: number })
    : createReviewWorkspaceResultV2({ workspace: generic, revision: number, exportedAt: new Date().toISOString() });
  const session = await startReviewSession(input);
  const html = await (await fetch(session.url)).text();
  const token = JSON.parse(html.match(/'X-Review-Token':("[a-f0-9]+")/)?.[1] ?? "null") as string;
  assert.ok(token);
  const post = (payload: unknown, headers: Record<string, string> = {}) => fetch(session.url + "result", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: new URL(session.url).origin, "X-Review-Token": token, ...headers }, body: JSON.stringify(payload),
  });
  return { input, session, workspace, result, post, root, dir, token };
}

for (const revisionMaster of [false, true]) {
  void test(`session preserves complete exports, retries and receipt ordering (${revisionMaster ? "revision-master" : "v2"})`, async (t) => {
    const f = await fixture(revisionMaster);
    t.after(() => f.session.close());
    const original = await readFile(f.input.workspacePath, "utf8");
    const first = { submission_id: randomUUID(), result: f.result() };
    assert.equal((await f.post(first)).status, 200);
    const firstReceipt = await f.session.waitForResult({ timeoutMs: 100 });
    assert.deepEqual(JSON.parse(await readFile(firstReceipt.history_path, "utf8")), first.result);
    const submissions = [2, 3].map((n) => ({ submission_id: randomUUID(), result: f.result(n) }));
    const responses = await Promise.all(submissions.map((s) => f.post(s)));
    assert.ok(responses.every((r) => r.status === 200));
    const next = await f.session.waitForResult({ after: firstReceipt.submission_id });
    assert.ok(submissions.some((s) => s.submission_id === next.submission_id));
    const current = await readFile(f.session.resultPath, "utf8");
    assert.equal((await f.post(first)).status, 200);
    assert.equal(await readFile(f.session.resultPath, "utf8"), current);
    assert.equal((await f.post({ ...first, result: f.result(4) })).status, 409);
    assert.equal((await readdir(f.session.historyDir)).filter((name) => !name.includes("receipt")).length, 3);
    assert.equal(await readFile(f.input.workspacePath, "utf8"), original);
  });
}

void test("session rejects altered snapshots, unexpected origins, paths and oversized requests", async (t) => {
  const f = await fixture();
  t.after(() => f.session.close());
  const body = { submission_id: randomUUID(), result: f.result() };
  assert.equal((await f.post(body, { Origin: "https://unrelated.example" })).status, 403);
  assert.equal((await f.post(body, { "X-Review-Token": "wrong" })).status, 403);
  const foreignHost = await new Promise<number | undefined>((resolve, reject) => {
    const req = request(f.session.url, { headers: { Host: "attacker.example" } }, (res) => { res.resume(); resolve(res.statusCode); });
    req.on("error", reject); req.end();
  });
  assert.equal(foreignHost, 403);
  assert.equal((await f.post({ ...body, output_path: "paper.md" })).status, 400);
  const altered = structuredClone(body);
  altered.result.workspace.title = "Different candidate";
  assert.equal((await f.post(altered)).status, 400);
  assert.equal((await fetch(f.session.url + "workspace.json")).status, 404);
  assert.equal((await fetch(f.session.url + "result?path=paper.md")).status, 404);
  assert.equal((await f.post({ ...body, padding: "x".repeat(64 * 1024 * 1024) })).status, 413);
  assert.deepEqual(await readdir(f.session.historyDir), []);
});

void test("session preserves results on publication failure and allows repairing the identical export", async (t) => {
  const f = await fixture();
  t.after(() => f.session.close());
  const first = { submission_id: randomUUID(), result: f.result() };
  assert.equal((await f.post(first)).status, 200);
  const saved = f.session.resultPath + ".saved";
  await rename(f.session.resultPath, saved);
  await mkdir(f.session.resultPath);
  const next = { submission_id: randomUUID(), result: f.result(2) };
  assert.equal((await f.post(next)).status, 500);
  assert.deepEqual(JSON.parse(await readFile(saved, "utf8")), first.result);
  const waiting = f.session.waitForResult({ after: first.submission_id, timeoutMs: 20 });
  await assert.rejects(waiting, /timed out/);
  await rmdir(f.session.resultPath);
  await rename(saved, f.session.resultPath);
  assert.equal((await f.post(next)).status, 200);
  const receipt = await f.session.waitForResult({ after: first.submission_id });
  assert.deepEqual(JSON.parse(await readFile(receipt.history_path, "utf8")), next.result);
});

void test("session waits terminate on timeout, cancellation and closure", async () => {
  const f = await fixture();
  await assert.rejects(f.session.waitForResult({ timeoutMs: 10 }), /timed out/);
  const controller = new AbortController();
  const cancelled = f.session.waitForResult({ signal: controller.signal });
  controller.abort();
  await assert.rejects(cancelled, /cancelled/);
  const closed = f.session.waitForResult();
  const checkClosed = assert.rejects(closed, /closed/);
  await f.session.close();
  await checkClosed;
});

void test("restarting keeps the origin and does not replay an old successful export", async () => {
  const f = await fixture();
  const first = { submission_id: randomUUID(), result: f.result() };
  const second = { submission_id: randomUUID(), result: f.result(2) };
  await f.post(first); await f.post(second);
  const saved = await readFile(f.session.resultPath, "utf8");
  await f.session.close();
  const reopened = await startReviewSession(f.input);
  assert.equal(reopened.url, f.session.url);
  const html = await (await fetch(reopened.url)).text();
  const token = JSON.parse(html.match(/'X-Review-Token':("[a-f0-9]+")/)?.[1] ?? "null") as string;
  const response = await fetch(reopened.url + "result", { method: "POST", headers: { Origin: new URL(reopened.url).origin, "Content-Type": "application/json", "X-Review-Token": token }, body: JSON.stringify(first) });
  assert.equal(response.status, 200);
  assert.equal((await reopened.waitForResult({ timeoutMs: 100 })).submission_id, first.submission_id);
  assert.equal(await readFile(reopened.resultPath, "utf8"), saved);
  await reopened.close();
  await reopened.close();
  const busy = createServer();
  await new Promise<void>((resolve) => busy.listen(Number(new URL(f.session.url).port), "127.0.0.1", resolve));
  try { await assert.rejects(startReviewSession(f.input), /retained port/); }
  finally { await new Promise<void>((resolve) => busy.close(() => resolve())); }
});

void test("session rejects workflow paths and symlink output escapes", async (t) => {
  const f = await fixture();
  t.after(() => f.session.close());
  const workflowDir = path.join(f.root, "researchspec", "review");
  await mkdir(workflowDir, { recursive: true });
  const workspacePath = path.join(workflowDir, "workspace.json");
  await writeFile(workspacePath, JSON.stringify(f.workspace));
  await assert.rejects(startReviewSession({ ...f.input, workspacePath }), /outside researchspec/);
  const outside = await mkdtemp(path.join(tmpdir(), "rs-outside-"));
  if (process.platform !== "win32") {
    const linkPath = path.join(f.dir, "escape");
    await symlink(outside, linkPath, "dir");
    await assert.rejects(startReviewSession({ ...f.input, workspacePath: path.join(linkPath, "workspace.json") }), /symbolic link/);
  }
});

void test("session never replaces an unrelated existing result file", async () => {
  const f = await fixture();
  await f.session.close();
  const userContent = '{"user":"unrelated result"}\n';
  await writeFile(f.session.resultPath, userContent);
  await assert.rejects(startReviewSession(f.input));
  assert.equal(await readFile(f.session.resultPath, "utf8"), userContent);
});

void test("Node session entry reports ready and committed files to a waiting Agent", { timeout: 15_000 }, async (t) => {
  const f = await fixture();
  await f.session.close();
  const child = spawn(process.execPath, [fileURLToPath(new URL("../src/review-workspace/session-cli.js", import.meta.url)),
    "--project-root", f.root, "--workspace", f.input.workspacePath, "--asset", f.input.assetPath, "--wait"], { stdio: ["ignore", "pipe", "pipe"] });
  t.after(() => { child.kill(); });
  const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
  const readyLine = await lines.next();
  assert.ok(!readyLine.done);
  const ready = JSON.parse(readyLine.value) as { event: string; url: string; result_path: string };
  assert.equal(ready.event, "review_ready");
  assert.equal(ready.result_path, f.session.resultPath);
  const html = await (await fetch(ready.url)).text();
  const token = JSON.parse(html.match(/'X-Review-Token':("[a-f0-9]+")/)?.[1] ?? "null") as string;
  const body = { submission_id: randomUUID(), result: f.result() };
  const response = await fetch(ready.url + "result", { method: "POST", headers: { Origin: new URL(ready.url).origin, "Content-Type": "application/json", "X-Review-Token": token }, body: JSON.stringify(body) });
  assert.equal(response.status, 200);
  const savedLine = await lines.next();
  assert.ok(!savedLine.done);
  const saved = JSON.parse(savedLine.value) as { event: string; history_path: string; submission_id: string };
  assert.equal(saved.event, "review_saved");
  assert.equal(saved.submission_id, body.submission_id);
  assert.deepEqual(JSON.parse(await readFile(saved.history_path, "utf8")), body.result);
  const exited = once(child, "exit");
  child.kill(); await exited;
});
