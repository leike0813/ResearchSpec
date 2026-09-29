import { AnnotationSetCandidateSchema } from "../src/core/contracts/annotation.js";
import { sha256 } from "../src/core/workspace/write-plan.js";
import {
  annotationCandidateReviewWorkspace,
  paperHumanizerReviewWorkspace,
  reviewResponseReviewWorkspace,
  type ReviewWorkspaceDescriptor,
} from "../src/review-workspace.js";

export const REVIEW_PREVIEW_CASES = [
  { id: "annotation-intake", label: "稿件批注" },
  { id: "paper-humanizer", label: "语言润色" },
  { id: "review-response", label: "审稿回复" },
] as const;

export type ReviewPreviewCase = typeof REVIEW_PREVIEW_CASES[number]["id"];

export function reviewWorkspacePreviewSamples(): Record<ReviewPreviewCase, ReviewWorkspaceDescriptor> {
  const annotationManuscript = "# 引言\n\n<!--block:intro-->\n本文分析城市绿地与居民睡眠的关系。\n\n## 方法\n\n我们调查了 120 名参与者。\n\n<script>window.__previewUnsafe = true</script>\n";
  const feedback = "请补充样本来源；引言不要暗示因果关系；方法部分的措辞还不够清楚。";
  const candidate = AnnotationSetCandidateSchema.parse({
    schema_version: "1",
    annotation_set_id: "preview-annotations",
    intake_session_id: "preview-annotations",
    manuscript: { path: "work/manuscript.md", sha256: sha256(annotationManuscript) },
    raw_sources: [{ source_id: "feedback", path: "work/feedback.md", sha256: sha256(feedback), format: "markdown_feedback", media_type: "text/markdown" }],
    annotations: [
      {
        annotation_id: "A-001", raw_body: "请补充样本来源。", source_pointer: "/comments/0",
        source_ref: { kind: "review_delta", source_id: "feedback", delta_id: "delta-1" },
        target: { kind: "section", heading: "方法" },
        agent_interpretation: "方法段落需要说明招募渠道。", expected_action: "补充样本来源",
        semantic_impact: { level: "ordinary" }, clarification: null,
      },
      {
        annotation_id: "A-002", raw_body: "引言不要暗示因果关系。", source_pointer: "/comments/1",
        source_ref: { kind: "review_delta", source_id: "feedback", delta_id: "delta-2" },
        target: { kind: "quote", block_id: "intro", block_sha256: sha256("本文分析城市绿地与居民睡眠的关系。"), exact_quote: "城市绿地与居民睡眠的关系", prefix: "本文分析", suffix: "。" },
        agent_interpretation: "避免把观察性关联写成因果结论。", expected_action: "限定研究结论",
        semantic_impact: { level: "high", categories: ["claim"] }, clarification: null,
      },
      {
        annotation_id: "A-003", raw_body: "方法部分的措辞还不够清楚。", source_pointer: "/comments/2",
        source_ref: { kind: "review_delta", source_id: "feedback", delta_id: "delta-3" },
        target: { kind: "document" },
        agent_interpretation: "检查方法叙述中的指代和术语。", expected_action: "澄清方法叙述",
        semantic_impact: { level: "ordinary" }, clarification: null,
      },
    ],
  });

  const humanizerManuscript = "---\ntitle: 城市绿地与睡眠\n---\n\n# 研究背景\n\n本研究探讨了城市绿地。本研究还探讨了居民睡眠。本研究使用问卷数据。\n\n# 结果\n\n绿地暴露与睡眠时长相关，但不能据此推断因果关系。\n";
  const responseManuscript = "\\section{Methods}\nWe recruited 120 adults from two neighborhoods.\n\\section{Results}\nThe association was estimated with a prespecified model.\n\\section{Discussion}\nThese observations do not establish causality.\n";

  return {
    "annotation-intake": annotationCandidateReviewWorkspace({
      workspaceId: "preview-annotation-intake", title: "稿件批注样例",
      manuscript: { path: "work/manuscript.md", content: annotationManuscript }, candidate,
    }),
    "paper-humanizer": paperHumanizerReviewWorkspace({
      workspaceId: "preview-paper-humanizer", title: "语言润色计划样例", selector: "gate:preview/plan", formalAction: "gate",
      manuscript: { path: "work/draft.qmd", content: humanizerManuscript },
      plan: {
        summary: "保留事实和引用，只调整行文。", user_constraints: ["不更改结论"],
        items: [
          { item_id: "H-001", finding_ids: ["F-001"], locators: ["研究背景，第 1 段"], operation: "合并重复句式", expected_effect: "减少连续重复的句首", preservation_constraints: ["保留研究范围"], risk: "low", recommendation: "include", disposition: "pending" },
          { item_id: "H-002", finding_ids: ["F-002"], locators: ["结果，第 1 段"], operation: "澄清关联表述", expected_effect: "使相关性限定更明确", preservation_constraints: ["不得改成因果陈述"], risk: "medium", recommendation: "include", disposition: "include" },
          { item_id: "H-003", finding_ids: ["F-003"], locators: ["全文术语"], operation: "统一术语", expected_effect: "统一绿地暴露的称谓", preservation_constraints: ["保留原引用"], risk: "low", recommendation: "defer", disposition: "exclude" },
        ],
      },
    }),
    "review-response": reviewResponseReviewWorkspace({
      workspaceId: "preview-review-response", title: "审稿回复样例", selector: "node:preview/response",
      manuscript: { path: "work/manuscript.tex", content: responseManuscript },
      workboard: {
        items: [
          { comment_id: "R1-01", title: "解释样本招募", source_text: "Please clarify how participants were recruited.", source_pointer: "Reviewer 1, comment 1", target_locations: ["Methods"], status: "open", priority: "high", evidence_gap: "需要核对招募记录", user_confirmation_needed: true, next_action: "补充招募渠道和纳入标准" },
          { comment_id: "R1-02", title: "限定因果表述", source_text: "The discussion appears to imply causality.", source_pointer: "Reviewer 1, comment 2", target_locations: ["Discussion"], status: "accepted", priority: "medium", evidence_gap: "", user_confirmation_needed: false, next_action: "将结论改为观察性关联", proposed_text: "These observations do not establish causality." },
          { comment_id: "R2-01", title: "补充稳健性分析", source_text: "Add a sensitivity analysis for the primary model.", source_pointer: "Reviewer 2, comment 1", target_locations: ["Results"], status: "blocked", priority: "high", evidence_gap: "尚无敏感性分析结果", user_confirmation_needed: true, next_action: "先取得分析结果，再决定回复" },
        ],
      },
    }),
  };
}

export function renderReviewWorkspacePreview(sourceHtml: string, sample: ReviewWorkspaceDescriptor): string {
  if (!sourceHtml.includes("</body>")) throw new Error("Review workspace HTML has no closing body tag.");
  const encoded = Buffer.from(JSON.stringify(sample), "utf8").toString("base64");
  const cases = JSON.stringify(REVIEW_PREVIEW_CASES);
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
    select.value = ${JSON.stringify(sample.adapter)};
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
