# 稿件批注 Intake Adapter

ResearchSpec 的稿件批注入口不规定 Markdown 批注语法。用户可以在审阅副本中写自然语言、
列表、表格、HTML 注释、CriticMarkup、自定义标记，也可以直接改写某段文字或在对话中补充
意见。Host Agent 负责理解这些材料；确定性代码只保存原文、计算差异、校验引用，并把确认
后的结果交给现有 Annotation Submit。

## 1. 使用流程

```text
registered Markdown draft
→ instructions annotation:<id>
→ 生成或接收自由 review copy / feedback / conversation
→ 机械 Review Delta
→ Host Agent interpretation + clarification
→ candidate.json
→ human-confirmed submit annotation:<id>
→ 原有 revision / re-review route
```

`instructions` 返回同一 session 目录中的 review copy、interpretation、delta、raw source 和
candidate 路径。它只说明 working-material 位置，不创建文件，也不授权提交。

## 2. Review Copy

Headless API 支持三种 slot density：

- `section`：默认，提供总体意见区和按小节的提示区；
- `block`：提供总体意见区和按稳定 block 的提示区；
- `none`：不插入提示，保留原稿副本。

这些区域只是可删除的书写建议。用户可以留空、删除、改写，或完全在其他位置批注。系统
不会因为缺少某种标记而拒绝 review copy，也不会扫描 canonical manuscript 猜测反馈。

## 3. 机械 Delta 与 Agent 解释

Review Delta 按现有 Markdown block ID 比较生成模板和当前 review copy，记录变化前后文本、
byte span、block identity 和无法对齐的结构变化。它不判断变化是批注、误改、替换建议还是
已接受修改。

Host Agent 同时读取 base、review copy、delta、反馈文件和对话快照，输出 interpretation
draft。每条 ready entry 必须引用真实 raw source span 或 delta entry，并给出准确 target、
意图解释、expected action、semantic impact 和已解决的 clarification。歧义项保留为
`needs_clarification` 或 `needs_confirmation`；不能进入 candidate。

## 4. Working Material 与 Authority

Session 位于：

```text
runs/current/annotation-sessions/<id>/
  session.json
  review.md
  interpretation.json
  derived/review-delta.json
  sources/<content-sha256>.<ext>
  candidate.json
```

Session、review copy、delta 和 interpretation 都可以更新，但不是 artifact 或 workflow
authority。Raw source snapshot 使用内容 hash 命名。Annotation Set v2 把这些 path/hash 和
逐条 source reference 冻结下来；v1 仍兼容读取。

Registry、state、Gate、Decision 和 receipt 只能由 ResearchSpec CLI 修改。Adapter API 不
调用模型，不提交 Annotation Set，也不应用 Draft Patch。

## 5. TypeScript API

打包后的入口是：

```ts
import {
  createAnnotationIntakeSession,
  generateAnnotationReviewCopy,
  captureAnnotationSource,
  captureConversationFeedback,
  deriveReviewDelta,
  validateAnnotationInterpretation,
  materializeAnnotationCandidate,
  planAnnotationWorkingMaterial,
} from "researchspec/annotation-intake";
```

函数返回 DTO 或 planned working-material writes。调用方应先读取
`instructions annotation:<id>`，只使用其中返回的 session 路径；权威提交仍调用
`submit annotation:<id>`。

