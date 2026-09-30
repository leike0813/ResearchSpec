import { readFileSync } from "node:fs";
import path from "node:path";
import { REVISION_MASTER_PREVIEW_CASES } from "./revision-master-preview.js";

import { sha256 } from "../src/core/workspace/write-plan.js";
import {
  annotationCandidateReviewWorkspaceV2,
  assembleReviewWorkspace,
  paperHumanizerComparisonReviewWorkspaceV2,
  paperHumanizerReviewWorkspaceV2,
  reviewBlocksFromMarkdown,
  reviewBlocksFromPandocAst,
  type FrozenSourceSet,
  type ReviewBlock,
  type ReviewWorkspaceV2,
} from "../src/review-workspace.js";

export const REVIEW_PREVIEW_CASES = [
  { id: "article-rendered", label: "文章修订 · 排版正文" },
  { id: "article-fallback", label: "文章修订 · 原始来源" },
  { id: "humanizer-plan-rendered", label: "润色方案 · 排版正文" },
  { id: "humanizer-plan-fallback", label: "润色方案 · 原始来源" },
  { id: "humanizer-candidate-rendered", label: "候选稿比较 · 排版正文" },
  { id: "humanizer-candidate-fallback", label: "候选稿比较 · 原始来源" },
  { id: "empty", label: "空白 Markdown 批注" },
] as const;

export type ReviewPreviewCase = typeof REVIEW_PREVIEW_CASES[number]["id"];

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const imagePath = "figures/green-space.png";
const imageAsset = { id: "green-space", mime: "image/png" as const, base64: png, source_path: imagePath };
const article = `# 城市绿地与社区睡眠：一项观察性研究

本稿汇总社区问卷与绿地覆盖率的关联证据。**请把关联和因果解释分开**；量表、自报暴露以及失访都可能影响估计。

## 摘要

我们分析了来自三个城区的 318 份有效问卷，比较居住地附近绿地覆盖率与睡眠质量评分。较高的绿地覆盖率与较好的自报睡眠有关，但横断面设计无法确定方向或排除残余混杂。结论仅适用于本次样本和测量窗口。

## 方法

参与者由社区卫生中心转发招募信息，问卷在 2025 年春季收集。绿地暴露按住址周围 500 米缓冲区计算；没有收集夜间噪声、轮班工作和长期迁居史。分析使用年龄与性别调整的线性模型，未对缺失值作插补。

| 变量 | 有效样本 | 测量方式 |
| --- | ---: | --- |
| 睡眠评分 | 318 | 自报量表 |
| 绿地覆盖 | 304 | 遥感缓冲区 |

模型写作 $Y = β_0 + β_1 G + ε$，其中 G 是绿地覆盖率。该公式描述估计关系，不构成因果识别。

## 结果

调整后，绿地覆盖率每增加十个百分点，睡眠评分平均提高 0.18 分；95% 置信区间为 0.03 至 0.33。分层分析的区间更宽，部分跨越零。我们没有完成预注册的夜间噪声敏感性分析。

![三个城区的绿地覆盖示意图](${imagePath})

## 讨论

结果与此前观察性报告 [@wang2024] 的方向相近，但样本来源、暴露测量和缺失数据限制了可推广性。修订时应保留区间和未完成分析的说明，也应说明哪些结论仍需额外数据支持。

[^scale]: 量表分数越高代表自报睡眠质量越好。
`;
const base = `---
title: 城市绿地与睡眠质量
format: html
---

# 摘要

城市绿地显著改善所有居民的睡眠质量。本研究分析了 318 份社区问卷，报告绿地覆盖率与睡眠评分之间的关系。我们证明绿地暴露可以降低失眠风险。

# 方法

问卷于 2025 年春季完成。绿地覆盖率以住址周围 500 米缓冲区估算。我们调整了年龄和性别，但没有测量轮班工作、夜间噪声及迁居史。

| 指标 | 样本数 | 说明 |
| --- | ---: | --- |
| 睡眠评分 | 318 | 自报量表 |
| 绿地覆盖率 | 304 | 遥感估计 |

# 结果

绿地覆盖率每增加十个百分点，睡眠评分平均提高 0.18 分，95% 置信区间为 0.03 至 0.33。分层结果存在不确定性，部分区间跨越零。

估计模型为 $Y = β_0 + β_1 G + ε$。我们没有完成夜间噪声敏感性分析。

# 讨论

我们的发现证明城市绿地是改善睡眠的有效干预手段。这一结论适用于所有城市人群，与既有研究 [@wang2024] 完全一致。

[^limit]: 横断面设计不能确定暴露和结局的时间顺序。
`;
const candidate = `---
title: 城市绿地与睡眠质量
format: html
---

# 摘要

在这份社区样本中，较高绿地覆盖率与较好的自报睡眠评分相关。本研究分析了 318 份社区问卷，报告绿地覆盖率与睡眠评分之间的关系。横断面资料尚不足以判断绿地暴露能否降低失眠风险。

# 方法

问卷于 2025 年春季完成。绿地覆盖率以住址周围 500 米缓冲区估算。模型调整了年龄和性别；轮班工作、夜间噪声及迁居史未纳入测量。

| 指标 | 样本数 | 说明 |
| --- | ---: | --- |
| 睡眠评分 | 318 | 自报量表 |
| 绿地覆盖率 | 304 | 遥感估计 |

# 结果

绿地覆盖率每增加十个百分点，睡眠评分平均提高 0.18 分，95% 置信区间为 0.03 至 0.33。分层结果存在不确定性，部分区间跨越零。

估计模型为 $Y = β_0 + β_1 G + ε$。夜间噪声敏感性分析尚未完成。

# 讨论

这些观察性结果提示绿地暴露与睡眠评分可能有关，尚不能支持干预效果或推广到所有城市人群。与既有报告 [@wang2024] 的方向相近，但测量方式与样本来源不同。

[^limit]: 横断面设计不能确定暴露和结局的时间顺序。
`;
const renderedSourceHashes = {
  article: "085983ae1c5e2eaf4b2d78e7a409fe906deeb3a9c5f6768d26481b30352aa1de",
  base: "03688d86eeac160879ef11548440f94097cd3f9312b7abf2078896864c0412f5",
  candidate: "7c88581a0d0acf677703d63b059615e9f154d984d2e7df9d93f8ff224aed0349",
};

function frozen(id: string, entry: string, sources: Record<string, string | Buffer>): FrozenSourceSet {
  return {
    workspace_id: `preview-${id}`, entry_path: entry,
    files: Object.entries(sources).map(([file, content]) => ({ path: file, sha256: sha256(content) })).sort((a, b) => a.path.localeCompare(b.path)),
    capture_limitations: [],
  };
}

function rendered(source: string, sourcePath: string): ReviewBlock[] {
  if (sourcePath === "blank.md") return reviewBlocksFromMarkdown(source, sourcePath);
  const name = sourcePath === "paper.md" ? "article" : sourcePath === "base.qmd" ? "base" : "candidate";
  if (sha256(source) !== renderedSourceHashes[name]) throw new Error(`Preview rendered fixture is stale: ${name}`);
  const ast = JSON.parse(readFileSync(path.resolve("harness/fixtures", `${name}.pandoc.json`), "utf8")) as unknown;
  return reviewBlocksFromPandocAst(ast, sourcePath, { [imagePath]: imageAsset.id });
}

function fallback(source: string, sourcePath: string): ReviewBlock[] {
  return source.trim().split(/\n\s*\n/).map((text, index) => ({
    id: `raw-${String(index + 1)}`, kind: "raw-source", text, runs: [], level: null,
    source_path: sourcePath, resource_id: null, note: "未运行项目渲染；显示冻结来源片段",
  }));
}

function place(blocks: ReviewBlock[], itemId: string, phrase: string) {
  const block = blocks.find((entry) => entry.text.includes(phrase));
  if (!block) throw new Error(`Preview phrase missing: ${phrase}`);
  const start = block.text.indexOf(phrase);
  return { item_id: itemId, block_id: block.id, start, end: start + phrase.length };
}

const plan = { summary: "保留数值、设计限制和引文，仅调整过强的结论与重复措辞。", user_constraints: ["不添加未做过的分析", "保留 318 与 304 两个样本数"], items: [
  { item_id: "H-001", finding_ids: ["F-01"], locators: ["摘要首段"], operation: "限定因果表述", expected_effect: "读者能区分关联与干预效果", preservation_constraints: ["保留横断面限制", "保留样本数"], risk: "high", recommendation: "include" as const, disposition: "pending" as const },
  { item_id: "H-002", finding_ids: ["F-02"], locators: ["方法段"], operation: "合并测量限制", expected_effect: "方法信息更紧凑", preservation_constraints: ["三个未测变量均须保留"], risk: "medium", recommendation: "include" as const, disposition: "pending" as const },
  { item_id: "H-003", finding_ids: ["F-03"], locators: ["结果末段"], operation: "保留未完成分析说明", expected_effect: "避免遗漏证据边界", preservation_constraints: ["不得暗示已完成分析"], risk: "high", recommendation: "include" as const, disposition: "pending" as const },
  { item_id: "H-004", finding_ids: ["F-04"], locators: ["讨论首段"], operation: "收窄推广范围", expected_effect: "讨论与数据一致", preservation_constraints: ["保留引用和差异说明"], risk: "medium", recommendation: "include" as const, disposition: "pending" as const },
] };

export function reviewWorkspacePreviewSamples(): Record<ReviewPreviewCase, ReviewWorkspaceV2> {
  const cases = {} as Record<ReviewPreviewCase, ReviewWorkspaceV2>;
  for (const mode of ["rendered", "fallback"] as const) {
    const raw = mode === "fallback";
    const articleId = `article-${mode}` as ReviewPreviewCase;
    const articleBlocks = raw ? fallback(article, "paper.md") : rendered(article, "paper.md");
    const annotationIds = ["A-001", "A-002", "A-003", "A-004", "A-005"];
    const annotationPhrases = ["横断面设计", "没有收集夜间噪声", "部分跨越零", "没有完成预注册", "可推广性"];
    cases[articleId] = annotationCandidateReviewWorkspaceV2({
      workspaceId: `preview-${articleId}`, title: raw ? "文章修订 · 来源回退" : "文章修订 · 排版审阅", manuscript: { path: "paper.md", content: article },
      frozen: frozen(articleId, "paper.md", { "paper.md": article, [imagePath]: Buffer.from(png, "base64") }),
      blocks: articleBlocks, assets: raw ? [] : [imageAsset],
      itemLocations: annotationIds.map((id, index) => place(articleBlocks, id, annotationPhrases[index])),
      candidate: {
        schema_version: "1", annotation_set_id: "preview-article", intake_session_id: "preview-article", manuscript: { path: "paper.md", sha256: sha256(article) },
        raw_sources: [{ source_id: "feedback", path: "feedback.md", sha256: sha256("fictional feedback"), format: "markdown_feedback", media_type: "text/markdown" }],
        annotations: annotationIds.map((id, index) => ({ annotation_id: id, raw_body: ["请明确横断面设计的限制。", "请说明未测混杂因素。", "分层结果的不确定性应保留。", "未完成分析不能写成已有证据。", "讨论中的推广范围需要收窄。"][index], source_pointer: `/feedback/${String(index)}`, source_ref: { kind: "review_delta" as const, source_id: "feedback", delta_id: `D-${String(index + 1)}` }, target: { kind: "document" as const }, agent_interpretation: "对照原稿核查并保留证据边界", expected_action: ["限定结论", "补充限制", "保留区间", "标明缺口", "收窄推广"][index], semantic_impact: { level: "ordinary" as const }, clarification: null })),
      },
    });

    const planId = `humanizer-plan-${mode}` as ReviewPreviewCase;
    const baseBlocks = raw ? fallback(base, "base.qmd") : rendered(base, "base.qmd");
    const phrases = ["显著改善", "没有测量轮班工作", "没有完成夜间噪声", "适用于所有城市人群"];
    const locations = plan.items.map((item, index) => place(baseBlocks, item.item_id, phrases[index]));
    cases[planId] = paperHumanizerReviewWorkspaceV2({
      workspaceId: `preview-${planId}`, title: raw ? "语言润色方案 · 来源回退" : "语言润色方案 · 排版审阅", selector: "gate:preview/plan", formalAction: "gate",
      manuscript: { path: "base.qmd", content: base, format: "quarto" }, frozen: frozen(planId, "base.qmd", { "base.qmd": base }),
      blocks: baseBlocks, itemLocations: locations, plan,
    });

    const compareId = `humanizer-candidate-${mode}` as ReviewPreviewCase;
    const candidateBlocks = raw ? fallback(candidate, "candidate.qmd") : rendered(candidate, "candidate.qmd");
    const comparePhrases = ["横断面资料尚不足", "轮班工作", "尚未完成", "尚不能支持干预效果"];
    cases[compareId] = paperHumanizerComparisonReviewWorkspaceV2({
      workspaceId: `preview-${compareId}`, title: raw ? "候选稿逐段比较 · 来源回退" : "候选稿逐段比较 · 排版审阅", selector: "node:preview/revision", formalAction: "none",
      manuscript: { path: "candidate.qmd", content: candidate, format: "quarto" }, base: { path: "base.qmd", content: base, format: "quarto" },
      frozen: frozen(compareId, "candidate.qmd", { "base.qmd": base, "candidate.qmd": candidate }),
      blocks: candidateBlocks, baseBlocks, itemLocations: plan.items.map((item, index) => place(candidateBlocks, item.item_id, comparePhrases[index])), plan,
    });
  }
  const emptyText = "# 空白审阅\n\n这份 Markdown 审阅件没有预置 Agent 项。请选中正文中的词语，添加一条自己的批注并导出。\n";
  cases.empty = assembleReviewWorkspace({ frozen: frozen("empty", "blank.md", { "blank.md": emptyText }), format: "markdown", adapter: "annotation-intake", title: "空白 Markdown 批注", blocks: rendered(emptyText, "blank.md") });
  return Object.fromEntries(REVIEW_PREVIEW_CASES.map(({ id }) => [id, cases[id]])) as Record<ReviewPreviewCase, ReviewWorkspaceV2>;
}

export function renderReviewWorkspacePreview(sourceHtml: string, sample: ReviewWorkspaceV2): string {
  if (!sourceHtml.includes("</body>")) throw new Error("Review workspace HTML has no closing body tag.");
  const encoded = Buffer.from(JSON.stringify(sample), "utf8").toString("base64");
  const cases = JSON.stringify([...REVIEW_PREVIEW_CASES, ...REVISION_MASTER_PREVIEW_CASES]);
  const selected = sample.workspace_id.replace(/^preview-/, "");
  const bootstrap = `
  <script>
  (() => {
    const cases = ${cases};
    const select = document.createElement('select');
    select.setAttribute('aria-label', '预览样例');
    for (const item of cases) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      select.append(option);
    }
    select.value = ${JSON.stringify(selected)};
    select.addEventListener('change', () => { location.href = new URL(select.value + '.html', location.href).href; });
    const label = document.createElement('label');
    label.className = 'file-button';
    label.textContent = '开发样例 ';
    label.append(select);
    const header = document.querySelector('header');
    header.insertBefore(label, header.querySelector('.spacer'));
    const bytes = Uint8Array.from(atob('${encoded}'), char => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'preview.json', { type: 'application/json' }));
    const picker = document.getElementById('file');
    picker.files = transfer.files;
    picker.dispatchEvent(new Event('change'));
  })();
  </script>
`;
  return sourceHtml.replace("</body>", `${bootstrap}</body>`);
}
