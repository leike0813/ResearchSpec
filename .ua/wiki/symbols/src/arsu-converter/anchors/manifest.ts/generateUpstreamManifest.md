
# generateUpstreamManifest
<!-- node: function:src/arsu-converter/anchors/manifest.ts:generateUpstreamManifest -->

从 vendor/ars 读取当前 commit，筛选受审计根下的全部文件并并行生成清单条目，Markdown 额外抽取 frontmatter 与标题树，最终组装为 researchspec.arsu.upstream-manifest.v0。
类型：函数  
复杂度：复杂  
入边数：2  
标签：generator、manifest、audit、upstream、hashing  
所属文件：[src/arsu-converter/anchors/manifest.ts](../../../../../files/src/arsu-converter/anchors/manifest.ts.md)
源码：[src/arsu-converter/anchors/manifest.ts:76](../../../../../../../src/arsu-converter/anchors/manifest.ts#L76)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [validateManifest](../../../../../files/src/arsu-converter/anchors/check.ts.md) | src/arsu-converter/anchors/check.ts:157–177 | 重新生成当前上游清单并与已提交的清单比对：校验 commit、文件树顺序以及逐文件的归一化哈希、frontmatter 与标题树，防止 vendor/ars 升级后锚点数据悄悄过期。 |
| [writeUpstreamManifest](../../../../../files/src/arsu-converter/anchors/generate.ts.md) | src/arsu-converter/anchors/generate.ts:6–9 | 生成上游清单并以 JSON 格式写入 UPSTREAM_MANIFEST_PATH，是维护者在上游升级后刷新锚点审计基线的唯一入口。 |

## 调用

该符号没有记录对外调用。
