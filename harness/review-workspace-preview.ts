import { sha256 } from "../src/core/workspace/write-plan.js";
import {
  annotationCandidateReviewWorkspaceV2,
  assembleReviewWorkspace,
  paperHumanizerReviewWorkspaceV2,
  reviewBlocksFromMarkdown,
  reviewBlocksFromPandocAst,
  reviewResponseReviewWorkspaceV2,
  type FrozenSourceSet,
  type ReviewWorkspaceV2,
} from "../src/review-workspace.js";

export const REVIEW_PREVIEW_CASES = [
  { id: "annotation-intake", label: "稿件批注 · Markdown" },
  { id: "paper-humanizer", label: "语言润色 · Quarto" },
  { id: "review-response", label: "审稿回复 · LaTeX" },
  { id: "empty", label: "无预置项" },
] as const;

export type ReviewPreviewCase = typeof REVIEW_PREVIEW_CASES[number]["id"];

function frozen(id: string, entry: string, content: string): FrozenSourceSet {
  return { workspace_id: `preview-${id}`, entry_path: entry, files: [{ path: entry, sha256: sha256(content) }], capture_limitations: [] };
}

export function reviewWorkspacePreviewSamples(): Record<ReviewPreviewCase, ReviewWorkspaceV2> {
  const annotationText = "# 引言\n\n本文分析城市绿地与居民睡眠的关系。\n\n## 方法\n\n我们调查了 120 名参与者。\n\n<script>window.__previewUnsafe = true</script>\n";
  const annotation = annotationCandidateReviewWorkspaceV2({
    workspaceId: "preview-annotation-intake", title: "稿件批注样例",
    manuscript: { path: "paper.md", content: annotationText }, frozen: frozen("annotation-intake", "paper.md", annotationText),
    blocks: reviewBlocksFromMarkdown(annotationText, "paper.md"),
    candidate: {
      schema_version: "1", annotation_set_id: "preview-annotations", intake_session_id: "preview-annotations",
      manuscript: { path: "paper.md", sha256: sha256(annotationText) },
      raw_sources: [{ source_id: "feedback", path: "feedback.md", sha256: sha256("反馈"), format: "markdown_feedback", media_type: "text/markdown" }],
      annotations: [
        { annotation_id: "A-001", raw_body: "请补充样本来源。", source_pointer: "/comments/0", source_ref: { kind: "review_delta", source_id: "feedback", delta_id: "D-1" }, target: { kind: "section", heading: "方法" }, agent_interpretation: "说明招募渠道。", expected_action: "补充样本来源", semantic_impact: { level: "ordinary" }, clarification: null },
        { annotation_id: "A-002", raw_body: "不要暗示因果关系。", source_pointer: "/comments/1", source_ref: { kind: "review_delta", source_id: "feedback", delta_id: "D-2" }, target: { kind: "document" }, agent_interpretation: "限定观察性结论。", expected_action: "限定结论", semantic_impact: { level: "high", categories: ["claim"] }, clarification: null },
        { annotation_id: "A-003", raw_body: "方法措辞不清楚。", source_pointer: "/comments/2", source_ref: { kind: "review_delta", source_id: "feedback", delta_id: "D-3" }, target: { kind: "document" }, agent_interpretation: "澄清术语。", expected_action: "澄清方法", semantic_impact: { level: "ordinary" }, clarification: null },
      ],
    },
  });
  const quartoText = "---\ntitle: 城市绿地与睡眠\n---\n\n# 研究背景\n\n本研究探讨了城市绿地。本研究还探讨了居民睡眠。\n\n# 结果\n\n绿地暴露与睡眠时长相关，但不能据此推断因果关系。\n";
  const humanizer = paperHumanizerReviewWorkspaceV2({
    workspaceId: "preview-paper-humanizer", title: "语言润色样例", selector: "gate:preview/plan", formalAction: "gate",
    manuscript: { path: "paper.qmd", content: quartoText }, frozen: frozen("paper-humanizer", "paper.qmd", quartoText),
    blocks: reviewBlocksFromMarkdown(quartoText.replace(/^---[\s\S]*?---\n/, ""), "paper.qmd"),
    plan: { summary: "保留事实和引用。", user_constraints: ["不更改结论"], items: [
      { item_id: "H-001", finding_ids: ["F-001"], locators: ["研究背景"], operation: "合并重复句式", expected_effect: "减少重复", preservation_constraints: ["保留范围"], risk: "low", recommendation: "include", disposition: "pending" },
      { item_id: "H-002", finding_ids: ["F-002"], locators: ["结果"], operation: "澄清关联", expected_effect: "保留相关性限定", preservation_constraints: ["不得改成因果"], risk: "medium", recommendation: "include", disposition: "pending" },
      { item_id: "H-003", finding_ids: ["F-003"], locators: ["全文"], operation: "统一术语", expected_effect: "称谓一致", preservation_constraints: [], risk: "low", recommendation: "defer", disposition: "pending" },
    ] },
  });
  const latexText = "\\section{Methods}\nWe recruited 120 adults.\n\\section{Results}\nThe model estimated an association.\n\\custom{Unconverted table}\n";
  const response = reviewResponseReviewWorkspaceV2({
    workspaceId: "preview-review-response", title: "审稿回复样例", selector: "node:preview/response",
    manuscript: { path: "paper.tex", content: latexText }, frozen: frozen("review-response", "paper.tex", latexText),
    blocks: reviewBlocksFromPandocAst({ blocks: [
      { t: "Header", c: [1, ["methods", [], []], [{ t: "Str", c: "Methods" }]] },
      { t: "Para", c: [{ t: "Str", c: "We" }, { t: "Space" }, { t: "Str", c: "recruited" }, { t: "Space" }, { t: "Str", c: "120" }, { t: "Space" }, { t: "Str", c: "adults." }] },
      { t: "Header", c: [1, ["results", [], []], [{ t: "Str", c: "Results" }]] },
      { t: "Para", c: [{ t: "Str", c: "The" }, { t: "Space" }, { t: "Str", c: "model" }, { t: "Space" }, { t: "Str", c: "estimated" }, { t: "Space" }, { t: "Str", c: "an" }, { t: "Space" }, { t: "Str", c: "association." }] },
    ] }, "paper.tex", {}, [{ text: "\\custom{Unconverted table}", source_path: "paper.tex", note: "无法可靠转换" }]),
    workboard: { items: [
      { comment_id: "R1-01", title: "解释招募", source_text: "Clarify recruitment.", source_pointer: "R1.1", target_locations: ["Methods"], status: "open", priority: "high", evidence_gap: "招募记录", user_confirmation_needed: true, next_action: "补充渠道" },
      { comment_id: "R1-02", title: "限定结论", source_text: "Avoid causal language.", source_pointer: "R1.2", target_locations: ["Results"], status: "open", priority: "medium", evidence_gap: "", user_confirmation_needed: false, next_action: "限定表述" },
      { comment_id: "R2-01", title: "补充分析", source_text: "Add sensitivity analysis.", source_pointer: "R2.1", target_locations: ["Results"], status: "blocked", priority: "high", evidence_gap: "无分析结果", user_confirmation_needed: true, next_action: "先取得结果" },
    ] },
  });
  const emptyText = "# 空白审阅\n\n这是没有预置 Agent 项的审阅件。用户可以直接选中文字批注。\n";
  const empty = assembleReviewWorkspace({
    frozen: frozen("empty", "blank.md", emptyText), format: "markdown", adapter: "annotation-intake", title: "空白批注样例",
    blocks: reviewBlocksFromMarkdown(emptyText, "blank.md"),
  });
  return { "annotation-intake": annotation, "paper-humanizer": humanizer, "review-response": response, empty };
}

export function renderReviewWorkspacePreview(sourceHtml: string, sample: ReviewWorkspaceV2): string {
  if (!sourceHtml.includes("</body>")) throw new Error("Review workspace HTML has no closing body tag.");
  const encoded = Buffer.from(JSON.stringify(sample), "utf8").toString("base64");
  const cases = JSON.stringify(REVIEW_PREVIEW_CASES);
  const selected = sample.items.length === 0 ? "empty" : sample.adapter;
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
