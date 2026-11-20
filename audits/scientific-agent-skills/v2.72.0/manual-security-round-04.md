# Scientific Agent Skills v2.72.0 manual security review, round 4

The five assessments use the current checkout. The dated [upstream report](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/docs/security-report.json) reused each of the five scan rows. The maintainer confirmed all five recommendations. [Decision record](artifacts/maintainer-decisions.json)

## venue-templates

- **Inventory and findings.** 32 files with three scripts, 12 references and 16 assets. One carried low finding is partially confirmed. The entry's vendor self-citation directive remains, including instructions to fetch a citation. The current local helpers add reviewed template-name validation and a bounded Poppler invocation.
- **Residual risk and adaptation.** Make sources advisory, preserve local output boundaries, check current venue rules through an authorized retrieval path and use templates as formatting aids. Local validation cannot establish submission acceptance.
- **Independent blockers and domains.** None identified. Existing domains are `design` and `scientific-visualization-and-communication`.
- **Recommendation and production effect.** `clear-with-adaptation`. Retain the curated venue-template capability if remaining admission checks pass.

[Candidate tree](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/venue-templates)

## bgpt-paper-search

- **Inventory and findings.** One entry file, no bundled tools. The carried scanner row has zero findings. The updated entry introduces host MCP configuration, a bridge and authenticated paid calls.
- **Residual risk and adaptation.** Keep provider-neutral query planning and evaluation. Omit host setup, credential-file instructions and provider-specific invocation. External search remains subject to separate destination and cost authorization.
- **Independent blocker and domain.** Overlaps `tooluniverse-literature-deep-research`. Candidate domain `data-management-and-data-science`.
- **Recommendation and production effect.** `clear-with-adaptation`. The overlap still excludes this Skill.

[Candidate tree](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/bgpt-paper-search)

## bids

- **Inventory and findings.** Eight files with six references and one updater script. The carried scan has zero findings. The current updater adds HTTPS and bounded downloads and still overwrites local schema resources. Most of the source bytes are in the static schema, which was inventoried as data.
- **Residual risk and adaptation.** Exclude `scripts/update_schema.py` from any future projection and treat checked-in schemas as versioned references. Keep global tooling setup outside the Skill's execution authority.
- **Independent blocker and domains.** Existing overlap with `tooluniverse-neuroscience`. Candidate domains `neurosciences` and `research-computing-infrastructure`.
- **Recommendation and production effect.** `clear-with-adaptation`. The overlap still excludes this Skill.

[Candidate tree](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/bids)

## cellxgene-census

- **Inventory and findings.** Five files including four references, with no bundled scripts. The carried scan has zero findings. The new API reference describes public manifests and stores, including a runtime override for the data location.
- **Residual risk and adaptation.** Limit guidance to explicit public Census work and a pinned release. Keep package installation external and require authorization of data destinations. Use synthetic or public information for examples.
- **Independent blocker and domain.** Existing overlap with `tooluniverse-single-cell`. Candidate domain `bioinformatics-and-computational-biology`.
- **Recommendation and production effect.** `clear-with-adaptation`. The overlap still excludes this Skill.

[Candidate tree](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/cellxgene-census)

## citation-management

- **Inventory and findings.** 22 files with eight scripts, eleven references and two assets. Findings 1–4 and 5 remain partially confirmed. Current bibliographic helpers add an authenticated OpenAlex path and more DOI and PMC resolution. The vendor self-citation directive remains. Finding 6 remains a false positive because the cited subprocess example uses fixed argument handling.
- **Residual risk and adaptation.** Retain existing network-resource exclusions and include the OpenAlex helper in any future exclusion set. Keep retrieval in the authorized target Agent environment. Treat external bibliographic metadata as untrusted and record unverified DOI status.
- **Independent blocker and domain.** ARSU `deep-research` owns the overlapping workflow. Candidate domain `library-and-information-studies`.
- **Recommendation and production effect.** `clear-with-adaptation`. The overlap still excludes this Skill.

[Candidate tree](https://github.com/K-Dense-AI/scientific-agent-skills/tree/v2.72.0/skills/citation-management)
