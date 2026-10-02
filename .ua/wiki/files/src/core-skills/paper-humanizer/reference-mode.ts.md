
# src/core-skills/paper-humanizer/reference-mode.ts
所属分层：[能力与插件目录层](../../../../layers/capability-registry.md)  
所属目录：[src/core-skills/paper-humanizer](../../../../modules/src/core-skills/paper-humanizer.md)
<!-- node: file:src/core-skills/paper-humanizer/reference-mode.ts -->

paper-humanizer 路径常量：指向当前的 reference-mode Skill 路径与已退役的 prose-guidance 路径，供转换器判定上游文件是否属于参考模式迁移。
源码：[src/core-skills/paper-humanizer/reference-mode.ts](../../../../../../src/core-skills/paper-humanizer/reference-mode.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-converter.test.ts](../../../tests/arsu-converter.test.ts.md) | tests/arsu-converter.test.ts | ARSU 转换端到端测试：用临时目录与固定 fixture runtime-policy catalog 构造最小上游，验证转换产物、幂等性、清单归一化、anchor 替换、路由 frontmatter 投影与 paper-humanizer 参考模式迁移。 |
| [contracts.ts](../../arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts | ResearchSpec 契约集成层：定义 preflight profile 与各注入标记、变更归属矩阵，构建契约集成清单，并向每个生成的 SKILL.md 注入包含 CLI 协议、Gate/Decision 确认、论文交付与文献适配约束的契约前言块。 |
| [paper-humanizer.test.ts](../../../tests/paper-humanizer.test.ts.md) | tests/paper-humanizer.test.ts | paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。 |
