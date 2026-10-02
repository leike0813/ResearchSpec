
# src/arsu-converter/anchors/generate.ts
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: file:src/arsu-converter/anchors/generate.ts -->

上游清单生成的可执行封装：重新扫描 vendor/ars 并把 upstream-manifest.json 写回仓库，同时支持作为脚本直接运行以刷新已提交的审计基线。
源码：[src/arsu-converter/anchors/generate.ts](../../../../../../src/arsu-converter/anchors/generate.ts)

## 符号（1）
<!-- node: function:src/arsu-converter/anchors/generate.ts:writeUpstreamManifest -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| writeUpstreamManifest | 函数 | 6–9 | 简单 | generator、manifest、io、maintenance | 0 | 生成上游清单并以 JSON 格式写入 UPSTREAM_MANIFEST_PATH，是维护者在上游升级后刷新锚点审计基线的唯一入口。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [fs-utils.ts](../fs-utils.ts.md) | src/arsu-converter/fs-utils.ts | 转换器共用的文件系统封装：存在性判断、递归文件列举、UTF-8 读写、JSON 写入、目录树删除与流式 SHA-256 哈希，把 Node fs 调用的错误语义收敛到一处。 |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| writeUpstreamManifest | 函数 | 6–9 | 生成上游清单并以 JSON 格式写入 UPSTREAM_MANIFEST_PATH，是维护者在上游升级后刷新锚点审计基线的唯一入口。 |
