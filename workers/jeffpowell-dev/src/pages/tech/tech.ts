// Tech page functionality
import './tech.css'
import * as d3 from 'd3';
import { PageInterface } from '../page';
import { KNOWN_TECH, COLORS } from './tech.constants';
import { TechNode } from './tech.types';

export class KnownTechPage extends PageInterface {
  private valueToZoomFunctions: { [key: string]: () => void } = {};
  private searchHandler: ((this: HTMLInputElement, ev: Event) => any) | null = null;
  private documentClickHandler: ((ev: MouseEvent) => any) | null = null;
  private searchFocusHandler: ((this: HTMLInputElement, ev: FocusEvent) => any) | null = null;
  private svg: any = null;
  private circles: any = null;
  private labelGroup: any = null;
  private labels: any = null;
  private circleGroup: any = null;
  private resizeHandler: (() => void) | null = null;

  constructor() {
    super();
  }

  init(): void {
    this.initBubbleChart();
    this.initSearch();
    this.initResizeHandler();
  }
  
  destroy(): void {
    // Clean up search event listeners
    const searchInput = document.getElementById('tech-search') as HTMLInputElement | null;
    if (searchInput) {
      if (this.searchHandler) searchInput.removeEventListener('input', this.searchHandler);
      if (this.searchFocusHandler) searchInput.removeEventListener('focus', this.searchFocusHandler);
    }
    
    // Clean up document click handler
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
    
    // Clean up D3 event handlers
    if (this.svg) {
      this.svg.on('click', null); // Remove D3 click handler
    }
    
    // Clean up resize handler
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    if (this.circles) {
      this.circles
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null);
    }
    
    // Remove D3 groups entirely if they exist
    if (this.circleGroup) {
      this.circleGroup.selectAll('*').remove();
    }
    
    if (this.labelGroup) {
      this.labelGroup.selectAll('*').remove();
    }
    
    // Clear stored references
    this.searchHandler = null;
    this.documentClickHandler = null;
    this.searchFocusHandler = null;
    this.svg = null;
    this.circles = null;
    this.circleGroup = null;
    this.labelGroup = null;
    this.labels = null;
    this.valueToZoomFunctions = {};
  }

  private initSearchHandler(): void {
    // Store reference to this for use in closure
    const self = this;
    
    this.searchHandler = function(this: HTMLInputElement) {
      const searchResults = document.getElementById('search-results');
      const searchInput = document.getElementById('tech-search') as HTMLInputElement | null;
      const term = this.value.toLowerCase();
      
      if (term.length < 2) {
        if (searchResults) searchResults.classList.add('hidden');
        return;
      }
      
      // Get tech items from our instance property
      const allTechItems = Object.keys(self.valueToZoomFunctions);
      
      const filteredItems = allTechItems
        .filter(item => item.toLowerCase().includes(term))
        .slice(0, 10);
      
      if (filteredItems.length > 0) {
        if (!searchResults) return;
        searchResults.innerHTML = '';
        
        filteredItems.forEach(item => {
          const resultItem = document.createElement('div');
          resultItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
          resultItem.textContent = item.charAt(0).toUpperCase() + item.slice(1);
          
          resultItem.addEventListener('click', () => {
            if (searchInput) searchInput.value = item;
            if (searchResults) searchResults.classList.add('hidden');
            self.valueToZoomFunctions[item.toLowerCase()]();
          });
          
          searchResults.appendChild(resultItem);
        });
        
        if (searchResults) searchResults.classList.remove('hidden');
      } else {
        if (searchResults) searchResults.classList.add('hidden');
      }
    };
  }

  // Search functionality
  private initSearch(): void {
    const searchInput = document.getElementById('tech-search') as HTMLInputElement | null;
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Handle input in search box
    this.initSearchHandler();
    if (this.searchHandler) {
      searchInput.addEventListener('input', this.searchHandler);
    }
    
    // Hide search results when clicking outside
    this.documentClickHandler = (event: MouseEvent) => {
      if (event.target !== searchInput && event.target !== searchResults) {
        if (searchResults) searchResults.classList.add('hidden');
      }
    };
    document.addEventListener('click', this.documentClickHandler);
    
    // Show search results when focusing on search input
    this.searchFocusHandler = function(this: HTMLInputElement) {
      if (this.value.length >= 2) {
        if (searchResults) searchResults.classList.remove('hidden');
      }
    };
    if (this.searchFocusHandler) {
      searchInput.addEventListener('focus', this.searchFocusHandler);
    }
  }

  private initResizeHandler(): void {
    let resizeTimeout: NodeJS.Timeout | undefined;
    this.resizeHandler = () => {
      // Debounce resize events to improve performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Clear existing chart
        if (this.svg) {
          this.svg.selectAll('*').remove();
        }
        // Reinitialize the chart with new dimensions
        this.initBubbleChart();
      }, 250);
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  private initBubbleChart(): void {
  // Store reference to this for use in nested functions
  const self = this;
  const container = document.getElementById('bubble-chart-container');
  if (!container) return;
  const containerWidth = container.offsetWidth - 40;
  
  // Responsive dimensions based on screen size
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;
  
  let width: number, height: number;
  
  if (isMobile) {
    // On mobile, use a more square aspect ratio to prevent squishing
    width = Math.max(320, containerWidth);
    height = Math.max(400, width * 0.8); // 4:5 aspect ratio
  } else if (isTablet) {
    // On tablet, use a balanced aspect ratio
    width = containerWidth;
    height = Math.max(450, width * 0.6); // 5:3 aspect ratio
  } else {
    // On desktop, use the original wider aspect ratio
    width = containerWidth;
    height = 500;
  }
    
    this.svg = d3.select('#techBubbleChartSVG')
      .attr('width', width)
      .attr('height', height)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0, 0, ${width}, ${height}`)
      .on('click', zoomToFullView);

    // Create the hierarchical data structure
    const root = d3.hierarchy<TechNode>(KNOWN_TECH)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create the pack layout
    const pack = d3.pack<TechNode>()
      .size([width, height])
      .padding(3);

    // Apply the layout to the data
    const rootNode = pack(root);
    
    // Constants for zooming
    let currentNode: d3.HierarchyCircularNode<TechNode> = rootNode;
    let currentTransform: [number, number, number] = [rootNode.x, rootNode.y, rootNode.r * 2 + 1];
    
    // Create circle elements
    this.circleGroup = this.svg.append('g');
    
    this.circles = this.circleGroup
      .selectAll('circle')
      .data(rootNode.descendants().slice(1))
      .join('circle')
      .attr('cx', (d: d3.HierarchyCircularNode<TechNode>) => d.x)
      .attr('cy', (d: d3.HierarchyCircularNode<TechNode>) => d.y)
      .attr('r', (d: d3.HierarchyCircularNode<TechNode>) => d.r)
      .attr('fill', (d: d3.HierarchyCircularNode<TechNode>) => (d.children ? COLORS.medium : COLORS.light))
      .attr('pointer-events', (d: d3.HierarchyCircularNode<TechNode>) => (!d.children ? 'none' : null))
      .on('mouseover', function(this: SVGCircleElement) {
        d3.select(this).attr('stroke', COLORS['dark-border']);
      })
      .on('mouseout', function(this: SVGCircleElement) {
        d3.select(this).attr('stroke', null);
      })
      .on('click', function(this: SVGCircleElement, event: MouseEvent, d: d3.HierarchyCircularNode<TechNode>) {
        event.stopPropagation();
        d3.select(this).attr('stroke', null);
        zoomToCircleCenter(d);
      });
    
    // Create leaf node id to zoom function mapping for search
    rootNode.descendants().filter(d => !d.children).forEach(d => {
      if (d.parent) {
        this.valueToZoomFunctions[d.data.name.toLowerCase()] = () => zoomToCircleCenter(d.parent!);
      }
    });
    
    // Create text labels
    const labelGroup = this.svg.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle');
    
    // Store references for cleanup
    this.labelGroup = labelGroup;
    this.labels = labelGroup
      .selectAll('text')
      .data(rootNode.descendants())
      .join('text')
      .style('fill-opacity', (d: d3.HierarchyCircularNode<TechNode>) => (d.parent === currentNode ? 1 : 0))
      .style('display', (d: d3.HierarchyCircularNode<TechNode>) => (d.parent === currentNode ? 'inline' : 'none'))
      .style('font-size', (d: d3.HierarchyCircularNode<TechNode>) => (d.depth || 1) === 1 ? '0.9rem' : '0.25rem')
      .attr('x', (d: d3.HierarchyCircularNode<TechNode>) => d.x)
      .attr('y', (d: d3.HierarchyCircularNode<TechNode>) => d.y)
      .html((d: d3.HierarchyCircularNode<TechNode>) => generateLabelSVGText(d.data.name, d.x));
    
    // Make category labels bold
    this.labels.filter((d: d3.HierarchyCircularNode<TechNode>) => d.parent === rootNode).style('font-weight', 'bold');
    
    // Generate multi-line text labels
    function generateLabelSVGText(rawLabel: string, x: number): string {
      if (rawLabel.indexOf(' ') < 0) {
        return rawLabel;
      }
      
      const words = rawLabel.split(' ');
      
      let finalString = `<tspan x="${x}" dy="-0.5em">${words[0]}</tspan>`;
      
      for (let i = 1; i < words.length; i++) {
        finalString += `<tspan x="${x}" dy="1.25em">${words[i]}</tspan>`;
      }
      
      return finalString;
    }
    
    // Zoom to a specific circle
    function zoomToCircleCenter(d: d3.HierarchyCircularNode<TechNode>): void {
      // Use self to access instance methods and properties
      currentNode = d;
      const interpolator = d3.interpolateZoom(
        currentTransform,
        [d.x, d.y, d.r * 2 + 1] as [number, number, number]
      );
      
      runTransition(interpolator);
    }
    
    // Zoom back to full view
    function zoomToFullView(): void {
      // Use self to access instance methods and properties
      currentNode = rootNode;
      const interpolator = d3.interpolateZoom(
        currentTransform,
        [rootNode.x, rootNode.y, rootNode.r * 2 + 1] as [number, number, number]
      );
      
      runTransition(interpolator);
    }
    
    // Run zoom transition
    function runTransition(interpolator: (t: number) => [number, number, number]): void {
      // D3 transition duration
      const duration = 750;
      
      self.circleGroup
        .transition()
        .duration(duration)
        .attrTween('transform', () => (t: number) => transform(currentTransform = interpolator(t)));
        
      const labelTransition = self.labelGroup
        .transition()
        .duration(duration)
        .attrTween('transform', () => (t: number) => transform(currentTransform = interpolator(t)));
        
      self.labels
        .filter(function(this: SVGTextElement, d: d3.HierarchyCircularNode<TechNode>) {
          return d.parent === currentNode || this.style.display === 'inline';
        })
        .transition(labelTransition)
        .style('fill-opacity', (d: d3.HierarchyCircularNode<TechNode>) => (d.parent === currentNode ? 1 : 0))
        .style('display', (d: d3.HierarchyCircularNode<TechNode>) => (d.parent === currentNode ? 'inline' : 'none'));
    }
    
    // Transform function for zoom
    function transform([x, y, r]: [number, number, number]): string {
      return `
        translate(${width / 2}, ${height / 2})
        scale(${height / r})
        translate(${-x}, ${-y})
      `;
    }
  }
}