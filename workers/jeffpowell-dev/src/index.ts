import 'htmx.org';
import "./index.css"
import { AboutMePage } from './pages/about-me/about-me';
import { PortfolioPage } from './pages/portfolio/portfolio';
import { KnownTechPage } from './pages/tech/tech';
import { TangramPage } from './pages/tangram/tangram';
import { PageInterface } from './pages/page';

// Recommendation from https://htmx.org/docs/#webpack
(window as any).htmx = require('htmx.org');

// Page must extend PageInterface
const pages: { [key: string]: PageInterface } = {
  'about-me': new AboutMePage(),
  'portfolio': new PortfolioPage(),
  'tech': new KnownTechPage(),
  'tangram': new TangramPage(),
};

let currentPage: PageInterface | null = null;

// Initialize the index page
document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
});

document.body.addEventListener('htmx:afterSettle', function(evt: Event) {
    const target = evt.target as HTMLElement;
    
    // Find which page was loaded
    const pageElement = target.querySelector('[data-page]') as HTMLElement | null;
    if (!pageElement) return;
    
    const newPageKey = pageElement.dataset.page;
    if (!newPageKey) return;
    
    const newPage = pages[newPageKey];
    
    if (!newPage) {
        console.warn(`No page handler found for: ${newPageKey}`);
        return;
    }
    
    // Destroy current page if different
    if (currentPage && currentPage !== newPage) {
        currentPage.destroy();
    }
    
    // Initialize new page
    newPage.init();
    currentPage = newPage;
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (currentPage) {
        currentPage.destroy();
    }
});

// Set current year in copyright
function setCurrentYear(): void {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
}
