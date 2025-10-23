// Portfolio page functionality
import './portfolio.css';
import { PageInterface } from '../page';

export class PortfolioPage extends PageInterface {
    constructor() {
        super();
    }

    init(): void {
        this.setupPortfolioInteractions();
        this.setupTableOfContents();
    }

    destroy(): void {
        // Cleanup if needed when navigating away from the page
    }

    // Setup portfolio interactions
    private setupPortfolioInteractions(): void {
        // Setup repository click handlers
        const repoItems = document.querySelectorAll<HTMLElement>('#repos-container > div[data-url]');
        repoItems.forEach(item => {
            item.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        // Setup article click handlers
        const articleItems = document.querySelectorAll<HTMLElement>('#articles-container > div[data-url]');
        articleItems.forEach(item => {
            item.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        // Setup video click handlers
        const videoItems = document.querySelectorAll<HTMLElement>('#videos-container > div[data-video-id]');
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
    private setupTableOfContents(): void {
        const tocLinks = document.querySelectorAll<HTMLElement>('.toc-link');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetSection = targetId ? document.getElementById(targetId) : null;
                
                if (targetSection) {
                    // Check if we're on mobile (header is visible)
                    const mobileHeader = document.getElementById('mobile-brand');
                    const isMobile = mobileHeader && window.getComputedStyle(mobileHeader).display !== 'none';
                    
                    if (isMobile) {
                        // Get the header height (64px for h-16 in Tailwind)
                        const headerHeight = 64;
                        
                        // Get the target element's position relative to the document
                        const targetRect = targetSection.getBoundingClientRect();
                        const targetTop = targetRect.top + window.pageYOffset;
                        
                        // Scroll to position accounting for header height
                        window.scrollTo({
                            top: targetTop - headerHeight - 16, // Extra 16px padding
                            behavior: 'smooth'
                        });
                    } else {
                        // Desktop: use standard scroll behavior
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                    
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
