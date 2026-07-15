# HistAgent `snapshot-47bbe21` 能力审计报告

## 一、审阅结论

本报告是面向维护者的仓库审计，不代表生产准入。审计将 `https://github.com/CharlesQ9/HistAgent` 固定到无 tag 的提交 `47bbe21dc81618489f5d5929358032883a3fe448`，并冻结未来 `ingest-histagent` 的设计边界。本 change 没有创建 converter、生成后的 Skill、Plugin vendor、domain membership、package command、provider 集成或运行时依赖。

固定树包含 120 个普通 tracked files，总计 3,632,711 字节，上游不存在 `SKILL.md`。文件清单按 Git 路径顺序排列，每一行规范化为：

```text
<小写 sha256><两个 ASCII 空格><POSIX 路径>\n
```

120 行拼接后的 SHA-256 为 `04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02`。

### 处置结论图例

| 机器值 | 中文含义 | 审阅解释 |
| --- | --- | --- |
| `retain` | 保留 | 内容及形式可作为后续工作的直接证据，但仍受许可与安全约束 |
| `adapt` | 适配吸纳 | 保留能力，按 ResearchSpec 契约和 provider-neutral 方向改造 |
| `replace` | 等价重构 | 不复制当前实现，只保留经证实的能力语义并重新实现 |
| `exclude` | 排除 | 不进入未来生产生成输入 |
| `confirmed-failure` | 已确认失败 | 已确认存在不可接受内容，只保留安全元数据和失败结论 |

## 二、机器审计摘要

| 项目 | 值 |
| --- | --- |
| Schema 版本 | `1` |
| 源 ID | `histagent` |
| 源名称 | `HistAgent` |
| 仓库 | `https://github.com/CharlesQ9/HistAgent` |
| 快照 | `snapshot-47bbe21` |
| 完整 revision | `47bbe21dc81618489f5d5929358032883a3fe448` |
| 根许可结论 | `Apache-2.0 with per-origin review` |
| 许可证据 | `LICENSE` |
| tracked entries | `120` |
| 文件总字节数 | `3,632,711` |
| 上游 Skill 数 | `0` |
| 内容来源数 | `5` |
| 许可声明数 | `4` |
| 运行权限数 | `10` |
| 外部资源数 | `16` |
| 安全发现数 | `10` |
| 知识面数 | `31` |
| 候选 Skill 数 | `3` |
| 完整清单 SHA-256 | `04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02` |

源文件处置统计：

| 处置 | 数量 |
| --- | ---: |
| `retain`（保留） | 6 |
| `adapt`（适配吸纳） | 16 |
| `replace`（等价重构） | 3 |
| `exclude`（排除） | 94 |
| `confirmed-failure`（已确认失败） | 1 |

## 三、审计政策

| 政策 | 机器值 | 人类可读结论 |
| --- | --- | --- |
| `audit_is_admission` | 否 | 本审计不是生产准入。 |
| `future_change` | `ingest-histagent` | 生产吸纳只能由该独立 change 承担。 |
| `source_has_upstream_skills` | 否 | 上游没有现成 Skill。 |
| `generated_production_skills` | 否 | 本 change 不生成生产 Skill。 |
| `converter_executes_upstream_content` | 否 | converter 不执行上游内容。 |
| `parallel_ingest_preparation_allowed` | 是 | 允许并行准备未来 ingest 工作。 |
| `production_requires_audit_validation` | 是 | 生产前必须先通过本审计验证。 |
| `production_requires_hash_bound_human_review` | 是 | 生产前必须对完整生成树做 hash-bound 人工审阅。 |
| `benchmark_content_admitted` | 否 | 基准数据与 runner 不准入。 |
| `tool_domain_membership` | 否 | HistAgent 不加入工具域。 |
| `explicit_invocation_authorizes_configured_providers_and_task_materials` | 是 | 显式调用授权使用已配置 provider 和任务材料。 |
| `access_control_owned_by_host` | 是 | 实际访问控制由目标 Agent/宿主负责。 |
| `culture_specific_policy_added` | 否 | 不新增 HistAgent 专属文化敏感材料规则。 |
| `allowed_domains` | `heritage-archive-and-museum-studies`<br>`historical-studies` | 只允许两个预期 discipline domain。 |
| `anzsrc_field_creates_membership` | 否 | ANZSRC Field 只作审计元数据，不自动产生 membership。 |

## 四、内容来源与许可

### 4.1 内容来源

| 来源 ID | 类型 | 代表性范围 | 许可状态 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- |
| `browser-use-unclear` | 来源未明确的导入 | `browser_use/README.md`<br>`browser_use/agent/service.py` | 不明确；`无` | 排除 | 随仓库提供的 `browser_use` 目录没有本地许可文件，也没有可复核的不可变上游来源，因此不能进入生产吸纳。 |
| `compiled-bytecode` | 编译产物 | `scripts/__pycache__/cookies.cpython-312.pyc` | 禁止使用；`无` | 排除 | 被 Git 跟踪的 Python 字节码不是源代码，永远不能作为吸纳输入。 |
| `histagent-root` | 上游根内容 | `LICENSE`<br>`README.md`<br>`run_hist.py` | 已确认；`Apache-2.0` | 适配吸纳 | HistAgent 自有能力证据原则上受仓库 Apache-2.0 声明约束，但仍服从逐文件来源例外。 |
| `microsoft-autogen` | 有署名借用 | `scripts/agent_web_browser.py`<br>`scripts/image_web_browser.py`<br>`scripts/mdconvert.py`<br>`scripts/reformulator.py`<br>`scripts/text_web_browser.py` | 不明确；`MIT source claim requires verification` | 等价重构 | 五个文件明确声明来自 Microsoft AutoGen 或 Magentic-One；未来吸纳必须逐一核实精确 MIT 来源并保留 notice，否则进行功能等价重构。 |
| `unverified-figures` | 来源未核实的媒体 | `Figures/Figure_1.png`<br>`Figures/histagent_arch.png` | 不明确；`无` | 排除 | 图片缺少足以支持生产复制的、与源文件绑定的作者身份或再分发证据。 |

### 4.2 许可声明

| 声明 ID | 表达式 | 状态 | 范围 | 证据 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `autogen-derived-mit` | `MIT` | 需核实原始来源 | `scripts/agent_web_browser.py`<br>`scripts/image_web_browser.py`<br>`scripts/mdconvert.py`<br>`scripts/reformulator.py`<br>`scripts/text_web_browser.py` | 同左五个源文件的署名注释 | 等价重构 | 复制前必须逐文件核实精确上游修订、路径、散列及 notice；若无法核实，则采用功能等价重构。 |
| `browser-use-missing` | `无` | 缺失 | `browser_use/README.md`<br>`browser_use/agent/service.py` | `browser_use/README.md` | 排除 | 没有本地许可或固定来源授权生产复用随仓库提供的 `browser_use` 实现。 |
| `figure-provenance-unverified` | `无` | 未核实 | `Figures/Figure_1.png`<br>`Figures/histagent_arch.png` | `README.md` | 排除 | 仅有仓库级许可，不足以证明复制或外部制作图片的权利来源。 |
| `root-apache-2-0` | `Apache-2.0` | 已确认 | `LICENSE`<br>`README.md`<br>`run_hist.py` | `LICENSE`<br>`README.md` | 保留 | 根仓库声明 HistAgent 自有内容采用 Apache-2.0。 |

根仓库许可与逐文件来源是两个不同维度：Apache-2.0 根声明不能自动解决不同来源或未知来源内容的许可问题。

## 五、运行权限

| 权限 ID | 类型 | 显式调用授权 | 宿主策略控制 | 证据 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `benchmark-execution` | 基准执行 | 否 | 是 | `run_hist.py`<br>`run_gaia.py`<br>`run_hlejson.py` | 排除 | HistBench、GAIA 和 HLE runner 仅作为审计证据。 |
| `browser-control` | 浏览器控制 | 是 | 是 | `scripts/agent_web_browser.py`<br>`browser_use/browser/browser.py` | 等价重构 | 只能由目标 Agent 在宿主访问策略下提供浏览器控制。 |
| `credential-access` | 凭据访问 | 是 | 是 | `README.md`<br>`run_hist.py` | 等价重构 | Skill 可以使用已经配置的提供商凭据，但不得嵌入、暴露或持久化凭据。 |
| `dependency-installation` | 依赖安装 | 否 | 是 | `README.md`<br>`requirements.txt` | 排除 | ResearchSpec 的转换、打包、安装和发现流程绝不安装上游依赖。 |
| `external-request` | 外部请求 | 是 | 是 | `scripts/web_tools.py`<br>`scripts/transkribus_ocr.py` | 适配吸纳 | 显式调用 Skill 后，可在宿主策略约束下使用用户批准的服务发出任务所需请求。 |
| `filesystem-read` | 文件读取 | 是 | 是 | `scripts/file_processing.py`<br>`scripts/mdconvert.py` | 适配吸纳 | 显式调用允许读取由用户或宿主选定的任务材料。 |
| `filesystem-write` | 文件写入 | 是 | 是 | `scripts/frame_extract.py`<br>`scripts/transkribus_ocr.py` | 适配吸纳 | 派生文件必须作为带有 provenance、受宿主管理的工件。 |
| `provider-inference` | 模型/提供商推理 | 是 | 是 | `run_hist.py`<br>`scripts/visual_qa.py` | 等价重构 | 固定提供商调用必须改为 provider-neutral，并使用目标 Agent 的配置。 |
| `subprocess-execution` | 子进程执行 | 是 | 是 | `run_hist.py`<br>`scripts/mdconvert.py` | 等价重构 | 音频、视频和格式转换命令必须在宿主明确批准的执行环境中运行。 |
| `telemetry` | 遥测 | 否 | 是 | `browser_use/telemetry/service.py` | 排除 | 不得保留遥测实现或默认开启的采集行为。 |

显式调用未来 Skill 只表示用户授权其使用已配置 provider 与任务材料；浏览器、网络、文件系统、模型、上传和命令执行仍由目标 Agent 与宿主策略控制。

## 六、外部资源

| 资源 ID | 类型 | 数据流 | 证据 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- |
| `gaia-dataset` | 数据集 | 下载 | `run_gaia.py` | 排除 | GAIA 数据和 runner 行为仅用于评测。 |
| `google-books` | 搜索服务 | 请求—响应 | `scripts/web_tools.py` | 适配吸纳 | 通过宿主批准的 Web 或提供商工具保留图书搜索，并要求引用。 |
| `google-lens` | 搜索服务 | 上传 | `scripts/reverse_image.py` | 适配吸纳 | 反向图片搜索要求显式授权使用任务材料，并保留图像 provenance。 |
| `google-scholar` | 搜索服务 | 请求—响应 | `scripts/web_tools.py` | 适配吸纳 | 保留学术搜索能力，但不得绑定固定提供商凭据。 |
| `histbench-dataset` | 数据集 | 下载 | `README.md`<br>`dataset_loader.py` | 排除 | HistBench 数据集和评测 runner 不是吸纳输入。 |
| `hle-dataset` | 数据集 | 下载 | `run_hlejson.py` | 排除 | HLE 数据集和裁判面仅用于审计。 |
| `huggingface-models` | 模型 | 下载 | `scripts/ocr.py`<br>`requirements.txt` | 适配吸纳 | OCR 模型选择必须 provider-neutral，并由宿主批准。 |
| `imgbb` | 媒体服务 | 上传 | `scripts/transkribus_ocr.py` | 等价重构 | 未来实现不得强制依赖第三方图片托管，并必须保留上传 provenance。 |
| `internet-archive` | 网站 | 请求—响应 | `scripts/text_web_browser.py` | 适配吸纳 | 档案检索继续受引用要求和宿主策略约束。 |
| `llamaparse` | 服务提供商 | 上传 | `scripts/web_tools.py` | 等价重构 | 文档解析必须使用目标 Agent 配置，并明确披露远程上传。 |
| `local-translation-service` | 本地服务 | 仅本地 | `scripts/translator.py` | 适配吸纳 | 本地翻译保持可选，并由宿主配置。 |
| `openai-provider` | 服务提供商 | 请求—响应 | `run_hist.py`<br>`scripts/visual_qa.py` | 等价重构 | 固定 OpenAI 绑定应改为由目标 Agent 提供的 provider-neutral 推理。 |
| `serpapi` | 搜索服务 | 请求—响应 | `scripts/text_web_browser.py` | 适配吸纳 | 精确检索可使用用户配置的提供商，但不得嵌入凭据。 |
| `springer-api` | 搜索服务 | 请求—响应 | `scripts/web_tools.py` | 适配吸纳 | Springer 检索保持可选、可配置且受引用要求约束。 |
| `transkribus` | 服务提供商 | 上传 | `scripts/transkribus_ocr.py` | 适配吸纳 | 历史 OCR 可使用已配置的 Transkribus，但必须明确授权上传材料。 |
| `youtube-media` | 媒体服务 | 请求—响应 | `scripts/mdconvert.py` | 适配吸纳 | 媒体转录访问继续受宿主策略和 provenance 约束。 |

## 七、安全发现

| 发现代码 | 严重度 | 证据 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- |
| `BROWSER-USE-ORIGIN` | 阻断 | `browser_use/README.md` | 排除 | 随仓库提供的 `browser_use` 目录缺少与源文件绑定的 provenance 和许可。 |
| `COOKIE-PAYLOAD` | 阻断 | `scripts/cookies.py` | 已确认失败 | 被跟踪的 Cookie 载荷只记录路径、Git 对象 ID、字节数和 SHA-256；任何值都不得进入审计工件。 |
| `CREDENTIAL-SURFACE` | 需复核 | `README.md`<br>`run_hist.py` | 等价重构 | 提供商凭据和 CLI 覆盖值必须由目标 Agent 配置，且不得持久化。 |
| `EXTERNAL-MATERIAL-UPLOAD` | 需复核 | `scripts/transkribus_ocr.py`<br>`scripts/web_tools.py` | 适配吸纳 | 只有在显式调用且明确披露提供商后，图片和文档才可离开宿主。 |
| `FIXED-PROVIDER-BINDING` | 需复核 | `scripts/visual_qa.py`<br>`run_hist.py` | 等价重构 | 提供商专用实现必须改造为 provider-neutral。 |
| `IMAGE-PROVENANCE` | 需复核 | `Figures/Figure_1.png`<br>`README.md` | 排除 | 未审计图片和检索所得图片不得作为可复用生产资产。 |
| `OUTPUT-LAYER-COLLAPSE` | 阻断 | `scripts/transkribus_ocr.py`<br>`scripts/translator.py` | 等价重构 | 未来输出必须区分原始观察/OCR、规范化转录、校勘、翻译和解释，禁止未标注补写。 |
| `SUBPROCESS-BOUNDARY` | 需复核 | `run_hist.py`<br>`scripts/mdconvert.py` | 等价重构 | 命令和媒体处理必须委托给宿主批准的执行环境。 |
| `TELEMETRY-DEFAULT` | 阻断 | `browser_use/telemetry/service.py` | 排除 | 遥测代码及默认采集行为必须排除。 |
| `TRACKED-BYTECODE` | 阻断 | `scripts/__pycache__/cookies.cpython-312.pyc` | 排除 | 被 Git 跟踪的 Python 编译产物必须从所有未来生成输入中排除。 |

其中 `scripts/cookies.py` 是已确认失败。报告和机器审计只保留路径、Git mode、Git object ID、字节数、SHA-256、来源引用和处置结论，不包含 Cookie 名称、域名、值、header 或载荷片段。

## 八、知识面清单

知识面是从仓库源代码中提取的能力证据，不是上游 Skill。权限与外部资源列为空时表示该知识面没有登记对应引用。

| 知识面 ID | 源路径 / symbol | 类型 / 范围 | 来源 | 权限 | 外部资源 | 处置 | 审阅建议 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agent-historical-answer-loop` | `run_hist.py`<br>`answer_single_question` | Agent 编排<br>历史研究 | `histagent-root` | `provider-inference`<br>`filesystem-read`<br>`filesystem-write` | `openai-provider` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `agent-historical-orchestration` | `run_hist.py`<br>`create_agent_hierarchy` | Agent 编排<br>历史研究 | `histagent-root` | `provider-inference` | `openai-provider` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `archival-web-navigation` | `scripts/text_web_browser.py`<br>`ArchiveSearchTool` | 档案检索<br>史料识别 | `microsoft-autogen` | `external-request` | `internet-archive` | 等价重构 | 按 HistAgent 吸纳政策等价重构该能力。 |
| `browser-agent-adapter` | `scripts/agent_web_browser.py`<br>`BrowserTool` | 浏览器运行时<br>史料识别 | `microsoft-autogen` | `browser-control`<br>`external-request` | 无 | 等价重构 | 按 HistAgent 吸纳政策等价重构该能力。 |
| `browser-automation-runtime` | `browser_use/agent/service.py`<br>`Agent` | 浏览器运行时<br>共享运行时 | `browser-use-unclear` | `browser-control` | 无 | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `browser-telemetry` | `browser_use/telemetry/service.py`<br>`ProductTelemetry` | 遥测运行时<br>共享运行时 | `browser-use-unclear` | `telemetry` | 无 | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `cookie-injection-payload` | `scripts/cookies.py`<br>`COOKIES` | 敏感载荷<br>共享运行时 | `histagent-root` | 无 | 无 | 已确认失败 | 仅保留路径、散列与失败结论。 |
| `document-conversion` | `scripts/mdconvert.py`<br>`MarkdownConverter` | 文档处理<br>史料分析 | `microsoft-autogen` | `filesystem-read`<br>`filesystem-write`<br>`subprocess-execution` | `youtube-media` | 适配吸纳 | 保留能力，但实现复用必须先完成 Magentic-One 精确来源与许可核实。 |
| `file-format-processing` | `scripts/file_processing.py`<br>`PDFTool, DOCXTool, XLSXTool, PPTXTool` | 文档处理<br>史料分析 | `histagent-root` | `filesystem-read`<br>`filesystem-write` | 无 | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `gaia-benchmark-runner` | `run_gaia.py`<br>`main` | 基准运行时<br>仅评测 | `histagent-root` | `benchmark-execution` | `gaia-dataset` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `general-ocr` | `scripts/ocr.py`<br>`OCRTool` | OCR<br>史料分析 | `histagent-root` | `filesystem-read`<br>`provider-inference` | `huggingface-models` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `histbench-dataset-loader` | `dataset_loader.py`<br>`load_custom_dataset` | 评测运行时<br>仅评测 | `histagent-root` | `benchmark-execution`<br>`filesystem-read` | `histbench-dataset` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `histbench-judgment` | `judgment.py`<br>`judge_all` | 评测运行时<br>仅评测 | `histagent-root` | `benchmark-execution`<br>`provider-inference` | `histbench-dataset`<br>`openai-provider` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `histbench-result-combination` | `combine_results.py`<br>`combine_results` | 评测运行时<br>仅评测 | `histagent-root` | `benchmark-execution`<br>`filesystem-read`<br>`filesystem-write` | `histbench-dataset` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `histbench-runner` | `run_hist.py`<br>`main` | 基准运行时<br>仅评测 | `histagent-root` | `benchmark-execution` | `histbench-dataset` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `historical-ocr` | `scripts/transkribus_ocr.py`<br>`transkribus_ocr` | OCR<br>史料分析 | `histagent-root` | `credential-access`<br>`external-request`<br>`filesystem-read`<br>`filesystem-write`<br>`provider-inference` | `imgbb`<br>`transkribus` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `hle-benchmark-runner` | `run_hlejson.py`<br>`main` | 基准运行时<br>仅评测 | `histagent-root` | `benchmark-execution` | `hle-dataset` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `image-source-browser` | `scripts/image_web_browser.py`<br>`SimpleImageBrowser` | 图像处理<br>史料识别 | `microsoft-autogen` | `external-request`<br>`filesystem-write` | 无 | 适配吸纳 | 保留能力，但不得复制 Cookie 注入；实现复用必须先完成精确来源与许可核实。 |
| `literature-retrieval-browser` | `scripts/web_tools.py`<br>`LiteratureSearchBrowser` | 文献检索<br>史料识别 | `histagent-root` | `credential-access`<br>`external-request`<br>`filesystem-read`<br>`filesystem-write`<br>`provider-inference` | `google-books`<br>`google-scholar`<br>`llamaparse`<br>`openai-provider`<br>`springer-api` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `literature-tool-suite` | `scripts/web_tools.py`<br>`create_literature_tools` | 文献检索<br>历史研究 | `histagent-root` | `external-request`<br>`provider-inference` | `google-books`<br>`google-scholar`<br>`springer-api` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `local-search-reformulation` | `scripts/LocalGoogleSearchTool.py`<br>`LocalGoogleSearchTool` | 档案检索<br>史料识别 | `histagent-root` | `external-request`<br>`provider-inference` | `serpapi` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `openai-baseline` | `openai_baseline.py`<br>`answer_single_question` | 评测运行时<br>仅评测 | `histagent-root` | `benchmark-execution`<br>`provider-inference` | `openai-provider` | 排除 | 按 HistAgent 吸纳政策排除该能力。 |
| `precise-text-browser` | `scripts/text_web_browser.py`<br>`SimpleTextBrowser` | 档案检索<br>史料识别 | `microsoft-autogen` | `external-request` | `serpapi` | 等价重构 | 按 HistAgent 吸纳政策等价重构该能力。 |
| `response-reformulation` | `scripts/reformulator.py`<br>`prepare_response` | 提示适配<br>历史研究 | `microsoft-autogen` | `provider-inference` | `openai-provider` | 等价重构 | 按 HistAgent 吸纳政策等价重构该能力。 |
| `reverse-image-identification` | `scripts/reverse_image.py`<br>`GoogleLensSearchTool` | 图像处理<br>史料识别 | `histagent-root` | `external-request`<br>`filesystem-read` | `google-lens` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `source-text-inspection` | `scripts/text_inspector_tool.py`<br>`TextInspectorTool` | 文档处理<br>史料分析 | `histagent-root` | `filesystem-read`<br>`provider-inference` | `openai-provider` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `speech-transcription` | `scripts/speech_recognition.py`<br>`SpeechRecognitionTool` | 媒体处理<br>史料分析 | `histagent-root` | `filesystem-read`<br>`provider-inference` | `huggingface-models` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `text-web-search` | `scripts/text_web_browser.py`<br>`SearchInformationTool` | 档案检索<br>史料识别 | `microsoft-autogen` | `credential-access`<br>`external-request` | `serpapi` | 等价重构 | 按 HistAgent 吸纳政策等价重构该能力。 |
| `translation` | `scripts/translator.py`<br>`TranslatorTool` | 翻译<br>史料分析 | `histagent-root` | `external-request` | `local-translation-service` | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `video-frame-extraction` | `scripts/frame_extract.py`<br>`VideoFrameExtractorTool` | 媒体处理<br>史料分析 | `histagent-root` | `filesystem-read`<br>`filesystem-write`<br>`subprocess-execution` | 无 | 适配吸纳 | 按 HistAgent 吸纳政策适配吸纳该能力。 |
| `visual-source-analysis` | `scripts/visual_qa.py`<br>`VisualQATool, visualizer` | 图像处理<br>史料分析 | `histagent-root` | `external-request`<br>`filesystem-read`<br>`provider-inference` | `openai-provider` | 等价重构 | 按 HistAgent 吸纳政策等价重构该能力。 |

## 九、三个候选 Skill

以下条目都是未来 `ingest-histagent` 的候选设计，不是当前已生成或已发布的 Skill。

### 9.1 `histagent-historical-research`（历史研究）

| 项目 | 内容 |
| --- | --- |
| 处置 | 适配吸纳 |
| 实现策略 | 完整 authored tree；baseline + script-assisted + resource-backed + stateful；轻量 JSON Gate |
| 正式入口 | `scripts/research_runtime.py` |
| 命令 | `init`、`status`、`submit-source`、`submit-layer`、`submit-evidence`、`check`、`render` |
| 状态与输出 | `state.json` 为 Skill 本地 SSOT；`status` 直接返回唯一下一动作；mutation receipt、status 与最终 artifacts 使用各自命令级结构；共享资源为 `lib/historical_support.py` |
| CLI 与失败 | 使用 `--scope-file` 及 source/layer/evidence 领域记录文件；失败以非零退出码和 stderr 错误对象返回，不使用通用 runner/schema/envelope |
| 依赖政策 | 仅 Python 3.11 标准库；禁止自动安装；Skill 树复制后仍可独立运行 |
| 来源知识面 | `agent-historical-answer-loop`<br>`agent-historical-orchestration`<br>`literature-tool-suite`<br>`response-reformulation` |
| 输出层次 | 原始观察/OCR → 规范化转录 → 校勘 → 翻译 → 解释 |
| hard dependencies | 无 |
| advisory relationships | `histagent-historical-source-identification`（advisory）<br>`histagent-historical-source-analysis`（advisory） |
| ANZSRC Fields | `430399` |
| 预期 domains | `historical-studies` |
| 内容许可 | 已确认；`Apache-2.0 with replacement of unresolved derived implementations`；证据：`LICENSE`<br>`scripts/text_web_browser.py` |
| 与现有能力的关系 | 补充 ARSU `deep-research` 的历史学专门史料处理，不取代通用深度研究工作流。 |
| 安全约束 | `host-access-control`、`human-review`、`no-embedded-credentials`、`no-unmarked-completion`、`output-layer-separation`、`provider-neutral`、`provenance-required` |
| 阻断发现 | 历史结论必须具有明确 provenance，并保持史料层次分离。 |
| 建议 | 只有在审计验证通过，且完整生成树经过 hash-bound 人工审阅后才能生成。 |

### 9.2 `histagent-historical-source-identification`（历史来源识别）

| 项目 | 内容 |
| --- | --- |
| 处置 | 适配吸纳 |
| 实现策略 | 完整 authored tree；baseline + script-assisted + resource-backed |
| 正式入口 | `scripts/identify_sources.py` |
| 命令 | `search`、`exact-text`、`literature`、`archive`、`fetch`、`reverse-image`、`verify`、`validate` |
| 状态与输出 | 普通 CLI 参数与 candidate 领域文件；命令级 receipt；共享资源为 `lib/historical_support.py` |
| CLI 与失败 | API key 仅从用户声明的环境变量读取；失败以非零退出码和 stderr 错误对象返回，不使用通用 runner/schema/envelope |
| 依赖政策 | Python 3.11 标准库；provider endpoint/credential 由用户配置；禁止自动安装；复制后独立运行 |
| 来源知识面 | `archival-web-navigation`<br>`browser-agent-adapter`<br>`image-source-browser`<br>`literature-retrieval-browser`<br>`local-search-reformulation`<br>`precise-text-browser`<br>`reverse-image-identification`<br>`text-web-search` |
| 输出层次 | 原始观察/OCR → 规范化转录 → 校勘 → 翻译 → 解释 |
| hard dependencies | 无 |
| advisory relationships | `histagent-historical-research`（advisory）<br>`histagent-historical-source-analysis`（advisory） |
| ANZSRC Fields | `430201`<br>`430306` |
| 预期 domains | `heritage-archive-and-museum-studies`<br>`historical-studies` |
| 内容许可 | 已确认；`Apache-2.0 with replacement of unresolved derived implementations`；证据：`LICENSE`<br>`scripts/text_web_browser.py` |
| 与现有能力的关系 | 保留精确档案、书目与图像来源识别能力，作为聚焦的 advisory 能力。 |
| 安全约束 | `host-access-control`、`human-review`、`no-embedded-credentials`、`no-unmarked-completion`、`output-layer-separation`、`provider-neutral`、`provenance-required` |
| 阻断发现 | 每个发现的来源和检索图片都必须具有可追溯 provenance。 |
| 建议 | 使用宿主批准的 provider-neutral 工具重构浏览和精确检索；不得复制 `browser_use` 或 Cookie 材料。 |

### 9.3 `histagent-historical-source-analysis`（历史来源分析）

| 项目 | 内容 |
| --- | --- |
| 处置 | 适配吸纳 |
| 实现策略 | 完整 authored tree；baseline + script-assisted + resource-backed |
| 正式入口 | `scripts/analyze_source.py` |
| 命令 | `inspect`、`convert`、`ocr`、`translate`、`transcribe`、`frames`、`vision`、`collate`、`validate` |
| 状态与输出 | 普通 CLI 参数与 layer/variants/emendations 领域文件；命令级 receipt；共享资源为 `lib/historical_support.py` |
| CLI 与失败 | credential 仅从用户声明的环境变量读取；失败以非零退出码和 stderr 错误对象返回，不使用通用 runner/schema/envelope |
| 依赖政策 | Python 3.11 标准库为离线核心；`pypdf`、`tesseract`、`whisper`、`ffmpeg` 为用户管理可选依赖；复制后独立运行 |
| 来源知识面 | `document-conversion`<br>`file-format-processing`<br>`general-ocr`<br>`historical-ocr`<br>`source-text-inspection`<br>`speech-transcription`<br>`translation`<br>`video-frame-extraction`<br>`visual-source-analysis` |
| 输出层次 | 原始观察/OCR → 规范化转录 → 校勘 → 翻译 → 解释 |
| hard dependencies | 无 |
| advisory relationships | `histagent-historical-research`（advisory）<br>`histagent-historical-source-identification`（advisory） |
| ANZSRC Fields | `430206`<br>`430306` |
| 预期 domains | `heritage-archive-and-museum-studies`<br>`historical-studies` |
| 内容许可 | 已确认；`Apache-2.0 with replacement of unresolved derived implementations`；证据：`LICENSE`<br>`scripts/text_web_browser.py` |
| 与现有能力的关系 | 为多模态历史材料提供史料处理纪律，不替代综合研究工作流。 |
| 安全约束 | `host-access-control`、`human-review`、`no-embedded-credentials`、`no-unmarked-completion`、`output-layer-separation`、`provider-neutral`、`provenance-required` |
| 阻断发现 | OCR 修订、规范化、翻译与解释必须保持可区分。 |
| 建议 | 通过 provider-neutral Python 与 AgentSpec 资源保留 OCR、校勘、翻译、文件、图像、音频和视频分析。 |

三个候选 Skill 的 hard dependencies 均为空，兄弟 Skill 之间只有 advisory relationship。`historical-studies` 预期收录三者；`heritage-archive-and-museum-studies` 只预期收录来源识别和来源分析；不加入任何工具域。

所有候选输出都必须明确区分原始观察/OCR、规范化转录、校勘、翻译和解释。任何补写、重构或修正都不得冒充原始证据，且必须保留 provenance。

## 十、120 项源文件清单

全部条目均为普通文件，Git mode 均为 `100644`。为便于表格审阅，下表只展示 Git object ID 前 12 位和 SHA-256 前 16 位；完整值保存在 `capability-audit.json`，整表由前述完整清单 SHA-256 绑定。

| # | 路径 | 字节数 | 内容来源 | 处置 | Git object | SHA-256 |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | `.gitignore` | 76 | `histagent-root` | 保留 | `0f81340ea9eb` | `aba156532344a33d` |
| 2 | `CODE_OF_CONDUCT.md` | 5,302 | `histagent-root` | 保留 | `493bc5f878c9` | `4b71f1f266079b84` |
| 3 | `CONTRIBUTING.md` | 2,448 | `histagent-root` | 保留 | `0b69da16c6ac` | `e4513c0c3c5a380d` |
| 4 | `Figures/Figure_1.png` | 216,900 | `unverified-figures` | 排除 | `6cf4a5ed977e` | `b88c04b8914254de` |
| 5 | `Figures/data_hir.png` | 583,957 | `unverified-figures` | 排除 | `c51b237d3fad` | `0416a38af90f2e47` |
| 6 | `Figures/histagent_arch.png` | 413,203 | `unverified-figures` | 排除 | `f73ca209060b` | `0d1e516ef310e625` |
| 7 | `Figures/language.png` | 220,229 | `unverified-figures` | 排除 | `1cfc060c77d1` | `894040ba291f6699` |
| 8 | `Figures/lit_search_agent.png` | 196,287 | `unverified-figures` | 排除 | `adf561ef4746` | `d4ec0417fa2f0b07` |
| 9 | `Figures/region.png` | 419,429 | `unverified-figures` | 排除 | `365c27d91e7e` | `79ff5503220c1a36` |
| 10 | `LICENSE` | 11,357 | `histagent-root` | 保留 | `261eeb9e9f8b` | `c71d239df91726fc` |
| 11 | `README.md` | 24,542 | `histagent-root` | 保留 | `8e4aca2d4f23` | `307fc4f1188ca759` |
| 12 | `browser_use/README.md` | 877 | `browser-use-unclear` | 排除 | `ed850d74033b` | `dd18c43951f22012` |
| 13 | `browser_use/__init__.py` | 893 | `browser-use-unclear` | 排除 | `cb9b1a4e30f8` | `524d70aac1839090` |
| 14 | `browser_use/__pycache__/__init__.cpython-312.pyc` | 874 | `compiled-bytecode` | 排除 | `a0ff58da8b10` | `bfee251c514cfd32` |
| 15 | `browser_use/__pycache__/logging_config.cpython-312.pyc` | 5,702 | `compiled-bytecode` | 排除 | `b5be88cb8990` | `8a33e555104f1c69` |
| 16 | `browser_use/__pycache__/utils.cpython-312.pyc` | 3,410 | `compiled-bytecode` | 排除 | `a39e0d47798a` | `f9eff88614fc80f1` |
| 17 | `browser_use/agent/__pycache__/gif.cpython-312.pyc` | 11,121 | `compiled-bytecode` | 排除 | `ef86116aefbd` | `24cb6f2a3f0623c3` |
| 18 | `browser_use/agent/__pycache__/prompts.cpython-312.pyc` | 7,586 | `compiled-bytecode` | 排除 | `07fe6da03935` | `dc9593accfaa357e` |
| 19 | `browser_use/agent/__pycache__/service.cpython-312.pyc` | 52,715 | `compiled-bytecode` | 排除 | `34103aa80d6b` | `eed5fab634619ccd` |
| 20 | `browser_use/agent/__pycache__/tests.cpython-312.pyc` | 7,793 | `compiled-bytecode` | 排除 | `609ae3319c5a` | `29e54627104ae4a0` |
| 21 | `browser_use/agent/__pycache__/views.cpython-312.pyc` | 21,808 | `compiled-bytecode` | 排除 | `ccfc6c8a28fc` | `eb699af542205938` |
| 22 | `browser_use/agent/gif.py` | 8,766 | `browser-use-unclear` | 排除 | `1cb7cbc9ce15` | `848d3a4b21ba15c9` |
| 23 | `browser_use/agent/message_manager/__pycache__/service.cpython-312.pyc` | 16,601 | `compiled-bytecode` | 排除 | `05316375dc60` | `ac3d0b404e3a7cdd` |
| 24 | `browser_use/agent/message_manager/__pycache__/tests.cpython-312.pyc` | 9,454 | `compiled-bytecode` | 排除 | `01aa28ad034d` | `2b6983342f6ed02a` |
| 25 | `browser_use/agent/message_manager/__pycache__/utils.cpython-312.pyc` | 6,477 | `compiled-bytecode` | 排除 | `fc02ec19ed96` | `c53ddc5573591b4d` |
| 26 | `browser_use/agent/message_manager/__pycache__/views.cpython-312.pyc` | 6,482 | `compiled-bytecode` | 排除 | `ae1f39dbc57c` | `d6c500d60b2c013b` |
| 27 | `browser_use/agent/message_manager/service.py` | 10,682 | `browser-use-unclear` | 排除 | `73b3cf78708a` | `3e059052731a3df0` |
| 28 | `browser_use/agent/message_manager/tests.py` | 7,840 | `browser-use-unclear` | 排除 | `94c1beb59e2c` | `540f13a474f2ae13` |
| 29 | `browser_use/agent/message_manager/utils.py` | 4,337 | `browser-use-unclear` | 排除 | `fb4a2167badd` | `d557f8f9976064f6` |
| 30 | `browser_use/agent/message_manager/views.py` | 3,857 | `browser-use-unclear` | 排除 | `ad8c9c67056c` | `94cc0d29345a6630` |
| 31 | `browser_use/agent/prompts.py` | 5,246 | `browser-use-unclear` | 排除 | `83ef09022623` | `ebf5beef8e8f688a` |
| 32 | `browser_use/agent/service.py` | 34,175 | `browser-use-unclear` | 排除 | `05d96c32e95e` | `63000621c369eded` |
| 33 | `browser_use/agent/system_prompt.md` | 4,422 | `browser-use-unclear` | 排除 | `e70ae4952fca` | `1bde84a35e83ba26` |
| 34 | `browser_use/agent/tests.py` | 5,710 | `browser-use-unclear` | 排除 | `15c47357da7b` | `6f82aab0dd5d83a8` |
| 35 | `browser_use/agent/views.py` | 12,498 | `browser-use-unclear` | 排除 | `086ee356c892` | `8d7a229fc62ce9df` |
| 36 | `browser_use/browser/__pycache__/browser.cpython-312.pyc` | 11,967 | `compiled-bytecode` | 排除 | `85e873e470cb` | `88551dabaafc3213` |
| 37 | `browser_use/browser/__pycache__/context.cpython-312.pyc` | 60,819 | `compiled-bytecode` | 排除 | `b09bf0ce9415` | `6e8c756db3fe8a66` |
| 38 | `browser_use/browser/__pycache__/views.cpython-312.pyc` | 2,858 | `compiled-bytecode` | 排除 | `cff41579fd3b` | `21300854d6b02e03` |
| 39 | `browser_use/browser/browser.py` | 7,966 | `browser-use-unclear` | 排除 | `1cc9b373ce12` | `86962f40e55df4ea` |
| 40 | `browser_use/browser/context.py` | 39,851 | `browser-use-unclear` | 排除 | `56c6b9dfc76c` | `d2ea1809c8917346` |
| 41 | `browser_use/browser/tests/__pycache__/screenshot_test.cpython-312.pyc` | 1,610 | `compiled-bytecode` | 排除 | `c826feaffee2` | `4e91451b98584571` |
| 42 | `browser_use/browser/tests/__pycache__/test_clicks.cpython-312.pyc` | 4,643 | `compiled-bytecode` | 排除 | `ac276da75acd` | `837845d5cc1869d2` |
| 43 | `browser_use/browser/tests/screenshot_test.py` | 933 | `browser-use-unclear` | 排除 | `7255ccb615e9` | `6b56b3ba2a23c3f4` |
| 44 | `browser_use/browser/tests/test_clicks.py` | 2,942 | `browser-use-unclear` | 排除 | `98ca74354c70` | `de257cd46354db15` |
| 45 | `browser_use/browser/views.py` | 1,231 | `browser-use-unclear` | 排除 | `3434d86e2691` | `522e05a18f91d1dd` |
| 46 | `browser_use/controller/__pycache__/service.cpython-312.pyc` | 29,671 | `compiled-bytecode` | 排除 | `257e71956a5f` | `858dcb8d258d31d8` |
| 47 | `browser_use/controller/__pycache__/views.cpython-312.pyc` | 3,037 | `compiled-bytecode` | 排除 | `e9460051b56d` | `e0f810f5136e1fb6` |
| 48 | `browser_use/controller/registry/__pycache__/service.cpython-312.pyc` | 9,889 | `compiled-bytecode` | 排除 | `4cce694b6a2b` | `ba124969a150dda8` |
| 49 | `browser_use/controller/registry/__pycache__/views.cpython-312.pyc` | 3,667 | `compiled-bytecode` | 排除 | `1cde1ae3febe` | `46a3526c64808259` |
| 50 | `browser_use/controller/registry/service.py` | 7,079 | `browser-use-unclear` | 排除 | `20d80f189d82` | `f8b8be324b784dec` |
| 51 | `browser_use/controller/registry/views.py` | 1,938 | `browser-use-unclear` | 排除 | `211c767a3160` | `6af8ae480e1aab6a` |
| 52 | `browser_use/controller/service.py` | 19,574 | `browser-use-unclear` | 排除 | `a1ec1f131896` | `cd0a61e74d60496d` |
| 53 | `browser_use/controller/views.py` | 1,173 | `browser-use-unclear` | 排除 | `82995c9e3115` | `a2b18b9c655c3682` |
| 54 | `browser_use/dom/__init__.py` | 0 | `browser-use-unclear` | 排除 | `e69de29bb2d1` | `e3b0c44298fc1c14` |
| 55 | `browser_use/dom/__pycache__/__init__.cpython-312.pyc` | 166 | `compiled-bytecode` | 排除 | `ef86e6dcc512` | `da1dd43c749217b4` |
| 56 | `browser_use/dom/__pycache__/service.cpython-312.pyc` | 6,326 | `compiled-bytecode` | 排除 | `56549a6f8b0f` | `2ab30519ef6160b8` |
| 57 | `browser_use/dom/__pycache__/views.cpython-312.pyc` | 8,928 | `compiled-bytecode` | 排除 | `a55c8b9a069e` | `360a47a306f28cfb` |
| 58 | `browser_use/dom/buildDomTree.js` | 31,059 | `browser-use-unclear` | 排除 | `460512fda7d0` | `d78e1892d8f997a8` |
| 59 | `browser_use/dom/history_tree_processor/__pycache__/service.cpython-312.pyc` | 6,964 | `compiled-bytecode` | 排除 | `5eebb5e826f1` | `cac36cb598f6c17f` |
| 60 | `browser_use/dom/history_tree_processor/__pycache__/view.cpython-312.pyc` | 3,087 | `compiled-bytecode` | 排除 | `61431446e437` | `27229c3b6408efd3` |
| 61 | `browser_use/dom/history_tree_processor/service.py` | 4,174 | `browser-use-unclear` | 排除 | `fee43125c278` | `5453d21b34577f43` |
| 62 | `browser_use/dom/history_tree_processor/view.py` | 1,704 | `browser-use-unclear` | 排除 | `e970ad5b53af` | `d8a8a2d010f992ea` |
| 63 | `browser_use/dom/service.py` | 4,589 | `browser-use-unclear` | 排除 | `d03fbecfbf5a` | `337eab9fe4ab7c2e` |
| 64 | `browser_use/dom/tests/__pycache__/extraction_test.cpython-312.pyc` | 6,857 | `compiled-bytecode` | 排除 | `4c62b0fe312c` | `10c549eb1a121ffa` |
| 65 | `browser_use/dom/tests/__pycache__/process_dom_test.cpython-312.pyc` | 2,118 | `compiled-bytecode` | 排除 | `20a6353f433f` | `71b41b6d7e213d60` |
| 66 | `browser_use/dom/tests/extraction_test.py` | 4,777 | `browser-use-unclear` | 排除 | `d48823f54f14` | `8741b369c1da3e76` |
| 67 | `browser_use/dom/tests/process_dom_test.py` | 1,139 | `browser-use-unclear` | 排除 | `39bd2432885c` | `2d1f29f4ee5ede48` |
| 68 | `browser_use/dom/views.py` | 5,732 | `browser-use-unclear` | 排除 | `05c597c627ed` | `ceefebaf400f5c26` |
| 69 | `browser_use/logging_config.py` | 4,109 | `browser-use-unclear` | 排除 | `043252bd78d0` | `e0e120f09eb7817b` |
| 70 | `browser_use/telemetry/__pycache__/service.cpython-312.pyc` | 5,152 | `compiled-bytecode` | 排除 | `90137f71aa83` | `dd1a5a77ef5c02bd` |
| 71 | `browser_use/telemetry/__pycache__/views.cpython-312.pyc` | 3,200 | `compiled-bytecode` | 排除 | `4fd9b373999e` | `a57676b91b9f2ddf` |
| 72 | `browser_use/telemetry/service.py` | 2,820 | `browser-use-unclear` | 排除 | `6a2e82e45801` | `8605f457f268733a` |
| 73 | `browser_use/telemetry/views.py` | 1,242 | `browser-use-unclear` | 排除 | `fdba27303109` | `be2ede6bc3bcbf85` |
| 74 | `browser_use/utils.py` | 1,474 | `browser-use-unclear` | 排除 | `860b35a320d8` | `15785d391449464d` |
| 75 | `combine_results.py` | 33,038 | `histagent-root` | 排除 | `3bd4bf5990d7` | `56e4b928e40652aa` |
| 76 | `dataset_loader.py` | 37,702 | `histagent-root` | 排除 | `71b263d4a866` | `84bad0ea8ac239c7` |
| 77 | `judgment.py` | 7,371 | `histagent-root` | 排除 | `49f51294342b` | `50e4802e603cdd70` |
| 78 | `openai_baseline.py` | 20,143 | `histagent-root` | 排除 | `08efbd498bdc` | `772d63158ba661cb` |
| 79 | `requirements.txt` | 808 | `histagent-root` | 排除 | `15c3d0d69a07` | `029853936487c2cc` |
| 80 | `run_gaia.py` | 51,638 | `histagent-root` | 排除 | `e37ca4a4b8a4` | `19d746ef17f62788` |
| 81 | `run_hist.py` | 97,963 | `histagent-root` | 适配吸纳 | `4be2101b9c44` | `9dfbaf36bb5497fa` |
| 82 | `run_hlejson.py` | 96,651 | `histagent-root` | 排除 | `3e856dc31034` | `09f44f36fc401d11` |
| 83 | `scripts/LocalGoogleSearchTool.py` | 7,993 | `histagent-root` | 适配吸纳 | `ccf33b5de9e5` | `f0a87fa93b1f88ca` |
| 84 | `scripts/__init__.py` | 0 | `histagent-root` | 保留 | `e69de29bb2d1` | `e3b0c44298fc1c14` |
| 85 | `scripts/__pycache__/LocalGoogleSearchTool.cpython-312.pyc` | 8,224 | `compiled-bytecode` | 排除 | `a80e0bcfb4d9` | `47abf37e62ac2f4e` |
| 86 | `scripts/__pycache__/__init__.cpython-312.pyc` | 158 | `compiled-bytecode` | 排除 | `19a34dd4beea` | `a85d1d06ddf976f1` |
| 87 | `scripts/__pycache__/agent_web_browser.cpython-312.pyc` | 11,462 | `compiled-bytecode` | 排除 | `d45b371e4a00` | `1939a85e91c40721` |
| 88 | `scripts/__pycache__/cookies.cpython-312.pyc` | 11,133 | `compiled-bytecode` | 排除 | `693cf953147a` | `343f6f55d1370b53` |
| 89 | `scripts/__pycache__/file_processing.cpython-312.pyc` | 38,601 | `compiled-bytecode` | 排除 | `d8214d505433` | `f4638d859f0d2831` |
| 90 | `scripts/__pycache__/frame_extract.cpython-312.pyc` | 10,160 | `compiled-bytecode` | 排除 | `30918be52a7d` | `42baef0ebdb85b67` |
| 91 | `scripts/__pycache__/image_web_browser.cpython-312.pyc` | 48,029 | `compiled-bytecode` | 排除 | `9528656513e0` | `c64446d959a5ca8d` |
| 92 | `scripts/__pycache__/mdconvert.cpython-312.pyc` | 44,032 | `compiled-bytecode` | 排除 | `8a3e73fc8a34` | `24401d336306845f` |
| 93 | `scripts/__pycache__/ocr.cpython-312.pyc` | 11,002 | `compiled-bytecode` | 排除 | `ec6c4bfd82e7` | `05ed26a1094cecb4` |
| 94 | `scripts/__pycache__/reformulator.cpython-312.pyc` | 2,837 | `compiled-bytecode` | 排除 | `6812cf8ad20a` | `b248744414a6a5bd` |
| 95 | `scripts/__pycache__/reverse_image.cpython-312.pyc` | 11,754 | `compiled-bytecode` | 排除 | `a5fefa689849` | `99ab818431c5fbd3` |
| 96 | `scripts/__pycache__/run_agents.cpython-312.pyc` | 4,868 | `compiled-bytecode` | 排除 | `3f064f2e98c1` | `806c924e0aaf8da9` |
| 97 | `scripts/__pycache__/speech_recognition.cpython-312.pyc` | 8,176 | `compiled-bytecode` | 排除 | `68aceb40b830` | `6b5258dcb203446a` |
| 98 | `scripts/__pycache__/text_inspector_tool.cpython-312.pyc` | 4,634 | `compiled-bytecode` | 排除 | `bfe67a1c2a67` | `e2f693bdf0a0676b` |
| 99 | `scripts/__pycache__/text_web_browser.cpython-312.pyc` | 29,963 | `compiled-bytecode` | 排除 | `e7c763d561f7` | `f61cd0c90b0d99f7` |
| 100 | `scripts/__pycache__/transkribus_ocr.cpython-312.pyc` | 16,225 | `compiled-bytecode` | 排除 | `a047aada6f7f` | `ce6590e4ec342001` |
| 101 | `scripts/__pycache__/translator.cpython-312.pyc` | 5,475 | `compiled-bytecode` | 排除 | `2cc2bc91bd0f` | `c8efacea95cae0e8` |
| 102 | `scripts/__pycache__/visual_qa.cpython-312.pyc` | 7,589 | `compiled-bytecode` | 排除 | `d39f4912f1e5` | `9b1ae679088ce0cc` |
| 103 | `scripts/agent_web_browser.py` | 9,457 | `microsoft-autogen` | 等价重构 | `6f2eb98365fd` | `b25545f782534336` |
| 104 | `scripts/cookies.py` | 23,304 | `histagent-root` | 已确认失败 | `8e42333561e5` | `527392dc67924e2f` |
| 105 | `scripts/file_processing.py` | 37,311 | `histagent-root` | 适配吸纳 | `327db0e9848e` | `a7e31889ed8a51f7` |
| 106 | `scripts/frame_extract.py` | 8,503 | `histagent-root` | 适配吸纳 | `f05efa067a1d` | `c4ef42985250a943` |
| 107 | `scripts/gaia_scorer.py` | 3,211 | `histagent-root` | 适配吸纳 | `c8fba27e1bfd` | `1428b2f7a8c620a5` |
| 108 | `scripts/image_web_browser.py` | 43,452 | `microsoft-autogen` | 适配吸纳 | `11851e42d5c6` | `f12c7433978c781d` |
| 109 | `scripts/mdconvert.py` | 36,970 | `microsoft-autogen` | 适配吸纳 | `6a1fd00bdc76` | `948d7189273d7e8c` |
| 110 | `scripts/ocr.py` | 10,692 | `histagent-root` | 适配吸纳 | `5fe4a5fca4d8` | `e2043be84d753ded` |
| 111 | `scripts/reformulator.py` | 2,679 | `microsoft-autogen` | 等价重构 | `bef6d9d5b6d9` | `a278dd88b10a3ceb` |
| 112 | `scripts/reverse_image.py` | 9,081 | `histagent-root` | 适配吸纳 | `627b94db1258` | `ab46be2e0cfb75e1` |
| 113 | `scripts/run_agents.py` | 3,703 | `histagent-root` | 适配吸纳 | `37da8a40e586` | `d697b0cb03d1343d` |
| 114 | `scripts/speech_recognition.py` | 6,864 | `histagent-root` | 适配吸纳 | `432d1c03d97a` | `65a2a77e03d1851b` |
| 115 | `scripts/text_inspector_tool.py` | 4,597 | `histagent-root` | 适配吸纳 | `056168cee84d` | `3c55cf019dff77c6` |
| 116 | `scripts/text_web_browser.py` | 23,654 | `microsoft-autogen` | 等价重构 | `c83ae112d5b5` | `ea4c1626d9be46fd` |
| 117 | `scripts/transkribus_ocr.py` | 12,997 | `histagent-root` | 适配吸纳 | `0a496fbf0968` | `4860f40cbbb53944` |
| 118 | `scripts/translator.py` | 4,857 | `histagent-root` | 适配吸纳 | `d14caa537256` | `f1b079c72c7c0489` |
| 119 | `scripts/visual_qa.py` | 6,039 | `histagent-root` | 适配吸纳 | `45fe10214437` | `594c66909ada22a5` |
| 120 | `scripts/web_tools.py` | 98,190 | `histagent-root` | 适配吸纳 | `9c6f9c91795a` | `5b92325b7b4ff191` |

## 十一、排除的评测范围

HistBench、GAIA 和 HLE 的数据集、runner、结果合并、评分、baseline 与 judgment 只作为审计证据。它们不是候选 Skill 内容，也不授予下载数据集或执行评测的权限。

## 十二、未来 Gate

可以并行准备 `ingest-histagent`，但生产发布必须等待本审计通过验证，并由人类对完整生成树及其精确 hash 进行绑定审阅。抽样审阅或未绑定 hash 的审阅不能满足 Gate。未来生产 change 必须提供明确的 admission、origin、license、file、resource、relationship、domain、curation 与 derivation 决策，且不得复制任何 `exclude` 或 `confirmed-failure` 材料。

## 十三、审阅重点

建议人工审阅按以下顺序进行：

1. 确认 `scripts/cookies.py`、tracked `.pyc`、telemetry、无许可 `browser_use` 与来源未核实图片均不进入吸纳输入。
2. 确认五个 AutoGen/Magentic-One 署名文件在未来 ingest 中逐一完成精确 MIT 来源核实及 notice 保留，或采用功能等价重构。
3. 确认三候选 Skill 的能力边界互补、hard dependencies 为空、relationship 仅为 advisory。
4. 确认任何 provider、浏览器、文件、上传与子进程能力都由显式调用和宿主策略共同约束。
5. 确认历史材料输出始终保留五层区分，尤其不存在未标注补写。
6. 确认未来生产发布只接受经过完整生成树 hash-bound 人工审阅的结果。
