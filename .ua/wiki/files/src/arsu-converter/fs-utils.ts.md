
# src/arsu-converter/fs-utils.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter](../../../modules/src/arsu-converter.md)
<!-- node: file:src/arsu-converter/fs-utils.ts -->

转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。
源码：[src/arsu-converter/fs-utils.ts](../../../../../src/arsu-converter/fs-utils.ts)

## 符号（8）
<!-- node: function:src/arsu-converter/fs-utils.ts:isDirectory -->
<!-- node: function:src/arsu-converter/fs-utils.ts:listFiles -->
<!-- node: function:src/arsu-converter/fs-utils.ts:pathExists -->
<!-- node: function:src/arsu-converter/fs-utils.ts:readUtf8 -->
<!-- node: function:src/arsu-converter/fs-utils.ts:removeTree -->
<!-- node: function:src/arsu-converter/fs-utils.ts:sha256File -->
<!-- node: function:src/arsu-converter/fs-utils.ts:writeJson -->
<!-- node: function:src/arsu-converter/fs-utils.ts:writeUtf8 -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| isDirectory | 函数 | 17–25 | 简单 | filesystem、utility、predicate、type-guard | 0 | 在存在性判断之上进一步确认路径是否为目录，供清单扫描区分文件与目录。 |
| [listFiles](../../../symbols/src/arsu-converter/fs-utils.ts/listFiles.md) | 函数 | 27–45 | 中等 | filesystem、recursion、utility、traversal | 2 | 递归遍历目录收集全部文件路径，跳过 .git 并统一为 POSIX 分隔符后排序返回，是上游清单与清单化扫描的共同基础。 |
| pathExists | 函数 | 6–15 | 简单 | filesystem、utility、error-handling、predicate | 0 | 判断路径是否存在，只把 ENOENT 归一为 false，其余错误继续抛出，避免权限问题被误判为文件缺失。 |
| readUtf8 | 函数 | 47–49 | 简单 | filesystem、io、utility、text | 0 | 以 UTF-8 读取文本文件的薄封装，为其余调用点统一编码约定。 |
| removeTree | 函数 | 60–62 | 简单 | filesystem、cleanup、utility、destructive | 0 | 以 force 模式递归删除目录树，用于重新生成前清空既有输出目录。 |
| [sha256File](../../../symbols/src/arsu-converter/fs-utils.ts/sha256File.md) | 函数 | 64–75 | 中等 | hashing、filesystem、utility、integrity | 2 | 以流式读取方式计算文件 SHA-256，是清单记录与漂移检测的通用指纹实现。 |
| writeJson | 函数 | 56–58 | 简单 | filesystem、io、serialization、utility | 0 | 以两空格缩进并附加结尾换行写出 JSON，保证生成的清单文件在 diff 中稳定可读。 |
| writeUtf8 | 函数 | 51–54 | 简单 | filesystem、io、utility、text | 1 | 写入 UTF-8 文本前先递归创建父目录，使生成流程不必为每个目标路径单独准备目录结构。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [check.ts](anchors/check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [converter.ts](converter.ts.md) | src/arsu-converter/converter.ts | ARSU 转换的编排中枢：校验上游 checkout、先规划锚点替换与运行时策略并检查重写冲突，再逐 Skill 分组生成文件、写出契约清单/路由目录/图 profile 注册表，最后两阶段写入报告与 manifest 并执行产物校验。 |
| [emit.ts](emit.ts.md) | src/arsu-converter/emit.ts | 单个 Skill 分组的文件生成器：递归发现并改写依赖、替换锚点与运行时策略文本、保护注入的契约块免受链接重写影响，并为论文/流水线分组额外投影 revision patch、Quarto 渲染脚本与离线 Zotero 包标记。 |
| [generate.ts](anchors/generate.ts.md) | src/arsu-converter/anchors/generate.ts | 上游清单生成的可执行封装：重新扫描 vendor/ars 并把 upstream-manifest.json 写回仓库，同时支持作为脚本直接运行以刷新已提交的审计基线。 |
| [generate.ts](workflow/generate.ts.md) | src/arsu-converter/workflow/generate.ts | 预设图谱生成器：把 converter 内置的 authored 图谱投影为工作区 profiles/ 目录下的 YAML 文件与 registry.json，并按投影内容计算 SHA-256。 |
| [idempotence.ts](idempotence.ts.md) | src/arsu-converter/idempotence.ts | 转换幂等性校验：既检查既有输出是否偏离其自身 manifest，也通过在临时目录重新生成并比较归一化 manifest 来证明重复转换字节一致。 |
| [ingest.ts](ingest.ts.md) | src/arsu-converter/ingest.ts | 上游文件清单化入口：只把存在 SKILL.md 的分组登记为 Skill 分组，随后用 classifyPath 把全部源路径分流进运行时目录、共享、排除与待复核四个集合并统一排序。 |
| [licensing.ts](licensing.ts.md) | src/arsu-converter/licensing.ts | ARSU 分组的许可与署名投影：校验上游 LICENSE 确为 Cheng-I Wu 的 CC BY-NC 4.0 授权后原样复制，并为每个分组生成独立署名 NOTICE.md。 |
| [manifest.ts](anchors/manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [planner.ts](runtime-policy/planner.ts.md) | src/arsu-converter/runtime-policy/planner.ts | 运行时策略计划器：按目录逐条读取上游源文件，把命中段落或整文件改写为 host-native 委托文本，注入 checker 闭包与「不可用上游运行时」替换段落，并校验目录分类完整性、源 commit 与 41/5 数量约束，全部通过后才返回带 SHA-256 证据的改写计划。 |
| [upstream.ts](upstream.ts.md) | src/arsu-converter/upstream.ts | 上游 ARSU checkout 的门禁：定位仓库根与 vendor 目录，校验来源路径位于仓库内、是独立 git 仓库、能解析 HEAD、必需 skill group 齐备且工作区干净，否则抛出带具体原因码的 ArsuConverterError。 |
| [validate.ts](validate.ts.md) | src/arsu-converter/validate.ts | 生成产物的离线验收器：核对清单结构与 SHA-256、契约注入标记、路由目录落盘一致性、anchor 替换标记、运行时策略报告与 checker 闭包、Markdown 链接可解析性、风险发现覆盖率，并拦截未获批的上游根脚本与禁止的 provider 指导。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| isDirectory | 函数 | 17–25 | 在存在性判断之上进一步确认路径是否为目录，供清单扫描区分文件与目录。 |
| [listFiles](../../../symbols/src/arsu-converter/fs-utils.ts/listFiles.md) | 函数 | 27–45 | 递归遍历目录收集全部文件路径，跳过 .git 并统一为 POSIX 分隔符后排序返回，是上游清单与清单化扫描的共同基础。 |
| pathExists | 函数 | 6–15 | 判断路径是否存在，只把 ENOENT 归一为 false，其余错误继续抛出，避免权限问题被误判为文件缺失。 |
| readUtf8 | 函数 | 47–49 | 以 UTF-8 读取文本文件的薄封装，为其余调用点统一编码约定。 |
| removeTree | 函数 | 60–62 | 以 force 模式递归删除目录树，用于重新生成前清空既有输出目录。 |
| [sha256File](../../../symbols/src/arsu-converter/fs-utils.ts/sha256File.md) | 函数 | 64–75 | 以流式读取方式计算文件 SHA-256，是清单记录与漂移检测的通用指纹实现。 |
| writeJson | 函数 | 56–58 | 以两空格缩进并附加结尾换行写出 JSON，保证生成的清单文件在 diff 中稳定可读。 |
| writeUtf8 | 函数 | 51–54 | 写入 UTF-8 文本前先递归创建父目录，使生成流程不必为每个目标路径单独准备目录结构。 |
