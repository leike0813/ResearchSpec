# Obsidian 阅读成果投影

在已配置的 Obsidian 中打开用户选择的库，把库路径作为 `--vault` 参数传入。
`PATENT_READER_OBSIDIAN_VAULT` 可以提供明确的默认路径，显式参数优先。

先说明允许写入的范围，包括阅读笔记、附件、Canvas、Bases、术语索引及库内样式和相关配置，
获得当前任务授权后再运行写入工具。
`python tools/vault/check_obsidian_env.py --vault <库路径> --json` 只报告指定路径。
阅读成果可保存在普通输出目录中，再通过当前 Procedure 的材料契约投影。

笔记、索引和 Bases 位于 `Research/Patents/`；单篇及关联 Canvas 用于浏览对应关系。
样式片段、Bases 核心插件设置及图谱配色可能涉及 `.obsidian/`，须纳入选定写入范围。
投影后在 Obsidian 中检查实际文件、附图链接和 Canvas/Bases 是否可打开。

社区插件由用户在 Obsidian 中按需选择；现有 Markdown、原生 Canvas 和 Bases 仍可独立使用。
缺少库或用户未选择投影时，直接交付项目内阅读成果，不将其记录成已完成的库内交付。
