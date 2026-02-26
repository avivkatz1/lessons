# Dynamic Text Positioning Guide for Geometry Diagrams

**Version:** 1.0
**Last Updated:** February 25, 2026
**Status:** Active - Reference for all future geometry lessons

---

## Overview

This guide documents the implementation of a dynamic text positioning system for geometry diagrams in the Area & Perimeter lesson. It serves as a template for creating similar interactive geometry visualizations with properly positioned dimension labels and shape annotations.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Architecture](#solution-architecture)
3. [Core Implementation](#core-implementation)
4. [Visual Design Rules](#visual-design-rules)
5. [Component Usage Patterns](#component-usage-patterns)
6. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
7. [Testing Checklist](#testing-checklist)

---

## Problem Statement

### Initial Issues

1. **Text overlapping with shapes and lines**
   - Fixed offsets caused labels to overlap with diagram elements
   - No collision detection between text and shapes
   - Labels positioned inside shapes instead of outside

2. **Inaccurate text measurement**
   - Used character-based estimation: `label.length * fontSize / 4`
   - Did not account for actual rendered text width/height
   - Led to incorrect positioning calculations

3. **No rotation for angled lines**
   - All text rendered horizontally regardless of line orientation
   - Vertical and diagonal dimension lines had misaligned labels

4. **Height labels inside shapes**
   - Height dimension labels overlapped with triangle/parallelogram interiors
   - Not positioned at the leftmost edge of shapes
   - Inconsistent with trapezoid pattern (Level 6)

---

## Solution Architecture

### Three-Layer System

```
Layer 1: Measurement Engine (TextMeasurer)
    ↓
Layer 2: Collision Detection (BoundingBoxRegistry)
    ↓
Layer 3: Smart Positioning (SmartPositionCalculator)
```

### Core Files

| File | Purpose | Location |
|------|---------|----------|
| `smartPositioning.js` | Core positioning engine | `/geometry/utils/` |
| `useSmartPositioning.js` | React hook integration | `/geometry/hooks/` |
| `DimensionLabel.jsx` | Dimension line component | `/geometry/components/areaPerimeter/` |
| `SmartText.jsx` | Shape label component | `/geometry/components/areaPerimeter/` |

---

## Core Implementation

### 1. TextMeasurer Class

**Purpose:** Accurate text dimension measurement using Konva's native methods

```javascript
export class TextMeasurer {
  constructor() {
    // Create temporary Konva text node for measurement
    this.measurementNode = new Konva.Text({
      text: '',
      fontSize: 14,
      fontStyle: 'normal',
      fontFamily: 'Arial'
    });
  }

  measureText(text, { fontSize = 14, fontStyle = 'normal', fontFamily = 'Arial' }) {
    this.measurementNode.setAttrs({ text, fontSize, fontStyle, fontFamily });
    return {
      width: this.measurementNode.getTextWidth(),
      height: this.measurementNode.height()
    };
  }

  destroy() {
    this.measurementNode.destroy();
  }
}
```

**Key Points:**
- Uses Konva's `getTextWidth()` for pixel-perfect measurement
- Accounts for font style, weight, and family
- Reuses single node for performance

### 2. BoundingBoxRegistry Class

**Purpose:** Track all canvas elements and detect collisions

```javascript
export class BoundingBoxRegistry {
  constructor(canvasWidth, canvasHeight, cellSize = 50) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.cellSize = cellSize;
    this.grid = new Map(); // Spatial grid for O(k) lookup
    this.elements = new Map();
  }

  register(id, bounds, type, priority) {
    const element = { id, bounds, type, priority };
    this.elements.set(id, element);

    // Add to spatial grid cells
    const cells = this._getCellsForBounds(bounds);
    cells.forEach(cellKey => {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, []);
      }
      this.grid.get(cellKey).push(id);
    });
  }

  isPositionValid(bounds, excludeId = null) {
    // Check canvas boundaries
    if (!this.isWithinCanvas(bounds)) return false;

    // Check collisions with other elements
    const overlaps = this.getOverlaps(bounds, excludeId);
    return overlaps.length === 0;
  }
}
```

**Key Points:**
- Spatial grid (50px cells) for O(k) collision checks instead of O(n²)
- Priority system: shapes (10) > text (6-7)
- Canvas boundary checking included

### 3. SmartPositionCalculator Class

**Purpose:** Find collision-free positions with multi-strategy fallback

```javascript
export class SmartPositionCalculator {
  constructor(registry, textMeasurer) {
    this.registry = registry;
    this.textMeasurer = textMeasurer;
  }

  calculateDimensionPosition(config) {
    const { x1, y1, x2, y2, label, fontSize, offset } = config;

    // Try 6 strategies:
    // 1. Preferred offset
    // 2. 1.5x offset
    // 3. 2x offset
    // 4. Opposite side
    // 5. Opposite side 1.5x
    // 6. Fallback to preferred
  }

  calculateShapeLabelPosition(config) {
    const { shapeBounds, label, preferredPosition } = config;

    // Try up to 13 strategies based on preferredPosition:
    // - inside: center, upper, lower, left, right
    // - above/below/left/right: outside positions
    // - corners: diagonal offsets
  }
}
```

**Key Points:**
- Multi-tiered fallback system
- Prefers on-line positioning for dimension labels
- Uses leader lines only as last resort (very short arrows)

### 4. React Hook Integration

```javascript
export function useSmartPositioning(canvasWidth, canvasHeight, cellSize = 50) {
  const instances = useMemo(() => {
    const textMeasurer = new TextMeasurer();
    const registry = new BoundingBoxRegistry(canvasWidth, canvasHeight, cellSize);
    const calculator = new SmartPositionCalculator(registry, textMeasurer);
    return { textMeasurer, registry, calculator };
  }, [canvasWidth, canvasHeight, cellSize]);

  useEffect(() => {
    return () => {
      instances.registry.clear();
      instances.textMeasurer.destroy();
    };
  }, [instances, canvasWidth, canvasHeight]);

  return instances;
}
```

**Key Points:**
- Singleton instances per canvas
- Automatic cleanup on unmount
- Re-initializes on canvas size change

---

## Visual Design Rules

### Rule 1: Height Labels Must Be Outside and Orange

**CRITICAL:** Height dimension labels MUST be positioned to the left of the shape's leftmost edge, not at the apex or center.

**Correct Pattern (Level 6 Trapezoid):**
```javascript
<DimensionLabel
  x1={startX}  // Leftmost X coordinate of shape
  y1={startY + trapHeight}
  x2={startX}  // Same X coordinate (vertical line)
  y2={startY}
  label={`${height} cm`}
  orientation="vertical"
  offset={20}  // POSITIVE offset = left side
  color={konvaTheme.warning || '#F59E0B'}  // ORANGE
  konvaTheme={konvaTheme}
  fontSize={19}
/>
```

**Common Mistakes:**
- ❌ Using apex position: `x1={apexX}` (causes label to be inside triangle)
- ❌ Using center position: `x1={startX + width/2}` (causes label to overlap)
- ❌ Using negative offset: `offset={-20}` (positions on right instead of left)
- ❌ Not using orange color: Missing `color={konvaTheme.warning}`

**Why This Matters:**
- Height labels positioned inside shapes overlap with fill and edges
- Using apex position causes inconsistent label placement across different triangle types
- Students need clear visual distinction between height (perpendicular, orange) and sides (edges, white)

### Rule 2: Dimension Lines Break Around Text

**Implementation:** DimensionLabel automatically breaks the dimension line into two segments with a gap where the text sits.

```javascript
// Automatic line breaking calculation
const gapSize = Math.max(textBounds.width, textBounds.height) / 2 + 5;

// Creates two line segments:
// Segment 1: lineStart → gapStart
// [GAP where text sits]
// Segment 2: gapEnd → lineEnd
```

**Visual Result:**
```
├─────  5 cm  ─────┤
  ↑              ↑
segment 1    segment 2
```

### Rule 3: Text Rotation Matches Line Angle

**Automatic Rotation:** DimensionLabel calculates line angle and rotates text accordingly.

```javascript
const lineAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

<Text
  rotation={lineAngle}
  offsetX={textBounds.width / 2}  // Center on rotation point
  offsetY={textBounds.height / 2}
/>
```

**Results:**
- Horizontal lines: 0° rotation (normal horizontal text)
- Vertical lines: 90° rotation (vertical text reading upward)
- Diagonal lines: Angle-matched rotation (e.g., 45° for diagonal)

### Rule 4: Minimize Arrow Usage

**Guideline:** Only use leader lines (arrows) when absolutely necessary.

**Preference Order:**
1. **On-line positioning** (preferred): Text sits directly on dimension line with line breaking
2. **Offset positioning**: Move text perpendicular to line (increase offset distance)
3. **Leader line** (last resort): Very short arrow (10px offset, 3x3 pointer, 0.75px stroke)

**Arrow Configuration:**
```javascript
// Only when collision cannot be avoided otherwise
<Arrow
  points={[labelX, labelY, lineX, lineY]}
  stroke={lineColor}
  strokeWidth={0.75}  // Very thin
  fill={lineColor}
  pointerLength={3}    // Very small
  pointerWidth={3}
  listening={false}
/>
```

### Rule 5: Register All Shapes Before Labels

**Critical Order:**
```javascript
// 1. Set up smart positioning
const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

// 2. Register shapes FIRST (priority 10)
useEffect(() => {
  registry.register('rect-a', {
    x: rectX, y: rectY,
    width: rectWidth, height: rectHeight
  }, 'shape', 10);
}, [registry, rectX, rectY, rectWidth, rectHeight]);

// 3. Then render dimension labels (priority 6-7)
<DimensionLabel ... />
```

**Why:** Shapes have higher priority (10) than text (6-7), so labels will avoid overlapping shapes.

### Rule 6: Avoid Confusing Area Text

**Guideline:** Do not show area values for decomposed shapes unless explicitly needed for teaching.

**Example - Level 6 Trapezoid:**
- ❌ **Before:** Showed `tri1Area`, `tri2Area`, `rectArea` inside decomposed regions → confused students
- ✅ **After:** Removed all area labels, only show dimensions and formula → clear learning path

**Reasoning:**
- Students should calculate areas themselves, not read them
- Multiple numbers on screen create cognitive overload
- Focus on dimensions (inputs) rather than areas (outputs)

---

## Component Usage Patterns

### Pattern 1: Basic Dimension Label (Horizontal/Vertical)

```javascript
<DimensionLabel
  x1={startX}
  y1={startY}
  x2={endX}
  y2={endY}
  label="10 cm"
  orientation="horizontal"  // or "vertical"
  offset={20}
  konvaTheme={konvaTheme}
  fontSize={20}
/>
```

### Pattern 2: Smart Dimension Label (With Collision Detection)

```javascript
const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

// Register shape first
useEffect(() => {
  registry.register('my-shape', {
    x: shapeX, y: shapeY,
    width: shapeWidth, height: shapeHeight
  }, 'shape', 10);
}, [registry, shapeX, shapeY, shapeWidth, shapeHeight]);

// Then add dimension label
<DimensionLabel
  x1={startX}
  y1={startY}
  x2={endX}
  y2={endY}
  label="10 cm"
  orientation="horizontal"
  offset={20}
  konvaTheme={konvaTheme}
  registry={registry}
  calculator={calculator}
  enableSmartPositioning={true}
  id="width-label"  // Required for smart positioning
/>
```

### Pattern 3: Height Label (Orange, Outside Left)

```javascript
<DimensionLabel
  x1={startX}  // LEFTMOST X coordinate
  y1={startY}
  x2={startX}  // Same X (vertical)
  y2={startY + height}
  label={`${height} cm`}
  orientation="vertical"
  offset={20}  // POSITIVE = left side
  konvaTheme={konvaTheme}
  fontSize={19}
  color={konvaTheme.warning || '#F59E0B'}  // ORANGE
  registry={registry}
  calculator={calculator}
  enableSmartPositioning={true}
  id="height-label"
/>
```

### Pattern 4: Shape Label (Area, Name)

```javascript
<SmartText
  calculator={calculator}
  shapeBounds={{ x, y, width, height }}
  label="A"
  fontSize={28}
  fontStyle="bold"
  fill={konvaTheme.labelText}
  registry={registry}
  id="shape-a-label"
  preferredPosition="inside"  // or "above", "below", "left", "right"
/>
```

### Pattern 5: Complete Level Setup

```javascript
function MyGeometryLevel({ visualData, onComplete, onNextProblem }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Canvas sizing
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200);
  }, [windowWidth]);
  const canvasHeight = 400;
  const cellSize = 40;

  // Smart positioning setup
  const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

  // Shape coordinates
  const startX = cellSize * 2;
  const startY = cellSize * 2;
  const shapeWidth = visualData.width * cellSize * 0.5;
  const shapeHeight = visualData.height * cellSize * 0.5;

  // Register shape
  useEffect(() => {
    registry.register('main-shape', {
      x: startX,
      y: startY,
      width: shapeWidth,
      height: shapeHeight
    }, 'shape', 10);
  }, [registry, startX, startY, shapeWidth, shapeHeight]);

  return (
    <Container>
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background */}
            <Rect
              x={0} y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Grid */}
            <GridBackground
              width={canvasWidth}
              height={canvasHeight}
              gridSize={10}
              cellSize={cellSize}
              konvaTheme={konvaTheme}
            />

            {/* Shape */}
            <Rect
              x={startX}
              y={startY}
              width={shapeWidth}
              height={shapeHeight}
              fill={konvaTheme.shapeFill}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />

            {/* Width dimension (bottom) */}
            <DimensionLabel
              x1={startX}
              y1={startY + shapeHeight}
              x2={startX + shapeWidth}
              y2={startY + shapeHeight}
              label={`${visualData.width} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="width-label"
            />

            {/* Height dimension (left, orange) */}
            <DimensionLabel
              x1={startX}
              y1={startY + shapeHeight}
              x2={startX}
              y2={startY}
              label={`${visualData.height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={19}
              color={konvaTheme.warning || '#F59E0B'}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="height-label"
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Input section, feedback, buttons... */}
    </Container>
  );
}
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Height Labels Inside Shapes

**Problem:**
```javascript
// ❌ WRONG: Uses apex position
<DimensionLabel
  x1={apexX}  // Apex can be anywhere on the triangle
  y1={startY}
  x2={apexX}
  y2={startY + triHeight}
  label={`${height} cm`}
  offset={-25}  // Negative offset = right side
/>
```

**Solution:**
```javascript
// ✅ CORRECT: Uses leftmost edge
<DimensionLabel
  x1={startX}  // Leftmost X coordinate
  y1={startY}
  x2={startX}
  y2={startY + triHeight}
  label={`${height} cm`}
  offset={20}  // Positive offset = left side (outside)
  color={konvaTheme.warning || '#F59E0B'}  // Orange
/>
```

### Pitfall 2: Recursive Variable Definition

**Problem:**
```javascript
// ❌ WRONG: lineColor references itself
const lineColor = color || lineColor;
```

**Solution:**
```javascript
// ✅ CORRECT: Use theme fallback
const lineColor = color || konvaTheme.labelText || '#4B5563';
```

### Pitfall 3: Conditional useEffect

**Problem:**
```javascript
// ❌ WRONG: useEffect called conditionally
if (enableSmartPositioning) {
  useEffect(() => {
    registry.register(id, bounds, 'text', 7);
  }, [registry, id, bounds]);
}
```

**Solution:**
```javascript
// ✅ CORRECT: Check condition inside hook
useEffect(() => {
  if (enableSmartPositioning && registry && id && bounds) {
    registry.register(id, bounds, 'text', 7);
    return () => registry.unregister(id);
  }
}, [enableSmartPositioning, registry, id, bounds]);
```

### Pitfall 4: Accessing Non-Existent Properties

**Problem:**
```javascript
// ❌ WRONG: calculator is separate from registry
const position = registry.calculator.calculatePosition(...);
```

**Solution:**
```javascript
// ✅ CORRECT: calculator is separate prop
const { registry, calculator } = useSmartPositioning(...);
const position = calculator.calculatePosition(...);
```

### Pitfall 5: Area Text Confusion

**Problem:**
```javascript
// ❌ WRONG: Showing all decomposed area values
<Text text={`${tri1Area} cm²`} x={...} y={...} />
<Text text={`${tri2Area} cm²`} x={...} y={...} />
<Text text={`${rectArea} cm²`} x={...} y={...} />
```

**Solution:**
```javascript
// ✅ CORRECT: Remove area labels, let students calculate
{/* Individual area labels removed - causes confusion for students */}

// Only show in feedback after correct answer
<FeedbackText>
  Correct! ½({base1} + {base2}) × {height} = {area} cm²
</FeedbackText>
```

---

## Testing Checklist

### Visual Regression Tests

- [ ] **Canvas Rendering**
  - [ ] All shapes render without blank canvas
  - [ ] Grid background visible and correctly sized
  - [ ] Shapes fill and stroke render properly

- [ ] **Dimension Labels**
  - [ ] Width labels positioned below shapes (horizontal)
  - [ ] Height labels positioned LEFT of shapes (vertical, orange)
  - [ ] All text rotated to match line angles
  - [ ] Dimension lines break around text properly
  - [ ] No arrows unless absolutely necessary
  - [ ] Arrows are very short (if present)

- [ ] **Collision Detection**
  - [ ] No text overlapping with shapes
  - [ ] No text overlapping with lines
  - [ ] No text-to-text overlap
  - [ ] All text within canvas boundaries
  - [ ] Labels visible in both light and dark modes

- [ ] **Height Labels Specifically**
  - [ ] Positioned at leftmost X of shape (not apex or center)
  - [ ] Orange color (#F59E0B or konvaTheme.warning)
  - [ ] Positive offset (left side placement)
  - [ ] Completely outside shape boundary
  - [ ] Text reads "X cm" not "h = X cm"

### Functional Tests

- [ ] **User Interaction**
  - [ ] Input field accepts numbers
  - [ ] Submit shows correct/incorrect feedback
  - [ ] Reset button clears input and feedback
  - [ ] Next Problem button advances to new problem

- [ ] **Responsive Behavior**
  - [ ] Canvas resizes on window resize
  - [ ] Labels remain positioned correctly after resize
  - [ ] Touch interactions work on iPad
  - [ ] Minimum touch target sizes met (44px)

### Code Quality

- [ ] **React Hooks Rules**
  - [ ] No conditional hook calls
  - [ ] All dependencies listed in dependency arrays
  - [ ] Cleanup functions return from useEffect

- [ ] **Performance**
  - [ ] Position calculation < 16ms per frame
  - [ ] No unnecessary re-renders
  - [ ] Spatial grid used for collision detection (not O(n²))

### Cross-Level Consistency

Test pattern across all levels:

| Level | Shape Type | Height Label Position | Color | Test Status |
|-------|------------|----------------------|-------|-------------|
| Level 2 | Rectangles | (no height label) | - | [ ] |
| Level 3 | Compound shapes | (varies) | - | [ ] |
| Level 4 | Right triangle | Left of shape | Orange | [ ] |
| Level 5 | Any triangle | Left of shape | Orange | [ ] |
| Level 6 | Trapezoid | Left of shape | White | [ ] |
| Level 7 | Mixed shapes | Left of shape | Orange | [ ] |

---

## Implementation History

### Key Iterations & User Feedback

1. **Initial Implementation (Blank Canvas Bug)**
   - Problem: Accessing `registry.calculator` (doesn't exist)
   - Fix: Passed `calculator` as separate prop
   - Learning: Always destructure hook returns properly

2. **Positioning Improvements (Text Overlap)**
   - Problem: Labels overlapping with shapes and lines
   - Fix: Implemented line-breaking technique and collision detection
   - Learning: On-line positioning with gaps is better than offset + arrows

3. **Text Rotation (Vertical/Angled Lines)**
   - Problem: All text horizontal regardless of line orientation
   - Fix: Added rotation calculation using Math.atan2
   - Learning: Text rotation must account for offsetX/offsetY centering

4. **Arrow Minimization**
   - Problem: Too many arrows, arrows too long
   - Fix: Reduced leader line usage, made arrows tiny (10px, 3x3 pointer)
   - Learning: Prefer increasing offset distance over adding arrows

5. **Area Text Removal (Level 6 Confusion)**
   - Problem: Showing decomposed area values confused students
   - Fix: Removed all area labels from Level 6
   - Learning: Show inputs (dimensions), not outputs (areas)

6. **Height Label Positioning (Inside → Outside)**
   - Problem: Height labels overlapping with triangle interiors
   - Fix: Changed from apex position to leftmost edge with positive offset
   - Learning: Consistent positioning rules across all levels matter

7. **Height Label Color (White → Orange)**
   - Problem: Height labels not visually distinct from side dimensions
   - Fix: Added color override prop, set height labels to orange
   - Learning: Color reinforces perpendicular height concept

8. **Slant Label Removal**
   - Problem: Slant side label on parallelogram caused clutter
   - Fix: Removed slant dimension completely
   - Learning: Only show dimensions needed for area calculation

---

## Reference Examples

### Level 5: Any Triangle (Gold Standard)

**Key Features:**
- Height label positioned at `startX` (leftmost edge)
- Orange color for height
- Positive offset (left side)
- Smart positioning enabled
- Formula helper with perpendicular reminder

```javascript
<DimensionLabel
  x1={startX}
  y1={startY}
  x2={startX}
  y2={startY + triHeight}
  label={`${height} cm`}
  orientation="vertical"
  offset={20}
  konvaTheme={konvaTheme}
  fontSize={19}
  color={konvaTheme.warning || '#F59E0B'}
  registry={registry}
  calculator={calculator}
  enableSmartPositioning={true}
  id="height-label"
/>
```

### Level 6: Trapezoid (Consistent Pattern)

**Key Features:**
- Height at leftmost edge (matches Level 5 pattern)
- No area labels (removed for clarity)
- Formula helper with decomposition hint

### Level 7: Mixed Shapes (Full System Test)

**Key Features:**
- Different shapes use same height label pattern
- Triangle: `x1={startX}` (leftmost)
- Parallelogram: `x1={startX}` (leftmost, not center)
- Removed slant label for simplicity

---

## Future Enhancements

### Potential Improvements

1. **Dynamic Offset Calculation**
   - Auto-adjust offset based on shape size
   - Larger shapes → larger offset for clarity

2. **Multi-Language Support**
   - Text measurement must account for different character widths
   - RTL languages may need different positioning logic

3. **Animation Support**
   - Smooth transitions when labels reposition
   - Fade-in for newly positioned elements

4. **Accessibility**
   - Screen reader support for diagram descriptions
   - Keyboard navigation for dimension labels

---

## Summary: The Five Golden Rules

1. **Height labels ALWAYS go on the LEFT, OUTSIDE the shape, in ORANGE**
   - Position: `x1={startX}` (leftmost edge)
   - Offset: `offset={20}` (positive = left)
   - Color: `color={konvaTheme.warning || '#F59E0B'}`

2. **Dimension lines ALWAYS break around text**
   - Automatic gap calculation in DimensionLabel
   - Creates professional technical drawing appearance

3. **Text ALWAYS rotates to match line angle**
   - Automatic rotation using Math.atan2
   - Horizontal, vertical, and diagonal lines all supported

4. **Arrows are LAST RESORT and VERY SHORT**
   - Prefer on-line or offset positioning
   - If arrow needed: 10px offset, 3x3 pointer, 0.75px stroke

5. **Less is MORE for area text**
   - Show dimensions (inputs), not areas (outputs)
   - Let students calculate, don't give answers visually

---

## Quick Start Template

Copy this template for new geometry levels:

```javascript
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';

function MyNewLevel({ visualData, onComplete, onNextProblem }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200);
  }, [windowWidth]);

  const canvasHeight = 400;
  const cellSize = 40;

  const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

  // Your shape logic here...

  return (
    <Container>
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Canvas background */}
            <Rect
              x={0} y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Grid */}
            <GridBackground
              width={canvasWidth}
              height={canvasHeight}
              gridSize={10}
              cellSize={cellSize}
              konvaTheme={konvaTheme}
            />

            {/* Your shape here */}

            {/* Dimension labels here */}
          </Layer>
        </Stage>
      </CanvasContainer>
    </Container>
  );
}

export default MyNewLevel;
```

---

**End of Guide**

For questions or improvements, refer to:
- `LESSON_STYLE_GUIDE.md` - Overall lesson design patterns
- `VISUAL_DESIGN_RULES.md` - Visual design principles
- `/geometry/utils/smartPositioning.js` - Core implementation

