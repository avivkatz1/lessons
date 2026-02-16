// Light and Dark theme definitions for the Math Lessons Platform

export const lightTheme = {
  colors: {
    // Page and Card Backgrounds
    pageBackground: '#ffffff',
    cardBackground: '#f9fafb',
    imageCardBackground: '#ffffff',  // Lighter for image visibility
    inputBackground: '#f1efef',
    hoverBackground: '#ddd',

    // Text Colors
    textPrimary: '#000000',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',
    textInverted: '#ffffff',

    // Primary Brand
    primary: '#00BF63',
    primaryHover: '#00a656',
    primaryDisabled: '#80dfb1',

    // Borders and Dividers
    border: '#e5e7eb',
    borderDark: '#d1d5db',
    borderFocus: '#00BF63',

    // Interactive Elements
    buttonSuccess: 'lightgreen',
    buttonError: '#ef4444',
    buttonNeutral: '#6b7280',
    buttonHover: '#f3f4f6',

    // Semantic UI Colors
    success: '#10b981',
    successLight: '#d1fae5',
    error: '#ef4444',
    errorLight: '#fee2e2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',

    // Chapter/Navigation
    chapterHighlight: '#00bf63',
    chapterHover: '#ff0000',
    chapterText: '#000000',

    // Konva-Specific Canvas Colors
    konva: {
      // Canvas
      canvasBackground: '#ffffff',

      // Grid System
      gridRegular: '#0000ff',        // Regular grid lines
      gridDark: '#000080',           // Darker grid lines
      gridOrigin: '#ff0000',         // Origin axes (x=0, y=0)

      // Semantic Lesson Colors (Geometry)
      opposite: '#EF4444',           // Red - opposite side
      adjacent: '#3B82F6',           // Blue - adjacent side
      hypotenuse: '#8B5CF6',         // Purple - hypotenuse
      angle: '#F59E0B',              // Amber - angles

      // Additional Semantic Colors
      horizontal: '#10b981',         // Green - horizontal lines
      vertical: '#ef4444',           // Red - vertical lines
      slope: '#8B5CF6',              // Purple - slope indicators

      // Shape Elements
      shapeStroke: '#000000',        // Default shape outlines
      shapeFill: '#e5e7eb',          // Default shape fills
      shapeHighlight: '#00BF63',     // Highlighted shapes

      // Text and Labels
      labelText: '#000000',          // Canvas text labels
      labelBackground: '#ffffff',    // Label backgrounds

      // Points and Markers
      point: '#ef4444',              // Points on graphs
      pointHighlight: '#00BF63',     // Highlighted points

      // Coordinate System
      coordinateText: '#000000',     // Coordinate labels
      tickMark: '#6b7280',           // Axis tick marks
    }
  }
};

export const darkTheme = {
  colors: {
    // Page and Card Backgrounds
    pageBackground: '#1a1a1a',
    cardBackground: '#2d2d2d',
    imageCardBackground: '#454545',  // Lighter for image visibility
    inputBackground: '#3a3a3a',
    hoverBackground: '#404040',

    // Text Colors
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    textInverted: '#1a1a1a',

    // Primary Brand
    primary: '#00e676',
    primaryHover: '#00ff87',
    primaryDisabled: '#004d29',

    // Borders and Dividers
    border: '#404040',
    borderDark: '#525252',
    borderFocus: '#00e676',

    // Interactive Elements
    buttonSuccess: '#4ade80',
    buttonError: '#f87171',
    buttonNeutral: '#94a3b8',
    buttonHover: '#3a3a3a',

    // Semantic UI Colors
    success: '#4ade80',
    successLight: '#1e3a2a',
    error: '#f87171',
    errorLight: '#3a1e1e',
    warning: '#fbbf24',
    warningLight: '#3a2e1e',
    info: '#60a5fa',
    infoLight: '#1e2a3a',

    // Chapter/Navigation
    chapterHighlight: '#00e676',
    chapterHover: '#ff6b6b',
    chapterText: '#e2e8f0',

    // Konva-Specific Canvas Colors
    konva: {
      // Canvas
      canvasBackground: '#2d2d2d',

      // Grid System (lighter grays for visibility on dark background)
      gridRegular: '#5b9cff',        // Brighter blue for regular grid
      gridDark: '#4a7acc',           // Slightly darker blue
      gridOrigin: '#ff6b6b',         // Brighter red for origin

      // Semantic Lesson Colors (Brighter variants for dark mode)
      opposite: '#ff6b6b',           // Brighter red - opposite side
      adjacent: '#5b9cff',           // Brighter blue - adjacent side
      hypotenuse: '#b794f6',         // Brighter purple - hypotenuse
      angle: '#ffa726',              // Brighter amber - angles

      // Additional Semantic Colors
      horizontal: '#4ade80',         // Brighter green - horizontal
      vertical: '#ff6b6b',           // Brighter red - vertical
      slope: '#b794f6',              // Brighter purple - slope

      // Shape Elements
      shapeStroke: '#e2e8f0',        // Light stroke for visibility
      shapeFill: '#404040',          // Dark gray fills
      shapeHighlight: '#00e676',     // Bright green highlight

      // Text and Labels
      labelText: '#e2e8f0',          // Light text on dark canvas
      labelBackground: '#1a1a1a',    // Dark label backgrounds

      // Points and Markers
      point: '#ff6b6b',              // Bright red points
      pointHighlight: '#00e676',     // Bright green highlighted points

      // Coordinate System
      coordinateText: '#e2e8f0',     // Light coordinate labels
      tickMark: '#94a3b8',           // Visible tick marks
    }
  }
};
