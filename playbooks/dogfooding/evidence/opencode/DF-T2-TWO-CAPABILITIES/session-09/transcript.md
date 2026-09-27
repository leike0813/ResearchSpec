我先加载 ResearchSpec 导航技能以确定合适的工作流，同时查看当前项目结构。

---

我先读取所有素材以了解项目背景。

---

让我查看可用的程序和 review-response profile，了解推荐的处理流程。

---

读完素材。我看到的是 ResearchSpec 的合成测试用例（主题：生成式 AI 对高校写作教学的影响），素材含一份稿件、4 条主要意见 + 2 条次要意见、3 个 claims、4 条 sources，以及作者的处置意图（accept 1/2/4，部分接受 3）。

按照 ResearchSpec 导航规则：用户当前只要"整理材料 + 拆分意见 + 检查遗漏"这步，不涉及正式 Gate 裁决、修订轮次或决策，按 ordinary sustained research work 处理，在 `work/researchspec-notes/` 维护任务笔记并产出语义文件即可（不启动 review-response 图运行）。

---

**Step 1 — Intake inventory**：登记所有素材及其角色。

---

已完成 4 步产出 + 任务笔记。模式：standalone，未启动 review-response graph run。

**产物路径**
- `work/review-response-prep/01-intake-inventory.md` —素材登记与编辑决定
- `work/review-response-prep/02-manuscript-structure.md` — 段落骨架 / claims / sources / 7 处高风险改动区
- `work/review-response-prep/03-atomic-comments.md` — 4 major + 2 minor 拆为 12 个原子项，含决策依赖
- `work/review-response-prep/04-coverage-report.md` — 4 张覆盖矩阵 + 5 项遗漏
- `work/researchspec-notes/review-response-prep.md` — 主任务笔记

**需你决定**
1. CLM-02：revise（降级措辞 + tentative）还是 remove？（Step 3 标 `M2-DECISION`）
2. canonical 术语选 "AI-assisted feedback" 还是 "generative AI feedback"？（Step 3 标 `m1a`）
3. 是否补救 3 项 GAP-major（alternative-explanations 节 / conclusion calibration 句 / policy-variation 一句话）+ 2 项 GAP-minor（COI / data availability）？
4. 是否要我继续进入 review-response graph run 产出修订稿与 response letter？若要，需重新读 `instructions profile:review-response --json` 并做一次性 root-run 确认。
