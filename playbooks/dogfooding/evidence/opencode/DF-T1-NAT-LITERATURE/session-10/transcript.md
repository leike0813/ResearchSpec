我先了解项目结构和已有资料，然后加载 ResearchSpec 的导航 Skill 来确定合适的工作方式。

---

我先检查工作空间状态、可用流程和已有材料。

---

我了解了。这是一个 ResearchSpec 工作空间，状态是 schema "2"，已配置 7 个 profile 但还没有活跃 run。材料来自 `benchmark/` 下的合成基准（明确标注"TEST FIXTURE — NOT A REAL RESEARCH BRIEF"），有 4 份带限制说明的合成来源（课堂观察、教师访谈、学生调查、政策摘要）。约束要求只能使用这些材料，明确区分观察、解释与未知项，不得补造信息。

这是一个有界任务（综述 + 证据基础 + 不确定性），按 Navigate 的策略应该用 standalone 流程。我来查可用的程序。

---

`procedure:analysis-evidence-synthesis`（证据综合）正好匹配——它会把已分级证据合成为收敛/分歧证据图，附证据意图和引用产出，standalone 模式可用。我来读取它的具体执行契约。

---

激活包清楚了：standalone 模式，输入 `graded_sources`（分级证据）、输出 `synthesis_report`（综合报告，synthesis-report.v1）。需要先读 3 个知识文件，然后对 `benchmark/sources.yaml` 的 4 份合成材料做综合。

---

材料读完，已知全貌：

- 4 份合成来源（`SYN-CLASSROOM-01` 课堂观察、`SYN-INTERVIEW-02` 教师访谈、`SYN-SURVEY-03` 学生调查、`SYN-POLICY-04` 政策摘要），全部标注 "TEST FIXTURE — NOT A REAL RESEARCH BRIEF"，不得作为真实引用传播或联网猜测出处。
- goal.md 约束：只用本包材料；区分观察/解释/未知；不补造效应量、引用或伦理审批。
- 任务是有界综述，匹配 standalone `procedure:analysis-evidence-synthesis`。

我现在按 Synthesis协议产出 `synthesis_report`，输出到 `work/` 下的普通项目文件（不写入 `researchspec/` 工作流状态），引用全部带三层层引用和 `quote:` 锚点。

---

完成。产出：`work/evidence-synthesis-genai-writing.md`（229 行）。

执行方式（standalone `procedure:analysis-evidence-synthesis`，未启动 run，未改动 `researchspec/` 工作流状态）：
- 输入：`benchmark/sources.yaml` 中 4 份合成材料（SYN-CLASSROOM-01 / SYN-INTERVIEW-02 / SYN-SURVEY-03 / SYN-POLICY-04），仅在材料 finding/limits 字段内引用，未联网。
- 引用：所有可见引用均附 `<!--ref:slug-->` + `<!--anchor:quote:...-->`（URL 编码原文摘录，≤25 词）；合成 ID 直接作为 slug，无作者/年份。
- 综合：3 个主题（过程与反馈增益 / 负担向教师再分配 / 政策—实施缺口），均按【依据】+【不确定】双栏标注；6 对候选跨来源张力（穷举全配对）已列出，学者确认字段全部 `pending`；5 类知识缺口；VII 级简化证据等级 + 收敛/分歧图。

已知边界（已在报告内说明）：合成材料、单一机构、VI–VII 级证据、6 周窗口、无对照——所有"Moderate"为信号性而非结论性。如需扩范围到真实文献、加量化效应或调整主张强度，须先确认（按 goal.md 约束）。
