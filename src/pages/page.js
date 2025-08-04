export class PageInterface {
    /**
     * Initialize the page - called when content is swapped in
     */
    init() {
        throw new Error('init() must be implemented by subclass');
    }
    
    /**
     * Clean up the page - called when navigating away
     */
    destroy() {
        throw new Error('destroy() must be implemented by subclass');
    }
    
    /**
     * Optional: Check if page is currently active
     */
    isActive() {
        return false;
    }
}