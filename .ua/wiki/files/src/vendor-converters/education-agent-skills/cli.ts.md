
# src/vendor-converters/education-agent-skills/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/education-agent-skills](../../../../modules/src/vendor-converters/education-agent-skills.md)
<!-- node: file:src/vendor-converters/education-agent-skills/cli.ts -->

Education Agent Skills vendor converter 的命令行入口，串联 preview、convert、check、idempotence 四个子命令并支持 --force/--dry-run/--json。
源码：[src/vendor-converters/education-agent-skills/cli.ts](../../../../../../src/vendor-converters/education-agent-skills/cli.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/education-agent-skills/cli.ts:findRepoRoot -->
<!-- node: function:src/vendor-converters/education-agent-skills/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findRepoRoot | 函数 | 53–66 | 简单 | cli、path-resolution、utility | 0 | 自当前目录向上定位仓库根目录，供转换器解析 vendor 与审计路径。 |
| main | 函数 | 19–51 | 中等 | cli、command-dispatch、entry-point | 0 | 按子命令分派到预览、转换、产物检查或幂等性检查，并以 JSON 或人读形式输出结果与退出码。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [preview.ts](preview.ts.md) | src/vendor-converters/education-agent-skills/preview.ts | 生成 Education Agent Skills 转换预览：渲染完整树并输出一份中文审阅报告与计数摘要，供人工在正式转换前核对准入范围。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 19–51 | 按子命令分派到预览、转换、产物检查或幂等性检查，并以 JSON 或人读形式输出结果与退出码。 |
