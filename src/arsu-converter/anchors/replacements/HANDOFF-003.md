> **Convention**: ARS Markdown schemas remain human-readable payload formats,
> but ResearchSpec contracts and runtime records are the stable interfaces.
> Producers must validate every required payload field, emit the payload as an
> artifact, and return it to the runtime for registration in
> `researchspec/runs/current/artifact-registry.json`. Project research intent,
> sources, claims, and manuscript constraints into their corresponding
> `researchspec/specs/*` files only through accepted contract changes. Missing
> required fields trigger `HANDOFF_INCOMPLETE`; consumers must not proceed with
> a partial handoff.
