
# buildProfile
<!-- node: function:src/arsu-converter/contracts.ts:buildProfile -->

为单个 Skill 分组生成契约画像：列出必备契约文件、handoff 读取范围、允许写入的产物类型、变更权限归属与分组专属备注（学术论文额外允许 revision patch 产物）。
类型：函数  
复杂度：复杂  
入边数：1  
标签：contract-injection、data-model、policy、generation  
所属文件：[src/arsu-converter/contracts.ts](../../../../files/src/arsu-converter/contracts.ts.md)
源码：[src/arsu-converter/contracts.ts:85](../../../../../../src/arsu-converter/contracts.ts#L85)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [buildContractIntegrationManifest](../../../../files/src/arsu-converter/contracts.ts.md) | src/arsu-converter/contracts.ts:44–58 | 构建写入生成产物的 researchspec-contracts.json：记录集成 profile、来源与输出路径、锚点替换 profile 与标记格式，并为每个 Skill 分组生成契约画像。 |

## 调用

该符号没有记录对外调用。
