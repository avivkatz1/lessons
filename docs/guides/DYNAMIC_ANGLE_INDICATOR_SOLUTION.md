# Dynamic Angle Indicator Solution

**Universal Pattern for Angle Arc Indicators in Geometry Lessons**

**Created:** February 13, 2026
**Updated:** February 13, 2026
**Status:** Production-Ready ✅
**Tested in:** InverseTrig lesson (Levels 1-3, all 5 context diagrams)

---

## Overview

This document provides the **universal pattern** for rendering angle arc indicators that work correctly for **any triangle orientation** without hardcoded rotation values.

**Problem Solved:** Angle arcs appearing outside triangles or showing exterior angles instead of interior angles.

**Solution:** Dynamic calculation using `Math.atan2()` to determine arc angle and rotation based on actual vertex positions.

---

## The Universal Pattern

### Complete Implementation

```javascript
/**
 * Dynamic Angle Arc Indicator
 * Works for ANY triangle orientation
 *
 * @param {Object} vertex - The angle vertex position {x, y}
 * @param {Object} point1 - First point forming the angle {x, y}
 * @param {Object} point2 - Second point forming the angle {x, y}
 */

// 1. Calculate angles from vertex to each point using atan2
const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);

// 2. Calculate clockwise sweep angle (normalized to 0-360°)
const sweep = ((theta2 - theta1) % 360 + 360) % 360;

// 3. Choose interior angle (always ≤ 180°)
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;

// 4. Optional: Scale arc radius based on shortest adjacent side
const d1 = Math.sqrt((point1.x - vertex.x) ** 2 + (point1.y - vertex.y) ** 2);
const d2 = Math.sqrt((point2.x - vertex.x) ** 2 + (point2.y - vertex.y) ** 2);
const arcRadius = Math.min(d1, d2) * 0.2; // 20% of shortest side

// 5. Render with react-konva
<Arc
  x={vertex.x}
  y={vertex.y}
  innerRadius={0}
  outerRadius={arcRadius}
  angle={arcAngle}
  rotation={arcRotation}
  fill="rgba(59, 130, 246, 0.15)"
  stroke="#3B82F6"
  strokeWidth={2}
/>
```

---

## Why This Works

### 1. `Math.atan2()` Handles All Quadrants

Unlike `Math.atan()`, `atan2(y, x)` returns angles in the full range **-180° to +180°**, correctly handling:
- Positive X, Positive Y (Quadrant IV in canvas coords)
- Negative X, Positive Y (Quadrant III)
- Negative X, Negative Y (Quadrant II)
- Positive X, Negative Y (Quadrant I)

**Canvas coordinate system:**
- 0° points right (+X)
- 90° points down (+Y)
- -90° or 270° points up (-Y)
- ±180° points left (-X)

### 2. Sweep Calculation Normalizes Angle Differences

```javascript
const sweep = ((theta2 - theta1) % 360 + 360) % 360;
```

This formula ensures:
- Result is always in range [0, 360)
- Handles wraparound (e.g., from 350° to 10° = 20°, not -340°)
- Gives the clockwise rotation from theta1 to theta2

### 3. Interior Angle Selection

```javascript
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;
```

**Logic:**
- If sweep ≤ 180°, that's the interior angle → use it directly, start from theta1
- If sweep > 180°, the interior angle is the complement (360° - sweep) → start from theta2

This **always** renders the smaller angle (interior), never the reflex angle (exterior).

---

## Real-World Examples from InverseTrig Lesson

### Example 1: Ladder Against Wall

```javascript
// Ladder diagram - angle at ground level where ladder meets ground
const ladderBottomX = centerX - scaledGround / 2;
const groundY = centerY + scaledHeight / 2;
const wallX = centerX + scaledGround / 2;
const wallTopY = centerY - scaledHeight / 2;

// Angle vertex at (ladderBottomX, groundY)
// Side 1: toward ground (wallX, groundY)
// Side 2: up the ladder (wallX, wallTopY)

const theta1 = Math.atan2(groundY - groundY, wallX - ladderBottomX) * (180 / Math.PI);
const theta2 = Math.atan2(wallTopY - groundY, wallX - ladderBottomX) * (180 / Math.PI);
const sweep = ((theta2 - theta1) % 360 + 360) % 360;
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;

// Result: Arc shows angle between ground and ladder, always interior
```

### Example 2: Wheelchair Ramp

```javascript
// Ramp - angle at bottom where ramp meets ground
const rampBottomX = centerX - scaledRun / 2;
const rampTopX = centerX + scaledRun / 2;
const rampTopY = groundY - scaledRise;

const theta1 = Math.atan2(groundY - groundY, rampTopX - rampBottomX) * (180 / Math.PI);
const theta2 = Math.atan2(rampTopY - groundY, rampTopX - rampBottomX) * (180 / Math.PI);
const sweep = ((theta2 - theta1) % 360 + 360) % 360;
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;

// Result: Arc shows ramp angle, always interior
```

### Example 3: Right Triangle (Level 2)

```javascript
// Triangle - angle at bottom-left vertex
const bottomLeft = { x: centerX - scaledAdj / 2, y: centerY + scaledOpp / 2 + 20 };
const bottomRight = { x: centerX + scaledAdj / 2, y: centerY + scaledOpp / 2 + 20 };
const topRight = { x: centerX + scaledAdj / 2, y: centerY - scaledOpp / 2 + 20 };

const theta1 = Math.atan2(bottomRight.y - bottomLeft.y, bottomRight.x - bottomLeft.x) * (180 / Math.PI);
const theta2 = Math.atan2(topRight.y - bottomLeft.y, topRight.x - bottomLeft.x) * (180 / Math.PI);
const sweep = ((theta2 - theta1) % 360 + 360) % 360;
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;

// Result: Arc shows acute angle inside triangle
```

---

## Step-by-Step Implementation Guide

### Step 1: Identify Your Angle

Determine:
- **Vertex**: The point where the angle is formed
- **Point 1**: A point along the first side of the angle
- **Point 2**: A point along the second side of the angle

**Example:** For a triangle angle at vertex A with sides toward vertices B and C:
- Vertex = A
- Point1 = B
- Point2 = C

### Step 2: Copy the Pattern

```javascript
const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);
const sweep = ((theta2 - theta1) % 360 + 360) % 360;
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;
```

### Step 3: Add Radius Scaling (Optional)

```javascript
const d1 = Math.sqrt((point1.x - vertex.x) ** 2 + (point1.y - vertex.y) ** 2);
const d2 = Math.sqrt((point2.x - vertex.x) ** 2 + (point2.y - vertex.y) ** 2);
const arcRadius = Math.min(d1, d2) * 0.2;  // 20% of shortest side
```

Or use a fixed radius:
```javascript
const arcRadius = 35;  // Fixed size in pixels
```

### Step 4: Render the Arc

```javascript
<Arc
  x={vertex.x}
  y={vertex.y}
  innerRadius={0}
  outerRadius={arcRadius}
  angle={arcAngle}
  rotation={arcRotation}
  fill="rgba(59, 130, 246, 0.15)"  // Semi-transparent fill
  stroke="#3B82F6"                  // Solid stroke
  strokeWidth={2}
/>
```

### Step 5: Test All Orientations

Verify the arc appears **inside** the angle for:
- Different triangle orientations
- Different angle sizes (acute, right, obtuse)
- Different vertex positions on canvas

---

## Common Mistakes to Avoid

### ❌ WRONG: Hardcoded Rotation

```javascript
// Don't do this - breaks for different orientations
const arcRotation = 0;  // Only works for one specific orientation
```

### ❌ WRONG: Using Simple Angle Calculation

```javascript
// Don't do this - doesn't handle all quadrants
const angleRad = Math.atan(opposite / adjacent);
const angleDeg = angleRad * (180 / Math.PI);
// Problem: atan() only returns -90° to +90°, loses quadrant information
```

### ❌ WRONG: Not Choosing Interior Angle

```javascript
// Don't do this - may show reflex angle
const arcAngle = theta2 - theta1;
// Problem: May be > 180° or negative
```

### ✅ CORRECT: Use the Universal Pattern

Always use the complete pattern with atan2, sweep normalization, and interior angle selection.

---

## Visual Verification Checklist

After implementation, verify:

- [ ] Arc appears **inside** the angle (interior angle)
- [ ] Arc does not extend outside the triangle
- [ ] Arc starts and ends on the two sides forming the angle
- [ ] Arc rotation is correct for all triangle orientations
- [ ] Arc size is appropriate (not too large or too small)
- [ ] Arc is visible against background
- [ ] Arc fill is semi-transparent to show underlying geometry

---

## When to Use This Pattern

### ✅ Use for:

- **Triangle angle indicators** - Any angle in a triangle
- **Real-world context diagrams** - Ladders, ramps, roofs, etc.
- **Angle measurement lessons** - Showing angles in various orientations
- **Any dynamic geometry** - Where triangle orientation varies

### ⚠️ Not needed for:

- **Fixed angle arcs** - Where angle is always the same orientation (rare)
- **Non-angle arcs** - Decorative arcs not representing angles
- **Right angle indicators** - Use unit vector pattern instead (see VISUAL_DESIGN_RULES.md)

---

## Production Examples

All these components use this pattern successfully:

### InverseTrig Lesson:
- **UnitCircleVisualization** (Level 1) - Angle from unit circle center
- **RightTriangleVisualization** (Level 2) - Acute angle in right triangle
- **LadderDiagram** (Level 3) - Ladder angle with ground
- **RampDiagram** (Level 3) - Ramp angle with ground
- **AirplaneDiagram** (Level 3) - Descent angle
- **RoofDiagram** (Level 3) - Roof pitch angle
- **CraneDiagram** (Level 3) - Cable angle from vertical

**Result:** 100% correct angle rendering across all orientations ✅

---

## Side Label Positioning

For positioning **side labels** (hypotenuse, leg labels) on triangles, see **[VISUAL_DESIGN_RULES.md — Rule #2](./VISUAL_DESIGN_RULES.md)**.

Key points:
- **Diagonal labels** (hypotenuse, ladder, ramp, cable) must be **rotated parallel** to their line using `atan2`
- **All labels** must be **outside** the triangle (interior is for angle indicators only)
- **Leg labels** (horizontal/vertical sides) stay horizontal, positioned outside
- Uses perpendicular offset + flip check to ensure labels face away from the opposite vertex

---

## Related Documentation

- **[VISUAL_DESIGN_RULES.md](./VISUAL_DESIGN_RULES.md)** - Rules for angle indicators (Rule #1) and label positioning (Rule #2)
- **[../../docs/LESSON_IMPLEMENTATION_GUIDE.md](../../docs/LESSON_IMPLEMENTATION_GUIDE.md)** - Complete lesson patterns
- **InverseTrig.jsx** - Production example with 5+ implementations

---

## Summary

**Copy-Paste Template:**

```javascript
// Dynamic angle arc indicator - works for any orientation
const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);
const sweep = ((theta2 - theta1) % 360 + 360) % 360;
const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
const arcRotation = sweep <= 180 ? theta1 : theta2;

<Arc
  x={vertex.x}
  y={vertex.y}
  innerRadius={0}
  outerRadius={35}
  angle={arcAngle}
  rotation={arcRotation}
  fill="rgba(59, 130, 246, 0.15)"
  stroke="#3B82F6"
  strokeWidth={2}
/>
```

**Key Points:**
- ✅ Works for any triangle orientation
- ✅ Always shows interior angle
- ✅ No hardcoded rotation values
- ✅ Handles all quadrants correctly
- ✅ Production-tested and proven

**Status:** Ready to use in all future geometry lessons ✅
