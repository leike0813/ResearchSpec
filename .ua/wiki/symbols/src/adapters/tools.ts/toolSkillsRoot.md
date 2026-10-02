
# toolSkillsRoot
<!-- node: function:src/adapters/tools.ts:toolSkillsRoot -->

返回宿主项目级 Skill 根的绝对路径与清单用 POSIX 相对根。
类型：函数  
复杂度：简单  
入边数：2  
标签：path-resolution、host-adapter、utility、skills-root  
所属文件：[src/adapters/tools.ts](../../../../files/src/adapters/tools.ts.md)
源码：[src/adapters/tools.ts:202](../../../../../../src/adapters/tools.ts#L202)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [planLegacyToolReconciliation](../legacy-reconciliation.ts/planLegacyToolReconciliation.md) | src/adapters/legacy-reconciliation.ts:18–131 | 规划旧 Skill 树、过时命令包装与 Codex 全局 prompt 的清理，删除前逐一校验路径边界与内容一致性。 |
| [resolveAgentTarget](../../../../files/src/adapters/managed-target.ts.md) | src/adapters/managed-target.ts:77–135 | 校验宿主工具与来源类型的组合，按 project-entry、command、shared-skill-target、custom-agent 与 Skill 命名空间分别推导目标。 |

## 调用

该符号没有记录对外调用。
