import { reviewBlocksFromMarkdown, type ReviewBlock, type RevisionMasterWorkspace } from "../src/review-workspace.js";

/**
 * Approved revision-master preview case, transcribed from the accepted
 * `review-workspace/prototype-revision-master.html`. Domain display text
 * (thread summaries, atomic summaries/requirements/next steps/analysis and
 * strategy wording, plan/log summaries, style rules, title) is copied
 * verbatim from the prototype; the English review originals, manuscript and
 * replies keep their original language.
 */

export const PREVIEW_ACTIVE_ATOM = "atomic_002";
export const PREVIEW_ROUND_ID = "1";
export const PREVIEW_TITLE = "城市绿地与睡眠质量 · 审稿修订工作台";
export const PREVIEW_FORMAL_STATUS = "正式确认待处理";

export type RevisionMasterPreviewMode = "in_progress" | "complete";

type SpanRole = "primary" | "supporting" | "duplicate_filtered";

interface PreviewSegment { text: string; thread?: string; role?: SpanRole; atoms?: string[] }
interface PreviewDoc { id: string; label: string; kind: "editor_letter_source" | "review_comments_source"; path: string; segments: PreviewSegment[] }

const DOCS: PreviewDoc[] = [
  { id: "editor", label: "编辑决定信", kind: "editor_letter_source", path: "review/editor.md", segments: [
    { text: "Decision: major revision\nDear authors,\n\n" },
    { text: "Please align the abstract and discussion with the observational design. The manuscript currently says that green space improves sleep; the evidence supports association rather than causation.", thread: "editor_thread_001", role: "primary", atoms: ["atomic_005"] },
    { text: "\n\nPlease provide a point-by-point response to all comments.\n" },
  ] },
  { id: "reviewer_1", label: "Reviewer 1", kind: "review_comments_source", path: "review/reviewer_1.md", segments: [
    { text: "Reviewer 1\n\n" },
    { text: "1. Green-space exposure is described only as 'within 500 m'. Specify the satellite product, image year, vegetation threshold, address geocoding and buffer construction. ", thread: "reviewer_1_thread_001", role: "primary", atoms: ["atomic_001"] },
    { text: "Please also report whether the association is robust to 300 m and 1000 m buffers.", thread: "reviewer_1_thread_001", role: "primary", atoms: ["atomic_002"] },
    { text: "\n\n" },
    { text: "2. Residential self-selection may explain part of the association. Show how household income and education enter the adjusted model, and discuss residual confounding.", thread: "reviewer_1_thread_002", role: "primary", atoms: ["atomic_003"] },
    { text: "\n" },
  ] },
  { id: "reviewer_2", label: "Reviewer 2", kind: "review_comments_source", path: "review/reviewer_2.md", segments: [
    { text: "Reviewer 2\n\n" },
    { text: "1. Please present effect estimates for alternative buffer distances and discuss any attenuation at 1000 m. ", thread: "reviewer_2_thread_001", role: "primary", atoms: ["atomic_002"] },
    { text: "A 300 m check would be particularly useful.", thread: "reviewer_2_thread_001", role: "duplicate_filtered", atoms: ["atomic_002"] },
    { text: "\n\n" },
    { text: "2. How many participants were excluded for missing address and sleep-quality data? Provide a flow table and compare included with excluded participants.", thread: "reviewer_2_thread_002", role: "primary", atoms: ["atomic_004"] },
    { text: "\n\n" },
    { text: "3. Replace causal wording in the abstract and conclusion with language appropriate for a cross-sectional study.", thread: "reviewer_2_thread_003", role: "primary", atoms: ["atomic_005"] },
    { text: "\n" },
  ] },
];

interface PreviewThread { id: string; reviewer: string; order: number; sourceType: "reviewer_comment" | "editor_comment"; summary: string }

// thread_order is per reviewer so the UI renders ED-01, R1-01/R1-02, R2-01/R2-02/R2-03.
const THREADS: PreviewThread[] = [
  { id: "editor_thread_001", reviewer: "Editor", order: 1, sourceType: "editor_comment", summary: "收敛摘要与讨论中的因果措辞" },
  { id: "reviewer_1_thread_001", reviewer: "Reviewer 1", order: 1, sourceType: "reviewer_comment", summary: "说明绿地指标并报告缓冲半径稳健性" },
  { id: "reviewer_1_thread_002", reviewer: "Reviewer 1", order: 2, sourceType: "reviewer_comment", summary: "处理居住地自选择与混杂" },
  { id: "reviewer_2_thread_001", reviewer: "Reviewer 2", order: 1, sourceType: "reviewer_comment", summary: "报告不同缓冲半径的估计与衰减" },
  { id: "reviewer_2_thread_002", reviewer: "Reviewer 2", order: 2, sourceType: "reviewer_comment", summary: "交代缺失与样本排除" },
  { id: "reviewer_2_thread_003", reviewer: "Reviewer 2", order: 3, sourceType: "reviewer_comment", summary: "修改摘要与结论中的因果措辞" },
];

interface PreviewAction { change: string; targets: string[]; effect: string }
interface PreviewEvidence { material: string; available: "yes" | "no"; note: string }
interface PreviewAtom {
  id: string;
  order: number;
  summary: string;
  required: string;
  priority: "high" | "medium" | "low";
  confirmed: boolean;
  gap: "yes" | "no";
  next: string;
  analysis: { claim: string; existing: string; missing: string; dependency: string | null };
  strategy: { stance: string; why: string; actions: PreviewAction[]; evidence: PreviewEvidence[]; pending: string[]; blocker: string | null; suggestion: string; draft: string | null };
}

const ATOMS: PreviewAtom[] = [
  {
    id: "atomic_001", order: 1, summary: "交代绿地暴露指标的构建", required: "明确影像产品、年份、NDVI 阈值、地址定位和缓冲区计算。",
    priority: "high", confirmed: true, gap: "no", next: "补充方法定义",
    analysis: { claim: "现有 500 m 暴露定义", existing: "Sentinel-2 影像与地理编码记录", missing: "阈值和成像年份未在正文说明", dependency: null },
    strategy: {
      stance: "接受并补足测量方法", why: "指标计算已有原始记录，可以复核后写入方法。",
      actions: [{ change: "在 §2.2 写明影像年份、NDVI 阈值和缓冲区算法", targets: ["M1"], effect: "回复中准确指向暴露定义" }],
      evidence: [{ material: "影像处理记录", available: "yes", note: "无" }, { material: "地址定位质量检查", available: "yes", note: "需在方法中说明误差范围" }],
      pending: [], blocker: null, suggestion: "复核影像处理脚本与定位记录", draft: "在方法中补充 Sentinel-2 影像年份、NDVI 阈值和 500 m 缓冲区计算；回复解释定义。",
    },
  },
  {
    id: "atomic_002", order: 2, summary: "检验 300 m 与 1000 m 缓冲半径", required: "复算两个半径的模型，报告估计与区间，并解释 1000 m 衰减。",
    priority: "high", confirmed: false, gap: "yes", next: "请求分析结果后确认策略",
    analysis: { claim: "主分析 500 m β=0.18", existing: "500 m 模型输出及 Table 2", missing: "300 m、1000 m 复算及置信区间", dependency: "atomic_001" },
    strategy: {
      stance: "接受敏感性分析；据结果限定结论", why: "两位审稿人要求相同的估计与解释，合并执行可保证一套数字、一致回复。",
      actions: [
        { change: "复算 300 m 与 1000 m 模型，核查样本和协变量一致", targets: ["M2"], effect: "给 R1-01 与 R2-01 提供同一组估计" },
        { change: "在 Table S4 并列呈现三种半径并讨论 1000 m 衰减", targets: ["M2", "M5"], effect: "回复注明区间和结果限制" },
      ],
      evidence: [{ material: "500 m 主模型输出", available: "yes", note: "无" }, { material: "300 m / 1000 m 复算表", available: "no", note: "需补充 analysis/buffer_sensitivity.csv" }, { material: "模型规格一致性核查", available: "no", note: "须核对协变量与纳入样本" }],
      pending: ["确认将 1000 m 区间跨零解释为不确定，而非无效", "确认补材来源与模型规格"],
      blocker: "缺 300 m / 1000 m 复算结果；当前项不能标记完成。", suggestion: "S1 · 提供含三个半径估计、区间、样本量的复算表", draft: null,
    },
  },
  {
    id: "atomic_003", order: 3, summary: "说明混杂调整与居住地自选择", required: "列明收入、教育和社区剥夺变量，补充残余混杂限制。",
    priority: "high", confirmed: false, gap: "no", next: "核对协变量记录并确认策略",
    analysis: { claim: "横断面关联可能被自选择解释", existing: "调整模型包含收入、教育和社区剥夺", missing: "正文未列全协变量；限制段不足", dependency: null },
    strategy: {
      stance: "接受并补充调整集与限制", why: "现有模型可支撑变量说明，但不能消除未测量的居住偏好。",
      actions: [{ change: "在 §2.4 列明调整变量，并在 §4 讨论残余混杂", targets: ["M3", "M5"], effect: "明确已控制与未控制的因素" }],
      evidence: [{ material: "模型变量清单", available: "yes", note: "核对最终模型版本" }],
      pending: ["确认限制表述"], blocker: null, suggestion: "核对最终模型变量清单", draft: null,
    },
  },
  {
    id: "atomic_004", order: 4, summary: "补充缺失样本与纳入流程", required: "报告地址和睡眠数据缺失人数、重叠人数及纳入/排除比较。",
    priority: "medium", confirmed: false, gap: "yes", next: "核对样本流表后确认策略",
    analysis: { claim: "分析样本为 2,146 人", existing: "队列台账与完整案例筛选", missing: "缺失原因和纳入/排除比较尚未在补充表说明", dependency: null },
    strategy: {
      stance: "接受并补充样本流表", why: "现有队列台账可生成精确计数和比较表。",
      actions: [{ change: "新增 Table S1，列出缺失重叠和纳入/排除比较", targets: ["M4"], effect: "回复给出可复核样本数" }],
      evidence: [{ material: "队列筛选台账", available: "yes", note: "需确认 9 人重叠计数" }, { material: "纳入/排除比较", available: "no", note: "补充 Table S1" }],
      pending: ["确认排除口径"], blocker: "样本流表待复核", suggestion: "S2 · 提供队列筛选台账和比较表", draft: null,
    },
  },
  {
    id: "atomic_005", order: 5, summary: "收敛因果措辞", required: "将摘要、结论和讨论中的因果说法改为关联，并说明研究设计限制。",
    priority: "high", confirmed: true, gap: "no", next: "按样例改写并回映两条原文",
    analysis: { claim: "现有结论使用 improves", existing: "横断面关联估计", missing: "因果识别条件不具备", dependency: "atomic_003" },
    strategy: {
      stance: "接受，统一使用关联措辞", why: "横断面设计不足以支持干预效果断言。",
      actions: [{ change: "改写摘要、讨论与结论并交叉核对术语", targets: ["M5", "M6"], effect: "一项修改回应编辑与 Reviewer 2 的原始条目" }],
      evidence: [{ material: "研究设计说明", available: "yes", note: "无" }],
      pending: [], blocker: null, suggestion: "无", draft: "把 improves 改为 was associated with，并补充横断面设计限制。",
    },
  },
];


interface PreviewSection { id: string; heading: string; file: string; locator: string; afterNeedle: string; beforeNeedle: string; after: string; before: string }

const SECTIONS: PreviewSection[] = [
  { id: "M1", heading: "Methods · Green-space exposure", file: "manuscript/main.md", locator: "§2.2", afterNeedle: "We derived residential g", beforeNeedle: "Residential green space",
    before: "Residential green space was defined as the proportion of vegetated area within a 500 m buffer around each participant's address.",
    after: "We derived residential green-space exposure from 2020 Sentinel-2 imagery using NDVI ≥ 0.30. Geocoded addresses were buffered by 500 m; the vegetated pixel share within each buffer was used in the primary analysis." },
  { id: "M2", heading: "Results · Buffer sensitivity", file: "manuscript/main.md", locator: "§3.3 + Table S4", afterNeedle: "The association was posi", beforeNeedle: "Greater green-space expo",
    before: "Greater green-space exposure was associated with a higher sleep-quality score (adjusted β = 0.18; 95% CI 0.07–0.29).",
    after: "The association was positive at 300 m (β = 0.14; 95% CI 0.02–0.26) and 500 m (β = 0.18; 95% CI 0.07–0.29). At 1000 m the estimate was smaller and its interval included zero (β = 0.09; 95% CI −0.01–0.19; Table S4)." },
  { id: "M3", heading: "Methods · Adjustment set", file: "manuscript/main.md", locator: "§2.4", afterNeedle: "The adjusted model incl", beforeNeedle: "Models were adjusted for",
    before: "Models were adjusted for demographic and neighborhood factors.",
    after: "The adjusted model included age, sex, household income, educational attainment and neighborhood deprivation. Residential self-selection could remain despite these adjustments." },
  { id: "M4", heading: "Supplement · Participant flow", file: "supplement/flow.md", locator: "Table S1", afterNeedle: "Of 2,322 eligible partic", beforeNeedle: "The analytic sample incl",
    before: "The analytic sample included 2,146 participants.",
    after: "Of 2,322 eligible participants, 112 lacked usable residential coordinates and 73 lacked a sleep-quality score; 9 lacked both. The complete-case sample was 2,146. Table S1 compares included and excluded participants." },
  { id: "M5", heading: "Discussion · Interpretation", file: "manuscript/main.md", locator: "§4", afterNeedle: "Greater residential gree", beforeNeedle: "Urban green space improve",
    before: "Urban green space improves sleep quality in older adults.",
    after: "Greater residential green-space exposure was associated with higher sleep-quality scores. The cross-sectional design and possible residential self-selection prevent causal interpretation." },
  { id: "M6", heading: "Abstract · Conclusion", file: "manuscript/main.md", locator: "Abstract", afterNeedle: "Residential green-space ", beforeNeedle: "Increasing neighborhood g",
    before: "Increasing neighborhood green space improves sleep quality.",
    after: "Residential green-space exposure was associated with sleep-quality scores; longitudinal studies are needed to assess causality." },
];

const TARGETS: Array<{ comment: string; section: string; role: "primary" | "supporting" }> = [
  { comment: "atomic_001", section: "M1", role: "primary" },
  { comment: "atomic_002", section: "M2", role: "primary" },
  { comment: "atomic_002", section: "M5", role: "supporting" },
  { comment: "atomic_003", section: "M3", role: "primary" },
  { comment: "atomic_003", section: "M5", role: "supporting" },
  { comment: "atomic_004", section: "M4", role: "primary" },
  { comment: "atomic_005", section: "M5", role: "primary" },
  { comment: "atomic_005", section: "M6", role: "supporting" },
];

interface PreviewPlan { id: string; comment: string; title: string; category: string; depends: string | null }

const PLAN: PreviewPlan[] = [
  { id: "PA-01", comment: "atomic_001", title: "写明暴露测量方法", category: "manuscript_text", depends: null },
  { id: "PA-02", comment: "atomic_002", title: "复算替代缓冲半径", category: "analysis", depends: "PA-01" },
  { id: "PA-03", comment: "atomic_002", title: "更新 Table S4 与讨论", category: "table_and_text", depends: "PA-02" },
  { id: "PA-04", comment: "atomic_003", title: "补足调整集和残余混杂", category: "manuscript_text", depends: null },
  { id: "PA-05", comment: "atomic_004", title: "新增样本流 Table S1", category: "supplement", depends: null },
  { id: "PA-06", comment: "atomic_005", title: "统一摘要与结论措辞", category: "manuscript_text", depends: "PA-04" },
];

interface PreviewLogEntry { file: string; locator: string; type: string; change: string; reason: string; evidence: string; response: string }
interface PreviewLog { id: string; summary: string; plans: string[]; threads: string[]; entries: PreviewLogEntry[]; diffs: string[] }

const LOGS: PreviewLog[] = [
  { id: "LOG-01", summary: "补足暴露测量定义", plans: ["PA-01"], threads: ["reviewer_1_thread_001"], diffs: ["M1"],
    entries: [{ file: "manuscript/main.md", locator: "§2.2", type: "revised", change: "写明 Sentinel-2 2020、NDVI ≥ 0.30 与 500 m 缓冲区", reason: "使暴露定义可复核", evidence: "影像处理记录", response: "回应 R1-01 的测量部分" }] },
  { id: "LOG-02", summary: "复算半径并更新结果与混杂说明", plans: ["PA-02", "PA-03", "PA-04"], threads: ["reviewer_1_thread_001", "reviewer_1_thread_002", "reviewer_2_thread_001"], diffs: ["M2", "M3"],
    entries: [
      { file: "supplement/table-s4.md", locator: "Table S4", type: "added", change: "加入 300 m、500 m、1000 m 的 β、区间和样本量", reason: "呈现半径稳健性与衰减", evidence: "analysis/buffer_sensitivity.csv（已接收）", response: "回应 R1-01、R2-01" },
      { file: "manuscript/main.md", locator: "§2.4 / §4", type: "revised", change: "列全调整变量并说明居住地自选择", reason: "明确残余混杂限制", evidence: "最终模型规格表", response: "回应 R1-02" },
    ] },
  { id: "LOG-03", summary: "补充样本流并统一解释措辞", plans: ["PA-05", "PA-06"], threads: ["editor_thread_001", "reviewer_2_thread_002", "reviewer_2_thread_003"], diffs: ["M4", "M6"],
    entries: [
      { file: "supplement/flow.md", locator: "Table S1", type: "added", change: "加入缺失、重叠和纳入/排除比较", reason: "交代 2,322 到 2,146 人的筛选", evidence: "cohort_flow.csv（已接收）", response: "回应 R2-02" },
      { file: "manuscript/main.md", locator: "Abstract / §4", type: "revised", change: "将因果动词改为关联表述", reason: "与横断面研究设计一致", evidence: "研究设计说明", response: "回应 ED-01、R2-03" },
    ] },
];

interface PreviewResponse { thread: string; logs: string[]; scope: string; excerpt: string; reply: string }

// Thread replies stay in the original English, matching the approved prototype.
const RESPONSES: PreviewResponse[] = [
  { thread: "editor_thread_001", logs: ["LOG-03"], scope: "Abstract; Discussion §4", excerpt: "was associated with sleep-quality scores", reply: "We agree. We replaced causal claims in the abstract and discussion with association language and now state that the cross-sectional design precludes causal inference." },
  { thread: "reviewer_1_thread_001", logs: ["LOG-01", "LOG-02"], scope: "Methods §2.2; Results §3.3; Table S4", excerpt: "300 m: β 0.14 (95% CI 0.02–0.26); 1000 m: β 0.09 (−0.01–0.19)", reply: "We now specify the 2020 Sentinel-2 product, NDVI threshold, geocoding and buffer construction. We also added 300 m and 1000 m sensitivity models to Table S4; the 1000 m estimate is smaller and its interval includes zero." },
  { thread: "reviewer_1_thread_002", logs: ["LOG-02"], scope: "Methods §2.4; Discussion §4", excerpt: "included household income, educational attainment and neighborhood deprivation", reply: "We expanded the adjustment-set description and added residential self-selection as a remaining limitation. These adjustments cannot remove unmeasured preferences for greener neighborhoods." },
  { thread: "reviewer_2_thread_001", logs: ["LOG-02"], scope: "Results §3.3; Table S4", excerpt: "1000 m: β 0.09 (95% CI −0.01–0.19)", reply: "The revised Table S4 presents all three buffer sizes with confidence intervals and sample sizes. The 1000 m estimate attenuates; we avoid treating its interval crossing zero as proof of no association." },
  { thread: "reviewer_2_thread_002", logs: ["LOG-03"], scope: "Supplement Table S1", excerpt: "2,322 eligible; 112 missing coordinates; 73 missing outcome; 9 missing both; 2,146 included", reply: "We added a participant-flow table and an included-versus-excluded comparison. The table makes the overlap in missingness explicit and reconciles the final analytic sample." },
  { thread: "reviewer_2_thread_003", logs: ["LOG-03"], scope: "Abstract; Discussion §4", excerpt: "associated with higher sleep-quality scores", reply: "We changed the abstract and conclusion to association language and added a sentence on the cross-sectional design and residual confounding." },
];

/** Long frozen reading material that keeps the document projection bounded. */
const APPENDIX = Array.from({ length: 250 }, (_, index) => `## 附录资料 ${String(index + 1)}\n\n${"冻结补充阅读材料，保留原始记录与不确定性说明。".repeat(10)}\n`).join("\n");

const MANUSCRIPT_DOCS: Array<{ document_id: string; title: string; source_path: string; role: "manuscript" | "before" | "after" | "review" }> = [
  { document_id: "manuscript", title: "本轮稿件（候选）", source_path: "manuscript/main.md", role: "after" },
  { document_id: "manuscript-before", title: "修改前稿件", source_path: "manuscript/main.before.md", role: "before" },
  { document_id: "supplement-flow", title: "补充材料 · 参与者流程（候选）", source_path: "supplement/flow.md", role: "after" },
  { document_id: "supplement-flow-before", title: "补充材料 · 参与者流程 · 修改前", source_path: "supplement/flow.before.md", role: "before" },
  { document_id: "supplement-table-s4", title: "Table S4 · 缓冲半径", source_path: "supplement/table-s4.md", role: "manuscript" },
  { document_id: "intake-buffer", title: "analysis/buffer_sensitivity.csv", source_path: "analysis/buffer_sensitivity.csv", role: "manuscript" },
  { document_id: "intake-flow", title: "cohort_flow.csv", source_path: "cohort_flow.csv", role: "manuscript" },
  { document_id: "response-md", title: "response/response.md", source_path: "response/response.md", role: "manuscript" },
  { document_id: "response-tex", title: "response/response.tex", source_path: "response/response.tex", role: "manuscript" },
];

export interface RevisionMasterPreviewCase {
  files: Record<string, string>;
  rows: Record<string, Array<Record<string, unknown>>>;
  documents: Array<{ document_id: string; title: string; source_path: string; role: "review" | "manuscript" | "before" | "after"; blocks?: ReviewBlock[] }>;
  locations: RevisionMasterWorkspace["locations"];
  sourcePaths: string[];
  unresolved: string[];
  activeCommentId: string;
}

const sectionById = (id: string): PreviewSection => {
  const found = SECTIONS.find((section) => section.id === id);
  if (!found) throw new Error(`Unknown preview section: ${id}`);
  return found;
};

const originalText = (doc: PreviewDoc): string => doc.segments.map((segment) => segment.text).join("");

const threadOriginal = (threadId: string): string => {
  const doc = DOCS.find((candidate) => candidate.segments.some((segment) => segment.thread === threadId));
  return doc ? doc.segments.filter((segment) => segment.thread === threadId).map((segment) => segment.text).join(" ") : "";
};

function manuscriptContent(ids: string[], which: "before" | "after", withAppendix: boolean): string {
  const body = ids.map((id) => { const section = sectionById(id); return `## ${section.heading}\n\n${section[which]}\n`; }).join("\n");
  return withAppendix ? `${body}\n${APPENDIX}` : body;
}

function blockRef(blocks: ReviewBlock[], needle: string): ReviewBlock {
  const block = blocks.find((candidate) => candidate.kind === "paragraph" && candidate.text.includes(needle));
  if (!block) throw new Error(`Preview block not found for needle: ${needle}`);
  return block;
}

export function buildRevisionMasterPreviewCase(mode: RevisionMasterPreviewMode): RevisionMasterPreviewCase {
  const complete = mode === "complete";
  const mainIds = ["M1", "M2", "M3", "M5", "M6"];
  const files: Record<string, string> = {};
  for (const doc of DOCS) files[doc.path] = originalText(doc);
  const afterMain = manuscriptContent(mainIds, "after", true);
  const beforeMain = manuscriptContent(mainIds, "before", false);
  const afterFlow = manuscriptContent(["M4"], "after", false);
  const beforeFlow = manuscriptContent(["M4"], "before", false);
  files["manuscript/main.md"] = afterMain;
  files["manuscript/main.before.md"] = beforeMain;
  files["supplement/flow.md"] = afterFlow;
  files["supplement/flow.before.md"] = beforeFlow;
  files["supplement/table-s4.md"] = `## Table S4 · Buffer sensitivity\n\n${sectionById("M2").after}\n`;
  files["analysis/buffer_sensitivity.csv"] = ["buffer,beta,ci_low,ci_high,n", "300,0.14,0.02,0.26,2146", "500,0.18,0.07,0.29,2146", "1000,0.09,-0.01,0.19,2146"].join("\n") + "\n";
  files["cohort_flow.csv"] = ["stage,n", "eligible,2322", "missing_coordinates,112", "missing_outcome,73", "missing_both,9", "analytic,2146"].join("\n") + "\n";
  files["response/response.md"] = RESPONSES.map((response) => `### ${response.thread}\n\n${response.reply}\n`).join("\n");
  files["response/response.tex"] = RESPONSES.map((response) => `\\paragraph{${response.thread}} ${response.reply}`).join("\n\n") + "\n";

  const afterBlocks = reviewBlocksFromMarkdown(afterMain, "manuscript/main.md");
  const beforeBlocks = reviewBlocksFromMarkdown(beforeMain, "manuscript/main.before.md");
  const afterFlowBlocks = reviewBlocksFromMarkdown(afterFlow, "supplement/flow.md");
  const beforeFlowBlocks = reviewBlocksFromMarkdown(beforeFlow, "supplement/flow.before.md");
  const blocksFor = (file: string, which: "before" | "after"): ReviewBlock[] => {
    if (file === "supplement/flow.md") return which === "after" ? afterFlowBlocks : beforeFlowBlocks;
    return which === "after" ? afterBlocks : beforeBlocks;
  };
  const docFor = (file: string, which: "before" | "after"): string => (file === "supplement/flow.md" ? (which === "after" ? "supplement-flow" : "supplement-flow-before") : (which === "after" ? "manuscript" : "manuscript-before"));

  const locations: RevisionMasterWorkspace["locations"] = [];
  for (const target of TARGETS) {
    const section = sectionById(target.section);
    const label = `${section.file}::${section.heading}`;
    const beforeId = `${target.comment}::${section.id}::before`;
    const afterId = `${target.comment}::${section.id}::after`;
    const beforeBlock = blockRef(blocksFor(section.file, "before"), section.beforeNeedle);
    const afterBlock = blockRef(blocksFor(section.file, "after"), section.afterNeedle);
    locations.push({ location_id: beforeId, comment_id: target.comment, document_id: docFor(section.file, "before"), block_id: `${docFor(section.file, "before")}:${beforeBlock.id}`, start: 0, end: beforeBlock.text.length, label, paired_location_id: afterId });
    locations.push({ location_id: afterId, comment_id: target.comment, document_id: docFor(section.file, "after"), block_id: `${docFor(section.file, "after")}:${afterBlock.id}`, start: 0, end: afterBlock.text.length, label, paired_location_id: beforeId });
  }

  const rows: Record<string, Array<Record<string, unknown>>> = {};
  const push = (table: string, row: Record<string, unknown>): void => { (rows[table] ??= []).push(row); };

  push("runtime_language_context", { id: 1, document_language: "en", working_language: "zh", manuscript_detected_language: "en", review_comments_detected_language: "en", prompt_detected_language: "zh", document_language_source: "manuscript", working_language_source: "prompt", languages_confirmed: "yes" });
  push("manuscript_summary", { id: 1, main_entry: "manuscript/main.md", project_shape: "latex_project", high_risk_areas: "因果措辞与缓冲半径稳健性" });
  for (const section of SECTIONS) push("manuscript_sections", { section_id: section.id, section_title: section.heading, purpose_in_manuscript: `${section.file} · ${section.locator}`, key_files_or_locations: `${section.file}::${section.heading}` });
  for (const atom of ATOMS) push("manuscript_claims", { claim_id: atom.id, core_claim: atom.analysis.claim, main_evidence: atom.analysis.existing, supporting_section_ids: TARGETS.filter((target) => target.comment === atom.id).map((target) => target.section).join(","), risk_level: atom.priority });

  for (const doc of DOCS) push("review_comment_source_documents", { source_document_id: doc.id, source_kind: doc.kind, document_order: DOCS.indexOf(doc) + 1, source_label: doc.label, source_path: doc.path, original_text: originalText(doc) });

  for (const thread of THREADS) {
    const doc = DOCS.find((candidate) => candidate.segments.some((segment) => segment.thread === thread.id));
    if (!doc) throw new Error(`No source document for thread ${thread.id}`);
    const segments = doc.segments.filter((segment) => segment.thread === thread.id);
    push("raw_review_threads", { thread_id: thread.id, reviewer_id: thread.reviewer, thread_order: thread.order, source_type: thread.sourceType, original_text: segments.map((segment) => segment.text).join(" "), normalized_summary: thread.summary });
    let offset = 0;
    doc.segments.forEach((segment) => {
      const length = Array.from(segment.text).length;
      if (segment.thread === thread.id) push("raw_thread_source_spans", { thread_id: thread.id, source_document_id: doc.id, span_order: segments.indexOf(segment) + 1, span_role: segment.role ?? "primary", start_offset: offset, end_offset: offset + length, span_text: segment.text });
      offset += length;
    });
  }

  for (const atom of ATOMS) push("atomic_comments", { comment_id: atom.id, comment_order: atom.order, canonical_summary: atom.summary, required_action: atom.required });

  const linkSeen = new Set<string>();
  for (const doc of DOCS) {
    let segmentOrder = 0;
    for (const segment of doc.segments) {
      segmentOrder += 1;
      const atoms = segment.atoms ?? [];
      push("review_comment_coverage_segments", { source_document_id: doc.id, segment_order: segmentOrder, coverage_status: segment.thread ? "covered" : "uncovered", segment_text: segment.text, thread_id: segment.thread ?? null });
      atoms.forEach((commentId, index) => push("review_comment_coverage_segment_comment_links", { source_document_id: doc.id, segment_order: segmentOrder, link_order: index + 1, comment_id: commentId }));
      if (!segment.thread) continue;
      for (const commentId of atoms) {
        const key = `${segment.thread}\u0000${commentId}`;
        if (!linkSeen.has(key)) { linkSeen.add(key); push("raw_thread_atomic_links", { thread_id: segment.thread, comment_id: commentId, link_order: linkSeen.size }); }
        if (!rows.atomic_comment_source_spans?.some((row) => row.comment_id === commentId && row.thread_id === segment.thread)) push("atomic_comment_source_spans", { comment_id: commentId, thread_id: segment.thread, excerpt_text: segment.text, note: segment.role === "duplicate_filtered" ? "与另一条半径检验合并，保留原文来源" : "" });
      }
    }
  }

  for (const atom of ATOMS) {
    const blockedState = !complete && atom.id === PREVIEW_ACTIVE_ATOM;
    push("atomic_comment_state", { comment_id: atom.id, status: complete ? "done" : blockedState ? "blocked" : atom.confirmed ? "done" : "ready", priority: atom.priority, evidence_gap: complete ? "no" : blockedState || atom.gap === "yes" ? "yes" : "no", user_confirmation_needed: "yes", next_action: atom.next });
  }

  TARGETS.forEach((target) => {
    const section = sectionById(target.section);
    const order = TARGETS.filter((candidate) => candidate.comment === target.comment).indexOf(target) + 1;
    push("atomic_comment_target_locations", { comment_id: target.comment, location_order: order, target_location: `${section.file}::${section.heading}`, location_role: target.role });
  });

  for (const atom of ATOMS) push("atomic_comment_analysis_links", { comment_id: atom.id, analysis_order: 1, manuscript_claim_or_section: atom.analysis.claim, existing_evidence: atom.analysis.existing, gap_summary: atom.analysis.missing, dependency_comment_id: atom.analysis.dependency });

  for (const atom of ATOMS) {
    push("strategy_cards", { comment_id: atom.id, proposed_stance: atom.strategy.stance, stance_rationale: atom.strategy.why });
    atom.strategy.actions.forEach((action, actionIndex) => {
      const actionOrder = actionIndex + 1;
      push("strategy_card_actions", { comment_id: atom.id, action_order: actionOrder, manuscript_change: action.change, expected_response_letter_effect: action.effect });
      action.targets.forEach((sectionId, locationIndex) => {
        const section = sectionById(sectionId);
        push("strategy_action_target_locations", { comment_id: atom.id, action_order: actionOrder, location_order: locationIndex + 1, target_location: `${section.file}::${section.heading}` });
      });
      push("strategy_action_manuscript_execution_items", { comment_id: atom.id, action_order: actionOrder, item_order: 1, category: action.targets.length > 1 ? "text_add_modify_delete" : "modification_strategy", content_text: action.change, rationale: atom.strategy.why, target_scope_note: action.effect });
    });
    atom.strategy.evidence.forEach((evidence, index) => push("strategy_card_evidence_items", { comment_id: atom.id, evidence_order: index + 1, required_material: evidence.material, available_now: complete ? "yes" : evidence.available, gap_note: evidence.note }));
    if (!complete) atom.strategy.pending.forEach((message, index) => push("strategy_card_pending_confirmations", { comment_id: atom.id, confirmation_order: index + 1, message }));
    if (!complete && atom.strategy.blocker) push("comment_blockers", { comment_id: atom.id, blocker_order: 1, message: atom.strategy.blocker });
    if (atom.strategy.draft) push("comment_response_drafts", { comment_id: atom.id, draft_text: atom.strategy.draft, rationale: atom.strategy.why });
  }

  const gapOpen = (id: string): boolean => !complete && ATOMS.some((atom) => atom.id === id && atom.gap === "yes");
  for (const atom of ATOMS) push("comment_completion_status", { comment_id: atom.id, manuscript_execution_items_done: gapOpen(atom.id) ? "no" : "yes", response_draft_done: atom.strategy.draft ? "yes" : gapOpen(atom.id) ? "no" : "yes", evidence_gap_closed: gapOpen(atom.id) ? "no" : "yes", user_strategy_confirmed: gapOpen(atom.id) ? "no" : "yes", one_to_one_link_checked: "yes", export_ready: gapOpen(atom.id) ? "no" : "yes" });

  push("supplement_suggestion_items", { comment_id: "atomic_002", suggestion_order: 1, analysis_order: 1, request_summary: "提供含三个半径估计、区间、样本量的复算表", request_recommendation: "附上 analysis/buffer_sensitivity.csv", status: "linked" });
  push("supplement_suggestion_items", { comment_id: "atomic_004", suggestion_order: 1, analysis_order: 1, request_summary: "提供队列筛选台账和比较表", request_recommendation: "附上 cohort_flow.csv", status: complete ? "satisfied" : "linked" });
  push("supplement_intake_items", { round_id: PREVIEW_ROUND_ID, file_path: "analysis/buffer_sensitivity.csv", concern_summary: "模型规格与样本一致", decision: "accepted", decision_rationale: "用于 A-02 的 A1、A2 修改" });
  push("supplement_intake_items", { round_id: PREVIEW_ROUND_ID, file_path: "cohort_flow.csv", concern_summary: "核对缺失重叠人数", decision: "accepted", decision_rationale: "用于 A-04 的 A1 修改" });
  push("supplement_suggestion_intake_links", { comment_id: "atomic_002", suggestion_order: 1, round_id: PREVIEW_ROUND_ID, file_path: "analysis/buffer_sensitivity.csv", link_note: "用于 A-02 的动作 2" });
  push("supplement_suggestion_intake_links", { comment_id: "atomic_004", suggestion_order: 1, round_id: PREVIEW_ROUND_ID, file_path: "cohort_flow.csv", link_note: "用于 A-04 的动作 1" });
  push("supplement_landing_links", { round_id: PREVIEW_ROUND_ID, file_path: "analysis/buffer_sensitivity.csv", comment_id: "atomic_002", action_order: 2, location_order: 1, planned_usage_note: "提供 300 m 与 1000 m 估计" });
  push("supplement_landing_links", { round_id: PREVIEW_ROUND_ID, file_path: "cohort_flow.csv", comment_id: "atomic_004", action_order: 1, location_order: 1, planned_usage_note: "提供样本流计数" });

  for (const thread of THREADS) {
    const unique = [...new Set(TARGETS.filter((target) => {
      const doc = DOCS.find((candidate) => candidate.segments.some((segment) => segment.thread === thread.id));
      return doc?.segments.some((segment) => segment.thread === thread.id && (segment.atoms ?? []).includes(target.comment)) ?? false;
    }).map((target) => target.comment))];
    unique.forEach((commentId, index) => push("response_thread_resolution_links", { thread_id: thread.id, comment_id: commentId, response_order: index + 1, response_role: unique.length > 1 ? (index < unique.length - 1 ? "primary" : "merged_duplicate") : "primary" }));
  }

  push("style_profiles", { profile_target: "manuscript", profile_summary: "结果段报告估计值与区间，保持观察性设计的可见性", anti_ai_focus: "避免句式过于均匀与渲染性措辞" });
  push("style_profiles", { profile_target: "response_letter", profile_summary: "礼貌、具体的逐条回复", anti_ai_focus: "避免模板化开头" });
  push("style_profile_rules", { profile_target: "manuscript", rule_order: 1, rule_type: "do", rule_text: "结果段报告估计值与区间，不把区间跨零写成“没有作用”。" });
  push("style_profile_rules", { profile_target: "manuscript", rule_order: 2, rule_type: "tone", rule_text: "摘要和讨论使用关联措辞。" });
  push("style_profile_rules", { profile_target: "response_letter", rule_order: 1, rule_type: "do", rule_text: "回复信保持礼貌、具体，并指向实际修改位置。" });
  push("workspace_manuscript_copies", { copy_role: "source_snapshot", source_kind: "project_directory", source_root: "manuscript", copy_root: "source_snapshot", main_entry_relative_path: "manuscript/main.before.md" });
  push("workspace_manuscript_copies", { copy_role: "working_manuscript", source_kind: "project_directory", source_root: "manuscript", copy_root: "working_manuscript", main_entry_relative_path: "manuscript/main.md" });

  const planStatus = (plan: PreviewPlan): string => (complete ? "completed" : plan.comment === PREVIEW_ACTIVE_ATOM || plan.comment === "atomic_004" ? "in_progress" : "completed");
  PLAN.forEach((plan, index) => push("revision_plan_actions", { plan_action_id: plan.id, plan_order: index + 1, comment_id: plan.comment, action_order: 1, execution_category: plan.category, title: plan.title, objective: ATOMS.find((atom) => atom.id === plan.comment)?.required ?? "", suggested_change: plan.title, evidence_requirement: "", status: planStatus(plan) }));
  for (const plan of PLAN) if (plan.depends) push("revision_plan_dependencies", { plan_action_id: plan.id, depends_on_plan_action_id: plan.depends });

  LOGS.forEach((log, index) => {
    push("revision_action_logs", { log_id: log.id, log_order: index + 1, status: "completed", operator_role: "agent", summary: log.summary, change_note: log.entries.map((entry) => entry.change).join("；"), response_note: log.threads.join(", "), created_at: `2026-09-30T1${String(index)}:00:00Z` });
    for (const planId of log.plans) push("revision_action_log_plan_links", { log_id: log.id, plan_action_id: planId });
    for (const threadId of log.threads) push("revision_action_log_thread_links", { log_id: log.id, thread_id: threadId });
    log.entries.forEach((entry, entryIndex) => push("revision_action_log_entries", { log_id: log.id, entry_order: entryIndex + 1, target_file: entry.file, target_locator: entry.locator, change_type: entry.type, change_summary: entry.change, rationale: entry.reason, evidence_source: entry.evidence, expected_response_use: entry.response }));
    log.diffs.forEach((sectionId, diffIndex) => { const section = sectionById(sectionId); push("revision_action_log_file_diffs", { log_id: log.id, file_order: diffIndex + 1, relative_path: section.file, change_kind: "modified", diff_excerpt: section.after, before_excerpt: section.before, after_excerpt: section.after }); });
  });

  const zero = "0".repeat(64);
  push("working_copy_file_state", { relative_path: "manuscript/main.md", snapshot_sha256: zero, last_audited_sha256: zero, current_sha256: zero, last_log_id: "LOG-02" });

  for (const response of RESPONSES) push("response_thread_rows", { thread_id: response.thread, response_resolution_kind: "revision_backed", original_comment: threadOriginal(response.thread), modification_scope: response.scope, key_revision_excerpt: response.excerpt, response_explanation: response.reply, latex_excerpt: response.excerpt, latex_response_text: response.reply });
  for (const response of RESPONSES) response.logs.forEach((logId, index) => push("response_thread_action_log_links", { thread_id: response.thread, log_id: logId, link_order: index + 1 }));

  push("export_artifacts", { artifact_name: "working_manuscript", artifact_status: "ready", output_path: "manuscript/main.md" });
  push("export_artifacts", { artifact_name: "response_markdown", artifact_status: complete ? "ready" : "pending", output_path: complete ? "response/response.md" : "" });
  push("export_artifacts", { artifact_name: "response_latex", artifact_status: complete ? "ready" : "pending", output_path: complete ? "response/response.tex" : "" });
  push("export_artifacts", { artifact_name: "latexdiff_manuscript", artifact_status: "pending", output_path: "" });

  push("workflow_state", { id: 1, current_stage: "stage_6", stage_gate: complete ? "ready" : "blocked", active_comment_id: PREVIEW_ACTIVE_ATOM, next_action: "核对本轮候选与逐条回复；正式结果回到对话中确认。" });
  push("workflow_pending_user_confirmations", { position: 1, message: "与 atomic_002 确认 1000 m 区间的解释" });
  push("workflow_pending_user_confirmations", { position: 2, message: "本轮审阅后在对话中确认正式关口结果" });

  const documents: RevisionMasterPreviewCase["documents"] = [
    ...MANUSCRIPT_DOCS.map((doc) => ({ ...doc, blocks: /[.]md$/.test(doc.source_path) ? reviewBlocksFromMarkdown(files[doc.source_path] ?? "", doc.source_path) : undefined })),
    ...DOCS.map((doc) => ({ document_id: doc.id, title: doc.label, source_path: doc.path, role: "review" as const, blocks: reviewBlocksFromMarkdown(files[doc.path] ?? "", doc.path) })),
  ];

  return { files, rows, documents, locations, sourcePaths: [], unresolved: [], activeCommentId: PREVIEW_ACTIVE_ATOM };
}

export { DOCS as PREVIEW_DOCS, THREADS as PREVIEW_THREADS, ATOMS as PREVIEW_ATOMS, SECTIONS as PREVIEW_SECTIONS, PLAN as PREVIEW_PLAN, LOGS as PREVIEW_LOGS, RESPONSES as PREVIEW_RESPONSES };
