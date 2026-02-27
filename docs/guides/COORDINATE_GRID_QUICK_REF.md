# Coordinate Grid Quick Reference Card

**For full documentation, see:** [COORDINATE_GRID_SYSTEM.md](./COORDINATE_GRID_SYSTEM.md)

---

## Grid Size vs Reflection Formula

| Grid Size | Line Position | Reflection Formula | Why? |
|-----------|--------------|-------------------|------|
| **10×10** (Levels 1-3, 5) | linePos = 5 | `rc = 2*linePos - 1 - col` | Line is *between* cells |
| **11×11** (Level 4) | linePos = 5 | `rc = 2*linePos - col` | Line is *on* a cell |

**CRITICAL:** Wrong formula = off-by-one errors!

---

## Transformation Functions

```javascript
// Mathematical coords [-5,5] → Grid coords [0,10]
function mathToGrid(mathX, mathY) {
  return {
    gridCol: mathX + 5,
    gridRow: 5 - mathY
  };
}

// Grid coords [0,10] → Mathematical coords [-5,5]
function gridToMath(gridCol, gridRow) {
  return {
    mathX: gridCol - 5,
    mathY: 5 - gridRow
  };
}
```

---

## State Structure (ALWAYS use `value`)

```javascript
// ✓ CORRECT
const [coordinates, setCoordinates] = useState({
  "A": { value: '', submitted: false, isCorrect: false },
  "B": { value: '', submitted: false, isCorrect: false },
});

// ❌ WRONG
const [coordinates, setCoordinates] = useState({
  "A": { x: '', y: '', submitted: false },  // Don't use x and y separately!
});
```

---

## Validation Pattern

```javascript
const handleSubmitCoordinate = (point) => {
  // 1. Parse user input (math coords)
  const parsed = parseCoordinate(coord.value);
  if (!parsed.valid) { /* show error */ return; }

  // 2. Transform to grid coords
  const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);

  // 3. Find expected answer (ADD PRIME MARK!)
  const expected = reflectedPoints?.find(p => p.label === `${point}'`);

  // 4. Compare grid coordinates
  const isCorrect = expected && expected.col === gridCol && expected.row === gridRow;

  // 5. Update state
  setCoordinates(prev => ({
    ...prev,
    [point]: { ...prev[point], submitted: true, isCorrect }
  }));
};
```

---

## Common Mistakes

| Mistake | Wrong Code | Correct Code |
|---------|-----------|--------------|
| **Wrong formula** | `rc = 9 - col` (11×11) | `rc = 10 - col` (11×11) |
| **Missing prime** | `p.label === point` | `p.label === \`${point}'\`` |
| **No transform** | `expected.col === parsed.x` | `expected.col === gridCol` |
| **Can't retry** | `disabled={submitted}` | `disabled={submitted && isCorrect}` |
| **No reset** | Don't clear submitted on edit | Clear submitted when editing |

---

## Submit Button Pattern

```javascript
<button
  onClick={() => handleSubmitCoordinate(point)}
  disabled={!value || (submitted && isCorrect)}  // Allow retry when wrong!
  style={{
    backgroundColor: submitted && isCorrect ? '#10B981'      // Green
                   : submitted && !isCorrect ? '#EF4444'     // Red
                   : '#3B82F6'                               // Blue
  }}
>
  {submitted && isCorrect ? '✓ Done'
   : submitted && !isCorrect ? 'Retry'
   : 'Submit'}
</button>
```

---

## Input Change Handler (Reset on Edit)

```javascript
const handleKeypadChange = (value) => {
  setCoordinates(prev => ({
    ...prev,
    [focusedPoint]: {
      ...prev[focusedPoint],
      value,
      submitted: false,  // ← Reset to allow resubmission!
      isCorrect: false,
    }
  }));
};
```

---

## Rendering User Points

```javascript
const userEnteredPoints = useMemo(() => {
  return Object.entries(coordinates).map(([label, coord]) => {
    const parsed = parseCoordinate(coord.value);
    if (!parsed.valid) return null;

    const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);

    return {
      label: `${label}'`,
      x: gridCol,           // For Konva rendering
      y: gridRow,           // For Konva rendering
      isCorrect: coord.isCorrect,
      submitted: coord.submitted,
    };
  }).filter(Boolean);
}, [coordinates]);

// Render with color coding
{userEnteredPoints.map(pt => (
  <Circle
    x={pt.x * cellSize}
    y={pt.y * cellSize}
    fill={!pt.submitted ? '#3B82F6' : pt.isCorrect ? '#10B981' : '#EF4444'}
  />
))}
```

---

## Backend Safe Zones (11×11 Grid)

```javascript
// Vertical reflection (left → right)
r = rand(1, 9);        // Avoid edges 0 and 10
c = rand(1, 3);        // Left side, reflects to 7-9

// Horizontal reflection (top → bottom)
r = rand(1, 3);        // Top side, reflects to 7-9
c = rand(1, 9);        // Avoid edges 0 and 10

// Reflection (11×11)
if (axis === "vertical") {
  rc = 10 - pt.col;    // No -1!
} else {
  rr = 10 - pt.row;    // No -1!
}
```

---

## Testing Checklist

- [ ] (-5, 5) → (0, 0) transformation works
- [ ] (0, 0) → (5, 5) transformation works
- [ ] (5, -5) → (10, 10) transformation works
- [ ] Correct answers turn green
- [ ] Wrong answers turn red
- [ ] Can retry after wrong answer
- [ ] Submit button disabled after correct answer
- [ ] Editing clears submitted state
- [ ] Prime marks in labels work
- [ ] No off-by-one errors

---

**See full documentation:** [COORDINATE_GRID_SYSTEM.md](./COORDINATE_GRID_SYSTEM.md)
