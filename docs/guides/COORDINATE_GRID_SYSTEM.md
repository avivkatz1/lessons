# Coordinate Grid System Guide

**Version:** 1.0
**Last Updated:** February 2026
**Status:** Active

This guide documents the coordinate grid system implementation for geometry lessons, particularly for plotting and reflection problems like SymmetryLesson Level 4.

---

## Table of Contents

1. [Overview](#overview)
2. [Coordinate Systems](#coordinate-systems)
3. [Grid Sizes and Reflection Formulas](#grid-sizes-and-reflection-formulas)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [User Input and Validation](#user-input-and-validation)
7. [Rendering Points on Grid](#rendering-points-on-grid)
8. [Common Pitfalls](#common-pitfalls)
9. [Complete Example](#complete-example)

---

## Overview

### When to Use This Pattern

Use the coordinate grid system when:
- Students need to enter specific (x, y) coordinates
- Problems involve reflections, translations, rotations in a coordinate plane
- You need to validate precise point positions
- Mathematical coordinate systems (origin at center) are more intuitive than grid indices

### Key Components

1. **Grid Coordinate System** - (0, 0) at top-left, used for Konva rendering
2. **Mathematical Coordinate System** - (0, 0) at center, used for student input
3. **Transformation Functions** - Convert between the two systems
4. **InputOverlayPanel + SlimMathKeypad** - UI for coordinate entry
5. **Submit/Retry Logic** - Allow students to correct wrong answers

---

## Coordinate Systems

### Grid Coordinates (Backend/Rendering)

```
Grid Coordinates (11×11 grid)
(0,0) at top-left

  0  1  2  3  4  5  6  7  8  9  10  → col (x in grid)
0 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
1 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
2 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
3 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
4 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
5 ·  ·  ·  ·  ·  O  ·  ·  ·  ·  ·  ← Origin in math coords
6 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
7 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
8 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
9 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
10·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
↓
row (y in grid)
```

### Mathematical Coordinates (User Input)

```
Mathematical Coordinates (11×11 grid)
(0,0) at center

      -5 -4 -3 -2 -1  0  1  2  3  4  5  → x (mathematical)
   5  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
   4  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
   3  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
   2  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
   1  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
   0  ·  ·  ·  ·  ·  O  ·  ·  ·  ·  ·  ← Origin (0,0)
  -1  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  -2  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  -3  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  -4  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  -5  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
   ↑
   y (mathematical)
```

### Transformation Functions

**Frontend (SymmetryLesson.jsx):**

```javascript
/**
 * Convert mathematical coordinates to grid coordinates
 * Math coords: origin at center, x∈[-5,5], y∈[-5,5]
 * Grid coords: origin at top-left, col∈[0,10], row∈[0,10]
 */
function mathToGrid(mathX, mathY) {
  return {
    gridCol: mathX + 5,      // x=-5 → col=0, x=5 → col=10
    gridRow: 5 - mathY       // y=5 → row=0, y=-5 → row=10
  };
}

/**
 * Convert grid coordinates to mathematical coordinates
 */
function gridToMath(gridCol, gridRow) {
  return {
    mathX: gridCol - 5,      // col=0 → x=-5, col=10 → x=5
    mathY: 5 - gridRow       // row=0 → y=5, row=10 → y=-5
  };
}
```

**Example Conversions:**

| Math Coords | Grid Coords | Description |
|-------------|-------------|-------------|
| (-5, 5) | (0, 0) | Top-left corner |
| (0, 0) | (5, 5) | Center/origin |
| (5, -5) | (10, 10) | Bottom-right corner |
| (2, -2) | (7, 7) | Example point |
| (-3, 4) | (2, 1) | Example point |

---

## Grid Sizes and Reflection Formulas

### 10×10 Grid (Levels 1-3, 5)

**Grid:** Columns/Rows 0-9
**Line Position:** linePos = 5 (line is *between* cells 4 and 5)
**Reflection Formula:**
```javascript
// Vertical reflection (across vertical line between col 4 and 5)
reflectedCol = 2 * linePos - 1 - originalCol
reflectedCol = 2 * 5 - 1 - originalCol
reflectedCol = 9 - originalCol

// Horizontal reflection (across horizontal line between row 4 and 5)
reflectedRow = 2 * linePos - 1 - originalRow
reflectedRow = 9 - originalRow
```

**Why `-1`?** The line is *between* cells, not *on* a cell.

### 11×11 Grid (Level 4)

**Grid:** Columns/Rows 0-10
**Line Position:** linePos = 5 (line is *on* cell 5)
**Reflection Formula:**
```javascript
// Vertical reflection (across vertical line at col 5)
reflectedCol = 2 * linePos - originalCol
reflectedCol = 2 * 5 - originalCol
reflectedCol = 10 - originalCol

// Horizontal reflection (across horizontal line at row 5)
reflectedRow = 2 * linePos - originalRow
reflectedRow = 10 - originalRow
```

**Why no `-1`?** The line is *on* a cell, so we reflect directly across it.

**CRITICAL:** The `-1` in the formula depends on grid size. Always check:
- 10×10 grid → Use `2 * linePos - 1 - coord`
- 11×11 grid → Use `2 * linePos - coord`

---

## Backend Implementation

### Generate Points in Safe Zones

**Problem:** Points at grid edges reflect to opposite edges, which may be out of bounds or visually confusing.

**Solution:** Generate points in "safe zones" that ensure reflections stay well within bounds.

**Example (symmetryGenerator.js - Level 4):**

```javascript
function generateLevel4() {
  const gridSize = 11;
  const axis = Math.random() < 0.5 ? "vertical" : "horizontal";
  const linePos = 5; // Center of 11×11 grid
  const pointCount = 3;
  const labels = ["A", "B", "C"];

  const labeledPoints = [];
  const usedKeys = new Set();

  for (let i = 0; i < pointCount; i++) {
    let r, c, k;
    let attempts = 0;

    do {
      if (axis === "vertical") {
        // Safe zones for vertical reflection
        r = rand(1, gridSize - 2);     // 1-9 (avoid edges 0 and 10)
        c = rand(1, linePos - 2);      // 1-3 (left side, reflects to 7-9)
      } else {
        // Safe zones for horizontal reflection
        r = rand(1, linePos - 2);      // 1-3 (top side, reflects to 7-9)
        c = rand(1, gridSize - 2);     // 1-9 (avoid edges 0 and 10)
      }

      k = `${r},${c}`;
      attempts++;
    } while (usedKeys.has(k) && attempts < 50);

    usedKeys.add(k);
    labeledPoints.push({ label: labels[i], row: r, col: c });
  }

  // Compute reflected points using 11×11 formula (no -1)
  const reflectedPoints = labeledPoints.map((pt) => {
    let rr, rc;
    if (axis === "vertical") {
      rr = pt.row;
      rc = 2 * linePos - pt.col;  // 10 - pt.col
    } else {
      rr = 2 * linePos - pt.row;  // 10 - pt.row
      rc = pt.col;
    }

    return { label: `${pt.label}'`, row: rr, col: rc };
  });

  return {
    question: [{ text: `Reflect the points across the ${axis === "vertical" ? "y-axis" : "x-axis"}...` }],
    visualData: {
      level: 4,
      gridSize,
      axis,
      linePosition: linePos,
      originalCells: [],
      reflectedCells: [],
      labeledPoints,      // Original points (A, B, C) in grid coords
      reflectedPoints,    // Expected reflected points (A', B', C') in grid coords
    },
    // ... other fields
  };
}
```

### Safe Zone Verification

**For vertical reflection (left → right):**
- Original points: col ∈ [1, 3]
- Reflected points: col = 10 - [1,3] = [9, 7] ✓ (all in bounds)

**For horizontal reflection (top → bottom):**
- Original points: row ∈ [1, 3]
- Reflected points: row = 10 - [1,3] = [9, 7] ✓ (all in bounds)

---

## Frontend Implementation

### State Structure

```javascript
const [coordinates, setCoordinates] = useState({
  "A": { value: '', submitted: false, isCorrect: false },
  "B": { value: '', submitted: false, isCorrect: false },
  "C": { value: '', submitted: false, isCorrect: false },
});
const [focusedPoint, setFocusedPoint] = useState("A");
```

**IMPORTANT:** Use `value` for the raw input string, NOT `x` and `y` separately. This allows flexible parsing of formats like:
- `"2,-2"`
- `"(2,-2)"`
- `"( 2, -2 )"`

### Parse User Input

```javascript
function parseCoordinate(value) {
  if (!value || typeof value !== 'string') {
    return { x: null, y: null, valid: false, error: 'Please enter a coordinate' };
  }

  // Remove spaces and parentheses for flexible parsing
  const cleaned = value.replace(/\s/g, '').replace(/[()]/g, '');

  // Match pattern: number,number (with optional negatives)
  const match = cleaned.match(/^(-?\d+),(-?\d+)$/);

  if (!match) {
    return {
      x: null,
      y: null,
      valid: false,
      error: 'Invalid format. Use: x,y'
    };
  }

  const x = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);

  // Validate MATHEMATICAL coordinate bounds (11×11 grid)
  if (x < -5 || x > 5) {
    return { x, y, valid: false, error: 'x out of bounds. Valid range: -5 to 5' };
  }

  if (y < -5 || y > 5) {
    return { x, y, valid: false, error: 'y out of bounds. Valid range: -5 to 5' };
  }

  return { x, y, valid: true };
}
```

### Handle Input Changes

```javascript
const handleKeypadChange = useCallback((value) => {
  // Reset submitted flag to allow re-submission if user edits
  setCoordinates(prev => ({
    ...prev,
    [focusedPoint]: {
      ...prev[focusedPoint],
      value,
      error: '',
      submitted: false,
      isCorrect: false,
    }
  }));
}, [focusedPoint]);
```

**Why reset `submitted`?** When the user edits a coordinate, clear the previous submission state so they can submit again (allows retries).

### Validate and Submit

```javascript
const handleSubmitCoordinate = useCallback((point) => {
  const coord = coordinates[point];
  const parsed = parseCoordinate(coord.value);

  if (!parsed.valid) {
    setCoordinates(prev => ({
      ...prev,
      [point]: { ...prev[point], error: parsed.error }
    }));
    return;
  }

  // Transform MATHEMATICAL coordinates to GRID coordinates for comparison
  // User enters math coords [-5,5], backend stores grid coords [0,10]
  const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);

  // CRITICAL: Add prime mark to label when searching
  // Backend stores "A'", "B'", "C'" but we're checking point "A", "B", "C"
  const expected = reflectedPoints?.find(p => p.label === `${point}'`);
  const isCorrectCoord = expected && expected.col === gridCol && expected.row === gridRow;

  setCoordinates(prev => ({
    ...prev,
    [point]: {
      ...prev[point],
      submitted: true,
      isCorrect: isCorrectCoord,
      error: '',
    }
  }));

  // Auto-advance to next empty input
  const nextPoint = ["A", "B", "C"].find(
    p => p !== point && !coordinates[p].submitted
  );
  if (nextPoint) {
    setFocusedPoint(nextPoint);
  }
}, [coordinates, reflectedPoints]);
```

**Key Points:**
1. Parse user input (mathematical coordinates)
2. Transform to grid coordinates using `mathToGrid()`
3. **Add prime mark** to label: `${point}'` not `${point}`
4. Compare with backend's expected grid coordinates
5. Auto-advance to next point (good UX)

---

## User Input and Validation

### Input UI with SlimMathKeypad

```jsx
<InputOverlayPanel
  visible={panelOpen}
  onClose={closePanel}
  title="Enter Reflected Points"
>
  {/* Coordinate Inputs */}
  {["A", "B", "C"].map(point => (
    <CoordinateInputSection key={point}>
      <CoordinateLabel>
        Point {point}':
        {coordinates[point].submitted && (
          <FeedbackIcon $isCorrect={coordinates[point].isCorrect}>
            {coordinates[point].isCorrect ? ' ✓' : ' ✗'}
          </FeedbackIcon>
        )}
      </CoordinateLabel>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <CoordinateDisplay
          $focused={focusedPoint === point}
          $hasValue={coordinates[point].value}
          onClick={() => setFocusedPoint(point)}
          style={{ flex: 1 }}
        >
          {formatCoordinateDisplay(coordinates[point].value)}
        </CoordinateDisplay>

        <button
          onClick={() => handleSubmitCoordinate(point)}
          disabled={!coordinates[point].value || (coordinates[point].submitted && coordinates[point].isCorrect)}
          style={{
            padding: '12px 20px',
            backgroundColor: coordinates[point].submitted && coordinates[point].isCorrect
              ? '#10B981'  // Green when correct
              : coordinates[point].submitted && !coordinates[point].isCorrect
                ? '#EF4444'  // Red when incorrect
                : '#3B82F6',  // Blue when not submitted
            color: 'white',
            borderRadius: '8px',
            minWidth: '80px',
          }}
        >
          {coordinates[point].submitted && coordinates[point].isCorrect
            ? '✓ Done'
            : coordinates[point].submitted && !coordinates[point].isCorrect
              ? 'Retry'
              : 'Submit'}
        </button>
      </div>

      {coordinates[point].error && (
        <ErrorText>{coordinates[point].error}</ErrorText>
      )}
    </CoordinateInputSection>
  ))}

  {/* Shared Keypad */}
  <SlimMathKeypad
    value={coordinates[focusedPoint].value}
    onChange={handleKeypadChange}
    extraButtons={["(", ",", ")"]}
  />
</InputOverlayPanel>
```

### Submit Button States

| State | Button Text | Color | Disabled | Behavior |
|-------|-------------|-------|----------|----------|
| Not submitted | "Submit" | Blue | No | Validates and submits |
| Submitted + Correct | "✓ Done" | Green | Yes | Cannot resubmit |
| Submitted + Incorrect | "Retry" | Red | No | Can edit and retry |
| No value | "Submit" | Blue (faded) | Yes | Need to enter value first |

**CRITICAL:** Allow retries when incorrect by checking:
```javascript
disabled={!coordinates[point].value || (coordinates[point].submitted && coordinates[point].isCorrect)}
```

NOT:
```javascript
disabled={!coordinates[point].value || coordinates[point].submitted}  // ❌ WRONG
```

---

## Rendering Points on Grid

### User-Entered Points (Live Feedback)

```javascript
const userEnteredPoints = useMemo(() => {
  if (!isPlottingLevel) return [];
  const points = [];

  Object.entries(coordinates).forEach(([label, coord]) => {
    const parsed = parseCoordinate(coord.value);
    if (parsed.valid) {
      // Transform MATHEMATICAL coordinates to GRID coordinates for rendering
      const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);

      points.push({
        label: `${label}'`,
        x: gridCol,          // Grid column for Konva (0-10)
        y: gridRow,          // Grid row for Konva (0-10)
        isCorrect: coord.isCorrect,
        submitted: coord.submitted,
      });
    }
  });

  return points;
}, [coordinates, isPlottingLevel]);
```

### Konva Rendering

```jsx
{/* User-entered points (live validation feedback) */}
{isPlottingLevel && userEnteredPoints.map((pt) => {
  // Color based on submission status
  const pointColor = !pt.submitted
    ? '#3B82F6'  // Blue for not-yet-submitted (preview)
    : pt.isCorrect
      ? '#10B981'  // Green for correct
      : '#EF4444';  // Red for incorrect

  return (
    <React.Fragment key={`user-${pt.label}`}>
      <Circle
        x={pt.x * cellSize}       // Grid col → pixel X
        y={pt.y * cellSize}       // Grid row → pixel Y
        radius={cellSize * 0.3}
        fill={pointColor}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      <Text
        x={pt.x * cellSize + cellSize * 0.35}
        y={pt.y * cellSize - cellSize * 0.5}
        text={pt.label}
        fontSize={Math.max(12, cellSize * 0.35)}
        fontStyle="bold"
        fill={pointColor}
      />
    </React.Fragment>
  );
})}
```

**Rendering Logic:**
1. Points render immediately when valid (blue preview)
2. Turn green when submitted and correct
3. Turn red when submitted and incorrect
4. Disappear when user edits (submitted flag reset)
5. Re-render when user resubmits

---

## Common Pitfalls

### 1. Grid Size vs Reflection Formula Mismatch

**Problem:**
```javascript
const gridSize = 11;
const linePos = 5;
rc = 2 * linePos - 1 - pt.col;  // ❌ WRONG for 11×11
```

**Solution:**
```javascript
const gridSize = 11;
const linePos = 5;
rc = 2 * linePos - pt.col;      // ✓ CORRECT for 11×11
```

**Rule:**
- 10×10 grid → Use `-1`
- 11×11 grid → No `-1`

---

### 2. Missing Prime Mark in Label Search

**Problem:**
```javascript
const expected = reflectedPoints?.find(p => p.label === point);  // ❌ WRONG
// Searching for "A" but backend has "A'"
```

**Solution:**
```javascript
const expected = reflectedPoints?.find(p => p.label === `${point}'`);  // ✓ CORRECT
```

---

### 3. State Structure Inconsistency

**Problem:**
```javascript
// Initial state
const [coordinates, setCoordinates] = useState({
  "A": { value: '', submitted: false, isCorrect: false },
});

// Reset in useEffect
setCoordinates({
  "A": { x: '', y: '', submitted: false, isCorrect: false },  // ❌ WRONG structure
});
```

**Solution:** Always use `value`, never `x` and `y` separately:
```javascript
setCoordinates({
  "A": { value: '', submitted: false, isCorrect: false },  // ✓ CORRECT
});
```

---

### 4. Button Disabled After Wrong Answer

**Problem:**
```javascript
disabled={coordinates[point].submitted}  // ❌ WRONG
// Can't retry after wrong answer
```

**Solution:**
```javascript
disabled={coordinates[point].submitted && coordinates[point].isCorrect}  // ✓ CORRECT
// Only disable when correct, allow retry when incorrect
```

---

### 5. Not Resetting Submitted Flag on Edit

**Problem:**
```javascript
const handleKeypadChange = (value) => {
  setCoordinates(prev => ({
    ...prev,
    [focusedPoint]: { ...prev[focusedPoint], value }  // ❌ Keeps old submitted state
  }));
};
```

**Solution:**
```javascript
const handleKeypadChange = (value) => {
  setCoordinates(prev => ({
    ...prev,
    [focusedPoint]: {
      ...prev[focusedPoint],
      value,
      submitted: false,  // ✓ Reset on edit
      isCorrect: false,
    }
  }));
};
```

---

### 6. Forgetting to Transform Coordinates

**Problem:**
```javascript
// User enters (2, -2) in math coords
const expected = reflectedPoints?.find(p => p.label === `${point}'`);
const isCorrectCoord = expected && expected.col === parsed.x && expected.row === parsed.y;  // ❌ WRONG
// Comparing math coords with grid coords!
```

**Solution:**
```javascript
const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);
const expected = reflectedPoints?.find(p => p.label === `${point}'`);
const isCorrectCoord = expected && expected.col === gridCol && expected.row === gridRow;  // ✓ CORRECT
```

---

## Complete Example

### Backend (symmetryGenerator.js - Level 4)

```javascript
function generateLevel4() {
  const gridSize = 11;
  const axis = Math.random() < 0.5 ? "vertical" : "horizontal";
  const linePos = 5;
  const pointCount = 3;
  const labels = ["A", "B", "C"];
  const usedKeys = new Set();
  const labeledPoints = [];

  // Generate original points in safe zones
  for (let i = 0; i < pointCount; i++) {
    let r, c, k, attempts = 0;
    do {
      if (axis === "vertical") {
        r = rand(1, gridSize - 2);  // 1-9
        c = rand(1, linePos - 2);   // 1-3 (left side)
      } else {
        r = rand(1, linePos - 2);   // 1-3 (top side)
        c = rand(1, gridSize - 2);  // 1-9
      }
      k = `${r},${c}`;
      attempts++;
    } while (usedKeys.has(k) && attempts < 50);

    usedKeys.add(k);
    labeledPoints.push({ label: labels[i], row: r, col: c });
  }

  // Compute reflected points (11×11 formula, no -1)
  const reflectedPoints = labeledPoints.map((pt) => {
    let rr, rc;
    if (axis === "vertical") {
      rr = pt.row;
      rc = 2 * linePos - pt.col;
    } else {
      rr = 2 * linePos - pt.row;
      rc = pt.col;
    }
    return { label: `${pt.label}'`, row: rr, col: rc };
  });

  return {
    question: [{ text: `Reflect the points across the ${axis === "vertical" ? "y-axis" : "x-axis"}...` }],
    answer: ["See visualData"],
    acceptedAnswers: ["See visualData"],
    hint: `For ${axis} reflection, the ${axis === "vertical" ? "x" : "y"}-coordinate changes sign...`,
    explanation: `Each point reflects across the ${axis === "vertical" ? "y" : "x"}-axis...`,
    visualData: {
      level: 4,
      gridSize: 11,
      axis,
      linePosition: linePos,
      originalCells: [],
      reflectedCells: [],
      labeledPoints,      // Original points in grid coords
      reflectedPoints,    // Reflected points in grid coords
    },
    numbersReturned: [gridSize, linePos, pointCount],
    problemTypeReturned: "symmetry_plotting",
    wordProblemReturned: "symmetry",
  };
}
```

### Frontend (SymmetryLesson.jsx - Level 4)

```javascript
// 1. Transformation functions
function mathToGrid(mathX, mathY) {
  return {
    gridCol: mathX + 5,
    gridRow: 5 - mathY
  };
}

// 2. Parse function
function parseCoordinate(value) {
  if (!value) return { valid: false, error: 'Please enter a coordinate' };
  const cleaned = value.replace(/\s/g, '').replace(/[()]/g, '');
  const match = cleaned.match(/^(-?\d+),(-?\d+)$/);
  if (!match) return { valid: false, error: 'Invalid format. Use: x,y' };

  const x = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);

  if (x < -5 || x > 5) return { x, y, valid: false, error: 'x out of bounds [-5, 5]' };
  if (y < -5 || y > 5) return { x, y, valid: false, error: 'y out of bounds [-5, 5]' };

  return { x, y, valid: true };
}

// 3. State
const [coordinates, setCoordinates] = useState({
  "A": { value: '', submitted: false, isCorrect: false },
  "B": { value: '', submitted: false, isCorrect: false },
  "C": { value: '', submitted: false, isCorrect: false },
});
const [focusedPoint, setFocusedPoint] = useState("A");

// 4. Input handler
const handleKeypadChange = useCallback((value) => {
  setCoordinates(prev => ({
    ...prev,
    [focusedPoint]: {
      ...prev[focusedPoint],
      value,
      error: '',
      submitted: false,
      isCorrect: false,
    }
  }));
}, [focusedPoint]);

// 5. Submit handler
const handleSubmitCoordinate = useCallback((point) => {
  const coord = coordinates[point];
  const parsed = parseCoordinate(coord.value);

  if (!parsed.valid) {
    setCoordinates(prev => ({
      ...prev,
      [point]: { ...prev[point], error: parsed.error }
    }));
    return;
  }

  const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);
  const expected = reflectedPoints?.find(p => p.label === `${point}'`);
  const isCorrectCoord = expected && expected.col === gridCol && expected.row === gridRow;

  setCoordinates(prev => ({
    ...prev,
    [point]: {
      ...prev[point],
      submitted: true,
      isCorrect: isCorrectCoord,
      error: '',
    }
  }));
}, [coordinates, reflectedPoints]);

// 6. Render points
const userEnteredPoints = useMemo(() => {
  const points = [];
  Object.entries(coordinates).forEach(([label, coord]) => {
    const parsed = parseCoordinate(coord.value);
    if (parsed.valid) {
      const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);
      points.push({
        label: `${label}'`,
        x: gridCol,
        y: gridRow,
        isCorrect: coord.isCorrect,
        submitted: coord.submitted,
      });
    }
  });
  return points;
}, [coordinates]);
```

---

## Summary Checklist

When implementing coordinate grid systems:

**Backend:**
- [ ] Choose correct grid size (10×10 or 11×11)
- [ ] Use correct reflection formula based on grid size
- [ ] Generate points in safe zones (avoid edges)
- [ ] Return `labeledPoints` (original) and `reflectedPoints` (expected) in grid coords
- [ ] Add prime marks to reflected point labels ("A'", not "A")

**Frontend:**
- [ ] Implement `mathToGrid()` and `gridToMath()` transformation functions
- [ ] Use `{value: '', submitted: false, isCorrect: false}` state structure
- [ ] Parse flexible input formats: "2,-2", "(2,-2)", "( 2, -2 )"
- [ ] Validate mathematical coordinate bounds (e.g., [-5, 5])
- [ ] Transform math coords → grid coords before validation
- [ ] Add prime mark when searching: `find(p => p.label === \`${point}'\`)`
- [ ] Reset `submitted` flag when user edits input
- [ ] Allow retries: `disabled={submitted && isCorrect}` not `disabled={submitted}`
- [ ] Render points with color coding: blue (preview), green (correct), red (incorrect)

**Testing:**
- [ ] Verify transformations: (-5,5)→(0,0), (0,0)→(5,5), (5,-5)→(10,10)
- [ ] Test edge cases: boundary values, negative numbers, invalid formats
- [ ] Confirm retry flow: wrong answer → edit → resubmit → correct
- [ ] Check visual alignment: rendered points match entered coordinates

---

**Last Updated:** February 2026
**Maintained By:** Claude Code Development Team
**Related Guides:** INPUT_OVERLAY_PANEL_SYSTEM.md, LESSON_STYLE_GUIDE.md
