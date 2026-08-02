## REMOVED Requirements

### Requirement: Case Authority Contains Only Durable Commitments
**Reason**: Global CaseState is replaced by stable specs and per-subflow controls.
**Migration**: Place each fact in its new owning file.

### Requirement: Shared Action Availability
**Reason**: Case-wide action availability is replaced by selector-specific current instructions.
**Migration**: Query the relevant route, subflow, Gate, Decision, change or handoff selector.

### Requirement: Adaptive And Strict Evaluation
**Reason**: Dual runtime modes are removed.
**Migration**: Use the current profile and control contracts in a fresh workspace.

### Requirement: Scoped Attempts And Local Recovery
**Reason**: Generic runtime attempts and recovery are removed.
**Migration**: Preserve only formal Gate attempts in the owning control.

### Requirement: Working And Accepted Evidence Are Distinct
**Reason**: Evidence acceptance is expressed through stable facts and formal human review.
**Migration**: Keep working files private and record accepted sources/claims explicitly.

### Requirement: Run Completion Is Explicit
**Reason**: There is no global run authority in the current workspace.
**Migration**: Complete individual subflows and derive project status from controls.

### Requirement: Adaptive Case Actions Are Descriptor-Governed
**Reason**: Adaptive case actions and descriptors are removed.
**Migration**: Use current selectors and their typed semantic inputs.

### Requirement: Decision-qualified obligation readiness
**Reason**: Obligation readiness is removed with CaseState.
**Migration**: Declare branch and Gate dependencies in the project profile and owning controls.

