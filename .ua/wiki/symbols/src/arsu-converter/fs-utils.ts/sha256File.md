
# sha256File
<!-- node: function:src/arsu-converter/fs-utils.ts:sha256File -->

以流式读取方式计算文件 SHA-256，是清单记录与漂移检测的通用指纹实现。
类型：函数  
复杂度：中等  
入边数：2  
标签：hashing、filesystem、utility、integrity  
所属文件：[src/arsu-converter/fs-utils.ts](../../../../files/src/arsu-converter/fs-utils.ts.md)
源码：[src/arsu-converter/fs-utils.ts:64](../../../../../../src/arsu-converter/fs-utils.ts#L64)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [checkExistingOutputClean](../../../../files/src/arsu-converter/idempotence.ts.md) | src/arsu-converter/idempotence.ts:10–38 | 读取既有输出的 conversion-manifest.json 并逐文件校验哈希，列出漂移路径；manifest 缺失或损坏时也返回结构化失败而不是抛错，让调用方决定是否 --force。 |
| [emitArsuSkillLicensing](../../../../files/src/arsu-converter/licensing.ts.md) | src/arsu-converter/licensing.ts:9–40 | 确认上游 LICENSE 包含约定的署名与非商业许可标识后写入分组 LICENSE 与 NOTICE.md，并返回两条带来源标注与哈希的 CopiedFile 记录。 |

## 调用

该符号没有记录对外调用。
