import './tangramgame.css';

// Tangram piece definitions
export const PIECE_DEFINITIONS = [
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]], // T
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], // wide L
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], // tall L
  [[0, 0], [0, 1], [0, 2], [1, 2]],         // small L
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2]], // U
  [[0, 0], [0, 1], [0, 2], [0, 3]],         // |
  [[0, 0], [0, 1], [0, 2], [1, 1], [1, 2]], // Utah
  [[0, 0], [0, 1], [1, 1], [1, 2]],         // Tetris s
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]], // Z
  [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3]]  // Skidding s
];

// Grid constants
export const MONTH_LOCATIONS = new Map([
  [0, [0, 0]], [1, [1, 0]], [2, [2, 0]], [3, [3, 0]],  [4, [4, 0]],  [5, [5, 0]], // Jan-Jun
  [6, [0, 1]], [7, [1, 1]], [8, [2, 1]], [9, [3, 1]], [10, [4, 1]], [11, [5, 1]]  // Jul-Dec
]);

export const DAY_LOCATIONS = new Map();
for (let day = 1; day <= 31; day++) {
  const row = Math.floor((day - 1) / 7) + 2;
  const col = (day - 1) % 7;
  DAY_LOCATIONS.set(day, [col, row]);
}

export const DAY_OF_WEEK_LOCATIONS = new Map([
  [0, [3, 6]], [1, [4, 6]], [2, [5, 6]], [3, [6, 6]], // Sun-Wed
               [4, [4, 7]], [5, [5, 7]], [6, [6, 7]]  // Thu-Sat
]);

export class InteractiveTangramPuzzle {
  constructor() {
    this.pieces = [];
    this.grid = new Array(8).fill(null).map(() => new Array(7).fill(null));
    this.currentDate = new Date();
    this.dragState = null;
    this.lastPreviewUpdate = 0;
    this.selectedPiece = null;
    this.initGrid();
    this.initPieces();
    this.render();
    this.setupMobileControls();
    document.getElementById('reset-puzzle-btn').addEventListener('click', () => this.reset());
  }

  initGrid() {
    // Initialize all cells as invalid first
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 7; x++) {
        this.grid[y][x] = 'invalid';
      }
    }

    // Mark valid cells from GridConstants
    // All month locations are valid
    for (const [month, [x, y]] of MONTH_LOCATIONS) {
      this.grid[y][x] = null;
    }

    // All day locations are valid
    for (const [day, [x, y]] of DAY_LOCATIONS) {
      this.grid[y][x] = null;
    }

    // All day of week locations are valid
    for (const [dayOfWeek, [x, y]] of DAY_OF_WEEK_LOCATIONS) {
      this.grid[y][x] = null;
    }

    // Now mark current date cells as occupied
    const month = this.currentDate.getMonth();
    const day = this.currentDate.getDate();
    const dayOfWeek = this.currentDate.getDay();

    if (MONTH_LOCATIONS.has(month)) {
      const [x, y] = MONTH_LOCATIONS.get(month);
      this.grid[y][x] = 'date';
    }
    if (DAY_LOCATIONS.has(day)) {
      const [x, y] = DAY_LOCATIONS.get(day);
      this.grid[y][x] = 'date';
    }
    if (DAY_OF_WEEK_LOCATIONS.has(dayOfWeek)) {
      const [x, y] = DAY_OF_WEEK_LOCATIONS.get(dayOfWeek);
      this.grid[y][x] = 'date';
    }
  }

  initPieces() {
    PIECE_DEFINITIONS.forEach((coords, index) => {
      const piece = new TangramPiece(index, coords);
      this.pieces.push(piece);
    });
  }

  render() {
    this.renderGrid();
    this.renderPieces();
    this.checkSolution();
  }

  renderGrid() {
    const boardElement = document.getElementById('tangram-board');
    boardElement.innerHTML = '';

    const gridElement = document.createElement('div');
    gridElement.className = 'puzzle-grid';

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 7; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        if (this.grid[y][x] === 'invalid') {
          cell.classList.add('invalid-cell');
        } else if (this.grid[y][x] === 'date') {
          cell.classList.add('date-cell');
          cell.textContent = this.getDateCellText(x, y);
        } else if (this.grid[y][x] !== null) {
          cell.classList.add('occupied');
          cell.classList.add(`tangram-piece-${this.grid[y][x]}`);
        } else {
          // Check if this is a valid cell that should show grayed-out date text
          const dateText = this.getDateCellText(x, y);
          if (dateText) {
            cell.classList.add('inactive-date-cell');
            cell.textContent = dateText;
          }
        }

        gridElement.appendChild(cell);
      }
    }

    boardElement.appendChild(gridElement);
  }

  getDateCellText(x, y) {
    // Create reverse lookup maps for efficiency (could be cached as class properties)
    const coordKey = `${x},${y}`;
    
    // Check month
    for (const [m, [mx, my]] of MONTH_LOCATIONS) {
      if (mx === x && my === y) {
        return new Date(2000, m, 1).toLocaleDateString('en', { month: 'short' });
      }
    }
    
    // Check day
    for (const [d, [dx, dy]] of DAY_LOCATIONS) {
      if (dx === x && dy === y) {
        return d.toString();
      }
    }
    
    // Check day of week
    for (const [dow, [dwx, dwy]] of DAY_OF_WEEK_LOCATIONS) {
      if (dwx === x && dwy === y) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[dow];
      }
    }
    
    return '';
  }

  renderPieces() {
    const paletteElement = document.getElementById('piece-palette');
    paletteElement.innerHTML = '';

    this.pieces.forEach((piece, index) => {
      const paletteItem = document.createElement('div');
      paletteItem.className = 'piece-palette-item';
      if (piece.isPlaced) {
        paletteItem.classList.add('empty');
      }
      if (this.selectedPiece === piece) {
        paletteItem.classList.add('selected');
      }
      const pieceElement = piece.createElement();
      paletteItem.appendChild(pieceElement);
      paletteElement.appendChild(paletteItem);
      this.setupPieceEvents(paletteItem, piece);
    });
  }

  setupPieceEvents(element, piece) {
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click - start drag
        if (e.shiftKey) { // Shift+click - flip
          piece.flip();
          this.render();
          e.preventDefault();
          return;
        }
        this.startDragOperation(piece, e, element);
      } else if (e.button === 2) { // Right click - rotate
        piece.rotate();
        this.render();
        e.preventDefault();
      }
    };

    const handleTouchStart = (e) => {
      // Prevent palette scrolling during touch
      e.preventDefault();
      
      // Start drag operation immediately - the threshold logic will handle selection vs drag
      const startTouch = e.touches[0];
      const mouseEvent = {
        clientX: startTouch.clientX,
        clientY: startTouch.clientY,
        button: 0,
        preventDefault: () => e.preventDefault()
      };
      this.startDragOperation(piece, mouseEvent, element);
    };

    // Add click handler for desktop selection
    const handleClick = (e) => {
      if (e.detail === 1) { // Single click
        setTimeout(() => {
          if (e.detail === 1) { // Still single click after delay
            this.selectPiece(piece);
          }
        }, 200);
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('click', handleClick);
    element.addEventListener('contextmenu', (e) => e.preventDefault());

    // Store cleanup function for later removal
    element._cleanup = () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('click', handleClick);
      element.removeEventListener('contextmenu', (e) => e.preventDefault());
    };

    // Also handle clicks on placed pieces on the grid
    if (piece.isPlaced) {
      this.setupGridPieceEvents(piece);
    }
  }

  createScaledDragElement(piece) {
    const gridElement = document.querySelector('.puzzle-grid');
    if (!gridElement) return piece.createElement();

    const { cellWidth, cellHeight } = this.getGridCellDimensions();
    
    // Scale to 0.7x the grid cell size
    const scaledCellWidth = cellWidth * 0.7;
    const scaledCellHeight = cellHeight * 0.7;
    const cellPadding = (cellWidth - scaledCellWidth) / 2;

    const element = document.createElement('div');
    element.className = 'tangram-piece dragging-scaled';
    element.style.position = 'fixed';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1000';

    const coords = piece.getCurrentCoords();
    const maxX = Math.max(...coords.map(([x, y]) => x));
    const maxY = Math.max(...coords.map(([x, y]) => y));

    element.style.width = (maxX + 1) * cellWidth + 'px';
    element.style.height = (maxY + 1) * cellHeight + 'px';

    coords.forEach(([x, y]) => {
      const cell = document.createElement('div');
      cell.className = `piece-cell tangram-piece-${piece.id}`;
      cell.style.position = 'absolute';
      cell.style.left = (x * cellWidth + cellPadding) + 'px';
      cell.style.top = (y * cellHeight + cellPadding) + 'px';
      cell.style.width = scaledCellWidth + 'px';
      cell.style.height = scaledCellHeight + 'px';
      element.appendChild(cell);
    });

    return element;
  }

  updateDragPreview(piece, mouseX, mouseY) {
    // Throttle preview updates to reduce flickering
    if (this.lastPreviewUpdate && Date.now() - this.lastPreviewUpdate < 16) {
      return; // Skip if less than 16ms since last update (~60fps)
    }
    this.lastPreviewUpdate = Date.now();

    this.clearDragPreview();

    const gridElement = document.querySelector('.puzzle-grid');
    if (!gridElement) return;

    const { cellWidth, cellHeight } = this.getGridCellDimensions();
    const gridRect = gridElement.getBoundingClientRect();

    const gridX = Math.floor((mouseX - gridRect.left) / cellWidth);
    const gridY = Math.floor((mouseY - gridRect.top) / cellHeight);

    // Check if placement is valid
    const canPlace = this.canPlacePiece(piece, gridX, gridY);

    // Show preview for each cell of the piece
    for (const [dx, dy] of piece.getCurrentCoords()) {
      const x = gridX + dx;
      const y = gridY + dy;

      if (x >= 0 && x < 7 && y >= 0 && y < 8) {
        const cell = gridElement.children[y * 7 + x];
        if (cell) {
          cell.classList.add('drag-preview');
          if (canPlace) {
            cell.classList.add('drag-preview-valid');
          } else {
            cell.classList.add('drag-preview-invalid');
          }
          cell.dataset.previewPiece = piece.id;
          cell.dataset.previewValid = canPlace;
        }
      }
    }
  }

  clearDragPreview() {
    const previewCells = document.querySelectorAll('.drag-preview');
    previewCells.forEach(cell => {
      cell.classList.remove('drag-preview', 'drag-preview-valid', 'drag-preview-invalid');
      delete cell.dataset.previewPiece;
      delete cell.dataset.previewValid;
    });
  }

  tryPlacePiece(piece, mouseX, mouseY) {
    const gridElement = document.querySelector('.puzzle-grid');
    if (!gridElement) return;

    const { cellWidth, cellHeight } = this.getGridCellDimensions();
    const gridRect = gridElement.getBoundingClientRect();

    const gridX = Math.floor((mouseX - gridRect.left) / cellWidth);
    const gridY = Math.floor((mouseY - gridRect.top) / cellHeight);

    if (this.canPlacePiece(piece, gridX, gridY)) {
      // Find pieces that would be displaced by this placement
      const displacedPieces = this.findDisplacedPieces(piece, gridX, gridY);

      // Remove piece from current position if placed
      if (piece.isPlaced) {
        this.removePieceFromGrid(piece);
      }

      // Remove displaced pieces (except the piece being placed)
      displacedPieces.forEach(displacedPiece => {
        if (displacedPiece.id !== piece.id) {
          this.removePieceFromGrid(displacedPiece);
          displacedPiece.isPlaced = false;
          displacedPiece.gridX = 0;
          displacedPiece.gridY = 0;
        }
      });

      // Place piece at new position
      piece.gridX = gridX;
      piece.gridY = gridY;
      piece.isPlaced = true;
      this.placePieceOnGrid(piece);

      // Automatically check solution after placing a piece
      this.checkSolution();
    }
  }

  canPlacePiece(piece, gridX, gridY) {
    for (const [dx, dy] of piece.getCurrentCoords()) {
      const x = gridX + dx;
      const y = gridY + dy;

      // Check bounds
      if (x < 0 || x >= 7 || y < 0 || y >= 8) {
        return false;
      }

      // Check if cell is invalid (but allow occupied cells - we'll handle displacement)
      if (this.grid[y][x] === 'invalid' || this.grid[y][x] === 'date') {
        return false;
      }
    }
    return true;
  }

  placePieceOnGrid(piece) {
    for (const [dx, dy] of piece.getCurrentCoords()) {
      const x = piece.gridX + dx;
      const y = piece.gridY + dy;
      this.grid[y][x] = piece.id;
    }
  }

  removePieceFromGrid(piece) {
    this.forEachGridCell((x, y) => {
      if (this.grid[y][x] === piece.id) {
        this.grid[y][x] = null;
      }
    });
  }

  findDisplacedPieces(piece, gridX, gridY) {
    const displacedPieceIds = new Set();

    // Check each cell that the piece would occupy
    for (const [dx, dy] of piece.getCurrentCoords()) {
      const x = gridX + dx;
      const y = gridY + dy;

      if (x >= 0 && x < 7 && y >= 0 && y < 8) {
        const occupyingPieceId = this.grid[y][x];
        if (occupyingPieceId !== null && occupyingPieceId !== 'invalid' && occupyingPieceId !== 'date') {
          displacedPieceIds.add(occupyingPieceId);
        }
      }
    }

    // Return the actual piece objects
    return this.pieces.filter(p => displacedPieceIds.has(p.id));
  }

  reset() {
    // Reset all pieces
    this.pieces.forEach(piece => {
      piece.isPlaced = false;
      piece.gridX = 0;
      piece.gridY = 0;
    });

    // Reinitialize the grid to restore valid/invalid states
    this.initGrid();
    this.render();
  }

  checkSolution() {
    let allPiecesPlaced = this.pieces.every(piece => piece.isPlaced);
    let allCellsFilled = true;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 7; x++) {
        if (this.grid[y][x] === null) {
          allCellsFilled = false;
          break;
        }
      }
      if (!allCellsFilled) break;
    }

    if (allPiecesPlaced && allCellsFilled) {
      this.updateStatus('Congratulations! Puzzle solved!', 'success');
    }
  }

  updateStatus(message, type = '') {
    const statusElement = document.getElementById('puzzle-status');
    statusElement.textContent = message;
    statusElement.className = 'px-3 py-2 text-sm font-medium';
    if (type) {
      statusElement.classList.add(type);
    }
  }

  setupGridPieceEvents(piece) {
    // Find all grid cells occupied by this piece and add click handlers
    this.forEachPieceCell(piece, (x, y) => {
      const gridElement = document.querySelector('.puzzle-grid');
      if (gridElement) {
        const cell = gridElement.children[y * 7 + x];
        if (cell && !cell._pieceEventSetup) {
          cell._pieceEventSetup = true;
          cell.style.cursor = 'grab';

          const handleGridPieceClick = (e) => {
            if (e.button === 0) { // Left click - start drag from grid
              this.startDragOperation(piece, e, null);
            }
          };

          const handleGridTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = {
              clientX: touch.clientX,
              clientY: touch.clientY,
              button: 0,
              preventDefault: () => e.preventDefault()
            };
            this.startDragOperation(piece, mouseEvent, null);
          };

          cell.addEventListener('mousedown', handleGridPieceClick);
          cell.addEventListener('touchstart', handleGridTouchStart, { passive: false });
          cell.addEventListener('contextmenu', (e) => e.preventDefault());
        }
      }
    });
  }

  // Helper methods for code reuse
  forEachGridCell(callback) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 7; x++) {
        callback(x, y);
      }
    }
  }

  forEachPieceCell(piece, callback) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 7; x++) {
        if (this.grid[y][x] === piece.id) {
          callback(x, y);
        }
      }
    }
  }

  getGridCellDimensions() {
    const gridElement = document.querySelector('.puzzle-grid');
    const cellWidth = gridElement ? gridElement.getBoundingClientRect().width / 7 : 50;
    const cellHeight = gridElement ? gridElement.getBoundingClientRect().height / 8 : 50;
    return { cellWidth, cellHeight };
  }

  startDragOperation(piece, event, sourceElement) {
    // Create dragging element but keep it hidden initially
    const dragElement = this.createScaledDragElement(piece);
    dragElement.style.display = 'none';
    document.body.appendChild(dragElement);

    // Calculate offset based on where the user clicked/touched within the source element
    const { cellWidth, cellHeight } = this.getGridCellDimensions();
    let startX = cellWidth / 2;
    let startY = cellHeight / 2;

    // If we have a source element (palette item), calculate offset relative to it
    if (sourceElement) {
      const sourceRect = sourceElement.getBoundingClientRect();
      const relativeX = event.clientX - sourceRect.left;
      const relativeY = event.clientY - sourceRect.top;
      
      // Scale the relative position to grid cell size
      const scaleX = cellWidth / sourceRect.width;
      const scaleY = cellHeight / sourceRect.height;
      
      startX = relativeX * scaleX;
      startY = relativeY * scaleY;
    }

    dragElement.style.left = (event.clientX - startX) + 'px';
    dragElement.style.top = (event.clientY - startY) + 'px';

    let isDragging = false;
    let hasActuallyMoved = false;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const dragThreshold = 5; // pixels of movement required to start actual drag

    const handleMouseMove = (e) => {
      const deltaX = Math.abs(e.clientX - startClientX);
      const deltaY = Math.abs(e.clientY - startClientY);
      
      // Check if we've moved enough to start actual dragging
      if (!hasActuallyMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
        hasActuallyMoved = true;
        isDragging = true;
        
        // Now remove piece from grid if it was placed
        if (piece.isPlaced) {
          this.removePieceFromGrid(piece);
          piece.isPlaced = false;
          piece.gridX = 0;
          piece.gridY = 0;
          this.render();
        }
        
        // Show the drag element and set opacity
        dragElement.style.display = 'block';
        if (sourceElement) {
          sourceElement.style.opacity = '0.5';
        }
      }
      
      if (isDragging && dragElement) {
        dragElement.style.left = (e.clientX - startX) + 'px';
        dragElement.style.top = (e.clientY - startY) + 'px';
        this.updateDragPreview(piece, e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startClientX);
      const deltaY = Math.abs(touch.clientY - startClientY);
      
      // Check if we've moved enough to start actual dragging
      if (!hasActuallyMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
        hasActuallyMoved = true;
        isDragging = true;
        
        // Now remove piece from grid if it was placed
        if (piece.isPlaced) {
          this.removePieceFromGrid(piece);
          piece.isPlaced = false;
          piece.gridX = 0;
          piece.gridY = 0;
          this.render();
        }
        
        // Show the drag element and set opacity
        dragElement.style.display = 'block';
        if (sourceElement) {
          sourceElement.style.opacity = '0.5';
        }
        
        // Update drag element position immediately when dragging starts
        dragElement.style.left = (touch.clientX - startX) + 'px';
        dragElement.style.top = (touch.clientY - startY) + 'px';
      }
      
      if (isDragging && dragElement) {
        e.preventDefault();
        // Prevent body scrolling during drag
        document.body.style.overflow = 'hidden';
        dragElement.style.left = (touch.clientX - startX) + 'px';
        dragElement.style.top = (touch.clientY - startY) + 'px';
        this.updateDragPreview(piece, touch.clientX, touch.clientY);
      }
    };

    const handleMouseUp = (e) => {
      // Clean up regardless of whether we actually dragged
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      if (dragElement) {
        document.body.removeChild(dragElement);
      }

      // Restore body scrolling
      document.body.style.overflow = '';

      if (sourceElement) {
        sourceElement.style.opacity = '1';
      }

      // Only try to place piece if we actually started dragging
      if (hasActuallyMoved && isDragging) {
        isDragging = false;
        this.clearDragPreview();
        this.tryPlacePiece(piece, e.clientX, e.clientY);
        this.render();
      } else {
        // If we didn't actually move, just clear any preview
        this.clearDragPreview();
      }
    };

    const handleTouchEnd = (e) => {
      // Clean up regardless of whether we actually dragged
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      if (dragElement) {
        document.body.removeChild(dragElement);
      }

      // Restore body scrolling
      document.body.style.overflow = '';

      if (sourceElement) {
        sourceElement.style.opacity = '1';
      }

      // Only try to place piece if we actually started dragging
      if (hasActuallyMoved && isDragging) {
        e.preventDefault();
        isDragging = false;
        this.clearDragPreview();
        
        // Use the last touch position
        const touch = e.changedTouches[0];
        this.tryPlacePiece(piece, touch.clientX, touch.clientY);
        this.render();
      } else {
        // If we didn't actually move, treat it as a selection tap on mobile
        this.selectPiece(piece);
        this.clearDragPreview();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    event.preventDefault();
  }

  setupMobileControls() {
    const rotateBtn = document.getElementById('rotate-btn');
    const flipBtn = document.getElementById('flip-btn');
    
    if (rotateBtn && flipBtn) {
      rotateBtn.addEventListener('click', () => {
        if (this.selectedPiece) {
          this.selectedPiece.rotate();
          this.render();
        }
      });
      
      flipBtn.addEventListener('click', () => {
        if (this.selectedPiece) {
          this.selectedPiece.flip();
          this.render();
        }
      });
    }
  }

  selectPiece(piece) {
    this.selectedPiece = piece;
    this.updateMobileControls();
    this.render();
  }

  updateMobileControls() {
    const rotateBtn = document.getElementById('rotate-btn');
    const flipBtn = document.getElementById('flip-btn');
    const infoDiv = document.getElementById('selected-piece-info');
    
    if (rotateBtn && flipBtn && infoDiv) {
      if (this.selectedPiece) {
        rotateBtn.disabled = false;
        flipBtn.disabled = false;
        infoDiv.textContent = `You have selected a piece`;
      } else {
        rotateBtn.disabled = true;
        flipBtn.disabled = true;
        infoDiv.textContent = 'Tap a piece to select it';
      }
    }
  }

  destroy() {
    this.clearDragPreview();
    // Clean up event listeners if needed
  }
}
// Tangram Piece Class
class TangramPiece {
  constructor(id, coords) {
    this.id = id;
    this.originalCoords = coords.map(([x, y]) => [x, y]);
    this.currentCoords = coords.map(([x, y]) => [x, y]);
    this.rotation = 0;
    this.flipped = false;
    this.isPlaced = false;
    this.gridX = 0;
    this.gridY = 0;
  }

  getCurrentCoords() {
    return this.currentCoords;
  }

  rotate() {
    this.rotation = (this.rotation + 90) % 360;
    this.updateCoords();
  }

  flip() {
    this.flipped = !this.flipped;
    this.updateCoords();
  }

  updateCoords() {
    let coords = [...this.originalCoords];

    // Apply transformations in sequence
    const rotations = this.rotation / 90;
    for (let i = 0; i < rotations; i++) {
      coords = this.rotateCoords(coords);
    }

    if (this.flipped) {
      coords = this.flipCoords(coords);
    }

    this.currentCoords = this.normalizeCoords(coords);
  }

  rotateCoords(coords) {
    // Rotate 90 degrees clockwise around origin
    return this.normalizeCoords(coords.map(([x, y]) => [-y, x]));
  }

  flipCoords(coords) {
    // Flip horizontally
    const maxX = Math.max(...coords.map(([x, y]) => x));
    return this.normalizeCoords(coords.map(([x, y]) => [maxX - x, y]));
  }

  normalizeCoords(coords) {
    const xs = coords.map(([x, y]) => x);
    const ys = coords.map(([x, y]) => y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return coords.map(([x, y]) => [x - minX, y - minY]);
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'tangram-piece';
    element.style.position = 'relative';

    const coords = this.getCurrentCoords();
    const { maxX, maxY } = this.getBounds(coords);
    const cellSize = 20;

    element.style.width = (maxX + 1) * cellSize + 'px';
    element.style.height = (maxY + 1) * cellSize + 'px';

    coords.forEach(([x, y]) => {
      const cell = document.createElement('div');
      cell.className = `piece-cell tangram-piece-${this.id}`;
      cell.style.cssText = `position: absolute; left: ${x * cellSize}px; top: ${y * cellSize}px;`;
      element.appendChild(cell);
    });

    return element;
  }

  getBounds(coords) {
    const xs = coords.map(([x, y]) => x);
    const ys = coords.map(([x, y]) => y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }

  reset() {
    Object.assign(this, {
      rotation: 0,
      flipped: false,
      isPlaced: false,
      gridX: 0,
      gridY: 0,
      currentCoords: [...this.originalCoords]
    });
  }
}
