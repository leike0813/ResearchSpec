我先看一下 ResearchSpec 的导航说明，再确定执行路径。

---

按照 ResearchSpec 的轻量流程，我先看一下可用的独立程序。

---

我已经掌握了项目结构和资料情况。这是 `benchmark/` 中的合成测试材料（4 个 source），用户要求简要整理成一份可核对结论文件。

我先建立工作目录，然后按 `analysis-evidence-synthesis` 程序的方法论（但 standalone 模式、不启动 run）生成报告，严格遵守 goal.md 的约束（区分观察/解释/未知、不补造）。

---

现在写出报告。

---

完成。

**输出文件**：`[workspace]/work/evidence-synthesis/report.md`

**执行路径**（standalone，不创建 run）：
- 模式：standalone（依据 SKILL.md：bounded request，ordinary file chaining 不需 graph）
- 依据程序：`analysis-evidence-synthesis`（用其方法论：literature matrix、convergence/divergence、gaps、cross-paper tension inventory）
- 输入：`benchmark/sources.yaml` 中的 4 个合成 source
- 输出：放在 `work/`（`researchspec/` 外），不修改 workflow state

**关键合规点**（来自 `benchmark/goal.md`）：
- 严格区分 **[观察] / [解释] / [未知]**
- §5、§7、§9 三处强调"没有任何命题达到 Moderate 证据强度"、"不可外推到普遍因果"
- §8 是"可核对结论清单"（C1–C18），每条都映射回具体 source 与字段
- 未补造参与者、效应量、引用、伦理审批；未联网猜测作者出处

**四条提示性主题**：写作过程修订增加、教师反馈工作流再平衡、学生实用主义态度 + 规则不确定、政策-执行落差。
