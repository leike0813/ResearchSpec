## REMOVED Requirements

### Requirement: Branch Decisions Select One Transition
**Reason**: Branch Decisions move to graph `decisions` whose options unlock declared nodes.
**Migration**: Declare decision options and unlocks in graph profile schema `"2"`.

### Requirement: Parent transitions wait for child joins
**Reason**: Parent/child joins move to graph prerequisites and `parallel_groups` join policies.
**Migration**: Declare node prerequisites and join policies in the graph profile.

### Requirement: Revision branch controls repeatable rounds
**Reason**: Revision loops move to the graph `revision_round_template`.
**Migration**: Pair repeatable revision/review nodes with the graph revision template.

### Requirement: Integrity Gates cannot be bypassed by pipeline entry
**Reason**: Integrity Gate blocking moves to graph Gate prerequisites and entry evaluation rules.
**Migration**: Declare required Gate IDs on the affected nodes and test mid-entry runs.

### Requirement: Gate Authority Is Local To The Owning Control
**Reason**: Gate attempts now live in the owning node/run instance file.
**Migration**: Record Gate attempts through `decide gate:<run>/<node>` in the owning node file.

### Requirement: Failed-Gate Override Is One Decision
**Reason**: Override semantics are preserved but now embedded under the owning graph Gate.
**Migration**: Store override approver, timestamp and reason under the owning node file Gate entry.

### Requirement: Advance Is Separate From Confirmation
**Reason**: The separation is preserved by `decide` versus `advance node:`/`advance run:` semantics.
**Migration**: Keep human confirmation and engine advancement as distinct commands and state writes.
