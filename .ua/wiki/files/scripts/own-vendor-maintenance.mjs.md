
# scripts/own-vendor-maintenance.mjs
所属分层：[维护工具链与工程基础设施](../../layers/tooling.md)  
所属目录：[scripts](../../modules/scripts.md)
<!-- node: file:scripts/own-vendor-maintenance.mjs -->

自有 vendor 维护 CLI：以 audits/own-vendors/catalog.json 为 SSOT 提供 records/baseline/check/diff/artifacts 子命令，核对上游清单、能力包树哈希与 parity 报告，产出维护记录与基线。
源码：[scripts/own-vendor-maintenance.mjs](../../../../scripts/own-vendor-maintenance.mjs)

## 符号（12）
<!-- node: function:scripts/own-vendor-maintenance.mjs:artifacts -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:baseline -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:capabilityRows -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:check -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:currentState -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:diff -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:main -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:packageTreeSha -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:paritySlice -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:treeSha -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:upstreamInventory -->
<!-- node: function:scripts/own-vendor-maintenance.mjs:writeRecords -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| artifacts | 函数 | 454–470 | 简单 | 产物生成、cli、vendor-治理 | 0 | 先重新生成 vendor 产物再输出维护记录与 parity 制品路径，供维护 Skill 后续语义审阅。 |
| baseline | 函数 | 390–404 | 简单 | 基线、状态快照、vendor-治理 | 0 | 把当前状态写成可比较的基线 JSON，供后续 check 与 diff 使用。 |
| capabilityRows | 函数 | 91–127 | 中等 | 能力包、记录生成、registry | 0 | 把能力 registry 中的每个包整理成维护记录行，含来源、版本、哈希与域归属。 |
| check | 函数 | 410–452 | 中等 | 校验、基线对比、cli | 0 | 把当前状态与基线逐值比较，报告偏离项并以非零状态表示需要先更新基线。 |
| currentState | 函数 | 172–217 | 中等 | 状态快照、vendor-治理、核心逻辑 | 0 | 汇总当前 vendor 的上游 commit、registry 子集哈希、能力包树哈希与 parity 切片，形成 check/diff 共用的状态快照。 |
| diff | 函数 | 472–481 | 简单 | 差异比较、基线、cli | 0 | 输出基线与当前状态之间的字段级差异，供维护者判断是否需要新的锚点。 |
| main | 函数 | 485–513 | 中等 | 入口点、参数解析、cli | 0 | 解析 vendor 与子命令参数，转发到对应维护动作并在未知 vendor 时报错退出。 |
| packageTreeSha | 函数 | 155–170 | 简单 | 哈希计算、能力包、变更检测 | 0 | 计算单个能力包目录的整树哈希，作为包内容是否变化的判据。 |
| paritySlice | 函数 | 129–146 | 简单 | parity、切片、报告消费 | 0 | 从全局 parity 报告中截取属于当前 vendor 的切片及其汇总，避免跨 vendor 混算。 |
| treeSha | 函数 | 51–62 | 简单 | 哈希计算、确定性、树哈希 | 0 | 对目录内文件按相对路径排序后聚合各文件哈希，得到稳定的整树 SHA-256。 |
| upstreamInventory | 函数 | 64–89 | 中等 | 上游清单、扫描、vendor-治理 | 0 | 扫描当前 vendor 检出，产出上游文件清单与 commit，作为维护记录的当前事实基线。 |
| writeRecords | 函数 | 229–382 | 复杂 | 记录生成、markdown、vendor-治理 | 0 | 为当前锚点写出五份维护记录 Markdown（含勾选项、parity 摘要与记录哈希），保持人类可读的维护顺序。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [audit-capability-parity.mjs](audit-capability-parity.mjs.md) | scripts/audit-capability-parity.mjs | 能力包与上游抽取产物的对齐审计：按 provenance 选择 extraction-index，解析上游标题与规则，判定哪些规则在能力包文档中有覆盖并写出对齐报告。 |
