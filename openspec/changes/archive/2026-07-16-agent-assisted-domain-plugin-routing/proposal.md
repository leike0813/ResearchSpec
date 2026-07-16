## Why

ResearchSpec can safely install reviewed domain Skills, but the current user
journey requires users to discover and select domains themselves. Navigate may
only recommend Skills that are already installed and projected, so domain
plugins remain detached from the normal research dialogue.

The Agent needs a governed augmentation loop that can discover relevant
capabilities, ask for installation consent, execute the existing installation
transaction, and use installed Skills during semantic work without changing the
ResearchSpec workflow frontier or replacing the four ARSU producers.

## What Changes

- Add compact, description-bearing plugin discovery views derived from the
  existing registry and packaged `SKILL.md` files.
- Add hash-bound non-interactive plugin installation so an Agent can preview,
  obtain one batch confirmation, and execute the identical plan for the user.
- Add a read-only `plugin instructions` bridge for immediately using a clean,
  projected Skill when the host Agent does not hot-load newly installed Skills.
- Extend Navigate and the converter-owned ARSU preflight with one shared plugin
  augmentation protocol for route, direct-entry, resume, and ready-work use.
- Keep every plugin recommendation and invocation advisory: the active ARSU
  Skill remains producer and all authoritative mutations remain with the
  existing sixteen-command ResearchSpec control plane.

## Capabilities

### New Capabilities

- `agent-plugin-augmentation`: Defines consent, discovery, installation,
  immediate activation, semantic helper dispatch, and graceful fallback.

### Modified Capabilities

- `domain-skill-plugin-registry`: Exposes packaged Skill descriptions and
  hash-bound read-only instruction packets without changing Registry Schema 1.
- `cli-interface`: Adds compact plugin views, plan-bound install execution, and
  a `plugin instructions` subcommand under the existing top-level command.
- `companion-skills`: Extends Navigate from installed-only recommendation to
  consent-based discovery, installation, and advisory invocation.
- `arsu-converter`: Injects the shared augmentation protocol into all four ARSU
  Skills so expert direct routes and active work do not depend on Navigate.
- `arsu-run-usage`: Defines plugin helpers as nested semantic assistance owned
  by the current ARSU producer, not workflow nodes.
- `arsu-user-model-acceptance`: Adds black-box journeys for consent, rejection,
  installation failure, immediate activation, and non-authoritative use.

## Impact

The change affects plugin metadata loading, CLI plugin DTOs and options,
installation plan binding, Companion and ARSU generated instructions, tests,
OpenSpec contracts, and canonical product documentation. It adds no dependency,
remote registry, public top-level command, workflow selector, wrapper, base
Skill, Gate, Decision, receipt type, or plugin-owned state.
