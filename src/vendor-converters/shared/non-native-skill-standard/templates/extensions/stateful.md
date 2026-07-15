## Skill-local state and gates

Add this extension only when the Skill must resume multi-stage work or prevent
unsafe stage skipping. Skill-local state supports this Skill and never replaces
ResearchSpec CLI workflow state, Gates, Decisions, or artifact registration.

State root: `<<relative run-directory convention>>`

Authority:

- <<Name the machine state file or database that is authoritative inside one
  Skill run. Distinguish derived reports and human-readable views.>>
- <<State ownership, allowed writers, atomic-write or corruption handling, and
  behavior when state is absent or inconsistent.>>

Transitions:

| Current state | Required evidence | Allowed next state | Blocking result |
| --- | --- | --- | --- |
| <<state>> | <<files, decisions, or validation>> | <<state>> | <<repair or user action>> |

Gate invocation:

```bash
<<portable command that inspects state and returns the next allowed action>>
```

Resume procedure:

1. <<Locate the run without guessing or creating a replacement.>>
2. <<Run the read-only status or gate command.>>
3. <<Inspect blockers and preserved artifacts.>>
4. <<Continue only from the returned allowed transition.>>

Completion:

<<State the final gate condition, required artifacts, validation, and what is
returned to the user. Include recovery for missing, corrupt, or stale state.>>
