
# website/docs/faq.md
所属分层：[文档与文档站层](../../../layers/documentation.md)  
所属目录：[website/docs](../../../modules/website/docs.md)
<!-- node: document:website/docs/faq.md -->

常见问题：七条问答澄清 `init` 不启动研究、论文与报告存放于 `researchspec/` 之外的项目路径、可直接编辑的稳定 spec/变更/handoff 与必须走 CLI 的 run/node 变更、Gate 确认不等于推进（需 `advance`）、用 `status --json` 恢复、旧工作区只报告不修改、doctor 只读不自愈。
源码：[website/docs/faq.md](../../../../../website/docs/faq.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [advance.mdx](cli/advance.mdx.md) | website/docs/cli/advance.mdx | `researchspec advance <node-selector>` 的命令参考页（控制面组，需要工作区，写）：校验并完成一个符合条件的图节点：按 --input 提交输出角色，独立于 Gate 确认推进进度，并联动写入祖先完成状态。 页面给出选项表、输入字段形状与相关命令链接。 |
| [cli/status.mdx](cli/status.mdx.md) | website/docs/cli/status.mdx | researchspec status 的站点文档：说明它读取最近的当前工作区并返回有界快照，属于控制面只读命令。 |
| [decide.mdx](cli/decide.mdx.md) | website/docs/cli/decide.mdx | `researchspec decide <selector>` 的命令参考页（治理组，需要工作区，写）：记录一次人工决定：项目变更结论（accept/reject/defer/supersede）、Gate 裁决（pass/pass_with_conditions/fail）、失败 Gate 的 --override，或本地 Decision 分支选择；选项组不可混用。 页面给出选项表、输入字段形状与相关命令链接。 |
| [installation.md](installation.md.md) | website/docs/installation.md | 安装指南：要求 Node.js >= 22，给出 pnpm/npm 全局安装与版本校验，解释以 `researchspec/` 为根的工作区约定与 `init` 的行为（拒绝非空目标）、工具选择矩阵（`--tools all/none/具体 ID`、`--delivery`、`--literature-adapters`）、Zotero Adapter 的 Zotero-Agents 前置条件、更新与卸载流程，并指向 doctor/check 排障。 |
