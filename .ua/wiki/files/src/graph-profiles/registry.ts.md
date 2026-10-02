
# src/graph-profiles/registry.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/graph-profiles](../../../modules/src/graph-profiles.md)
<!-- node: file:src/graph-profiles/registry.ts -->

图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。
源码：[src/graph-profiles/registry.ts](../../../../../src/graph-profiles/registry.ts)

## 符号（3）
<!-- node: class:src/graph-profiles/registry.ts:GraphProfileRegistryError -->
<!-- node: function:src/graph-profiles/registry.ts:loadGraphProfileRegistry -->
<!-- node: function:src/graph-profiles/registry.ts:validateGraphProfileRegistry -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| GraphProfileRegistryError | 类 | 60–65 | 中等 | error-type、diagnostics、registry | 0 | 携带 blocking Diagnostic 列表的图谱注册表错误类型。 |
| loadGraphProfileRegistry | 函数 | 70–84 | 中等 | registry、loader、graph-profiles | 1 | 读取图谱 profile 注册表并默认加载能力注册表用于交叉校验。 |
| [validateGraphProfileRegistry](../../../symbols/src/graph-profiles/registry.ts/validateGraphProfileRegistry.md) | 函数 | 86–174 | 复杂 | registry、validation、integrity、graph-profiles | 1 | 校验图谱注册表：条目 schema、profile 文件可读性与 SHA-256 匹配、图谱 schema 解析，并调用能力注册表校验引用的能力。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [registry.ts](../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [stable-specs.ts](../core/contracts/stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [generate.ts](../arsu-converter/workflow/generate.ts.md) | src/arsu-converter/workflow/generate.ts | 预设图谱生成器：把 converter 内置的 authored 图谱投影为工作区 profiles/ 目录下的 YAML 文件与 registry.json，并按投影内容计算 SHA-256。 |
| [preset-graphs.test.ts](../../tests/preset-graphs.test.ts.md) | tests/preset-graphs.test.ts | 预设图谱测试：验证 research-main 预设可解析且节点全部可达、Gate 与前置绑定正确，converter 自有注册表与打包投影一致，minimal/writing/reviewer/pipeline 预设保留声明的 handoff 物化交接。 |
| [types.ts](../arsu-converter/types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [validate.ts](../arsu-converter/validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |
| [workspace-delivery.ts](../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| GraphProfileRegistryError | 类 | 60–65 | 携带 blocking Diagnostic 列表的图谱注册表错误类型。 |
| loadGraphProfileRegistry | 函数 | 70–84 | 读取图谱 profile 注册表并默认加载能力注册表用于交叉校验。 |
| [validateGraphProfileRegistry](../../../symbols/src/graph-profiles/registry.ts/validateGraphProfileRegistry.md) | 函数 | 86–174 | 校验图谱注册表：条目 schema、profile 文件可读性与 SHA-256 匹配、图谱 schema 解析，并调用能力注册表校验引用的能力。 |
