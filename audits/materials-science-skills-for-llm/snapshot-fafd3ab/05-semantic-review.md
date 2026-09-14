# Materials-Science-Skills-For-LLM Extension Anchor Semantic Review — snapshot-fafd3ab

## 审阅范围

本锚点将七个 reviewed Materials-Science-Skills-For-LLM vendor-bundle Skills 一对一转换为
`skills/plugins/extensions/` 下的 capability package + 一节点 graph profile：

- `materials-science-skills-apex-alloy-workflows` -> `plugin-materials-apex-alloy-workflows`
- `materials-science-skills-atomsk-cli` -> `plugin-materials-atomsk-cli`
- `materials-science-skills-deeptb-helper` -> `plugin-materials-deeptb-helper`
- `materials-science-skills-dpgen-workflow` -> `plugin-materials-dpgen-workflow`
- `materials-science-skills-gpumd-workflow` -> `plugin-materials-gpumd-workflow`
- `materials-science-skills-phonopy-workflows` -> `plugin-materials-phonopy-workflows`
- `materials-science-skills-unimol-ops` -> `plugin-materials-unimol-ops`

六个 reviewed references 从 vendor bundle 逐字节复制到 extension `references/`；
Atomsk 按审核决定不携带 reference。所有 package 均为 `execution_type: llm`，
因为语义工作属于 Agent procedure，外部科学工具只由用户管理。

## 逐项语义判定

### 1. plugin-materials-apex-alloy-workflows

- 上游语义义务 1：不安装 APEX、不选择凭证、不配置 site、不自动授予远程状态变更权限。
  上游原文见 Purpose and scope：“The Skill does not install APEX, choose credentials,
  configure a site, retrieve potentials, or grant authority to submit, stop, retry,
  delete, archive, or replace remote work.” 转换后承载：extension SKILL 原文保留。判定：`preserved`。
- 上游语义义务 2：提交/重试/删除等操作需要逐次确认。
  上游原文见 Workflow 6 与 Hard constraints。转换后承载：原文保留；brief 必填
  `authority_ledger`。判定：`preserved`。
- 上游语义义务 3：任务完成不等于科学有效，必须检查单位、收敛和 calculator applicability。
  上游原文见 Hard constraints 第四条。转换后承载：原文保留；brief 必填
  `validation_criteria, task_results, convergence_checks`。判定：`preserved`。
- 上游语义义务 4：property 参数 review 使用 conditionally-read reference。
  上游原文见 Workflow 4。转换后承载：`references/property-parameters.md` 作为
  knowledge_ref 打包。判定：`preserved`。
- 判定小结：`preserved`（四 preserved，无 adapted/removed/gap）。

### 2. plugin-materials-atomsk-cli

- 上游语义义务 1：不覆盖 source structure，新输出路径优先。
  上游原文见 Hard constraints 第一条与 Workflow 4。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 2：不得猜测 Miller indices、handedness、lattice parameters、坐标约定等。
  上游原文见 Hard constraints。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 3：Atomsk 选项顺序可改变结果，不得静默重排 transformation。
  上游原文见 Hard constraints。转换后承载：原文保留；brief 必填
  `operation_plan, command_ledger`。判定：`preserved`。
- 上游语义义务 4：执行后验证 atom count、species、cell、orientation、periodicity、coordinates。
  上游原文见 Responsibilities 与 Outputs。转换后承载：原文保留；brief 必填
  `validation_evidence`。判定：`preserved`。
- 上游语义义务 5：不安装 binaries、不检索 examples、不编辑 global config。
  上游原文见 Hard constraints。转换后承载：原文保留。判定：`preserved`。
- 判定小结：`preserved`（五 preserved，无 adapted/removed/gap）。

### 3. plugin-materials-deeptb-helper

- 上游语义义务 1：不得跨 split 泄漏 structure/label 或 normalization。
  上游原文见 Hard constraints：“Never mix structures or labels across splits...”
  转换后承载：原文保留；brief 必填 `dataset_ledger, evaluation_metrics`。判定：`preserved`。
- 上游语义义务 2：configuration 必须与安装版本匹配。
  上游原文见 Workflow 2：“do not infer a configuration schema from a different release.”
  转换后承载：原文保留；brief 必填 `configuration_review`。判定：`preserved`。
- 上游语义义务 3：不安装、不创建环境、不自动训练。
  上游原文见 Hard constraints。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 4：不得从 training loss alone 接受模型。
  上游原文见 Responsibilities 与 Outputs。转换后承载：原文保留；brief 必填
   `evaluation_metrics, conclusions`。判定：`preserved`。
- 判定小结：`preserved`（四 preserved，无 adapted/removed/gap）。

### 4. plugin-materials-dpgen-workflow

- 上游语义义务 1：uncertainty thresholds 是显式科学假设，不得从 defaults 推断。
  上游原文见 Hard constraints 第四条。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 2：training/exploration/labeling/submission 需要单独确认。
  上游原文见 Workflow 6。转换后承载：原文保留；brief 必填 `authority_ledger`。判定：`preserved`。
- 上游语义义务 3：不安装、不构建、不配置 scheduler、不自动 submit/cancel/resubmit。
  上游原文见 Hard constraints 第二条。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 4：train/validation separation、iteration provenance、label 设置与 failures 必须保留。
  上游原文见 Hard constraints。转换后承载：原文保留；brief 必填
  `stage_ledger, convergence_evidence`。判定：`preserved`。
- 判定小结：`preserved`（四 preserved，无 adapted/removed/gap）。

### 5. plugin-materials-gpumd-workflow

- 上游语义义务 1：只对 reviewed 目录运行用户编译的 `gpumd`/`nep`。
  上游原文见 Workflow 7。转换后承载：原文保留；brief 必填 `command_ledger, run_ledger`。判定：`preserved`。
- 上游语义义务 2：不编译、不换 drivers、不检索 data/potentials、不自动 restart/overwrite。
  上游原文见 Hard constraints。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 3：验证 atom types、units、potential scope、file ordering、timestep、ensemble、sampling 与 restart 兼容。
  上游原文见 Hard constraints。转换后承载：原文保留；brief 必填
  `output_inventory, validation_results`。判定：`preserved`。
- 上游语义义务 4：缺失 output、NaN、energy drift、unexplained atom loss 都是 failed run。
  上游原文见 Failure handling。转换后承载：原文保留。判定：`preserved`。
- 判定小结：`preserved`（四 preserved，无 adapted/removed/gap）。

### 6. plugin-materials-phonopy-workflows

- 上游语义义务 1：displaced-structure identity 与 atom ordering 必须贯穿每个 force file。
  上游原文见 Hard constraints。转换后承载：原文保留；brief 必填 `force_ledger`。判定：`preserved`。
- 上游语义义务 2：不得混合不同 calculator settings 的 forces。
  上游原文见 Hard constraints 与 Examples。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 3：DFT/ALM、remote、scheduler、昂贵或覆盖操作需显式确认。
  上游原文见 Workflow 7。转换后承载：原文保留；brief 必填 `run_ledger`。判定：`preserved`。
- 上游语义义务 4：imaginary modes 解释前必须检查数值、结构、收敛与 NAC 原因。
  上游原文见 Failure handling。转换后承载：原文保留；brief 必填
  `validation_results, conclusions`。判定：`preserved`。
- 判定小结：`preserved`（四 preserved，无 adapted/removed/gap）。

### 7. plugin-materials-unimol-ops

- 上游语义义务 1：只使用任务、preprocessing、schema、单位、license/provenance 已核实的模型。
  上游原文见 Hard constraints 第三条。转换后承载：原文保留；brief 必填
  `data_ledger, mode_plan`。判定：`preserved`。
- 上游语义义务 2：不安装、不下载、不 pull images、不接触 remote endpoint、不上传分子数据。
  上游原文见 Hard constraints 与 Failure handling。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 3：raw predictions/embeddings 与 interpretation 分离。
  上游原文见 Hard constraints 第五条。转换后承载：原文保留；brief 必填
  `result_ledger, conclusions`。判定：`preserved`。
- 上游语义义务 4：GPU 使用、训练、checkpoint 替换或覆盖需确认。
  上游原文见 Workflow 6。转换后承载：原文保留。判定：`preserved`。
- 判定小结：`preserved`（四 preserved，无 adapted/removed/gap）。

## 流程权威检查

- `grep -R -n -E 'next-node|next-phase|agent-team|proceed to next'`：0 hits。
- 每个 extension SKILL 的 Completion 只说明 submit 后查询 `researchspec status`，不命名 successor。
- 外部工具 APEX/Atomsk/DeePTB/DP-GEN/GPUMD/Phonopy/Uni-Mol 只执行已确认的领域操作，
  不获得 ResearchSpec workflow authority；流程权威由一节点 graph profile 承接。

## 风险与遗留

- 七个 package 的 `execution_type: llm` 与 script validator 并存：validator 只检查
  `research_brief` 证据字段，不执行任何科学工具。该边界已写入 SKILL，后续可在
  plugin schema 正式化时增加 schema validator。
- 外部工具可用性、GPU/HPC/scheduler 与 compute budget 完全由用户拥有；extension package
  不探测也不配置这些环境。
- `research_brief` 是 minimal JSON contract；后续 schema-backed output 应保持本锚点的
  required fields 作为证据门。

## 按需激活复核（2026-09-14）

- 范围：7 个 Materials-Science extension。逐包程序正文、输入输出、knowledge、validator、安全边界和 profile 保持原审阅结论；本轮语义变化只把固定 graph 完成动作改为服从 activation packet。
- Standalone packet 只允许返回 researchspec/ 外的普通输出路径，禁止 run、node、handoff、Gate、Decision、override 和 transition 写入；graph packet 才提供 owning handoff 与精确 advance selector。
- 生成路径与静态受审树均已核对；全库 47/47 core 与 332/332 extension 包含 mode-neutral Completion，旧 advance node:<run>/<node> Completion 为 0。该适配保留既有领域步骤和证据义务，未引入新的流程权威。

## 结论

`declared-fit-with-notes`：七个 extension capability 保留了上游 reviewed 的
工具所有权、确认边界、科学验证与失败处理语义，required brief fields 全部绑定；
遗留项均为 plugin schema 正式化工作，不构成本锚点语义缺口。
