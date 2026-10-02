
# normalizeManifest
<!-- node: function:src/arsu-converter/manifest.ts:normalizeManifest -->

抹平 manifest 中的非确定性成分（生成时间、dirty 标记）并对文件、风险、校验、锚点与运行时策略的各层数组排序，供幂等性比较使用。
类型：函数  
复杂度：复杂  
入边数：1  
标签：determinism、normalization、idempotency、manifest  
所属文件：[src/arsu-converter/manifest.ts](../../../../files/src/arsu-converter/manifest.ts.md)
源码：[src/arsu-converter/manifest.ts:321](../../../../../../src/arsu-converter/manifest.ts#L321)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [checkIdempotence](../../../../files/src/arsu-converter/idempotence.ts.md) | src/arsu-converter/idempotence.ts:40–65 | 先校验现有产物，再在系统临时目录以同一 regenerate 回调重新生成一次，比较两侧归一化 manifest 的 JSON 字符串，失败时给出具体漂移文件列表。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [canonicalizeObject](../../../../files/src/arsu-converter/manifest.ts.md) | src/arsu-converter/manifest.ts:367–376 | 递归排序对象键、剔除 undefined 值并逐层处理数组，把任意结构投影为可稳定比较的规范形式。 |
