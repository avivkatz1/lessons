import { useCallback } from 'react';

/**
 * Hook for handling grid click/tap interactions
 *
 * Converts Konva Stage click events (pixel positions) into grid cell coordinates
 * Used for interactive point placement in PlottingPoints Levels 4-6, 8
 *
 * @param {number} canvasWidth - Width of the canvas in pixels
 * @param {number} gridSize - Number of grid cells (e.g., 11 for 11×11 grid)
 * @param {function} onCellClick - Callback function(row, col) called when a cell is clicked
 * @returns {object} { handleStageClick } event handler for Konva Stage
 *
 * @example
 * const handleCellClick = (row, col) => {
 *   console.log(`Clicked cell at row ${row}, col ${col}`);
 *   setPlacedPoint({ row, col });
 * };
 *
 * const { handleStageClick } = useGridInteraction(400, 11, handleCellClick);
 *
 * // Usage in component:
 * // <Stage width={400} height={400} onClick={handleStageClick}>
 * //   Grid rendering here
 * // </Stage>
 */
export function useGridInteraction(canvasWidth, gridSize, onCellClick) {
  /**
   * Handle click events on the Konva Stage
   * Converts pixel position to grid cell and calls onCellClick callback
   *
   * @param {object} e - Konva event object
   */
  const handleStageClick = useCallback((e) => {
    // Get the stage and pointer position
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Calculate cell size
    const cellSize = canvasWidth / gridSize;

    // Convert pixel position to grid cell indices
    const col = Math.floor(pos.x / cellSize);
    const row = Math.floor(pos.y / cellSize);

    // Bounds checking - ensure click is within grid
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      onCellClick(row, col);
    }
  }, [canvasWidth, gridSize, onCellClick]);

  /**
   * Get cell size in pixels (useful for rendering)
   */
  const cellSize = canvasWidth / gridSize;

  /**
   * Convert grid cell to pixel position (for rendering points at cell centers)
   *
   * @param {number} row - Grid row index
   * @param {number} col - Grid column index
   * @returns {{ x: number, y: number }} Pixel coordinates of cell center
   */
  const cellToPixel = useCallback((row, col) => {
    return {
      x: col * cellSize + cellSize / 2,
      y: row * cellSize + cellSize / 2,
    };
  }, [cellSize]);

  /**
   * Convert pixel position to grid cell (inverse of cellToPixel)
   *
   * @param {number} pixelX - X coordinate in pixels
   * @param {number} pixelY - Y coordinate in pixels
   * @returns {{ row: number, col: number }} Grid cell indices
   */
  const pixelToCell = useCallback((pixelX, pixelY) => {
    return {
      col: Math.floor(pixelX / cellSize),
      row: Math.floor(pixelY / cellSize),
    };
  }, [cellSize]);

  return {
    handleStageClick,
    cellSize,
    cellToPixel,
    pixelToCell,
  };
}

export default useGridInteraction;
