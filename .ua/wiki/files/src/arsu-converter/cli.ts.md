
# src/arsu-converter/cli.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/cli.ts -->

ARSU 转换器的开发者命令行入口，提供 convert、check、idempotence 三个子命令与 --force/--dry-run/--json 选项，并显式拒绝 --source 以固定上游来源为 vendor/ars。
源码：[src/arsu-converter/cli.ts](../../../../../src/arsu-converter/cli.ts)

## 符号（2）
<!-- node: function:src/arsu-converter/cli.ts:main -->
<!-- node: function:src/arsu-converter/cli.ts:parseArgs -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| main | 函数 | 31–91 | 复杂 | cli、orchestration、error-handling、entry-point | 0 | 解析命令行后分派到 convert/check/idempotence，统一处理 JSON 与纯文本输出、退出码，并把 ArsuConverterError 的 code、message 与 details 完整暴露给调用方。 |
| parseArgs | 函数 | 93–107 | 中等 | cli、argument-parsing、utility、parsing | 0 | 把 argv 解析为单个子命令加上选项 Map，支持 `--key` 与 `--key=value` 两种形式，其余位置参数以 positional 序号键保留。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |
| [upstream.ts](upstream.ts.md) | src/arsu-converter/upstream.ts | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| main | 函数 | 31–91 | 解析命令行后分派到 convert/check/idempotence，统一处理 JSON 与纯文本输出、退出码，并把 ArsuConverterError 的 code、message 与 details 完整暴露给调用方。 |
