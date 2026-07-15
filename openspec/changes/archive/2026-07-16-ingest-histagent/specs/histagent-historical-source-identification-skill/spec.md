## ADDED Requirements

### Requirement: Source Identification SHALL Be A Complete Script-Assisted Skill
`histagent-historical-source-identification` SHALL satisfy the non-native baseline plus script-assisted and resource-backed extensions. Its complete tree SHALL contain a full `SKILL.md`, `scripts/identify_sources.py`, copied `lib/historical_support.py`, exactly two directly routed detailed references, and distribution metadata. The entrypoint SHALL provide exactly `search`, `exact-text`, `literature`, `archive`, `fetch`, `reverse-image`, `verify`, and `validate`.

#### Scenario: Agent starts identification
- **WHEN** it loads only `SKILL.md`
- **THEN** it can choose an adapter, run every command, interpret candidate state, and recover without a host-invented implementation

### Requirement: Identification Inputs And Outputs SHALL Be Purpose-Specific
Search commands SHALL use query, adapter, index, endpoint, credential-environment, and output options. Verification SHALL read a candidate domain file. Commands SHALL print their own receipt or direct validation result; expected failures SHALL exit nonzero with a stderr error object. The Skill SHALL NOT require a generic payload, runner, schema, cross-Skill envelope, doctor, or result validator.

#### Scenario: Local index is used
- **WHEN** a copied tree searches a valid index
- **THEN** it writes normalized candidates without network access

### Requirement: Discovery Adapters SHALL Be Concrete And Independent
The tree SHALL implement independent standard-library paths for local-index search, SerpAPI search, Google Books, Springer, Internet Archive CDX, HTTP fetch, URL-based reverse image, and configured local-image upload. Credentials SHALL be read from user-named environment variables. Network adapters SHALL be tested only against localhost mocks.

#### Scenario: One adapter response is invalid
- **WHEN** normalization fails
- **THEN** that command exits with an adapter error
- **AND** local validation and other adapter paths remain independent

### Requirement: Candidate Provenance SHALL Be Complete
Candidates SHALL preserve originating query, locator, title, provider/repository, evidence, warnings, available date, retrieval hash when fetched, and one of `discovered`, `retrieved`, `verified`, `inaccessible`, or `rejected`. Search rank SHALL NOT create verification.

#### Scenario: Content cannot be fetched
- **WHEN** access fails
- **THEN** discovery provenance remains available with status `inaccessible`
- **AND** no content is invented

### Requirement: External Image Upload SHALL Require Consent
Local image upload SHALL require `--allow-external-upload`. Cookie injection, embedded credentials, fixed private endpoints, and implicit browser launch SHALL be absent.

#### Scenario: Upload consent is absent
- **WHEN** `http-upload` receives a local image without consent
- **THEN** it returns `consent_required` before any network request
