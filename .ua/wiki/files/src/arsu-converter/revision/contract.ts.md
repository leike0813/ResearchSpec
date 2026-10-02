
# src/arsu-converter/revision/contract.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/revision](../../../../modules/src/arsu-converter/revision.md)
<!-- node: file:src/arsu-converter/revision/contract.ts -->

ARSU 修订补丁 v2.0 的唯一契约：操作、授权上下文、claim strength 变更与批注映射的 zod 定义、校验和 JSON Schema 导出。
源码：[src/arsu-converter/revision/contract.ts](../../../../../../src/arsu-converter/revision/contract.ts)

## 符号（2）
<!-- node: function:src/arsu-converter/revision/contract.ts:revisionPatchJsonSchema -->
<!-- node: function:src/arsu-converter/revision/contract.ts:validateRevisionPatch -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| revisionPatchJsonSchema | 函数 | 199–207 | 简单 | serialization、api-schema、contract | 0 | 把修订补丁 zod 契约导出为 draft-2020-12 JSON Schema，并补上 ResearchSpec 的 $id、标题与说明。 |
| validateRevisionPatch | 函数 | 160–181 | 中等 | validation、contract、diagnostics | 1 | 解析修订补丁契约，并把 zod issue 按路径归类为 schema_invalid、authorization_invalid 或批注映射类诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [stable-specs.ts](../../core/contracts/stable-specs.ts.md) | src/core/contracts/stable-specs.ts | 稳定 spec 契约：project / sources / claims / manuscript 四类 spec 的 Zod schema、StableId 命名规则与 YAML frontmatter 解析入口。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [apply.ts](apply.ts.md) | src/arsu-converter/revision/apply.ts | 在全部前置校验通过后，把 ARSU 修订补丁应用到带块标记的手稿，并汇总改动块、插入块与批注处置计数。 |
| [emit.ts](../emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [manuscript-annotation.test.ts](../../../tests/manuscript-annotation.test.ts.md) | tests/manuscript-annotation.test.ts | 修订补丁与批注来源的端到端测试：补丁应用、过期哈希与不完整映射的失败路径、QMD 围栏保持、独立 helper 的原子输出与来源边界校验。 |
| [validate.ts](../validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| revisionPatchJsonSchema | 函数 | 199–207 | 把修订补丁 zod 契约导出为 draft-2020-12 JSON Schema，并补上 ResearchSpec 的 $id、标题与说明。 |
| validateRevisionPatch | 函数 | 160–181 | 解析修订补丁契约，并把 zod issue 按路径归类为 schema_invalid、authorization_invalid 或批注映射类诊断。 |
