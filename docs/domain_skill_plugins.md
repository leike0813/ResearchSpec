# ResearchSpec Domain Skill Plugins

## 1. Purpose and authority

Domain Skill plugins are ResearchSpec-maintained packages of Open Agent Skills
organized around a professional domain. They extend the semantic help available
to a workspace without becoming a third-party runtime or a second workflow
system.

ResearchSpec maintainers select upstream knowledge, pin an immutable revision,
adapt and review the material, resolve licensing, and commit the resulting static
Skill tree. User commands read only the files distributed in the installed npm
package. They do not clone upstream repositories, contact a remote registry, or
run a converter.

Plugins may assist an ARSU producer or be invoked explicitly by the user. They do
not own routes, workflow profiles, subflows, work items, state, artifact registry,
Gates, Decisions, transitions, or receipts. Every authoritative workflow write
continues to use the ResearchSpec CLI.

## 2. Package layout and registry

The unique catalog source is `skills/plugins/registry.json`:

```text
skills/plugins/
  registry.json
  <plugin-id>/
    <skill-id>/
      SKILL.md
      LICENSE
      NOTICE.md
      scripts/       optional
      references/    optional
      assets/        optional
      ...            other Skill resources
```

Registry Schema 1 has three root fields:

- `schema_version`: exactly `"1"`;
- `sources`: upstream repository and license identities;
- `plugins`: plugin metadata and its Skills.

A source records `source_id`, `name`, `repository_url`, and `license`. A plugin
records `plugin_id`, `title`, `description`, `version`, `domain`, and `skills`.
Each Skill records a globally unique `skill_id` and one or more `upstreams`.
Each upstream records `source_id`, immutable hexadecimal `revision`, safe relative
`source_paths`, and `adaptation` equal to `curated` or `converted`.

Skill source and destination roots are derived from IDs. Registry entries cannot
supply arbitrary filesystem paths. Plugin and Skill IDs use the Open Agent Skills
lowercase letters, numbers, and hyphen convention. A Skill ID must not duplicate
another plugin Skill or any fixed ARSU/Companion Skill ID.

The production registry can be empty. Test fixtures are repository-only and are
not distributed in the npm package.

## 3. Skill content contract

Every registered Skill follows the [Open Agent Skills specification](https://openagentskills.dev/docs/specification):

- `SKILL.md` contains YAML frontmatter followed by Markdown instructions;
- `name` is 1–64 lowercase letters, numbers, and hyphens, has no leading,
  trailing, or consecutive hyphen, and matches the directory and registry ID;
- `description` is non-empty and no longer than 1024 characters;
- optional `compatibility`, `license`, `metadata`, and `allowed-tools` follow the
  specification;
- all regular files below the Skill root are delivered byte-for-byte.

Third-party-derived Skills also contain a non-empty `LICENSE` and `NOTICE.md`.
Provenance is exact at Skill level; ResearchSpec does not maintain a noisy
file-by-file upstream map.

Scripts and dependencies belong to Skill content, not to ResearchSpec core. A
Skill describes environment requirements in `compatibility` and its instructions.
ResearchSpec copies scripts but never executes them, installs their dependencies,
or provides a sandbox. The target Agent decides whether and how to execute Skill
resources.

## 4. Workspace selection and projection

Plugin selection is workspace-wide:

```yaml
schema_version: "0.1"
plugins:
  selected:
    - <plugin-id>
```

An older workspace without `plugins` is equivalent to an empty selection. The
workspace schema version remains unchanged. Every configured Agent tool receives
the same selected plugin Skills. When a tool is added later, `init` or `update`
projects all available selections to it automatically.

All 31 registered tools can receive plugin Skills. Plugins do not generate command
wrappers: the 28 command-capable tools always retain the eight fixed ARSU and
Companion wrappers.

`tool-installation-manifest.json` remains the ownership source. Plugin records add
`plugin_id`, `plugin_version`, and `skill_id` to the existing tool, path, scope,
source, SHA-256, and adapter-version evidence.

## 5. CLI lifecycle

The public catalog and lifecycle surface is:

```bash
researchspec plugin list [--installed]
researchspec plugin show <plugin-id>
researchspec plugin install <plugin-ids...>
researchspec plugin update [plugin-ids...]
researchspec plugin uninstall <plugin-ids...>
```

`list` and `show` can inspect package metadata without a workspace. Install saves
selection even when no Agent tool is configured and reports a non-blocking
projection warning. Update refreshes named installed plugins, or all installed
plugins when IDs are omitted. Install and uninstall are incremental across
multiple IDs.

Writing commands use the common `--dry-run`, `--yes`, `--force`, `--json`, and
`--quiet` contracts. Generated files and the workspace config are planned before
the installation manifest, which is committed last.

## 6. Drift and retirement safety

- A clean desired file is safely refreshed when package content changes.
- A desired file whose bytes differ from its recorded hash is preserved by
  default; `--force` may refresh it from the current packaged Skill.
- Uninstall preflights every manifest-owned file for every requested plugin. Any
  drift blocks the whole uninstall and leaves files and selection unchanged.
- `--force` does not delete a modified file during uninstall.
- A missing owned file is already absent and can be removed from the manifest.
- A selected plugin absent from the current registry is `unavailable`: status and
  checks retain that fact, update is blocked, and manifest evidence still permits
  safe uninstall.

`status` reports selected, available, unavailable, and projected plugins.
`check plugins` and `check all` validate the registry, Skill structure,
provenance, expected projection, file presence, and manifest hashes.

## 7. Navigate integration

Navigate can query `researchspec plugin list --installed --json` and recommend an
installed Skill when its domain, description, or Skill metadata matches the
user's intent. The recommendation is advisory. It does not create a catalog route,
subflow, work item, Gate, Decision, receipt, frontier, or alternate state machine.
