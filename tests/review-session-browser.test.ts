import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { assembleReviewWorkspace, reviewBlocksFromMarkdown, startReviewSession, validateReviewResultAgainstWorkspace, validateRevisionMasterResult } from "../src/review-workspace.js";
import { revisionMasterFixture } from "./helpers/revision-master.js";

const exec = promisify(execFile);
async function chromeBinary(): Promise<string | undefined> {
  for (const binary of ["google-chrome", "chromium", "chromium-browser"]) {
    try { await exec(binary, ["--version"]); return binary; } catch { /* Try another installed browser. */ }
  }
}

for (const revisionMaster of [false, true]) {
  void test(`browser submits without download and clears cancelled selection (${revisionMaster ? "revision-master" : "v2"})`, async (t) => {
    const chrome = await chromeBinary();
    if (!chrome) {
      assert.notEqual(process.env.REQUIRE_REVIEW_BROWSER, "1", "Chrome is required for review browser acceptance");
      t.skip("No installed Chrome; browser acceptance was not checked."); return;
    }
    const root = await mkdtemp(path.join(tmpdir(), "rs-browser-"));
    const dir = path.join(root, "review");
    await mkdir(dir);
    const workspace = revisionMaster ? revisionMasterFixture() : assembleReviewWorkspace({
      frozen: { workspace_id: "browser-review", entry_path: "paper.md", files: [{ path: "paper.md", sha256: "a".repeat(64) }], capture_limitations: [] },
      format: "markdown", adapter: "annotation-intake", title: "Browser Review", blocks: reviewBlocksFromMarkdown("# Introduction\n\nSelect this text for review.\n", "paper.md"),
    });
    const workspacePath = path.join(dir, "workspace.json");
    await writeFile(workspacePath, JSON.stringify(workspace));
    const source = await readFile(path.resolve("review-workspace", revisionMaster ? "revision-master.html" : "index.html"), "utf8");
    const probe = `<script>
    (async () => {
      const delay = () => new Promise(resolve => setTimeout(resolve, 50));
      const assert = (condition, message) => {if(!condition) throw new Error(message)};
      try {
        const readingPanel = document.getElementById('reading-panel'); if (readingPanel) readingPanel.open = true;
        const selection = getSelection();
        const paragraph = document.querySelector(${JSON.stringify(revisionMaster ? '#reading [data-block-id="paper:b2"]' : '#paper [data-text-target][data-block-id="b1"]')});
        assert(paragraph, 'paragraph exists');
        const tools = document.getElementById(${JSON.stringify(revisionMaster ? "selection-tools" : "selection-action")});
        function select() { const range = document.createRange(); range.selectNodeContents(paragraph); selection.removeAllRanges(); selection.addRange(range); paragraph.dispatchEvent(new MouseEvent('mouseup',{bubbles:true})); document.dispatchEvent(new Event('selectionchange')); }
        select(); assert(!tools.hidden, 'selection tool visible');
        selection.removeAllRanges(); document.body.dispatchEvent(new MouseEvent('click',{bubbles:true})); document.dispatchEvent(new Event('selectionchange')); await delay();
        assert(tools.hidden, 'cancelled selection tool hidden');
        select(); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await delay();
        assert(tools.hidden, 'Escape clears selection tools');
        select();
        const activation = document.getElementById(${JSON.stringify(revisionMaster ? "add-selection" : "selection-action")});
        activation.focus(); selection.removeAllRanges(); document.dispatchEvent(new Event('selectionchange'));
        assert(!tools.hidden, 'keyboard activation keeps pending anchor');
        ${revisionMaster ? "document.getElementById('annotation-note').value='Browser annotation'; document.getElementById('add-selection').click();" : "tools.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true})); tools.click(); const field=document.querySelector('#cards .card.user textarea'); assert(field,'annotation created'); field.value='Browser annotation'; field.dispatchEvent(new Event('input',{bubbles:true}));"}
        URL.createObjectURL = () => {throw new Error('browser downloads unavailable')};
        Storage.prototype.setItem = () => {throw new Error('browser storage unavailable')};
        const button=document.getElementById('export'); assert(!button.disabled,'submission available');
        const submit = window.researchspecReviewSession.submit;
        window.researchspecReviewSession.submit = () => Promise.reject(new Error('temporary unavailable'));
        button.click(); await delay();
        assert(!button.disabled,'failed submission can retry');
        window.researchspecReviewSession.submit = submit;
        button.click();
        for(let n=0;n<100 && button.disabled;n++) await delay();
        assert(!button.disabled,'submission completed');
        const status=document.getElementById(${JSON.stringify(revisionMaster ? "message" : "toast")}).textContent;
        assert(status.includes(window.researchspecReviewSession.resultPath),'acknowledged exact result path');
        document.title='REVIEW-BROWSER-PASS';
      } catch(error) {document.title='REVIEW-BROWSER-FAIL:'+error.message}
    })();</script>`;
    const assetPath = path.join(root, "page.html");
    await writeFile(assetPath, source.replace("</body>", () => probe + "</body>"));
    const session = await startReviewSession({ projectRoot: root, workspacePath, assetPath });
    t.after(() => session.close());
    const { stdout } = await exec(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--user-data-dir=" + path.join(root, "chrome-profile"), "--virtual-time-budget=10000", "--dump-dom", session.url], { maxBuffer: 16 * 1024 * 1024, timeout: 30_000 });
    assert.ok(stdout.includes("<title>REVIEW-BROWSER-PASS</title>"), stdout.match(/<title>[^<]*<\/title>/)?.[0]);
    const result: unknown = JSON.parse(await readFile(session.resultPath, "utf8"));
    if (revisionMaster) assert.equal(validateRevisionMasterResult(result, workspace).feedback.annotations.length, 1);
    else assert.equal(validateReviewResultAgainstWorkspace(result, workspace).comments.length, 1);
    assert.equal((await readdir(session.historyDir)).filter((file) => !file.includes("receipt")).length, 1);
  });
}
