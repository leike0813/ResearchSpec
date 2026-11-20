# Design

## Context

The maintenance catalog binds one active checkout, audit and production projection. The candidate source can be reviewed in a temporary checkout while production policy remains valid for the active pin.

## Decisions

- Compare tagged Git trees, inventory the 177 current Skills and record the four removals in the incremental review. Bind the finished audit to the candidate commit. The production catalog advances with the submodule and complete policy set.
- Carry scanner findings as dated upstream evidence. Review changed entries and resources against the current checkout, retain applicable curation decisions and collect the required maintainer actions.
- Use the existing vendor converter's staged dry-run before publication. The extension generator uses its previous catalog to identify retired resources and removes only its own declared paths after generating the successor projection.
- Use the existing domain catalog, validators and semantic review workflow. Complete records and verify the new anchor after regeneration.

## Risks and trade-offs

Source metadata and production changes can affect many packages, so compare produced bytes and review every affected capability. Scanner coverage is incomplete and its retained rows predate changes to the source. Keep the scan date and review limitations visible in the new audit.
