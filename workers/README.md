# Cloudflare Workers

This directory contains all Cloudflare Workers for the project.

## Working with Workers

### Development
To work on a specific worker locally:

```bash
cd workers/<worker-name>
pnpm install
pnpm start  # Start local dev server
```

### Building
```bash
# Build a specific worker
cd workers/<worker-name>
pnpm build

# Build all workers from root
pnpm build
```

### Deployment
```bash
# Deploy a specific worker
cd workers/<worker-name>
pnpm deploy

# Deploy all workers from root
pnpm deploy
```

## Creating a New Worker

1. Create a new directory:
   ```bash
   mkdir workers/my-new-worker
   cd workers/my-new-worker
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@jeffpowell/my-new-worker",
     "version": "1.0.0",
     "scripts": {
       "build": "your-build-command",
       "deploy": "wrangler deploy",
       "preview": "wrangler dev"
     }
   }
   ```

3. Create `wrangler.jsonc`:
   ```jsonc
   {
     "name": "my-new-worker",
     "compatibility_date": "2025-06-05",
     "main": "./dist/index.js"
   }
   ```

4. Install dependencies from root:
   ```bash
   cd ../..
   pnpm install
   ```

## Worker Configuration

Each worker should have:
- `package.json` - Dependencies and scripts
- `wrangler.jsonc` - Cloudflare worker configuration
- `src/` - Source code directory
- Build configuration (webpack, esbuild, etc.)

## Environment Variables

For local development, create a `.dev.vars` file in each worker directory:
```
API_KEY=your-key-here
```

These files are gitignored. For production, use `wrangler secret put` to set secrets.

## Best Practices

- Keep workers small and focused
- Use shared code via npm packages when appropriate
- Test locally with `wrangler dev` before deploying
- Use TypeScript for better type safety
- Document environment variables and secrets needed
