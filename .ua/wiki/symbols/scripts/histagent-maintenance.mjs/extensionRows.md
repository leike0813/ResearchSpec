
# extensionRows
<!-- node: function:scripts/histagent-maintenance.mjs:extensionRows -->

逐条核对 extension package：registry 清单哈希、执行类型、文件树、脚本验证器存在性与 {outputs_json} 传参、必需 brief 字段绑定、工具文件字节一致，并校验领域 capability/profile 分配未漂移。
类型：函数  
复杂度：复杂  
入边数：1  
标签：integrity、hash、histagent  
所属文件：[scripts/histagent-maintenance.mjs](../../../files/scripts/histagent-maintenance.mjs.md)
源码：[scripts/histagent-maintenance.mjs:95](../../../../../scripts/histagent-maintenance.mjs#L95)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [histagent-maintenance.mjs](../../../files/scripts/histagent-maintenance.mjs.md) | scripts/histagent-maintenance.mjs:— | HistAgent 扩展维护 CLI：锁定 snapshot-47bbe21 修订，核对三个自包含 executable Skill 的 bundle 树哈希、extension package、脚本副本与领域分配。 |

## 调用

该符号没有记录对外调用。
