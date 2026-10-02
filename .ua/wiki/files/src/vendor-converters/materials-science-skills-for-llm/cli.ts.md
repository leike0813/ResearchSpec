
# src/vendor-converters/materials-science-skills-for-llm/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: file:src/vendor-converters/materials-science-skills-for-llm/cli.ts -->

Materials-Science-Skills-For-LLM vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。
源码：[src/vendor-converters/materials-science-skills-for-llm/cli.ts](../../../../../../src/vendor-converters/materials-science-skills-for-llm/cli.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/cli.ts:findRepoRoot -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findRepoRoot | 函数 | 25–36 | 简单 | utility、cli、路径解析 | 0 | 逐级向上查找 name 为 researchspec 的 package.json 以确定仓库根目录。 |
| main | 函数 | 10–23 | 简单 | entry-point、cli、参数解析 | 0 | 解析子命令与标志，定位仓库根后分派到 converter，并以退出码反映转换、检查或幂等性结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 10–23 | 解析子命令与标志，定位仓库根后分派到 converter，并以退出码反映转换、检查或幂等性结果。 |
