# Host-Native Model Selection

The current session model is the default for every ARSU role. ResearchSpec does
not infer a provider lineup or assign fixed model families to quality tiers.

An `economy` or `quality-boost` suggestion may be used only when the Agent can
name a suitable model that the host already exposes through native subagent
delegation. The user must separately confirm the exact model, the category of
content to be shared, and the expected cost for the current run and node. Economy
selection must preserve the role's required capabilities. Quality boost applies
only to the named judgment surface. Unknown or unavailable selections fall back
to the current session model with a disclosed note.

Model selection never changes ResearchSpec workflow authority, Gates, Decisions,
or file ownership. It is session-scoped and is not stored in a stable spec,
control, handoff, or model configuration file.
