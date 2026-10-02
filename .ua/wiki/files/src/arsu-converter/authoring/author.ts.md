
# src/arsu-converter/authoring/author.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/authoring](../../../../modules/src/arsu-converter/authoring.md)
<!-- node: file:src/arsu-converter/authoring/author.ts -->

Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。
源码：[src/arsu-converter/authoring/author.ts](../../../../../../src/arsu-converter/authoring/author.ts)

## 符号（3）
<!-- node: function:src/arsu-converter/authoring/author.ts:authorCapabilityPackage -->
<!-- node: function:src/arsu-converter/authoring/author.ts:renderThinSkill -->
<!-- node: function:src/arsu-converter/authoring/author.ts:sha256 -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [authorCapabilityPackage](../../../../symbols/src/arsu-converter/authoring/author.ts/authorCapabilityPackage.md) | 函数 | 86–225 | 复杂 | authoring-pipeline、entry-point、validation、serialization | 2 | 能力包编写主流程：读取 extraction index 并拒绝未通过验证的产物，按声明落盘知识文件与包资源，构建 policy/script validators 与上游来源记录，最后写包并更新注册表。 |
| renderThinSkill | 函数 | 236–310 | 中等 | code-generation、template、skill-authoring | 0 | 从 manifest 渲染薄 SKILL 文档，区分知识引用、按需加载的资源、工具声明、ARS 来源的提示注入防护段落，以及声明了 script validator 时的可执行报告契约。 |
| sha256 | 函数 | 76–78 | 简单 | utility、hashing、determinism | 0 | 对 UTF-8 文本计算 SHA-256，是知识引用内容哈希与注册表 manifest 指纹的统一入口。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-manifest.ts](../../core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [registry.ts](../../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [authoring-converter.test.ts](../../../tests/authoring-converter.test.ts.md) | tests/authoring-converter.test.ts | 验证能力编写器的输出可被注册表加载、manifest 指纹与注册表一致，并断言重复生成完全幂等。 |
| [checker-source.ts](checker-source.ts.md) | src/arsu-converter/authoring/checker-source.ts | 为可执行 checker 能力生成统一的 script_validator 与 validators 资源声明，使报告生成与校验共用同一份 Python 代码。 |
| [cli.ts](cli.ts.md) | src/arsu-converter/authoring/cli.ts | ARSU 能力编写的批处理入口，遍历 M1–M5 全部授权源生成能力包，并以 JSON 输出结果，支持 --dry-run 预检。 |
| [m1-sources.ts](m1-sources.ts.md) | src/arsu-converter/authoring/m1-sources.ts | M1 里程碑六个能力的授权源声明，覆盖研究问题构建、方法设计、文献检索筛选、来源质量分级、证据综合与研究报告撰写，并绑定各自的抽取产物与知识文件。 |
| [m2-sources.ts](m2-sources.ts.md) | src/arsu-converter/authoring/m2-sources.ts | M2 写作里程碑六个能力的授权源声明，覆盖写作接入、稿件结构设计、论证蓝图、正文起草、摘要写作与引用格式合规检查。 |
| [m3-sources.ts](m3-sources.ts.md) | src/arsu-converter/authoring/m3-sources.ts | M3 评审里程碑七个能力的授权源声明，覆盖参考文献完整性核验、评审小组配置、编辑判断、专项评审、反方压力测试、评审综合与投稿前自检。 |
| [m4-sources.ts](m4-sources.ts.md) | src/arsu-converter/authoring/m4-sources.ts | M4 修订里程碑五个能力的授权源声明，包含修订路线图解析、fail-closed 修订打补丁、格式渲染、终稿政策 Gate 与时序完整性核验，并通过 checkerSource 绑定可执行 runner。 |
| [m5-sources.ts](m5-sources.ts.md) | src/arsu-converter/authoring/m5-sources.ts | M5 系统综述与投稿校验里程碑十四个能力的授权源声明，涵盖 meta 分析、偏倚风险评估、图表生成、文献监控、引用存在性核验、污染信号检测等多个 checker，并大量复用 checkerSource 生成的 runner。 |
| [paper-humanizer-cli.ts](paper-humanizer-cli.ts.md) | src/arsu-converter/authoring/paper-humanizer-cli.ts | paper-humanizer 能力族的独立编写入口，使用 vendor-derived 来源选项生成四个能力包。 |
| [paper-humanizer-sources.ts](paper-humanizer-sources.ts.md) | src/arsu-converter/authoring/paper-humanizer-sources.ts | paper-humanizer 四个能力（参考模式、评审、修订、验证）的授权源声明，MIT 许可、vendor-derived 来源，并把文档流水线脚本与本地静态评审页面作为随包资源。 |
| [paper-humanizer.test.ts](../../../tests/paper-humanizer.test.ts.md) | tests/paper-humanizer.test.ts | paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。 |
| [review-response.test.ts](../../../tests/review-response.test.ts.md) | tests/review-response.test.ts | review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。 |
| [revision-master-cli.ts](revision-master-cli.ts.md) | src/arsu-converter/authoring/revision-master-cli.ts | revision-master 能力族的独立编写入口，使用专属 extraction index 与 vendor-derived 来源生成审稿回复能力包。 |
| [revision-master-runtime.test.ts](../../../tests/revision-master-runtime.test.ts.md) | tests/revision-master-runtime.test.ts | revision-master workbench 运行时的端到端测试：在临时目录建 SQLite 工作区，经 uv 共享 Python 环境调用包内工具，校验投影、写入计划、回执与生成的能力包行为。 |
| [revision-master-sources.ts](revision-master-sources.ts.md) | src/arsu-converter/authoring/revision-master-sources.ts | revision-master 五个能力（接入、稿件分析、评语原子化、工作板规划、轮次执行）的授权源声明，以模板数组与共享 Gate 运行时资产组装大量 Jinja 模板、SQLite 脚本和 workbench 资源。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [authorCapabilityPackage](../../../../symbols/src/arsu-converter/authoring/author.ts/authorCapabilityPackage.md) | 函数 | 86–225 | 能力包编写主流程：读取 extraction index 并拒绝未通过验证的产物，按声明落盘知识文件与包资源，构建 policy/script validators 与上游来源记录，最后写包并更新注册表。 |
| sha256 | 函数 | 76–78 | 对 UTF-8 文本计算 SHA-256，是知识引用内容哈希与注册表 manifest 指纹的统一入口。 |
