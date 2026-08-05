# Revision-Master `snapshot-13e69610` 审计报告

## 一、审阅结论

本报告是面向维护者的不可变证据，把已吸收的 `revision-master` Skill 锚定到上游 `leike0813/agent-skills` 的提交 `13e69610f216f816f106d1a2a1672eedfa01ac9a`，并冻结未来 `ingest-revision-master` 的设计边界。

本 change 不创建 converter、生产 Skill、注册表条目、domain membership、package command、provider 集成或运行依赖。它只为已存在的 `skills/review-response/` 提供可重现的 source-provenance 锚点，并约束未来增量更新时的设计与运维边界。

固定树覆盖上游 `skills/revision-master/` 子目录下 57 个 tracked entries（含 9 个 tree entry 与 48 个 blob entry）。Blob 文件总字节数 567,926。每条 blob 给出 path / size / SHA-256（working-tree 字节），按 Git byte-order 排序后拼接为 UTF-8 清单，再 SHA-256 一次得到 `tracked_entry_set_sha256 = 9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a`。清单与机器 SSOT 一致；外部重算只需同样按字节序拼接即可复现。

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
| 源 ID | `revision-master` |
| 源名称 | `revision-master` |
| 上游仓库 | `https://github.com/leike0813/agent-skills` |
| 子路径 | `skills/revision-master` |
| 快照 | `snapshot-13e69610` |
| 完整 revision | `13e69610f216f816f106d1a2a1672eedfa01ac9a` |
| 根 tree SHA | `0716e9227ee92273fd6016f166672cb13bbbb2fb` |
| tracked entries | `57` |
| blob 文件数 | `48` |
| blob 总字节数 | `567,926` |
| 上游 Skill 数 | `1` |
| 内容来源数 | `1` |
| 许可声明数 | `1` |
| 运行权限数 | `4` |
| 外部资源数 | `0` |
| 安全发现数 | `6` |
| 派生清单 hash | `9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a` |

源文件处置统计：

| 处置 | 数量 |
| --- | ---: |
| `retain`（保留） | 48 |
| `adapt`（适配吸纳） | 0 |
| `replace`（等价重构） | 0 |
| `exclude`（排除） | 0 |
| `confirmed-failure`（已确认失败） | 0 |

按 kind 分布：

| Kind | 数量 |
| --- | ---: |
| `skill-instructions` | 1 |
| `reference` | 10 |
| `render-asset` | 25 |
| `schema` | 1 |
| `localization` | 3 |
| `script` | 8 |

> 说明：本审计将所有 48 条 blob 标记为 `retain`，因为其内容在上游阶段就是合法、自洽、可直接吸纳的产物；`skills/review-response/` 中已发布的字节相对上游所做的全部"重命名、改写、扩段"动作通过 7 条 `adaptations` 记录在 `capability-audit.json` 的 `adaptations` 数组中以段级概括登记，不重复计入 disposition 统计。

## 三、审计政策

| 政策 | 机器值 | 人类可读结论 |
| --- | --- | --- |
| `audit_is_admission` | 否 | 本审计不是生产准入；生产准入已由 `2026-08-05-absorb-revision-master-core-skill` 承担。 |
| `future_change` | `ingest-revision-master` | 未来增量更新只能由该独立 change 承担；本次 change 仅补证据，不重写产品。 |
| `source_has_upstream_skills` | 是 | 上游有 1 个 Skill：`revision-master`。 |
| `generated_production_skills` | 是 | 已在 `skills/review-response/` 发布；本审计不重新生成。 |
| `converter_executes_upstream_content` | 否 | maintainer converter 只比较字节，不导入或执行 Python。 |
| `parallel_ingest_preparation_allowed` | 是 | 允许并行准备未来 ingest 工作。 |
| `production_requires_audit_validation` | 是 | 任何未来增量更新必须先通过本审计的 `tracked_entry_set_sha256` 校验。 |
| `production_requires_hash_bound_human_review` | 是 | 任何未来增量更新必须对完整生成树做 hash-bound 人工审阅。 |
| `access_control_owned_by_host` | 是 | 实际访问控制由目标 Agent/宿主负责。 |
| `culture_specific_policy_added` | 否 | 不新增文化敏感材料规则。 |
| `tool_domain_membership` | 否 | review-response 不加入任何工具域。 |
| `anzsrc_field_creates_membership` | 否 | ANZSRC Field 只作审计元数据，不自动产生 domain membership。 |
| `domains` | `[]` | review-response 不属于任何 ANZSRC discipline domain。 |

## 四、内容来源与许可

### 4.1 内容来源

| 来源 ID | 类型 | 代表性范围 | 许可状态 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- |
| `agent-skills-root` | 上游作者自著 | `skills/revision-master/**` | 不明确；上游根 LICENSE 缺失、子目录无 LICENSE，唯一署名是 commit author `Joshua Reed <leike0813@gmail.com>` 2026-06-01；该作者与 ResearchSpec contributors 为同一主体 | 保留 | 上游无显式 LICENSE 文本；同作者身份使派生成立。published `LICENSE` 沿用 `MIT, copyright 2026 ResearchSpec contributors` 写法，并在 `NOTICE` 中显式记录 "upstream author equals ResearchSpec contributors" 以防未来审计者误读。 |

### 4.2 许可声明

| 声明 ID | 表达式 | 状态 | 范围 | 证据 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `root-mit-absent` | `MIT` | 隐式 | `skills/revision-master/**` | 上游根 LICENSE 缺失；子目录无 LICENSE；commit author 与 ResearchSpec contributors 同一 | 保留 | 同作者身份支撑派生；published `LICENSE` 文本与上游风格一致（MIT）。 |

根仓库许可与逐文件来源是两个不同维度：上游无根 LICENSE 文件，且无显式 Skill 级 license grant；同作者归属是允许派生的充分理由，但不是上游"明示授权"。

## 五、运行权限与外部资源

| 权限 ID | 类型 | 显式调用授权 | 宿主策略控制 | 证据 | 处置 | 审阅结论 |
| --- | --- | --- | --- | --- | --- | --- |
| `python-stdlib` | 语言运行时 | 是 | 是 | `scripts/*.py` 头部 imports 仅 argparse / sqlite3 / dataclasses / hashlib / json / os / pathlib / re / sys / textwrap / typing | 保留 | 纯标准库，不引入第三方包到运行入口。 |
| `pyyaml` | 库运行时 | 是 | 是 | SKILL.md `第三方运行时依赖` 段 | 声明第三方依赖 | gate-and-render 视图渲染所需；ResearchSpec 不自动安装，缺失时脚本返回结构化阻断错误。 |
| `jinja2` | 库运行时 | 是 | 是 | SKILL.md `第三方运行时依赖` 段 | 声明第三方依赖 | 同上。 |
| `sqlite3` | 数据运行时 | 是 | 是 | scripts/workspace_db.py schema | 保留 | Skill-local 工作空间 DB；ResearchSpec 控制面授权不绑定其上。 |

外部资源：**0 条**。审计已逐文件 grep `urllib`、`requests`、`httpx`、`socket`、`http.client` 等外部访问入口，未发现命中。

显式调用未来 Skill 只表示用户授权其使用已配置 provider 与任务材料；浏览器、网络、文件系统、模型、上传和命令执行仍由目标 Agent 与宿主策略控制。

## 六、安全发现

| 编号 | 结论 | 证据 |
| --- | --- | --- |
| `no-credentials` | clear | 全部 48 条 blob 不含硬编码 token / API key / 凭据 |
| `no-network` | clear | scripts/*.py 不使用 `urllib` / `requests` / `httpx` / `socket` / `http.client` |
| `no-subprocess` | clear | scripts/*.py 不使用 `subprocess` / `os.system` / `os.popen` |
| `no-browser` | clear | scripts/*.py 不引入浏览器自动化库 |
| `no-telemetry` | clear | 全部 48 条 blob 不含遥测 / 用量上报 |
| `no-pii-or-sensitive-payload` | clear | 不含 Cookie、embedded key、private endpoint、local user path |

## 七、已声明的 adaptations

`capability-audit.json` 的 `adaptations` 数组登记 7 条已应用的派生决策：

| 编号 | 类型 | 摘要 |
| --- | --- | --- |
| `skill-rename` | renamed | `revision-master` → `review-response`，DB 与脚本路径同步 |
| `instance-root-paths` | renamed | 上游 artifact-root 改为 ResearchSpec subflow 布局 (`work/review-response/`、`skills/review-response/scripts/`、`views/`) |
| `researchspec-control-plane` | added | SKILL.md 新增 `ResearchSpec 控制面边界` 段 |
| `control-projection` | added | gate-and-render 增加只读 diagnostic control projection + 漂移阻断 |
| `schema-renamed` | renamed | `revision-master-schema.yaml` → `review-response-schema.yaml`，含表名/键名同步重命名 |
| `third-party-runtime-tone` | softened | 删除 `conda run --no-capture-output -n DataProcessing` 模板；缺失 PyYAML/Jinja2 改为结构化阻断错误 |
| `review-comment-coverage-appendix` | added | Stage 3 覆盖率硬阈值 / soft 阈值 / span_role 三分类的语义被声明为 Stage 3 canonical 输出 |

> 详细差异见 `capability-audit.json` 的 `adaptations[*].evidence` 字段。每条以段级概括登记，未做行号级标注（与 paper-humanizer 模式一致）。

## 八、未来 ingest 边界

- 任何未来上游 push 新 revision（即 `13e69610` 之后的新 commit）必须：
  1. 新增 `audits/revision-master/snapshot-<new-sha>/{capability-audit.json, report.md, _set_manifest.txt}`
  2. 同步更新 `vendor/revision-master/SOURCE.json` 的 `commit` 与 `snapshot` 字段
  3. 同步更新 `skills/review-response/metadata.json` 的 `source_commit` 与 `source_snapshot` 字段
  4. 通过 `revision-master:check` 与 `revision-master:idempotence` 验证源-产物字节对应关系
  5. 接受 hash-bound 人工 review，确认 adaptations 数组仍合理后，才能提交 `ingest-revision-master` change
- 不允许把上游脚本作为 ResearchSpec 运行时直接调用；ResearchSpec 仅以文件形式持有它们。
- 不允许把上游 `revision-master-schema.yaml` 原名发布；本仓库固定使用 `review-response-schema.yaml`。

## 九、迁移计划

1. 已存在：静态 vendor snapshot (`vendor/revision-master/{SOURCE.json, upstream/}`)
2. 已存在：审计证据 (`audits/revision-master/snapshot-13e69610/{capability-audit.json, report.md, _set_manifest.txt}`)
3. 已存在：Skill 元数据 (`skills/review-response/metadata.json`)
4. 已存在：maintainer converter (`src/vendor-converters/revision-master/cli.ts`，暴露 `pnpm revision-master:{convert,check,idempotence}`)
5. 后续 `ingest-revision-master` 增量更新时，复用上述四件基础设施。

回滚本 change 会移除审计目录、`vendor/revision-master/` 目录、`skills/review-response/metadata.json`、`src/vendor-converters/revision-master/`、`package.json` 的三条 scripts、`tests/revision-master-audit.test.ts`、`NOTICE` 与 `AGENTS.md` 中的对应条目。已发布的 `skills/review-response/SKILL.md`、`assets/`、`references/`、`scripts/`、`LICENSE` 不被本 change 修改；其功能行为与本审计解耦。

## 十、开放问题

无。未来 `ingest-revision-master` 的具体文件级改动策略、上游新 commit 的精确字节对照清单、scripts 字节差异的逐行审定均属于后续 change，不在本审计的范围。