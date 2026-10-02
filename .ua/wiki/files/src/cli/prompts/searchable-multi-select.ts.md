
# src/cli/prompts/searchable-multi-select.ts
所属分层：[CLI 命令入口层](../../../../layers/cli.md)  
所属目录：[src/cli/prompts](../../../../modules/src/cli/prompts.md)
<!-- node: file:src/cli/prompts/searchable-multi-select.ts -->

基于 @inquirer/core 的可搜索多选交互提示，支持方向键、空格切换、回车确认与 Ctrl+C 取消，并标注 configured / detected 状态。
源码：[src/cli/prompts/searchable-multi-select.ts](../../../../../../src/cli/prompts/searchable-multi-select.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [graph-bootstrap.ts](../handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
