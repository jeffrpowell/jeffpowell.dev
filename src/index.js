import 'htmx.org';
import "./index.css"
import { AboutMePage } from './pages/about-me/about-me';

// Recommendation from https://htmx.org/docs/#webpack
window.htmx = require('htmx.org');

// Page must extend PageInterface
const pages = {
  'about-me': new AboutMePage()
};

let currentPage = null;

// Initialize the index page
document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
});

document.body.addEventListener('htmx:afterSettle', function(evt) {
    const target = evt.target;
    
    // Find which page was loaded
    const pageElement = target.querySelector('[data-page]');
    if (!pageElement) return;
    
    const newPageKey = pageElement.dataset.page;
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
function setCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}