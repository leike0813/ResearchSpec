#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_ANCHOR = process.env.ARSU_ANCHOR ?? "v3.19.0-828ef3b";
const AUDIT_ARTIFACTS = path.join(ROOT, "audits", "arsu", DEFAULT_ANCHOR, "artifacts");
const REVIEW_HTML = path.join(AUDIT_ARTIFACTS, "arsu-mode-capability-review.html");
const ARS = path.join(ROOT, "vendor", "ars");
const CAPABILITIES = path.join(ROOT, "skills", "capabilities");
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(AUDIT_ARTIFACTS, "arsu-mode-graph-match-assessment.html");

const esc = (text) => String(text ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const norm = (text) => String(text ?? "").toLowerCase().replace(/\s+/g, " ");
const lines = (text) => (text.length ? text.split("\n").length : 0);
const read = (rel) => readFileSync(path.join(ARS, rel), "utf8");
const readCap = (rel) => readFileSync(path.join(CAPABILITIES, rel), "utf8");
const stripHtml = (text) => text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");

const OPTIONAL_RE = /(mode_selection_guide|mode_spectrum|intent_clarification_protocol|integration_guide|mode_advisor|_api_protocol\.md)/i;
function isOptionalDoc(rel) {
  if (/\/templates\//.test(rel) && rel.endsWith(".md")) return false;
  if (/changelog\.md$/i.test(rel)) return true;
  return OPTIONAL_RE.test(rel);
}

// ---------- anchor definitions ----------
const A = (label, anchor, opts = {}) => ({ label, anchor, ...opts });
const ANCHORS = {
  "deep-research:full": [
    A("研究问题评分", "FINER"),
    A("检索记录", "PRISMA"),
    A("证据分级", "Evidence hierarchy"),
    A("引文锚点协议", "Claim Intent Manifest"),
    A("综合报告结构", "Synthesis Report"),
    A("APA 呈现", "APA 7.0"),
  ],
  "deep-research:quick": [
    A("研究问题评分", "FINER"),
    A("快速检索", "search strategy"),
    A("证据分级", "Evidence hierarchy"),
    A("APA 呈现", "APA 7.0"),
  ],
  "deep-research:review": [
    A("编辑裁决", "Editorial Decision"),
    A("逻辑谬误", "logical fallacy"),
    A("伦理披露", "AI Disclosure"),
  ],
  "deep-research:lit-review": [
    A("检索与筛选", "PRISMA"),
    A("注释书目", "Annotated Bibliography"),
    A("证据分级", "Evidence hierarchy"),
    A("综合方法", "Narrative Synthesis"),
  ],
  "deep-research:three-way-scan": [
    A("WHY/HOW/WHAT", "WHY"),
    A("去重", "deduplication"),
    A("APA 引文", "APA 7.0"),
    A("筛选记录", "screening"),
  ],
  "deep-research:fact-check": [
    A("伪造文献", "FABRICATED"),
    A("DOI 核验", "DOI"),
    A("外部检索", "WebSearch"),
    A("核验结论", "PLAUSIBLE"),
  ],
  "deep-research:socratic": [
    A("洞察标签", "INSIGHT"),
    A("五层提问", "Layer 1"),
    A("承诺门", "COMMITMENT"),
    A("收敛信号", "Convergence Signals"),
  ],
  "deep-research:systematic-review": [
    A("PRISMA 流程", "PRISMA"),
    A("随机研究偏倚", "RoB 2"),
    A("非随机研究偏倚", "ROBINS-I"),
    A("证据确定性", "GRADE"),
    A("异质性", "Heterogeneity"),
    A("森林图", "forest plot"),
  ],
  "academic-paper:full": [
    A("配置访谈输出", "Paper Configuration Record"),
    A("结构模板", "IMRaD"),
    A("论证蓝图", "Argument Blueprint"),
    A("写作结构", "TEEL"),
    A("引文标记", "ref:slug"),
    A("引文审计", "Citation Audit Report"),
    A("AI 披露", "AI Disclosure"),
  ],
  "academic-paper:plan": [
    A("章节计划", "Chapter Plan"),
    A("洞察标签", "INSIGHT"),
    A("苏格拉底规划", "Socratic"),
    A("配置记录", "Paper Configuration Record"),
  ],
  "academic-paper:outline-only": [
    A("大纲输出", "Paper Outline"),
    A("结构模板", "IMRaD"),
    A("证据图", "Evidence Map"),
    A("字数预算", "word count"),
  ],
  "academic-paper:revision": [
    A("修订补丁", "revision patch"),
    A("确定性锚点", "anchor"),
    A("修订日志", "Revision Log"),
    A("逐点回应", "Response to Reviewers"),
  ],
  "academic-paper:revision-coach": [
    A("修订路线图", "Revision Roadmap"),
    A("承诺抽取", "commitment_extracted"),
    A("评审意见解析", "reviewer comments"),
    A("优先级", "P1"),
  ],
  "academic-paper:abstract-only": [
    A("双语摘要", "Bilingual"),
    A("关键词数量", "5-7 keywords"),
    A("独立写作", "independently"),
    A("摘要字数", "150-300 words"),
  ],
  "academic-paper:lit-review": [
    A("注释书目", "Annotated Bibliography"),
    A("APA 呈现", "APA 7.0"),
    A("综合叙事", "synthesis"),
    A("检索记录", "PRISMA"),
  ],
  "academic-paper:format-convert": [
    A("LaTeX 输出", "LaTeX"),
    A("Pandoc 转换", "Pandoc"),
    A("AI 披露", "AI Disclosure"),
    A("投稿信", "cover letter"),
  ],
  "academic-paper:citation-check": [
    A("零孤儿引用", "Zero orphans"),
    A("作者年份规则", "et al."),
    A("DOI 校验", "DOI"),
    A("撤稿筛查", "Retraction Watch"),
  ],
  "academic-paper:disclosure": [
    A("AI 披露声明", "AI Disclosure"),
    A("venue 政策", "venue"),
    A("政策锚点", "policy"),
  ],
  "academic-paper:rebuttal-audit": [
    A("回应信 QA", "rebuttal"),
    A("覆盖率表", "coverage table"),
    A("缺口清单", "gap"),
    A("风险标记", "risk flags"),
  ],
  "academic-paper-reviewer:full": [
    A("评审人配置卡", "Reviewer Configuration Card"),
    A("EIC 报告", "EIC Review Report"),
    A("跨学科评审", "Perspective Review"),
    A("最强反证", "Strongest Counter-Argument"),
    A("编辑决定包", "Editorial Decision Package"),
    A("修订路线图", "Revision Roadmap"),
  ],
  "academic-paper-reviewer:re-review": [
    A("验证评审", "Verification Review"),
    A("追溯矩阵", "traceability"),
    A("残留问题", "residual issues"),
    A("修订稿复核", "revised manuscript"),
  ],
  "academic-paper-reviewer:quick": [
    A("EIC 报告", "EIC Review Report"),
    A("期刊匹配", "Journal Fit"),
    A("置信分", "Confidence Score"),
  ],
  "academic-paper-reviewer:methodology-focus": [
    A("统计规范", "Statistical"),
    A("效应量", "effect size"),
    A("功效分析", "power analysis"),
    A("方法学视角", "R1"),
  ],
  "academic-paper-reviewer:guided": [
    A("苏格拉底评审", "Socratic"),
    A("洞察标签", "INSIGHT"),
    A("渐进揭示", "progressive"),
    A("引导对话", "guided"),
  ],
  "academic-paper-reviewer:calibration": [
    A("漏检率", "FNR"),
    A("误报率", "FPR"),
    A("曲线下面积", "AUC"),
    A("黄金集", "gold set"),
  ],
  "academic-pipeline:end-to-end": [
    A("研究阶段", "Stage 1 RESEARCH", { flow: true }),
    A("完整性阶段", "INTEGRITY"),
    A("最终完整性", "FINAL INTEGRITY", { flow: true }),
    A("过程总结", "Process Summary", { flow: true }),
    A("检查点", "checkpoint"),
  ],
  "academic-pipeline:resume_from_passport": [
    A("护照恢复", "passport"),
    A("重置边界", "reset boundary"),
    A("恢复执行", "resume"),
    A("恢复等待判定", "awaiting_resume"),
    A("防重复恢复", "consumes_hash"),
  ],
};

// ---------- parse review HTML ----------
const review = readFileSync(REVIEW_HTML, "utf8");
const rawPanels = review.split(/<section class="mode-panel"[^>]*>/).slice(1);
const MODE_RESULTS = rawPanels.map((panel, index) => {
  const routeMatch = /<div class="mode-route">([^<]+)<\/div>/.exec(panel);
  const titleMatch = /<h2>([^<]+)<\/h2>/.exec(panel);
  const route = stripHtml(routeMatch?.[1] ?? `unknown-${index}`);
  const title = stripHtml(titleMatch?.[1] ?? route);
  const skill = route.split(":")[0] ?? "";
  const mode = route.split(":")[1] ?? "";

  const docBlocks = [...panel.matchAll(/<details class="doc" id="doc-[^"]+">([\s\S]*?)<\/details>/g)].map((m) => m[1]);
  const docs = docBlocks.map((block) => {
    const relRaw = /<span class="doc-path">([^<]+)<\/span>/.exec(block)?.[1] ?? "";
    const kindRaw = /badge kind-([^"]+)/.exec(block)?.[1] ?? "REFERENCE";
    const purposeRaw = /<span class="doc-purpose">([^<]+)<\/span>/.exec(block)?.[1] ?? "";
    const metaRaw = /<span class="meta">([^<]+) 行<\/span>/.exec(block)?.[1] ?? "";
    const body = /<pre class="doc-body">([\s\S]*?)<\/pre>/.exec(block)?.[1] ?? "";
    const rel = stripHtml(relRaw);
    const text = read(rel);
    return {
      rel,
      kind: kindRaw.toUpperCase(),
      purpose: stripHtml(purposeRaw),
      metaLines: Number(metaRaw) || 0,
      lines: lines(text),
      text,
      optional: isOptionalDoc(rel),
    };
  });

  const capIds = [...new Set([...panel.matchAll(/<span class="cap-id">([^<]+)<\/span>/g)].map((m) => stripHtml(m[1])))]
    .filter((capId) => existsSync(path.join(CAPABILITIES, capId, "SKILL.md")));
  const nodeIds = [...new Set([...panel.matchAll(/<span class="node-id">([^<]+)<\/span>/g)].map((m) => stripHtml(m[1])))];
  const capabilities = capIds.map((capId) => {
    const pkg = path.join(CAPABILITIES, capId);
    let manifest;
    try { manifest = JSON.parse(readFileSync(path.join(pkg, "registry-entry.json"), "utf8")); } catch { /* registry-entry is not stored per package */ }
    let manifestYaml;
    try { manifestYaml = readFileSync(path.join(pkg, "manifest.yaml"), "utf8"); } catch { manifestYaml = ""; }
    const skillText = readFileSync(path.join(pkg, "SKILL.md"), "utf8");
    let knowledge = [];
    try {
      const title = /^title: (.+)$/m.exec(manifestYaml)?.[1] ?? capId;
      const refLines = manifestYaml.split("\n");
      const refBlockStart = refLines.findIndex((l) => l.startsWith("knowledge_refs:"));
      const knowledgeText = refBlockStart >= 0 ? refLines.slice(refBlockStart).join("\n") : "";
      knowledge = [...knowledgeText.matchAll(/path: (.+)/g)].map((m) => m[1]);
      const files = [];
      for (const rel of knowledge) {
        try {
          const ktext = readFileSync(path.join(pkg, ...rel.split("/")), "utf8");
          files.push({ path: rel, text: ktext, lines: lines(ktext) });
        } catch { files.push({ path: rel, text: "", lines: 0, error: true }); }
      }
      return { capId, title: String(title).trim(), skillLines: lines(skillText), skillText, files };
    } catch {
      return { capId, title: capId, skillLines: lines(skillText), skillText, files: [] };
    }
  }).filter((c) => c.skillLines > 0);

  const requiredDocs = docs.filter((d) => !d.optional);
  const optionalDocs = docs.filter((d) => d.optional);
  const reqLines = requiredDocs.reduce((s, d) => s + d.lines, 0);
  const optLines = optionalDocs.reduce((s, d) => s + d.lines, 0);
  const convertedLines = capabilities.reduce((s, c) => s + c.skillLines + c.files.reduce((x, f) => x + f.lines, 0), 0);

  const anchors = (ANCHORS[route] ?? []).map((a) => {
    const needle = norm(a.anchor);
    const upstreamHits = docs.filter((d) => norm(d.text).includes(needle));
    const convertedHits = [];
    for (const cap of capabilities) {
      const allText = norm(`${cap.skillText}\n${cap.files.map((f) => f.text).join("\n")}`);
      if (allText.includes(needle)) convertedHits.push(cap.capId);
    }
    const inUp = upstreamHits.length > 0;
    const inDown = convertedHits.length > 0;
    const status = inUp && inDown ? "preserved" : inUp && !inDown && a.flow ? "flow" : inUp && !inDown ? "gap" : !inUp && inDown ? "converted_only" : "missing";
    const firstUp = upstreamHits[0];
    return {
      ...a,
      upstreamHits: upstreamHits.map((d) => d.rel),
      upstreamHitLines: firstUp ? firstUp.lines : 0,
      upstreamEvidence: firstUp ? contextSnippet(firstUp.text, a.anchor) : "",
      convertedHits,
      status,
    };
  });

  return {
    index, route, skill, mode, title, docs,
    requiredDocs, optionalDocs, reqLines, optLines,
    capabilities, convertedLines, nodeIds, anchors,
  };
});

function contextSnippet(text, needle) {
  const i = text.toLowerCase().indexOf(String(needle).toLowerCase());
  if (i < 0) return "";
  const start = Math.max(0, i - 90);
  const end = Math.min(text.length, i + String(needle).length + 160);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

// ---------- overview ----------
const statusMeta = {
  preserved: { label: "已保留", cls: "ok" },
  gap: { label: "存在缺口", cls: "bad" },
  converted_only: { label: "仅转换侧", cls: "warn" },
  missing: { label: "双侧缺失", cls: "muted" },
  flow: { label: "流程锚点·已引擎化", cls: "info" },
};
const allAnchors = MODE_RESULTS.flatMap((m) => m.anchors.map((a) => ({ ...a, mode: m.route, modeTitle: m.title })));
const anchorCounts = Object.fromEntries(Object.keys(statusMeta).map((k) => [k, allAnchors.filter((a) => a.status === k).length]));
const totalReq = MODE_RESULTS.reduce((s, m) => s + m.reqLines, 0);
const totalOpt = MODE_RESULTS.reduce((s, m) => s + m.optLines, 0);
const totalConverted = MODE_RESULTS.reduce((s, m) => s + m.convertedLines, 0);
const uniqueDocs = new Map();
for (const m of MODE_RESULTS) for (const d of m.docs) uniqueDocs.set(d.rel, d);
const uniqueDocLines = [...uniqueDocs.values()].reduce((s, d) => s + d.lines, 0);

function docRow(d) {
  return `<tr class="${d.optional ? "opt" : "req"}"><td>${esc(d.rel)}</td><td><span class="badge kind-${d.kind.toLowerCase()}">${esc(d.kind)}</span></td><td>${d.optional ? "选读" : "<strong>必读</strong>"}</td><td class="num">${d.lines}</td><td>${esc(d.purpose)}</td></tr>`;
}

function anchorRows(modeResult) {
  return modeResult.anchors.map((a) => {
    const meta = statusMeta[a.status];
    return `<tr class="anchor-${a.status}">
      <td><code>${esc(a.anchor)}</code></td>
      <td>${esc(a.label)}</td>
      <td class="mono">${a.upstreamHits.length ? a.upstreamHits.slice(0, 2).map(esc).join("<br>") + (a.upstreamHits.length > 2 ? `<br>+${a.upstreamHits.length - 2}` : "") : "—"}</td>
      <td class="mono">${a.convertedHits.length ? a.convertedHits.slice(0, 3).map(esc).join("<br>") + (a.convertedHits.length > 3 ? `<br>+${a.convertedHits.length - 3}` : "") : "—"}</td>
      <td><span class="status status-${a.status}">${meta.label}</span></td>
      <td class="evidence">${esc(a.upstreamEvidence) || "—"}</td>
    </tr>`;
  }).join("\n");
}

function modeSection(m) {
  const gaps = m.anchors.filter((a) => a.status === "gap" || a.status === "missing");
  return `<section class="mode-panel" id="panel-${m.index}" ${m.index === 0 ? "active" : ""}>
  <div class="mode-hero">
    <div><div class="mode-route">${esc(m.route)}</div><h2>${esc(m.title)}</h2></div>
    <div class="metric-grid">
      <div class="metric"><span>必读文档</span><b>${m.requiredDocs.length}</b><i>${m.reqLines.toLocaleString()} 行</i></div>
      <div class="metric"><span>选读文档</span><b>${m.optionalDocs.length}</b><i>${m.optLines.toLocaleString()} 行</i></div>
      <div class="metric"><span>转换节点</span><b>${m.capabilities.length}</b><i>${m.convertedLines.toLocaleString()} 行</i></div>
      <div class="metric"><span>锚点保留率</span><b>${m.anchors.length ? Math.round(m.anchors.filter((a) => a.status === "preserved").length / m.anchors.length * 100) : 0}%</b><i>${m.anchors.filter((a) => a.status === "preserved").length}/${m.anchors.length}</i></div>
    </div>
  </div>
  <div class="mode-grid">
    <div class="column">
      <h3>上游指令遍历清单（必读/选读）</h3>
      <p class="note">必读 = 执行该 mode 必需进入上下文的指令；选读 = provider 或背景类指令，按条件读取。</p>
      <table class="doc-table"><thead><tr><th>文档</th><th>类型</th><th>级别</th><th class="num">行数</th><th>用途</th></tr></thead><tbody>${m.docs.map(docRow).join("\n")}</tbody></table>
    </div>
    <div class="column">
      <h3>关键指令锚点匹配</h3>
      <p class="note">锚点为上游指令与转换后 capability 指令/knowledge 之间用于确认语义匹配的关键字符串。</p>
      <table class="anchor-table"><thead><tr><th>锚点</th><th>含义</th><th>上游命中文档</th><th>转换侧命中节点</th><th>状态</th><th>上游证据片段</th></tr></thead><tbody>${anchorRows(m)}</tbody></table>
      ${gaps.length ? `<div class="gap-box"><strong>缺口提示</strong>${gaps.map((g) => `<div><code>${esc(g.anchor)}</code> · ${esc(g.label)}：${g.status === "gap" ? "上游有明确指令，转换侧未找到对应锚点" : "双侧均未找到锚点"}</div>`).join("")}</div>` : ""}
    </div>
  </div>
</section>`;
}

const overviewRows = MODE_RESULTS.map((m) => {
  const preserved = m.anchors.filter((a) => a.status === "preserved").length;
  const gaps = m.anchors.filter((a) => a.status === "gap" || a.status === "missing").length;
  const flow = m.anchors.filter((a) => a.status === "flow").length;
  return `<tr><td class="mono">${esc(m.route)}</td><td>${esc(m.title)}</td><td class="num">${m.requiredDocs.length} / ${m.reqLines.toLocaleString()}</td><td class="num">${m.optionalDocs.length} / ${m.optLines.toLocaleString()}</td><td class="num">${m.capabilities.length} / ${m.convertedLines.toLocaleString()}</td><td class="num">${m.anchors.length ? Math.round(preserved / m.anchors.length * 100) : 0}%</td><td class="num">${gaps ? `<span class="bad">${gaps}</span>` : "0"}${flow ? ` <span class="flow-chip">${flow} 流程锚点</span>` : ""}</td></tr>`;
}).join("\n");
const tabButtons = MODE_RESULTS.map((m) => `<button class="tab skill-${esc(m.skill)}" data-panel="panel-${m.index}"><span class="skill-dot"></span><span class="tab-mode">${esc(m.mode)}</span><span class="tab-title">${esc(m.title)}</span></button>`);
const groupedTabs = [...new Set(MODE_RESULTS.map((m) => m.skill))].map((skill) => `<div class="tab-group"><span class="tab-group-label">${esc(skill)}</span>${tabButtons.map((btn, i) => MODE_RESULTS[i]?.skill === skill ? btn : "").join("")}</div>`).join("\n");
const panels = MODE_RESULTS.map(modeSection).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARSU 27 Modes × Capability Graph 匹配性自评估</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--line:#e3e7ee;--line-strong:#cfd6e2;--ink:#1c2433;--ink-soft:#49566b;--muted:#7a8699;--accent:#2b4c8c;--ok:#2e7d4f;--ok-soft:#eef7f1;--bad:#b23b3b;--bad-soft:#fdf1f0;--warn:#8c6d1f;--warn-soft:#fbf6e5;--deep:#0f6b5c;--paper:#2b4c8c;--reviewer:#7a3fb8;--pipeline:#b36b00}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:var(--ink);background:var(--bg);line-height:1.6;font-size:14px}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em;background:#f0f2f5;padding:1px 5px;border-radius:4px;color:#35415a}
header.app{z-index:1;background:#fff;border-bottom:1px solid var(--line);padding:16px 22px 12px}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
h1{font-size:23px;margin:4px 0 6px}
.subtitle{max-width:1100px;color:var(--ink-soft)}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;max-width:1200px;margin:12px 0 0}
.sum-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px}
.sum-card b{display:block;font-size:22px;color:var(--accent)}
.sum-card span{font-size:12px;color:var(--muted)}
details.overview{max-width:1800px;margin:14px auto 0;padding:0 22px}
details.overview>summary{cursor:pointer;background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-weight:600;color:var(--accent)}
.overview-table{margin:8px 0 0;background:#fff}
.bad{display:inline-block;min-width:18px;text-align:center;color:var(--bad);background:var(--bad-soft);border-radius:999px;padding:0 6px;font-weight:700}
.flow-chip{color:var(--accent);background:var(--accent-soft, #eef5fc);border-radius:999px;padding:0 6px;white-space:nowrap}
.tabbar{position:sticky;top:0;z-index:25;background:var(--bg);padding:10px 22px 8px;border-bottom:1px solid var(--line);overflow-x:auto;white-space:nowrap;scrollbar-width:thin}
.tab{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line-strong);background:#fff;color:var(--ink-soft);border-radius:9px;padding:6px 10px;margin-right:8px;cursor:pointer;font-size:12.5px}
.tab.active{background:var(--ink);border-color:var(--ink);color:#fff}
.tab .tab-mode{font-weight:700;font-family:ui-monospace,Menlo,Consolas,monospace}
.skill-dot{width:8px;height:8px;border-radius:50%;background:var(--deep)}
.tab.skill-academic-paper .skill-dot{background:var(--paper)}
.tab.skill-academic-paper-reviewer .skill-dot{background:var(--reviewer)}
.tab.skill-academic-pipeline .skill-dot{background:var(--pipeline)}
.tab-group{display:inline-block;margin-right:12px;border-right:1px solid var(--line);padding-right:12px;vertical-align:top}
.tab-group-label{display:block;font-size:11px;letter-spacing:.08em;color:var(--muted);margin-bottom:4px;text-transform:uppercase}
main{max-width:1800px;margin:16px auto 90px;padding:0 22px}
.mode-panel{display:none}
.mode-panel[active]{display:block}
.mode-hero{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin-bottom:12px}
.mode-route{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent);font-weight:700}
.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px}
.metric{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:8px 12px;min-width:120px}
.metric span{display:block;font-size:11px;color:var(--muted)}
.metric b{display:block;font-size:20px;color:var(--accent)}
.metric i{display:block;font-style:normal;font-size:11px;color:var(--ink-soft)}
.mode-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:14px;align-items:start}
.column{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
.column h3{margin:0 0 4px;font-size:16px}
.note{color:var(--muted);font-size:12.5px;margin:0 0 10px}
table{border-collapse:collapse;width:100%;font-size:12.5px}
th,td{border:1px solid var(--line);padding:6px 8px;vertical-align:top;text-align:left}
th{background:#f4f6f9;color:var(--ink-soft);font-weight:600;position:sticky;top:0}
tr.req td:first-child{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px}
tr.opt td{color:var(--muted)}
tr.opt td:first-child{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px}
.num{text-align:right;font-variant-numeric:tabular-nums}
.badge{font-size:10px;font-weight:700;padding:1px 7px;border-radius:999px;border:1px solid;white-space:nowrap}
.kind-skill{color:#0f6b5c;border-color:#a8d8cc;background:#eaf6f2}
.kind-registry{color:#2b4c8c;border-color:#b9cbec;background:#eef3fb}
.kind-agent{color:#7a3fb8;border-color:#d9c2ee;background:#f6effc}
.kind-reference{color:#b36b00;border-color:#ecd09a;background:#fdf5e7}
.kind-shared{color:#54606f;border-color:#ccd2da;background:#f2f4f7}
.kind-template{color:#8c5b1f;border-color:#e3cba4;background:#fbf3e4}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px}
.evidence{color:var(--ink-soft);font-size:12px;max-width:420px}
.status{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}
.status-ok{color:var(--ok);background:var(--ok-soft);border:1px solid #bfe3cc}
.status-bad{color:var(--bad);background:var(--bad-soft);border:1px solid #efc2c2}
.status-warn{color:var(--warn);background:var(--warn-soft);border:1px solid #ecd09a}
.status-muted{color:var(--muted);background:#f2f4f7;border:1px solid var(--line-strong)}
.status-info{color:#1f5a8c;background:#eef5fc;border:1px solid #bfd9f0}
tr.anchor-gap td{background:#fffafa}
tr.anchor-missing td{background:#fafafa}
.gap-box{margin-top:10px;background:var(--bad-soft);border:1px solid #efc2c2;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#7c2f2f}
.gap-box div{margin:4px 0}
footer{padding:20px 22px 40px;color:var(--muted);font-size:12px;max-width:1800px;margin:0 auto}
@media (max-width:1200px){.mode-grid{grid-template-columns:1fr}.metric-grid{grid-template-columns:repeat(2,1fr)}}
@media print{header.app,.tabbar,footer{display:none}.mode-panel{display:block!important;page-break-after:always}}
</style>
</head>
<body>
<header class="app">
<div class="eyebrow">Self Assessment · ARS 27 modes × capability graph matching</div>
<h1>ARSU 27 Modes 与转换后 Graph 的流程/指令匹配性自评估</h1>
<p class="subtitle">数据来自 <code>audits/arsu/&lt;anchor&gt;/artifacts/arsu-mode-capability-review.html</code>：按 mode 统计上游必读/选读行数，并用关键字符串锚点核对上游指令是否在转换后的 capability SKILL 或 knowledge 中保留。该评估是审阅辅助，不是自动化语义等价证明。</p>
<div class="summary">
  <div class="sum-card"><span>Mode 总数</span><b>${MODE_RESULTS.length}</b></div>
  <div class="sum-card"><span>锚点总数</span><b>${allAnchors.length}</b></div>
  <div class="sum-card"><span>锚点已保留</span><b>${anchorCounts.preserved}</b></div>
  <div class="sum-card"><span>锚点存在缺口</span><b>${anchorCounts.gap + anchorCounts.missing}</b></div>
  <div class="sum-card"><span>流程锚点已引擎化</span><b>${anchorCounts.flow}</b></div>
  <div class="sum-card"><span>仅转换侧锚点</span><b>${anchorCounts.converted_only}</b></div>
  <div class="sum-card"><span>Mode 累计必读行数</span><b>${totalReq.toLocaleString()}</b></div>
  <div class="sum-card"><span>Mode 累计选读行数</span><b>${totalOpt.toLocaleString()}</b></div>
  <div class="sum-card"><span>上游去重文档总行数</span><b>${uniqueDocLines.toLocaleString()}</b></div>
  <div class="sum-card"><span>Mode 累计转换侧行数</span><b>${totalConverted.toLocaleString()}</b></div>
</div>
</header>
<details class="overview" open>
<summary>27 modes 一览表（必读/选读行数 · 转换节点行数 · 锚点保留率）</summary>
<table class="overview-table"><thead><tr><th>Route</th><th>Mode</th><th>必读 文档/行数</th><th>选读 文档/行数</th><th>转换节点/行数</th><th>锚点保留率</th><th>缺口</th></tr></thead><tbody>${overviewRows}</tbody></table>
</details>
<nav class="tabbar" id="tabbar">${groupedTabs}</nav>
<main>${panels}</main>
<footer>生成器：<code>scripts/generate-arsu-graph-match-assessment-html.mjs</code>。修复前缺口语义复核快照见 <a href="arsu-mode-gap-semantic-review.html">arsu-mode-gap-semantic-review.html</a>。状态含义：<span class="status status-ok">已保留</span> = 上游与转换侧均命中；<span class="status status-bad">存在缺口</span> = 上游有、转换侧未命中；<span class="status status-warn">仅转换侧</span> = 仅转换侧命中；<span class="status status-info">流程锚点·已引擎化</span> = 上游流程词已由 graph profile/Gate 承担，预期不出现在 capability SKILL；<span class="status status-muted">双侧缺失</span> = 两侧均未命中。必读/选读规则：SKILL/REGISTRY/AGENT/TEMPLATE 为必读；mode selection、spectrum、intent clarification、integration guide、mode advisor 与各 API protocol 为选读。</footer>
<script>
const tabs=[...document.querySelectorAll('.tab')];
const panels=[...document.querySelectorAll('.mode-panel')];
function activate(i){tabs.forEach(t=>t.classList.toggle('active',t===tabs[i]));panels.forEach((p,n)=>n===i?p.setAttribute('active',''):p.removeAttribute('active'));window.scrollTo({top:0,behavior:'smooth'});}
tabs.forEach((t,i)=>t.addEventListener('click',()=>activate(i)));
activate(0);
</script>
</body>
</html>
`;
writeFileSync(OUT, html, "utf8");
process.stdout.write(`wrote ${OUT} (${Math.round(Buffer.byteLength(html, "utf8") / 1024)} KiB)\n`);
