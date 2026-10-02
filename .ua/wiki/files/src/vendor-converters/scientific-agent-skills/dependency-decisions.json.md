
# src/vendor-converters/scientific-agent-skills/dependency-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/scientific-agent-skills](../../../../modules/src/vendor-converters/scientific-agent-skills.md)
<!-- node: config:src/vendor-converters/scientific-agent-skills/dependency-decisions.json -->

28 条跨 Skill 关系裁决：21 条因来源 Skill 被排除而作废，7 条降级为 advisory（如 scientific-slides→pptx、relsa-severity-assessment→statistical-analysis）。所有 resolved_target 均为空，任何关系都不构成硬依赖或安装触发条件。
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:relsa-severity-assessment--experimental-design -->

relsa-severity-assessment → experimental-design 的非必需关系降级为 advisory，resolved_target 为空。Reviewed sibling reference does not authorize installation or workflow routing.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:relsa-severity-assessment--statistical-analysis -->

relsa-severity-assessment → statistical-analysis 的非必需关系降级为 advisory，resolved_target 为空。Reviewed sibling reference does not authorize installation or workflow routing.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:scientific-slides--pptx -->

scientific-slides → pptx 的非必需关系降级为 advisory，resolved_target 为空。The source is admitted, but this non-required relation targets an excluded Skill and remains advisory only.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:scientific-slides--research-lookup -->

scientific-slides → research-lookup 的非必需关系降级为 advisory，resolved_target 为空。The source is admitted, but this non-required relation targets an excluded Skill and remains advisory only.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:scientific-slides--scientific-schematics -->

scientific-slides → scientific-schematics 的非必需关系降级为 advisory，resolved_target 为空。The source and target are admitted, but this related edge is advisory and never triggers domain installation.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:source-excluded-group -->

21 条关系因来源或目标 Skill 被排除而统一作废，涵盖 bulk-rnaseq、literature-review、market-research-reports、research-lookup、scanpy、scientific-writing 等。
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:uncertainty-and-units--experimental-design -->

uncertainty-and-units → experimental-design 的非必需关系降级为 advisory，resolved_target 为空。Reviewed sibling reference does not authorize installation or workflow routing.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/dependency-decisions.json:uncertainty-and-units--statistical-analysis -->

uncertainty-and-units → statistical-analysis 的非必需关系降级为 advisory，resolved_target 为空。Reviewed sibling reference does not authorize installation or workflow routing.
源码：[src/vendor-converters/scientific-agent-skills/dependency-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/dependency-decisions.json)
