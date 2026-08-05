# Design

## Source and projection

The exact operational source is staged under `vendor/paper-humanizer/upstream/`
and bound to commit `1a31f2d0ff6dab94c799f7ae1a3a469aea3e5394`. The converter is
the single writer for `skills/paper-humanizer/`; it copies static source bytes,
adds ResearchSpec metadata, and fails closed on source or output drift.

The projected tree contains the upstream Skill instructions, review/full
playbooks, diagnostic and document-contract references, and the two Python
entrypoints. `agents/openai.yaml` remains excluded to preserve agent-neutral
delivery. The runtime scripts are copied without a JS/TS translation and use
only the Python standard library.

## Runtime boundaries

The Python full-workflow `state.yaml` and rendered views remain task-local
material below `work/paper-humanizer/`. ResearchSpec `control.yaml` remains the
sole lifecycle, Gate, Decision, and transition authority. The generated
instructions state this distinction explicitly.

The TypeScript files under `src/core-skills/paper-humanizer/` are removed;
tests invoke the published Python scripts as subprocesses. The maintainer
converter remains TypeScript because it is static file tooling, and it never
imports or executes the generated Python.

## Converter contract

`convert`, `check`, and `idempotence` inspect the vendor snapshot and generated
tree. `convert` supports the repository's existing safe-generation behavior;
`check` rejects missing, extra, stale, or forbidden runtime files; and
`idempotence` proves a second projection has no byte drift. The converter emits
source, license, metadata, exclusion, and aggregate-tree hashes in its JSON
result.
