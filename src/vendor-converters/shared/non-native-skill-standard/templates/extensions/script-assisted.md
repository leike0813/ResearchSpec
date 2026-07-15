## Bundled commands

Add this extension only when deterministic work is part of the reviewed
capability. Insert each command at its exact workflow step and retain the full
contract below in the final `SKILL.md`.

### `<<command-name>>`

Path: `scripts/<<command-file>>`

Use when: <<observable trigger and workflow step>>

Command:

```bash
<<portable interpreter or executable>> scripts/<<command-file>> <<minimal arguments>>
```

Input:

- `<<input>>`: <<meaning, source, allowed values, and validation>>

Output and side effects:

- <<stdout or written artifacts, including overwrite behavior and provenance>>
- <<network, subprocess, compute, or filesystem effects, or state explicitly that none occur>>

Dependencies:

- <<user-managed module, command, service, version constraint, or “standard library only”>>

On failure:

- <<how to classify the failure, what remains valid, and whether to stop, ask,
  diagnose, or use a reviewed alternative; never install dependencies automatically>>

Admission also requires a representative offline or mocked copied-tree test.
The command must not import ResearchSpec source or rely on repository-local
paths.
