# 用户文档

第一次接触项目，先读[用户使用模型](usage-model.md)：从研究目标出发，调用适用能力、交付成果，
再用普通任务笔记保存持续工作的必要进展。需要正式流程控制时，再看 profile entry、graph 授权、
frontier、Gate、Decision、handoff 和完成条件。

- [CLI handbook](cli-handbook.md)：从 typed catalog 生成的完整命令参数；
- [Procedure 发现](procedure-discovery.md)：自然语言检索、本地语义发现、缓存和离线回退；
- [Agent 项目入口矩阵](agent-entry-matrix.md)：各宿主的规则文件、发现回退与验证边界；
- [交互式论文审阅工作台](review-workspace.md)：本地批注、修订意见和正式确认之间的边界；
- [Zotero 文献系统 Adapter](literature-adapters.md)：可选文献能力及安全边界。

遇到具体 workspace 时，以 `status --json` 和 `instructions <selector> --json` 返回的当前动作
合同为准。
