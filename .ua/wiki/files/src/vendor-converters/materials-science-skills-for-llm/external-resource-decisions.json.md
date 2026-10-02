
# src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: config:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json -->

14 条外部资源处置裁决：逐个 Skill 记录其软件、数据、模型与计算环境依赖的 kind 与 disposition，把安装、凭据和远程执行统一归为用户自行提供的前置条件。
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:apex-runtime -->

apex-alloy-workflows 的 software 资源 apex-runtime 处置为 预配置。Use only a user-approved local APEX installation or configured service.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:atomsk-binary -->

atomsk-cli 的 software 资源 atomsk-binary 处置为 预配置。Atomsk must already be installed by the user.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:container-image -->

unimol-ops 的 software 资源 container-image 处置为 移除。Fixed images and automatic image retrieval are not distributed or invoked.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:cuda-gpu -->

gpumd-workflow 的 compute-environment 资源 cuda-gpu 处置为 预配置。CUDA and GPU capacity are user-provided and expensive runs require confirmation.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:deeptb-runtime -->

deeptb-helper 的 software 资源 deeptb-runtime 处置为 预配置。DeePTB and its Python environment are user-managed prerequisites.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:dft-or-alm -->

phonopy-workflows 的 software 资源 dft-or-alm 处置为 预配置。DFT or ALM backends are external user-approved prerequisites.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:dpgen-toolchain -->

dpgen-workflow 的 software 资源 dpgen-toolchain 处置为 预配置。DP-GEN, DFT, and model runtimes are user-managed prerequisites.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:gpumd-binary -->

gpumd-workflow 的 software 资源 gpumd-binary 处置为 预配置。GPUMD must already be compiled and available.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:molecular-data -->

unimol-ops 的 data 资源 molecular-data 处置为 预配置。Use only local user-provided molecular data.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:phonopy-runtime -->

phonopy-workflows 的 software 资源 phonopy-runtime 处置为 预配置。Phonopy must already be installed.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:remote-hpc -->

apex-alloy-workflows 的 compute-environment 资源 remote-hpc 处置为 仅参考。Remote or scheduler-backed execution requires explicit per-operation confirmation.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:scheduler-environment -->

dpgen-workflow 的 compute-environment 资源 scheduler-environment 处置为 仅参考。Scheduler execution remains external and confirmation-gated.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:training-datasets -->

deeptb-helper 的 data 资源 training-datasets 处置为 预配置。Training data must be supplied locally with known provenance.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json:unimol-model -->

unimol-ops 的 model 资源 unimol-model 处置为 预配置。Use only a local model supplied by the user with known provenance.
源码：[src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/external-resource-decisions.json)
