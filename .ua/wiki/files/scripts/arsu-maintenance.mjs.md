
# scripts/arsu-maintenance.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/arsu-maintenance.mjs -->

ARS/ARSU 能力维护 CLI：按 anchors baseline/records/artifacts/check/diff 固化上游 submodule 修订、抽取索引统计、能力 registry 与 parity 覆盖率，并在语义审阅完成后写出锚点 manifest。
源码：[scripts/arsu-maintenance.mjs](../../../../scripts/arsu-maintenance.mjs)

## 符号（14）
<!-- node: function:scripts/arsu-maintenance.mjs:artifacts -->
<!-- node: function:scripts/arsu-maintenance.mjs:assessmentRows -->
<!-- node: function:scripts/arsu-maintenance.mjs:baseline -->
<!-- node: function:scripts/arsu-maintenance.mjs:capabilityRows -->
<!-- node: function:scripts/arsu-maintenance.mjs:check -->
<!-- node: function:scripts/arsu-maintenance.mjs:currentState -->
<!-- node: function:scripts/arsu-maintenance.mjs:diff -->
<!-- node: function:scripts/arsu-maintenance.mjs:graphProfileRows -->
<!-- node: function:scripts/arsu-maintenance.mjs:modeRegistryRows -->
<!-- node: function:scripts/arsu-maintenance.mjs:parityPackageRows -->
<!-- node: function:scripts/arsu-maintenance.mjs:recordSha -->
<!-- node: function:scripts/arsu-maintenance.mjs:treeSha -->
<!-- node: function:scripts/arsu-maintenance.mjs:upstreamInventory -->
<!-- node: function:scripts/arsu-maintenance.mjs:writeRecords -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| artifacts | 函数 | 496–506 | 中等 | audit-anchor、arsu、validation | 0 | 依次运行 parity 审计与三个 ARSU HTML 审阅生成器，产出锚点 artifacts 目录。 |
| assessmentRows | 函数 | 151–177 | 中等 | audit-anchor、arsu、reporting | 0 | 汇总 graph 匹配评估与缺口语义审阅的判定行。 |
| baseline | 函数 | 414–430 | 中等 | audit-anchor、arsu、validation | 0 | 写记录后要求语义审阅含结论且无 NOT-COMPLETED，再写出锚点 manifest.json。 |
| capabilityRows | 函数 | 87–117 | 中等 | audit-anchor、arsu、reporting | 0 | 汇总 capability 数量、成熟度与包完整性行，供 parity 报告引用。 |
| check | 函数 | 451–494 | 复杂 | audit-anchor、arsu、validation | 0 | 逐字段比对锚点 manifest 与实时状态，任一不一致即打印 FAIL 并置非零退出码。 |
| [currentState](../../symbols/scripts/arsu-maintenance.mjs/currentState.md) | 函数 | 359–403 | 复杂 | audit-anchor、arsu、validation | 1 | 汇总上游修订、抽取索引、registry 转换、parity 覆盖率与三份 HTML 审阅哈希，构成锚点状态。 |
| diff | 函数 | 508–516 | 简单 | audit-anchor、arsu、validation | 0 | 对比两个锚点 manifest 的上游版本、提交、能力数与覆盖率变化。 |
| graphProfileRows | 函数 | 119–136 | 中等 | audit-anchor、arsu、reporting | 0 | 汇总 ARSU graph profile 的节点、Gate 与 Decision 覆盖行。 |
| modeRegistryRows | 函数 | 74–85 | 中等 | audit-anchor、arsu、reporting | 0 | 从能力 registry 汇总各宿主交付模式下的能力覆盖行。 |
| parityPackageRows | 函数 | 138–149 | 中等 | audit-anchor、arsu、reporting | 0 | 从 parity 报告提取逐 capability 的段落与规则覆盖率行。 |
| recordSha | 函数 | 405–412 | 简单 | audit-anchor、arsu、validation | 0 | 对锚点记录文件求聚合哈希。 |
| treeSha | 函数 | 30–41 | 中等 | audit-anchor、arsu、validation | 0 | 遍历目录内全部文件并按相对路径求聚合哈希。 |
| upstreamInventory | 函数 | 47–72 | 中等 | audit-anchor、arsu、validation | 1 | 统计 ARS submodule 的文件数并按顶层区域与扩展名聚合，另计 agents/references/templates 规模。 |
| [writeRecords](../../symbols/scripts/arsu-maintenance.mjs/writeRecords.md) | 函数 | 179–357 | 复杂 | audit-anchor、arsu、reporting | 1 | 渲染 ARS 锚点的五份记录文件，并保留已有人工填写的语义审阅。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [vendor-maintenance.mjs](lib/vendor-maintenance.mjs.md) | scripts/lib/vendor-maintenance.mjs | 厂商维护脚本的共享库：确定性文件清单与树哈希、git 跟踪文件盘点、锚点记录哈希、值比较、工��文件同步与审阅工件写出，并按厂商提供的状态/记录函数组装统一的 artifacts/records/baseline/check/diff 命令生命周期。 |
