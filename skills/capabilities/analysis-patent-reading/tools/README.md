# 专利阅读工具

工具从当前能力包目录以 `python tools/<路径>` 调用，参数以激活后的 Procedure 和 `--help` 为准。

- `extract/` 获取用户授权来源的全文，提取文字、附图和外观设计视图。
- `analyze/` 核对权要树、特征、公开线索和阅读笔记，生成上下文锚点与 Mermaid。
- `crawl/` 提供公布公告站的著录和视图获取。
- `vault/` 将已确认的阅读成果投影到明确选择的 Obsidian 库。
- `shared/` 包含索引、渲染、图谱与库内配置支持代码。

全文、观察、解释和推测分别记录，保留公开号、来源路径和对应证据位置。
阅读输出保存在普通项目目录；Obsidian 投影是可选交付。
通过 `vault/check_obsidian_env.py --vault <路径> --json` 检查指定库，
再按 Procedure 的材料契约调用 `vault/write_patent_obsidian_note.py --vault <路径>`。
选择库与允许写入的笔记、Canvas、Bases、样式和相关配置时说明范围。

使用宿主已配置的 Python、PDF 和浏览器依赖。缺失依赖记录为未完成；分发和检查不安装依赖。
