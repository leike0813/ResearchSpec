# Revision Master Review Workbench Runtime

This directory holds the project-owned, standard-library-only resources that
back the interactive revision-master review workbench. They are delivered
through the existing authoring chain as `source_path` assets; the upstream
extracted scripts and their provenance index are untouched.

## Resources

- `review_workbench.py` — task-bounded read-only projection, dependency scope
  comparison, and the receipt transaction used when feedback is accepted.
- `receipts.sql` — the minimum result/feedback receipt DDL. Executed only
  inside an explicit semantic initialization or acceptance write.
- `README.md` — this operating guide.

Run the tool with the project interpreter:

```bash
uv run --project="$HOME/.ar" --locked -- python <package>/workbench/review_workbench.py project \
  --db <task>/revision-master.db --project-root <task> --context <task>/workbench-context.json
```

Every command prints one JSON document and exits `0`, or prints a structured
`{"ok": false, "error": {"code", "message", "details"}}` and exits `2`.
`--project-root` is the only source of file bytes: the tool reads and hashes the
actual source files itself. No caller-supplied hash list is trusted.

## Projection

`project --db DB --project-root ROOT --context CTX` reads the task database
with a `mode=ro` SQLite URI and emits exactly:

- `context` — echoed verbatim from the caller's exact graph selector. It is
  never inferred from SQLite.
- `business` — every registered table as explicit typed rows, with the same
  shape the TypeScript workspace schema validates. Tables that a legacy
  database may lack project as empty arrays; a missing required table or column
  is a `missing_required_data` prerequisite error instead.
- `scopes` — `coverage`, `board`, one `strategy:<comment_id>` per atomic
  comment, and `round`. Each carries prefixed target ids and a baseline of
  filtered tables plus `{path, sha256}` files hashed from `--project-root`.
  Only the active comment's strategy scope can carry a confirmation, but every
  card stays independently checkable.
- `pending_feedback` — still-pending or conflicting receipts from earlier
  results, carried forward for traceability.
- `unresolved` — referenced paths that do not resolve to a readable file under
  the task root. They are surfaced so the prepared page can show the unlocated
  material, and they make the owning scope unassessable rather than silently
  passing.

`coverage` and `board` baselines are the whole current set, so an added or
deleted member is always visible. `strategy` is filtered to the active comment
and its threads, sources, evidence, drafts, and linked supplement material;
`round` is filtered to its threads and comments while the round-wide log,
plan, response, file-state, and export tables stay complete.

Read-only preparation never initializes, migrates, repairs, or renders the
database, and never reads another task. Capture, document/block assembly,
anchors, and the frozen HTML remain outside this module.

## Preparing the HTML

Use the exported `researchspec/review-workspace` API from the installed package.
The context file must contain `task_id`, the exact `node:<run>/<node>[@<round>]`
selector, matching `run_id`, `node_id`, `round_id` (null before execution),
`stage`, frozen `formal_status`, and `active_comment_id` (or null). Read those
values from the current graph instructions. Never infer the round from SQLite.

```javascript
import { prepareRevisionMasterReview, readRevisionMasterProjection,
  validateRevisionMasterResult } from 'researchspec/review-workspace';
import { readFile } from 'node:fs/promises';

const context = JSON.parse(await readFile(contextPath, 'utf8'));
const ready = await prepareRevisionMasterReview({
  projectRoot: taskRoot, workRoot: `${taskRoot}/reviews`,
  title: '修订审阅', context,
  readProjection: () => readRevisionMasterProjection({
    toolPath, dbPath, projectRoot: taskRoot, contextPath,
    python: { command: 'uv', args: ['run', `--project=${arProject}`, '--locked', '--', 'python'] },
  }),
  documents: [{ document_id: 'manuscript', title: '当前稿件',
    source_path: manuscriptRelativePath, role: 'manuscript' }],
  sourcePaths: relevantProjectFiles,
  templatePath: packageHtmlPath,
  nextStep: '导出结果交回 Agent，正式关口在对话中确认',
});
// Deliver ready.htmlPath; independently retain ready.workspacePath and sources/.
const checked = validateRevisionMasterResult(
  JSON.parse(await readFile(returnedResultPath, 'utf8')),
  JSON.parse(await readFile(ready.workspacePath, 'utf8')),
);
```

The variables above are Agent-resolved task and installed-package paths.
`sourcePaths` contains the complete relevant LaTeX/QMD project sources; supplied
`blocks` may come from an independently authorized frozen render. Without a
render, captured source remains readable. The preparation API captures sources,
rechecks the SQL projection and file contents, and publishes a fresh workspace
and HTML only after validation. Do not open the unprepared package template.

## Checking a returned result

`check --db DB --project-root ROOT --snapshot SNAP [--context CTX]` recomputes
each delivered scope baseline from current rows and current file bytes and
reports, per scope, the added, removed, and modified rows and files, with
`unchanged`, `changed`, or `unassessable` status. It rejects a snapshot whose
context is not the exact required selector, and rejects a `--context` that
differs from the snapshot context.

## Accepting feedback

```bash
uv run --project="$HOME/.ar" --locked -- python <package>/workbench/review_workbench.py accept \
  --db <task>/revision-master.db --project-root <task> --result <task>/result.json --snapshot <task>/snapshot.json \
  --trusted <task>/retained-snapshot.json --context <task>/workbench-context.json \
  --accept-feedback f1 --accept-feedback f2 --write <task>/semantic_write.py:apply
```

Acceptance requires the separately retained snapshot, the current context, and
an explicit `--accept-feedback` selection: a whole result is never bulk
approved. Selected ids must exist in the result; unselected feedback is echoed
back untouched. The tool then, inside one `BEGIN IMMEDIATE` transaction:

1. re-derives every affected scope baseline and withholds feedback whose
   rows, file bytes, or locatable source material changed after inspection
   (unlocatable material is `unassessable_source`);
2. describes each feedback as already applied, newly applied, pending, or a
   conflicting payload before writing anything;
3. for each selected entry still pending a write, calls the caller-supplied
   `--write FILE.py:function(connection, plan)` and records its returned effect
   reference before moving to the next entry, so a later entry is judged
   against the effects already committed in this transaction;
4. commits applied, pending, and conflict receipts once, or rolls everything
   back on any failure.

Only the round `seen` marker is recorded without a callback. Adjustments,
defers, focus requests, overall notes, annotations, and confirmations all need
the callback's real disposition reference; without a callback they fail with
`semantic_write_required` rather than being marked handled.

Feedback that is returned but not selected is never applied: it is recorded as
`pending` metadata whose note carries the reason `not_selected`, the entry's
target, and its note (cut at 500 characters); a changed payload for an already
recorded feedback is stored conservatively as `conflict` instead of being
ordered against it. The full entry stays in the agent's retained result, which
`pending_feedback` addresses through `result_id` and `feedback_id`. An existing
receipt for the same payload is left untouched, so an already applied item is
never downgraded, and the next `project` surfaces everything still unresolved
through `pending_feedback`. A failed transaction rolls these metadata rows back
with the rest.

A returned result is never executed as SQL. The write callback is the only
semantic mutation path and receives the open connection plus the accepted
feedback, so existing parameterized recipe writers can reuse it. It must return
the effect it applied (a record id, a plan action id, or a small object); an
empty return fails the transaction, so a successful receipt always names its
real effect. A failed callback rolls back both the semantic write and its
receipts. Repeated feedback with an identical payload is skipped; feedback with
a different payload pauses as a conflict. An in-place edit or a reconciled
cross-browser disagreement is accepted by re-running with `--allow-update`,
which still rechecks the scope first. Removing feedback from a later export
leaves its applied receipt and semantic effect in place; reversal needs an
explicit request.

The callback implements the reviewed business operation, not a generic SQL
patch from user text. For a strategy confirmation, use the parameterized
`recipe_stage5_confirm_strategy` in `knowledge/sql-write-recipes.md`
on the supplied connection: clear that card's pending confirmations, update
its completion state and local resume material, then return its comment id and
updated record reference. Keep independent confirmations; mark confirmations
affected by a changed source, mapping, dependency or strategy as pending for
renewed review. Coverage and board adjustments rebuild those candidates through
their existing recipes before generating a new handoff.

For manuscript feedback, reconcile the actual working file first. Use the
existing `capture_revision_action` payload validation and `insert_revision_log`
with the supplied connection so its log and the successful receipt commit
together. The physical file edit is outside that database transaction: if an
interruption leaves its completion uncertain, inspect the file, plan/log links
and receipts before choosing the next action. Do not replay an edit merely
because its receipt is absent. Keep the frozen source copy intact.

Scope receipts key on snapshot identity, so a confirmation or disposition does
not transfer to a new snapshot by business id.

## After acceptance

This tool owns database receipts and never touches the file system beyond the
database. The Agent reconciles actual manuscript files, revision logs, and
receipts before claiming completion, then runs the existing `gate-and-render`
path to regenerate derived views and prepare the next snapshot. Formal Gate
verdicts and Decision choices remain separate dialogue steps through
ResearchSpec.
