
# src/arsu-converter/upstream.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/upstream.ts -->

上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。
源码：[src/arsu-converter/upstream.ts](../../../../../src/arsu-converter/upstream.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/upstream.ts:validateUpstreamCheckout -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| validateUpstreamCheckout | 函数 | 22–98 | 中等 | 上游校验、git、门禁、错误处理 | 0 | 校验上游 ARSU checkout：目录存在、位于仓库内、是 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，成功时返回 sourceRoot 与完整 SourceVersion。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [fs-utils.ts](fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [git.ts](git.ts.md) | src/arsu-converter/git.ts | 只读 git 访问封装：执行 git 子命令并把成功、退出码、stdout/stderr 统一为 GitResult，同时提供按 `ls-files --stage` 解析受版本控制的普通文件列表。 |
| [types.ts](types.ts.md) | src/arsu-converter/types.ts | ARSU 转换器共享的数据契约：清单、分组转换结果、风险发现、输出文件记录、验证结果与转换结果聚合类型，并定义携带 code 与 details 的 ArsuConverterError。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.ts](runtime-policy/check.ts.md) | src/arsu-converter/runtime-policy/check.ts | 可独立运行的 runtime-policy 自检入口，校验上游 checkout 后构建策略计划并以 JSON 输出分类/适配/保留计数与 checker 闭包数量，失败时打印聚合错误详情。 |
| [cli.ts](cli.ts.md) | src/arsu-converter/cli.ts | ARSU 转换器的开发者命令行入口，提供 convert、check、idempotence 三个子命令与 --force/--dry-run/--json 选项，并显式拒绝 --source 以固定上游来源为 vendor/ars。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateUpstreamCheckout | 函数 | 22–98 | 校验上游 ARSU checkout：目录存在、位于仓库内、是 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，成功时返回 sourceRoot 与完整 SourceVersion。 |
