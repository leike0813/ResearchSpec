# Education Agent Skills 增量审计 — snapshot-6bbbce4

审计日期：2026-10-01。上游确有更新。本次完成上游差异审计和受影响程序的语义审阅，建议吸纳两项教育内容更正。生产更新尚未实施；本目录是候选版本的审计记录，当前生产锚点仍为 `snapshot-32fce5c`。

## 上游身份与范围

| 项目 | 基准 | 候选 |
|---|---|---|
| 完整 revision | `32fce5c0d097ec675cf81c750a65a379e4d87e3c` | `6bbbce418f82e11044009c9f3b7373a354de5bd0` |
| Git tree | `3223d79299ae10391c22549debef7ffc9ef7a0e2` | `b90188569a783ba7d20dcffe2db7a55816db7c0b` |
| tracked files | 238 | 241 |
| 上游 Skills | 165 | 165 |
| 已准入 Skills | 136 | 沿用现有准入集合评估，未扩大 |

仓库：[GarethManning/education-agent-skills](https://github.com/GarethManning/education-agent-skills)。候选是检查时默认分支 `main` 的 HEAD，最后提交日期为 2026-08-28T23:22:05+02:00。远程 HEAD 在审计期间复查仍指向同一 revision。

基准是候选的祖先，范围内有五条提交记录（包括一次 merge）：

- `34702c1`：Clarify Creative Commons licence。
- `4be2795`：Correct Bastani evidence attribution。
- `02a4d31`：secure hosted MCP contracts。
- `b2ac372`：generated registry byte-for-byte sync。
- `6bbbce4`：合并 hosted MCP security repair。

净差异为 40 个路径：新增 4、删除 1、修改 35；2,556 行新增、1,058 行删除。新增为 `LICENSE`、`mcp-server/src/request-body.ts`、`mcp-server/src/skill-validation.ts`、`mcp-server/tests/oauth-handlers.spec.ts`；删除为 `mcp-server/src/tool-registry.ts`。没有 Skill 新增、删除或重命名。

完整的 40 文件旧新 SHA-256、165 个 Skill 的来源比对、136 个 capability 映射、现有生产文件哈希及证据变更收录在 [incremental-audit.json](artifacts/incremental-audit.json)。SHA-256 对 Git blob 原始字节计算，不使用检出时间或上游生成时间判断变化。

## 受影响能力

| 上游 Skill | raw Skill | extension capability | 影响 |
|---|---|---|---|
| `student-learning/unassisted-evidence-checkpoint` | `education-agent-skills-unassisted-evidence-checkpoint` | `plugin-education-agent-skills-unassisted-evidence-checkpoint` | 描述、版本、证据标签、Bastani 引用与解释、成功反馈 |
| `student-learning/weekly-agency-review` | `education-agent-skills-weekly-agency-review` | `plugin-education-agent-skills-weekly-agency-review` | 一处表现差距的解释 |

另外 163 个上游 Skill 与基准逐字节相同，包括其余 134 个已准入 Skill 和 29 个被排除 Skill。两个变更 Skill 的输入声明、证据捕获字段和 `chains_well_with` 均保持一致；现有六字段 brief、validator、单节点 profile 和三个领域归属没有新增需求。

`unassisted-evidence-checkpoint` 将证据强度由 `strong` 改为 `moderate`，明确独立检查是从研究推导的教学设计，研究没有检验该检查协议；成功反馈限定为本次独立表现。`weekly-agency-review` 将表现差距作为调整学习策略的线索。具体 preserved / adapted / gap 判定见 [05-semantic-review.md](05-semantic-review.md)。

## 其他变化与吸纳边界

| 范围 | 观察 | 对 ResearchSpec 的处理 |
|---|---|---|
| 根 `LICENSE`、根 `package.json` | 新增署名 Gareth Manning 的 CC BY-SA 4.0 通知，包许可字段由 ISC 改为 CC-BY-SA-4.0 | 新许可证补充来源授权证据；继续分发既有完整法律文本与 attribution/修改披露，不以通知替代完整许可 |
| `registry.json` | 更新时间；独立检查的描述、证据强度和标签同步 | 核对来源一致性；ResearchSpec 准入和领域 SSOT 仍是自有审阅记录 |
| `mcp-server/src/skills.json` | 13 个原为空的 student-learning prompt 补齐；两个变更 Skill 的元数据/正文同步 | 上游生成缓存，仅审计；完整 raw Skill 本来已承载这些程序，不产生 13 个新的 capability 变化 |
| MCP OAuth、HTTP auth、API | 加密授权码/refresh token、PKCE、redirect 白名单、token 撤销、请求体限额、配置缺失时拒绝服务、响应和限流加固 | 服务实现全部保持排除，本次没有运行这些代码，也没有认证托管服务安全性 |
| MCP server/loader/types | 校验 bundle；12 个禁止模型调用的 Skill 不作为 Skill tool 注册 | 属于上游服务投影；153 个 Skill tools 加 4 个发现工具共 157，全部 165 个仍提供 prompt；不改变 ResearchSpec Procedure 权限 |
| 两套 package/lock | Playwright/YAML、MCP SDK/Zod 及开发工具版本变化 | 仅记录，不进入 ResearchSpec 依赖或安装流程 |
| `scripts/validate-skills.py`、新增 TS validator | 加强输入字段、路径身份、证据标签和重复项检查 | 上游维护逻辑；不执行或打包，现有 ResearchSpec 契约独立验证 |
| `.github/workflows/validate.yml`、Playwright 配置和测试 | 增加构建、测试、依赖审计与 bundle 一致性校验 | 仅审计，不运行上游测试或 CI |
| 根 README、6 个 `docs/` 文件、MCP README | 访问入口、认证配置和隐私说明更新；builder brief 同步教育解释更正 | 只作为参考；不带入 MCP 访问、邮件投递、凭证或学员数据处理 |

根许可证没有解决嵌入框架来源或 Sean Hu 内容的独立授权问题。19 个 original-framework 排除项和 10 个第三方作者排除项继续维持；本轮无准入扩张。

## 证据映射的增量

两个 Skill 各有 5 条证据声明，均因源文件 SHA-256 变化需要在新版本记录中重新绑定；共 10 个 evidence ID。其中只有 `evidence-0768` 的引用文本变化，继续指向已经验证存在的 `work-0317`，不新增作品。其余 862 条声明及其来源未变。

两个 Skill 的 9 条 advisory relationship 文本与目标未变，其来源哈希需要同步；另 804 条关系未受影响。新版本记录可继承既有存在性结论，但不能把上游 `moderate` 标签转成 ResearchSpec 的 claim-support 结论。

本轮对照 [PNAS 论文](https://www.pnas.org/doi/10.1073/pnas.2422633122) 的 Experimental Design、Main Results 和 Discussion，核对了具体结果和短期适用范围，详见语义记录。这是有范围的补充审阅；没有修改旧版 `evidence-map.json` 或其 `claim_support_reviewed` 字段，也没有重审其他作品。

## 生产更新前需要处理的维护问题

1. **新版本不满足现有来源绑定。** `src/vendor-converters/education-agent-skills/policy.ts`、`src/vendor-audits/education-agent-skills.ts`、生产 policy/review decision、证据映射及维护 catalog 固定旧 revision、tree 和审计哈希。旧 `review-decision.json` 只批准既有 aggregate tree，不能用于候选版本。
2. **直接改全局版本会破坏未变包保真。** `adaptation.ts` 的 `normalizeFrontmatter` 将全局 release 写入每个 raw Skill；`complete-tree.ts` 的 `renderNotice` 将全局 release/revision 写入每份 NOTICE。136 个 raw Skill 的哈希会一起改变，再经扩展 manifest 的 raw hash 扩散到 136 个包。增量更新应保留未变 Skill 的受审来源身份，只更新两项变更程序；先在隔离预览中证实另外 134 个扩展包不变。
3. **扩展生成器固定旧锚点。** `scripts/generate-education-agent-skills-extensions.mjs` 的 catalog 输出仍固定 `snapshot-32fce5c`、旧 revision 和旧 audit 路径。只手改 catalog 后再运行 `artifacts` 会被写回旧身份。更新时应复用 vendor bundle 的来源信息生成 catalog，保持一个事实源。

这三项是后续吸纳工作的实现范围，不影响本次上游差异审计的完成。当前代码/文档对于仍 pin 的旧版本一致；更新 pin 时应同步 `AGENTS.md`、维护 Skill、审计目录 README 和 `docs/maintainer/vendors/education-agent-skills.md` 的当前来源描述，旧版不可变记录保持原样。

## 验证与固化状态

已通过：

```bash
node scripts/education-agent-skills-maintenance.mjs check snapshot-32fce5c
node dist/src/vendor-audits/education-agent-skills-cli.js check
node dist/src/vendor-evidence/education-agent-skills/cli.js check
node dist/src/vendor-converters/education-agent-skills/cli.js check
pnpm check
```

另外逐项核对全部 136 个生成 raw 正文可恢复成旧版上游正文、全部 136 个扩展正文保留 reviewed raw 正文；忽略大小写的流程模式扫描有 1 处课堂教学示例命中，已在语义记录解释。机器审计工件重新计算 Git 差异及全部记录哈希，检查计数、映射和生产文件保真。

本轮只新增审计文档与 JSON，没有修改源码、依赖、现有生成物或子模块 HEAD，因此未运行全量测试、lint 或生成命令。`artifacts / records / baseline` 操作属于吸纳后的生产固化：它们读取当前 pin，直接对候选目录运行会记录旧上游，不能据此宣称新版本已完成。候选目录没有生产 `manifest.json`，也没有伪造 02–04 的吸纳、转换或验证通过记录。

## 后续转换范围与确认项

建议后续先解决上述来源保真和 catalog 单一事实源问题，再更新子模块 pin、新版不可变审计/证据绑定、生产 policy 和受审预览。实际语义变化限于上述两个 raw Skill 与两个 extension package；profiles、validator、知识资源集合和领域成员保持现有契约。候选 aggregate tree 应重新接受审阅，然后才运行 Skill 的生成、相关测试及 baseline/check。

本次审计没有需要用户补充才能判断的歧义。生产切换与新 aggregate tree 审批属于后续吸纳阶段，不由本记录授予。
