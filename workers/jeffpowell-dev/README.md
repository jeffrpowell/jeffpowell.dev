# Jeff Powell Portfolio

Hi, I'm Jeff Powell. Welcome to my [personal portfolio website](https://jeffpowell.dev)! 

I'm a Software Development Manager at Clearwater Analytics with over a decade of industry experience. My proficiency stretches beyond mere software coding to the elements that surround the development process, including UX design, software and network architecture design, project management, communication, and effective team leadership.

This site showcases my projects, technical skills, and professional journey as a developer, engineer, and creative thinker.

Feel free to reach out for collaboration, consulting, or just to say hi!

📧 [Email](mailto:hi@jeffpowell.dev)
💼 [LinkedIn](https://www.linkedin.com/in/jeffrpowell)

## 🛠️ Tech Stack
- **HTML5 & CSS3**
- **JavaScript (ES6+)**
- **HTMX 2.0.6**
- **Webpack 5**
- **Responsive design** for all devices
- **Cloudflare worker** and Wrangler for hosting

## ✨ Features
- Clean, minimal, and accessible design
- Project gallery with live demos and source links
- About Me, Skills, and Contact sections
- Progressive enhancement with HTMX
- Fast load times and optimized assets

## 🚧 Development

### Prerequisites
- Node.js
- pnpm

### Setup
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

## License

MIT License - see [LICENSE](../../LICENSE) for details
