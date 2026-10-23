# Proposal

## Why

交互审阅目前依赖浏览器下载，不支持下载的嵌入式浏览器无法交回结果。取消正文选区后，批注工具还会残留，容易误用旧选区。

## What Changes

- 两套现行页面通过任务本地接收服务把完整结果保存到固定路径，并保留每次提交历史；独立保留备用下载。
- Agent 可选等待新结果，再按现有快照、来源和语义依赖规则检查；接收服务没有语义或工作流写入权。
- 保持原结果契约、冻结审阅内容和旧 v1 恢复路径；取消选区及时清除批注工具。
- 更新安装包入口、生产指令、使用模型、生成资产和维护记录。

## Capabilities

### New Capabilities

- `review-result-file-handoff`: 本地审阅会话、可信结果接收、固定文件与完整历史、可选等待。

### Modified Capabilities

- `interactive-manuscript-review-workspace`: 默认本地提交、备用下载和取消选区的工具生命周期。
- `revision-master-review-workspace`: 同样的交接方式和选区生命周期，保留任务本地与语义接收边界。
- `cli-interface`: 审阅指令说明会话准备和接收，指令生成本身仍只读。

## Impact

涉及 review-workspace 模块和两套生产 HTML、Navigate/Procedure 指令、文档、浏览器与 Node 测试，以及既有 authoring 生成的 capability 包和维护锚点。使用 Node 标准库，无新依赖或公开顶层命令。
