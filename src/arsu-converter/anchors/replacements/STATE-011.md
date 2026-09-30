### ResearchSpec Current Owner

Replacement scope: `STATE-011` for `academic-pipeline` checkpoint steps.

Read current state with `status --json` and the owning selector's `instructions`.
Present the actual deliverables and check findings. Obtain each formal Gate
verdict and Decision through its own human confirmation, then use the specified
CLI mutation; only that owning record closes the control. Advisory observer
output is available for reflection and cannot become a blocking criterion.

Current state lives in `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`.
Describe semantic exchange in `researchspec/runs/<run-id>/handoff.md` through the
CLI's handoff instructions. Preserve the scope of the user's actual choice;
missing confirmation remains unresolved. An upstream ledger is not shipped
and does not receive checkpoint events.
