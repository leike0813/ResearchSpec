### ResearchSpec Current Owner

Replacement scope: `STATE-010` for `academic-pipeline` run evidence.

ResearchSpec CLI owns run, node, Gate and Decision state. The upstream run ledger
and its deterministic replay are not shipped. Recover current workflow state
through `status --json` and the exact selector's `instructions`; inspect the
current material paths and actual command results before continuing semantic work.
State lives in `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`; semantic
exchange is described in `researchspec/runs/<run-id>/handoff.md`.

A session summary or delegated report cannot establish user consent, a passed
check or a completed deliverable. Retain the scope of each actual user decision;
ask for a required unresolved decision through its owning confirmation surface.
Disclose missing execution evidence as `not_checked` and missing material or
approval evidence as unresolved. A supplied ARS ledger is ordinary external
working material and does not authorize a workflow mutation or certify replay.
