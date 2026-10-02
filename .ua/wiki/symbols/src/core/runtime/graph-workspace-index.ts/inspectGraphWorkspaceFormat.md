
# inspectGraphWorkspaceFormat
<!-- node: function:src/core/runtime/graph-workspace-index.ts:inspectGraphWorkspaceFormat -->

只读检查 config.yaml 是否存在、为常规文件且符合 schema 2，返回 current 与原因。
类型：函数  
复杂度：简单  
入边数：4  
标签：inspection、workspace、read-only、format-check  
所属文件：[src/core/runtime/graph-workspace-index.ts](../../../../../files/src/core/runtime/graph-workspace-index.ts.md)
源码：[src/core/runtime/graph-workspace-index.ts:105](../../../../../../../src/core/runtime/graph-workspace-index.ts#L105)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [handleGraphInit](../../../../../files/src/cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts:100–119 | init 命令处理器：新建 schema 2 工作区并写入初始稳定 spec，或对既有当前工作区转入重配置。 |
| [scanGraphProfiles](scanGraphProfiles.md) | src/core/runtime/graph-workspace-index.ts:199–231 | 扫描 profiles 目录中的 YAML profile，检测重复 profile_id 并在无有效 profile 时报错。 |
| [resolveWorkspace](../../../../../files/src/core/workspace/discover.ts.md) | src/core/workspace/discover.ts:12–35 | 优先使用显式工作区，否则逐级向上寻找 researchspec 目录并按格式返回 found/unsupported。 |
| [resolveGraphWorkspace](../../../../../files/src/core/workspace/graph-discover.ts.md) | src/core/workspace/graph-discover.ts:12–35 | 图工作区解析：显式路径或逐级向上查找，区分 missing/invalid/unsupported 三种非成功态。 |

## 调用

该符号没有记录对外调用。
