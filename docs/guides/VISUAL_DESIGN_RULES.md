# Visual Design Rules for Geometry Lessons
## Critical Guidelines for Triangle and Angle Rendering

**Created:** February 7, 2026
**Updated:** February 13, 2026
**Purpose:** Document visual design standards to prevent common rendering mistakes

---

## 📘 Quick Reference

**For detailed implementation with examples, see:**
- **[DYNAMIC_ANGLE_INDICATOR_SOLUTION.md](./DYNAMIC_ANGLE_INDICATOR_SOLUTION.md)** - Complete guide with copy-paste template and production examples

**This document provides:**
- Visual rules and guidelines
- Quick implementation patterns
- Common mistakes to avoid

---

## Rule #1: Angle Indicators MUST Be Inside the Triangle

### ❌ INCORRECT: Angle Indicators Outside Triangle

When angle arcs or right angle indicators are positioned **outside** the triangle, they appear to show exterior angles rather than interior angles, which confuses students.

**Example of WRONG positioning:**
```
        53° (floating outside)
         🔵 (arc extends outward)
        /|
       / |
      /  |
     /   |
    /____|🔲 (square outside corner)
```

The angle arc extends **outward** from the vertex and the right angle square is **outside** the triangle corner.

### ✅ CORRECT: Angle Indicators Inside Triangle

All angle indicators (arcs, squares, labels) must be positioned **inside** the triangle to show **interior angles**.

**Example of CORRECT positioning:**
```
        /|
       / |53° (inside)
      /🔵 |
     / 🔲|
    /_____|
```

The angle arc is **inside** the triangle showing the interior angle, and the right angle square is **inside** the corner.

---

## Implementation Guide

### For Konva Canvas (react-konva)

#### Angle Arcs

**Problem:** Arc dynamically created and positioned at vertex but extends outward
**Solution:** Calculate arc rotation and size and angle **dynamically** based on actual triangle geometry

> **💡 For complete implementation details, examples, and copy-paste template:**
> See **[DYNAMIC_ANGLE_INDICATOR_SOLUTION.md](./DYNAMIC_ANGLE_INDICATOR_SOLUTION.md)**
>
> This pattern is **production-tested** in the InverseTrig lesson (7 different diagrams) ✅

```javascript
// ❌ WRONG - Hardcoded rotation for each orientation
let arcRotation = 0;
if (orientation === 'bottom-left') {
  arcRotation = 0;
} else if (orientation === 'bottom-right') {
  arcRotation = 180;
}
// ... doesn't work for all cases

// ✅ CORRECT - Dynamic calculation based on vertex and adjacent points
// Given: V = vertex, P1 and P2 = the two other triangle vertices

// Step 1 — Direction of each side from the vertex (degrees, canvas coords)
const theta1 = Math.atan2(P1.y - V.y, P1.x - V.x) * (180 / Math.PI);
const theta2 = Math.atan2(P2.y - V.y, P2.x - V.x) * (180 / Math.PI);

// Step 2 — Clockwise sweep from theta1 to theta2, normalized to [0, 360)
const sweepCW = ((theta2 - theta1) % 360 + 360) % 360;

// Step 3 — Pick the interior (smaller) angle and correct starting rotation
let angle, rotation;
if (sweepCW <= 180) {
  angle = sweepCW;
  rotation = theta1;
} else {
  angle = 360 - sweepCW;
  rotation = theta2;
}

// Step 4 — Length of the shortest side meeting at this vertex
const d1 = Math.sqrt((P1.x - V.x) ** 2 + (P1.y - V.y) ** 2);
const d2 = Math.sqrt((P2.x - V.x) ** 2 + (P2.y - V.y) ** 2);
const smallest_line = Math.min(d1, d2);

// Use smallest_line to scale the arc radius so it never exceeds the shorter side
const arcRadius = smallest_line * 0.15;

<Arc
  x={V.x}
  y={V.y}
  innerRadius={0}
  outerRadius={arcRadius}
  angle={angle}
  rotation={rotation}
  fill="rgba(100, 149, 237, 0.3)"
  stroke="cornflowerblue"
  strokeWidth={2}
/>
```

**Why it works:**
- `atan2` gives the direction of each side from the vertex in Konva's coordinate system (0° = right, 90° = down)
- The clockwise sweep between two angles has two possible values that sum to 360°
- The interior angle is always the smaller one (≤ 180°)
- `rotation` tells Konva where the arc starts, `angle` tells it how far to sweep clockwise — so the arc exactly fills the interior angle
- `smallest_line` ensures the arc radius scales proportionally and never extends past the shorter side

#### Right Angle Indicators (Small Squares)

**Problem:** Square positioned outside the corner
**Solution:** Calculate position **dynamically** using unit vectors along both sides

```javascript
// ❌ WRONG - Hardcoded offsets for each orientation
let offsetX = 0, offsetY = 0;
if (orientation === 'bottom-left') {
  offsetX = 0;
  offsetY = -squareSize;
}
// ... doesn't work reliably for all orientations

// ✅ CORRECT - Dynamic calculation using unit vectors
// Calculate unit vectors along the two sides forming the right angle

// Vector from right angle vertex toward acute angle vertex
const toAcuteX = x1 - x2;
const toAcuteY = y1 - y2;
const toAcuteLen = Math.sqrt(toAcuteX * toAcuteX + toAcuteY * toAcuteY);
const toAcuteUnitX = toAcuteX / toAcuteLen;
const toAcuteUnitY = toAcuteY / toAcuteLen;

// Vector from right angle vertex toward third vertex
const toThirdX = x3 - x2;
const toThirdY = y3 - y2;
const toThirdLen = Math.sqrt(toThirdX * toThirdX + toThirdY * toThirdY);
const toThirdUnitX = toThirdX / toThirdLen;
const toThirdUnitY = toThirdY / toThirdLen;

// Draw square using Lines (works for any orientation)
const corner2X = x2 + toAcuteUnitX * squareSize;
const corner2Y = y2 + toAcuteUnitY * squareSize;

const corner3X = x2 + toAcuteUnitX * squareSize + toThirdUnitX * squareSize;
const corner3Y = y2 + toAcuteUnitY * squareSize + toThirdUnitY * squareSize;

const corner4X = x2 + toThirdUnitX * squareSize;
const corner4Y = y2 + toThirdUnitY * squareSize;

<Line
  points={[corner2X, corner2Y, corner3X, corner3Y, corner4X, corner4Y]}
  stroke="#666"
  strokeWidth={2}
  closed={false}
/>
```

**Key insight:**
- Calculate unit vectors along both sides of the right angle
- Move from the right angle vertex along both sides by squareSize
- This creates a square that's **always inside** the triangle
- Works for **any** orientation without hardcoding
- Using Lines instead of Rect allows proper positioning regardless of triangle rotation

---

## Rule #2: Label Positioning and Rotation

### Hypotenuse/Diagonal Labels MUST Be Rotated Parallel to the Line

Labels for diagonal lines (hypotenuse, ladder, ramp, cable, etc.) must be **rotated** to align with the line they describe, just like in a textbook.

### All Labels MUST Be Outside the Triangle

The interior of the triangle is reserved for angle indicators (arcs, right angle squares). Side labels must be positioned **outside** the triangle using a perpendicular offset away from the opposite vertex.

### Leg Labels (Horizontal/Vertical) Stay Horizontal

Labels for horizontal or vertical sides remain horizontal text, positioned outside the triangle.

### Implementation Pattern

```javascript
// Given: start and end points of the diagonal line, and the third vertex (opposite)

// 1. Calculate rotation angle
const hypAngle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

// 2. Perpendicular offset vector (rotated 90° from line direction)
const dx = end.x - start.x;
const dy = end.y - start.y;
const len = Math.sqrt(dx * dx + dy * dy);
const perpX = -dy / len;
const perpY = dx / len;

// 3. Midpoint of the line
const midX = (start.x + end.x) / 2;
const midY = (start.y + end.y) / 2;

// 4. Flip direction so label is outside (away from third vertex)
const testDist = Math.sqrt((midX + perpX * 10 - vertex3.x) ** 2 + (midY + perpY * 10 - vertex3.y) ** 2);
const midDist = Math.sqrt((midX - vertex3.x) ** 2 + (midY - vertex3.y) ** 2);
const flip = testDist < midDist ? -1 : 1;

// 5. Render with rotation and perpendicular offset
<Text
  x={midX + flip * perpX * 22}
  y={midY + flip * perpY * 22}
  text="hypotenuse = 13"
  rotation={hypAngle}
  offsetX={50}   // ~half text width, for centering
  offsetY={8}
  fontSize={14}
  fontStyle="bold"
/>
```

**Why it works:**
- `atan2` gives the exact angle of the line in Konva's coordinate system
- The perpendicular vector is always 90° from the line direction
- The flip check ensures the label moves **away** from the opposite vertex (outside the triangle)
- `offsetX` centers the text horizontally along the rotated axis
- Works for **any** triangle orientation without hardcoding

### Common Mistakes

```javascript
// ❌ WRONG - Horizontal label on diagonal line
<Text x={midX - 40} y={midY - 20} text="hypotenuse = 13" />

// ❌ WRONG - Label inside the triangle
<Text x={midX} y={midY} text="hypotenuse = 13" rotation={angle} />

// ✅ CORRECT - Rotated + perpendicular offset outside triangle
<Text
  x={midX + flip * perpX * 22}
  y={midY + flip * perpY * 22}
  text="hypotenuse = 13"
  rotation={hypAngle}
  offsetX={50}
  offsetY={8}
/>
```

### Production Examples

- **TangentLesson.jsx** - Original reference implementation (lines 178, 344-356)
- **InverseTrig.jsx** - Level 2 hypotenuse, Level 3 ladder/ramp/cable labels
- **MoreTangentLesson.jsx** - Hypotenuse label with 8-orientation support
- **PythagoreanTheorem.js** - Standard triangle c label, ladder label

---

## Rule #3: Minimum Triangle Side Length

### Problem

When the backend sends values with extreme ratios (e.g., `opposite = 0.171, adjacent = 1.000`), the shorter side may render as only a few pixels, making the triangle nearly invisible or unreadable.

### Rule

Every drawn triangle side must be at least **80px** on the canvas after scaling.

The triangle is a **visual aid**, not a to-scale drawing. The labels show the exact numeric values from the backend — the diagram just needs to be clearly readable.

### Implementation Pattern

```javascript
// ❌ WRONG - No minimum, short sides become tiny
const scaledAdj = absAdj * scale;
const scaledOpp = absOpp * scale;
// With opposite = 0.171, scale = 70 → scaledOpp = ~12px (invisible!)

// ✅ CORRECT - Clamp each side to minimum 80px after scaling
const scaledAdj = Math.max(absAdj * scale, 80);
const scaledOpp = Math.max(absOpp * scale, 80);
// With opposite = 0.171, scale = 70 → scaledOpp = max(12, 80) = 80px (visible!)
```

### When This Applies

- **Level 2 right triangles** where one trig ratio is very small (e.g., `arctan(0.171)`)
- **Level 3 context diagrams** with very small angles (e.g., shallow ramps, slight descents)
- **Any triangle visualization** where backend values can have ratios > 5:1 between sides

### Key Points

- Labels always show the **exact backend values** regardless of drawn size
- The visual proportions may not match the actual ratio — this is acceptable
- Students need to **see** the triangle clearly; precise proportions are secondary
- The 80px minimum ensures readability on all screen sizes including iPad

---

## Rule #4: Theta Label Positioning

### Problem

Hardcoded offsets like `x={vertex.x + 15} y={vertex.y - 45}` don't adapt to angle size or triangle orientation. For small angles, the label may land outside the arc or overlap the triangle sides.

### Rule

Position the θ label along the **angle bisector** direction, computed from the arc parameters returned by `calcAngleArc`.

- **Angles ≥ 25°:** Place the label inside/near the arc along the bisector
- **Angles < 25°:** Move the label farther out along the bisector and draw a simple leader line back to the arc

### Implementation Pattern

```javascript
/**
 * Calculate θ label position along the angle bisector.
 * Uses arc parameters from calcAngleArc().
 * @param {{x:number,y:number}} vertex - Angle vertex
 * @param {number} arcRotation - Arc start angle in degrees (from calcAngleArc)
 * @param {number} arcAngle - Arc sweep in degrees (from calcAngleArc)
 * @param {number} arcRadius - Arc outer radius in pixels (from calcAngleArc)
 * @returns {{ x: number, y: number, needsLeaderLine: boolean, lineEnd?: {x,y} }}
 */
function calcAngleLabel(vertex, arcRotation, arcAngle, arcRadius) {
  const bisectorDeg = arcRotation + arcAngle / 2;
  const bisectorRad = bisectorDeg * (Math.PI / 180);

  if (arcAngle >= 25) {
    // Label fits inside/near the arc
    const dist = arcRadius + 18;
    return {
      x: vertex.x + Math.cos(bisectorRad) * dist,
      y: vertex.y + Math.sin(bisectorRad) * dist,
      needsLeaderLine: false,
    };
  } else {
    // Angle too narrow — place label farther out with leader line
    const labelDist = arcRadius + 55;
    const lineDist = arcRadius + 5;
    return {
      x: vertex.x + Math.cos(bisectorRad) * labelDist,
      y: vertex.y + Math.sin(bisectorRad) * labelDist,
      needsLeaderLine: true,
      lineEnd: {
        x: vertex.x + Math.cos(bisectorRad) * lineDist,
        y: vertex.y + Math.sin(bisectorRad) * lineDist,
      },
    };
  }
}
```

### Usage Pattern

```javascript
const arc = calcAngleArc(vertex, p1, p2);
const thetaPos = calcAngleLabel(vertex, arc.arcRotation, arc.arcAngle, arc.arcRadius);

// θ label — positioned along bisector
<Text x={thetaPos.x} y={thetaPos.y} text="θ = ?" fontSize={16}
      fill="#333" fontStyle="bold" offsetX={20} offsetY={8} />

// Leader line (only rendered when angle < 25°)
{thetaPos.needsLeaderLine && (
  <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]}
        stroke="#999" strokeWidth={1} />
)}
```

### Common Mistakes

```javascript
// ❌ WRONG - Hardcoded offset, doesn't adapt to angle or orientation
<Text x={vertex.x + 15} y={vertex.y - 45} text="θ = ?" />

// ✅ CORRECT - Bisector-based, adapts to any angle and orientation
const thetaPos = calcAngleLabel(vertex, arc.arcRotation, arc.arcAngle, arc.arcRadius);
<Text x={thetaPos.x} y={thetaPos.y} text="θ = ?" offsetX={20} offsetY={8} />
```

### Why It Works

- The **bisector** always points into the center of the angle, regardless of triangle orientation
- For large angles (≥ 25°), placing the label at `arcRadius + 18` keeps it just beyond the arc fill, visually inside the angle
- For small angles (< 25°), the label is pushed to `arcRadius + 55` along the same bisector direction, keeping it aligned with the arc
- The **leader line** connects the distant label back to the arc edge, making it clear which angle the label refers to
- Works for **any** vertex position and triangle orientation without hardcoding

---

## Rule #5: Hint Button Placement

### Rule

The "Need a hint?" button MUST be placed **at the same level as the question header** — either inline to the right of the header text, or in a shared header row. It must NOT float independently via absolute positioning or appear below the visualization.

### Why

- Students see the hint option immediately alongside the question, not buried below the diagram
- The header row is always visible without scrolling on iPad
- Keeps the hint contextually tied to the question it belongs to

### Implementation Pattern

```javascript
// ✅ CORRECT - Hint button in the same row as the question header
<HeaderRow>
  <QuestionText>{question?.[0]?.text || question}</QuestionText>
  {!showAnswer && !showHint && hint && (
    <TopHintButton onClick={() => setShowHint(true)}>
      Need a hint?
    </TopHintButton>
  )}
</HeaderRow>

// HeaderRow keeps question and hint button on the same line
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;
```

### Common Mistakes

```javascript
// ❌ WRONG - Absolute positioning, floats independently of the header
<Wrapper>  {/* position: relative */}
  <TopHintButton style={{ position: 'absolute', top: 20, right: 20 }}>
    Need a hint?
  </TopHintButton>
  <QuestionText>...</QuestionText>
  ...
</Wrapper>

// ❌ WRONG - Hint button below the visualization
<QuestionText>...</QuestionText>
<Stage>...</Stage>
<button>Need a hint?</button>  {/* Too far from the question */}

// ✅ CORRECT - Same row as the question header
<HeaderRow>
  <QuestionText>...</QuestionText>
  <TopHintButton>Need a hint?</TopHintButton>
</HeaderRow>
```

### Production Example

See **InverseTrig.jsx** — `TopHintButton` is placed in the header row alongside `QuestionText`.

---

## Common Mistakes and Fixes

### Mistake 1: Using Vertex Coordinates Directly

```javascript
// ❌ WRONG
<Rect x={rightAngleX} y={rightAngleY} width={20} height={20} />
```

This places the square's top-left at the vertex, causing it to extend outside.

**Fix:**
```javascript
// ✅ CORRECT
const squareSize = 20;
<Rect
  x={rightAngleX + rightAngleOffsetX}
  y={rightAngleY + rightAngleOffsetY}
  width={squareSize}
  height={squareSize}
/>
```

Calculate `rightAngleOffsetX` and `rightAngleOffsetY` based on which directions the triangle sides extend.

### Mistake 2: Not Accounting for Triangle Orientation

For different triangle orientations, the offsets must change:

- **Bottom-left orientation:** Square should be up and to the right → offset: `x+0, y-squareSize`
- **Bottom-right orientation:** Square should be up and to the left → offset: `x-squareSize, y-squareSize`
- **Top-right orientation:** Square should be down and to the left → offset: `x-squareSize, y+0`
- **And so on...**

### Mistake 3: Arc Rotation Not Calculated

```javascript
// ❌ WRONG - Arc might point outside
<Arc rotation={0} />

// ✅ CORRECT - Calculate rotation based on triangle sides
<Arc rotation={calculateInwardRotation(orientation, anglePosition)} />
```

---

## Testing Checklist

After implementing angle indicators, verify:

- [ ] Angle arc is **inside** the triangle (interior angle)
- [ ] Right angle square is **inside** the triangle corner
- [ ] Both indicators are fully visible (not cut off by canvas edges)
- [ ] Both indicators scale appropriately with triangle size
- [ ] Test ALL triangle orientations (8 for rotated triangles)
- [ ] Take screenshots and visually verify each orientation

---

## Visual Examples (Screenshots)

### ❌ WRONG - Indicators Outside Triangle
- Angle arc extends outward like an exterior angle
- Right angle square hangs outside the corner
- Students may confuse interior vs exterior angles

### ✅ CORRECT - Indicators Inside Triangle
- Angle arc curves inward showing interior angle
- Right angle square fits snugly inside the corner
- Clear visual representation of interior angles

---

## Rule #3: Dark Mode Color Strategy (Feb 2026)

### All geometry lessons MUST support dark mode

The platform now includes toggleable light/dark themes. **All Konva visualizations must use theme colors** instead of hardcoded values.

### ✅ CRITICAL: Konva Canvas Background

**EVERY Konva Stage MUST have a background Rect as the first element:**

```javascript
import { useKonvaTheme } from '../../../../hooks';
import { Stage, Layer, Rect } from 'react-konva';

function MyLesson() {
  const konvaTheme = useKonvaTheme();

  return (
    <Stage width={500} height={400}>
      <Layer>
        {/* CRITICAL: Background MUST be first element */}
        <Rect
          x={0}
          y={0}
          width={500}
          height={400}
          fill={konvaTheme.canvasBackground}
        />

        {/* All other elements... */}
      </Layer>
    </Stage>
  );
}
```

**Why this matters:**
- Without background, canvas stays white in dark mode
- Creates jarring visual experience
- Makes black elements invisible
- Background Rect must be **first element** in Layer for proper z-ordering

### Semantic Color Preservation in Dark Mode

Educational color meanings (red=opposite, blue=adjacent) are **preserved** in dark mode using brighter variants:

| Semantic Meaning | Light Mode | Dark Mode (Brighter) | Use Case |
|------------------|------------|----------------------|----------|
| **Opposite Side** | `#EF4444` (red) | `#ff6b6b` (brighter red) | Right triangle opposite side, heights |
| **Adjacent Side** | `#3B82F6` (blue) | `#5b9cff` (brighter blue) | Right triangle adjacent side, bases |
| **Hypotenuse** | `#8B5CF6` (purple) | `#b794f6` (brighter purple) | Right triangle hypotenuse |
| **Angles** | `#F59E0B` (amber) | `#ffa726` (brighter amber) | Angle arcs, angle labels |
| **Horizontal Lines** | `#10b981` (green) | `#4ade80` (brighter green) | Horizontal elements |
| **Vertical Lines** | `#ef4444` (red) | `#ff6b6b` (brighter red) | Vertical elements |

**Why brighter colors in dark mode?**
- Dark canvas background (`#2d2d2d`) requires higher contrast
- Pure colors (`#EF4444`) appear dull on dark backgrounds
- Brighter variants (`#ff6b6b`) maintain educational color association while ensuring visibility
- Students still learn "red = opposite" but with better readability

### Implementation Pattern

```javascript
import { useKonvaTheme } from '../../../../hooks';
import { Line, Circle, Text, Arc } from 'react-konva';

function TriangleDiagram({ opposite, adjacent, hypotenuse, angle }) {
  const konvaTheme = useKonvaTheme();

  return (
    <>
      {/* Opposite side - RED in both modes (brighter in dark) */}
      <Line
        points={[x1, y1, x2, y2]}
        stroke={konvaTheme.opposite}
        strokeWidth={3}
      />
      <Text
        x={labelX}
        y={labelY}
        text={`opposite = ${opposite}`}
        fill={konvaTheme.opposite}
      />

      {/* Adjacent side - BLUE in both modes (brighter in dark) */}
      <Line
        points={[x2, y2, x3, y3]}
        stroke={konvaTheme.adjacent}
        strokeWidth={3}
      />
      <Text
        text={`adjacent = ${adjacent}`}
        fill={konvaTheme.adjacent}
      />

      {/* Hypotenuse - PURPLE in both modes */}
      <Line
        points={[x1, y1, x3, y3]}
        stroke={konvaTheme.hypotenuse}
        strokeWidth={3}
      />

      {/* Angle arc - AMBER in both modes */}
      <Arc
        x={x1}
        y={y1}
        innerRadius={0}
        outerRadius={30}
        angle={angle}
        fill={konvaTheme.angle}
        opacity={0.3}
      />

      {/* Generic elements - adapt to theme */}
      <Line
        stroke={konvaTheme.shapeStroke}  // Black in light, light gray in dark
        strokeWidth={2}
      />
      <Text
        fill={konvaTheme.labelText}  // Black in light, light gray in dark
      />
    </>
  );
}
```

### Generic vs Semantic Colors

**Use semantic colors** (opposite, adjacent, hypotenuse, angle) when color has **educational meaning**:
- Color identifies which side/angle in geometry problem
- Students learn "red side = opposite"
- Color-coded diagrams in lessons

**Use generic colors** (shapeStroke, labelText) when color has **no educational meaning**:
- Grid lines (use `gridRegular`, `gridOrigin`)
- Shape outlines (use `shapeStroke`)
- Generic labels (use `labelText`)
- Background elements

### Grid Lines in Dark Mode

Grid lines require special attention for visibility:

```javascript
// Grid regular lines - brighter blue in dark mode
<Line
  stroke={konvaTheme.gridRegular}  // #0000ff light, #5b9cff dark
  strokeWidth={2}
/>

// Origin axes - brighter red in dark mode
<Line
  stroke={konvaTheme.gridOrigin}  // #ff0000 light, #ff6b6b dark
  strokeWidth={4}
/>
```

**Why not use black for grids in dark mode?**
- Black grid on `#2d2d2d` canvas has very low contrast
- Blue grids (`#5b9cff`) maintain textbook convention while being visible
- Red origin axes still stand out from regular grid

### Common Dark Mode Mistakes

#### ❌ WRONG: Hardcoded Colors

```javascript
// These will NOT adapt to dark mode
<Line stroke="black" />              // Invisible in dark mode
<Line stroke="#EF4444" />            // Too dark in dark mode
<Text fill="black" />                // Invisible in dark mode
<Circle fill="red" stroke="blue" /> // Wrong shades
```

#### ✅ CORRECT: Theme Colors

```javascript
// These adapt automatically
<Line stroke={konvaTheme.shapeStroke} />
<Line stroke={konvaTheme.opposite} />
<Text fill={konvaTheme.labelText} />
<Circle fill={konvaTheme.opposite} stroke={konvaTheme.shapeStroke} />
```

#### ❌ WRONG: Missing Background

```javascript
<Stage width={500} height={400}>
  <Layer>
    {/* No background = white canvas in dark mode */}
    <Line stroke={konvaTheme.shapeStroke} />
  </Layer>
</Stage>
```

#### ✅ CORRECT: Background Rect First

```javascript
<Stage width={500} height={400}>
  <Layer>
    <Rect width={500} height={400} fill={konvaTheme.canvasBackground} />
    <Line stroke={konvaTheme.shapeStroke} />
  </Layer>
</Stage>
```

### Testing Checklist for Dark Mode

For every Konva lesson, test the following in **BOTH** light and dark modes:

**Visual Verification:**
- [ ] Canvas background changes (not stuck white)
- [ ] All lines visible (not black on dark)
- [ ] All text readable (sufficient contrast)
- [ ] Semantic colors preserved (red still looks red, blue still looks blue)
- [ ] Grid lines visible in both modes
- [ ] Angle arcs visible and correctly colored
- [ ] No harsh color clashes

**Functional Verification:**
- [ ] Theme toggle works (lesson header has toggle button)
- [ ] Theme persists after page refresh
- [ ] No console errors when toggling
- [ ] All shapes render correctly in both modes

### Implementation Resources

- **Theme Hook:** `src/hooks/useKonvaTheme.js`
- **Theme Definition:** `src/theme/theme.js`
- **Example Lessons:**
  - `src/features/lessons/lessonTypes/geometry/InverseTrig.jsx` - Multiple triangle diagrams
  - `src/features/lessons/lessonTypes/angles/AngleRelationshipsDiagram.js` - Angle lessons
  - `src/features/lessons/lessonTypes/graphing/PlottingPoints.js` - Grid + canvas

### Quick Reference: Available Konva Theme Colors

```javascript
konvaTheme.canvasBackground   // Canvas background (#ffffff / #2d2d2d)
konvaTheme.shapeStroke       // Generic outlines (#000000 / #e2e8f0)
konvaTheme.labelText         // Generic text (#000000 / #e2e8f0)
konvaTheme.shapeFill         // Generic fills (#e5e7eb / #404040)

// Grid
konvaTheme.gridRegular       // Grid lines (#0000ff / #5b9cff)
konvaTheme.gridDark          // Darker grid lines (#000080 / #4a7acc)
konvaTheme.gridOrigin        // Origin axes (#ff0000 / #ff6b6b)

// Semantic (geometry)
konvaTheme.opposite          // Red - opposite side (#EF4444 / #ff6b6b)
konvaTheme.adjacent          // Blue - adjacent side (#3B82F6 / #5b9cff)
konvaTheme.hypotenuse        // Purple - hypotenuse (#8B5CF6 / #b794f6)
konvaTheme.angle             // Amber - angles (#F59E0B / #ffa726)
konvaTheme.horizontal        // Green - horizontal (#10b981 / #4ade80)
konvaTheme.vertical          // Red - vertical (#ef4444 / #ff6b6b)
konvaTheme.slope             // Purple - slope (#8B5CF6 / #b794f6)

// Points and markers
konvaTheme.point             // Points on graphs (#ef4444 / #ff6b6b)
konvaTheme.pointHighlight    // Highlighted points (#00BF63 / #00e676)
konvaTheme.shapeHighlight    // Highlighted shapes (#00BF63 / #00e676)
```

---

## Related Files

- **Solution Guide:** `DYNAMIC_ANGLE_INDICATOR_SOLUTION.md` - Complete implementation guide
- **Production Examples:** `/src/features/lessons/lessonTypes/geometry/InverseTrig.jsx` (7 diagrams)
- **Also applies to:** `MoreTangentLesson.jsx`, `TangentLesson.jsx`, `TriangleSum.js`, `PythagoreanTheorem.js`
- **Testing protocol:** `LESSON_TESTING_PROTOCOL.md` (Phase 2, Visual Verification)

---

## Learned From

**Date:** February 7, 2026
**Issue:** More Tangent lesson - angle indicators positioned outside triangle
**Reported by:** User during visual review
**Fixed in:** MoreTangentLesson.jsx

---

## Summary

**Golden Rule:** All angle indicators (arcs, squares, labels) MUST be positioned **INSIDE** the triangle to accurately represent **interior angles**.

This is not just a visual preference - it's mathematically correct. Interior angles are measured **inside** the polygon, not outside.
