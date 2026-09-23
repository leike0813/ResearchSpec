# 交互式论文审阅工作台

paper-humanizer 或 review-response 的当前 `instructions --json` 含有 `review_workspace` 时，Agent 可以生成一个 `review-workspace.v1` JSON，并打开相应 capability package 中的 `review-workspace/index.html`。也可以继续在对话中审阅；浏览器不是流程前提。

页面采用三栏布局：左侧是待处理问题，中间同时显示证据、建议和手稿上下文，右侧记录采用、不采用、需调整、暂缓及补充说明。草稿只保存在当前浏览器，并绑定工作区 ID 和手稿 SHA-256。点击“导出审阅结果”后会下载 `review-workspace-result.v1` JSON。

导出的结果还不是正式操作。把它交回 Agent 后，Agent 会：

1. 校验工作区和手稿 hash，发现过期时保留意见并要求显式重建或 rebase；
2. 将意见写回原流程的普通工作材料，例如 Annotation Set interpretation、humanizer plan 或 revision-master SQLite；
3. 重新读取当前 selector 的 `instructions --json`；
4. 单独询问 Gate verdict 或 Decision choice，再调用现有 `decide` / `advance`。

工作台不会直接改手稿、数据库、handoff 或 `researchspec/`。Markdown/QMD 的预览不执行原始 HTML；LaTeX 只显示入口源文件，不执行编译，也不加载远程内容。
