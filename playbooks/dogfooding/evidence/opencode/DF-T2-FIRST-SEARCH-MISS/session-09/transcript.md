我先看一下当前目录有什么材料，再加载 ResearchSpec 导航来按规范处理。

---

我先看一下 ResearchSpec 工作区状态和可用程序，再确定合适的处理路径。

---

工作区无运行、spec 为空。我先看用户提到的"材料"是否就是 `benchmark/` 下文件，再决定按独立程序还是图谱处理。

---

材料已明确：4份合成源、各自带 scope/finding/limits；README 与 goal 强制区分事实/推断/未知、并禁止联网。这是个跨源综合任务，应走独立程序，不开图谱运行。先列程序定位。

---

`analysis-evidence-synthesis` 完全匹配：跨源综合 + 证据强弱分级。加载它的指令包。

---

程序是 `analysis-evidence-synthesis`，独立模式，要 `graded_sources` 输入。我先看 `benchmark/` 是否已有约束、CLAUDE.md，以及工作笔记目录是否存在，再决定输出落点。

---

材料是合成的固定 fixture，没有真实验证器可拿。我把 `sources.yaml` 的 scope/finding/limits 视作轻量预分级证据（其 limits 字段直接充当质量信号），按 `analysis-evidence-synthesis` 程序的标准输出格式生成综合报告，落点放在 `benchmark/synthesis-report.md`（工作区外、研究目录外），同时回答用户的问题。

---

按 `analysis-evidence-synthesis` 程序独立模式处理；落点 `benchmark/synthesis-report.md`（工作区外、研究目录外）。输入复用 `sources.yaml` 的 scope/finding/limits 作轻量预分级，未跑正式 quality-grading。

**三组串起来的线**

1. **教学干预**：课堂侧是"教师供给结构化 AI 提示"（CLASSROOM），制度侧是"课程级披露强制 + 可接受援助由教师裁量"（POLICY）。两套规则都把"是否允许 AI"这一判断下放给教师。
2. **观察结果**：在判断被下放的同一位置，访谈显示教师批改更快但验证无据主张的时间增加（INTERVIEW）；课堂侧出现更多提纲修改但终评分数差异大（CLASSROOM）；学生侧珍视即时反馈却对允许用法和署名规则不确定（SURVEY）。三者合并指向"AI 把工作量从生成端挪到验证端，学生更投入但规则未对齐"。
3. **局限性**：四条源都来自单一机构；课堂观察 6 周、无对照组、无经验证写作产出指标；访谈 5 人自报、无工时日志；问卷 84 人自愿作答、调研与政策变更同步进行；政策文本不等于实施证据。

**还需补资料的结论**

- "AI 对写作质量的净因果效应"——CLASSROOM 无对照组，无源能支撑因果；
- "工作量转移的幅度"——INTERVIEW 无工时记录，只有方向没有量；
- "学生态度到行为的桥"——SURVEY 是态度，CLASSROOM 是观察行为，未直接连接；
- "政策实施质量"——POLICY 是文本，无实施审计；CLASSROOM 的"教师供提示"是单一模式，不能代表机构全貌；
- "学术诚信结果"——SURVEY 提到署名不确定性，但无违规/检出/处置数据；
- "可推广性 /跨机构 / 纵向"——所有源均单点、短窗口。

两条已识别张力目前**无法在现有材料内解决**（标注 `flagged_unresolved`）：教师裁量权 vs 教师验证负荷（CP-003）、学生规则不确定性 vs 政策披露要求（CP-004）。需要新增材料才能定论。

完整矩阵、跨篇张力清单、证据收敛图与补资料建议见 `benchmark/synthesis-report.md`。
