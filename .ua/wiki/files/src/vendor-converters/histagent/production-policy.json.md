
# src/vendor-converters/histagent/production-policy.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: config:src/vendor-converters/histagent/production-policy.json -->

HistAgent 生产策略 SSOT：在 snapshot-47bbe21 审计基线上，把 120 个源条目、31 个知识面、5 个内容来源、4 条许可声明、10 项运行时权威、16 个外部资源、10 条安全发现与 3 个候选 Skill 逐条映射为 excluded / retained-evidence / independent-reimplementation，并附带 21 项能力面映射与 3 份 Skill 契约。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:capability-map-historical-research -->

能力面映射：historical-research 覆盖 4 个面（答案提交环、编排状态机、文献工具套件、确定性响应渲染），全部为 bundled-script 状态机实现，派生方式统一为独立重写。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:capability-map-source-analysis -->

能力面映射：source-analysis 覆盖 9 个面，文档与文件格式转换、文本检视为 bundled-script，OCR（tesseract / Transkribus）、语音转写（whisper CLI）、视频抽帧（ffmpeg）为 optional-local-tool，翻译与视觉分析走 provider-neutral HTTP 适配器。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:capability-map-source-identification -->

能力面映射：source-identification 覆盖 8 个面，以 configured-http-adapter 为主（Internet Archive CDX、HTML/图片浏览、Google Books 与 Springer 文献检索、本地索引与 SerpAPI 搜索、反向图片识别），精确文本浏览为 bundled-script。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:content-origin-browser-use-unclear -->

内容来源 browser-use-unclear：审计结论 exclude，来源不明的 browser_use 内容不得进入生产树。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:content-origin-compiled-bytecode -->

内容来源 compiled-bytecode：审计结论 exclude，跟踪的字节码不得复制或发布。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:content-origin-histagent-root -->

内容来源 histagent-root：审计结论 adapt，生产动作为独立重写，不直接复制上游字节。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:content-origin-microsoft-autogen -->

内容来源 microsoft-autogen：审计结论 replace，所有 AutoGen / Magentic-One 归属内容一律以独立重写替代，HistBench、GAIA、HLE 保持仅审计。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:content-origin-unverified-figures -->

内容来源 unverified-figures：审计结论 exclude，未核实的数字与图表不得进入生产 Skill。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-gaia-dataset -->

外部资源 gaia-dataset：审计结论 exclude，GAIA 数据集保持仅审计，不进入生产。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-google-books -->

外部资源 google-books：审计结论 adapt，与 Springer API 一同构成文献检索适配器组。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-google-lens -->

外部资源 google-lens：审计结论 adapt，反向图片检索经 provider-neutral 适配器接入。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-histbench-dataset -->

外部资源 histbench-dataset：审计结论 exclude，基准数据集仅供审计，不随 Skill 分发。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-hle-dataset -->

外部资源 hle-dataset：审计结论 exclude，HLE 数据集保持仅审计。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-huggingface-models -->

外部资源 huggingface-models：审计结论 adapt，模型权重由用户在调用时提供，生成 Skill 不打包模型。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-imgbb -->

外部资源 imgbb：审计结论 adapt，图片处理服务，仅在用户授权下由目标 Agent 调用。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-internet-archive -->

外部资源 internet-archive：审计结论 adapt，以独立重写的 Internet Archive CDX 适配器接入，不分发上游客户端。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-llamaparse -->

外部资源 llamaparse：审计结论 adapt，文档解析依赖，由用户自行安装并配置，ResearchSpec 不代为安装。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-local-translation-service -->

外部资源 local-translation-service：审计结论 adapt，翻译能力通过本地部署服务提供，避免固定云端绑定。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-openai-provider -->

外部资源 openai-provider：审计结论 adapt，模型推理改为 provider-neutral，固定 provider 绑定已被安全发现替换掉。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-scholar -->

外部资源 google-scholar：审计结论 adapt，文献检索能力经 provider-neutral 适配器保留，凭据由用户配置。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-serpapi -->

外部资源 serpapi：审计结论 adapt，支撑网页搜索与反向图片识别；上传行为受 EXTERNAL-MATERIAL-UPLOAD 的授权约束。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-springer-api -->

外部资源 springer-api：审计结论 adapt，文献检索适配器之一，不在 Skill 中内置凭据契约。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-transkribus -->

外部资源 transkribus：审计结论 adapt，历史文献 OCR 的可选外部服务，与本地 tesseract 并列为 optional-local-tool 路径。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:external-resource-youtube-media -->

外部资源 youtube-media：审计结论 adapt，视频帧抽取的媒体来源，需在任务材料授权范围内使用。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:histagent-historical-research -->

Skill 契约：正式入口为 scripts/research_runtime.py，暴露 init、status、submit-source、submit-layer、submit-evidence、check、render 七个命令，硬依赖为空，对另外两个历史 Skill 只有 advisory 关系，领域归属 historical-studies。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:histagent-historical-source-analysis -->

Skill 契约：正式入口为 scripts/analyze_source.py，含 9 个命令，硬依赖为空，领域归属 historical-studies 与 heritage-archive-and-museum-studies。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:histagent-historical-source-identification -->

Skill 契约：正式入口为 scripts/identify_sources.py，含 8 个命令，硬依赖为空，领域归属 historical-studies 与 heritage-archive-and-museum-studies。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:knowledge-surfaces-excluded -->

10 个知识面被排除：浏览器自动化运行时与遥测、cookie 注入载荷、GAIA/HistBench/HLE 运行器与评分组合、OpenAI 基线，均属基准、遥测或不受控外部能力。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:knowledge-surfaces-reimplemented -->

31 个知识面中 21 个走独立重写，覆盖答案环、编排、档案检索、文献检索、文档与文件格式转换、OCR、翻译、文本检视、语音转写、视频抽帧与视觉分析等能力。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:license-claim-autogen-derived-mit -->

许可声明 autogen-derived-mit：审计结论 replace，以独立重写替代，不能凭 MIT 声明直接复用 AutoGen 派生实现。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:license-claim-browser-use-missing -->

许可声明 browser-use-missing：审计结论 exclude，缺少许可声明的 browser_use 内容不构成授权。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:license-claim-figure-provenance-unverified -->

许可声明 figure-provenance-unverified：审计结论 exclude，图表来源未经核实的内容不予发布。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:license-claim-root-apache-2-0 -->

许可声明 root-apache-2-0：审计结论 retain，生产动作 retained-evidence，作为上游根许可的留存证据。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-benchmark-execution -->

运行时权威 benchmark-execution：审计结论 exclude，基准运行器与评分保持仅审计，不进入生产。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-browser-control -->

运行时权威 browser-control：审计结论 replace，浏览器控制改为用户授权的目标 Agent 工具，静态命令永不启动浏览器。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-credential-access -->

运行时权威 credential-access：审计结论 replace，凭据读取能力被替换，转换、检查、安装与注册装配永不读取凭据。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-dependency-installation -->

运行时权威 dependency-installation：审计结论 exclude，ResearchSpec 不安装上游依赖。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-external-request -->

运行时权威 external-request：审计结论 adapt，外部请求能力被收敛为 provider-neutral 的 HTTP 适配器。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-filesystem-read -->

运行时权威 filesystem-read：审计结论 adapt，文件读取被限制在用户提供的任务材料范围内。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-filesystem-write -->

运行时权威 filesystem-write：审计结论 adapt，写入被限制在 Skill 本地包与用户授权的语义输出上。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-provider-inference -->

运行时权威 provider-inference：审计结论 replace，不绑定固定 provider 凭据，改由目标 Agent 与宿主策略下的用户配置承担。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-subprocess-execution -->

运行时权威 subprocess-execution：审计结论 replace，子进程执行边界被替换，ResearchSpec 不执行打包脚本。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:runtime-authority-telemetry -->

运行时权威 telemetry：审计结论 exclude，遥测默认配置整体排除，生成 Skill 不含任何上报行为。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-browser-use-origin -->

安全发现 BROWSER-USE-ORIGIN：审计结论 exclude，来源不明的 browser_use 内容整体排除。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-cookie-payload -->

安全发现 COOKIE-PAYLOAD：审计结论为 confirmed-failure（唯一确认失败项），cookie 注入载荷整体排除，不得复制或暴露。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-credential-surface -->

安全发现 CREDENTIAL-SURFACE：审计结论 replace，生成 Skill 不暴露任何凭据接口。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-external-material-upload -->

安全发现 EXTERNAL-MATERIAL-UPLOAD：审计结论 adapt，材料外传只能在目标 Agent 与宿主策略下显式授权后发生。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-fixed-provider-binding -->

安全发现 FIXED-PROVIDER-BINDING：审计结论 replace，去除固定 provider 绑定，改为 provider-neutral 配置。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-image-provenance -->

安全发现 IMAGE-PROVENANCE：审计结论 exclude，图片来源未经核实的内容不予发布。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-output-layer-collapse -->

安全发现 OUTPUT-LAYER-COLLAPSE：审计结论 replace，避免观察层与产出层混同，输出层需可显式区分。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-subprocess-boundary -->

安全发现 SUBPROCESS-BOUNDARY：审计结论 replace，以独立重写消除上游子进程执行边界。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-telemetry-default -->

安全发现 TELEMETRY-DEFAULT：审计结论 exclude，上游遥测默认值不得保留。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:security-tracked-bytecode -->

安全发现 TRACKED-BYTECODE：审计结论 exclude，跟踪的字节码不进入生产树。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:source-entries-excluded -->

95 个源条目被排除，覆盖遥测默认值、基准运行器、cookie 相关文件、编译字节码与来源不明内容。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:source-entries-reimplemented -->

120 个源条目中 19 个（16 adapt + 3 replace）进入独立重写，涵盖浏览器脚本、OCR、翻译、视觉问答、帧抽取、文本检视与 search 工具等文件，均不得复制上游实现。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)
<!-- node: resource:src/vendor-converters/histagent/production-policy.json:source-entries-retained-evidence -->

6 个源条目仅作留存证据：LICENSE、README、CODE_OF_CONDUCT、CONTRIBUTING、.gitignore 与 scripts/__init__.py，用于归属与许可证明而非功能实现。
源码：[src/vendor-converters/histagent/production-policy.json](../../../../../../src/vendor-converters/histagent/production-policy.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| capability-map-historical-research | src/vendor-converters/histagent/production-policy.json | 能力面映射：historical-research 覆盖 4 个面（答案提交环、编排状态机、文献工具套件、确定性响应渲染），全部为 bundled-script 状态机实现，派生方式统一为独立重写。 |
| capability-map-source-analysis | src/vendor-converters/histagent/production-policy.json | 能力面映射：source-analysis 覆盖 9 个面，文档与文件格式转换、文本检视为 bundled-script，OCR（tesseract / Transkribus）、语音转写（whisper CLI）、视频抽帧（ffmpeg）为 optional-local-tool，翻译与视觉分析走 provider-neutral HTTP 适配器。 |
| capability-map-source-identification | src/vendor-converters/histagent/production-policy.json | 能力面映射：source-identification 覆盖 8 个面，以 configured-http-adapter 为主（Internet Archive CDX、HTML/图片浏览、Google Books 与 Springer 文献检索、本地索引与 SerpAPI 搜索、反向图片识别），精确文本浏览为 bundled-script。 |
| external-resource:histbench-dataset | src/vendor-converters/histagent/production-policy.json | 外部资源 histbench-dataset：审计结论 exclude，基准数据集仅供审计，不随 Skill 分发。 |
| license-claim:autogen-derived-mit | src/vendor-converters/histagent/production-policy.json | 许可声明 autogen-derived-mit：审计结论 replace，以独立重写替代，不能凭 MIT 声明直接复用 AutoGen 派生实现。 |
| security-finding:CREDENTIAL-SURFACE | src/vendor-converters/histagent/production-policy.json | 安全发现 CREDENTIAL-SURFACE：审计结论 replace，生成 Skill 不暴露任何凭据接口。 |
| security-finding:FIXED-PROVIDER-BINDING | src/vendor-converters/histagent/production-policy.json | 安全发现 FIXED-PROVIDER-BINDING：审计结论 replace，去除固定 provider 绑定，改为 provider-neutral 配置。 |
| security-finding:SUBPROCESS-BOUNDARY | src/vendor-converters/histagent/production-policy.json | 安全发现 SUBPROCESS-BOUNDARY：审计结论 replace，以独立重写消除上游子进程执行边界。 |
