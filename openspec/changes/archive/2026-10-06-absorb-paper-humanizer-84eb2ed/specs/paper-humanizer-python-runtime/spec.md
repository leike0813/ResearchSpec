## ADDED Requirements

### Requirement: Academic humanization preserves section purpose and evidence

Paper-humanizer instructions SHALL cover prescription replacing analysis, facts without argumentative function, repeated study introductions, and template-driven paragraphs. They SHALL preserve meaningful negation, required sections, legitimate literature enumeration, methods passive voice, and evidence-calibrated hedging. Rewrites SHALL use only supported source information; ambiguity SHALL remain unchanged and be reported in Review or Verification.

#### Scenario: Reference assists academic prose

- **WHEN** another prose task loads the Reference entrypoint
- **THEN** it can apply the academic patterns and output checks from that entrypoint alone, without starting a Hook or diagnostic workflow

#### Scenario: Academic review calibrates findings

- **WHEN** Review inspects an academic manuscript
- **THEN** its scan considers paragraph purpose, fact function, citation continuity, and section register with section-specific false-positive protection
- **AND** it records an unresolved item when a safe suggestion would require missing evidence or interpretation

#### Scenario: Verification detects invented argumentative links

- **WHEN** a candidate adds an argumentative link, limitation, study identity, or finding unsupported by the source or separately authorized substantive input
- **THEN** Verification reports semantic preservation failure, even if the edit removes a style pattern
