
# src/arsu-converter/anchors/manifest.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/manifest.ts -->

上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。
源码：[src/arsu-converter/anchors/manifest.ts](../../../../../../src/arsu-converter/anchors/manifest.ts)

## 符号（8）
<!-- node: function:src/arsu-converter/anchors/manifest.ts:classifyFile -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:countOccurrences -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:extractFrontmatter -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:extractHeadings -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:findRiskHits -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:generateUpstreamManifest -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:normalizeContent -->
<!-- node: function:src/arsu-converter/anchors/manifest.ts:sha256Text -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| classifyFile | 函数 | 167–174 | 简单 | classification、utility、manifest、file-type | 0 | 按扩展名把上游文件归为 markdown、json、yaml、text 或 other，使清单条目能按类型采取不同的抽取策略。 |
| countOccurrences | 函数 | 154–165 | 简单 | utility、string-search、risk-scanning、counting | 0 | 大小写不敏感地统计子串出现次数，通过前后移位推进避免重复计数。 |
| extractFrontmatter | 函数 | 132–143 | 中等 | parsing、yaml、markdown、extraction | 0 | 解析文件头部的 YAML frontmatter 为排序后的键集合与字符串值映射，去除首尾引号；非 frontmatter 文件返回 undefined。 |
| extractHeadings | 函数 | 122–130 | 简单 | parsing、markdown、manifest、extraction | 0 | 用行级正则抽取 Markdown 的 1-6 级标题及其层级，写入清单以支持标题结构漂移检测。 |
| findRiskHits | 函数 | 145–152 | 简单 | risk-scanning、audit、keyword-matching、manifest | 0 | 对归一化正文统计全部契约风险关键词的出现次数，只保留命中项，供后续人工审阅上游是否存在平台耦合或过时契约表述。 |
| [generateUpstreamManifest](../../../../symbols/src/arsu-converter/anchors/manifest.ts/generateUpstreamManifest.md) | 函数 | 76–112 | 复杂 | generator、manifest、audit、upstream、hashing | 2 | 从 vendor/ars 读取当前 commit，筛选受审计根下的全部文件并并行生成清单条目，Markdown 额外抽取 frontmatter 与标题树，最终组装为 researchspec.arsu.upstream-manifest.v0。 |
| normalizeContent | 函数 | 114–116 | 简单 | normalization、utility、determinism、hashing | 0 | 统一换行为 LF、裁掉尾部空白并补一个结尾换行，消除纯格式差异造成的哈希漂移。 |
| sha256Text | 函数 | 118–120 | 简单 | hashing、utility、integrity、crypto | 0 | 对 UTF-8 文本计算 SHA-256，是清单哈希与替换正文指纹共用的基础实现。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [config.ts](../config.ts.md) | src/arsu-converter/config.ts | 转换器常量事实源：固定转换器版本、vendor 输入路径与生成输出路径、必需与可选 Skill 分组、运行时目录、文本/机器资源后缀集，以及平台词与历史词过滤表。 |
| [fs-utils.ts](../fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [git.ts](../git.ts.md) | src/arsu-converter/git.ts | 只读 git 访问封装：执行 git 子命令并把成功、退出码、stdout/stderr 统一为 GitResult，同时提供按 `ls-files --stage` 解析受版本控制的普通文件列表。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [arsu-anchors.test.ts](../../../tests/arsu-anchors.test.ts.md) | tests/arsu-anchors.test.ts | anchor 资产测试：校验 contract-anchors.json 对上游 vendored 文件仍然有效、可替换 anchor 声明了当前 owner 且不含旧控制权路径，并确认上游 manifest 把来源观察与现行替换策略分离。 |
| [check.ts](check.ts.md) | src/arsu-converter/anchors/check.ts | 契约锚点资产的静态校验入口：读取 contract-anchors.json 与 upstream-manifest.json，校验锚点 ID 格式、替换正文完整性、匹配提示命中、替换边界、覆盖决策与上游清单漂移，并输出可由 CLI 直接消费的错误与告警列表。 |
| [generate.ts](generate.ts.md) | src/arsu-converter/anchors/generate.ts | 上游清单生成的可执行封装：重新扫描 vendor/ars 并把 upstream-manifest.json 写回仓库，同时支持作为脚本直接运行以刷新已提交的审计基线。 |
| [io.ts](io.ts.md) | src/arsu-converter/anchors/io.ts | 锚点资产的读取与形状校验层：加载 contract-anchors.json 与逐个替换正文，并提供区分 diagnostic 与可替换锚点的完整类型守卫链。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| extractHeadings | 函数 | 122–130 | 用行级正则抽取 Markdown 的 1-6 级标题及其层级，写入清单以支持标题结构漂移检测。 |
| [generateUpstreamManifest](../../../../symbols/src/arsu-converter/anchors/manifest.ts/generateUpstreamManifest.md) | 函数 | 76–112 | 从 vendor/ars 读取当前 commit，筛选受审计根下的全部文件并并行生成清单条目，Markdown 额外抽取 frontmatter 与标题树，最终组装为 researchspec.arsu.upstream-manifest.v0。 |
| normalizeContent | 函数 | 114–116 | 统一换行为 LF、裁掉尾部空白并补一个结尾换行，消除纯格式差异造成的哈希漂移。 |
| sha256Text | 函数 | 118–120 | 对 UTF-8 文本计算 SHA-256，是清单哈希与替换正文指纹共用的基础实现。 |
