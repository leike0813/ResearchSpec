---
name: histagent-historical-source-identification
description: Search, retrieve, verify, and record historical-source candidates through local indexes, exact-text search, literature services, web archives, HTTP, and reverse-image adapters. Use when an Agent needs provenance-bearing candidates before interpreting a source.
license: Apache-2.0
compatibility: Python 3.11+; network endpoints and credentials are user-configured.
metadata:
  vendor: histagent
  vendor-release: snapshot-47bbe21
  source-revision: 47bbe21dc81618489f5d5929358032883a3fe448
---

# Historical source identification

## Purpose and scope

Use this Skill to discover, retrieve, and verify candidate historical sources while preserving how each candidate was found. It supports local indexes, SerpAPI text and Lens search, Google Books, Springer, Internet Archive CDX, explicit HTTP retrieval, and configured reverse-image upload. It does not treat ranking as verification, invent inaccessible content, or decide historical relevance without Agent review.

Choose the command from the mode table before preparing inputs.

| Command | Use when | Main output |
| --- | --- | --- |
| `search` | Search a local index or configured SerpAPI | candidate collection |
| `exact-text` | Trace an exact phrase locally or through configured search | candidate collection |
| `literature` | Query Google Books or Springer metadata | bibliographic candidates |
| `archive` | Find Internet Archive CDX captures | archival candidates |
| `fetch` | Retrieve an explicitly selected URL | retrieved bytes and candidate receipt |
| `reverse-image` | Search by public image URL or consented local upload | image-source candidates |
| `verify` | Change one candidate to verified, rejected, or inaccessible | new candidate artifact |
| `validate` | Check candidate identity, provenance, and status | validation receipt |

## Inputs and prerequisites

Python 3.11 and the standard library are sufficient for local indexes, HTTP, and the reviewed provider adapters. Inputs come from ordinary CLI options or a named candidate file. Local indexes are UTF-8 JSON objects with a `records` array. Candidate files contain one candidate object or `{ "candidate": {...} }`.

Network commands require a user-selected endpoint or the documented public default. SerpAPI and Springer credentials are read only from the environment variable named by `--credential-env`. Never place credential values in a command, candidate file, output, or log.

A candidate always distinguishes `discovered`, `retrieved`, `verified`, `inaccessible`, and `rejected`. It includes candidate ID, title, locator, originating query, provider/repository, status, retrieval status, evidence object, warnings, and date when available. Retrieved bytes add their SHA-256 and media type.

## Workflow

Use this entrypoint for every deterministic identification command. The entrypoint imports lib/historical_support.py before parsing a command. If the support library is missing, stop because the copied tree is incomplete.

1. Formulate a query and choose the narrowest suitable adapter; prefer local data when available.
2. Run the command and write candidate data to a new path:

```bash
python scripts/identify_sources.py search --query QUERY --adapter local-index --index INDEX.json --output CANDIDATES.json
python scripts/identify_sources.py exact-text --query "exact wording" --adapter local-index --index index.json --output exact.json
python scripts/identify_sources.py literature --query "port records" --adapter google-books --endpoint http://127.0.0.1:8000/books --output books.json
python scripts/identify_sources.py archive --url https://example.org/source --endpoint http://127.0.0.1:8000/cdx --output captures.json
python scripts/identify_sources.py fetch --url https://example.org/source --output source.html
python scripts/identify_sources.py reverse-image --adapter serpapi-lens --image-url https://example.org/image.jpg --endpoint http://127.0.0.1:8000/lens --credential-env SERPAPI_API_KEY --output matches.json
python scripts/identify_sources.py reverse-image --adapter http-upload --source image.jpg --endpoint http://127.0.0.1:8000/reverse --allow-external-upload --output matches.json
python scripts/identify_sources.py verify --candidate-file candidate.json --status verified --note "Matched shelfmark and title page." --output verified.json
python scripts/identify_sources.py validate --candidate-file verified.json
```

3. Inspect query provenance and evidence locators. Fetch only a selected candidate.
4. Verify identity and relevance against the retrieved material or repository metadata; create a new verification artifact rather than editing discovery output.
5. Hand off only candidates whose status accurately represents what was observed.

Read this reference when selecting or configuring a provider adapter: [references/provider-adapters.md](references/provider-adapters.md).

Read this reference when creating, validating, or changing a candidate status: [references/candidate-verification-cases.md](references/candidate-verification-cases.md).

## Hard constraints

- Search rank and metadata similarity are discovery evidence, not verification.
- Never invent content for an inaccessible candidate or mark an unfetched result as retrieved.
- Never overwrite output unless the user explicitly authorizes `--overwrite`.
- Never upload a local image without `--allow-external-upload`; disclose endpoint, material, purpose, and retention concern before consent.
- Do not inject Cookies, embed credentials, use a fixed private endpoint, launch a browser implicitly, or persist secrets.
- Network access occurs only during the explicitly invoked adapter command. Importing the module has no filesystem or network effect.
- A provider error affects only that adapter path; retain any existing discovery provenance and choose a declared next action.

## Responsibilities

The Agent formulates and refines queries, chooses repositories and adapters, judges source identity and relevance, checks access constraints, supplies verification notes, and decides what to retain.

The script performs exact local matching or one selected request, normalizes candidates, hashes fetched content, checks status transitions, writes atomically, and emits receipts. It does not assess historical truth or relevance by rank.

Do not use a temporary script to fabricate repository knowledge or relevance judgments. Do not hand-edit a candidate's status; use `verify` so the changed status and note are explicit.

## Outputs and completion

Success writes the requested artifact when applicable and prints a command-specific receipt as one JSON object. Discovery receipts contain `command`, `artifact`, and `candidate_count`; `fetch` prints the candidate and retrieved artifact; `validate` prints `command`, `valid`, candidate ID, and status. These are command contracts rather than a universal runner envelope.

Identification is complete when every retained candidate preserves its query and locator, its status matches the available evidence, retrieved bytes have hashes, inaccessible material is not invented, and verification notes explain `verified`, `rejected`, or `inaccessible` decisions.

## Failure handling

Failure exits nonzero and writes an error object to stderr without a success object on stdout.

- `invalid_input` or `invalid_local_index`: repair the named option or JSON file;
- `configuration_missing`: configure the named environment variable or use a provider that needs no credential;
- `consent_required`: obtain upload consent or use a public image URL/local path;
- `artifact_exists`: choose a new path or obtain explicit overwrite authority;
- `operation_failed`: retain query and candidate provenance; an HTTP `fetch` records an inaccessible candidate rather than inventing bytes;
- `invalid_candidate` or `invalid_status`: repair candidate fields or use one of the five declared statuses.

## Examples

Happy path: search a local catalog, retain a `discovered` shelfmark candidate, fetch the repository page, compare its identifying metadata, then create a `verified` candidate with a note.

Near miss: a local image is supplied to `http-upload` without `--allow-external-upload`. The command exits with `consent_required`, performs no network request, and creates no output.

Inaccessible result: a discovered URL returns a network failure. Keep its query and locator, mark it `inaccessible`, and do not quote or summarize content that was never retrieved.
