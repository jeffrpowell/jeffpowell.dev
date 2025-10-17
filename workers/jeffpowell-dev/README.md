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

## ✨ Features
- Clean, minimal, and accessible design
- Project gallery with live demos and source links
- About Me, Skills, and Contact sections
- Progressive enhancement with HTMX
- Fast load times and optimized assets

## 🚧 Development

### Prerequisites
- Node.js >= 18
- pnpm

### Setup
```bash
# Install dependencies
pnpm install

# Start local dev server
pnpm start
```

Visit http://localhost:4290

### Building
```bash
# Development build
pnpm build

# Production build
pnpm build-prod
```

### Deployment
```bash
# Deploy to production
pnpm deploy

# Deploy development build
pnpm deploy-dev

# Preview with wrangler dev
pnpm preview
```

## Project Structure

```
workers/jeffpowell-dev/
├── src/
│   ├── index.html          # Main HTML template
│   ├── index.js            # Main JavaScript entry
│   ├── index.css           # Global styles
│   ├── navigation.js       # Navigation handling
│   ├── assets/             # Images and static assets
│   └── pages/              # Page-specific HTML/JS
│       ├── about-me/
│       ├── portfolio/
│       ├── tech/
│       └── tangram/        # Interactive puzzle game
├── webpack.development.config.js
├── webpack.production.config.js
├── postcss.config.js
├── wrangler.jsonc
└── package.json
```

## Configuration

### Wrangler
Configuration in `wrangler.jsonc`:
- Worker name: `jeffpowell-dev`
- Assets directory: `./dist`
- Compatibility date: 2025-06-05

### Webpack
Two configurations:
- **Development**: Source maps, dev server, hot reload
- **Production**: Minification, optimization, tree shaking

## Adding New Pages

1. Create page directory in `src/pages/`:
   ```bash
   mkdir src/pages/my-page
   ```

2. Add HTML file:
   ```html
   <div data-page="my-page">
     <!-- Page content -->
   </div>
   ```

3. Add JavaScript (if needed):
   ```javascript
   export class MyPageInterface {
     constructor(element) {
       this.element = element;
       this.init();
     }
     
     init() {
       // Initialize page
     }
   }
   ```

4. Update navigation in `index.js`

## License

MIT License - see [LICENSE](../../LICENSE) for details
