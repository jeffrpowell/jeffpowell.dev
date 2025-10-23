// Tangram Calendar page functionality
import './tangram.css';
import { PageInterface } from '../page';
import { InteractiveTangramPuzzle } from './tangramgame';

// Base URL for the tangram API
const BASE_URL = 'https://tangram-calendar.jeffpowell.dev/';

export class TangramPage extends PageInterface {
  private solutionData: string[] | null = null;
  private interactivePuzzle: InteractiveTangramPuzzle | null = null;

  constructor() {
    super();
  }

  init(): void {
    this.initTangramCalendar();
    this.initInteractivePuzzle();
  }

  destroy(): void {
    if (this.interactivePuzzle) {
      this.interactivePuzzle.destroy();
    }
  }

  private initTangramCalendar(): void {
    // Get current date in YYYY-MM-DD format
    const localDate = new Date();
    const targetDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    const targetDateStr = this.dateToString(targetDate);
    
    // Load hint (but keep it hidden)
    this.fetchTangramData(`${BASE_URL}hint/${targetDateStr}`)
      .then(data => {
        this.renderTangramGrid('tangram-hint', data);
        // Ensure hint stays hidden after rendering
        const hintDiv = document.getElementById('tangram-hint');
        if (hintDiv) {
          hintDiv.classList.add('hidden');
        }
      })
      .catch(error => {
        const hintDiv = document.getElementById('tangram-hint');
        if (hintDiv) {
          hintDiv.innerHTML = `<div class="text-red-600">Error loading hint: ${error.message}</div>`;
          // Ensure hint stays hidden even on error
          hintDiv.classList.add('hidden');
        }
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

    // Show solution button
    const showSolutionBtn = document.getElementById('show-solution-btn');
    if (showSolutionBtn) {
      showSolutionBtn.addEventListener('click', () => {
        const solutionDiv = document.getElementById('tangram-solution');
        
        // Render the solution data if available
        if (this.solutionData) {
          this.renderTangramGrid('tangram-solution', this.solutionData);
        }
        
        if (solutionDiv) {
          solutionDiv.classList.remove('hidden');
        }
        showSolutionBtn.style.display = 'none';
      });
    }

    // Show hint button
    const showHintBtn = document.getElementById('show-hint-btn');
    if (showHintBtn) {
      showHintBtn.addEventListener('click', () => {
        const hintDiv = document.getElementById('tangram-hint');
        if (hintDiv) {
          hintDiv.classList.remove('hidden');
        }
        showHintBtn.style.display = 'none';
      });
    }
  }

  // Function to fetch tangram data
  private async fetchTangramData(url: string): Promise<string[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tangram data (${response.status})`);
    }
    const text = await response.text();
    return this.rawToArray(text);
  }

  // Convert raw text response to array of strings
  private rawToArray(response: string): string[] {
    return response.trim().split("\n");
  }

  // Convert date to string in YYYY-MM-DD format
  private dateToString(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  // Render tangram grid
  private renderTangramGrid(elementId: string, rows: string[]): void {
    const container = document.getElementById(elementId);
    if (!container) return;
    
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

  // Function to colorize tangram characters
  private colorTangram(text: string): string {
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

  // Initialize interactive puzzle
  private initInteractivePuzzle(): void {
    this.interactivePuzzle = new InteractiveTangramPuzzle();
  }
}
