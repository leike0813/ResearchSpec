## Bundled resources

Add this extension only for files consumed by the Skill, a bundled command, or
an explicitly documented external adapter. Do not create `assets/` or
`references/` merely to make the tree look complete.

### `<<resource-path>>`

Use when: <<exact workflow step or mode>>

Consumer: <<Agent procedure, bundled command path, or named external tool>>

Contribution: <<template fields, controlled vocabulary, prompt behavior, data,
adapter contract, or validation semantics supplied by the resource>>

Validation and failure:

- <<how the consumer detects a missing, incompatible, stale, or invalid resource>>
- <<whether the Skill stops, asks for a replacement, or returns partial work>>

If the resource is a schema, name the bundled consumer and show its invocation.
Do not describe an unconsumed `input.schema.json`, `output.schema.json`,
`parameter.schema.json`, `runner.json`, or `RUNTIME.json` as a ResearchSpec
runtime contract.
