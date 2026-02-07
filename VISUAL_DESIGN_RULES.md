# Visual Design Rules for Geometry Lessons
## Critical Guidelines for Triangle and Angle Rendering

**Created:** February 7, 2026
**Purpose:** Document visual design standards to prevent common rendering mistakes

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

**Problem:** Arc positioned at vertex but extends outward
**Solution:** Calculate arc rotation **dynamically** based on actual triangle geometry

```javascript
// ❌ WRONG - Hardcoded rotation for each orientation
let arcRotation = 0;
if (orientation === 'bottom-left') {
  arcRotation = 0;
} else if (orientation === 'bottom-right') {
  arcRotation = 180;
}
// ... doesn't work for all cases

// ✅ CORRECT - Dynamic calculation based on adjacent side angle
// Calculate the angle of the adjacent side (from acute angle to right angle)
const adjacentAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

// Use this as the rotation - arc will start along the adjacent side
const arcRotation = adjacentAngle;

<Arc
  x={x1}
  y={y1}
  outerRadius={arcRadius}
  angle={angleValue}
  rotation={arcRotation}  // Dynamically calculated
/>
```

**Key insight:**
- The `rotation` parameter determines where the arc **starts**
- Calculate rotation as the angle of the adjacent side
- The arc will automatically sweep **inward** from adjacent toward hypotenuse
- This works for **any** triangle orientation without hardcoding

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
const toAcuteY = y1 - x2;
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

## Related Files

- **Component:** `/src/features/lessons/lessonTypes/geometry/MoreTangentLesson.jsx`
- **Also applies to:** `TangentLesson.jsx`, `TriangleSum.js`, `PythagoreanTheorem.js`
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
