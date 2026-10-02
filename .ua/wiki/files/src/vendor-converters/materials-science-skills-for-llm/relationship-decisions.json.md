
# src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: config:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json -->

7 条 Skill 间关系裁决：把 DeepMD、Slurm、ASE、Atomsk 等跨 Skill 关联统一定为 advisory 或 source-excluded，resolved_target 全部为 null，禁止转化为安装依赖。
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:apex-alloy-workflows--deepmd-kit -->

apex-alloy-workflows → deepmd-kit 关系处置为 仅建议，resolved_target 为空。Deep-potential support is optional context and the sibling development surface is excluded.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:apex-alloy-workflows--slurm-workload-manager -->

apex-alloy-workflows → slurm-workload-manager 关系处置为 仅建议，resolved_target 为空。Scheduler use is an external prerequisite, not a packaged dependency.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:cms-scripts--ase -->

cms-scripts → ase 关系处置为 因来源被排除而作废，resolved_target 为空。The private source Skill is excluded.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:cms-scripts--atomsk-cli -->

cms-scripts → atomsk-cli 关系处置为 因来源被排除而作废，resolved_target 为空。The private source Skill is excluded.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:cms-scripts--pymatgen-usage -->

cms-scripts → pymatgen-usage 关系处置为 因来源被排除而作废，resolved_target 为空。The private source Skill is excluded.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:cms-scripts--slurm-workload-manager -->

cms-scripts → slurm-workload-manager 关系处置为 因来源被排除而作废，resolved_target 为空。The private source Skill is excluded.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
<!-- node: resource:src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json:dpgen-workflow--deepmd-kit -->

dpgen-workflow → deepmd-kit 关系处置为 仅建议，resolved_target 为空。A user-provided DeepMD runtime is optional external context, not a packaged Skill dependency.
源码：[src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json](../../../../../../src/vendor-converters/materials-science-skills-for-llm/relationship-decisions.json)
