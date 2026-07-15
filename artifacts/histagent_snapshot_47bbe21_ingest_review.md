# HistAgent `snapshot-47bbe21` 重制 Skill 复审报告

## 一、复审结论

本轮已按 `docs/non_native_vendor_skill_standard.md` 重制三棵 HistAgent 候选 Skill 树。新设计采用完整 `SKILL.md`、常规 CLI、用途明确的领域 JSON 文件和复制到每棵树的 `lib/historical_support.py`。旧的统一 runner/schema/envelope 接线已全部删除。

用户已于 `2026-07-15T19:43:10Z` 明确批准 aggregate hash `c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3`，`review_status` 已更新为 `approved`，批准 hash 与当前完整树集合一致。本次批准仅关闭人工复审 Gate；尚未执行 audit 归档、生产 converter/CLI/package scripts、第五 vendor registry、domain membership 或生产发布。

## 二、证据边界

| 项目 | 值 |
| --- | --- |
| 上游 | `https://github.com/CharlesQ9/HistAgent` |
| revision | `47bbe21dc81618489f5d5929358032883a3fe448` |
| 来源条目 | 120 |
| 来源集合 hash | `04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02` |
| 新 audit JSON hash | `0f0de44a13204fbbc139ec78b6f9320c4078a786e700f1f5bdcda1688cf36269` |
| 来源/许可/安全结论 | 保持五个 origin、四项 license claim、十项 runtime authority、十六项 external resource、十项 security finding 和五个 AutoGen/Magentic-One 来源文件结论不变 |

Cookie、telemetry、tracked bytecode、未解决 `browser_use`、未核实图片、HistBench/GAIA/HLE、固定 provider credentials 和 benchmark runtime 均未进入预览。能力实现继续采用 independent reimplementation，不复制待核实的上游实现。

## 三、三棵完整树

每棵树固定为八个文件：完整主指令、一个正式入口、共享支持库、两份有明确读取时机的详细 reference，以及 `LICENSE`、`NOTICE`、`DERIVATION.json`。

### 3.1 `histagent-historical-research`

- extensions：baseline + script-assisted + resource-backed + stateful
- 入口：`scripts/research_runtime.py`
- 命令：`init`、`status`、`submit-source`、`submit-layer`、`submit-evidence`、`check`、`render`
- 状态：`state.json` 是 Skill-local SSOT，不具有 ResearchSpec workflow 权限
- 最终产物：`research-report.md`、`evidence-matrix.json`、`provenance.json`

| 文件 | SHA-256 |
| --- | --- |
| `SKILL.md` | `f3a947459670d01fba54975a7ec9e841dd1ee379d1a37ded59ed739d2d84590b` |
| `scripts/research_runtime.py` | `1bf8b39abf4fab11a0e2cd13df594a7e71a10721c69d1b81158a25a5286a6f1c` |
| `lib/historical_support.py` | `f46f1da49ee21d8e0586bc953ab0e7373802cbf631e0821437628d57ef158c91` |
| `references/stage-records.md` | `82639590d7d5f1062ea497005136e5b6d6fb950a44e21f04f7a2379ac5f9fe3b` |
| `references/evidence-and-conflict-cases.md` | `f91b50b40f23f4c15a3a38003d9eee8f59b1756ea9dc636db42b19b8748886b5` |
| `LICENSE` | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| `NOTICE` | `9a0dccaa13485303a74c4922d4b3b6cbd0d46e828fc2b96143bf72b8c6e02b14` |
| `DERIVATION.json` | `5cb4951fe01c69c2ec211ecca830a5c1d5687238d249f76ab035a96d254d4f7f` |

### 3.2 `histagent-historical-source-analysis`

- extensions：baseline + script-assisted + resource-backed
- 入口：`scripts/analyze_source.py`
- 命令：`inspect`、`convert`、`ocr`、`translate`、`transcribe`、`frames`、`vision`、`collate`、`validate`
- 离线核心：TXT/HTML/ZIP/basic OOXML、collation、layer validation
- 可选依赖：`pypdf`、`tesseract`、`whisper`、`ffmpeg`

| 文件 | SHA-256 |
| --- | --- |
| `SKILL.md` | `f021d66c0e6c361bc62a1904d0f570644de9e6959fd7fac9e8645c0208befd60` |
| `scripts/analyze_source.py` | `7a4355ebd86dac2882b4e39ffa89cc468753a3fedaa3faf1e81a7162a2245e3a` |
| `lib/historical_support.py` | `f46f1da49ee21d8e0586bc953ab0e7373802cbf631e0821437628d57ef158c91` |
| `references/adapters-and-formats.md` | `c8eb580edbbd66bd1c235cd2e37a6f85e127e6ad6a7dcfc6fb6ec75792302546` |
| `references/layer-and-collation-cases.md` | `f3553e4f04a8621676577d8f0fe65f1a199ba6450aa091f664a8455ef0f4b002` |
| `LICENSE` | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| `NOTICE` | `9a0dccaa13485303a74c4922d4b3b6cbd0d46e828fc2b96143bf72b8c6e02b14` |
| `DERIVATION.json` | `b095b9b7a1405f158610d0a64d66858a0909bf0a013d564e50efe370933620bb` |

### 3.3 `histagent-historical-source-identification`

- extensions：baseline + script-assisted + resource-backed
- 入口：`scripts/identify_sources.py`
- 命令：`search`、`exact-text`、`literature`、`archive`、`fetch`、`reverse-image`、`verify`、`validate`
- adapter：local-index、SerpAPI、Google Books、Springer、Internet Archive/CDX、HTTP、SerpAPI Lens、显式同意的 HTTP upload
- candidate 状态：`discovered`、`retrieved`、`verified`、`inaccessible`、`rejected`

| 文件 | SHA-256 |
| --- | --- |
| `SKILL.md` | `cff2a73ed49816f9d7093a7062f4dee8037bd319e1239d344614500a1ca229b8` |
| `scripts/identify_sources.py` | `dbaecbf5a5a23ad3fc869e60ea89457e17d54441f13a072a213756032f8c21b1` |
| `lib/historical_support.py` | `f46f1da49ee21d8e0586bc953ab0e7373802cbf631e0821437628d57ef158c91` |
| `references/provider-adapters.md` | `4eda74f31eac16eea956be2a37e645428e48aca4d961e32f572f43c1957bd78f` |
| `references/candidate-verification-cases.md` | `5c5492c102c22e61073af19b048606abcdf30a2bbafb7a6cc75eb0b93a746ce0` |
| `LICENSE` | `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4` |
| `NOTICE` | `9a0dccaa13485303a74c4922d4b3b6cbd0d46e828fc2b96143bf72b8c6e02b14` |
| `DERIVATION.json` | `17720f016ead3670a6f11002cf8f099a7906899b5ff4d18c752181fe4015b9b3` |

## 四、21 项能力映射

| surface | Skill | command | implementation | kind | optional dependency | representative test |
| --- | --- | --- | --- | --- | --- | --- |
| `agent-historical-answer-loop` | research | `submit-evidence` | state-machine | bundled-script | — | `histagent-agent-historical-answer-loop` |
| `agent-historical-orchestration` | research | `status` | state-machine | bundled-script | — | `histagent-agent-historical-orchestration` |
| `archival-web-navigation` | identification | `archive` | internet-archive-cdx-adapter | configured-http-adapter | — | `histagent-archival-web-navigation` |
| `browser-agent-adapter` | identification | `fetch` | http-html-adapter | configured-http-adapter | — | `histagent-browser-agent-adapter` |
| `document-conversion` | analysis | `convert` | stdlib-document-converter | bundled-script | `pypdf` | `histagent-document-conversion` |
| `file-format-processing` | analysis | `convert` | stdlib-document-converter | bundled-script | — | `histagent-file-format-processing` |
| `general-ocr` | analysis | `ocr` | tesseract-adapter | optional-local-tool | `tesseract` | `histagent-general-ocr` |
| `historical-ocr` | analysis | `ocr` | tesseract-transkribus-adapters | optional-local-tool | `tesseract` | `histagent-historical-ocr` |
| `image-source-browser` | identification | `fetch` | http-image-adapter | configured-http-adapter | — | `histagent-image-source-browser` |
| `literature-retrieval-browser` | identification | `literature` | google-books-springer-adapters | configured-http-adapter | — | `histagent-literature-retrieval-browser` |
| `literature-tool-suite` | research | `submit-source` | state-machine | bundled-script | — | `histagent-literature-tool-suite` |
| `local-search-reformulation` | identification | `search` | local-index-serpapi-adapters | configured-http-adapter | — | `histagent-local-search-reformulation` |
| `precise-text-browser` | identification | `exact-text` | http-local-index-adapters | bundled-script | — | `histagent-precise-text-browser` |
| `response-reformulation` | research | `render` | deterministic-renderer | bundled-script | — | `histagent-response-reformulation` |
| `reverse-image-identification` | identification | `reverse-image` | serpapi-lens-http-upload-adapters | configured-http-adapter | — | `histagent-reverse-image-identification` |
| `source-text-inspection` | analysis | `inspect` | stdlib-inspector | bundled-script | — | `histagent-source-text-inspection` |
| `speech-transcription` | analysis | `transcribe` | whisper-cli-adapter | optional-local-tool | `whisper` | `histagent-speech-transcription` |
| `text-web-search` | identification | `search` | serpapi-adapter | configured-http-adapter | — | `histagent-text-web-search` |
| `translation` | analysis | `translate` | libretranslate-adapter | configured-http-adapter | — | `histagent-translation` |
| `video-frame-extraction` | analysis | `frames` | ffmpeg-adapter | optional-local-tool | `ffmpeg` | `histagent-video-frame-extraction` |
| `visual-source-analysis` | analysis | `vision` | provider-neutral-http-adapter | configured-http-adapter | — | `histagent-visual-source-analysis` |

正式 Skill ID 以 `histagent-historical-*` 为前缀；表中 research/analysis/identification 是为便于审阅使用的短名。production policy 保留完整 ID。

## 五、reference 合理性

每棵树只有两份 reference，均由 `SKILL.md` 直接链接并写明读取时机：

- analysis：仅在选择格式/adapter 时读 `adapters-and-formats.md`；仅在准备 layer/collation/variant/emendation 时读 `layer-and-collation-cases.md`。
- identification：仅在选择 provider 时读 `provider-adapters.md`；仅在创建、校验或改变 candidate 状态时读 `candidate-verification-cases.md`。
- research：仅在准备 scope/source/layer/evidence 记录时读 `stage-records.md`；仅在 conflict/limitation/review/synthesis 影响 Gate 时读 `evidence-and-conflict-cases.md`。

主文件保留第一动作、全部命令示例、输入、依赖、五层纪律、外部数据流、凭证、同意、非覆盖、职责、命令级输出、完成条件和失败恢复。reference 不拥有任何唯一的执行关键规则。

## 六、删除项

预览和 authored source 均不再包含：

- `runner.json`、`RUNTIME.json`；
- generic `input.schema.json`、`output.schema.json`；
- `doctor.py`、`validate_result.py`；
- `dependencies.json`、无消费者的 requirements；
- `common-tree/`、`shared-runtime/`、`scripts/_runtime/`；
- 通用 `io-contract.md`、`runtime-and-dependencies.md` 以及三份过短的旧 reference；
- `--payload-file` 和跨 Skill 固定 `ok/result/artifacts/warnings/error/provenance` envelope。

## 七、安全与许可复核

- 完整树由 common non-native validator 校验，并继续执行安全路径、敏感数据、repository import、依赖、import-time I/O 和来源 derivation 检查。
- 转换、预览、check、package、install、discovery、update 和 release verification 只读静态文件，不 import 或执行 Skill Python。
- 外部 adapter 测试只连接 `127.0.0.1` mock；测试凭证通过环境变量注入并验证 Authorization 头；无 `--allow-external-upload` 时 request count 不变。
- 预览中没有实际 secret、Cookie、private endpoint、用户本地路径、固定 provider client、browser launch、telemetry 或 benchmark 内容。
- `LICENSE` 为 Apache-2.0；`NOTICE` 明确独立重构与未复制范围；`DERIVATION.json` 绑定 audit hash、来源 surface 和五项 source evidence。

## 八、验证证据

已通过：

- `openspec validate standardize-non-native-vendor-skills --strict`
- `openspec validate audit-histagent --strict`
- `openspec validate ingest-histagent --strict`
- `pnpm check`
- 聚焦测试：15/15（audit、三棵完整树、common validator、copied-tree、offline、localhost adapters、environment credentials、consent、layer applicability、Gate、deterministic render）
- `pnpm test`：166/166
- `pnpm lint`
- `pnpm build`
- `pnpm release:verify`：npm tarball 验证通过（2,018 files）
- `git diff --check`
- `git -C vendor/histagent status --short`：无输出，pinned submodule clean
- 最终预览复算：三个 tree hash 与 aggregate hash 均未漂移

## 九、复审 hash

| 项目 | SHA-256 |
| --- | --- |
| `histagent-historical-research` tree | `f7d643dd3ad6b638dbedc35c5260ffb92dfaaffccffa0648e0120913d68b8a6d` |
| `histagent-historical-source-analysis` tree | `5c2af41c75fd75bca27c71fec54f72ecfa1f14a28f60d62be9601af4bc6ee5e5` |
| `histagent-historical-source-identification` tree | `f08670d10f115a8699a10915590dbe0f47cd02ae28c7e43215d06be3e42f4c04` |
| aggregate tree set | `c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3` |

旧 aggregate hash `8e01c693570057b2f481c20e8129be1e0c21dae48cd4aab42d3e186a7828c328` 不再对应当前树，任何旧审批均无效。

## 十、人工确认记录

用户已完成三棵完整树的审阅，并明确批准 aggregate hash `c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3`。审批记录写入时间为 `2026-07-15T19:43:10Z`；`approved_tree_set_sha256` 与 `tree_set_sha256` 完全一致，`ingest-histagent` 任务 7.5 已完成。后续 audit 归档与生产准入仍是独立执行阶段，本次未自动启动。
