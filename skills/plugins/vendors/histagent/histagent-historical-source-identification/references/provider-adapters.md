# Provider adapters

Read this file only when selecting or configuring an adapter. The consent, credential, status, and provenance rules remain in `SKILL.md`.

## Local index

`local-index` is the offline default for `search` and `exact-text`. The index is:

```json
{
  "records": [
    {
      "title": "Guild ledger",
      "text": "Merchant guild ledger, 1848",
      "creator": "Guild office",
      "date": "1848",
      "locator": "archive:shelfmark/17",
      "match_locator": "catalog-record-17"
    }
  ]
}
```

Term search requires every case-folded query term to occur in the combined record text. Exact-text search checks the literal query. The output records the index path and hash; it does not copy the whole index.

## Text search

`serpapi` supports `search` and `exact-text`. Provide `--credential-env` naming the user's key variable. The endpoint returns an `organic_results` array with link/title and optional snippet/position. Snippets remain discovery evidence and must not be treated as retrieved source text.

## Literature services

`google-books` expects the Volumes-style `items[].volumeInfo` response and normally requires no key for basic queries. `springer` expects a `records` array and requires a credential environment variable. Both return bibliographic metadata candidates; neither command verifies a work's edition, pagination, or relevance.

## Web archive

`archive` uses an Internet Archive CDX-compatible endpoint. Expected rows contain timestamp, original URL, digest, status code, and media type. A capture locator identifies an archived response, not necessarily the first publication or an authentic edition.

## HTTP fetch

`fetch` retrieves only the selected URL and writes raw response bytes. It records content hash, byte count, and media type. It does not follow repository-specific authentication flows, execute page scripts, start a browser, or bypass access controls.

## Reverse image

`serpapi-lens` sends a public `--image-url` and reads its key from `--credential-env`. `http-upload` sends base64 bytes from `--source` only after `--allow-external-upload`. Review provider terms, confidentiality, rights, and retention before choosing upload.

## Adapter failures

Response shape mismatch is an adapter failure. Preserve the query and raw access context available outside the command, then update the adapter only through reviewed Skill maintenance. Do not guess provider fields or merge one provider's response rules into another adapter.
