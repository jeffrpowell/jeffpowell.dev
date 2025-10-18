// Tech page functionality
import './tech.css'
import * as d3 from 'd3';
import { PageInterface } from '../page';

// Define the tech data structure
const KNOWN_TECH = {
  name: 'Known Tech',
  children: [
    {
      name: 'Language',
      children: [
        { name: 'Python', value: 2 },
        { name: 'Java', value: 3 },
        { name: 'Clojure', value: 1 },
        { name: 'HTML5', value: 3 },
        { name: 'CSS4', value: 3 },
        { name: 'Javascript', value: 3 },
        { name: 'SVG', value: 2 },
        { name: 'Kotlin', value: 1 },
      ]
    },
    {
      name: 'Specification & Notation Syntax',
      children: [
        { name: 'JSON', value: 3 },
        { name: 'YAML', value: 3 },
        { name: 'Terraform', value: 2 },
        { name: 'Markdown', value: 3 },
        { name: 'TOML', value: 1 }
      ]
    },
    {
      name: 'Browser',
      children: [
        { name: 'Firefox', value: 3 },
        { name: 'Edge', value: 2 },
        { name: 'Chrome', value: 2 }
      ]
    },
    {
      name: 'Network Protocol',
      children: [
        { name: 'HTTP/1', value: 3 },
        { name: 'AJAX', value: 3 },
        { name: 'REST', value: 3 },
        { name: 'Websocket', value: 3 },
        { name: 'AMQP', value: 2 },
        { name: 'DNS', value: 2 },
        { name: 'Firewall', value: 2 },
        { name: 'Tailscale', value: 2 },
      ]
    },
    {
      name: 'Logging & Telemetry',
      children: [
        { name: 'Kibana', value: 3 },
        { name: 'OpenSearch', value: 3 },
        { name: 'Slf4j', value: 3 },
        { name: 'Graphite', value: 2 },
        { name: 'Grafana', value: 3 },
        { name: 'Eclipse Memory Analyzer', value: 2 },
        { name: 'JVisualVM', value: 2 },
        { name: 'Fullstory', value: 2 }
      ]
    },
    {
      name: 'Testing',
      children: [
        { name: 'JUnit 5', value: 3 },
        { name: 'Jasmine', value: 3 },
        { name: 'Karma', value: 2 },
        { name: 'Mockito', value: 3 },
        { name: 'JMeter', value: 2 },
        { name: 'Cypress', value: 2 }
      ]
    },
    {
      name: 'Injection',
      children: [
        { name: 'HK2', value: 3 },
        { name: 'Guice', value: 2 },
        { name: 'Dagger2', value: 1 },
        { name: 'Angular DI', value: 2 }
      ]
    },
    {
      name: 'Dependency Management',
      children: [
        { name: 'Maven', value: 3 },
        { name: 'Gradle', value: 1 },
        { name: 'NPM', value: 3 },
        { name: 'Pip', value: 2 },
        { name: 'PNPM', value: 2 }
      ]
    },
    {
      name: 'Database & Caching',
      children: [
        { name: 'MongoDB', value: 1 },
        { name: 'SQL Server', value: 3 },
        { name: 'MySQL', value: 2 },
        { name: 'Memcached', value: 2 },
        { name: 'Redis', value: 2 },
        { name: 'Postgres', value: 2 },
        { name: 'S3', value: 2 },
        { name: 'R2', value: 2 },
        { name: 'DynamoDB', value: 2 }
      ]
    },
    {
      name: 'Web Framework',
      children: [
        { name: 'Angular', value: 2 },
        { name: 'React', value: 1 },
        { name: 'HTMX', value: 2 },
        { name: 'TailwindCSS', value: 3 },
        { name: 'SCSS', value: 3 },
        { name: 'LESS', value: 3 }
      ]
    },
    {
      name: 'Operating System',
      children: [
        { name: 'Windows', value: 3 },
        { name: 'Linux', value: 2 },
        { name: 'Proxmox', value: 2 }
      ]
    },
    {
      name: 'IDE',
      children: [
        { name: 'Netbeans', value: 2 },
        { name: 'Visual Studio Code', value: 3 },
        { name: 'IntelliJ', value: 1 },
        { name: 'Windsurf', value: 3 }
      ]
    },
    {
      name: 'CI/CD',
      children: [
        { name: 'Artifactory', value: 2 },
        { name: 'Jenkins/ Cloudbees', value: 2 },
        { name: 'Docker + Compose', value: 3 },
        { name: 'SonarQube', value: 3 },
        { name: 'Github Actions', value: 2 },
        { name: 'Gitlab Actions', value: 2 },
        { name: 'Cloudflare Builds', value: 2 }
      ]
    },
    {
      name: "Public Cloud",
      children: [
        { name: 'Amazon AWS', value: 2 },
        { name: 'Cloudflare', value: 3 },
        { name: 'Azure', value: 1 }
      ]
    },
    {
      name: 'SCM',
      children: [
        { name: 'Git', value: 3 },
        { name: 'SVN', value: 2 }
      ]
    },
    {
      name: 'Web Server',
      children: [
        { name: 'Nginx', value: 3 },
        { name: 'Apache', value: 1 },
        { name: 'Tomcat', value: 2 },
        { name: 'Traefik', value: 2 }
      ]
    },
    {
      name: 'Home lab',
      children: [
        { name: 'Hardware procurement', value: 3 },
        { name: 'Networking', value: 2 },
        { name: 'Custom PC assembly', value: 3 },
        { name: 'Custom patch cable', value: 3 },
        { name: '3-2-1 Backups', value: 3 },
        { name: 'SSL& Reverse proxy', value: 2 },
      ]
    }
  ]
};

// Define colors
const COLORS = {
  light: 'oklch(0.8976 0.0785 134.47)', // Light green
  medium: 'oklch(0.681 0.148 134.47)', // Medium green
  'dark-border': '#3f6212' // Dark green border
};

export class KnownTechPage extends PageInterface {
  constructor() {
    super();
    // Global object to store zoom functions for search
    this.valueToZoomFunctions = {};
    this.searchHandler = null;
    this.documentClickHandler = null;
    this.searchFocusHandler = null;
    this.svg = null;
    this.circles = null;
    this.labelGroup = null;
    this.labels = null;
    this.circleGroup = null;
    this.resizeHandler = null;
  }

  init () {
    this.initBubbleChart();
    this.initSearch();
    this.initResizeHandler();
  }
  
  destroy () {
    // Clean up search event listeners
    const searchInput = document.getElementById('tech-search');
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

  initSearchHandler() {
    // Store reference to this for use in closure
    const self = this;
    
    this.searchHandler = function() {
      const searchResults = document.getElementById('search-results');
      const searchInput = document.getElementById('tech-search');
      const term = this.value.toLowerCase();
      
      if (term.length < 2) {
        searchResults.classList.add('hidden');
        return;
      }
      
      // Get tech items from our instance property
      const allTechItems = Object.keys(self.valueToZoomFunctions);
      
      const filteredItems = allTechItems
        .filter(item => item.toLowerCase().includes(term))
        .slice(0, 10);
      
      if (filteredItems.length > 0) {
        searchResults.innerHTML = '';
        
        filteredItems.forEach(item => {
          const resultItem = document.createElement('div');
          resultItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
          resultItem.textContent = item.charAt(0).toUpperCase() + item.slice(1);
          
          resultItem.addEventListener('click', () => {
            searchInput.value = item;
            searchResults.classList.add('hidden');
            self.valueToZoomFunctions[item.toLowerCase()]();
          });
          
          searchResults.appendChild(resultItem);
        });
        
        searchResults.classList.remove('hidden');
      } else {
        searchResults.classList.add('hidden');
      }
    };
  }

  // Search functionality
  initSearch() {
    const searchInput = document.getElementById('tech-search');
    const searchResults = document.getElementById('search-results');
    
    // Handle input in search box
    this.initSearchHandler();
    searchInput.addEventListener('input', this.searchHandler);
    
    // Hide search results when clicking outside
    this.documentClickHandler = (event) => {
      if (event.target !== searchInput && event.target !== searchResults) {
        searchResults.classList.add('hidden');
      }
    };
    document.addEventListener('click', this.documentClickHandler);
    
    // Show search results when focusing on search input
    this.searchFocusHandler = function() {
      if (this.value.length >= 2) {
        searchResults.classList.remove('hidden');
      }
    };
    searchInput.addEventListener('focus', this.searchFocusHandler);
  }

  initResizeHandler() {
    let resizeTimeout;
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

  initBubbleChart() {
  // Store reference to this for use in nested functions
  const self = this;
  const containerWidth = document.getElementById('bubble-chart-container').offsetWidth - 40;
  
  // Responsive dimensions based on screen size
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;
  
  let width, height;
  
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
    const root = d3.hierarchy(KNOWN_TECH)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Create the pack layout
    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    // Apply the layout to the data
    const rootNode = pack(root);
    
    // Constants for zooming
    let currentNode = rootNode;
    let currentTransform = [rootNode.x, rootNode.y, rootNode.r * 2 + 1];
    
    // Create circle elements
    this.circleGroup = this.svg.append('g');
    
    this.circles = this.circleGroup
      .selectAll('circle')
      .data(rootNode.descendants().slice(1))
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', d => (d.children ? COLORS.medium : COLORS.light))
      .attr('pointer-events', d => (!d.children ? 'none' : null))
      .on('mouseover', function() {
        d3.select(this).attr('stroke', COLORS['dark-border']);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', null);
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        d3.select(this).attr('stroke', null);
        zoomToCircleCenter(d);
      });
    
    // Create leaf node id to zoom function mapping for search
    rootNode.descendants().filter(d => !d.children).forEach(d => {
      this.valueToZoomFunctions[d.data.name.toLowerCase()] = () => zoomToCircleCenter(d.parent);
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
      .style('fill-opacity', d => (d.parent === currentNode ? 1 : 0))
      .style('display', d => (d.parent === currentNode ? 'inline' : 'none'))
      .style('font-size', d => Math.max(0.35, 1 / (2 * (d.depth || 1))) + 'rem')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .html(d => generateLabelSVGText(d.data.name, d.x));
    
    // Make category labels bold
    this.labels.filter(d => d.parent === rootNode).style('font-weight', 'bold');
    
    // Generate multi-line text labels
    function generateLabelSVGText(rawLabel, x) {
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
    function zoomToCircleCenter(d) {
      // Use self to access instance methods and properties
      currentNode = d;
      const interpolator = d3.interpolateZoom(
        currentTransform,
        [d.x, d.y, d.r * 2 + 1]
      );
      
      runTransition(interpolator);
    }
    
    // Zoom back to full view
    function zoomToFullView() {
      // Use self to access instance methods and properties
      currentNode = rootNode;
      const interpolator = d3.interpolateZoom(
        currentTransform,
        [rootNode.x, rootNode.y, rootNode.r * 2 + 1]
      );
      
      runTransition(interpolator);
    }
    
    // Run zoom transition
    function runTransition(interpolator) {
      // D3 transition duration
      const duration = 750;
      
      self.circleGroup
        .transition()
        .duration(duration)
        .attrTween('transform', () => t => transform(currentTransform = interpolator(t)));
        
      const labelTransition = self.labelGroup
        .transition()
        .duration(duration)
        .attrTween('transform', () => t => transform(currentTransform = interpolator(t)));
        
      self.labels
        .filter(function(d) {
          return d.parent === currentNode || this.style.display === 'inline';
        })
        .transition(labelTransition)
        .style('fill-opacity', d => (d.parent === currentNode ? 1 : 0))
        .style('display', d => (d.parent === currentNode ? 'inline' : 'none'));
    }
    
    // Transform function for zoom
    function transform([x, y, r]) {
      return `
        translate(${width / 2}, ${height / 2})
        scale(${height / r})
        translate(${-x}, ${-y})
      `;
    }
  }
}