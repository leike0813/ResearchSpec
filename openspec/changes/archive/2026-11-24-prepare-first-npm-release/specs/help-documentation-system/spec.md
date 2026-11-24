# Documentation System Delta

## MODIFIED Requirements

### Requirement: GitHub Pages Deployment

The documentation website SHALL be automatically built and deployed to GitHub
Pages on pushes to `main`. The deployment SHALL use the artifact from the
successful documentation check for that commit.

#### Scenario: PR validation

- **WHEN** a pull request is opened or updated
- **THEN** the Docs workflow SHALL check the generated documentation
- **AND** it SHALL build both Docusaurus locales from locked dependencies

#### Scenario: Main branch deployment

- **WHEN** a push to `main` passes documentation checks and builds
- **THEN** the workflow SHALL upload the checked output and deploy it through GitHub Pages Actions
- **AND** the deploy job SHALL use the protected Pages environment
