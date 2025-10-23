export abstract class PageInterface {
    /**
     * Initialize the page - called when content is swapped in
     */
    abstract init(): void;
    
    /**
     * Clean up the page - called when navigating away
     */
    abstract destroy(): void;
    
    /**
     * Optional: Check if page is currently active
     */
    isActive(): boolean {
        return false;
    }
}
