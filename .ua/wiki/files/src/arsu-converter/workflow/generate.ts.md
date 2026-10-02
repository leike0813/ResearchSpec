
# src/arsu-converter/workflow/generate.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/workflow](../../../../modules/src/arsu-converter/workflow.md)
<!-- node: file:src/arsu-converter/workflow/generate.ts -->

预设图谱生成器：把 converter 内置的 authored 图谱投影为工作区 profiles/ 目录下的 YAML 文件与 registry.json，并按投影内容计算 SHA-256。
源码：[src/arsu-converter/workflow/generate.ts](../../../../../../src/arsu-converter/workflow/generate.ts)

## 符号（2）
<!-- node: function:src/arsu-converter/workflow/generate.ts:buildPresetGraphProfileRegistry -->
<!-- node: function:src/arsu-converter/workflow/generate.ts:emitPresetGraphProfiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildPresetGraphProfileRegistry | 函数 | 15–26 | 中等 | graph-profiles、registry、code-generation | 0 | 由 AUTHORED_GRAPH_PROFILES 构造并 schema 校验预设图谱注册表，逐条写入 profile 哈希。 |
| emitPresetGraphProfiles | 函数 | 28–37 | 中等 | graph-profiles、code-generation、filesystem | 0 | 将每个预设图谱写为 <profile_id>.yaml，并在同目录写出 registry.json。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs-utils.ts](../fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [index.ts](graph-profiles/index.ts.md) | src/arsu-converter/workflow/graph-profiles/index.ts | 图谱预设 barrel：汇总 7 个 authored 图谱对象及其 YAML 投影，按 profile_id 排序后统一导出。 |
| [registry.ts](../../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](../converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [preset-graphs.test.ts](../../../tests/preset-graphs.test.ts.md) | tests/preset-graphs.test.ts | 预设图谱测试：验证 research-main 预设可解析且节点全部可达、Gate 与前置绑定正确，converter 自有注册表与打包投影一致，minimal/writing/reviewer/pipeline 预设保留声明的 handoff 物化交接。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| buildPresetGraphProfileRegistry | 函数 | 15–26 | 由 AUTHORED_GRAPH_PROFILES 构造并 schema 校验预设图谱注册表，逐条写入 profile 哈希。 |
| emitPresetGraphProfiles | 函数 | 28–37 | 将每个预设图谱写为 <profile_id>.yaml，并在同目录写出 registry.json。 |
