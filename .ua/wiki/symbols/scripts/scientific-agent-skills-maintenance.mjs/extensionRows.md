
# extensionRows
<!-- node: function:scripts/scientific-agent-skills-maintenance.mjs:extensionRows -->

逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。
类型：函数  
复杂度：复杂  
入边数：1  
标签：integrity、hash、scientific-agent-skills  
所属文件：[scripts/scientific-agent-skills-maintenance.mjs](../../../files/scripts/scientific-agent-skills-maintenance.mjs.md)
源码：[scripts/scientific-agent-skills-maintenance.mjs:94](../../../../../scripts/scientific-agent-skills-maintenance.mjs#L94)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [scientific-agent-skills-maintenance.mjs](../../../files/scripts/scientific-agent-skills-maintenance.mjs.md) | scripts/scientific-agent-skills-maintenance.mjs:— | Scientific Agent Skills 扩展维护 CLI：按 v2.70.0 锚点盘点上游与 vendor bundle，校验每个 extension package 的 manifest 哈希、执行类型、验证器与 knowledge refs，并重算 registry 子集、package 树与 profile 树哈希。 |

## 调用

该符号没有记录对外调用。
