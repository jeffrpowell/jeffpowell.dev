// Portfolio page functionality
import { initPage } from '../shared/shared';
import './portfolio.css'

// Setup portfolio interactions
function setupPortfolioInteractions() {
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  initPage();
  setupPortfolioInteractions();
});
