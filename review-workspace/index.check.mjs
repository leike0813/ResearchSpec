import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const here = path.dirname(fileURLToPath(import.meta.url));
const v2Html = readFileSync(path.join(here, "index.html"), "utf8");
const v1Html = readFileSync(path.join(here, "v1.html"), "utf8");

// The retained v1 page keeps its own contract; the shipped page is the v2 one.
for (const pattern of [/review-workspace\.v1/, /review-workspace-result\.v1/, /connect-src 'none'/]) assert.match(v1Html, pattern);
for (const pattern of [/review-workspace\.v2/, /review-workspace-result\.v2/, /connect-src 'none'/, /href="\.\/v1\.html"/]) assert.match(v2Html, pattern);
assert.doesNotMatch(v2Html, /<script\s+src=|<link\s+[^>]*href=/i);
assert.doesNotMatch(v2Html, /innerHTML|insertAdjacentHTML|document\.write|eval\(/);

const script = v2Html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "page script exists");
new Function(script);

const pure = script.slice(script.indexOf("// @browser-check:start"), script.indexOf("// @browser-check:end"));
const api = runInNewContext(
  pure + "\n({ validateWorkspace: validateWorkspace, validateResult: validateResult, validateResultAgainstWorkspace: validateResultAgainstWorkspace, makeTextAnchor: makeTextAnchor, makeWholeAnchor: makeWholeAnchor, buildResult: buildResult, parseTex: parseTex })"
);

const HASH = "a".repeat(64);
const IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const FIXTURE = {
  schema_version: "2",
  workspace_id: "check-workspace",
  snapshot_id: "check-snapshot-1",
  adapter: "annotation-intake",
  title: "绿地与睡眠 · 审阅件",
  source: { format: "markdown", entry_path: "work/manuscript.md", files: [{ path: "work/manuscript.md", sha256: HASH }], capture_limitations: [] },
  document: {
    blocks: [
      { id: "h-intro", kind: "heading", text: "引言", runs: [], level: 1, source_path: "work/manuscript.md", resource_id: null, note: null },
      { id: "intro-1", kind: "paragraph", text: "城市绿地暴露与睡眠质量相关，但观察性数据不能证明因果。", runs: [{ text: "城市绿地暴露", marks: ["emphasis"] }, { text: "与睡眠质量相关，但观察性数据不能证明因果。", marks: [] }], level: null, source_path: "work/manuscript.md", resource_id: null, note: null },
      { id: "methods-formula", kind: "formula", text: "Y = β₀ + β₁G + ε", runs: [], level: null, source_path: null, resource_id: null, note: null },
      { id: "results-image", kind: "image", text: "图 1 · 社区绿地分布", level: null, source_path: null, resource_id: "fig-1", note: null },
      { id: "raw-env", kind: "raw-source", text: "\\begin{customresult}\n\\specialvalue{0.18}\n\\end{customresult}", runs: [], level: null, source_path: null, resource_id: null, note: "自定义环境无法可靠转换。" },
      { id: "methods-code", kind: "code", text: "lm(sleep ~ green + age, data = sample)", runs: [], level: null, source_path: null, resource_id: null, note: null },
      { id: "methods-footnote", kind: "footnote", text: "问卷分数越高表示自评睡眠质量越好。", runs: [], level: null, source_path: null, resource_id: null, note: null },
      { id: "intro-cite", kind: "citation", text: "[Wang et al., 2024]", runs: [], level: null, source_path: null, resource_id: null, note: null },
      { id: "ref-1", kind: "bibliography", text: "Wang, L., et al. (2024). Urban greenery and sleep.", runs: [], level: null, source_path: null, resource_id: null, note: null },
      { id: "results-cell-1", kind: "table-cell", text: "0.18", runs: [], level: null, source_path: null, resource_id: null, note: null },
      { id: "results-cell-2", kind: "table-cell", text: "120", runs: [], level: null, source_path: null, resource_id: null, note: null }
    ]
  },
  assets: [{ id: "fig-1", mime: "image/png", base64: IMAGE, source_path: null }],
  items: [
    { item_id: "A-001", title: "限定结论", source_text: "观察性数据不能证明因果。", source_pointer: "/comments/0", target: { kind: "quote", block_id: "intro-1", block_sha256: "b".repeat(64), exact_quote: "不能证明因果", prefix: "数据", suffix: "。" }, recommendation: { action: "保留关联性措辞", rationale: "样本有限", proposed_text: null, risk: "low" }, initial_disposition: "pending", metadata: {} },
    { item_id: "A-002", title: "补充变量定义", source_text: "公式变量说明", source_pointer: "/comments/1", target: { kind: "document" }, recommendation: { action: "补充变量定义", rationale: "读者可能困惑", proposed_text: null, risk: "ordinary" }, initial_disposition: "defer", metadata: {} }
  ],
  workflow: { selector: null, formal_action: "none", mutation_authority: "researchspec-cli-only", handoff_instruction: "把导出的结果交回 owning Agent。" }
};

const clone = () => JSON.parse(JSON.stringify(FIXTURE));
const workspace = api.validateWorkspace(clone());
assert.equal(workspace.document.blocks.length, 11);
assert.equal(workspace.document.blocks.find((block) => block.id === "results-image").runs.length, 0);
assert.equal(workspace.items.length, 2);

function expectError(run, label) {
  let error = null;
  try { run(); } catch (caught) { error = caught; }
  assert.ok(error, label + "：期望校验失败但没有抛出错误");
  assert.ok(typeof error.message === "string" && error.message.length > 0, label + "：错误信息为空");
  return error;
}
function rejectsWorkspace(mutate, label) {
  const value = clone();
  mutate(value);
  expectError(() => api.validateWorkspace(value), label);
}
rejectsWorkspace((value) => { value.document.blocks.push(value.document.blocks[1]); }, "duplicate block id");
rejectsWorkspace((value) => { value.assets = []; }, "missing image asset");
rejectsWorkspace((value) => { value.document.blocks[1].runs[1].text = "被改动的文字"; }, "runs mismatch");
rejectsWorkspace((value) => { value.document.blocks[0].level = null; }, "heading without level");
rejectsWorkspace((value) => { value.items[1].item_id = "A-001"; }, "duplicate item id");
rejectsWorkspace((value) => { value.document.blocks[1].extra = true; }, "unknown block field");
rejectsWorkspace((value) => { value.source.files = [{ path: "work/other.md", sha256: HASH }]; }, "entry path missing from source set");
rejectsWorkspace((value) => { value.workflow.mutation_authority = "browser"; }, "authority mismatch");

const compareFixture = clone();
compareFixture.adapter = "paper-humanizer";
compareFixture.source.files.unshift({ path: "work/base.md", sha256: HASH });
compareFixture.document.blocks = [
  { ...compareFixture.document.blocks[1], id: "before-intro-1", text: "城市绿地显著改善睡眠质量。", runs: [], source_path: "work/base.md" },
  { ...compareFixture.document.blocks[1], id: "after-intro-1", runs: [], source_path: "work/manuscript.md" },
];
compareFixture.document.comparison = { base_path: "work/base.md", rows: [{ before_block_id: "before-intro-1", after_block_id: "after-intro-1" }] };
compareFixture.items = [{ ...compareFixture.items[0], target: { kind: "locator", label: "引言" } }];
compareFixture.document.item_locations = [{ item_id: "A-001", block_id: "after-intro-1", start: 0, end: 4 }];
api.validateWorkspace(compareFixture);
const invalidComparison = structuredClone(compareFixture);
invalidComparison.document.comparison.rows[0].after_block_id = "before-intro-1";
expectError(() => api.validateWorkspace(invalidComparison), "comparison side identity");
const invalidLocation = structuredClone(compareFixture);
invalidLocation.document.item_locations[0].end = 999;
expectError(() => api.validateWorkspace(invalidLocation), "display location bounds");
const malformedComparison = structuredClone(compareFixture);
malformedComparison.document.blocks = null;
assert.match(expectError(() => api.validateWorkspace(malformedComparison), "malformed comparison block list").message, /document\.blocks/);

const draft = {
  export_revision: 1,
  overall_note: "整体说明",
  decisions: { "A-001": { disposition: "include", note: "同意", proposed_text: null } },
  comments: [
    { comment_id: "U-001", origin: "user", body: "请补充暴露测量的时间窗口。", anchor: api.makeTextAnchor(workspace.document.blocks[1], 0, 6, workspace.snapshot_id) },
    { comment_id: "U-002", origin: "user", body: "图片整体批注。", anchor: api.makeWholeAnchor(workspace.document.blocks[3], workspace.snapshot_id) }
  ]
};
const result = api.buildResult(workspace, draft, "2026-09-29T10:00:00+08:00");
assert.equal(result.export_revision, 1);
assert.equal(result.decisions.length, 2);
assert.equal(result.decisions[1].item_id, "A-002");
assert.equal(result.decisions[1].disposition, "defer");
assert.equal(result.comments[0].anchor.exact_quote, "城市绿地暴露");
assert.equal(result.comments[1].anchor.resource_id, "fig-1");
assert.equal(result.comments[1].anchor.exact_quote, "图 1 · 社区绿地分布");
api.validateResultAgainstWorkspace(clone() && JSON.parse(JSON.stringify(result)), workspace);
assert.equal(api.buildResult(workspace, Object.assign({}, draft, { export_revision: 3 }), "2026-09-29T10:00:00Z").export_revision, 3);

function rejectsResult(mutate, label) {
  const value = JSON.parse(JSON.stringify(result));
  mutate(value);
  expectError(() => api.validateResultAgainstWorkspace(value, workspace), label);
}
rejectsResult((value) => { value.snapshot_id = "other-snapshot"; }, "stale snapshot");
rejectsResult((value) => { value.decisions.pop(); }, "missing decision");
rejectsResult((value) => { value.decisions[0].item_id = "A-999"; }, "unknown decision item");
rejectsResult((value) => { value.comments[0].anchor.exact_quote = "不存在的文字"; }, "quote mismatch");
rejectsResult((value) => { value.comments[0].anchor.start = 3; }, "offset mismatch");
rejectsResult((value) => { value.comments[1].anchor.resource_id = null; }, "image identity mismatch");
rejectsResult((value) => { value.export_revision = 0; }, "invalid revision");
rejectsResult((value) => { value.comments[0].body = "   "; }, "empty comment body");
rejectsResult((value) => { value.decisions[0].disposition = "approved"; }, "unknown disposition");

const emptyWorkspace = api.validateWorkspace(Object.assign(clone(), { items: [] }));
const emptyResult = api.buildResult(emptyWorkspace, { export_revision: 1, overall_note: "", decisions: {}, comments: [] }, "2026-09-29T10:00:00.000Z");
assert.equal(emptyResult.decisions.length, 0);
assert.equal(emptyResult.comments.length, 0);
api.validateResultAgainstWorkspace(emptyResult, emptyWorkspace);

// Text anchors keep the frozen block identity, exact quote, and surrounding context.
const paragraph = workspace.document.blocks[1];
const midAnchor = api.makeTextAnchor(paragraph, 20, 26, workspace.snapshot_id);
assert.equal(midAnchor.snapshot_id, workspace.snapshot_id);
assert.equal(midAnchor.block_id, "intro-1");
assert.equal(midAnchor.exact_quote, "不能证明因果");
assert.equal(paragraph.text.slice(midAnchor.start, midAnchor.end), midAnchor.exact_quote);
assert.equal(midAnchor.prefix + midAnchor.exact_quote + midAnchor.suffix, paragraph.text.slice(midAnchor.start - midAnchor.prefix.length, midAnchor.end + midAnchor.suffix.length));
assert.ok(midAnchor.prefix.endsWith("数据"));
const startAnchor = api.makeTextAnchor(paragraph, 0, 6, workspace.snapshot_id);
assert.equal(startAnchor.prefix, "");
assert.equal(startAnchor.exact_quote, "城市绿地暴露");
const endAnchor = api.makeTextAnchor(paragraph, paragraph.text.length - 1, paragraph.text.length, workspace.snapshot_id);
assert.equal(endAnchor.suffix, "");
const wholeAnchor = api.makeWholeAnchor(workspace.document.blocks[3], workspace.snapshot_id);
assert.equal(wholeAnchor.exact_quote, workspace.document.blocks[3].text);
assert.equal(wholeAnchor.resource_id, "fig-1");

// Formula blocks get a local MathML presentation; unknown commands stay literal.
const fraction = api.parseTex("\\frac{a}{b}");
assert.equal(fraction.type, "mrow");
assert.equal(fraction.children[0].type, "mfrac");
assert.equal(fraction.children[0].num[0].text, "a");
assert.equal(fraction.children[0].den[0].text, "b");
const power = api.parseTex("c^2");
assert.equal(power.children[0].type, "msup");
assert.equal(power.children[0].sup[0].text, "2");
const scripted = api.parseTex("\\alpha_1 + \\beta_2");
assert.equal(scripted.children[0].type, "msub");
assert.equal(scripted.children[0].base.text, "α");
assert.equal(scripted.children[0].sub[0].text, "1");
const unknown = api.parseTex("\\weirdcmd{x}");
assert.equal(unknown.children[0].type, "mtext");
assert.equal(unknown.children[0].text, "\\weirdcmd");

function chromeBinary() {
  for (const candidate of ["google-chrome", "chromium", "chromium-browser"]) {
    try { execFileSync(candidate, ["--version"], { stdio: "ignore" }); return candidate; } catch { /* try next */ }
  }
  return null;
}

function dumpWithImport(payload, comparison = false) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const probe = `<script>(function(){
    var bytes=Uint8Array.from(atob('${encoded}'),function(c){return c.charCodeAt(0)});
    var transfer=new DataTransfer();transfer.items.add(new File([bytes],'check.json',{type:'application/json'}));
    var picker=document.getElementById('file');picker.files=transfer.files;picker.dispatchEvent(new Event('change'));
    setTimeout(function(){
      if(document.getElementById('legacy-dialog').open){document.title='LEGACY-OPEN';return;}
      var paper=document.getElementById('paper');
      if(${comparison}){
        var rows=paper.querySelectorAll('.compare-row').length;
        var changes=paper.querySelectorAll('.diff-before,.diff-after').length;
        addWhole('before-intro-1');addWhole('after-intro-1');
        STATE.comments[0].body='原文批注';STATE.comments[1].body='候选稿批注';
        var result=buildResult(STATE.workspace,STATE,new Date().toISOString());
        validateResultAgainstWorkspace(result,STATE.workspace);
        document.title='rows='+rows+' changes='+changes+' comments='+result.comments.length+' sides='+result.comments.map(function(c){return c.anchor.block_id}).join(',');
        return;
      }
      var before=paper.querySelector('[data-block-id=intro-1]');
      var a=paper.querySelector('[data-block-id=intro-1][data-text-target]');
      var b=paper.querySelector('[data-block-id=intro-cite][data-text-target]');
      var single=false,mixed=false;
      if(a){var r=document.createRange();r.selectNodeContents(a);var s=getSelection();s.removeAllRanges();s.addRange(r);paper.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));single=document.getElementById('selection-action').hidden===false;}
      if(a&&b){var r2=document.createRange();r2.setStart(a,0);r2.setEnd(b,b.childNodes.length);var s2=getSelection();s2.removeAllRanges();s2.addRange(r2);paper.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));var toast=document.getElementById('toast');mixed=!toast.hidden&&toast.textContent.indexOf('跨越')!==-1;}
      var expand=document.querySelector('#cards .expand');if(expand)expand.click();
      var cards=document.querySelectorAll('#cards .card').length;
      var select=document.querySelector('#cards .card.agent select');if(select){select.value='include';select.dispatchEvent(new Event('change',{bubbles:true}));}
      document.getElementById('disposition-filter').value='include';document.getElementById('disposition-filter').dispatchEvent(new Event('change'));
      var filtered=document.querySelectorAll('#cards .card').length;
      var bounded=before===paper.querySelector('[data-block-id=intro-1]');
      document.title='single='+single+' mixed='+mixed+' bounded='+bounded+' cards='+cards+' filtered='+filtered;
    },600);
  })();</script>`;
  const dir = mkdtempSync(path.join(tmpdir(), "rs-review-page-"));
  const file = path.join(dir, "page.html");
  writeFileSync(file, v2Html.replace("</body>", probe + "</body>"), "utf8");
  return execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--user-data-dir=" + path.join(dir, "profile"), "--virtual-time-budget=4000", "--dump-dom", "file://" + file], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
}

const chrome = chromeBinary();
if (!chrome) {
  console.log("review-workspace page check: contract logic OK; no Chrome found, browser stage skipped");
} else {
  const v2Dom = dumpWithImport(FIXTURE);
  assert.ok(v2Dom.includes("<title>single=true mixed=true bounded=true cards=2 filtered=1</title>"), "selection, card expansion, disposition and filtering work in a real browser");
  assert.match(v2Dom, /文档目录/);
  assert.match(v2Dom, /跳到 引言/);
  assert.ok(v2Dom.includes("<em>城市绿地暴露</em>"), "typed runs render as formatting");
  assert.ok(v2Dom.includes("与睡眠质量相关，但观察性数据"), "paragraph text renders");
  assert.ok(v2Dom.includes(">不能证明因果</mark>"), "agent quote is highlighted");
  assert.ok(v2Dom.includes('aria-label="批注 A-001，按回车查看"'), "highlight is keyboard reachable");
  assert.match(v2Dom, /Y = β₀ \+ β₁G \+ ε/);
  assert.ok(v2Dom.includes("data:image/png;base64,"), "image asset renders from local data");
  assert.ok(v2Dom.includes("<math") && v2Dom.includes("class=\"math-render\""), "formula renders as local MathML");
  assert.ok(v2Dom.includes("class=\"text-target tex-source\""), "formula keeps its raw TeX fallback");
  assert.ok(v2Dom.includes("begin{customresult}"), "raw LaTeX fallback stays visible");
  assert.ok(v2Dom.includes("<table"), "consecutive table cells render as a table");
  assert.ok(v2Dom.includes("整格批注"), "table cell supports a whole-cell comment");
  assert.ok(v2Dom.includes("脚注批注"), "footnote is its own annotatable block");
  assert.ok(v2Dom.includes("引用批注"), "citation marker supports a whole-object comment");
  assert.ok(v2Dom.includes("参考文献批注"), "bibliography entry is its own annotatable block");
  assert.ok(v2Dom.includes("lm(sleep ~ green + age, data = sample)"), "code block renders as its own block");
  assert.ok(v2Dom.includes(">0.18</div>"), "table cell text is selectable in its own block");
  assert.match(v2Dom, /公式批注/);
  assert.match(v2Dom, /图片批注/);
  const rails = v2Dom.slice(v2Dom.indexOf('id="cards"'));
  assert.ok(rails.includes("Agent 审阅项") && rails.includes("待处理"), "rail renders Agent items with their disposition");
  assert.ok(rails.includes("未定位到正文"), "an item without a document target stays reachable");
  assert.match(v2Dom, /未定位到正文/);
  assert.ok(v2Dom.includes("显示 1 / 2 项"), "rail shows filtered item counts");
  const compareDom = dumpWithImport(compareFixture, true);
  assert.match(compareDom, /<title>rows=1 changes=[1-9][0-9]* comments=2 sides=before-intro-1,after-intro-1<\/title>/, "comparison renders changed phrases and exports side-specific anchors");
  const v1Dom = dumpWithImport({ schema_version: "1", workspace_id: "old", adapter: "paper-humanizer", title: "旧版", manuscript: { path: "paper.md", entry_path: null, format: "markdown", sha256: HASH, content: "旧稿" }, items: [] });
  assert.ok(v1Dom.includes("<title>LEGACY-OPEN</title>"), "v1 input opens the recovery route");
  console.log("review-workspace page check: contract logic + real browser import OK");
}
