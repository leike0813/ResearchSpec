# 固定文献系统 Adapter

ResearchSpec 将 Zotero 集成作为独立的固定文献系统 Adapter 交付。它不是 Companion、Agent tool adapter 或可选 domain plugin。当前 catalog 只有 `zotero-library`，`install_policy: fixed` 是唯一安装事实源；`config.yaml` 不提供选择或关闭 Adapter 的配置项。

## 交付模型

`researchspec init` 和 `researchspec update` 会离线复制当前平台的 `zotero-bridge-cli` runtime 到项目根 `.zotero-bridge/bin/`，并创建 `.zotero-bridge/profile.template.json`。模板不包含 token、真实 profile、PATH 修改或用户目录写入。Windows 使用 `zotero-bridge.exe` 和项目内 `.cmd` shim；POSIX runtime 使用 `0755`。

两个 Agent-neutral Skills——`zotero-library-agent` 与 `zotero-bridge-cli`——会投影到每个已选择的 Agent tool。没有 Agent tool 时，共享 runtime 仍会安装，Skill 投影在 manifest 中记录为 `deferred`。固定 surface 因此是 4 个 ARSU Skills、4 个 Companion Skills 和 2 个 Zotero Adapter Skills；31 个工具各得到 10 个固定 Skills，28 个 command-capable 工具仍各只有 8 个 wrappers。

交付过程不运行上游 installer、runtime、Python helper 或证据工具，不安装 Zotero XPI/backend，不访问网络，也不写用户全局 Zotero 状态。ResearchSpec release 携带全部七个平台资产，项目初始化只选择当前平台。

## 身份与版本

当前 release-set 是 `hbrs-3d834c0f075f3122ac566e9a`，协议是 `host-bridge.v1`，CLI schema 是 `zotero-bridge.cli.v2`。release-set、source commit、tree、build fingerprint、command catalog checksum、binary aggregate 和各平台 SHA-256 共同确定一次可吸纳发布。

Bundle、CLI 和两个 Skill 的版本分别属于各自组件。ResearchSpec 会验证每个版本是否与该组件在 catalog 和 manifest 中声明的身份一致，但从不要求这些组件的 patch 版本相等。现在和后续更新中，跨组件 patch 不一致本身不是 admission、安装、状态或更新阻断条件。

## 状态与检查

`researchspec status --json` 的 `literature_adapters` 字段报告 `installed`、`degraded`、`unsupported`、`missing` 或 `conflict`，并报告 Skill 投影。`connection_state` 固定为 `unchecked`：状态查询只读 catalog、manifest 和文件，不启动 runtime，不连接 Zotero 或 Host Bridge。

`researchspec check literature-adapters` 静态检查 catalog/resolution 身份、当前平台 runtime、manifest ownership、文件哈希、POSIX executable bit 和两个 Skill 的完整投影；`check all` 包含同一检查。它不探测 Host Bridge。

## ARSU 使用边界

需要文献时，当前 ARSU producer 先在可用情况下执行有界、只读的 Zotero 查询，再按需要补充外部检索。空结果不证明相关文献不存在。普通任务在 Adapter 不可用时沿既有外部检索或用户输入路径降级并披露限制；明确依赖当前 Zotero 选择、私有 collection、私有 metadata 或 attachment 的任务必须暂停，请求配置或替代输入。

Adapter 输出只是原 producer 的工作材料。它不能直接修改 ResearchSpec specs、state、artifact registry、Gate、Decision、transition 或 receipts。Zotero mutation、workflow submit/apply、上传、删除和维护需要单独的用户授权，并继续受 Host Bridge 审批。

`academic-pipeline/scripts/adapters/zotero.py` 是另一条人工离线路径：它只读取用户提供的 Better BibTeX JSON export，依赖用户自己的 Python 3.11+ 与 PyYAML，不读取实时 Zotero 状态，也不能替代固定 Adapter。

## 许可与来源

生成的 `literature-adapters/zotero/` 来自固定的 `leike0813/zotero-library-agent-bundle` release-set，按源仓库的 AGPL-3.0-only 许可分发。每个生成组件带有 `LICENSE`、`NOTICE.md` 和 `DERIVATION.json`；维护用 checkout 与 audit 不进入发布包。
