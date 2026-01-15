# Email Alias Registration Worker

A Cloudflare Worker that provides a web interface for registering email aliases in the Workers KV namespace used by the email-triage worker.

## Features

- Simple web interface for registering email aliases
- Validates email prefix format (lowercase letters, numbers, dots, hyphens, underscores)
- Prevents duplicate alias registration
- Auto-fills "DEFAULT" as the target address
- Real-time feedback on success/failure
- **Requires authentication via Cloudflare Zero Trust**

## Setup

```bash
# Install dependencies
pnpm install

# Login to Cloudflare; SEE WORKAROUND NOTES BELOW
pnpm wrangler login --callback-host 0.0.0.0

# Start local dev server
pnpm dev
```

Visit http://localhost:8787 (spot-check that the URI matches what's in the terminal output)

### Login workaround

Until https://github.com/cloudflare/workers-sdk/issues/10603 and/or https://github.com/cloudflare/workers-sdk/issues/5937 are resolved, you have to perform the following workaround to get wrangler to login:

1. `pnpm wrangler login --callback-host 0.0.0.0`
2. Copy-paste the URL
3. Manually change "0.0.0.0" to "localhost"
4. Open your modified link in your browser
5. Click the `Allow` button

ALTERNATIVELY

Follow the instructions in `.env.example` to supply Wrangler with an API token from your account. This will make it so that you do not need to do the manual login step.

## Usage

1. Navigate to the protected subdomain (e.g., `https://email-register.jeffpowell.dev`)
2. Authenticate via Cloudflare Zero Trust
3. Enter the email prefix (the part before @jeffpowell.dev)
4. The target defaults to "DEFAULT" which routes to your primary/backup email based on health status
5. Click "Register Alias"
6. Receive confirmation or error feedback

## API Endpoints

### `GET /`
Returns the HTML registration interface.

### `POST /api/register`
Registers a new email alias.

**Request body:**
```json
{
  "prefix": "myalias",
  "target": "DEFAULT"
}
```

**Success response (200):**
```json
{
  "success": true,
  "email": "myalias@jeffpowell.dev",
  "target": "DEFAULT",
  "message": "Successfully registered myalias@jeffpowell.dev → DEFAULT"
}
```

**Error response (409 - Already exists):**
```json
{
  "error": "Email alias myalias@jeffpowell.dev already exists with target: DEFAULT",
  "exists": true
}
```

**Error response (400 - Invalid input):**
```json
{
  "error": "Invalid email prefix. Use only lowercase letters, numbers, dots, hyphens, and underscores."
}
```

## License

MIT License - see [LICENSE](../../LICENSE) for details
