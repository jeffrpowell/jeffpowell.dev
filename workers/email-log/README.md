# Email Capture Log Worker

A Cloudflare Worker that provides a web interface for auditing the emails captured
by the [`email-triage`](../email-triage) worker and downloading the raw message
contents archived in R2.

For every message it processes, `email-triage` writes an event to the
`email_events` Analytics Engine dataset and (on first delivery) stores the raw
`.eml` in the `email-backup` R2 bucket. This worker reads both back:

- **Metadata** is queried from Analytics Engine via the SQL API.
- **Content** is streamed from R2 as a downloadable `.eml`.

## Features

- Browse captured email metadata: from / to / routed-destination / first-vs-retry / time
- Filter by sender, recipient, and status; cap the result count
- Download the raw `.eml` stored in R2 for any logged email
- **Should be protected via Cloudflare Zero Trust** — it exposes message metadata
  and content, so put it behind Access on its subdomain like `email-register`.

## Configuration

The worker needs read access to the account's Analytics Engine data. Reads go
through the SQL API (there is no read binding), so the account id and an API
token are supplied as secrets.

| Name             | Where                       | Purpose                                                                 |
| ---------------- | --------------------------- | ----------------------------------------------------------------------- |
| `ANALYTICS_DATASET` | `vars` in `wrangler.jsonc` | Dataset name; must match `email-triage`'s (`email_events`).             |
| `CF_ACCOUNT_ID`  | secret / `.dev.vars`        | Account that owns the dataset (Analytics Engine SQL API is account-scoped). |
| `CF_API_TOKEN`   | secret / `.dev.vars`        | API token with **Account Analytics: Read** permission.                  |

It also binds the `email-backup` R2 bucket (read-only usage) as `R2_BUCKET`.

### Production secrets

```bash
pnpm wrangler secret put CF_ACCOUNT_ID
pnpm wrangler secret put CF_API_TOKEN
```

### Local dev

Copy `.dev.vars.example` to `.dev.vars` (gitignored) and fill in the values:

```bash
cp .dev.vars.example .dev.vars
pnpm dev
```

Visit http://localhost:8787 (spot-check the URI in the terminal output).

> The R2 bucket is read remotely during `wrangler dev` only if configured to do
> so; otherwise local dev reads from a local R2 simulation. Add `"remote": true`
> to the bucket binding if you want to read the real archived messages locally.

## API Endpoints

### `GET /`
Returns the HTML log interface (SPA).

### `GET /api/emails`
Returns logged email metadata, newest first.

**Query params (all optional):**
- `sender` — substring match against the `From` address
- `recipient` — substring match against the `To` address
- `status` — `FIRST` or `RETRY`
- `limit` — 1–1000 (default 100)

**Success response (200):**
```json
{
  "count": 1,
  "limit": 100,
  "emails": [
    {
      "key": "2026-06-20/alice_at_example.com/abc123.eml",
      "recipient": "me@jeffpowell.dev",
      "sender": "alice@example.com",
      "destination": "primary@example.com",
      "status": "FIRST",
      "eventTime": 1718841600000
    }
  ]
}
```

### `GET /api/download?key=<r2-key>`
Streams the raw `.eml` from R2 as an attachment. `key` is the `key` field from
`/api/emails`. Returns `404` if the content is no longer in R2 (e.g. a retry that
was deduplicated, or a purged object).

## License

MIT License - see [LICENSE](../../LICENSE) for details
