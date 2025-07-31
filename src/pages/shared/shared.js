// Shared utilities for MPA pages
import 'htmx.org';
import "./shared.css"
import "./htmx/navigation-utils.js"

// Recommendation from https://htmx.org/docs/#webpack
window.htmx = require('htmx.org');

// Set current year in footer
export function setCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// View Transition API fallback for non-supporting browsers
export function initViewTransitions() {
  if (!('startViewTransition' in document)) {
    // Add a class to indicate no view transition support
    document.documentElement.classList.add('no-view-transitions');
  }
}

// Initialize common page functionality
export function initPage() {
  setCurrentYear();
  initViewTransitions();
}
