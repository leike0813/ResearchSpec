# Design

## Release preparation

The hosted matrix runs from a clean checkout with pinned vendor inputs and the
root lockfile. The native Pages workflow uploads the bilingual Docusaurus build
from its validation job. A separate dispatch workflow checks both workflow
results on the exact selected main commit before preparing a release artifact.

The package verifier already packs, installs and runs the real CLI. An explicit
destination retains that tarball and derives its metadata after every check
succeeds. Release jobs share the resulting artifact. The publish job checks
its integrity again and obtains npm identity through the protected GitHub
environment. Package metadata supplies the version for the CLI and its
installation records.

## First publication

The maintainer records hosted and human evidence against a single commit.
After approval, a maintainer publishes the downloaded `0.1.0` artifact using
npm's interactive account authentication. The repository enables private
vulnerability reporting and Pages before publication. Later releases can use
the npm Trusted Publisher bound to the workflow and environment. The release
runbook owns the sequence and remains usable after initial setup.
