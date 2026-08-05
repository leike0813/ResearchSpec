## MODIFIED Requirements

### Requirement: Profile transitions remain data-driven and gate progress
The academic-pipeline profile SHALL include a one-shot `format` child routed to `academic-paper:format-convert`. The accepted branch from review and re-review SHALL unlock `format`; `format` SHALL complete before `final-integrity`; and final-integrity SHALL consume both the selected manuscript source and the rendered output. The profile validator SHALL continue to reject route, gate, branch, and transition drift.

#### Scenario: Review acceptance reaches formatting
- **WHEN** review completes with the `accepted` branch choice
- **THEN** the workflow frontier exposes the `format` child and does not expose `final-integrity` directly

#### Scenario: Re-review acceptance reaches formatting
- **WHEN** a revision round's re-review completes with `accepted`
- **THEN** the next available child is `format`, followed by final-integrity only after formatting completes

#### Scenario: Final integrity consumes source and render
- **WHEN** formatting has completed
- **THEN** final-integrity instructions require both the manuscript source role and the rendered output role
