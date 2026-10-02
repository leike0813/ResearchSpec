
# managedSkillId
<!-- node: function:src/adapters/installations.ts:managedSkillId -->

从不同来源类型的安装记录中提取其托管的 Skill 或 capability ID。
类型：函数  
复杂度：简单  
入边数：2  
标签：utility、manifest、accessor、skill-id  
所属文件：[src/adapters/installations.ts](../../../../files/src/adapters/installations.ts.md)
源码：[src/adapters/installations.ts:201](../../../../../../src/adapters/installations.ts#L201)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [deduplicateInstallations](../../../../files/src/adapters/installations.ts.md) | src/adapters/installations.ts:196–199 | 按 scope+path 去重安装记录，并按 tool_id 与路径稳定排序以保证清单可复现。 |
| [reconcileAgentToolInstallations](reconcileAgentToolInstallations.md) | src/adapters/installations.ts:229–318 | 对账既有与期望安装：删除清单拥有且字节未变的过期文件，保留用户改动、共享全局文件与插件 profile 记录。 |

## 调用

该符号没有记录对外调用。
