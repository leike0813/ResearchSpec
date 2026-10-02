
# currentState
<!-- node: function:scripts/scientific-agent-skills-maintenance.mjs:currentState -->

汇总上游、vendor bundle、extension registry、审阅工件与维护文件指纹，构成锚点 manifest 的完整状态快照。
类型：函数  
复杂度：复杂  
入边数：1  
标签：integrity、hash、scientific-agent-skills  
所属文件：[scripts/scientific-agent-skills-maintenance.mjs](../../../files/scripts/scientific-agent-skills-maintenance.mjs.md)
源码：[scripts/scientific-agent-skills-maintenance.mjs:251](../../../../../scripts/scientific-agent-skills-maintenance.mjs#L251)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [scientific-agent-skills-maintenance.mjs](../../../files/scripts/scientific-agent-skills-maintenance.mjs.md) | scripts/scientific-agent-skills-maintenance.mjs:— | Scientific Agent Skills 扩展维护 CLI：按 v2.70.0 锚点盘点上游与 vendor bundle，校验每个 extension package 的 manifest 哈希、执行类型、验证器与 knowledge refs，并重算 registry 子集、package 树与 profile 树哈希。 |

## 调用

该符号没有记录对外调用。
