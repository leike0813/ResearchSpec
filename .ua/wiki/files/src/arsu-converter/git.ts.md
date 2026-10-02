
# src/arsu-converter/git.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/git.ts -->

只读 git 访问封装：执行 git 子命令并把成功、退出码、stdout/stderr 统一为 GitResult，同时提供按 `ls-files --stage` 解析受版本控制的普通文件列表。
源码：[src/arsu-converter/git.ts](../../../../../src/arsu-converter/git.ts)

## 符号（3）
<!-- node: function:src/arsu-converter/git.ts:gitOutput -->
<!-- node: function:src/arsu-converter/git.ts:gitResult -->
<!-- node: function:src/arsu-converter/git.ts:listTrackedFiles -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| gitOutput | 函数 | 34–37 | 简单 | git、utility、wrapper、best-effort | 0 | 在 gitResult 之上只返回成功时的 stdout，失败一律返回空串，供只需尽力获取值的调用方使用。 |
| [gitResult](../../../symbols/src/arsu-converter/git.ts/gitResult.md) | 函数 | 12–32 | 中等 | git、subprocess、error-handling、wrapper | 2 | 在给定目录执行 git 命令并把成功与失败统一归一为 GitResult，失败时从错误对象中提取退出码与已产生的输出而非直接抛出。 |
| listTrackedFiles | 函数 | 39–51 | 中等 | git、parsing、upstream、inventory | 0 | 用 NUL 分隔的 ls-files --stage 输出解析受版本控制的文件，只保留 100644/100755 普通文件模式并排序，命令失败时抛出明确错误。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [manifest.ts](anchors/manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [upstream.ts](upstream.ts.md) | src/arsu-converter/upstream.ts | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| gitOutput | 函数 | 34–37 | 在 gitResult 之上只返回成功时的 stdout，失败一律返回空串，供只需尽力获取值的调用方使用。 |
| [gitResult](../../../symbols/src/arsu-converter/git.ts/gitResult.md) | 函数 | 12–32 | 在给定目录执行 git 命令并把成功与失败统一归一为 GitResult，失败时从错误对象中提取退出码与已产生的输出而非直接抛出。 |
| listTrackedFiles | 函数 | 39–51 | 用 NUL 分隔的 ls-files --stage 输出解析受版本控制的文件，只保留 100644/100755 普通文件模式并排序，命令失败时抛出明确错误。 |
