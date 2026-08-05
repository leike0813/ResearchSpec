# 固定文献系统 Adapter

ResearchSpec 将 Zotero 集成作为独立的固定文献系统 Adapter 交付。它不是 Companion、Agent tool adapter 或可选 domain plugin。当前 catalog 只有 `zotero-library`，`install_policy: fixed` 是唯一安装事实源；`config.yaml` 不提供选择或关闭 Adapter 的配置项。

## 交付模型

`researchspec init` 和 `researchspec update` 会离线复制当前平台的 `zotero-bridge-cli` runtime 到项目根 `.zotero-bridge/bin/`，并创建 `.zotero-bridge/profile.template.json`。模板不包含 token、真实 profile、PATH 修改或用户目录写入。Windows 使用 `zotero-bridge.exe` 和项目内 `.cmd` shim；POSIX runtime 使用 `0755`。

七个 Agent-neutral Skills 会投影到每个已选择的 Agent tool：`zotero-library-agent` 是宽泛路由器；`zotero-library-query`、`zotero-literature-acquisition`、`zotero-literature-analysis`、`zotero-research-synthesis` 与 `zotero-library-curation` 是任务入口；`zotero-bridge-cli` 是精确操作机制。没有 Agent tool 时，共享 runtime 仍会安装，Skill 投影在 manifest 中记录为 `deferred`。固定 surface 因此是 4 个 ARSU Skills、2 个 Core Skills、4 个 Companion Skills 和 7 个 Zotero Adapter Skills；31 个工具各得到 17 个固定 Skills，28 个 command-capable 工具仍各只有 16 个 wrappers。

交付过程不运行上游 installer、runtime、Python helper 或证据工具，不安装 Zotero XPI/backend，不访问网络，也不写用户全局 Zotero 状态。ResearchSpec release 携带全部七个平台资产，项目初始化只选择当前平台。

## 身份与版本

当前 release-set 是 `hbrs-8c6de08010d459a0e87e74f2`，协议是 `host-bridge.v2`，CLI schema 是 `zotero-bridge.cli.v5`。release-set、source commit、tree、build fingerprint、command catalog checksum、binary aggregate、七 Skill 闭包和各平台 SHA-256 共同确定一次可吸纳发布。

Bundle、CLI 和七个 Skill 的版本分别属于各自组件。ResearchSpec 会验证每个版本是否与该组件在 catalog 和 manifest 中声明的身份一致，但从不要求这些组件的 patch 版本相等。现在和后续更新中，跨组件 patch 不一致本身不是 admission、安装、状态或更新阻断条件。

## 状态与检查

`researchspec status --json` 的 `literature_adapters` 字段报告 `installed`、`degraded`、`unsupported`、`missing` 或 `conflict`，并报告 Skill 投影。`connection_state` 固定为 `unchecked`：状态查询只读 catalog、manifest 和文件，不启动 runtime，不连接 Zotero 或 Host Bridge。

`researchspec check literature-adapters` 静态检查 catalog/resolution 身份、当前平台 runtime、manifest ownership、文件哈希、POSIX executable bit 和七个 Skill 的完整投影；`check all` 包含同一检查。它不探测 Host Bridge，也不执行七份 runner 或 output schema。

## ARSU 使用边界

需要文献时，当前 ARSU producer 先声明 source policy：`adapter-native` 以当前 library
Query 为先并只为已记录缺口调用 Acquisition；`protocol-multi-source` 服从系统综述协议，
把 Zotero 用于 seeds、去重、full text 与补充覆盖；`external-first` 以当前权威外部来源为先或
并行，并用 Zotero 补充学术上下文；`library-bound` 只接受指定 selection、私有 collection
或离线 library 范围。前三类在 Adapter 不可用时可按政策继续并披露覆盖限制；
`library-bound` 必须暂停。空结果不证明相关文献不存在。

所选 Skill 在调用时才检查 profile、bridge、authentication 与 capability；静态
`connection_state: unchecked` 既不表示成功，也不表示失败。结果通过
`ProviderRetrievalHandoff` 返回原 producer，仍是 working evidence；筛选、去重、验证、覆盖判断
和 stable-spec/handoff 记录由 ARSU producer 负责。

Acquisition 的 item import、collection link 与 attachment import 需要同时绑定当前用户授权的
producer、adapter、library、collection、candidate、effect 与有效期的 `ManagedLibraryAuthorization`。
缺少授权时只能返回 candidate。该授权不扩展到 Curation；metadata、tag、note、merge、delete
或 library-wide maintenance 必须单独路由 `zotero-library-curation` 并取得批准。

Adapter 不能直接修改 ResearchSpec stable specs、subflow control、handoff、Gate、Decision 或
transition。Route confirmation、plugin consent 和 Host Bridge readiness 都不等于
managed-library authorization。

`academic-pipeline/scripts/adapters/zotero.py` 是另一条人工离线路径：它只读取用户提供的 Better BibTeX JSON export，依赖用户自己的 Python 3.11+ 与 PyYAML，不读取实时 Zotero 状态，也不能替代固定 Adapter。

## 许可与来源

生成的 `literature-adapters/zotero/` 来自固定的 `leike0813/zotero-library-agent-bundle` release-set，按源仓库的 AGPL-3.0-only 许可分发。每个生成组件带有 `LICENSE`、`NOTICE.md` 和 `DERIVATION.json`；七份 `runner.json` 和七份 `output.schema.json` 作为不透明运行时元数据按审计字节保留。维护用 checkout 与 audit 不进入发布包。
