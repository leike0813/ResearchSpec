## Context

See proposal.md. Graph admission currently resolves only capability identities. Instructions has a binding resolver, while submission only validates outputs. The converter owns the affected manifests and profiles.

## Goals / Non-Goals

Enforce the same input contract for instructions, profile admission and actual consumption. Preserve bounded static inspection, host neutrality, explicit role mapping and the current file authority model. Do not add scientific-content inference, material hashing, migrations, public commands or dependencies.

## Decisions

- Extend the manifest source policy to a scalar or unique non-empty array, leaving concrete graph sources scalar. Reuse manifest-derived authoring types. This expresses real alternatives without silently treating handoff and node_output as interchangeable.
- Required means `required !== false`. Optional roles may be unbound; every declared binding must resolve. Explicit null, false and zero parameter values remain valid.
- Reuse registry graph validation for required/unknown roles, source policy and producer output mappings. Reuse the runtime resolver for current-round node and child outputs and bounded stable-spec paths. External references are checked for readability at consumption, not during status scans.
- Minimal reuses the six existing research capabilities without a Gate; full research retains the RQ Gate. Both bind methodology into report. Writing receives bibliography and synthesis through explicit handoffs, including pipeline child outputs. Reviewer manifests declare configuration cards; editorial consumes manuscript/configuration, not specialist-review output.
- Frozen graphs remain authoritative. Invalid existing input contracts fail closed and are not rewritten. Keep existing input path and directory contracts and runtime write preconditions.

## Risks / Trade-offs

- Existing fixtures use incomplete production capabilities → repair fixtures to model actual input contracts or use small test-owned capabilities for engine-only tests.
- Strengthened checks expose authoring drift → validate all seven presets and plugin profiles with the same contract before regeneration is accepted.
- Minimal requires more work → update route output/cost metadata and the full CLI journey, without adding formal Gates.
- Generated manifests change identity → use ARSU authoring and semantic review, preserve unmodified upstream knowledge, and refresh the associated deterministic records.
