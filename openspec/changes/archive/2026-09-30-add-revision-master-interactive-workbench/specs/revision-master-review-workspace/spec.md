## Purpose

Define a frozen, task-local revision-master workbench that lets users review linked revision artifacts and return explicit advisory feedback without transferring semantic or graph authority to the browser.

## ADDED Requirements

### Requirement: Independent business snapshot and result contracts

The workbench SHALL use the distinct contracts `revision-master-review-workspace.v1` and `revision-master-review-result.v1`. A snapshot SHALL identify its task, snapshot, draft workspace, handoff stage, and exact graph run/node and applicable round. It SHALL preserve business identities, original review documents and spans, threads, atomic comments, their many-to-many relations, workboard entries, generated strategy cards, material status, relevant manuscripts, revision logs, and thread replies included in the review. Display block identities SHALL be separate from business identities. Every new handoff SHALL have a new snapshot and isolated draft identity.

#### Scenario: Split and merged comments are reviewed

- **WHEN** multiple original threads contribute to an atomic comment or one thread produces multiple atomic comments
- **THEN** all relations and source provenance are preserved and navigable
- **AND** a changed business object is not silently substituted under an unrelated object's identity

#### Scenario: A later round uses the same comment ID

- **WHEN** the graph opens another revision round containing an existing comment
- **THEN** the new snapshot identifies that exact round and does not inherit an old draft or confirmation by comment ID alone

### Requirement: Consistent and bounded frozen preparation

The Agent SHALL retain a trusted snapshot, captured sources, and per-scope semantic dependency baselines outside `researchspec/`. Preparation SHALL read a consistent, task-bounded SQLite view and generate displayed material from that view. It SHALL retain the complete visible content and dependencies for the selected task and relevant rounds, without delivering the whole database to the browser. Preparation and inspection SHALL NOT initialize, repair, backfill, or otherwise write SQLite. Missing required data or changes during capture SHALL be reported before publishing a review artifact.

#### Scenario: Preparation encounters an incomplete database

- **WHEN** required semantic fields or tables are unavailable
- **THEN** preparation reports the missing prerequisite without modifying the database or presenting an incomplete candidate as ready for confirmation

#### Scenario: Source and semantic state change during preparation

- **WHEN** the captured files and database view cannot be established as one consistent candidate
- **THEN** the Agent rebuilds or resolves that candidate before delivering the HTML

#### Scenario: Derived Markdown changes

- **WHEN** a derived view is regenerated with different formatting
- **THEN** the semantic baseline remains tied to business data and captured source content rather than parsed Markdown or its modification time

### Requirement: Direct local HTML delivery and complete source access

The Agent SHALL deliver a prepared local HTML artifact with its frozen data embedded, usable without a server, network service, or manual snapshot import. The workbench SHALL primarily show the selected item's related manuscript excerpts and list all associated locations, while providing directory access to complete frozen original review documents and relevant manuscripts in the same artifact. Markdown, QMD, single-file LaTeX, and LaTeX projects SHALL follow existing source capture, safe rendering, and readable source fallback rules. Rendering tools SHALL remain subject to the host's execution authorization.

#### Scenario: The user opens the handoff

- **WHEN** the user directly opens the prepared HTML file
- **THEN** the intended stage and frozen candidate are available without importing another file
- **AND** the Agent retains the corresponding trusted snapshot independently

#### Scenario: A location is unknown or a rendering tool is unavailable

- **WHEN** an item cannot be located reliably or its source cannot be rendered through an available tool
- **THEN** the source remains readable, its limitation is visible, and no invented location is presented

### Requirement: Four stage handoffs preserve execution focus

The Agent SHALL proactively offer coverage review at the atomization handoff once intake, manuscript analysis, and atomization have produced the complete mapping candidate; whole-workboard review after planning; individual current-strategy review during execution; and revision/response review near the end of each graph revision round. Materially changed candidates SHALL receive a new handoff. The workbench SHALL keep other items browsable despite local blockers and SHALL distinguish browsing selection from the Agent's execution focus.

#### Scenario: The user browses a blocked or inactive item

- **WHEN** the user navigates to another item or reviews its blocking materials
- **THEN** browsing does not change execution focus, node eligibility, or the active strategy
- **AND** an explicit focus request is exported for the Agent to evaluate

#### Scenario: A round contains multiple manuscript edits

- **WHEN** the Agent completes the round's candidate edits and replies
- **THEN** it offers a round review covering those candidates without requiring a separate browser handoff for every edit

### Requirement: Each stage exposes its complete review candidate

Coverage review SHALL expose original reviewer/editor documents and source spans, coverage and omissions, split/merge explanations, all thread-to-atomic relations, and related manuscript locations. Board review SHALL expose each item's priority, dependencies, evidence gaps, locations, next action, status, and the whole candidate's pending confirmations. Current-strategy review SHALL expose execution focus, stance and rationale, modification actions, evidence plan, material gaps, questions, candidate wording, and completion conditions. Round review SHALL expose all related before/after locations, revision logs and evidence, thread-organized replies, coverage and omissions, actual delivery-file status, and pending formal controls. Each view SHALL explain the current review scope, unresolved matters, and next step. Agent semantic status, user draft status, and frozen formal graph status SHALL be distinguishable; unknown values SHALL be marked as unknown rather than inferred from SQLite resume state or demonstration constants.

#### Scenario: The user reviews a strategy with missing material

- **WHEN** the active strategy depends on unavailable evidence
- **THEN** its plan, candidate wording, questions, completion conditions, and material blocker remain inspectable without implying formal completion

#### Scenario: The user inspects round readiness

- **WHEN** the round preview is opened
- **THEN** the page distinguishes candidate edits, replies and actual file status from user feedback and graph controls awaiting separate confirmation

### Requirement: Ledger navigation and bounded interaction

The workbench SHALL use the approved artifact-ledger layout with lists, search, reviewer and status filters, complete relation lists, and bidirectional navigation. It SHALL retain one-to-many and many-to-one links and multiple manuscript locations. Filtering SHALL neither change confirmation scope nor discard drafts. The displayed document projection SHALL be bounded to the selected object, document, or section; routine typing, highlighting, and navigation SHALL NOT rerender all retained manuscript content. Core interactions SHALL be keyboard usable and usable at narrow viewport widths.

#### Scenario: A filtered list hides an item with feedback

- **WHEN** the user applies a filter after annotating an item
- **THEN** the feedback remains in the draft and complete export, and whole-board confirmation still covers the full candidate board

#### Scenario: A large frozen manuscript is inspected

- **WHEN** the user types a note or selects a related location
- **THEN** only the relevant displayed projection updates while the full frozen content remains reachable

### Requirement: Feedback and internal confirmation are explicit and distinct

The result SHALL separately record targeted dispositions and adjustment requests, independent annotations, explicit scoped internal confirmations, a round seen marker, focus requests, and an overall note. Adjustment requests SHALL identify their target object or relation and retain the Agent's original candidate. Coverage confirmation SHALL bind the complete mapping candidate; workboard confirmation SHALL bind the complete board; strategy confirmation SHALL bind the current strategy candidate and its dependencies. Visiting, default dispositions, exporting, or marking a round seen SHALL NOT imply confirmation. Substantive unresolved feedback or a needs-adjustment disposition SHALL keep the affected scope pending.

#### Scenario: The user requests a split or dependency change

- **WHEN** the user submits an adjustment request against a comment or relation
- **THEN** the result preserves the original candidate and the requested change for Agent processing rather than directly editing semantic fields

#### Scenario: The user exports without clicking confirm

- **WHEN** a result is exported after browsing or marking the round seen
- **THEN** it contains no inferred confirmation

#### Scenario: One strategy changes after confirmation

- **WHEN** the Agent changes the confirmed strategy or an applicable dependency
- **THEN** that candidate scope requires renewed review
- **AND** previously applied independent confirmations remain effective when their own dependencies remain unchanged

### Requirement: Material status and reliable before-after comparison

The page SHALL show evidence gaps, proposed supplements, received-material status, and blocking reasons. Supplement files SHALL be delivered to the Agent for checking and semantic intake. Round review SHALL show frozen before/after excerpts for every related location, associated revision logs, and thread-level replies. Change highlighting SHALL require reliable pairing; otherwise both texts and the pairing limitation SHALL remain visible.

#### Scenario: The user proposes additional evidence

- **WHEN** the user writes a material suggestion in the page
- **THEN** it is exported as feedback and file reception remains with the Agent

#### Scenario: Two locations cannot be reliably paired

- **WHEN** a before/after relationship is ambiguous
- **THEN** the page presents both frozen texts without claiming an automatically aligned change

### Requirement: Complete exports and isolated recoverable drafts

Every export SHALL contain the original frozen workspace, its task and graph context, snapshot and draft identities, a unique result identity, local export revision and time, and all current feedback categories. Feedback entries SHALL have stable identities within the draft. Browser drafts SHALL be isolated by workspace and snapshot. Export revision and time SHALL NOT establish ordering across browsers. Unavailable or failed local storage SHALL be surfaced while allowing review and export of the current in-memory draft. Embedded data and user text SHALL remain inert content rather than executable markup.

#### Scenario: Two browsers export the same snapshot

- **WHEN** their local revisions or feedback disagree
- **THEN** neither revision number nor timestamp alone chooses an authoritative result

#### Scenario: Draft persistence fails

- **WHEN** the browser cannot save a draft locally
- **THEN** the user can export the current feedback and is informed that local recovery is unavailable

### Requirement: Trusted validation and dependency-scoped acceptance

Before accepting feedback, the Agent SHALL validate contract versions, task and snapshot identity, exact context, unique identities and valid references, annotation anchors, and unchanged frozen candidate content against its separately retained snapshot. It SHALL compare each feedback or confirmation scope's semantic dependencies and captured material with current state. Coverage and whole-board scopes SHALL include complete membership and relation dependencies; strategy scopes SHALL include linked sources, evidence and manuscript content. Unchanged independent scopes MAY be accepted. Changed, ambiguous, or unassessable scopes SHALL show the relevant differences and remain pending for renewed review. Processing earlier feedback SHALL trigger re-evaluation of remaining affected scopes.

#### Scenario: Only an independent strategy changes

- **WHEN** feedback for A-01 is returned after an unrelated A-02 change
- **THEN** A-01 may be accepted if its complete dependency scope is unchanged
- **AND** any affected board, coverage, or strategy confirmation remains pending

#### Scenario: A new mapping member appears

- **WHEN** a coverage or board result is returned after new members or relations were added
- **THEN** the whole candidate confirmation is rechecked and cannot be accepted from a subset comparison

#### Scenario: A result substitutes its embedded candidate

- **WHEN** a result carries altered frozen content, invalid anchors, or mismatched task, snapshot, or round context
- **THEN** the Agent rejects that unsupported result before semantic writes

#### Scenario: A scope lacks sufficient dependency evidence

- **WHEN** the Agent cannot establish whether the relevant scope changed
- **THEN** it pauses that scope without automatically relocating annotations or transferring confirmation

### Requirement: Minimal transactional processing records

The existing task-local SQLite database SHALL retain the minimum result and feedback identities, processed payload or equivalent comparison data, per-scope processing states, and references to accepted semantic effects needed to reconcile repeated exports. A semantic database write and its successful processing record SHALL commit in the same transaction, with the applicable database dependency scope rechecked before the write. Preparation and inspection SHALL remain read-only. New or edited feedback SHALL be checked again; unchanged applied feedback SHALL NOT cause duplicate writes. Deleting feedback in a later full export SHALL NOT undo completed semantic effects. Conflicting exports SHALL require reconciliation instead of automatic last-writer selection.

#### Scenario: An unchanged full result is returned again

- **WHEN** a feedback entry is already successfully applied with the same payload
- **THEN** its semantic effect is not applied twice

#### Scenario: The user removes or edits a prior annotation

- **WHEN** a later export removes an applied annotation or changes its contents
- **THEN** removal alone does not reverse the applied effect, and edited feedback undergoes a new dependency check
- **AND** reversal requires an explicit request

#### Scenario: The database transaction fails

- **WHEN** the semantic write cannot commit
- **THEN** no successful processing record commits for that write

#### Scenario: Semantic dependencies change between inspection and acceptance

- **WHEN** a scope inspected as unchanged has different database dependencies when its write is attempted
- **THEN** its mutation and successful processing record are withheld until the difference is reconciled

#### Scenario: A manuscript write has uncertain completion

- **WHEN** processing is interrupted around a physical file change or revision log write
- **THEN** the Agent checks actual file and log state before retrying or recording success and does not treat SQLite atomicity as covering the file system

### Requirement: Agent-owned application and formal confirmation

The browser SHALL only retain local drafts and export advisory results. The Agent SHALL process accepted changes through existing package-local semantic operations and regenerate derived views and a new snapshot as appropriate. Pending or conflicting feedback SHALL remain traceable through that handoff. Formal Gate verdicts and Decision choices SHALL require separate human confirmation in Agent dialogue and mutation through ResearchSpec CLI. The page SHALL expose required evidence and pending formal status without offering a binding verdict. Browser failure SHALL allow the same scope to be reviewed in Agent dialogue.

#### Scenario: An internal confirmation is accepted

- **WHEN** the Agent accepts coverage, board, or strategy confirmation against its candidate
- **THEN** only the applicable semantic state is recorded and no formal graph control is automatically decided

#### Scenario: The browser cannot be used

- **WHEN** the user cannot open or operate the page
- **THEN** the Agent presents the same candidate and confirmation scope in dialogue and follows the same semantic and formal authority boundaries
