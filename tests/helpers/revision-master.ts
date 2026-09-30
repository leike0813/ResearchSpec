import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

import { RevisionMasterBusinessSchema, RevisionMasterWorkspaceSchema, type RevisionMasterWorkspace } from "../../src/review-workspace/revision-master.js";
import { reviewBlocksFromMarkdown } from "../../src/review-workspace/render.js";

export async function revisionMasterSchemaSql(): Promise<string[]> {
  const text = await readFile("authoring/revision-master/assets/schema/revision-master-schema.yaml", "utf8");
  return (parse(text.slice(text.indexOf("-->") + 3)) as { tables: Array<{ sql: string }> }).tables.map((table) => table.sql);
}

export function revisionMasterFixture(): RevisionMasterWorkspace {
  const keys = Object.keys(RevisionMasterWorkspaceSchema.shape.business.shape);
  const business = RevisionMasterBusinessSchema.parse(Object.fromEntries(keys.map((key) => [key, []])));
  business.atomic_comments = [
    { comment_id: "A-01", comment_order: 1, canonical_summary: "限定结论", required_action: "说明观察性设计" },
    { comment_id: "A-02", comment_order: 2, canonical_summary: "补充证据", required_action: "敏感性分析" },
  ];
  business.raw_review_threads = [
    { thread_id: "R-01", reviewer_id: "Reviewer1", thread_order: 1, source_type: "reviewer_comment", original_text: "限定结论并补证", normalized_summary: "结论和证据" },
    { thread_id: "R-02", reviewer_id: "Editor", thread_order: 2, source_type: "editor_comment", original_text: "请限定结论", normalized_summary: "结论" },
  ];
  business.raw_thread_atomic_links = [
    { thread_id: "R-01", comment_id: "A-01", link_order: 1 }, { thread_id: "R-01", comment_id: "A-02", link_order: 2 }, { thread_id: "R-02", comment_id: "A-01", link_order: 1 },
  ];
  business.atomic_comment_state = business.atomic_comments.map((row) => ({ comment_id: row.comment_id, status: row.comment_id === "A-01" ? "ready" : "blocked", priority: "high", evidence_gap: row.comment_id === "A-01" ? "no" : "yes", user_confirmation_needed: "yes", next_action: row.required_action }));
  business.strategy_cards = [{ comment_id: "A-01", proposed_stance: "接受", stance_rationale: "设计仅支持关联" }];
  business.strategy_card_actions = [{ comment_id: "A-01", action_order: 1, manuscript_change: "限定讨论", expected_response_letter_effect: "解释范围" }];
  business.atomic_comment_target_locations = [{ comment_id: "A-01", location_order: 1, target_location: "paper.md::讨论", location_role: "primary" }];
  business.comment_blockers = [{ comment_id: "A-02", blocker_order: 1, message: "等待补充分析" }];
  const documents: RevisionMasterWorkspace["documents"] = [{ document_id: "paper", title: "冻结稿件", source_path: "paper.md", role: "manuscript", original_text: "# 讨论\n\n本结果表明关联，不能证明因果。\n", blocks: reviewBlocksFromMarkdown("# 讨论\n\n本结果表明关联，不能证明因果。\n", "paper.md").map((block) => ({ ...block, id: "paper:" + block.id })) }];
  const scopes: RevisionMasterWorkspace["scopes"] = [
    { scope_id: "coverage", kind: "coverage", target_ids: ["comment:A-01", "comment:A-02", "thread:R-01", "thread:R-02", "relation:R-01:A-01", "relation:R-01:A-02", "relation:R-02:A-01"], baseline: { tables: { atomic_comments: business.atomic_comments, raw_thread_atomic_links: business.raw_thread_atomic_links }, files: [] } },
    { scope_id: "board", kind: "board", target_ids: ["comment:A-01", "comment:A-02"], baseline: { tables: { atomic_comments: business.atomic_comments, atomic_comment_state: business.atomic_comment_state }, files: [] } },
    { scope_id: "strategy:A-01", kind: "strategy", target_ids: ["comment:A-01"], baseline: { tables: { strategy_cards: business.strategy_cards }, files: [] } },
    { scope_id: "strategy:A-02", kind: "strategy", target_ids: ["comment:A-02"], baseline: { tables: {}, files: [] } },
    { scope_id: "round", kind: "round", target_ids: ["comment:A-01", "comment:A-02", "thread:R-01", "thread:R-02"], baseline: { tables: {}, files: [] } },
  ];
  return RevisionMasterWorkspaceSchema.parse({
    schema_version: "revision-master-review-workspace.v1", workspace_id: randomUUID(), snapshot_id: randomUUID(), title: "任务审阅",
    context: { task_id: "task-1", selector: "node:run-1/round@1", run_id: "run-1", node_id: "round", round_id: "1", stage: "strategy", formal_status: "待对话确认", active_comment_id: "A-01" },
    business, scopes, documents, sources: { files: [{ path: "paper.md", sha256: "a".repeat(64) }], capture_limitations: [] }, assets: [],
    locations: [{ location_id: "L1", comment_id: "A-01", document_id: "paper", block_id: "paper:b2", start: 0, end: documents[0].blocks[1].text.length, label: "讨论", paired_location_id: null }],
    unresolved: [], next_step: "核对策略后交回 Agent", pending_feedback: [],
  });
}
