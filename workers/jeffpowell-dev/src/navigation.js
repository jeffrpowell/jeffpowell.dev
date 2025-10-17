// Navigation utility functions for HTMX-loaded components
window.NavigationUtils = {
  // Page titles mapping
  pageTitles: {
    'about-me': 'About Me',
    'portfolio': 'Portfolio', 
    'tech': 'Known Tech',
    'tangram': 'Tangram'
  },

  // Initialize navigation after HTMX loads components
  init: function(currentPage) {
    this.setActiveNavigation(currentPage);
    this.setPageTitle(currentPage);
  },

  // Set active state for navigation links
  setActiveNavigation: function(currentPage) {
    // Desktop navigation
    const desktopLinks = document.querySelectorAll('#sidebar .nav-link');
    desktopLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === currentPage) {
        link.classList.add('bg-green-100', 'text-green-700', 'font-medium');
        link.classList.remove('text-gray-600');
      } else {
        link.classList.remove('bg-green-100', 'text-green-700', 'font-medium');
      }
    });

    // Mobile navigation
    const mobileLinks = document.querySelectorAll('#mobile-nav a');
    mobileLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === currentPage) {
        link.classList.add('text-green-600');
        link.classList.remove('text-gray-600');
      } else {
        link.classList.add('text-gray-600');
        link.classList.remove('text-green-600');
      }
    });
  },

  // Set page title in mobile header
  setPageTitle: function(currentPage) {
    const titleElement = document.getElementById('current-route-name');
    if (titleElement && this.pageTitles[currentPage]) {
      titleElement.textContent = this.pageTitles[currentPage];
    }
  },
};