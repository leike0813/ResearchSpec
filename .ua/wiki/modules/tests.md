
# tests
> 目录聚合页：80 个文件、68 个符号。由知识图谱按源路径生成。

## 文件

| 文件 | 类型 | 符号数 | 摘要 |
| --- | --- | --- | --- |
| [tests/adapters.test.ts](../files/tests/adapters.test.ts.md) | 文件 | 0 | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [tests/agent-profiles.test.ts](../files/tests/agent-profiles.test.ts.md) | 文件 | 1 | 校验 24 个 class-A 宿主上的两种受管 profile：50 个渲染文件的精确路径、角色契约、frontmatter/TOML/Vibe prompt 格式，以及不固定厂商模型的中立性。 |
| [tests/arsu-anchors.test.ts](../files/tests/arsu-anchors.test.ts.md) | 文件 | 0 | anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。 |
| [tests/arsu-checkers.test.ts](../files/tests/arsu-checkers.test.ts.md) | 文件 | 1 | 验证七个内建检查器能真实计算报告：--generate 产出非空结果，原样报告通过校验，改动结果或输入后必须被拒绝。 |
| [tests/arsu-converter.test.ts](../files/tests/arsu-converter.test.ts.md) | 文件 | 3 | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [tests/arsu-maintenance.test.ts](../files/tests/arsu-maintenance.test.ts.md) | 文件 | 4 | 校验 ARSU 审计锚点的摄取、转换、审阅与语义审阅表完整，HTML 产物落在统一审计目录，且 check 子命令与语义审阅渲染按所选锚点工作。 |
| [tests/arsu-routing-catalog.test.ts](../files/tests/arsu-routing-catalog.test.ts.md) | 文件 | 0 | 路由目录测试：锁定四个 Skill 的顺序、25 条 mode 与 2 条 entry 路由、跨引用校验为空，并检查每条路由的摘要字段齐备、frontmatter 投影结果与 near-miss 语义。 |
| [tests/arsu-runtime-policy.test.ts](../files/tests/arsu-runtime-policy.test.ts.md) | 文件 | 0 | 运行时策略测试：对 pinned vendor/ars 构建策略计划，断言 41 个分类条目、5 个 checker 闭包、固定的两处路径改写与 11 处不可用引用替换，并确认与 anchor 替换计划无区间重叠。 |
| [tests/authored-whitespace.test.ts](../files/tests/authored-whitespace.test.ts.md) | 文件 | 5 | 表格化验证 authored whitespace 检查器：字节保留且哈希一致的豁免被接受，而新增尾随空白、被改动的豁免字节和缺少小写 SHA-256 的豁免都被拒绝。 |
| [tests/authoring-converter.test.ts](../files/tests/authoring-converter.test.ts.md) | 文件 | 0 | 验证能力编写器的输出可被注册表加载、manifest 指纹与注册表一致，并断言重复生成完全幂等。 |
| [tests/capability-graph.test.ts](../files/tests/capability-graph.test.ts.md) | 文件 | 0 | 图谱契约测试：验证最小无环图谱通过、未知能力引用被诊断、重复节点 ID、repeatable 轮次角色约束、node_output 绑定来源要求、不可达节点诊断与修订轮模板选项解析。 |
| [tests/capability-manifest.test.ts](../files/tests/capability-manifest.test.ts.md) | 文件 | 0 | manifest 契约测试：覆盖最小 producer 包、缺失输出角色、kebab-case 能力 ID、未知节点类型、重复角色 ID、输入来源策略、script 校验器 runner 契约与网络校验器降级声明。 |
| [tests/capability-parity.test.ts](../files/tests/capability-parity.test.ts.md) | 文件 | 1 | 校验能力对等审计报告 47 个能力全部到位：section 与 rule 覆盖率高于阈值，无缺失输出、无低于阈值的知识条目、无保留流程残留。 |
| [tests/capability-registry.test.ts](../files/tests/capability-registry.test.ts.md) | 文件 | 0 | 能力注册表测试：验证全部内置能力包可加载且为 operational 目录名，并覆盖 ID/路径不匹配、重复 ID、manifest 与 knowledge 哈希不符、未知 schema 引用、ARS 溯源缺失及图谱输入准入诊断。 |
| [tests/capability-validators.test.ts](../files/tests/capability-validators.test.ts.md) | 文件 | 0 | 校验器执行测试：覆盖 script 校验器通过与失败、网络校验器降级为 degraded 而非 pass、未知 policy 与未解析 schema 校验器 fail-closed，以及 submitGraphNode 触发注册表声明的校验器。 |
| [tests/dogfood-harness.test.mjs](../files/tests/dogfood-harness.test.mjs.md) | 文件 | 0 | dogfooding harness 的 node:test 用例：覆盖冻结场景目录校验、fixture 前置条件、宿主与模型选择、审阅服务接口与路径防护、人工 pass 门槛、验收报告证据绑定以及历史 campaign 只读约束。 |
| [tests/dogfooding-playbook.test.ts](../files/tests/dogfooding-playbook.test.ts.md) | 文件 | 0 | 维护者 dogfooding playbook 的结构校验测试：断言场景、fixture 变体与 release 映射引用的文件确实存在，并核对工具与路由覆盖。 |
| [tests/domain-taxonomy.test.ts](../files/tests/domain-taxonomy.test.ts.md) | 文件 | 0 | 领域分类体系测试：校验 ANZSRC 2020 快照层级与署名、内部目录覆盖 213 个 Group 与 5 个工具域，以及各 vendor 审计记录的 Field 元数据合法性。 |
| [tests/education-agent-skills-audit.test.ts](../files/tests/education-agent-skills-audit.test.ts.md) | 文件 | 0 | 锁定 Education Agent Skills 的干净快照身份，校验 241 个跟踪文件清点、frontmatter 解析、证据与许可及关系 schema 的未决状态，以及由 JSON 确定性派生的审计报告。 |
| [tests/education-agent-skills-evidence.test.ts](../files/tests/education-agent-skills-evidence.test.ts.md) | 文件 | 1 | 证据映射契约测试：断言 872 条声明与 165 个 Skill 的覆盖、审计哈希绑定、存在性分布、scholar 发现结果，以及 JSON/报告的确定性渲染与 CLI check 退出码。 |
| [tests/education-agent-skills-extensions.test.ts](../files/tests/education-agent-skills-extensions.test.ts.md) | 文件 | 1 | 校验 Education Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [tests/education-agent-skills-ingest.test.ts](../files/tests/education-agent-skills-ingest.test.ts.md) | 文件 | 1 | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |
| [tests/education-agent-skills-maintenance.test.ts](../files/tests/education-agent-skills-maintenance.test.ts.md) | 文件 | 0 | 断言 Education Agent Skills 目录映射 136 个 llm extension、revision 与 vendor bundle manifest 一致，并校验 snapshot-6bbbce4 锚点。 |
| [tests/extraction-index.test.ts](../files/tests/extraction-index.test.ts.md) | 文件 | 2 | 校验 ARS 抽取索引记录 120 个已验证产物及五个里程碑的完整通过数，并要求 check 模式无漂移。 |
| [tests/finrobot-audit.test.ts](../files/tests/finrobot-audit.test.ts.md) | 文件 | 0 | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [tests/finrobot-converter.test.ts](../files/tests/finrobot-converter.test.ts.md) | 文件 | 0 | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [tests/finrobot-ingest-draft.test.ts](../files/tests/finrobot-ingest-draft.test.ts.md) | 文件 | 0 | FinRobot 策略与完整树的离线一致性测试：校验 6 条准入、1049 条源条目、129 个知识面中 39 项映射到 Agent procedure 或标准库脚本，并确认树内文件构成与渐进式披露要求。 |
| [tests/finrobot-maintenance.test.ts](../files/tests/finrobot-maintenance.test.ts.md) | 文件 | 0 | 断言 FinRobot 目录映射六个 financial-research extension（4 mixed / 2 llm）、raw Skill 名称集合固定且 brief 字段不少于五项。 |
| [tests/finrobot-preview.test.ts](../files/tests/finrobot-preview.test.ts.md) | 文件 | 0 | FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。 |
| [tests/finrobot-statements.test.ts](../files/tests/finrobot-statements.test.ts.md) | 文件 | 12 | 把候选财务报表 Skill 树连同共享支撑库搭到临时目录后运行真实 Python：验证期间窗口覆盖判定、跨源对齐、市值勾稽的证据要求、币种口径与增长口径。 |
| [tests/finrobot-valuation.test.ts](../files/tests/finrobot-valuation.test.ts.md) | 文件 | 8 | 验证相对估值候选脚本：复合估值只在方法可比且权重理由声明充分时认证，敏感性网格复用主入口的取值校验并保持网格形状。 |
| [tests/graph-cli-main.test.ts](../files/tests/graph-cli-main.test.ts.md) | 文件 | 0 | 端到端验证编译后 CLI 的 init 与 update 行为、schema 2 拒绝 schema 1、handoff 消费、工具选择要求，以及 doctor 的只读入口诊断。 |
| [tests/graph-cli-static.test.ts](../files/tests/graph-cli-static.test.ts.md) | 文件 | 0 | 静态断言 CLI 仍暴露全部 16 个公开命令，并校验 help 目标解析不被裁剪。 |
| [tests/graph-cli.test.ts](../files/tests/graph-cli.test.ts.md) | 文件 | 0 | 图谱 CLI 集成测试：在 schema 2 工作区上验证 status/check/doctor 只读路径，以及 start → instructions → advance 的节点闭环。 |
| [tests/graph-context-cli.test.ts](../files/tests/graph-context-cli.test.ts.md) | 文件 | 0 | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [tests/graph-run-advanced.test.ts](../files/tests/graph-run-advanced.test.ts.md) | 文件 | 0 | 图谱运行高级测试：覆盖 mid-entry 只暴露确认入口节点、子图绑定与父角色校验、父绑定子运行创建、运行完成判定、修订轮次独立节点文件与 node_output 显式 from_role 解析。 |
| [tests/graph-run-conflict.test.ts](../files/tests/graph-run-conflict.test.ts.md) | 文件 | 0 | 图谱运行冲突测试：验证扫描后出现的节点文件、扫描后被改动的节点文件、歧义重复节点实例均被拒绝，以及失败 Gate 的 override 记录在所属 Gate 内并解锁下游。 |
| [tests/graph-run.test.ts](../files/tests/graph-run.test.ts.md) | 文件 | 0 | 图谱运行主路径测试：验证运行创建的确定性与冻结图谱、dry-run 不落盘、frontier 随提交推进、乱序提交被拒、Gate/Decision 阻塞下游、图谱文本漂移后哈希稳定与缺失绑定输入的 fail-closed。 |
| [tests/graph-security.test.ts](../files/tests/graph-security.test.ts.md) | 文件 | 0 | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [tests/graph-workspace.test.ts](../files/tests/graph-workspace.test.ts.md) | 文件 | 0 | 图谱工作区索引测试：验证 schema 2 接受、schema 1 拒绝，空工作区加载，运行/冻结图谱/节点/handoff 扫描，以及冻结图谱哈希不符与未知、重复节点实例的诊断。 |
| [tests/histagent-audit.test.ts](../files/tests/histagent-audit.test.ts.md) | 文件 | 0 | HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。 |
| [tests/histagent-converter.test.ts](../files/tests/histagent-converter.test.ts.md) | 文件 | 0 | HistAgent 生产转换测试：断言已发布 bundle 是经批准的三 Skill 完整树投影，树集合哈希、零硬依赖、域归属与输出校验、幂等性结论全部匹配。 |
| [tests/histagent-ingest-draft.test.ts](../files/tests/histagent-ingest-draft.test.ts.md) | 文件 | 1 | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |
| [tests/histagent-maintenance.test.ts](../files/tests/histagent-maintenance.test.ts.md) | 文件 | 0 | 断言 HistAgent 目录映射三个 executable Skills 均为 mixed 类型且名称集合固定，并校验 snapshot-47bbe21 锚点。 |
| [tests/literature-adapters.test.ts](../files/tests/literature-adapters.test.ts.md) | 文件 | 0 | 验证 Zotero 目录的发布集与运行组件绑定、适配器表达式与平台规范化的精确行为，以及未选适配器零交付、选定运行时的降级投影策略。 |
| [tests/literature-provider-contracts.test.ts](../files/tests/literature-provider-contracts.test.ts.md) | 文件 | 0 | 锁定文献来源策略的四模式 SSOT、provider 就绪状态作为调用事实、handoff 对上游字节的引用方式，以及受管授权在每个权限边界的逐级回退。 |
| [tests/managed-installation-paths.test.ts](../files/tests/managed-installation-paths.test.ts.md) | 文件 | 0 | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [tests/manuscript-annotation-intake-adapters.test.ts](../files/tests/manuscript-annotation-intake-adapters.test.ts.md) | 文件 | 0 | 批注接收主链路的测试：槽位可逆性、从自由文本到候选批注集的完整物化、未决解释必须失败，以及对话捕获的确定性。 |
| [tests/manuscript-annotation.test.ts](../files/tests/manuscript-annotation.test.ts.md) | 文件 | 0 | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |
| [tests/materials-science-maintenance.test.ts](../files/tests/materials-science-maintenance.test.ts.md) | 文件 | 0 | 断言 Materials Science 目录映射七个 curated Skills 均为 llm 类型、raw Skill 命名集合固定，并校验 snapshot-fafd3ab 锚点。 |
| [tests/materials-science-skills-converter.test.ts](../files/tests/materials-science-skills-converter.test.ts.md) | 文件 | 0 | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |
| [tests/materials-science-skills-for-llm-audit.test.ts](../files/tests/materials-science-skills-for-llm-audit.test.ts.md) | 文件 | 0 | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [tests/non-native-vendor-skill-standard.test.ts](../files/tests/non-native-vendor-skill-standard.test.ts.md) | 文件 | 2 | 非原生 Skill 共享标准的契约测试：验证纯指令式 Skill 无需 runner 或机器 schema 即可通过，脚本/状态/资源/引用/外部工具扩展可自由组合，并以表格驱动方式断言每类可观察失败的稳定诊断码。 |
| [tests/own-vendor-maintenance.test.ts](../files/tests/own-vendor-maintenance.test.ts.md) | 文件 | 5 | 校验自有 vendor（paper-humanizer 与 revision-master）的维护闭环：Skill 文档、目录声明、锚点记录与语义审阅完成状态，以及 package.json 暴露的维护脚本。 |
| [tests/paper-humanizer.test.ts](../files/tests/paper-humanizer.test.ts.md) | 文件 | 0 | paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。 |
| [tests/plugin-extensions.test.ts](../files/tests/plugin-extensions.test.ts.md) | 文件 | 0 | 校验插件扩展注册表全量加载、各 vendor 扩展 profile 跑通图引擎、脚本校验型能力在 advance 中执行，以及 plugin show 暴露的扩展计数。 |
| [tests/preset-graphs.test.ts](../files/tests/preset-graphs.test.ts.md) | 文件 | 0 | 预设图谱测试：验证 research-main 预设可解析且节点全部可达、Gate 与前置绑定正确，converter 自有注册表与打包投影一致，minimal/writing/reviewer/pipeline 预设保留声明的 handoff 物化交接。 |
| [tests/procedures.test.ts](../files/tests/procedures.test.ts.md) | 文件 | 0 | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |
| [tests/quarto-delivery.test.ts](../files/tests/quarto-delivery.test.ts.md) | 文件 | 0 | 验证 Quarto 探测的可用/不可用/未知三态、单文件渲染默认不执行命令，以及执行同意、既有目标与渲染失败时的 fail-closed 行为。 |
| [tests/review-response.test.ts](../files/tests/review-response.test.ts.md) | 文件 | 0 | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |
| [tests/review-workspace-v2.test.ts](../files/tests/review-workspace-v2.test.ts.md) | 文件 | 0 | review-workspace.v2 的测试：冻结来源比对、结果快照的锚点校验、三种投影适配器、块解析、宿主 LaTeX/HTML 转换与 handoff 状态判定。 |
| [tests/review-workspace.test.ts](../files/tests/review-workspace.test.ts.md) | 文件 | 0 | v1 工作台与预览夹具的测试：适配器证据保真、结果覆盖全部条目、静态 HTML 的自包含性，以及预览样例确实走真实 v2 适配器。 |
| [tests/revision-master-audit.test.ts](../files/tests/revision-master-audit.test.ts.md) | 文件 | 6 | 校验 revision-master 的固定快照证据：SOURCE.json 声明的上游提交、upstream 各 blob 就位、审计 JSON 的计数与 8 条已批准适配，以及 45 个抽取产物逐个哈希复现。 |
| [tests/revision-master-runtime.test.ts](../files/tests/revision-master-runtime.test.ts.md) | 文件 | 6 | revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。 |
| [tests/revision-master-workspace.test.ts](../files/tests/revision-master-workspace.test.ts.md) | 文件 | 0 | revision-master 评审工作区与结果的契约测试：验证多对多关系保留、断裂引用被拒、确认必须精确覆盖候选，以及来源变更与页面渲染失败的处理。 |
| [tests/scientific-agent-skills-audit.test.ts](../files/tests/scientific-agent-skills-audit.test.ts.md) | 文件 | 1 | Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。 |
| [tests/scientific-agent-skills-converter.test.ts](../files/tests/scientific-agent-skills-converter.test.ts.md) | 文件 | 0 | Scientific Agent Skills 转换测试：验证准入策略覆盖全部审计记录、人工安全评审与准入结论互相印证，且已生成 bundle 保留 632 个资源与规范化入口并通过输出与幂等校验。 |
| [tests/scientific-agent-skills-extensions.test.ts](../files/tests/scientific-agent-skills-extensions.test.ts.md) | 文件 | 1 | 校验 Scientific Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [tests/scientific-agent-skills-maintenance.test.ts](../files/tests/scientific-agent-skills-maintenance.test.ts.md) | 文件 | 0 | 以运行时读取的目录为准断言 Scientific Agent Skills 的 revision 与 vendor checkout 的 HEAD 一致，并校验 capability ID 与 raw Skill ID 的一对一唯一性及统一 brief 字段。 |
| [tests/scientific-agent-skills-security-review.test.ts](../files/tests/scientific-agent-skills-security-review.test.ts.md) | 文件 | 1 | 人工安全评审测试：确认必评 Skill 全部有结论、finding 数量与上游审计一致、评审完整，并验证 pending 决策、清单漂移、证据越界与不当适配会被拒绝。 |
| [tests/skill-harness.test.ts](../files/tests/skill-harness.test.ts.md) | 文件 | 0 | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |
| [tests/tooluniverse-adaptations.test.ts](../files/tests/tooluniverse-adaptations.test.ts.md) | 文件 | 0 | ToolUniverse 语义适配规则测试：验证 FAERS 旧参数重写与 limit 钳制、CLI 行内字典修复、结果信封读取与迭代修正，同时确保非 FAERS 与分析类调用不被误改。 |
| [tests/tooluniverse-audit.test.ts](../files/tests/tooluniverse-audit.test.ts.md) | 文件 | 0 | ToolUniverse 不可变审计测试：校验 v1.5.4 固定源码身份、185 个 Skill 逐一覆盖、资源统计与证据路径复算，并确认安全发现、域归类与准入结论一致。 |
| [tests/tooluniverse-converter.test.ts](../files/tests/tooluniverse-converter.test.ts.md) | 文件 | 0 | ToolUniverse 转换产物测试：断言 130 准入 / 55 排除、226 条依赖边分类、被排除资源的理由，以及生成 bundle 的输出校验、幂等性与静态权威与署名契约。 |
| [tests/tooluniverse-extensions.test.ts](../files/tests/tooluniverse-extensions.test.ts.md) | 文件 | 1 | 校验 ToolUniverse 扩展注册表与三十个域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [tests/tooluniverse-maintenance.test.ts](../files/tests/tooluniverse-maintenance.test.ts.md) | 文件 | 0 | 断言 ToolUniverse 目录把 130 个 reviewed Skills 一对一映射为 extension，42 个 mixed、88 个 llm，且全部使用统一六项 brief 字段。 |
| [tests/vendor-maintenance.test.ts](../files/tests/vendor-maintenance.test.ts.md) | 文件 | 3 | 校验共享 vendor 维护库：文件哈希能区分非法 UTF-8 字节，且未审阅基线被保护、显式锚点才会生成产物与记录。 |
| [tests/vendor-staging.test.ts](../files/tests/vendor-staging.test.ts.md) | 文件 | 1 | 共享暂存协议测试：遍历全部六个生产 vendor，断言提交目标 vendor 投影不会改动其他 vendor 的任何文件哈希。 |
| [tests/write-plan.test.ts](../files/tests/write-plan.test.ts.md) | 文件 | 0 | 验证 write-plan 的核心不变量：计划后目标被改动即拒绝、用户所有权文件受保护、漂移跳过、符号链接与文件模式处理，以及执行失败后的回滚一致性。 |
| [tests/zotero-adapter-converter.test.ts](../files/tests/zotero-adapter-converter.test.ts.md) | 文件 | 0 | Zotero Adapter 转换链的集成测试：运行不可变审计、转换、输出检查与幂等性检查，并核对生成树的文件清单与哈希。 |

## 子目录
- [fixtures/domain-skill-plugins/vendors/domain-source/rock-mechanics/references](tests/fixtures/domain-skill-plugins/vendors/domain-source/rock-mechanics/references.md)、[fixtures/domain-skill-plugins/vendors/domain-source/rock-mechanics/scripts](tests/fixtures/domain-skill-plugins/vendors/domain-source/rock-mechanics/scripts.md)、[fixtures/domain-skill-plugins/vendors/method-source/research-tables/assets](tests/fixtures/domain-skill-plugins/vendors/method-source/research-tables/assets.md)、[fixtures/material-passport](tests/fixtures/material-passport.md)、[helpers](tests/helpers.md)

## 对外依赖目录

| 目录 | 关系数 |
| --- | --- |
| [tests/helpers](tests/helpers.md) | 37 |
| [src/plugins](src/plugins.md) | 31 |
| [src/core/runtime](src/core/runtime.md) | 15 |
| [src/adapters](src/adapters.md) | 13 |
| [src/vendor-converters/shared](src/vendor-converters/shared.md) | 12 |
| [src/core/contracts](src/core/contracts.md) | 11 |
| [src/vendor-converters/finrobot](src/vendor-converters/finrobot.md) | 11 |
| [src/vendor-audits](src/vendor-audits.md) | 10 |
| [src/capabilities](src/capabilities.md) | 9 |
| [src/arsu-converter](src/arsu-converter.md) | 8 |
| [src/arsu-converter/authoring](src/arsu-converter/authoring.md) | 8 |
| [src/core/workspace](src/core/workspace.md) | 8 |
| [src/vendor-converters/histagent](src/vendor-converters/histagent.md) | 8 |
| [src/arsu-converter/routing](src/arsu-converter/routing.md) | 7 |
| [src](src.md) | 6 |
| [src/arsu-converter/anchors](src/arsu-converter/anchors.md) | 6 |
| [src/arsu-converter/workflow/graph-profiles](src/arsu-converter/workflow/graph-profiles.md) | 6 |
| [src/cli](src/cli.md) | 6 |
| [scripts/dogfood](scripts/dogfood.md) | 5 |
| [src/arsu-converter/revision](src/arsu-converter/revision.md) | 5 |
