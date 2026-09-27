# Step 1 · Intake Inventory

> 范围: 审稿意见回复（review-response）准备阶段；不启动 graph run，不调用 review-response profile 节点。
> 产出对象: `benchmark/` 下的合成 dogfooding 材料。
> 关键提醒: 所有内容为合成测试用例；不得联网猜测作者或出处，不得补造数据/引用/伦理审批。

## 1.1 材料清单

| Role | Path | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| `goal_source` | `benchmark/goal.md` | Synthetic research goal | present | 明确禁止补造；要求观察/解释/未知分离 |
| `partial_manuscript` | `benchmark/partial-manuscript.md` | Working draft | present | 仅含 Title / Introduction / Preliminary findings / Missing sections 四块 |
| `claims_source` | `benchmark/claims.yaml` | Stable claim registry | present | 3 条 claims (CLM-01..03)，覆盖 tentative / unsupported_as_written / hypothesis_only |
| `sources_source` | `benchmark/sources.yaml` | Synthetic evidence corpus | present | 4 条 sources (SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04) |
| `review_comments` | `benchmark/review-comments.md` | Reviewer feedback | present | 4 major + 2 minor comments；editorial = Major revision |
| `revision_context` | `benchmark/revision-context.md` | Author intent record | present | 接受 1/2/4；3 部分接受并降级为假设 |
| `fixture_rules` | `benchmark/README.md` | Fixture rules | present | 强调不得联网猜测；evidence 强弱差异用于检验事实/推断/未知区分 |
| `internal_schemas` | `researchspec/specs/{project,claims,manuscript,sources}.yaml` | Project skeleton | present, mostly empty | claims/sources 是空壳；manuscript.yaml 含标题；project.md 是项目元信息 |

## 1.2 编辑决定（editorial）

- 来自 `review-comments.md` 的 "Editorial recommendation": **Major revision**。
- 来自 `revision-context.md` 的作者意图:
  - Comment 1: accept
  - Comment 2: accept（弱化或删除 CLM-02）
  - Comment 3: accept with relabeling（保留"policy clarity"idea，标记为 hypothesis，删除因果措辞）
  - Comment 4: accept（新增 methods 节，明确因果推断不可用）

## 1.3 缺失项（基于现有材料即刻可见）

> 这些在 Step 4 的 coverage check 阶段会被重新审视，这里只做存在性登记。

- `methods` / `evidence-selection` 节：partial manuscript 显式列为 missing。
- `discussion of policy variation`：显式 missing。
- `alternative explanations`：显式 missing。
- `conclusion calibrated to evidence`：显式 missing。
- 一份正式的 response letter（编辑回复信）尚未起草。
- revision roadmap（与每条意见一一对应）尚未生成。

## 1.4 工作产物目录约定

```
work/
├── researchspec-notes/
│   └── review-response-prep.md        # 主任务笔记（滚动更新）
└── review-response-prep/
    ├── 01-intake-inventory.md          # Step 1 输出（本文件）
    ├── 02-manuscript-structure.md      # Step 2 输出
    ├── 03-atomic-comments.md           # Step 3 输出
    └── 04-coverage-report.md           # Step 4 输出
```

## 1.5 下一步动作

进入 Step 2：根据 `partial-manuscript.md` + `claims.yaml` + `sources.yaml` 建立稿件结构摘要、核心 claims、证据链接和高风险改动区。