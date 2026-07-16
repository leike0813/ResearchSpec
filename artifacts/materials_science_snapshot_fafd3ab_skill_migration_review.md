# Materials-Science-Skills-For-LLM `snapshot-fafd3ab` Skill 迁移复审

## 复审对象与批准

本次复审对象是七棵完整 authored tree 的精确聚合哈希：

`c45bafc4be7e4fa540cc119cbaa81cec8f0e453d60fc9f2efd0124d8ec717e3e`

用户明确要求生成新树后不再暂停复审、直接达到最终目标，因此本报告与
`review-decision.json` 将该精确哈希提升为 converter version 2 的已批准生产树。
此授权仅适用于上述字节集合；任何 `SKILL.md`、reference、license、notice、
derivation 或政策输入变化都会产生不同哈希并使转换失败。

| Skill | 厚度 | 文件数 | 完整树 SHA-256 |
| --- | --- | ---: | --- |
| `materials-science-skills-apex-alloy-workflows` | Tier 2：reference-backed + external-tool | 5 | `21d11b9366a45e6eb578ecf27bddf8aa15f983ec4f0b90cc6aa4b432d8f45e88` |
| `materials-science-skills-atomsk-cli` | Tier 1：baseline + external-tool | 4 | `0a12608923a1ce3aa741571b5e70a1fc86c329880920f007f76e8a44c1c7ad47` |
| `materials-science-skills-deeptb-helper` | Tier 2：reference-backed + external-tool | 5 | `e96d2cbdc4308b076493fa3fe5d8f36846752b14b1188a78bc9a56e8c105dfc9` |
| `materials-science-skills-dpgen-workflow` | Tier 2：reference-backed + external-tool | 5 | `de9908efde629419bf648ce594a4cd62de8f184042cddf4b8e24a26cd6320ab8` |
| `materials-science-skills-gpumd-workflow` | Tier 2：reference-backed + external-tool | 5 | `c0612bb161c288fa194f79424b0d39e5ea69c4fc5eaa5f5d931b18faf3dfcc57` |
| `materials-science-skills-phonopy-workflows` | Tier 2：reference-backed + external-tool | 5 | `24f9680017077902a36be04b1588568849f44e799cc131660ff41a3d26e42174` |
| `materials-science-skills-unimol-ops` | Tier 2：reference-backed + external-tool | 5 | `9c608df0591025210ac0cf4d06e955bc571151c6664a82ba6b3ed94ede1591fe` |

## 厚度与 Progressive Disclosure

Atomsk 的普通路径、命令模式、权限、验证和失败处理可由一个完整主文件承载，
因此采用 Tier 1 且不创建 reference。

其余六棵树各保留一份只在具体模式需要的 substantial reference：APEX property
参数表、DeePTB dataset/config contract、DP-GEN parameter/machine contract、
GPUMD MD/NEP/output playbook、Phonopy configuration/force-file handoff、Uni-Mol
local mode playbook。这些内容包含较大的领域表、分支 playbook、文件契约或恢复
目录，不是每次普通调用都需要，能实质节省主上下文。

旧 quickstart、短安全规则、资源清单和单段 troubleshooting 不满足 Progressive
Disclosure，已全部并入相应 `SKILL.md`。每份保留的 reference 均从主文件直接
说明读取时机，且主文件已经包含 governing constraint、普通决策规则、权限、
输出和失败规则。不存在嵌套 reference chain。

## 来源、能力与依赖覆盖

候选继续绑定不可变审计 `snapshot-fafd3ab`、revision
`fafd3ab011e4c363658a39c4bb62fc739839d58c` 和 audit SHA-256
`03a12b5547b140c68458b5bf988f8df7056178a56c8fe41be2a3ffd29cf16589`。

24 项 upstream source-file 决策仍完整覆盖：22 项 `adapted` 均绑定一个或多个
authored output path，DeePTB 安装说明和 Phonopy 开发说明两项 `excluded` 保持
排除。每棵 `DERIVATION.json` 记录 source map、14 项 Agent procedure、9 项
external-tool mechanism、全部运行文件及 ResearchSpec authorship。

七个固定 Skill ID、7/5 admission、MIT、空 hard dependencies、十四项外部资源
决策和七项 advisory/source-excluded relationship 不变。域 membership 仍为：

- `computational-modeling-and-simulation`：七棵全部；
- `materials-engineering`：除 Uni-Mol 外六棵；
- `macromolecular-and-materials-chemistry`：Phonopy 与 Uni-Mol；
- `research-computing-infrastructure`：零棵。

## Agent 与外部工具边界

Agent 负责科学问题、数据/模型/势函数适用性、参数理由、单位、split、收敛、
不确定性、冲突证据和最终解释。外部工具只执行用户已配置并明确复核的动作：
`apex`、`atomsk`、`dptb`、`dpgen`、`gpumd`、`nep`、`phonopy`、用户配置的
DFT/ALM，以及本地 Uni-Mol/`unicore-train`/`torchrun` 入口。

每项 external-tool contract 都说明配置所有权、数据和权限边界、预期结果、
副作用、确认点和不可用时的恢复。ResearchSpec 不安装、下载、读取凭证、编译、
启动服务、调用科学软件、使用 GPU、提交调度/DFT/ALM/HPC 工作或改变远程状态。

## 删除项与分发

生产树不包含 `scripts/`、`lib/`、`assets/`、`resources/`、runner、通用 schema、
dependency manifest、installer、provider client、state store 或
`agents/openai.yaml`。旧 `curation/**` replacement assets 已由七棵完整 authored
tree 取代。

最终 34 个发布文件由七个 `SKILL.md`、六个 substantial references、七个 MIT
`LICENSE`、七个 `NOTICE.md` 和七个 `DERIVATION.json` 组成。审计、政策、authored
source、复审报告和测试均保持 maintainer-only，不进入 npm 包。

## 验证结论

七棵树已由 `validateNonNativeVendorSkill` 校验完整主文件、能力 anchor、reference
read-when、frontmatter 和分发文件。完整树 renderer 也检查 Tier 1/Tier 2 文件
形状、禁止文件、敏感值、私有/仓库路径、安装下载命令以及每文件、每树和聚合
hash。后续聚焦/全量测试、五 vendor isolation、release verification 和
OpenSpec strict validation 的最终结果记录在 change tasks 与执行汇报中。
