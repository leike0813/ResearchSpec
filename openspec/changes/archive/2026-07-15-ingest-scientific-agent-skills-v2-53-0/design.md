## Context

ResearchSpec already pins and audits Scientific Agent Skills v2.53.0, distributes 130 ToolUniverse Skills, models 213 ANZSRC Group domains plus five tool domains, and assembles isolated vendor bundles through Registry Schema 1. The Scientific Agent Skills audit accounts for 147 Skills but deliberately grants no production admission: eight are hard exclusions, 66 are blocked for review, 64 need curation, and nine need standard adaptation. The second vendor also introduces mixed Skill-level licensing, 41 Critical/High scanner summaries, platform metadata, environment contracts, executable resources, incomplete dependency structure, and semantic overlap with ToolUniverse and the fixed ARSU surface.

The user has selected complete review of all 139 business candidates. Production admission must therefore be an explicit reviewed allowlist rather than a readiness-label filter, and the final admitted count must follow evidence rather than a target quota.

## Goals / Non-Goals

**Goals:**

- Resolve every v2.53.0 audit record into an evidenced admitted or excluded production decision.
- Generate a deterministic, isolated Scientific Agent Skills bundle containing only reviewed content.
- Preserve domain-only installation, cross-vendor hard dependency closure, stable ANZSRC/tool domains, and central registry ownership.
- Keep upstream scripts inert and preserve every generated or excluded file decision in a reproducible manifest.
- Make either vendor converter safe to run without erasing or invalidating the other vendor.

**Non-Goals:**

- Upgrade the pinned upstream revision, certify third-party services, execute scripts, install dependencies, configure credentials, or perform dynamic security testing.
- Add domains, CLI commands, workspace schema fields, registry schema versions, wrapper types, runtime bridges, or vendor-selectable installation.
- Rework ToolUniverse content, ingest prohibited document Skills, admit workflow authorities, or create substitutes for the fixed ARSU/Companion surface.

## Decisions

### Use complete reviewed policy catalogs as converter inputs

The converter consumes the immutable machine audit plus separate admission, dependency, and resource decision catalogs. Admission covers all 147 source Skills exactly once and records generated ID, disposition, license evidence, static security resolution, content review, ARSU and ToolUniverse overlap, and reasons. Dependency decisions classify every reviewed relation and may remap a hard target to an admitted global Skill. Resource decisions contain only explicit deviations from the default full-tree copy.

Separating audit observations from production conclusions preserves the original evidence and prevents generated output or converter code from becoming a hidden policy store. Missing, duplicate, contradictory, or stale decisions fail conversion.

### Admit by evidence, never by aggregate audit label

The eight prohibited or authority-owning Skills remain excluded. ARSU surface overlap is excluded. Any semantic overlap with ToolUniverse excludes the Scientific Agent Skills version and cites the corresponding capability. Ambiguous licenses require a verified Skill-content conclusion and available license text. Critical/High findings require static source review. Scientific content is reviewed for capability boundaries and material method claims. A failure that cannot be corrected without changing the intended capability excludes the Skill.

No batch count is normative. The checked-in decision catalog and its evidence determine the generated inventory.

### Prefix generated IDs and keep installation domain-only

Generated IDs use `scientific-agent-skills-<upstream-id>` and the normalized frontmatter name matches the directory. This avoids global conflicts while the domain catalog remains source-neutral. Users select stable domains; no vendor install object or vendor CLI frontier is introduced. Provenance remains inspectable through existing plugin detail surfaces.

### Normalize entries while preserving reviewed resources

The converter removes platform-specific `metadata.openclaw`, maps environment requirements into `compatibility` and prose, normalizes array `allowed-tools`, applies reviewed description overrides, and adds the ResearchSpec authority boundary. Installation and download instructions may remain as target-Agent guidance, but ResearchSpec never performs them.

Admitted Skills copy the complete source tree by default. Explicit resource decisions may remove a file only when the review explains the risk and confirms that the remaining Skill is coherent. Previously undisclosed scripts receive generated entry disclosure. Every output carries an applicable license and a source/revision/adaptation notice.

### Install only reviewed hard dependencies

Only `required` relations enter registry dependency arrays. `related` and `routing` remain explanatory evidence. A required target that is excluded must be made self-contained, explicitly mapped to an admitted equivalent, or cause the source Skill to be excluded. Automatic downgrades are invalid. Cross-vendor targets use global Skill IDs and the existing recursive closure.

### Keep domain membership manually reviewed

Admission does not imply installation. Every generated Skill must occur in at least one existing catalog domain. ANZSRC Fields are evidence only; a reviewer may assign one or more ANZSRC Group or fixed tool domains according to user installation value. Unclassified Skills may enter an existing tool domain only with an explicit fit; otherwise they remain excluded. No new domain ID is created.

### Stage a complete multi-vendor projection before commit

Both converters use a shared staging helper. It copies the current generated plugin surface excluding the target vendor outputs, overlays the newly generated target tree/bundle/manifest/report, runs central assembly against all staged vendors and catalog membership, checks drift, and then commits only the target vendor outputs plus the registry. This preserves converter isolation while ensuring registry validation sees every vendor.

## Risks / Trade-offs

- **Static review cannot prove runtime safety** → Scripts stay inert, decisions cite concrete source evidence, compatibility text assigns execution to the target Agent, and unresolved behavior excludes the Skill.
- **Full resource trees increase package size** → Release verification records the tarball inventory and size; explicit reviewed pruning is available without silent filtering.
- **Manual overlap and domain decisions are labor intensive** → Completeness validators require one decision per candidate and keep membership in a single source-neutral catalog.
- **Vendor-prefixed IDs are longer and expose provenance in detail views** → Domain selection remains vendor-neutral and the prefix prevents collision or hidden aliasing.
- **Cross-vendor staging copies existing generated assets** → Deterministic hashes and idempotence checks ensure copied assets are unchanged and only the target vendor can be committed.

## Migration Plan

1. Add and strictly validate the OpenSpec contracts and reviewed policy catalogs.
2. Add shared staging and refactor ToolUniverse to use it without changing its generated bytes.
3. Implement and dry-run the Scientific Agent Skills converter against the pinned checkout.
4. Add reviewed memberships, generate the new vendor outputs, and centrally reassemble the registry.
5. Update documentation, package whitelist, release verifier, and tests; run converter and full release verification.

Rollback removes Scientific Agent Skills memberships and generated vendor outputs, then reassembles the registry from the unchanged ToolUniverse bundle. Workspace lifecycle already treats a selected domain that becomes empty as unavailable recovery state and permits safe snapshot-based uninstall.

## Open Questions

None. Admission outcomes are evidence produced under the locked review rules, not unresolved product choices.
