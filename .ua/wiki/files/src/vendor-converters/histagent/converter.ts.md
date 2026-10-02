
# src/vendor-converters/histagent/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: file:src/vendor-converters/histagent/converter.ts -->

HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。
源码：[src/vendor-converters/histagent/converter.ts](../../../../../../src/vendor-converters/histagent/converter.ts)

## 符号（5）
<!-- node: function:src/vendor-converters/histagent/converter.ts:checkHistAgentIdempotence -->
<!-- node: function:src/vendor-converters/histagent/converter.ts:checkHistAgentOutput -->
<!-- node: function:src/vendor-converters/histagent/converter.ts:convertHistAgent -->
<!-- node: function:src/vendor-converters/histagent/converter.ts:generateBundle -->
<!-- node: function:src/vendor-converters/histagent/converter.ts:validatePrerequisites -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkHistAgentIdempotence | 函数 | 147–156 | 简单 | 幂等性、校验、vendor-converter | 0 | 重新渲染并与已提交输出逐字节比对，返回漂移路径确认转换可重复。 |
| checkHistAgentOutput | 函数 | 102–145 | 复杂 | 校验、生成物检查、vendor-converter | 0 | 校验已提交的 HistAgent 生成物与当前策略、审计哈希和领域归属一致，汇总错误与警告。 |
| convertHistAgent | 函数 | 78–100 | 中等 | 转换流水线、orchestration、entry-point | 1 | 执行一次 HistAgent 转换：断言策略已批准、校验前置快照、渲染完整树并在暂存目录生成后提交或返回 dry-run 清单。 |
| generateBundle | 函数 | 158–244 | 复杂 | 代码生成、转换流水线、哈希绑定 | 0 | 在暂存目录写出三个 Skill 树、vendor bundle、转换清单与来源证据，是生成物字节的唯一来源。 |
| validatePrerequisites | 函数 | 246–255 | 简单 | 校验、前置条件、vendor-converter | 0 | 确认上游固定快照与审计文件存在且哈希与策略声明一致，缺失或漂移时立即失败。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../../plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |
| [production-vendors.ts](../shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/histagent/cli.ts | HistAgent vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。 |
| [histagent-converter.test.ts](../../../tests/histagent-converter.test.ts.md) | tests/histagent-converter.test.ts | HistAgent 生产转换测试：断言已发布 bundle 是经批准的三 Skill 完整树投影，树集合哈希、零硬依赖、域归属与输出校验、幂等性结论全部匹配。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkHistAgentIdempotence | 函数 | 147–156 | 重新渲染并与已提交输出逐字节比对，返回漂移路径确认转换可重复。 |
| checkHistAgentOutput | 函数 | 102–145 | 校验已提交的 HistAgent 生成物与当前策略、审计哈希和领域归属一致，汇总错误与警告。 |
| convertHistAgent | 函数 | 78–100 | 执行一次 HistAgent 转换：断言策略已批准、校验前置快照、渲染完整树并在暂存目录生成后提交或返回 dry-run 清单。 |
