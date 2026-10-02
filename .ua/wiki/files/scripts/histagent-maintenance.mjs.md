
# scripts/histagent-maintenance.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/histagent-maintenance.mjs -->

HistAgent 扩展维护 CLI：锁定 snapshot-47bbe21 修订，核对三个自包含 executable Skill 的 bundle 树哈希、extension package、脚本副本与领域分配。
源码：[scripts/histagent-maintenance.mjs](../../../../scripts/histagent-maintenance.mjs)

## 符号（9）
<!-- node: function:scripts/histagent-maintenance.mjs:currentState -->
<!-- node: function:scripts/histagent-maintenance.mjs:extensionPackageTreeSha -->
<!-- node: function:scripts/histagent-maintenance.mjs:extensionProfileTreeSha -->
<!-- node: function:scripts/histagent-maintenance.mjs:extensionRegistrySubsetSha -->
<!-- node: function:scripts/histagent-maintenance.mjs:extensionRows -->
<!-- node: function:scripts/histagent-maintenance.mjs:upstreamState -->
<!-- node: function:scripts/histagent-maintenance.mjs:validatorRequiredFields -->
<!-- node: function:scripts/histagent-maintenance.mjs:vendorBundleState -->
<!-- node: function:scripts/histagent-maintenance.mjs:writeRecords -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [currentState](../../symbols/scripts/histagent-maintenance.mjs/currentState.md) | 函数 | 244–305 | 复杂 | integrity、hash、histagent | 1 | 汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。 |
| extensionPackageTreeSha | 函数 | 218–234 | 中等 | integrity、hash、histagent | 0 | 汇总所有 extension package 文件并按相对路径求聚合树哈希。 |
| extensionProfileTreeSha | 函数 | 236–242 | 中等 | integrity、hash、histagent | 0 | 对各 capability 的 profile YAML 求聚合哈希。 |
| extensionRegistrySubsetSha | 函数 | 204–216 | 中等 | integrity、hash、histagent | 0 | 抽取 registry 中属于本厂商的 capability、profile 与 domain 子集并求稳定哈希。 |
| [extensionRows](../../symbols/scripts/histagent-maintenance.mjs/extensionRows.md) | 函数 | 95–192 | 复杂 | integrity、hash、histagent | 1 | 逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。 |
| upstreamState | 函数 | 38–61 | 中等 | integrity、hash、histagent | 1 | 校验上游 checkout 处于目录指定 revision 且工作区干净，盘点内容文件并记录审计文件哈希。 |
| validatorRequiredFields | 函数 | 194–202 | 中等 | integrity、hash、histagent | 0 | 从验证器 args_template 的 --required 参数解析实际要求的证据字段列表。 |
| vendorBundleState | 函数 | 63–87 | 中等 | integrity、hash、histagent | 1 | 盘点生成根下的 vendor bundle，逐 Skill 记录 SKILL.md 哈希与树哈希，并断言数量符合目录声明。 |
| [writeRecords](../../symbols/scripts/histagent-maintenance.mjs/writeRecords.md) | 函数 | 307–468 | 复杂 | reporting、audit-record、histagent | 1 | 渲染 01-analysis/02-ingestion/03-conversion/04-review 四份锚点记录，并在缺失时生成标记 NOT-COMPLETED 的语义审阅模板。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [vendor-maintenance.mjs](lib/vendor-maintenance.mjs.md) | scripts/lib/vendor-maintenance.mjs | 厂商维护脚本的共享库：确定性文件清单与树哈希、git 跟踪文件盘点、锚点记录哈希、值比较、工��文件同步与审阅工件写出，并按厂商提供的状态/记录函数组装统一的 artifacts/records/baseline/check/diff 命令生命周期。 |

## 依赖

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [createMaintenanceCommands](../../symbols/scripts/lib/vendor-maintenance.mjs/createMaintenanceCommands.md) | scripts/lib/vendor-maintenance.mjs | 为单个厂商组装 artifacts/records/baseline/check/diff 命令：baseline 强制语义审阅完成，check 逐字段比对锚点 manifest 与实时状态，diff 输出关键指纹变化。 |
