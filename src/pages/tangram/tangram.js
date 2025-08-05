// Tangram Calendar page functionality
import './tangram.css';
import { PageInterface } from '../page';

// Base URL for the tangram API
const BASE_URL = 'https://tangram-calendar.jeffpowell.dev/';

export class TangramPage extends PageInterface {
  constructor() {
    super();
    this.solutionData = null;
  }

  init() {
    this.initTangramCalendar();
  }

  destroy() {
    // Cleanup if needed when navigating away from the page
  }

  initTangramCalendar() {
    // Get current date in YYYY-MM-DD format
    const localDate = new Date();
    const targetDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    const targetDateStr = this.dateToString(targetDate);
    
    // Display the date
    document.getElementById('tangram-date').textContent = `for ${targetDateStr}`;
    
    // Load hint
    this.fetchTangramData(`${BASE_URL}hint/${targetDateStr}`)
      .then(data => {
        this.renderTangramGrid('tangram-hint', data);
      })
      .catch(error => {
        document.getElementById('tangram-hint').innerHTML = 
          `<div class="text-red-600">Error loading hint: ${error.message}</div>`;
      });

    // Load solution (but don't display it yet)
    this.fetchTangramData(`${BASE_URL}solution/${targetDateStr}`)
      .then(data => {
        // Store solution data for later display
        this.solutionData = data;
      })
      .catch(error => {
        this.solutionData = [`Error loading solution: ${error.message}`];
      });

    // Set up solution reveal button
    const showSolutionBtn = document.getElementById('show-solution-btn');
    showSolutionBtn.addEventListener('click', () => this.revealSolution());
  }

  // Function to fetch tangram data
  async fetchTangramData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tangram data (${response.status})`);
    }
    const text = await response.text();
    return this.rawToArray(text);
  }

  // Convert raw text response to array of strings
  rawToArray(response) {
    return response.trim().split("\n");
  }

  // Convert date to string in YYYY-MM-DD format
  dateToString(date) {
    return date.toISOString().substring(0, 10);
  }

  // Render tangram grid
  renderTangramGrid(elementId, rows) {
    const container = document.getElementById(elementId);
    
    // Clear any existing content (like loading spinners)
    container.innerHTML = '';
    
    // Create the grid rows
    rows.forEach(row => {
      const gridRow = document.createElement('div');
      gridRow.className = 'grid-row';
      gridRow.innerHTML = this.colorTangram(row);
      container.appendChild(gridRow);
    });
    
    // Show the container if it was hidden
    container.classList.remove('hidden');
  }

  // Function to reveal the solution
  revealSolution() {
    const solutionContainer = document.getElementById('tangram-solution');
    const showSolutionBtn = document.getElementById('show-solution-btn');
    
    // Hide the button
    showSolutionBtn.classList.add('hidden');
    
    // Render the solution
    if (this.solutionData) {
      this.renderTangramGrid('tangram-solution', this.solutionData);
    } else {
      solutionContainer.innerHTML = 
        '<div class="text-yellow-600">Loading solution...</div>';
    }
  }

  // Function to colorize tangram characters
  colorTangram(text) {
    // Replace tangram characters with colored pre's
    return text
      .replace(/0/g, '<pre class="tangram tangram-piece-0">  </pre>')
      .replace(/1/g, '<pre class="tangram tangram-piece-1">  </pre>')
      .replace(/2/g, '<pre class="tangram tangram-piece-2">  </pre>')
      .replace(/3/g, '<pre class="tangram tangram-piece-3">  </pre>')
      .replace(/4/g, '<pre class="tangram tangram-piece-4">  </pre>')
      .replace(/5/g, '<pre class="tangram tangram-piece-5">  </pre>')
      .replace(/6/g, '<pre class="tangram tangram-piece-6">  </pre>')
      .replace(/7/g, '<pre class="tangram tangram-piece-7">  </pre>')
      .replace(/8/g, '<pre class="tangram tangram-piece-8">  </pre>')
      .replace(/9/g, '<pre class="tangram tangram-piece-9">  </pre>')
      .replace(/\./g, '<pre class="tangram tangram-empty">  </pre>');
  }
}
