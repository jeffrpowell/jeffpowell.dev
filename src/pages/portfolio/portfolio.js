// Portfolio page functionality
import './portfolio.css';
import { PageInterface } from '../page';

export class PortfolioPage extends PageInterface {
  constructor() {
    super();
  }

  init() {
    this.setupPortfolioInteractions();
    this.setupTableOfContents();
  }

  destroy() {
    // Cleanup if needed when navigating away from the page
  }

  // Setup portfolio interactions
  setupPortfolioInteractions() {
    // Setup repository click handlers
    const repoItems = document.querySelectorAll('#repos-container > div[data-url]');
    repoItems.forEach(item => {
      item.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });

    // Setup article click handlers
    const articleItems = document.querySelectorAll('#articles-container > div[data-url]');
    articleItems.forEach(item => {
      item.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank');
        }
      });
    });

    // Setup video click handlers
    const videoItems = document.querySelectorAll('#videos-container > div[data-video-id]');
    videoItems.forEach(item => {
      item.addEventListener('click', function() {
        const videoId = this.getAttribute('data-video-id');
        if (videoId) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        }
      });
    });
  }

  // Setup table of contents smooth scrolling
  setupTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
      link.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          // Smooth scroll to the target section
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Add a subtle visual feedback
          this.style.backgroundColor = '#f3f4f6';
          setTimeout(() => {
            this.style.backgroundColor = '';
          }, 200);
        }
      });
    });
  }
}
