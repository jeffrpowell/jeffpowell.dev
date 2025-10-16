# Jeff Powell Monorepo

This is a monorepo containing Cloudflare workers for Jeff Powell's projects.

## 📁 Repository Structure

```
.
└── workers/             # Cloudflare Workers
    └── jeffpowell-dev/  # Personal portfolio website worker
        ├── src/         # Source code
        ├── package.json
        └── wrangler.jsonc
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- pnpm
- Cloudflare account and API token

### Installation

```bash
# Clone the repo
git clone git@github.com:jeffrpowell/jeffpowell.dev.git
cd jeffpowell.dev

# Install all workspace dependencies
pnpm install
```

## 🔧 Development

### Working with Workers

Each worker has its own Wrangler version. Navigate to the worker directory to use Wrangler commands:

```bash
# Navigate to a worker
cd workers/jeffpowell-dev

# Start local development server
pnpm start

# Run Wrangler commands directly
pnpm wrangler dev
pnpm wrangler tail
pnpm wrangler whoami
# ... any other wrangler command
```

### Building from Root

```bash
# Build all workers
pnpm build

# Build production bundles
pnpm build-prod
```

## 🚀 Deployment

### Deploy All Workers
```bash
pnpm deploy
```

### Deploy Specific Worker
```bash
cd workers/jeffpowell-dev
pnpm deploy
```

## 🏗️ Workers

### jeffpowell-dev
Personal portfolio website showcasing projects, skills, and professional journey.

**Tech Stack:**
- HTML5 & CSS3
- JavaScript (ES6+)
- HTMX 2.0.6
- Tailwind CSS
- Webpack 5
- Cloudflare Workers

**Features:**
- Clean, minimal, and accessible design
- Interactive tangram puzzle game
- Project gallery with live demos
- Responsive design for all devices
- Fast load times with edge computing

Visit: [https://jeffpowell.dev](https://jeffpowell.dev)

## 📦 Adding New Workers

1. Create a new directory in `workers/`:
   ```bash
   mkdir workers/my-new-worker
   cd workers/my-new-worker
   ```

2. Initialize with `package.json` and `wrangler.jsonc`

3. The monorepo will automatically include it in workspace commands

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue or reach out directly.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
