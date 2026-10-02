
# scripts/lib/vendor-maintenance.mjs
所属分层：[维护工具链与工程基础设施](../../../layers/tooling.md)  
所属目录：[scripts/lib](../../../modules/scripts/lib.md)
<!-- node: file:scripts/lib/vendor-maintenance.mjs -->

厂商维护脚本的共享库：确定性文件清单与树哈希、git 跟踪文件盘点、锚点记录哈希、值比较、工��文件同步与审阅工件写出，并按厂商提供的状态/记录函数组装统一的 artifacts/records/baseline/check/diff 命令生命周期。
源码：[scripts/lib/vendor-maintenance.mjs](../../../../../scripts/lib/vendor-maintenance.mjs)

## 符号（8）
<!-- node: function:scripts/lib/vendor-maintenance.mjs:createMaintenanceCommands -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:fileSha -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:gitTrackedFiles -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:inventory -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:recordSha -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:sha256 -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:syncTools -->
<!-- node: function:scripts/lib/vendor-maintenance.mjs:writeReviewArtifact -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [createMaintenanceCommands](../../../symbols/scripts/lib/vendor-maintenance.mjs/createMaintenanceCommands.md) | 函数 | 150–265 | 复杂 | cli-factory、validation、orchestration | 6 | 为单个厂商组装 artifacts/records/baseline/check/diff 命令：baseline 强制语义审阅完成，check 逐字段比对锚点 manifest 与实时状态，diff 输出关键指纹变化。 |
| fileSha | 函数 | 23–25 | 简单 | hashing、utility、vendor-maintenance | 1 | 计算文件内容的 SHA-256。 |
| gitTrackedFiles | 函数 | 39–50 | 简单 | git、inventory、vendor-maintenance | 0 | 用 git ls-files 列出被跟踪且实际存在的文件，作为上游清单的可复现来源。 |
| inventory | 函数 | 70–88 | 中等 | inventory、statistics、vendor-maintenance | 0 | 统计文件总数、树哈希并按扩展名与顶层目录聚合，支撑审计清单记录。 |
| recordSha | 函数 | 98–105 | 简单 | hashing、audit-record、vendor-maintenance | 0 | 对锚点目录下已存在的记录文件求聚合哈希，全部缺失时返回 null。 |
| sha256 | 函数 | 19–21 | 简单 | hashing、utility、vendor-maintenance | 1 | 对字节或字符串做 SHA-256，不做文本解码。 |
| syncTools | 函数 | 113–127 | 中等 | file-sync、generating、vendor-maintenance | 1 | 把 catalog 声明的工具文件从生成根同步到扩展根，内容不一致时才写入。 |
| writeReviewArtifact | 函数 | 129–144 | 中等 | artifact、reporting、vendor-maintenance | 1 | 按当前状态写出 extension-review.json 机器审阅工件。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-maintenance.mjs](../arsu-maintenance.mjs.md) | scripts/arsu-maintenance.mjs | ARS/ARSU 能力维护 CLI：按 anchors baseline/records/artifacts/check/diff 固化上游 submodule 修订、抽取索引统计、能力 registry 与 parity 覆盖率，并在语义审阅完成后写出锚点 manifest。 |
| [education-agent-skills-maintenance.mjs](../education-agent-skills-maintenance.mjs.md) | scripts/education-agent-skills-maintenance.mjs | Education Agent Skills 扩展维护 CLI：锁定 snapshot-6bbbce4 修订与提交，核对 136 个 llm 类型 extension 的 registry 哈希、清单一致性与统一的六项 brief 字段。 |
| [finrobot-maintenance.mjs](../finrobot-maintenance.mjs.md) | scripts/finrobot-maintenance.mjs | FinRobot 扩展维护 CLI：锁定 snapshot-2717499 修订，核对 1048 个跟踪条目之上的六个 financial-research extension、四个 mixed 能力复制的入口脚本与证据验证器。 |
| [histagent-maintenance.mjs](../histagent-maintenance.mjs.md) | scripts/histagent-maintenance.mjs | HistAgent 扩展维护 CLI：锁定 snapshot-47bbe21 修订，核对三个自包含 executable Skill 的 bundle 树哈希、extension package、脚本副本与领域分配。 |
| [materials-science-skills-for-llm-maintenance.mjs](../materials-science-skills-for-llm-maintenance.mjs.md) | scripts/materials-science-skills-for-llm-maintenance.mjs | Materials Science 扩展维护 CLI：锁定 snapshot-fafd3ab 上游修订，核对 7 个 curated Skill 的 bundle 与 extension package、evidence 验证器绑定以及领域归属。 |
| [scientific-agent-skills-maintenance.mjs](../scientific-agent-skills-maintenance.mjs.md) | scripts/scientific-agent-skills-maintenance.mjs | Scientific Agent Skills 扩展维护 CLI：按 v2.70.0 锚点盘点上游与 vendor bundle，校验每个 extension package 的 manifest 哈希、执行类型、验证器与 knowledge refs，并重算 registry 子集、package 树与 profile 树哈希。 |
| [tooluniverse-maintenance.mjs](../tooluniverse-maintenance.mjs.md) | scripts/tooluniverse-maintenance.mjs | ToolUniverse 扩展维护 CLI：校验 vendor/tooluniverse 处于目录锁定 revision 且干净，盘点 130 个 reviewed vendor-bundle Skills，并逐能力核对 registry 清单、package 树哈希、验证器必需字段与工具文件字节一致。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [createMaintenanceCommands](../../../symbols/scripts/lib/vendor-maintenance.mjs/createMaintenanceCommands.md) | 函数 | 150–265 | 为单个厂商组装 artifacts/records/baseline/check/diff 命令：baseline 强制语义审阅完成，check 逐字段比对锚点 manifest 与实时状态，diff 输出关键指纹变化。 |
| fileSha | 函数 | 23–25 | 计算文件内容的 SHA-256。 |
| gitTrackedFiles | 函数 | 39–50 | 用 git ls-files 列出被跟踪且实际存在的文件，作为上游清单的可复现来源。 |
| inventory | 函数 | 70–88 | 统计文件总数、树哈希并按扩展名与顶层目录聚合，支撑审计清单记录。 |
| recordSha | 函数 | 98–105 | 对锚点目录下已存在的记录文件求聚合哈希，全部缺失时返回 null。 |
| sha256 | 函数 | 19–21 | 对字节或字符串做 SHA-256，不做文本解码。 |
| syncTools | 函数 | 113–127 | 把 catalog 声明的工具文件从生成根同步到扩展根，内容不一致时才写入。 |
| writeReviewArtifact | 函数 | 129–144 | 按当前状态写出 extension-review.json 机器审阅工件。 |
