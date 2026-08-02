## REMOVED Requirements

### Requirement: Workflow-Owned Artifact Submit
**Reason**: ResearchSpec no longer registers boundary deliverables.
**Migration**: Write the deliverable outside `researchspec/` and reference it in a handoff.

### Requirement: Deterministic Candidate Validation
**Reason**: Candidate admission is removed from the framework control plane.
**Migration**: Validate semantic outputs in the producing Skill and validate the handoff structure.

### Requirement: Receipt-Backed Atomic Registration
**Reason**: Artifact registry and receipts are removed.
**Migration**: Use an explicit handoff role/path entry.

### Requirement: Submit Idempotency And Conflict Safety
**Reason**: The `submit` transaction is removed.
**Migration**: Producers own ordinary file writes; handoff updates use their own file precondition.

### Requirement: Instance-Scoped Artifact Submit
**Reason**: Instances reference external files through their own handoff.
**Migration**: Record the producer instance and path in `handoff.md`.

### Requirement: ARSU artifact references are controlled
**Reason**: Artifact identities are replaced by explicit boundary roles and paths.
**Migration**: Use stable-spec IDs for research facts and handoff roles for files.

### Requirement: Binary submissions retain transaction guarantees
**Reason**: ResearchSpec does not ingest or register binary deliverables.
**Migration**: Keep binary files outside `researchspec/` and reference them by path.

### Requirement: Current Scoped Artifact Submission
**Reason**: The current contract has no artifact submission lifecycle.
**Migration**: Use the producing subflow's handoff.

### Requirement: Working Material And Accepted Artifacts Are Separate
**Reason**: Working material remains private and boundary acceptance is semantic, not a registry state.
**Migration**: Keep working files under `work/` and expose selected external outputs in a handoff.

### Requirement: Durable Bundle Commit
**Reason**: Multi-file artifact/receipt commits are removed.
**Migration**: Use atomic writes only for the actual owning file.

### Requirement: Revision Patch Submission Is Canonical
**Reason**: ARSU revision patches are explicit Skill inputs, not submitted runtime entities.
**Migration**: Invoke the optional stateless patch helper with explicit paths.

### Requirement: Provider Evidence Requires Producer Acceptance
**Reason**: Provider evidence is not accepted through a framework registry.
**Migration**: The ARSU producer evaluates provider output and records stable facts or a handoff.

### Requirement: Submission Uses Descriptor-Owned Semantic Input
**Reason**: Submit descriptors and action-basis hashes are removed.
**Migration**: Use selector-specific instructions and semantic command inputs.

### Requirement: Adaptive Evidence Is Accepted At Obligation Boundaries
**Reason**: Adaptive obligations are removed.
**Migration**: Use stable specs, explicit outputs and formal Gates where declared.

### Requirement: Recoverable plan-bound artifact submission
**Reason**: Plan-bound submission and receipt recovery are removed.
**Migration**: Resolve ordinary file conflicts explicitly; ResearchSpec does not reconstruct them.

### Requirement: Human-Confirmed Annotation Submission
**Reason**: Annotation intake is private working material, not a submitted artifact.
**Migration**: Preserve it in the owning revision subflow or expose it through a handoff.

### Requirement: Annotation Submit Idempotency And Recovery
**Reason**: Annotation submit receipts and recovery are removed.
**Migration**: Use explicit source/destination paths and fail-closed helper writes.

### Requirement: Annotation v2 Submission Binds Raw Evidence
**Reason**: Raw evidence remains in the annotation set without registry binding.
**Migration**: Preserve raw and interpreted fields in the explicit annotation material.

