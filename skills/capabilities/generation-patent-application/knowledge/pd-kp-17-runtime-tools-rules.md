<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-17 runtime-tools-rules
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/SKILL.md（工具归属与环境约定）
    - vendor/patent-disclosure-skill/INSTALL.md（依赖）
    - vendor/patent-disclosure-skill/requirements.txt
说明: 只保留工具归属、配置依赖与机读前缀；去掉安装命令与自动执行授权。
-->

# 运行工具与配置依赖 (Runtime tools and configured dependencies)

## 只用本包 Tools 里列出的命令

每份 SKILL.md 的 `## Tools` 段落就是本包的可执行面。只有在那里出现、或本阶段过程
里明确给出参数的工具才可执行。上游仓库路径、别的包的同名脚本、以及任何没在本包
Tools 里出现的脚本名，都不是可用工具。

命令的参数以工具自己的 argparse 为准。写命令前先按 `--help` 或源码核对参数名，
不要凭印象拼。

## 配置依赖

- Python 3.9+。Word（python-docx）、PDF（pymupdf / pypdf）、图渲染（Mermaid
  CLI、浏览器）、CNIPA 检索（Playwright）按需配置；本包索引工具
  `tools/patent_files.py` 与黄金案例工具 `tools/oa_history.py` 只用标准库。
- 解释器、模型、服务、Obsidian 浏览器都由用户配置。ResearchSpec 的转换、安装与
  静态检查从不执行工具、不安装依赖、不读取凭据。
- 缺依赖时保留可用草稿，报告不可用，不声称已渲染或已执行。

## 静态命令边界

`status`、`check`、转换、打包都不执行本包工具，也不访问外部服务。只有在目标
Agent 里显式调用（例如 `advance` 运行声明的校验器）时才执行。

## 机读前缀

各业务脚本输出稳定前缀（`EPUB_SEARCH_MD:`、`CHART_XLSX:`、`MAP_URL:`、
`OA_HISTORY_INGEST:`、`OA_HISTORY_SEARCH:`、`OA_HISTORY_SCORE:`、
`INTAKE_OK:`、`APPLICATION_SUPPORT:` 等）。解析以这些前缀为准，终端红字或
编码乱码不当作失败。
