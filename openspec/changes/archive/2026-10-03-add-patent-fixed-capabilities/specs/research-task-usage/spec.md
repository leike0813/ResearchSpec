# Research Task Usage Delta

## MODIFIED Requirements

### Requirement: Research Tasks Lead The Product

The product SHALL treat a natural research request as the entry condition for its capabilities. When a project contains a current workspace and the request concerns academic research work such as literature work, paper planning or writing, evidence checking, peer review, review response, or patent research and document preparation, the Agent SHALL discover and use applicable capabilities without the user naming ResearchSpec, a procedure, or any internal selector. When the user explicitly opts out of ResearchSpec for the current request, direct user instructions SHALL take precedence and the Agent SHALL NOT route that request into a ResearchSpec workflow. Requests unrelated to supported research work SHALL NOT be routed into a ResearchSpec workflow.

#### Scenario: Natural request selects a capability
- **WHEN** a user in a current workspace asks to accomplish a supported research task in ordinary language without naming ResearchSpec
- **THEN** the Agent discovers applicable capabilities and proceeds on the task
- **AND** it does not require the user to name a procedure, profile, or selector

#### Scenario: Unrelated request stays outside the framework
- **WHEN** a user asks for work unrelated to supported research tasks
- **THEN** the Agent does not route the request into a ResearchSpec workflow

#### Scenario: User explicitly opts out
- **WHEN** the user explicitly declines ResearchSpec for the current request
- **THEN** the Agent does not route that request into a ResearchSpec workflow
- **AND** it honors the direct user instruction over proactive discovery

#### Scenario: Patent task uses the same entry
- **WHEN** a user asks to turn technical materials into a patent disclosure or interpret a patent
- **THEN** Navigate discovers the fixed patent Procedures through the existing catalog
