# Materials-Science-Skills-For-LLM 审计

## 审计边界

本审计涵盖官方仓库中不可变修订版 `fafd3ab011e4c363658a39c4bb62fc739839d58c` 的所有十二个顶层 Skills。上游没有选定的发布标签，因此审计版本标识为 `snapshot-fafd3ab`，而非虚构的发布版本。

该检出是仅限维护者的输入。未执行任何上游命令、脚本、安装步骤、下载、外部服务、凭据流程、调度器操作或科学计算。完整记录为 `skill-audit.json`；本报告总结决策，但不替代该机器真实来源。

审计证据不是生产准入。本次变更不创建任何转换器、生成的供应商 Skill、插件、域成员资格、注册表条目或生产准入、依赖或资源决策。

## 清单与许可证

- 12 个顶层 Skills 以稳定顺序各被覆盖一次。
- Skill 树包含 43 个文件、82,860 字节和 31 个参考文件。
- 8 个 Skills 仍为可能的候选；4 个开发、平台或私有的本地表面被排除。
- 4 个候选被阻止进入引入审查，4 个需要人工审核。
- 仓库根目录在 `LICENSE` 中声明了 MIT。所有十二个 Skill 的内容许可证审查仍为 `ambiguous`：根许可证是证据，但该快照未确立每个被总结的上游项目、示例或链接资源的来源和适用许可证。
- 每个 Skill 仅声明 `name` 和 `description` 前置元数据。`deeptb-helper` 不是有效的 YAML，因为其未加引号的描述包含映射冒号。未来的转换器必须修复前置元数据并添加已审查的兼容性和权限边界，而非从散文中推断。

## Skill 建议

| Skill | 范围 | 审计结果 | 理由 |
| --- | --- | --- | --- |
| `apex-alloy-workflows` | 研究工作流 | `blocked-review` | 有用的合金工作流，但 Bohrium 凭据/服务操作和 Slurm/MPI 权威需要明确的边界。 |
| `ase` | 开发维护 | `exclude` | 主要是 ASE 检出、测试、变更日志、文档和 Git 贡献维护。 |
| `atomsk-cli` | 科学计算 | `blocked-review` | 有用的结构操作，但 `references/quick-recipes.md` 缺失且来源许可证未解决。 |
| `cms-scripts` | 私有本地工具 | `exclude` | 硬编码了 `/Users/siyuliu/Desktop/tools/scripts-main`；引用的脚本缺失且不可审计。 |
| `deepmd-kit` | 开发维护 | `exclude` | 主要是环境设置、原生构建、lint、测试和开发验证。 |
| `deeptb-helper` | 研究工作流 | `needs-curation` | 修复无效的 YAML 前置元数据，然后将远程安装程序和平台特定的包与科学工作流分离。 |
| `dpgen-workflow` | 研究工作流 | `needs-curation` | 将研究工作流与仓库维护分离，并保持调度器/从头算执行由用户控制。 |
| `gpumd-workflow` | 研究工作流 | `needs-curation` | 保留计算指导，并明确 CUDA、原生构建、GPU 和执行边界。 |
| `phonopy-workflows` | 研究工作流 | `needs-curation` | 保留声子语义，同时移除维护内容并将外部 DFT 视为先决条件。 |
| `pymatgen-usage` | 科学计算 | `blocked-review` | 与 `scientific-agent-skills-pymatgen` 大幅重叠；Materials Project 凭据持久化也需要适配。 |
| `slurm-workload-manager` | 平台管理 | `exclude` | 拥有特权调度器安装、守护进程、凭据、核算和集群状态。 |
| `unimol-ops` | 研究工作流 | `blocked-review` | 模型/数据来源、许可证、哈希、下载、端点、GPU 兼容性和成本未受控制。 |

## 必需的回归边界

- `atomsk-cli/SKILL.md` 引用了缺失的 `references/quick-recipes.md`。
- `cms-scripts` 依赖个人绝对路径并描述了未分发的内容。
- `pymatgen-usage` 重复了现有的已准入供应商表面，在没有 deliberate 重叠决策的情况下无法添加。
- `ase` 和 `deepmd-kit` 是开发维护表面，在其当前形式下不是可重用的研究 Skills。
- APEX 暴露了凭据、远程 Bohrium 状态和 HPC 调度；Slurm 暴露了特权平台管理；Uni-Mol 暴露了外部下载和 GPU/服务兼容性。
- ANZSRC Field 值仅为审计元数据，永远不会创建生产域成员资格。

## 固定的未来引入设计

生产考虑需要一个名为 `ingest-materials-science-skills-for-llm` 的单独 OpenSpec 变更和一个供应商特定的、非执行的转换器。生成的标识符必须使用 `materials-science-skills-<upstream-id>`。

只有通过明确的已审查决策才能考虑这些现有域：

- `materials-engineering`
- `macromolecular-and-materials-chemistry`
- `computational-modeling-and-simulation`
- `research-computing-infrastructure`

未来的转换器必须通过已检入的决策标准化前置元数据、兼容性、LICENSE/NOTICE、权限、损坏的引用和绝对路径。ResearchSpec 不得执行上游命令、安装依赖、配置或持久化凭据、下载模型或数据、访问服务或提交科学/HPC 工作。
