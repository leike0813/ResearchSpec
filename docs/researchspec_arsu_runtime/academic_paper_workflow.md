# Academic Paper Workflow

`academic-paper` 以配置、结构、论证、起草、引文、摘要、内部评估和格式化等角色生产稿件。Writer/
evaluator separation 与内部检查是语义纪律，不自动形成 CLI Gate 或 transition。

![Academic Paper 外层 route](diagrams/rendered/academic-paper-workflow.svg)

Producer 读取 project、claims、manuscript specs 和 handoff inputs，并只产生当前 route 声明的
boundary outputs。普通 revision 可产生 ARSU `revision_patch`；可选 stateless helper 根据显式 base、
patch 和 output path 执行机械应用。Scope、claim 或 structure 改变先进入 project change。

Annotation intake 保存在 revision subflow 的 `work/annotation-intake/`。Raw feedback、normalized
interpretation 和 patch mapping 必须分离；跨 subflow 使用时才写外部文件并加入 handoff。

独立学术评审路由到 `academic-paper-reviewer`。Writer 自评不能替代 review Gate。
