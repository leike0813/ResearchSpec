
# src/vendor-converters/scientific-agent-skills/resource-decisions.json
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/scientific-agent-skills](../../../../modules/src/vendor-converters/scientific-agent-skills.md)
<!-- node: config:src/vendor-converters/scientific-agent-skills/resource-decisions.json -->

19 条资源级排除裁决，默认 disposition 为 included；每条剔除绑定 provider 凭据、修改宿主环境或发起远程请求的脚本与参考页，覆盖 infographics、latex-posters、modal、pacsomatic、parallel-web、scientific-schematics、scientific-slides 七个准入 Skill。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/infographics/scripts/generate_infographic_ai.py -->

infographics 的 skills/infographics/scripts/generate_infographic_ai.py 被排除：Exclude provider-specific network, credential, research-injection, persistence, and unbounded-iteration business logic. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/infographics/scripts/generate_infographic.py -->

infographics 的 skills/infographics/scripts/generate_infographic.py 被排除：Exclude the provider-bound wrapper because it copies the full process environment and forwards credentials to another script. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/latex-posters/scripts/generate_schematic_ai.py -->

latex-posters 的 skills/latex-posters/scripts/generate_schematic_ai.py 被排除：Exclude provider-specific model, network, .env, and credential handling while retaining the independent LaTeX poster capability. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/latex-posters/scripts/generate_schematic.py -->

latex-posters 的 skills/latex-posters/scripts/generate_schematic.py 被排除：Exclude the provider-bound wrapper and its full environment inheritance. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/modal/references/secrets.md -->

modal 的 skills/modal/references/secrets.md 被排除：Exclude inline, environment, and .env secret-handling examples; use only an already authenticated target environment. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/pacsomatic/scripts/run_pacsomatic.py -->

pacsomatic 的 skills/pacsomatic/scripts/run_pacsomatic.py 被排除：Exclude host-mutating execution: cloning an arbitrary repository, creating conda/mamba environments, generating executable launch scripts and submitting jobs to schedulers. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/parallel-web/references/data-enrichment.md -->

parallel-web 的 skills/parallel-web/references/data-enrichment.md 被排除：Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/parallel-web/references/deep-research.md -->

parallel-web 的 skills/parallel-web/references/deep-research.md 被排除：Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/parallel-web/references/findall.md -->

parallel-web 的 skills/parallel-web/references/findall.md 被排除：Exclude provider-specific entity-discovery CLI, data-transfer, polling, and credential-dependent workflows. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/parallel-web/references/monitor.md -->

parallel-web 的 skills/parallel-web/references/monitor.md 被排除：Exclude provider-specific monitoring CLI, persistent external state, webhooks, and credential-dependent workflows. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/parallel-web/references/web-extract.md -->

parallel-web 的 skills/parallel-web/references/web-extract.md 被排除：Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/parallel-web/references/web-search.md -->

parallel-web 的 skills/parallel-web/references/web-search.md 被排除：Exclude provider-specific CLI, data-transfer, polling, and credential-dependent workflows. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-schematics/scripts/example_usage.sh -->

scientific-schematics 的 skills/scientific-schematics/scripts/example_usage.sh 被排除：Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-schematics/scripts/generate_schematic_ai.py -->

scientific-schematics 的 skills/scientific-schematics/scripts/generate_schematic_ai.py 被排除：Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-schematics/scripts/generate_schematic.py -->

scientific-schematics 的 skills/scientific-schematics/scripts/generate_schematic.py 被排除：Exclude provider-, model-, credential-, or executable-specific material from the generic adapted Skill. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-slides/scripts/generate_schematic_ai.py -->

scientific-slides 的 skills/scientific-slides/scripts/generate_schematic_ai.py 被排除：Exclude provider-specific image generation, network, environment, and credential handling. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-slides/scripts/generate_schematic.py -->

scientific-slides 的 skills/scientific-slides/scripts/generate_schematic.py 被排除：Exclude provider-specific image generation, network, environment, and credential handling. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-slides/scripts/generate_slide_image_ai.py -->

scientific-slides 的 skills/scientific-slides/scripts/generate_slide_image_ai.py 被排除：Exclude provider-specific image generation, network, environment, and credential handling. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
<!-- node: resource:src/vendor-converters/scientific-agent-skills/resource-decisions.json:skills/scientific-slides/scripts/generate_slide_image.py -->

scientific-slides 的 skills/scientific-slides/scripts/generate_slide_image.py 被排除：Exclude provider-specific image generation, network, environment, and credential handling. 该 Skill 在排除后仍保持完整（skill_remains_complete=True）。
源码：[src/vendor-converters/scientific-agent-skills/resource-decisions.json](../../../../../../src/vendor-converters/scientific-agent-skills/resource-decisions.json)
