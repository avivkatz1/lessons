/**
 * Smart Positioning System for Geometry Diagrams
 *
 * This module provides utilities for dynamic text positioning in geometry lessons
 * to prevent dimension labels and diagram text from being covered by lines/shapes.
 *
 * Architecture:
 * - Layer 1: TextMeasurer - Accurate text dimension calculation using Konva
 * - Layer 2: BoundingBoxRegistry - Collision detection with spatial grid indexing
 * - Layer 3: SmartPositionCalculator - Intelligent position finding with fallbacks
 */

import Konva from 'konva';

/**
 * TextMeasurer - Accurate dimension calculation for text elements
 * Uses Konva's native getTextWidth() for accurate text bounds
 */
export class TextMeasurer {
  constructor() {
    // Create a single reusable text node for measurements
    this.measurementNode = new Konva.Text({
      text: '',
      visible: false
    });
  }

  /**
   * Measure text dimensions accurately
   * @param {string} text - The text to measure
   * @param {object} config - Font configuration
   * @param {number} config.fontSize - Font size in pixels
   * @param {string} config.fontStyle - Font style (normal, bold, italic)
   * @param {string} config.fontFamily - Font family
   * @returns {object} - { width, height }
   */
  measureText(text, { fontSize = 16, fontStyle = 'normal', fontFamily = 'Arial' }) {
    this.measurementNode.setAttrs({
      text,
      fontSize,
      fontStyle,
      fontFamily
    });

    return {
      width: this.measurementNode.getTextWidth(),
      height: this.measurementNode.height()
    };
  }

  /**
   * Get bounding box for text with optional padding
   * @param {string} text - The text to measure
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {object} config - Font configuration
   * @param {number} padding - Extra padding around text (default: 5)
   * @returns {object} - { x, y, width, height }
   */
  getBoundingBox(text, x, y, config, padding = 5) {
    const { width, height } = this.measureText(text, config);

    return {
      x: x - padding,
      y: y - padding,
      width: width + (padding * 2),
      height: height + (padding * 2)
    };
  }

  /**
   * Clean up measurement node
   */
  destroy() {
    this.measurementNode.destroy();
  }
}

/**
 * BoundingBoxRegistry - Collision tracking with spatial grid indexing
 * Tracks all canvas elements and provides O(k) collision detection
 */
export class BoundingBoxRegistry {
  constructor(canvasWidth, canvasHeight, cellSize = 50) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cellSize = cellSize;

    // Spatial grid for fast collision detection
    this.grid = new Map();

    // All registered elements
    this.elements = new Map();

    // Grid dimensions
    this.gridCols = Math.ceil(canvasWidth / cellSize);
    this.gridRows = Math.ceil(canvasHeight / cellSize);
  }

  /**
   * Get grid cell key for coordinates
   * @private
   */
  _getCellKey(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return `${col},${row}`;
  }

  /**
   * Get all grid cells that intersect with a bounding box
   * @private
   */
  _getCellsForBounds(bounds) {
    const cells = new Set();

    const minCol = Math.max(0, Math.floor(bounds.x / this.cellSize));
    const maxCol = Math.min(this.gridCols - 1, Math.floor((bounds.x + bounds.width) / this.cellSize));
    const minRow = Math.max(0, Math.floor(bounds.y / this.cellSize));
    const maxRow = Math.min(this.gridRows - 1, Math.floor((bounds.y + bounds.height) / this.cellSize));

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        cells.add(`${col},${row}`);
      }
    }

    return cells;
  }

  /**
   * Check if two bounding boxes overlap
   * @private
   */
  _boundsOverlap(a, b) {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * Register an element with the registry
   * @param {string} id - Unique identifier for the element
   * @param {object} bounds - Bounding box { x, y, width, height }
   * @param {string} type - Element type (shape, text, line, etc.)
   * @param {number} priority - Priority for conflict resolution (higher = more important)
   */
  register(id, bounds, type = 'unknown', priority = 5) {
    // Remove old registration if exists
    this.unregister(id);

    const element = {
      id,
      bounds,
      type,
      priority,
      cells: this._getCellsForBounds(bounds)
    };

    this.elements.set(id, element);

    // Add to spatial grid
    element.cells.forEach(cellKey => {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey).add(id);
    });
  }

  /**
   * Unregister an element
   * @param {string} id - Element identifier
   */
  unregister(id) {
    const element = this.elements.get(id);
    if (!element) return;

    // Remove from spatial grid
    element.cells.forEach(cellKey => {
      const cell = this.grid.get(cellKey);
      if (cell) {
        cell.delete(id);
        if (cell.size === 0) {
          this.grid.delete(cellKey);
        }
      }
    });

    this.elements.delete(id);
  }

  /**
   * Get all elements that overlap with given bounds
   * @param {object} bounds - Bounding box to check
   * @param {string} excludeId - Optional ID to exclude from results
   * @returns {Array} - Array of overlapping elements
   */
  getOverlaps(bounds, excludeId = null) {
    const cells = this._getCellsForBounds(bounds);
    const candidateIds = new Set();

    // Collect all candidate elements from grid cells
    cells.forEach(cellKey => {
      const cell = this.grid.get(cellKey);
      if (cell) {
        cell.forEach(id => {
          if (id !== excludeId) {
            candidateIds.add(id);
          }
        });
      }
    });

    // Check actual overlaps
    const overlaps = [];
    candidateIds.forEach(id => {
      const element = this.elements.get(id);
      if (element && this._boundsOverlap(bounds, element.bounds)) {
        overlaps.push(element);
      }
    });

    return overlaps;
  }

  /**
   * Check if bounds are within canvas boundaries
   * @param {object} bounds - Bounding box to check
   * @param {number} margin - Optional margin from edges (default: 0)
   * @returns {boolean}
   */
  isWithinCanvas(bounds, margin = 0) {
    return (
      bounds.x >= margin &&
      bounds.y >= margin &&
      bounds.x + bounds.width <= this.canvasWidth - margin &&
      bounds.y + bounds.height <= this.canvasHeight - margin
    );
  }

  /**
   * Check if position is collision-free
   * @param {object} bounds - Bounding box to check
   * @param {string} excludeId - Optional ID to exclude from collision check
   * @returns {boolean}
   */
  isPositionValid(bounds, excludeId = null) {
    return this.isWithinCanvas(bounds) && this.getOverlaps(bounds, excludeId).length === 0;
  }

  /**
   * Clear all registrations
   */
  clear() {
    this.elements.clear();
    this.grid.clear();
  }
}

/**
 * SmartPositionCalculator - Intelligent position finding with fallbacks
 * Finds collision-free positions using multi-strategy approach
 */
export class SmartPositionCalculator {
  constructor(registry, textMeasurer) {
    this.registry = registry;
    this.textMeasurer = textMeasurer;
  }

  /**
   * Calculate smart position for dimension label (side length)
   * @param {object} config - Configuration object
   * @param {number} config.x1 - Start X
   * @param {number} config.y1 - Start Y
   * @param {number} config.x2 - End X
   * @param {number} config.y2 - End Y
   * @param {string} config.label - Label text
   * @param {string} config.orientation - 'horizontal' or 'vertical'
   * @param {number} config.fontSize - Font size
   * @param {string} config.fontStyle - Font style
   * @param {string} config.fontFamily - Font family
   * @param {string} config.id - Element ID
   * @param {number} config.baseOffset - Base offset distance (default: 20)
   * @returns {object} - { x, y, bounds } or null if no position found
   */
  calculateDimensionPosition(config) {
    const {
      x1, y1, x2, y2,
      label,
      fontSize = 16,
      fontStyle = 'normal',
      fontFamily = 'Arial',
      id,
      baseOffset = 20
    } = config;

    const textDims = this.textMeasurer.measureText(label, { fontSize, fontStyle, fontFamily });

    // Calculate line midpoint
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Calculate perpendicular direction
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length;
    const perpY = dx / length;

    // Strategy offsets to try (perpendicular to line)
    const strategies = [
      { offset: baseOffset, flip: 1 },      // Preferred offset
      { offset: baseOffset * 1.5, flip: 1 }, // Larger offset
      { offset: baseOffset * 2, flip: 1 },   // Even larger offset
      { offset: baseOffset, flip: -1 },      // Opposite side
      { offset: baseOffset * 1.5, flip: -1 },// Opposite side, larger
      { offset: baseOffset * 2, flip: -1 }   // Opposite side, even larger
    ];

    // Try each strategy
    for (const strategy of strategies) {
      const offsetDist = strategy.offset * strategy.flip;
      const x = midX + (perpX * offsetDist) - (textDims.width / 2);
      const y = midY + (perpY * offsetDist) - (textDims.height / 2);

      const bounds = {
        x,
        y,
        width: textDims.width,
        height: textDims.height
      };

      if (this.registry.isPositionValid(bounds, id)) {
        return { x, y, bounds };
      }
    }

    // Fallback: use preferred position with warning
    console.warn(`[SmartPositioning] No collision-free position found for dimension label "${label}". Using preferred position.`);
    const x = midX + (perpX * baseOffset) - (textDims.width / 2);
    const y = midY + (perpY * baseOffset) - (textDims.height / 2);

    return {
      x,
      y,
      bounds: {
        x,
        y,
        width: textDims.width,
        height: textDims.height
      }
    };
  }

  /**
   * Calculate smart position for shape label (A, B, area values)
   * @param {object} config - Configuration object
   * @param {object} config.shapeBounds - Shape bounding box { x, y, width, height }
   * @param {string} config.label - Label text
   * @param {number} config.fontSize - Font size
   * @param {string} config.fontStyle - Font style
   * @param {string} config.fontFamily - Font family
   * @param {string} config.id - Element ID
   * @param {string} config.preferredPosition - 'above', 'below', 'inside', 'left', 'right'
   * @returns {object} - { x, y, bounds } or null if no position found
   */
  calculateShapeLabelPosition(config) {
    const {
      shapeBounds,
      label,
      fontSize = 16,
      fontStyle = 'normal',
      fontFamily = 'Arial',
      id,
      preferredPosition = 'inside'
    } = config;

    const textDims = this.textMeasurer.measureText(label, { fontSize, fontStyle, fontFamily });

    const centerX = shapeBounds.x + (shapeBounds.width / 2);
    const centerY = shapeBounds.y + (shapeBounds.height / 2);
    const padding = 8; // Padding for outside positions

    // Define all possible strategies
    const allStrategies = {
      'inside-center': {
        x: centerX - (textDims.width / 2),
        y: centerY - (textDims.height / 2)
      },
      'inside-upper': {
        x: centerX - (textDims.width / 2),
        y: shapeBounds.y + (shapeBounds.height * 0.35) - (textDims.height / 2)
      },
      'inside-lower': {
        x: centerX - (textDims.width / 2),
        y: shapeBounds.y + (shapeBounds.height * 0.65) - (textDims.height / 2)
      },
      'inside-left': {
        x: shapeBounds.x + (shapeBounds.width * 0.35) - (textDims.width / 2),
        y: centerY - (textDims.height / 2)
      },
      'inside-right': {
        x: shapeBounds.x + (shapeBounds.width * 0.65) - (textDims.width / 2),
        y: centerY - (textDims.height / 2)
      },
      'above': {
        x: centerX - (textDims.width / 2),
        y: shapeBounds.y - textDims.height - padding
      },
      'below': {
        x: centerX - (textDims.width / 2),
        y: shapeBounds.y + shapeBounds.height + padding
      },
      'left': {
        x: shapeBounds.x - textDims.width - padding,
        y: centerY - (textDims.height / 2)
      },
      'right': {
        x: shapeBounds.x + shapeBounds.width + padding,
        y: centerY - (textDims.height / 2)
      },
      'top-left': {
        x: shapeBounds.x - textDims.width - padding,
        y: shapeBounds.y - textDims.height - padding
      },
      'top-right': {
        x: shapeBounds.x + shapeBounds.width + padding,
        y: shapeBounds.y - textDims.height - padding
      },
      'bottom-left': {
        x: shapeBounds.x - textDims.width - padding,
        y: shapeBounds.y + shapeBounds.height + padding
      },
      'bottom-right': {
        x: shapeBounds.x + shapeBounds.width + padding,
        y: shapeBounds.y + shapeBounds.height + padding
      }
    };

    // Order strategies based on preferred position
    let strategyOrder;
    if (preferredPosition === 'above') {
      strategyOrder = ['above', 'top-left', 'top-right', 'below', 'inside-upper', 'inside-center', 'inside-lower', 'left', 'right', 'bottom-left', 'bottom-right'];
    } else if (preferredPosition === 'below') {
      strategyOrder = ['below', 'bottom-left', 'bottom-right', 'above', 'inside-lower', 'inside-center', 'inside-upper', 'left', 'right', 'top-left', 'top-right'];
    } else if (preferredPosition === 'left') {
      strategyOrder = ['left', 'top-left', 'bottom-left', 'right', 'inside-left', 'inside-center', 'inside-right', 'above', 'below', 'top-right', 'bottom-right'];
    } else if (preferredPosition === 'right') {
      strategyOrder = ['right', 'top-right', 'bottom-right', 'left', 'inside-right', 'inside-center', 'inside-left', 'above', 'below', 'top-left', 'bottom-left'];
    } else {
      // Default: inside preferred
      strategyOrder = ['inside-center', 'inside-upper', 'inside-lower', 'inside-left', 'inside-right', 'above', 'below', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
    }

    // Build strategies array in preferred order
    const strategies = strategyOrder.map(key => allStrategies[key]);

    // Try each strategy
    for (const strategy of strategies) {
      if (!strategy) continue; // Skip undefined strategies

      const bounds = {
        x: strategy.x,
        y: strategy.y,
        width: textDims.width,
        height: textDims.height
      };

      if (this.registry.isPositionValid(bounds, id)) {
        // Found a collision-free position
        return { x: strategy.x, y: strategy.y, bounds };
      }
    }

    // Fallback: use center even if collision exists
    console.warn(`[SmartPositioning] No collision-free position found for shape label "${label}". Using center fallback.`);
    const x = centerX - (textDims.width / 2);
    const y = centerY - (textDims.height / 2);

    return {
      x,
      y,
      bounds: {
        x,
        y,
        width: textDims.width,
        height: textDims.height
      }
    };
  }
}

/**
 * Helper function to register a shape with the registry
 * @param {BoundingBoxRegistry} registry - The registry instance
 * @param {string} id - Unique identifier
 * @param {object} shapeConfig - Shape configuration
 * @param {string} type - Shape type
 * @param {number} priority - Priority level
 */
export function registerShape(registry, id, shapeConfig, type = 'shape', priority = 10) {
  const { x, y, width, height, points } = shapeConfig;

  let bounds;

  if (points) {
    // Calculate bounding box from points array
    const xCoords = [];
    const yCoords = [];

    for (let i = 0; i < points.length; i += 2) {
      xCoords.push(points[i]);
      yCoords.push(points[i + 1]);
    }

    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  } else {
    // Use provided bounds
    bounds = { x, y, width, height };
  }

  registry.register(id, bounds, type, priority);
}

/**
 * Helper function to register a line with the registry
 * @param {BoundingBoxRegistry} registry - The registry instance
 * @param {string} id - Unique identifier
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {number} strokeWidth - Line width (default: 2)
 * @param {number} priority - Priority level
 */
export function registerLine(registry, id, x1, y1, x2, y2, strokeWidth = 2, priority = 8) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const bounds = {
    x: minX - strokeWidth / 2,
    y: minY - strokeWidth / 2,
    width: maxX - minX + strokeWidth,
    height: maxY - minY + strokeWidth
  };

  registry.register(id, bounds, 'line', priority);
}
