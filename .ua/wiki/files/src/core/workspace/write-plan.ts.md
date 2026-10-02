
# src/core/workspace/write-plan.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/workspace](../../../../modules/src/core/workspace.md)
<!-- node: file:src/core/workspace/write-plan.ts -->

事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。
源码：[src/core/workspace/write-plan.ts](../../../../../../src/core/workspace/write-plan.ts)

## 符号（6）
<!-- node: function:src/core/workspace/write-plan.ts:assertTransactionBoundaries -->
<!-- node: function:src/core/workspace/write-plan.ts:executeWritePlan -->
<!-- node: function:src/core/workspace/write-plan.ts:hashPath -->
<!-- node: function:src/core/workspace/write-plan.ts:planDirectFileEdit -->
<!-- node: function:src/core/workspace/write-plan.ts:planFile -->
<!-- node: function:src/core/workspace/write-plan.ts:verifyPrecondition -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertTransactionBoundaries | 函数 | 247–257 | 简单 | path-boundary、write-plan、validation | 0 | 为单个事务条目校验其动作涉及的源、目标、临时与备份路径是否都落在允许的边界内。 |
| [executeWritePlan](../../../../symbols/src/core/workspace/write-plan.ts/executeWritePlan.md) | 函数 | 143–227 | 复杂 | write-plan、transaction、rollback、atomicity | 3 | 执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。 |
| hashPath | 函数 | 302–310 | 简单 | hash-verification、filesystem、utility | 1 | 读取磁盘文件并返回其 SHA-256，用于安装清单与漂移检测。 |
| planDirectFileEdit | 函数 | 105–141 | 中等 | write-plan、edit、boundary | 1 | 为运行期直接文件编辑构造一条受边界约束的写入计划，显式携带前一版本内容用于冲突判定。 |
| [planFile](../../../../symbols/src/core/workspace/write-plan.ts/planFile.md) | 函数 | 46–103 | 复杂 | write-plan、ownership、hash-verification、validation | 2 | 比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。 |
| verifyPrecondition | 函数 | 312–326 | 中等 | write-plan、precondition、concurrency | 0 | 在提交前复核操作的 previousHash 前置条件，检测计划生成后到执行前之间的并发改动。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [path-boundary.ts](path-boundary.ts.md) | src/core/workspace/path-boundary.ts | 路径边界守卫：要求 root 与 target 都是绝对路径、目标不逃逸根目录，并逐级 lstat 拒绝路径中的符号链接与非目录祖先。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adaptation.ts](../../vendor-converters/education-agent-skills/adaptation.ts.md) | src/vendor-converters/education-agent-skills/adaptation.ts | 把上游 SKILL.md 改编为 ResearchSpec 授权版本：重写 frontmatter、插入边界声明区块，并在正文中按句/行/列表/表格单元标注证据来源，保证可回溯且原文可恢复。 |
| [adapters.ts](../../review-workspace/adapters.ts.md) | src/review-workspace/adapters.ts | 把标注候选、论文人性化计划与审稿回复工作板投影成评审工作区描述与 v2 工作区，是业务语义与浏览器静态评审面之间的适配层。 |
| [annotation-provenance.ts](../runtime/annotation-provenance.ts.md) | src/core/runtime/annotation-provenance.ts | 校验候选批注集的原始来源真实有效：限制在私有工作根内、拒绝符号链接、比对字节哈希与来源片段，并返回读前置条件。 |
| [complete-tree.ts](../../vendor-converters/education-agent-skills/complete-tree.ts.md) | src/vendor-converters/education-agent-skills/complete-tree.ts | 渲染每个被准入 Skill 的完整文件树（SKILL.md、LICENSE、NOTICE.md），计算逐文件与整树 SHA-256，并汇总为带 treeSetSha256 的完整树集合。 |
| [complete-tree.ts](../../vendor-converters/finrobot/complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [complete-tree.ts](../../vendor-converters/histagent/complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [complete-tree.ts](../../vendor-converters/materials-science-skills-for-llm/complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [converter.ts](../../vendor-converters/finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../../vendor-converters/histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../../vendor-converters/materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../../vendor-converters/scientific-agent-skills/converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [converter.ts](../../vendor-converters/tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
| [converter.ts](../../vendor-converters/zotero-library-agent-bundle/converter.ts.md) | src/vendor-converters/zotero-library-agent-bundle/converter.ts | 把 vendor 的 Zotero Bundle 转换为 `literature-adapters/zotero` 下的发布包，产出转换清单、Skill 树与派生说明，并提供输出检查与幂等性检查。 |
| [delivery.ts](../../adapters/delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [delivery.ts](../../literature-adapters/delivery.ts.md) | src/literature-adapters/delivery.ts | 为可选 Zotero 文献适配器生成受管安装计划：把已选域、运行时平台、Profile 与七个 Skill 资产映射为 write-plan 操作，并协调既有安装的保留、退役与诊断。 |
| [education-agent-skills-ingest.test.ts](../../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |
| [graph-bootstrap.ts](../../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-check.ts](../../plugins/graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-context-cli.test.ts](../../../tests/graph-context-cli.test.ts.md) | tests/graph-context-cli.test.ts | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [graph-context.ts](../../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph-delivery.ts](../../plugins/graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-run.ts](../runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-security.test.ts](../../../tests/graph-security.test.ts.md) | tests/graph-security.test.ts | 验证安全边界：非法项目路径与符号链接组件被拒绝，无效安装清单在任何读取前阻断全部投影写操作，符号链接父目录下的投影不改动目标。 |
| [graph-workspace-index.ts](../runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [installations.ts](../../adapters/installations.ts.md) | src/adapters/installations.ts | 托管安装清单的 schema SSOT：定义安装来源判别联合、所有权约束、路径安全校验与解析渲染，并负责对账过期托管文件、保留用户改动。 |
| [legacy-reconciliation.ts](../../adapters/legacy-reconciliation.ts.md) | src/adapters/legacy-reconciliation.ts | 规划对旧宿主 Skill 目录与过时命令包装的安全清理：仅删除内容与已知 ResearchSpec 字节完全一致的树，其余一律保留并给出诊断。 |
| [literature-adapters.test.ts](../../../tests/literature-adapters.test.ts.md) | tests/literature-adapters.test.ts | 验证 Zotero 目录的发布集与运行组件绑定、适配器表达式与平台规范化的精确行为，以及未选适配器零交付、选定运行时的降级投影策略。 |
| [managed-installation-paths.test.ts](../../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [packet.ts](../../procedures/packet.ts.md) | src/procedures/packet.ts | 构造 schema `"1"` 的 Procedure 激活包：携带正文摘要、包内知识资源、输入输出、权限边界与推荐执行 Agent 画像。 |
| [policy.ts](../../vendor-converters/education-agent-skills/policy.ts.md) | src/vendor-converters/education-agent-skills/policy.ts | Education Agent Skills 生产策略 SSOT：固定 release、revision 与三个权威 SHA-256，加载并校验生产策略、审计与证据映射，展开 165 条准入决策、872 条证据改编、813 条建议关系与 136 条安全域决策。 |
| [policy.ts](../../vendor-converters/finrobot/policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [policy.ts](../../vendor-converters/histagent/policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |
| [policy.ts](../../vendor-converters/materials-science-skills-for-llm/policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [preview.ts](../../vendor-converters/finrobot/preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |
| [project-entry.ts](../../adapters/project-entry.ts.md) | src/adapters/project-entry.ts | 维护项目级研究入口协议：对共享标记区域或专用文件写入、移除与检查 Navigate 入口协议文本，在用户改动出现时保留内容并报告诊断。 |
| [review-workspace-preview.ts](../../../harness/review-workspace-preview.ts.md) | harness/review-workspace-preview.ts | 维护者预览夹具：用手写手稿、冻结的 pandoc AST 和润色方案组装 7 个 review-workspace.v2 样例，并给静态工作台 HTML 注入一个样例下拉选择器与 base64 引导脚本。 |
| [staging.ts](../../vendor-converters/shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [vendor-staging.test.ts](../../../tests/vendor-staging.test.ts.md) | tests/vendor-staging.test.ts | 共享暂存协议测试：遍历全部六个生产 vendor，断言提交目标 vendor 投影不会改动其他 vendor 的任何文件哈希。 |
| [workspace-delivery.ts](../../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |
| [write-plan.test.ts](../../../tests/write-plan.test.ts.md) | tests/write-plan.test.ts | 验证 write-plan 的核心不变量：计划后目标被改动即拒绝、用户所有权文件受保护、漂移跳过、符号链接与文件模式处理，以及执行失败后的回滚一致性。 |
| [zotero-adapter-converter.test.ts](../../../tests/zotero-adapter-converter.test.ts.md) | tests/zotero-adapter-converter.test.ts | Zotero Adapter 转换链的集成测试：运行不可变审计、转换、输出检查与幂等性检查，并核对生成树的文件清单与哈希。 |
| [zotero-library-agent-bundle.ts](../../vendor-audits/zotero-library-agent-bundle.ts.md) | src/vendor-audits/zotero-library-agent-bundle.ts | Zotero Library Agent Bundle 的不可变审计 SSOT：定义审计 JSON 契约、固定发布集 ID 与路径常量，并校验上游身份、文件哈希与排序一致性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [executeWritePlan](../../../../symbols/src/core/workspace/write-plan.ts/executeWritePlan.md) | 函数 | 143–227 | 执行整批写入事务：先校验冲突与读前置条件，再写临时文件、备份原文件并原子改名，任一步失败即逆序回滚。 |
| hashPath | 函数 | 302–310 | 读取磁盘文件并返回其 SHA-256，用于安装清单与漂移检测。 |
| planDirectFileEdit | 函数 | 105–141 | 为运行期直接文件编辑构造一条受边界约束的写入计划，显式携带前一版本内容用于冲突判定。 |
| [planFile](../../../../symbols/src/core/workspace/write-plan.ts/planFile.md) | 函数 | 46–103 | 比较目标文件的现状与期望内容，判定 create/skip-unchanged/skip-drift/refresh/conflict，并处理所有权、清单哈希与文件模式保护。 |
