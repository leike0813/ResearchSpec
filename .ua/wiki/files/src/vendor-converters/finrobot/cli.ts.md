
# src/vendor-converters/finrobot/cli.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: file:src/vendor-converters/finrobot/cli.ts -->

FinRobot vendor converter 的命令行入口，把 convert/check/idempotence/preview 四个子命令分派到 converter 与 preview 模块。
源码：[src/vendor-converters/finrobot/cli.ts](../../../../../../src/vendor-converters/finrobot/cli.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/finrobot/cli.ts:findRepoRoot -->
<!-- node: function:src/vendor-converters/finrobot/cli.ts:main -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| findRepoRoot | 函数 | 36–47 | 简单 | utility、cli、路径解析 | 0 | 从当前目录逐级向上查找 name 为 researchspec 的 package.json，以确定仓库根目录。 |
| main | 函数 | 11–34 | 中等 | entry-point、cli、参数解析 | 0 | 解析子命令与 --force/--dry-run/--json 标志，向上定位仓库根后分派转换或预览，并以进程退出码反映结果。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [preview.ts](preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 11–34 | 解析子命令与 --force/--dry-run/--json 标志，向上定位仓库根后分派转换或预览，并以进程退出码反映结果。 |
