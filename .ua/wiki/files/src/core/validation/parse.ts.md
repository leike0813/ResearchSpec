
# src/core/validation/parse.ts
所属分层：[核心契约与工作流运行时](../../../../layers/core.md)  
所属目录：[src/core/validation](../../../../modules/src/core/validation.md)
<!-- node: file:src/core/validation/parse.ts -->

JSON / JSONL / YAML 解析封装：失败时统一转为带文件路径与行号的阻塞诊断，而非抛出异常。
源码：[src/core/validation/parse.ts](../../../../../../src/core/validation/parse.ts)

## 符号（3）
<!-- node: function:src/core/validation/parse.ts:parseJson -->
<!-- node: function:src/core/validation/parse.ts:parseJsonLines -->
<!-- node: function:src/core/validation/parse.ts:parseYaml -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| parseJson | 函数 | 5–11 | 简单 | parsing、json、diagnostics、utility | 0 | 解析 JSON 文本，失败时返回带路径的 invalid_json 诊断。 |
| parseJsonLines | 函数 | 13–25 | 简单 | parsing、jsonl、diagnostics、utility | 0 | 逐行解析 JSONL 并在失败时附带行号，空白行忽略。 |
| parseYaml | 函数 | 27–33 | 简单 | parsing、yaml、diagnostics、utility | 0 | 解析 YAML 文本，失败时返回带路径的 invalid_yaml 诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [types.ts](types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| parseJson | 函数 | 5–11 | 解析 JSON 文本，失败时返回带路径的 invalid_json 诊断。 |
| parseJsonLines | 函数 | 13–25 | 逐行解析 JSONL 并在失败时附带行号，空白行忽略。 |
| parseYaml | 函数 | 27–33 | 解析 YAML 文本，失败时返回带路径的 invalid_yaml 诊断。 |
