# Design

## Context

See proposal.md. The HTML assets are canonical copies projected into capability packages. Existing validators compare submitted workspaces with separately retained frozen snapshots. Browser drafts are scoped by workspace/snapshot and by browser origin.

## Goals / Non-Goals

**Goals:** explicit user export becomes an acknowledged local file write; retain complete exports and recoverable drafts, and provide an optional bounded wait.

**Non-Goals:** server-side draft synchronization, model execution, semantic acceptance, workflow mutation, old v1 migration, or a new public CLI command.

## Decisions

- Export `startReviewSession({projectRoot, workspacePath, assetPath})` through `researchspec/review-workspace`. Validate and retain the workspace on startup. The artifact directory is the real parent of `workspacePath`, inside the project and outside `researchspec/`; outputs cannot be caller-selected HTTP paths. A packaged Node module entry starts the service for host Agents.
- Serve one frozen page and inject a shared inline bridge before its main script. Only session rendering changes `connect-src 'none'` to `'self'`. The bridge supplies the retained workspace, fixed output path, and submission function. Generic v2 automatically imports it; revision-master uses its existing safe data embedding. Offline files keep their current CSP and explicit download fallback.
- Listen only on `127.0.0.1` with an OS-selected first port; retain the port in `review-session.json` next to the snapshot. Reopening a session requires that port and the same snapshot. A fresh session token protects each service lifetime; Host, Origin and content type checks reject unrelated requests. Limit request bodies to 64 MiB and time-bound incoming requests. Serve no project directory.
- Each request carries a UUID submission identity and unchanged result document. The common bridge retains identity for an identical pending payload across retries. Serialize writes, validate against the retained snapshot, publish `results/<submission-id>.json` without replacing history, then atomically replace `result.json`. A failed publication returns failure and preserves existing results. A matching retry repairs incomplete fixed-file publication; conflicting identity reuse is rejected. A successful duplicate never makes an older result current again.
- `waitForResult({after?, timeoutMs?, signal?})` is opt-in and returns a committed receipt with exact file paths. It observes successful submissions in this server lifetime, including one that arrived before the wait call; `after` resumes after a receipt. It rejects on timeout, cancellation or service closure. Agents arm it when presenting the page and can always read retained files after a restart. It never executes semantic actions.
- Draft editing remains browser-local. UI advances export revision only after acknowledged submit, preserves edits made during an in-flight request, and leaves failed results retryable. A separate download action shares result construction without claiming that the browser actually saved the file.
- Selection cleanup follows actual selection state and outside cancellation, using existing block-local capture. Protect tool activation so pointer/keyboard selection cleanup cannot consume a valid annotation before the click handler.

## Risks / Trade-offs

- A browser must reach the Agent host's loopback service. Remote hosts require their existing local forwarding; otherwise offline download or dialogue remain explicit alternatives.
- Origin reuse preserves ordinary browser drafts across service restarts; an occupied retained port is reported, never silently changed.
- Filesystem and browser acknowledgement are separate: network loss after commit is resolved by retrying the same submission identity. Publishing a history and a current file is not a filesystem-wide transaction; history is preserved when current publication fails.
- Latest receipt is transport order only. Multiple browser drafts remain separate candidates requiring existing conflict reconciliation.

## Delivery

Regenerate affected packages through own-vendor authoring, refresh semantic maintenance evidence and the ARSU aggregate anchor, and run existing parity/idempotence checks. Existing result schemas and the retained v1 file path remain unchanged. Do not archive or commit this change as part of implementation.
