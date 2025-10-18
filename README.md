# Jeff Powell Monorepo

This is a monorepo containing Cloudflare workers for Jeff Powell's projects.

## 📁 Repository Structure

```
.
├── .devcontainer/                  # Dev environment config and setup
└── workers/
    ├── jeffpowell-dev/             # Personal portfolio website worker
    ├── email-triage/               # Email routing logic worker
    ├── tangram-calendar/           # Supplies hints and solutions for tangram puzzle
    └── tangram-calendar-submit/    # Submit tangram puzzle hints and solutions
```

## 🚀 Quick Start

### Prerequisites
- Node.js
- pnpm
- wrangler
  
  __OR__

- Docker
- VS Code with the Dev Containers extension

### Build and local deployment

```bash
# Clone the repo
git clone git@github.com:jeffrpowell/jeffpowell.dev.git
cd jeffpowell.dev

# Install all workspace dependencies
pnpm install

# Login to Cloudflare; SEE WORKAROUND NOTES BELOW
pnpm wrangler login --callback-host 0.0.0.0

# Run a worker
cd workers/[worker-name]
pnpm dev #runs a build command, if applicable, then runs wrangler dev
```

### Login workaround

Until https://github.com/cloudflare/workers-sdk/issues/10603 and/or https://github.com/cloudflare/workers-sdk/issues/5937 are resolved, you have to perform the following workaround to get wrangler to login:

1. `pnpm wrangler login --callback-host 0.0.0.0`
2. Copy-paste the URL
3. Manually change "0.0.0.0" to "localhost"
4. Open your modified link in your browser
5. Click the `Allow` button

## 🔧 Development

### Working with Workers

Each worker has its own Wrangler version. Navigate to the worker directory to use Wrangler commands:

```bash
# Navigate to a worker
cd workers/jeffpowell-dev

# Start local development server
pnpm dev

# Run Wrangler commands directly
pnpm wrangler dev
pnpm wrangler tail
pnpm wrangler whoami
# ... any other wrangler command
```

### Debugging

Debugging is configured in a VSCode `launch.json` file for you.

Otherwise, start reading at this [trailhead](https://developers.cloudflare.com/workers/observability/dev-tools/breakpoints/).

## 📦 Adding New Workers

If you need to pull down an existing worker to compare or start with, AND you haven't downloaded it already, use this command:
`pnpm wrangler --cwd workers init --from-dash [name-of-worker]`
It will download to a directory under `/tmp/`, copy the src files, and then error out looking for a `wrangler.toml` file. Go manually hunt for the directory and copy the `wrangler.jsonc` file out of there.

Otherwise, here's the standard recipe for adding a new worker.

1. Create a new directory in `workers/`:
   ```bash
   mkdir workers/my-new-worker
   cd workers/my-new-worker
   ```
2. Initialize with `package.json` and `wrangler.jsonc`
    * Copy from another worker to get a head-start
3. The monorepo will automatically include it in workspace commands

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
