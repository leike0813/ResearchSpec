#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_ANCHOR = process.env.ARSU_ANCHOR ?? "v3.19.0-828ef3b";
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), "audits", "arsu", DEFAULT_ANCHOR, "artifacts", "arsu-mode-gap-semantic-review.html");
const esc = (text) => String(text ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const findings = [
  {
    id: "GAP-01",
    mode: "deep-research:review",
    anchor: "AI Disclosure",
    title: "AI Disclosure / Ethics Review 语义并未完整转换",
    verdict: "真实缺口（部分覆盖）",
    verdictClass: "real",
    anchorVerdict: "锚点合理，但过窄：它只暴露了披露项，未暴露 ethics review 的其余四个维度",
    upstream: {
      path: "vendor/ars/deep-research/agents/ethics_review_agent.md",
      points: [
        "上游 review mode 激活 editor_in_chief + devils_advocate + ethics_review 三个 agent。",
        "ethics_review_agent 输出 Ethics Review report：attribution check + disclosure assessment + dual-use screening + fair-representation audit + verdict（CLEARED / CONDITIONAL / BLOCKED）。",
        "AI Disclosure 只是 7 个维度之一（AI Disclosure & Transparency、Attribution Integrity、Dual-Use、Fair Representation、Data Ethics、COI、Human Subjects）。",
        "Blocking 条件包括 No AI disclosure，且 BLOCKED 可被用户 override 并记录 Ethics Decision Log。",
      ],
      snippet: "### 1. AI Disclosure & Transparency\n- [ ] No AI-generated content passed off as human-authored\n...\n- No AI disclosure (Blocking Conditions — integrity violations only)",
    },
    converted: {
      points: [
        "check-compliance-check 有 disclosures_required 与 RAISE 原则，覆盖“披露存在性”这一小片语义；但它是 manuscript 合规观察器，不评估 attribution、dual-use、fair representation、data ethics、COI 或 human subjects。",
        "generation-report-compilation / manuscript-drafting 有强制 AI Disclosure Statement，但那是产出物模板，不是 review 判定。",
        "本 mode 的转换映射未包含 compliance-check；即使加入，也只覆盖 disclosure 维度。",
      ],
      snippet: "compliance-check/SKILL.md:\n- disclosures_required: [...]\n- RAISE principles: human_oversight, fit_for_purpose, transparency, reproducibility...",
    },
    conclusion: "确认为真实缺口：缺少 ethics-review capability（或等价 checker）。AI Disclosure 锚点不是假象，但它低估了缺口范围。",
    recommendation: "新增 check-ethics-review 能力（attribution / disclosure / dual-use / fair representation / data ethics / COI / human subjects + overridable BLOCKED 语义），并在 deep-research:review 的 graph 路径中接线。",
  },
  {
    id: "GAP-02",
    mode: "academic-paper:revision",
    anchor: "Response Letter",
    title: "Revision mode 的 point-by-point R&R response 输出链缺失",
    verdict: "真实缺口（部分能力散落在其他 mode）",
    verdictClass: "real",
    anchorVerdict: "锚点合理：Response Letter 是上游明确输出契约",
    upstream: {
      path: "vendor/ars/MODE_REGISTRY.md + vendor/ars/academic-paper/agents/draft_writer_agent.md",
      points: [
        "MODE_REGISTRY 定义 revision 输出为“Revised draft + point-by-point R&R responses”。",
        "draft_writer_agent 在 Patch-Document Revision Emission 中要求：chat output 携带 human-facing revision log 和 provisional Schema 8 response items（response text、status、decline justifications）。",
        "peer_reviewer_agent 明确把 R&R response letter 视为下游 deliverable；修订后需要逐点回应。",
      ],
      snippet: "draft_writer_agent.md:\n\"...Your chat output carries the human-facing revision log ... and your provisional response items — never the patch body.\"",
    },
    converted: {
      points: [
        "transform-revision-patching 只做 anchorize → patch → fail-closed apply，输出 Patch Apply Report；没有 provisional response items 或 Response-to-Reviewers 输出角色。",
        "transform-revision-roadmap-parsing 生成 Response Letter Skeleton，但它是 revision-coach 的评论解析产物，不是 revision 完成后逐点回应。",
        "judgment-review-synthesis 输出格式中有 Response Letter Template，但属于 reviewer 综合节点。",
        "三个相关能力都没有被串成 revision mode 的 response-letter 输出路径。",
      ],
      snippet: "revision-patching/SKILL.md:\nOutputs: patched_manuscript (patched-manuscript.v1)\n## Patch Apply Report\n- applied_actions / untouched_blocks / escalations / output_hash",
    },
    conclusion: "确认为真实组装缺口：response content 的生成指令未进入 revision 路径；锚点无问题。",
    recommendation: "给 revision 路径增加 response-to-reviewers 输出契约（可在 revision-patching 或新 capability 中），逐项绑定 roadmap_item_ids / IL-ID / EA-NNN，并保留 provisional status 语义。",
  },
  {
    id: "GAP-03",
    mode: "academic-paper:rebuttal-audit",
    anchor: "rebuttal / coverage table / gap / risk flags",
    title: "Rebuttal-Audit 是独立 advisory QA，没有任何转换后能力承接",
    verdict: "真实能力缺口",
    verdictClass: "real",
    anchorVerdict: "四个锚点基本合理；“gap”过于宽泛，宜替换为 gap list / addressed-partially-missing",
    upstream: {
      path: "vendor/ars/academic-paper/SKILL.md § Rebuttal-Audit Mode",
      points: [
        "输入 gate：必须同时有 reviewer comments/decision letter 与已有 rebuttal draft。",
        "输出：per-comment coverage table（addressed / partially / missing）、gap list、tone/evidence/misreading risk flags、advisory suggestions。",
        "边界：advisory QA only；不得 emit Schema 11 commitment_extracted，不得写 Material Passport，不得标记 verified/ready_to_submit。",
        "与 re-review 的区别：re-review 验证 revised manuscript，rebuttal-audit 验证 response letter 本身。",
      ],
      snippet: "What it produces:\n- Per-comment coverage table — every reviewer concern marked addressed / partially / missing\n- Gap list — concerns the draft fails to answer\n- Risk flags — tone too combative, claims made without evidence, or a response that misreads the reviewer's actual point",
    },
    converted: {
      points: [
        "transform-revision-roadmap-parsing 只有 comment parsing + roadmap + response skeleton；它不评估“已有 rebuttal 草稿”。",
        "check-claim-faithfulness-audit 检查 claim 忠实性，不是 response-letter 覆盖度。",
        "全 registry 搜索 rebuttal 仅出现在 argument-blueprint 与 devils-advocate 的修辞语境中，没有 rebuttal QA 能力。",
      ],
      snippet: "revision-roadmap-parsing/SKILL.md:\n### Step 2: Comment Parsing ... Response Letter Skeleton: comments listed with [PLACEHOLDER — user fills in]",
    },
    conclusion: "确认为真实缺口；锚点无假象，只有 gap 一词过于通用。",
    recommendation: "新增 check-rebuttal-audit（或扩展 revision-roadmap-parsing 为不可混用的独立 checker）：输入 rebuttal draft + reviewer comments，输出 coverage table、gap list、risk flags、suggestions，并保留 advisory-only / no false certification 边界。",
  },
  {
    id: "GAP-04",
    mode: "academic-paper-reviewer:full",
    anchor: "Strongest Counter-Argument",
    title: "DA capability 已存在，但未接线进 reviewer graph profile",
    verdict: "真实图接线缺口",
    verdictClass: "wiring",
    anchorVerdict: "锚点正确：该短语是 DA 报告格式的核心字段",
    upstream: {
      path: "vendor/ars/academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md",
      points: [
        "DA 报告第一段即 Strongest Counter-Argument（200-300 words），是“整个审查中最重要的部分”。",
        "DA 有独立边界：只挑战、不评分，并维护 CRITICAL 发现、Field-Norm Severity Calibration、Attack Intensity Preservation。",
        "editorial_synthesizer 要求每个 DA-CRITICAL 进入最终决策，checkpoint rule 明确 DA CRITICAL 时不得 Accept。",
      ],
      snippet: "## Devil's Advocate Review\n### Strongest Counter-Argument\n[200-300 words. If you were a scholar holding the opposite view, how would you refute this paper? The most important part of the report.]",
    },
    converted: {
      points: [
        "judgment-devils-advocate-stress-test 的 SKILL.md 完整保留了 Strongest Counter-Argument 输出块与 DA 边界规则。",
        "但 src/core/graph-profiles/academic-paper-reviewer.ts 的节点只有 panel → specialist → editorial → synthesis，没有 DA 节点。",
        "specialist-review 明确声明 R3 不接管 DA；review-synthesis 的 DA-CRITICAL 规则也说明 graph 中应存在 DA 输入。",
      ],
      snippet: "devils-advocate-stress-test/SKILL.md:\n### Strongest Counter-Argument\n[200-300 words ...]",
    },
    conclusion: "锚点不是假象；能力转换成功，但 graph profile 漏接线。",
    recommendation: "在 academic-paper-reviewer graph profile 中增加 DA 节点（与 specialist 并行或前置），并把 DA 输出作为 review-synthesis 的必需输入。",
  },
  {
    id: "GAP-05",
    mode: "academic-paper-reviewer:re-review",
    anchor: "Verification Review / traceability / residual issues / revised manuscript",
    title: "Re-review mode 的核心验证协议没有对应 capability/profile",
    verdict: "真实能力缺口（存在可复用片段）",
    verdictClass: "real",
    anchorVerdict: "四个锚点均合理；traceability 与 residual issues 已有局部同义实现，宜细化为 RR Traceability Matrix / Revision Response Checklist / Verification Review Report",
    upstream: {
      path: "vendor/ars/academic-paper-reviewer/references/re_review_mode_protocol.md",
      points: [
        "核心语义：逐 concern 独立验证 revised manuscript，不接受 rubber-stamp。",
        "Commitment Ledger Verification：核对 revision-roadmap 的 commitment_extracted 与 manuscript/response 证据。",
        "输出 Verification Review Report：Judge Record、Decision、Revision Response Checklist、New Issues、Residual Issues、sprint contract status。",
        "Anti-pattern 明确禁止“all addressed without verification”。",
      ],
      snippet: "re_review_mode_protocol.md:\n## Verification Logic ... ## Commitment Ledger Verification (Kong A1 / v3.11) ... ## Re-Review Output Format\n# Verification Review Report ... ## Residual Issues (If Any)",
    },
    converted: {
      points: [
        "没有 Verification Review Report / RR Traceability Matrix / Revision Response Checklist 的输出契约。",
        "transform-revision-roadmap-parsing 有 commitment_extracted 与 roadmap_item_ids 追溯，是 re-review 的前置片段。",
        "check-pre-submission-self-check 在 re-invoked 时检查 revised draft 是否真正解决 prior items，并列出 remaining Critical items；这是最接近 re-review 的 checker，但没有 commitment ledger 与 response checklist。",
        "judgment-review-synthesis 有 sub-claim 追溯与 revision checklist，但属于首轮综合，不是修订后验证。",
      ],
      snippet: "pre-submission-self-check/SKILL.md:\nWhen re-invoked on a revised draft, verify that each previously reported item is genuinely resolved ... Remaining unresolved Critical items are surfaced...",
    },
    conclusion: "确认为真实能力缺口：re-review 的验证协议没有被单一 capability 承接；锚点不是假象，但 traceability/residual issues 两个锚点已存在跨节点片段，应视为部分覆盖而非完全缺失。",
    recommendation: "新增 check-re-review（或扩展 pre-submission-self-check 为 verification-review 变体）：输入 revised manuscript + revision roadmap + commitment ledger + response-to-reviewers，输出 RR Traceability Matrix、Revision Response Checklist、Residual Issues 与 Verification Review Decision。",
  },
  {
    id: "GAP-06",
    mode: "academic-pipeline:resume_from_passport",
    anchor: "reset boundary / freshness",
    title: "Passport reset boundary 恢复协议完全没有转换承接",
    verdict: "真实能力缺口",
    verdictClass: "real",
    anchorVerdict: "reset boundary 锚点正确；freshness 锚点歧义，应替换为 awaiting_resume / consumes_hash / reset_boundary",
    upstream: {
      path: "vendor/ars/academic-pipeline/references/passport_as_reset_boundary.md",
      points: [
        "定义 FULL checkpoint 在 ARS_PASSPORT_RESET=1 时生成 [PASSPORT-RESET: hash=...] reset boundary。",
        "resume_from_passport=<hash> 必须匹配 passport ledger，禁止 double-resume，需 append kind:resume entry 并携带 consumes_hash。",
        "Ledger 为 append-only；boundary/resume 通过 JCS + SHA-256 哈希链；awaiting_resume 由单遍扫描 ledger 计算。",
        "Resume 时校验 verification_status，pending_decision 必须先由用户选择分支。",
      ],
      snippet: "passport_as_reset_boundary.md:\n[PASSPORT-RESET: hash=<hash>, stage=<completed>, next=<next>] ...\nresume_from_passport=<hash> [stage=...] [mode=...] ...\nA boundary entry ... is considered awaiting resume iff no resume entry exists later with consumes_hash == H.",
    },
    converted: {
      points: [
        "check-passport-verifier 只做 passport schema/字段/来源绑定校验，不实现 reset_boundary、consumes_hash、awaiting_resume。",
        "check-terminal-policy-gate 的 freshness 是 verifier report 复用新鲜度，与 run/passport resume 新鲜度不是同一语义。",
        "graph profile academic-pipeline 只有 research → gate → write → gate → review，没有 finalize/final integrity/passport resume 入口。",
      ],
      snippet: "terminal-policy-gate/SKILL.md:\nReport reuse REQUIRES the freshness guard ... STALE-REPORT -> re-run the verifier ...",
    },
    conclusion: "确认为真实缺口；freshness 锚点存在同名不同义风险，reset boundary 锚点则非常准确。",
    recommendation: "将 passport reset 作为显式 graph 入口/Decision（resume boundary + consumes_hash + pending_decision 分支），并扩展 passport-verifier 或新增 resume-guard checker；不要把 terminal-gate 的 report freshness 当作覆盖证据。",
  },
];

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARSU 模式缺口 · 完整语义复核（修复前快照）</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--line:#e3e7ee;--line-strong:#cfd6e2;--ink:#1c2433;--ink-soft:#49566b;--muted:#7a8699;--accent:#2b4c8c;--ok:#2e7d4f;--ok-soft:#eef7f1;--bad:#b23b3b;--bad-soft:#fdf1f0;--warn:#8c6d1f;--warn-soft:#fbf6e5;--info:#1f5a8c;--info-soft:#eef5fc}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:var(--ink);background:var(--bg);line-height:1.7;font-size:14px}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em;background:#f0f2f5;padding:1px 5px;border-radius:4px;color:#35415a}
pre{background:#101826;color:#d8e3f4;padding:14px 18px;border-radius:10px;overflow:auto;font-size:12.5px;line-height:1.55;white-space:pre-wrap}
header{background:#fff;border-bottom:1px solid var(--line);padding:18px 24px 14px}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
h1{font-size:23px;margin:4px 0 6px}
.subtitle{max-width:1100px;color:var(--ink-soft)}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;max-width:1200px;margin-top:12px}
.sum-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px}
.sum-card b{display:block;font-size:21px;color:var(--accent)}
.sum-card span{font-size:12px;color:var(--muted)}
main{max-width:1280px;margin:18px auto 90px;padding:0 24px}
h2.section{font-size:18px;margin:26px 0 10px;padding-left:10px;border-left:4px solid var(--accent)}
.verdict-table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}
.verdict-table th,.verdict-table td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}
.verdict-table th{background:#f4f6f9;color:var(--ink-soft)}
.gap-card{background:var(--card);border:1px solid var(--line);border-radius:14px;margin:16px 0;overflow:hidden}
.gap-head{display:flex;justify-content:space-between;gap:16px;padding:14px 18px;background:#fbfcfe;border-bottom:1px solid var(--line);flex-wrap:wrap}
.gap-head h3{margin:0;font-size:16px}
.mode-route{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--accent);font-size:13px;font-weight:700}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;border:1px solid;white-space:nowrap}
.badge.real{color:var(--bad);background:var(--bad-soft);border-color:#efc2c2}
.badge.wiring{color:var(--warn);background:var(--warn-soft);border-color:#ecd09a}
.badge.anchor-ok{color:var(--ok);background:var(--ok-soft);border-color:#bfe3cc}
.badge.anchor-fix{color:var(--warn);background:var(--warn-soft);border-color:#ecd09a}
.gap-body{display:grid;grid-template-columns:1fr 1fr;gap:0}
.column{padding:14px 18px;min-width:0}
.column.upstream{background:linear-gradient(180deg,#f3f8ff 0,#fff 180px)}
.column.converted{background:linear-gradient(180deg,#f4fbf8 0,#fff 180px);border-left:1px solid var(--line)}
.column h4{margin:0 0 8px;font-size:14px}
.path{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;color:var(--accent);display:block;margin-bottom:8px}
ul{margin:6px 0;padding-left:18px}
li{margin:5px 0}
.snippet{margin-top:10px}
.snippet-label{font-size:11px;color:var(--muted)}
.judgement{margin:0 18px 14px;background:#fbfcfe;border:1px dashed var(--line-strong);border-radius:10px;padding:10px 14px}
.judgement b{color:var(--accent)}
.recommendation{margin:0 18px 18px;background:var(--info-soft);border:1px solid #bfd9f0;border-radius:10px;padding:10px 14px;color:#1f3f5f}
footer{padding:20px 24px 40px;color:var(--muted);font-size:12px;max-width:1280px;margin:0 auto}
@media (max-width:980px){.gap-body{grid-template-columns:1fr}.column.converted{border-left:0;border-top:1px solid var(--line)}}
</style>
</head>
<body>
<header>
<div class="eyebrow">Gap Semantic Review · evidence-based</div>
<h1>13 个缺口锚点的完整语义复核</h1>
<p class="subtitle">本页为<strong>修复前</strong>逐条语义复核快照。后续已完成缺口补齐并重新生成匹配性评估：当前 116 个锚点中 113 个已保留、3 个为流程锚点已引擎化、0 个真实缺口。本页保留修复前判断作为审阅轨迹。</p>
<div class="summary">
<div class="sum-card"><span>复核缺口锚点</span><b>13</b></div>
<div class="sum-card"><span>真实能力缺口</span><b>5 组</b></div>
<div class="sum-card"><span>真实图接线缺口</span><b>1 组</b></div>
<div class="sum-card"><span>锚点完全合理</span><b>8</b></div>
<div class="sum-card"><span>锚点需细化/替换</span><b>5</b></div>
<div class="sum-card"><span>纯假象</span><b>0</b></div>
</div>
</header>
<main>
<h2 class="section">总判定表</h2>
<table class="verdict-table">
<thead><tr><th>Mode</th><th>缺口锚点</th><th>缺口类型</th><th>锚点质量</th><th>建议动作</th></tr></thead>
<tbody>
<tr><td>deep-research:review</td><td>AI Disclosure</td><td>真实能力缺口（ethics review，部分覆盖）</td><td>合理但过窄</td><td>新增 ethics-review capability 并接线</td></tr>
<tr><td>academic-paper:revision</td><td>Response Letter</td><td>真实组装缺口</td><td>合理</td><td>在 revision 路径补 response-to-reviewers 输出</td></tr>
<tr><td>academic-paper:rebuttal-audit</td><td>rebuttal / coverage table / gap / risk flags</td><td>真实能力缺口</td><td>合理；gap 应细化为 gap list / addressed-partially-missing</td><td>新增 rebuttal-audit checker</td></tr>
<tr><td>academic-paper-reviewer:full</td><td>Strongest Counter-Argument</td><td>真实图接线缺口</td><td>合理</td><td>将 DA capability 接入 reviewer profile</td></tr>
<tr><td>academic-paper-reviewer:re-review</td><td>Verification Review / traceability / residual issues / revised manuscript</td><td>真实能力缺口（存在可复用片段）</td><td>合理；traceability/residual 需细化为协议术语</td><td>新增 re-review checker/profile</td></tr>
<tr><td>academic-pipeline:resume_from_passport</td><td>reset boundary / freshness</td><td>真实能力缺口</td><td>reset boundary 合理；freshness 同名不同义</td><td>新增 passport resume boundary 入口/checker</td></tr>
</tbody>
</table>
${findings.map((f) => `<section class="gap-card">
<div class="gap-head">
<div><div class="mode-route">${esc(f.mode)}</div><h3>${esc(f.id)} · ${esc(f.title)}</h3></div>
<div><span class="badge ${f.verdictClass}">${esc(f.verdict)}</span></div>
</div>
<div class="gap-body">
<div class="column upstream"><h4>上游语义义务</h4><span class="path">${esc(f.upstream.path)}</span><ul>${f.upstream.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul><div class="snippet"><div class="snippet-label">原文证据</div><pre>${esc(f.upstream.snippet)}</pre></div></div>
<div class="column converted"><h4>转换侧实际情况</h4><ul>${f.converted.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul><div class="snippet"><div class="snippet-label">转换侧证据</div><pre>${esc(f.converted.snippet)}</pre></div></div>
</div>
<div class="judgement"><b>锚点质量：</b>${esc(f.anchorVerdict)}<br><b>最终判断：</b>${esc(f.conclusion)}</div>
<div class="recommendation"><b>建议：</b>${esc(f.recommendation)}</div>
</section>`).join("\n")}
</main>
<footer>本复核由 <code>scripts/generate-arsu-gap-semantic-review-html.mjs</code> 生成；证据取自 <code>vendor/ars</code> 上游原文与 <code>skills/capabilities</code> 生成后能力。判断基于逐文件语义阅读，不依赖纯字符串命中。</footer>
</body>
</html>
`;
writeFileSync(OUT, html, "utf8");
process.stdout.write(`wrote ${OUT} (${Math.round(Buffer.byteLength(html, "utf8") / 1024)} KiB)\n`);
