# Scientific Agent Skills v2.72.0 manual security review

Round 1 of the carried review inventory covers five Skills. The dated [upstream report](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/docs/security-report.json) supplies the scanner claims. The source paths below refer to the v2.72.0 tag. The maintainer confirmed all five `clear-with-adaptation` recommendations. The [decision record](artifacts/maintainer-decisions.json) binds those actions to the candidate revision.

## fluidsim

- **Inventory.** 17 files comprise the entry, six references and ten Python support or CLI files. Review covers the local configuration, dry-run, output inventory, restart compatibility and resource-estimation surfaces.
- **Scanner and finding verdict.** The carried scanner row has zero findings. The current helpers plan simulations and inspect bounded local metadata. The entry and installation reference describe optional solver, FFT and MPI provisioning, including third-party runtime requirements.
- **Residual risk and adaptation.** Keep setup in the user's pinned environment. Treat untrusted simulation output as input data and retain bounded metadata inspection. Preserve independent upstream attribution and keep dependency actions outside ResearchSpec.
- **Independent blockers and domains.** None identified in this round. Existing domains are `fluid-mechanics-and-thermal-engineering` and `computational-modeling-and-simulation`.
- **Recommendation and production effect.** `clear-with-adaptation`. Eligible to retain the existing capability after the other admission checks pass.

[Entry](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/fluidsim/SKILL.md) · [References](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/fluidsim/references) · [Tools](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/fluidsim/scripts)

## geomaster

- **Inventory.** 18 files comprise the entry, README, 15 references and one local raster script. The references cover local workflows, external catalogs and service-specific or desktop examples.
- **Scanner and finding verdict.** One low prompt-injection finding about a vendor self-citation directive is partially confirmed. The directive remains in the entry and the existing citation normalization makes it passive. The new raster helper implements local analysis. The current README documents which workflows upstream tested.
- **Residual risk and adaptation.** Require explicit GIS scope, user-chosen data and output paths, a provisioned environment and approval for authenticated services or external commands. Keep example credentials and paths as placeholders.
- **Independent blockers and domain.** None identified in this round. Existing domain `geoinformatics`.
- **Recommendation and production effect.** `clear-with-adaptation`. Eligible to retain the local workflows and reviewed references after the other admission checks pass.

[Entry](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/geomaster/SKILL.md) · [Review ledger](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/geomaster/references/review.md) · [Raster helper](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/geomaster/scripts/raster_workflows.py)

## infographics

- **Inventory.** Eight files comprise the entry, five design references and two Python scripts. The local design references cover layout, color, infographic types and review.
- **Scanner and finding verdicts.** Three critical findings are partially confirmed. The wrapper forwards a selected subset of environment variables and a provider credential. The model script can send generation inputs to the declared provider. The old review's full-environment description was inaccurate.
- **Residual risk and adaptation.** Exclude both generation scripts. Retain design and review guidance. Route optional image generation through the target Agent's configured generic capability with prior approval for data sharing and cost. Keep external research inputs untrusted.
- **Independent blockers and domains.** None identified in this round. Existing domains are `design` and `scientific-visualization-and-communication`.
- **Recommendation and production effect.** `clear-with-adaptation`. Eligible to retain the curated design capability after the other admission checks pass.

[Entry](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/infographics/SKILL.md) · [References](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/infographics/references) · [Scripts proposed for exclusion](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/infographics/scripts)

## latex-posters

- **Inventory.** 17 files comprise the entry, nine references, four assets and three scripts. The package shares a local PDF review helper and poster templates alongside two provider-bound Python utilities.
- **Scanner and finding verdicts.** Three critical findings are partially confirmed. The Python wrapper forwards a selected subset of environment variables and a provider credential. The local PDF helper and templates support the separate poster workflow.
- **Residual risk and adaptation.** Exclude the two provider-bound Python files. Keep templates and local PDF review, using pre-provisioned TeX and PDF tools. Avoid shell escape for ordinary compilation and require approval before sending material to an external model.
- **Independent blockers and domains.** None identified in this round. Existing domains are `design` and `scientific-visualization-and-communication`.
- **Recommendation and production effect.** `clear-with-adaptation`. Eligible to retain the local poster workflow after the other admission checks pass.

[Entry](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/latex-posters/SKILL.md) · [Compilation guidance](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/latex-posters/references/compilation_and_quality_control.md) · [Tools](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/latex-posters/scripts)

## markitdown

- **Inventory.** 11 files comprise the entry, seven references and three Python tools for local conversion, literature batches and installation inspection.
- **Scanner and finding verdict.** One low policy finding about a vendor self-citation directive is partially confirmed. The directive remains in the entry and the existing citation normalization makes it passive. The current entry distinguishes trusted local conversion from optional URL, OCR, cloud, plugin and MCP surfaces that can expand process or network access.
- **Residual risk and adaptation.** Keep local files or streams as the default input, keep plugins disabled by default, and treat converted Markdown as untrusted data. Keep host MCP setup and provider configuration outside the procedure's authority.
- **Independent blockers and domain.** None identified in this round. Existing domain `research-computing-infrastructure`.
- **Recommendation and production effect.** `clear-with-adaptation`. Eligible to retain the local conversion capability after the other admission checks pass.

[Entry](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/markitdown/SKILL.md) · [Security reference](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/skills/markitdown/references/security.md) · [Local tools](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/markitdown/scripts)
