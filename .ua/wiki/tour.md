
# 导览

14 步，按依赖顺序组织。每步给出要读的文件，以及这一步体现出的语言/框架要点。

## 1. 项目定位与使用模型

先读 README 建立全局认知：ResearchSpec 要解决的是 Agent 学术研究里的平台锁定、状态碎片化与人工决策不可追溯。真正约束产品行为的规范在 docs/user/usage-model.md——init 只准备工作区，能力按需发现，一次确认授权一张冻结图。这两篇文档定义了后面每一层代码的取舍标准，读不懂某个模块时回来对照这里。

### 相关节点
- [README.md](files/README.md.md)
- [usage-model.md](files/docs/user/usage-model.md.md)

## 2. CLI 入口与命令目录

程序入口薄得只有一行——bin.ts 调用 main 后把退出码写进 process.exitCode，真实装配在 main.ts。command-catalog.ts 是整个 CLI 的 SSOT，用一份声明同时驱动 Commander 注册、帮助文本、读写影响标注与工作区要求。想弄清「有哪些命令、每条命令碰不碰磁盘」，读这一个文件就够了，不必逐个 handler 翻。

### 要点

Commander 的 command 对象在此被当作数据结构而非运行时注册点使用：目录描述完命令，main.ts 再统一遍历注册，因此同一份声明可以同时喂给 CLI 与文档生成器。

### 相关节点
- [bin.ts](files/src/cli/bin.ts.md)
- [main.ts](files/src/cli/main.ts.md)
- [command-catalog.ts](files/src/cli/command-catalog.ts.md)

## 3. 结果信封与手册渲染

types.ts 定义了 CommandContext、CommandResult 与 schema 1 的 CliEnvelope，presenter.ts 据此决定输出 JSON 信封还是人类可读文本——这是 Agent 消费 CLI 的关键接口契约。payload-catalog.ts 与 handbook.ts 把第 2 步的目录继续投影成 payload 规范、Markdown 手册与 Docusaurus 命令页，让文档由代码生成而非手写维护。

### 要点

envelope 模式：无论成功失败都返回同一形状的对象，错误收敛成带 code 与 details 的 CliError，避免了各命令各写一套退出逻辑。

### 相关节点
- [types.ts](files/src/cli/types.ts.md)
- [presenter.ts](files/src/cli/presenter.ts.md)
- [payload-catalog.ts](files/src/cli/payload-catalog.ts.md)
- [handbook.ts](files/src/cli/handbook.ts.md)

## 4. 核心契约层：Zod 定义事实源

全项目最重要的理解入口。graph-workspace.ts 定义 schema 2 工作区的 config、run、节点实例与 handoff；capability-graph.ts 定义图谱的节点类型、并行组、Gate、Decision 与修订轮模板；capability-manifest.ts 定义能力包契约。validation/types.ts 收敛 Diagnostic 与 ValidationViolation，parse.ts 把 JSON/YAML 解析失败转成带文件路径和行号的诊断而不是抛异常。依赖方向是单向的：CLI 与转换器都只经由这一层改变状态。

### 要点

Zod schema 同时充当运行时校验器和类型来源：z.infer 派生出 TypeScript 类型，parse 失败即诊断，因此契约只有一份定义，不存在「文档说的」和「代码校验的」两套标准。

### 相关节点
- [graph-workspace.ts](files/src/core/contracts/graph-workspace.ts.md)
- [capability-graph.ts](files/src/core/contracts/capability-graph.ts.md)
- [capability-manifest.ts](files/src/core/contracts/capability-manifest.ts.md)
- [types.ts](files/src/core/validation/types.ts.md)
- [parse.ts](files/src/core/validation/parse.ts.md)

## 5. 路径边界与写入计划

write-plan.ts 是全仓 fan-in 最高的文件（42 条依赖）：所有状态变更都必须先攒成一份写入计划再原子落地，没有别的地方可以直接写 researchspec/ 下的文件。配套的 project-path.ts 与 boundary-path.ts 定义词法级路径安全——拒绝绝对路径、越界、`..`、符号链接分量与 researchspec/ 内部路径。这两层共同构成「Agent 不能越权改状态」的技术保证。

### 要点

把「先校验后写入」抽象成中间计划对象，而不是散落在各处的顺序调用，让事务边界显式化，也让 dry-run 与幂等性检查可以复用同一套逻辑。

### 相关节点
- [write-plan.ts](files/src/core/workspace/write-plan.ts.md)
- [boundary-path.ts](files/src/core/runtime/boundary-path.ts.md)
- [project-path.ts](files/src/core/contracts/project-path.ts.md)

## 6. 工作区发现与只读索引

discover.ts 从显式路径或逐级向上查找最近的 schema 2 工作区，graph-discover.ts 提供 require 变体把缺失或旧格式直接转为异常。graph-workspace-index.ts 则是一次性扫描整个工作区的只读视图：校验安装清单、解析 config 与稳定 spec、遍历图 profile、run、节点与项目变更，并汇总所有诊断。`status` 这类只读命令完全建立在它之上。

### 要点

索引模式：遍历文件系统一次、结果落成内存结构，后续所有查询都读这份结构。命令因此不随项目文件数量增长而变慢，且天然无副作用。

### 相关节点
- [graph-workspace-index.ts](files/src/core/runtime/graph-workspace-index.ts.md)
- [discover.ts](files/src/core/workspace/discover.ts.md)
- [graph-discover.ts](files/src/core/workspace/graph-discover.ts.md)

## 7. 图谱运行时：唯一状态变更处

graph-run.ts 是整个系统里唯一实现工作流状态变更的文件（fan-out 36，覆盖 27 个 handler 依赖）：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate 与 Decision、解析节点输入绑定，并把节点文件与运行完成状态持久化在同一份 write plan 中。理解「一次 start/advance 到底写了哪些文件」，答案就在这里。

### 要点

上游 Skill 产生的语义文件留在 researchspec/ 之外，不受写事务管辖；进入 graph 的产出才被收编为节点实例。这种所有权划分让普通工作可以独立进行，不必升级成正式 run。

### 相关节点
- [graph-run.ts](files/src/core/runtime/graph-run.ts.md)
- [graph.ts](files/src/cli/handlers/graph.ts.md)
- [graph-bootstrap.ts](files/src/cli/handlers/graph-bootstrap.ts.md)

## 8. 能力注册表与 Procedure 目录

capabilities/registry.ts 加载 registry.json 并逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性与 ARS 溯源；validators.ts 按 manifest 声明依次运行 policy 与 script 校验器。procedures/catalog.ts 把 ARSU 路由、Companion 工作流、核心能力与插件扩展合并成运行期派生的 Procedure 目录——它不是另一份持久化注册表，packet.ts 再把选中的能力包装成 schema 1 激活包交给 Agent。这就是「按需发现」的实现。

### 要点

渐进披露（progressive disclosure）：宿主常驻的只有一个 Navigate 入口，具体能力靠 `list procedures` / `show procedure:<id>` / `instructions procedure:<id>` 三段式按需加载，避免把上百个 Skill 全塞进上下文。

### 相关节点
- [registry.ts](files/src/capabilities/registry.ts.md)
- [validators.ts](files/src/capabilities/validators.ts.md)
- [catalog.ts](files/src/procedures/catalog.ts.md)
- [packet.ts](files/src/procedures/packet.ts.md)

## 9. 宿主适配与工作区投递

tools.ts 是 35 个 Agent 宿主的安装 SSOT：Skill 根、命令格式、检测路径、遗留目录与项目入口机制。installations.ts 定义托管安装清单的 schema，负责对账过期文件并保留用户改动；managed-target.ts 校验清单里的地址永远越不出其目的地。workspace-delivery.ts 把图 profile、Agent 工具、遗留清理、文献 Adapter 与插件合并成一份统一的写入计划。

### 要点

区域哈希只覆盖 ResearchSpec 自己拥有的字节，文件级事务前置条件则保护周围的用户内容；两者配合才既能幂等重装，又不吞掉用户手写的东西。

### 相关节点
- [tools.ts](files/src/adapters/tools.ts.md)
- [installations.ts](files/src/adapters/installations.ts.md)
- [workspace-delivery.ts](files/src/adapters/workspace-delivery.ts.md)
- [project-entry.ts](files/src/adapters/project-entry.ts.md)

## 10. 插件注册与领域分类

taxonomy.ts 以 ANZSRC 2020 Fields of Research Group 作为学科域唯一标准，assembler.ts 合并各 vendor bundle 并原子写出 registry.json。registry.ts 加载校验注册表并检测 Skill 硬依赖环；extensions.ts 把域选择解析为具体扩展包集合；graph-delivery.ts 负责把选中的域投影到宿主 Skills 与 Profile 目录。213 个学科域加 5 个工具域中，空域始终对普通用户隐藏。

### 要点

vendor 与 domain 是分离的两层多对多关系：vendor 拥有上游版本与改编规则，domain 拥有固定的已审 Skill 列表。这样同一批 Skill 能被多个领域复用，而版本升级只需在 vendor 层处理一次。

### 相关节点
- [registry.ts](files/src/plugins/registry.ts.md)
- [assembler.ts](files/src/plugins/assembler.ts.md)
- [taxonomy.ts](files/src/plugins/taxonomy.ts.md)
- [extensions.ts](files/src/plugins/extensions.ts.md)
- [graph-delivery.ts](files/src/plugins/graph-delivery.ts.md)

## 11. ARSU 转换器

converter.ts 是 ARSU 转换的编排中枢：校验上游 checkout、规划锚点替换与运行时策略并检查重写冲突、逐 Skill 分组生成文件，最后两阶段写入报告与 manifest 并做产物校验。contract-anchors.json 是全仓被引用最多的文件（58 条），把上游 anchor 的名称、源路径、severity 与匹配提示绑到已审计 commit。routing/catalog.ts 与 workflow/generate.ts 则把路由语义和图 preset 投影成工作区可见的文件。

### 要点

转换器是确定性生成器而非一次性脚本：同样的输入必须产出同样的字节，所以 idempotence 检查本身就是一条测试，CI 每次都会跑。

### 相关节点
- [converter.ts](files/src/arsu-converter/converter.ts.md)
- [contract-anchors.json](files/src/arsu-converter/anchors/contract-anchors.json.md)
- [catalog.ts](files/src/arsu-converter/routing/catalog.ts.md)
- [generate.ts](files/src/arsu-converter/workflow/generate.ts.md)

## 12. 厂商转换器与审计策略

vendor-converters 占全仓 58% 的文件，是六个独立 vendor 共享同一套模式的实现：审计策略（如 histagent/production-policy.json 把 120 个源条目逐条映射为 excluded / retained-evidence / independent-reimplementation）→ 完整树渲染 → 插件包投影 → 中央注册表装配。production-vendors.ts 声明已进入生产的 vendor 清单，staging.ts 提供共用暂存区协议，用 SHA-256 比对检测投影漂移。

### 要点

准入决策是签入仓库的数据而非运行时判断：生产 bundle 的每一条取舍都能在 policy 文件里查到理由，因此审计结论可复核、上游升级的影响范围可预估。

### 相关节点
- [production-vendors.ts](files/src/vendor-converters/shared/production-vendors.ts.md)
- [staging.ts](files/src/vendor-converters/shared/staging.ts.md)
- [policy.ts](files/src/vendor-converters/finrobot/policy.ts.md)
- [production-policy.json](files/src/vendor-converters/histagent/production-policy.json.md)

## 13. 评审批注与静态工作台

这是唯一可选的交互式部分，也是全仓少数几个不碰工作流状态的地方。prepare.ts 把源文件冻结到 researchspec/ 之外的受控目录并比对源变化，组装通过 schema 校验的 v2 工作区；render.ts 负责 Markdown 与 Pandoc JSON AST 到统一评审块序列的转换，解析失败时保留可见的原始回退。整体只读：Agent 负责准备文档，浏览器保存草稿并导出建议性结果快照，失败时回退到 Agent 对话。

### 要点

冻结源 + 导出结果的模式：页面永远不再渲染变化的源文件，改动以 patch 形式交给 Agent 重新准备，从而避免浏览器侧状态与真实稿件脱节。

### 相关节点
- [review-workspace.ts](files/src/review-workspace.ts.md)
- [annotation-intake.ts](files/src/annotation-intake.ts.md)
- [prepare.ts](files/src/review-workspace/prepare.ts.md)

## 14. 测试、CI 与文档站

tests/helpers/cli.ts 用 spawnSync 驱动编译产物并解析信封，说明测试是按真实用户调用路径而非内部函数来验收的。ci.yml 在 6 组 OS × Node 版本矩阵上跑测试、lint、类型检查、ARSU 转换器 check 与幂等性校验——转换器漂移会直接让 CI 失败。docusaurus.config.ts 只保留文档路由、禁用博客，并对断链直接抛错。architecture.md 则用系统边界图和 owner 表保证每个概念只有一个事实源。

### 要点

验收测试跑编译产物而非源文件，模拟的是用户真正执行的那条命令，因此重构内部实现不会误伤测试，而 CLI 契约一旦破坏就会立刻被捕获。

### 相关节点
- [cli.ts](files/tests/helpers/cli.ts.md)
- [CI](files/.github/workflows/ci.yml.md)
- [docusaurus.config.ts](files/website/docusaurus.config.ts.md)
- [architecture.md](files/docs/developer/architecture.md.md)
