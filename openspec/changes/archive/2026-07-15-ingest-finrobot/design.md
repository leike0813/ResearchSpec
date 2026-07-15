## Context

FinRobot has no upstream `SKILL.md`. Its immutable audit inventories 146 Git
entries, 66 source-bound knowledge surfaces, five content origins, six license
claims, and six candidate capabilities at revision
`297a8d28d099be328c8a8eb658b4f782b93f3651`. The candidates reference 32
surfaces across twelve root-Apache Python files.

Dependency inspection establishes that none of the twelve files is hard-coupled
to the FinRobot runtime. Four calculation modules have no FinRobot imports and
can be included as reviewed Python resources. Eight prompt/agent resources need
small adaptations: one replaces the FinRobot `data_source` aggregate with
provider Protocols and DTOs, one replaces import-time OpenAI configuration with
a `TextGenerator` Protocol, and six replace import-time OpenAI Agents objects
with provider-neutral AgentSpec JSON.

The root repository declares Apache-2.0 and NOTICE obligations, while stale MIT
package metadata and external, attributed, or unclear source areas prevent
blanket reuse. FinNLP, AutoGen-attributed code, and unclear filing/marker trees
remain excluded. Root-Apache scripts, prompts, and business logic may be copied
or adapted with source hashes and derivation notices.

## Goals / Non-Goals

**Goals:**

- Resolve every audited source entry, surface, origin, claim, candidate,
  dependency, output asset, resource, and Skill relation explicitly.
- Preserve the useful capability of all twelve candidate files, including
  forecasts, probability and sentiment analysis, valuation assumptions,
  targets, ratings, and business conclusions.
- Keep converter, checker, packager, and installer behavior inert while allowing
  generated Skills to carry and invoke reviewed scripts through the target Agent.
- Present six complete trees and their source-to-output derivation manifest for
  human review before production generation.
- Reuse multi-vendor staging and preserve byte-identical outputs owned by the
  other three converters.

**Non-Goals:**

- Initializing or copying FinNLP, AutoGen-attributed code, unclear filing or
  marker trees, logos, real credentials, private endpoints, private datasets,
  local user paths, or other sensitive literal payloads.
- Automatically installing dependencies, configuring accounts, contacting
  services, or executing generated resources during conversion, checking,
  packaging, installation, discovery, or update.
- Owning ResearchSpec workflow state, Gates, Decisions, transitions, or receipts.
- Adding trading or portfolio-management Skills beyond the six selected
  candidates; that is a scope decision, not a business-safety prohibition.

## Decisions

### Bind every production decision to immutable evidence

Every catalog records vendor `finrobot`, release `snapshot-297a8d2`, full
revision, and audit JSON SHA-256. Every included or adapted source also records
Git object, content SHA-256, origin, license claim, required symbols, dependency
closure, output assets, and copied/adapted/omitted symbols. Readiness labels are
evidence, never admission authority.

### Model coupling and production action independently

`finrobot_coupling` is `hard`, `light`, or `none`. `production_action` is
`direct-resource`, `adapted-resource`, `prompt-resource`, `evidence-only`, or
`excluded`. This prevents external provider SDK use from being confused with
FinRobot runtime coupling and prevents executable file type from becoming an
automatic exclusion.

The twelve candidate files resolve as:

- Direct: `catalyst_analyzer.py`, `financial_data_processor.py`,
  `sensitivity_analyzer.py`, and `valuation_engine.py`.
- Adapted: `finrobot/functional/analyzer.py`,
  `enhanced_text_generator.py`, and six selected `equity_agents/*.py` files.
- Hard-coupled exclusions: none.

### Adapt the minimum dependency closure

The original `data_source/__init__.py` must not be copied because it imports
unrelated FinnHub, Reddit, and optional FinNLP components. Instead, analyzer
logic targets explicit `StatementSource`, `FilingSource`, `MarketDataSource`,
and `PeerMetricsSource` Protocols plus DTO inputs. Reviewed optional provider
adapters are derived from `yfinance_utils.py`, `fmp_utils.py`, `sec_utils.py`,
and only the necessary helpers from `utils.py`; credentials and sessions are
injected rather than read from global state.

The enhanced generator targets a `TextGenerator` Protocol. Six agent prompts
are emitted as provider-neutral AgentSpec JSON with JSON Schema output shapes.
Provider names, public endpoints, environment-variable names, placeholders,
installation guidance, and authentication instructions are permitted; actual
secret values and private payloads are not.

### Preserve business capability while making assumptions visible

Form safety does not prohibit forecasts, scores, targets, ratings,
recommendations, or fixed assumptions. Generated resources preserve the source
logic and expose assumptions as explicit, overridable inputs with provenance.
Capability-fidelity checks assert exported functions, schemas, prompt roles,
and analytical outputs instead of rejecting financial vocabulary.

### Keep distribution inert, not blunt

ResearchSpec conversion, checking, packaging, installation, discovery, and
update only read, validate, hash, copy, adapt, and render files. They never
import or execute generated Python, install its external dependencies, read
credentials, or contact providers. Offline syntax and fixture tests may execute
reviewed adapted modules during development; installed Skills run only when the
target Agent invokes them under the user's environment and authority.

### Admit six independent Skills

The six neutral Skill IDs remain fixed. Registry Schema 1 dependencies remain
empty because pandas, numpy, provider SDKs, and service credentials are
user-managed external dependencies, not other ResearchSpec Skills. Advisory
cross-Skill relationships remain outside dependency closure.

### Enforce complete-tree human approval

The review state stays `pending-human-review` until preview rendering produces
all six `SKILL.md` files, Python resources, AgentSpec schemas, dependency lists,
source derivations, and tree hashes. Approval binds the complete tree-set hash,
not prose alone. Production conversion rejects pending, stale, or rejected
review state.

### Preserve licensing and origin boundaries

Every generated Skill carries the complete Apache-2.0 license and a notice with
official repository, snapshot, revision, source paths, copied/adapted symbol
mapping, and non-endorsement language. The root MIT metadata conflict is not
treated as a second production license. Unknown or external origins remain
unreachable.

## Risks / Trade-offs

- **[Adaptation accidentally changes business behavior]** -> Bind symbol maps,
  expose assumptions, and add capability-fidelity fixture tests.
- **[Provider aggregate reintroduces blocked code]** -> Validate the explicit
  dependency closure and reject every generated `finrobot` import.
- **[Published files contain a real secret or private payload]** -> Scan generated
  bytes for secret assignments, private keys, private endpoints, local absolute
  paths, and catalogued sensitive literals; permit names and placeholders.
- **[Script inclusion is mistaken for automatic execution]** -> Test converter,
  package, install, discovery, and update paths without importing generated code.
- **[Review approves prose but not tools]** -> Bind approval to complete tree
  hashes and a source-to-output derivation manifest.
- **[Fourth-vendor regeneration changes another vendor]** -> Compare unrelated
  vendor projections byte-for-byte in isolation tests.

## Migration Plan

1. Replace the over-restrictive draft catalogs and specs with coupling/action
   decisions and complete asset derivations.
2. Add four direct Python resources, eight adapted resources, provider contracts,
   optional adapters, AgentSpec schemas, and capability-complete Skill content.
3. Render and review all six complete trees; record explicit hash-bound approval.
4. Verify and archive `audit-finrobot`, then lock production catalogs.
5. Implement the isolated converter, registry/domain integration, attribution,
   documentation, package scripts, allowlist, and release tests.
6. Generate the fourth vendor and run the complete verification matrix.

Rollback before approval removes only the unarchived ingest change and draft
inputs. Rollback after production removes only the FinRobot converter,
generated projection, memberships, adapter documentation, and package entries;
other vendors and public runtime contracts require no migration.

## Open Questions

None. Coupling classification, executable-resource inclusion, form-safety
boundary, six-Skill scope, provider adaptation, and complete-tree human approval
are fixed by this change.
