# ResearchSpec 项目现状审查报告

审查日期：2026-09-05。代码基线：`44825bc`（`chore: repo cleanup`）。

本次是开放式、只读审查，覆盖产品模型、graph runtime、CLI、安装与卸载、生成维护、测试、打包和文档。检查采用源码阅读、原生子代理交叉探索、现有测试及隔离临时项目复现。未修改实现、依赖、规格或审计基线，未执行发布。本文是审查记录，不是新的产品规则。

## 总体判断

项目已经具备清楚的架构方向：文件接口、宿主中立、语义产物与流程状态分离、显式人工 Gate、生成物归属保护。这些边界值得保留。189 个 TypeScript 源文件约 28,289 行，八个直接运行时依赖，尚不能据此认定框架本身过度设计。

目前最需要投入的是完成现有工作流和安装链路的正确性收口。测试虽全部通过，但仍复现了“所有节点完成而 run 永远 active”和“能力必需输入缺失仍能推进”。安装清单的路径信任也存在项目外删除风险。与此同时，发布规程、部分主规格和对外说明仍停留在旧模型。这使项目呈现出“局部合同很细，跨模块合同尚未真正接上”的状态。

我的建议是暂缓扩充能力目录，先解决下面的高优先级问题，再完成一次符合当前模型的完整用户演练。

## 检查结果与边界

| 检查 | 结果 |
| --- | --- |
| `pnpm check` | 通过 |
| `pnpm lint` | 通过 |
| `pnpm exec tsc -p tsconfig.test.json`，随后 `node scripts/run-tests.mjs` | 308 项通过，0 失败、0 跳过，约 181 秒；执行的是现有全套测试，未运行清理步骤 |
| `openspec validate --specs --strict --no-interactive` | 49 项通过，存在要求文字过长的信息提示 |
| `pnpm exec tsc -p tsconfig.build.json` | 通过 |
| `node scripts/generate-docs.mjs --check` | 通过；这只证明其负责的生成内容未漂移 |
| `npm pack --dry-run --ignore-scripts --json` | 成功取得包清单；5,395 个条目，预计压缩 33,592,501 字节，解包 107,831,488 字节 |
| 独立临时项目的真实编译 CLI | 复现 run 完成状态和能力输入问题；复现过期规格参数被拒绝 |
| 项目外路径规划样例 | manifest 被接受，生成项目外 `remove-owned` 操作；没有执行删除 |
| `git diff --check` | 通过；形成本文前工作区仍干净 |

未运行 `release:verify`，因为它会安装临时 npm 依赖；未安装网站依赖或构建网站，未验证托管 CI、真实宿主 Agent 学术质量、外部服务及法律授权。打包 dry-run 和源码编译 CLI 检查不能替代真实安装包验收。测试和编译产生了被忽略的 `dist/`、`.test-dist/`；复现材料保留在 `/tmp/researchspec-audit-smoke-dWMz3u/`。

## 优先处理的缺陷

### 1. 高：安装清单可以让插件清理规划越出项目目录

**证据与复现。** [ManagedInstallationSchema](../../src/adapters/installations.ts) 第 50–60 行只要求 `target.path` 为非空字符串。插件清理在 [graph-delivery.ts](../../src/plugins/graph-delivery.ts) 第 267–297 行直接用 `path.resolve(projectRoot, target.path)` 读取文件，hash 相等即创建 `remove-owned`。

隔离样例将项目根设为临时目录下的 `nested/`，提供一个 `scope: project`、`path: ../report.md` 的 plugin-profile 记录及该合成文件的正确 hash。结果为：

```json
{
  "schemaAccepted": true,
  "diagnostics": [],
  "operations": [{"action": "remove-owned", "path": "/tmp/researchspec-audit-smoke-dWMz3u/report.md", "scope": "project"}],
  "targetStillExists": true
}
```

**影响。** 当清单被篡改或来自不可信工作区，插件卸载、更新的清理路径可能把项目外普通文件认作托管文件。攻击者需要构造记录并知道目标内容的 hash；hash 相符本身不能证明文件归属。此次验证止于规划，没有删除任何目标。

**建议。** 在清单进入系统时校验 scope 对应的路径规则，在写入/删除边界再次确认目标位于允许的投影根内，并覆盖父目录符号链接。可复用现有安全路径处理方式，但交付物路径校验排斥 `researchspec/`，不能原封不动套到合法的托管 profile 路径上。

### 2. 高：图执行完成后，run 的持久化状态没有完成

**证据与复现。** 通过公开 CLI 初始化临时项目，启动 `profile:minimal`，依次推进 `rq`、`report`；两次 `advance` 均返回成功。最终：

```text
两个 node.state              complete
status.frontier             []
status.runs.active          1
instructions run:...        completion_ready: true
run.yaml.status             active
check all --strict          成功，无诊断
```

[submitGraphNode](../../src/core/runtime/graph-run.ts) 第 493–509 行仅写 node 文件；第 742 行起的 `graphRunCompletionReady` 只派生完成条件。与[用户模型](../../docs/user/usage-model.md)第 222–225 行“最后一次合法推进写入完成状态”的要求不符。

**影响。** 完成的运行继续占据 active 列表，新会话无法仅凭持久化生命周期判断工作结束；完成状态与后续 mutation 的 active 判定也未收口。不要据此推断所有推进都会死锁：部分父子推进依赖派生状态，仍可能继续工作。

**建议。** 在合法状态变更的共同路径处理完成状态，明确终点可能是 capability、Gate、Decision 或 child 完成。扩展现有完整旅程，断言重启进程后 `run.yaml.status` 与完成条件一致；无需新增公开 `finalize` 命令。

### 3. 高：能力清单的必需输入没有被图合同和推进校验落实

**证据与复现。** [generation-report-compilation/manifest.yaml](../../skills/capabilities/generation-report-compilation/manifest.yaml) 第 11–19 行要求 `synthesis_report` 和 `methodology_blueprint`。但 [minimal profile 源](../../src/arsu-converter/workflow/graph-profiles/minimal.ts) 只绑定 `rq_brief`；[research-main profile 源](../../src/arsu-converter/workflow/graph-profiles/research-main.ts) 第 87–95 行也只提供 `synthesis_report`。

上述 CLI 复现中，`instructions node:.../report` 同时返回两种不一致的事实：manifest 标记两个必需输入，`resolved_inputs` 却仅有 `rq_brief`。随后 `advance` 仍然成功。

[validateGraphAgainstCapabilityRegistry](../../src/capabilities/registry.ts) 第 214–225 行检查能力标识和 registry version；[submitGraphNode](../../src/core/runtime/graph-run.ts) 第 458–485 行校验输出并向 validator 提交 outputs，没有将必需输入绑定的完整性接入该路径。

**影响。** 类型和 hash 全部正确，也可能运行一张无法给能力提供所需材料的图。Agent 会收到彼此冲突的 instructions，容易自行补材料或在证据不足时继续。这里的问题是可检查的 role 合同缺口，无需让引擎判断论文质量。

**建议。** 先对齐 profile authoring 与能力输入定义，再在 graph 准入和实际消费处验证 required role、来源及显式映射。对确需简化的 quick 路线，应明确其真实能力合同，不能静默忽略 required 输入。

### 4. 高：插件选择、投影与所有权清单分开提交

**代码确认，未做磁盘故障注入。** [graph-plugins.ts](../../src/cli/handlers/graph-plugins.ts) 第 99–101、131–133 行先提交投影，再写 config，最后写 manifest。第 244–246 行使用普通 `writeFile` 更新配置，没有旧字节前置条件或失败回滚。

**影响。** 投影成功后若 config/manifest 写入失败，实际文件、用户选择与所有权记录会不一致。尤其卸载已经移走文件时，稍后的错误不能由前一个已经完成的写计划恢复。并发修改 config 也可能被旧扫描结果覆盖。

**建议。** 复用 [graph-bootstrap.ts](../../src/cli/handlers/graph-bootstrap.ts) 第 63–87 行已有的写计划，将 config、manifest 和投影纳入同一错误处理及旧字节校验范围。无需另建事务框架。单文件原子 rename 与跨文件进程崩溃一致性是不同保证，文档应准确说明实际达到的边界。

## 验证与文档问题

### 5. 高：宣称的完整用户验收，与实际覆盖仍有距离

现有 graph 单元测试有价值：分支、轮次、Gate、冲突和路径已有覆盖。但 [graph-run-advanced.test.ts](../../tests/graph-run-advanced.test.ts) 第 166–171 行只检查派生 ready 和空 frontier，没有检查持久化 run 完成状态，因此第 2 项缺陷可以长期保持测试全绿。

[graph-cli-main.test.ts](../../tests/graph-cli-main.test.ts) 名称包含“packaged CLI”，实际 helper 在 [tests/helpers/cli.ts](../../tests/helpers/cli.ts) 第 6 行启动源码编译的 `.test-dist/src/cli/bin.js`。真实 tarball 验证另有实现，不过 [verifyInstalledCurrentJourney](../../scripts/verify-package.mjs) 第 588–635 行也仅完成 `minimal` 首节点、检查下一 frontier，没有完成整张图。

**建议。** 保留有界单元测试，把已有 CLI 旅程延伸到真正结束；让一条完整的 root/child/Gate/Decision/重复轮次/恢复旅程能够针对实际安装包执行。准确命名源码编译测试和 tarball 测试。不要靠增加更多 Skill 文案断言弥补行为覆盖。

### 6. 中：发布规程、主规格和安全说明没有同步到当前模型

这些是现行入口中的漂移，不是上游历史文本：

| 位置 | 当前问题 | 后果 |
| --- | --- | --- |
| [dogfooding 规程](../../playbooks/dogfooding/README.md)第 16–20 行 | schema 1、`control.yaml`、逐个确认 child/round | 与根 run 授权冻结图的新模型相反，可能误判验收 |
| [dogfooding 场景](../../playbooks/dogfooding/scenarios.yaml)第 202–216 行 | 提示和硬断言仍要求 child 独立确认 | 照本执行会验证另一个产品合同 |
| [发布流程](../../docs/maintainer/release-process.md)第 41、53–55 行 | 固定 Skill 数量过期，并继续引用旧演练要求 | 发布签收依据不可靠 |
| [插件增强主规格](../../openspec/specs/agent-plugin-augmentation/spec.md)第 32–34 行 | 要求 `--expected-plan-sha256` | 真实 CLI 返回 exit 2、`usage_error`：未知参数 |
| [安全说明](../../SECURITY.md)第 19–20 行 | Codex 全局 prompts、“registered artifacts”旧模型 | 错述安装范围与导出边界 |
| [网站 Skills 指南](../../website/docs/guides/skills.md)第 41、48 行 | pipeline 未完全实现、四个 Companion | 与当前五个 Companion 及 graph 实现不符 |
| [维护合同说明](../../docs/maintainer/arsu-contract-anchor.md)第 14 行 | 仍指定 subflow `control.yaml` | 误导未来 converter 维护 |

49 份主规格严格校验、生成文档检查以及 dogfooding 测试均通过，仍不妨碍这些问题存在。检查验证的是各自结构或生成关系，不能代替语义审查。

**建议。** 以当前用户模型完成一次明确的文档/规格收口，优先更新发布演练和安全说明。删除过期参数要求，不应为了满足旧规格重新引入不需要的 plan hash。重复的产品规则尽量引用权威文档，避免通过越来越多字符串断言维护多份副本。

## 维护与产品建议

### 7. 中：二进制文件被当作 UTF-8 文本计算维护 hash

[tooluniverse-maintenance.mjs](../../scripts/tooluniverse-maintenance.mjs) 第 19–24 行先 `readFileSync(path, "utf8")` 再 hash；其 tree/inventory 路径会处理包含 PNG 的上游文件集合。相邻的 [Scientific 维护脚本](../../scripts/scientific-agent-skills-maintenance.mjs) 第 20–21 行已使用原始 Buffer。

不修改仓库即可证明此转换有损：`Buffer.from([0x80])` 和 `Buffer.from([0x81])` 解码后都是替代字符，文本 hash 相同，原始字节 hash 不同。

**影响与建议。** 该字段不能被当成逐字节内容身份；这不等于所有审计防护都失效，Git revision/clean 检查等仍存在。统一采用 Buffer hash，并用一个二进制样例验证此稳定行为。历史基线需要通过对应维护流程解释和更新，不能直接批量覆盖。

### 8. 中：维护脚本已有可以收敛的重复，并出现实际分叉

六个 vendor maintenance 脚本合计 4,060 行，每份约 670–685 行，重复包含文件 hash、清单遍历、records、baseline、check 和报告流程。第 7 项中，一份使用 Buffer、一份仍用 UTF-8，已经体现共同修复容易遗漏的成本。

另有 [arsu-maintenance.test.ts](../../tests/arsu-maintenance.test.ts) 第 7–25 行直接断言 Skill 中文短语、模式名称及命令文本。这与用户要求“Skill 测试主要针对脚本逻辑，不静态锁定指令文本”不一致。

**建议。** 提取有限的共同文件处理与维护流程，保留各 vendor 的准入、许可和语义政策独立。先统一有真实分叉的行为，避免做通用插件框架。测试复用表格驱动入口；保留有准入意义的身份/数量检查，删除只保护措辞和标题的断言。

### 9. 中：没有安装插件的 workspace，也为全扩展目录付出状态读取成本

[graph-status.ts](../../src/plugins/graph-status.ts) 第 24–36 行即使 `selected` 为空也加载 extension registry；[extensions.ts](../../src/plugins/extensions.ts) 第 127 行起逐个加载、解析和校验能力资源与 profiles。

全套测试结束后，在无插件、无 run、无 Agent 投影的独立 workspace，两次进程调用得到：

| 命令 | 耗时 |
| --- | --- |
| `status --json` | 2,298 / 2,075 ms |
| `instructions profile:minimal --json` | 470 / 451 ms |
| `check all --strict --json` | 457 / 451 ms |

这只是本机两次抽样，不能当成跨平台基准。不过 `status` 位于每轮工作协议入口，未使用的 332 个扩展包会放大交互延迟。

**建议。** 发现阶段读紧凑元数据，当前选中能力按需加载；完整资源核验留给明确的检查和实际消费边界。先减少无关读取，再决定是否需要缓存。

### 10. 中：能力数量和分发规模已显著超过当前验收证据

registry 中已有 47 个核心能力包、332 个扩展能力包与 332 个扩展 profiles。打包 dry-run 预计约 33.6 MB 下载、107.8 MB 解包，其中 `literature-adapters/` 占约 56.2 MB，`skills/` 占约 49.8 MB。选择“可选插件/Adapter”影响的是 workspace 投影，安装 CLI 时仍下载整个 bundle。

这不是立即拆包的理由：静态、离线、固定来源的分发有明确价值。但应向用户准确说明“可选”的边界，并以实际下载、存储或启动成本决定是否分包。

另外 [package.json](../../package.json) 第 18–24 行只排除了两个 vendor converter 编译目录；dry-run 仍包含其它维护 converter。先核对运行时 import 闭包，再排除确无运行需求的维护入口。不能直接删掉所有 converter 目录，因为部分运行时代码可能仍复用其中模块。

**更重要的产品判断。** 结构完整、出处 hash 和内容保留率，不能证明宿主 Agent 能正确执行学术任务。[能力覆盖报告](../generated/capability-parity-report.json) 将 47 个能力全部标为 operational，而[发布清单](../release/mvp-release-checklist.md)仍没有签收真实演练。下一轮投入应优先完成一条小而真实的研究—写作—评审—修订闭环，记录人工介入次数、恢复成功率、证据质量和交付可用性，再决定继续吸收哪些能力。

## 次要观察与未验证事项

- README 第 62 行笼统声称上游代码不直接分发、所有 Skill 文件均重新创作；项目实际同时包含保留上游文本、复制审查资源、重新创作三种方式。应按真实转换类型描述，避免夸大原创范围。这是内容准确性意见，不是法律结论。
- 网站没有受 Git 管理的独立 lockfile，也未纳入 pnpm workspace；Docs CI 的检查和部署分别安装并重新构建，不能保证发布的是同一份已验证构建。建议固定依赖解析并复用构建工件。安装页使用 `Tabs`/`TabItem` 而未见 import 或自定义 MDX 注册，网站未构建，暂列待验证项。
- `AGENTS.md` 已达 771 行，含大量 vendor 数量、hash 和历史审查细节；同文件第 721 行仍提 migration，与前文无 migration 的要求冲突。它更适合作为稳定约束与按任务阅读的索引；维护细节可以放进目录级说明，避免每项任务加载所有 vendor 背景。
- CI 未逐条运行发布文档的六 vendor 包级命令，但 `pnpm test` 已覆盖多个对应 converter check/idempotence 函数及 maintenance check。不能报告成“完全没有 vendor 验证”；真正需澄清的是哪一层检查承担发布权威。

## 建议的处理顺序

1. 修复清单路径边界、run 完成持久化、能力必需输入校验和插件提交一致性。这四项直接关系文件与工作流正确性。
2. 扩展现有实际 CLI 旅程到完成状态；将发布演练、现行主规格、安全说明统一到 schema 2 用户模型。
3. 完成一次真实宿主 Agent 的最小完整演练，再处理无关扩展扫描和重复维护脚本。
4. 根据演练质量与分发成本决定后续能力扩张，保持已有文件接口和能力边界。

本次未实施上述建议。新增内容仅为本报告；已复现的两个运行时问题、路径规划问题和规格漂移仍待修复。
