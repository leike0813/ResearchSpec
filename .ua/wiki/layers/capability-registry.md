
# 能力与插件目录层

运行期派生的 Procedure/能力目录、核心能力注册与校验、图 profile 注册表，以及插件注册、装配、领域分类（213 学科域 + 5 工具域）与图状态检查。
> 本页由知识图谱分层 `layer:capability-registry` 生成，共 18 个文件级节点。

## 目录分布

| 目录 | 文件数 |
| --- | --- |
| [src/plugins](../modules/src/plugins.md) | 10 |
| [src/capabilities](../modules/src/capabilities.md) | 2 |
| [src/procedures](../modules/src/procedures.md) | 2 |
| [src/core-skills](../modules/src/core-skills.md) | 1 |
| [src/core-skills/paper-humanizer](../modules/src/core-skills/paper-humanizer.md) | 1 |
| [src/graph-profiles](../modules/src/graph-profiles.md) | 1 |
| [src/plugins/taxonomy](../modules/src/plugins/taxonomy.md) | 1 |

## 文件清单

| 文件 | 类型 | 语言 | 摘要 |
| --- | --- | --- | --- |
| [src/capabilities/registry.ts](../files/src/capabilities/registry.ts.md) | 文件 | — | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [src/capabilities/validators.ts](../files/src/capabilities/validators.ts.md) | 文件 | — | 能力校验器执行层：按 manifest 声明依次运行 policy 与 script 校验器；script 校验器在临时目录写入 submission.json 后按 argv 模板执行，网络型校验器失败降级为 degraded 而非 pass。 |
| [src/core-skills/catalog.ts](../files/src/core-skills/catalog.ts.md) | 文件 | — | 核心 Skill 目录占位：当前核心 Skill ID 列表为空，类型由该列表推导。 |
| [src/core-skills/paper-humanizer/reference-mode.ts](../files/src/core-skills/paper-humanizer/reference-mode.ts.md) | 文件 | — | paper-humanizer 路径常量：指向当前的 reference-mode Skill 路径与已退役的 prose-guidance 路径，供转换器判定上游文件是否属于参考模式迁移。 |
| [src/graph-profiles/registry.ts](../files/src/graph-profiles/registry.ts.md) | 文件 | — | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |
| [src/plugins/assembler.ts](../files/src/plugins/assembler.ts.md) | 文件 | — | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [src/plugins/domain-catalog.json](../files/src/plugins/domain-catalog.json.md) | 配置 | — | 内部领域目录：预建全部 213 个学科领域与 5 个工具领域，字段含 domain_id、ANZSRC Group 编码、标题与 skills 归属。 |
| [src/plugins/extensions.ts](../files/src/plugins/extensions.ts.md) | 文件 | — | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [src/plugins/graph-check.ts](../files/src/plugins/graph-check.ts.md) | 文件 | — | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [src/plugins/graph-delivery.ts](../files/src/plugins/graph-delivery.ts.md) | 文件 | — | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [src/plugins/graph-status.ts](../files/src/plugins/graph-status.ts.md) | 文件 | — | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |
| [src/plugins/registry.ts](../files/src/plugins/registry.ts.md) | 文件 | — | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [src/plugins/runtime-capabilities.ts](../files/src/plugins/runtime-capabilities.ts.md) | 文件 | — | 按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。 |
| [src/plugins/status.ts](../files/src/plugins/status.ts.md) | 文件 | — | 把插件配置与安装清单投影为 status 与 catalog 展示模型：域选择、解析快照、可用与已投影域，以及 Skill 级别的汇总条目。 |
| [src/plugins/taxonomy.ts](../files/src/plugins/taxonomy.ts.md) | 文件 | — | ANZSRC 2020 Fields of Research 快照的 schema、加载校验与 Group 标题到领域 slug 的派生规则，是学科领域命名的唯一事实源。 |
| [src/plugins/taxonomy/anzsrc-for-2020.json](../files/src/plugins/taxonomy/anzsrc-for-2020.json.md) | 配置 | — | ANZSRC 2020 Fields of Research 完整分类树（divisions/groups/fields），带来源 URL、SHA-256 与 CC-BY-4.0 署名，是学科领域判定的唯一标准来源。 |
| [src/procedures/catalog.ts](../files/src/procedures/catalog.ts.md) | 文件 | — | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [src/procedures/packet.ts](../files/src/procedures/packet.ts.md) | 文件 | — | 构造 schema `"1"` 的 Procedure 激活包：携带正文摘要、包内知识资源、输入输出、权限边界与推荐执行 Agent 画像。 |

## 对其它分层的依赖

| 目标分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [核心契约与工作流运行时](core.md) | 25 | imports×25 |
| [宿主与投递适配层](adapters.md) | 7 | imports×7 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 2 | imports×2 |
| [评审批注与静态工作台层](review-workspace.md) | 1 | imports×1 |

## 被其它分层依赖

| 来源分层 | 边数 | 关系类型 |
| --- | --- | --- |
| [测试与验收夹具层](tests.md) | 48 | imports×48 |
| [厂商 Skill 转换与审计层](vendor-converters.md) | 13 | imports×13 |
| [CLI 命令入口层](cli.md) | 12 | imports×12 |
| [维护工具链与工程基础设施](tooling.md) | 6 | depends_on×3、imports×3 |
| [ARSU 转换与 Skill 生成层](arsu-converter.md) | 5 | imports×5 |
| [宿主与投递适配层](adapters.md) | 4 | imports×4 |
| [核心契约与工作流运行时](core.md) | 2 | imports×2 |
