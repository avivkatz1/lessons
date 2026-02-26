# Things to Consider While Working on Triangle Congruence Lessons

**Date**: February 23, 2026
**Lesson**: SAS and SSS Congruent Triangles - Level 3
**Task**: Convert from 4 pairs (8 triangles) to 4 individual triangles in 2x2 grid with selection

---

## Key Issues Encountered and Solutions

### 1. Grid Layout Design
**Issue**: Initial requirement was to show 4 individual triangles (not 4 pairs) in a 2x2 grid where students tap to select which 2 are congruent.

**Solution**:
- Backend: Changed from `trianglePairs` to `triangles` array + `correctIndices` array
- Frontend: Added `selectedTriangles` state and `handleTriangleClick` handler
- Grid mode: `mode: 'grid'` with 2x2 cell layout

**Files Modified**:
- `backend/aqueous-eyrie-54478/services/lessonProcessors/questions/sasCongruentTrianglesGenerator.js`
- `backend/aqueous-eyrie-54478/services/lessonProcessors/questions/sssCongruentTrianglesGenerator.js`
- `frontends/lessons/src/features/lessons/lessonTypes/geometry/SASCongruentTrianglesLesson.jsx`
- `frontends/lessons/src/features/lessons/lessonTypes/geometry/SSSCongruentTrianglesLesson.jsx`

---

### 2. Canvas Aspect Ratio Mismatch
**Issue**: Canvas was set to be square (`Math.min(canvasWidth, 600)`), but backend design space is 400x360 (rectangular). This caused triangles to not align with grid cells.

**Root Cause**:
- Backend positions triangles in 400x360 space with 200x180 cells
- Frontend made canvas square (e.g., 600x600 with 300x300 cells)
- When scaling uniformly, 200x180 cells become 300x270, which doesn't match 300x300 canvas cells

**Solution**:
```javascript
// WRONG - Makes canvas square
if (mode === 'grid') return Math.min(canvasWidth, 600);

// CORRECT - Maintains 400:360 aspect ratio
const designHeight = 360;
const designWidth = 400;
const scale = canvasWidth / designWidth;
return mode === 'grid' ? designHeight * scale : Math.min(designHeight * scale, 450);
```

**Key Principle**: Canvas aspect ratio must match backend design space aspect ratio for uniform scaling to work correctly.

---

### 3. Dynamic Sizing Across Screen Widths
**Issue**: Canvas height was capped (540px for grid mode), breaking aspect ratio on very wide screens.

**Solution**: Remove height cap for grid mode to maintain consistent aspect ratio:
```javascript
// Grid mode: No cap, always maintain ratio
// Side-by-side: Cap at 450px to prevent too tall on wide screens
return mode === 'grid' ? designHeight * scale : Math.min(designHeight * scale, 450);
```

**Result**: Triangles now scale properly and fill their cells on any screen width.

---

### 4. Congruency Markings Implementation

#### Backend Data Structure
**Added Properties**:
- Sides: `tickMarks` (0, 1, 2, or 3) - number of perpendicular tick marks
- Angles: `arcMark` (0 or 1+) - number of concentric arc marks

**Example (SAS)**:
```javascript
sides: [
  { length: data.sides[0], showLabel: true, tickMarks: data.isCongruent ? 1 : 0 },
  { length: data.sides[1], showLabel: true, tickMarks: data.isCongruent ? 2 : 0 },
  { length: data.sides[2], showLabel: false, tickMarks: 0 },
],
angles: [
  {
    value: data.angle,
    vertex: 1,
    show: true,
    showLabel: false,
    highlight: true,
    isIncluded: true,
    arcMark: data.isCongruent ? 1 : 0,
  },
]
```

#### Frontend Rendering
**Tick Marks**: Perpendicular lines at side midpoint
```javascript
{side.tickMarks > 0 && Array.from({ length: side.tickMarks }).map((_, tickIdx) => {
  const tickSpacing = 6;
  const tickLength = 8;
  // Calculate perpendicular direction and spacing...
  return <Line ... />
})}
```

**Arc Marks**: Concentric arcs on angles
```javascript
{angle.arcMark > 0 && Array.from({ length: angle.arcMark }).map((_, arcIdx) => {
  const markRadius = arcRadius - 6 - arcIdx * 4;
  return <Arc ... />
})}
```

---

### 5. Angle Rendering Issues

#### Issue 5a: Missing `show` Property
**Problem**: Frontend checks `angle.show` before rendering, but backend didn't set this property.

**Symptom**: Angles (and arc marks) not rendering at all, causing triangles to disappear.

**Solution**: Add `show: true` to all angle objects in backend.

#### Issue 5b: Wrong Property Name
**Problem**: Frontend used `angle.measure`, but backend provides `angle.value`.

**Symptom**: Angle labels showing "undefined°".

**Solution**:
```javascript
// WRONG
text={angle.label || `${angle.measure}°`}

// CORRECT
text={angle.label || `${angle.value}°`}
```

#### Issue 5c: Unwanted Labels in Level 3
**Problem**: Level 3 should only show angle arcs, not text labels.

**Solution**: Set `showLabel: false` in backend for Level 3 angles.

---

### 6. SAS Included Angle Positioning
**Critical Issue**: For SAS congruence, the angle mark MUST be at the vertex BETWEEN the two marked sides.

**Problem**: Frontend used angle array index `i` instead of the `angle.vertex` property.

```javascript
// WRONG - Uses array index
angles.map((angle, i) => {
  const vertex = vertices[i];  // If i=0, uses vertices[0]
  ...
})

// CORRECT - Uses specified vertex
angles.map((angle, i) => {
  const vertexIndex = angle.vertex !== undefined ? angle.vertex : i;
  const vertex = vertices[vertexIndex];  // Uses vertices[1] for SAS included angle
  const v1 = vertices[(vertexIndex - 1 + vertices.length) % vertices.length];
  const v2 = vertices[(vertexIndex + 1) % vertices.length];
  ...
})
```

**Why This Matters**:
- Backend correctly sets `vertex: 1` for the included angle
- Triangle vertices: 0, 1, 2
- Side 0: vertex 0 → vertex 1 (1 tick mark)
- **Angle at vertex 1**: the included angle
- Side 1: vertex 1 → vertex 2 (2 tick marks)
- Side 2: vertex 2 → vertex 0 (no marks)

This ensures the pattern is: Side - Angle - Side (SAS)

---

### 7. Grid System Styling
**Requirements**: Prominent grid similar to reflection lesson.

**Implementation**:
```javascript
// Individual cell borders (subtle)
{[0, 1, 2, 3].map((idx) => (
  <Rect
    key={`cell-${idx}`}
    x={col * cellWidth}
    y={row * cellHeight}
    width={cellWidth}
    height={cellHeight}
    stroke={konvaTheme.gridLine || '#CBD5E0'}
    strokeWidth={2}
    fill="transparent"
  />
))}

// Main grid dividers (thicker, more prominent)
<Line
  points={[canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]}
  stroke={konvaTheme.gridLine || '#CBD5E0'}
  strokeWidth={3}
/>
<Line
  points={[0, canvasHeight / 2, canvasWidth, canvasHeight / 2]}
  stroke={konvaTheme.gridLine || '#CBD5E0'}
  strokeWidth={3}
/>
```

---

### 8. Triangle Scaling and Positioning

**Backend Approach** (400x360 design space):
```javascript
const cellWidth = CANVAS_DESIGN_WIDTH / 2;   // 200
const cellHeight = CANVAS_DESIGN_HEIGHT / 2; // 180
const cellPadding = 25;

// Scale to fit in cell
const availableWidth = cellWidth - cellPadding * 2;
const availableHeight = cellHeight - cellPadding * 2;
const scaleX = availableWidth / bounds.width;
const scaleY = availableHeight / bounds.height;
const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

// Center in cell
const cellOffsetX = col * cellWidth;
const cellOffsetY = row * cellHeight;
const centerX = cellOffsetX + (cellWidth - scaledBounds.width) / 2;
const centerY = cellOffsetY + (cellHeight - scaledBounds.height) / 2;
const offsetX = centerX - scaledBounds.minX;
const offsetY = centerY - scaledBounds.minY;
```

**Frontend Approach** (dynamic canvas):
```javascript
// Scale entire 400x360 space to canvas
const designWidth = 400;
const designHeight = 360;
const scaleX = canvasWidth / designWidth;
const scaleY = canvasHeight / designHeight;
const scale = Math.min(scaleX, scaleY);

// Apply uniform scale to all vertices
vertices: triangle.vertices.map(v => ({
  x: v.x * scale,
  y: v.y * scale,
}))
```

**Key Insight**: Backend positions in design space, frontend scales the entire space uniformly.

---

## Checklist for Future Triangle Lesson Development

### Backend Generator
- [ ] Use correct data structure: `triangles` array + `correctIndices` for selection levels
- [ ] Set `tickMarks` property on sides (0, 1, 2, or 3)
- [ ] Set `arcMark` property on angles (0 or 1+)
- [ ] Set `show: true` on all angles that should render
- [ ] Set `showLabel: false` if only arc should show (no text)
- [ ] Use `value` property for angle measurements (not `measure`)
- [ ] For SAS: Set `vertex: 1` for included angle (between marked sides)
- [ ] Position triangles in 400x360 design space with proper centering
- [ ] Apply cellPadding (25px) for breathing room in cells

### Frontend Component
- [ ] Canvas height calculation: Maintain aspect ratio for grid mode
  - Grid: `designHeight * scale` (no cap)
  - Side-by-side: `Math.min(designHeight * scale, 450)`
- [ ] Use uniform scaling: `scale = Math.min(canvasWidth/400, canvasHeight/360)`
- [ ] Angle rendering: Use `angle.vertex` property, not array index
- [ ] Angle labels: Use `angle.value`, not `angle.measure`
- [ ] Add tick mark rendering for sides
- [ ] Add arc mark rendering for angles
- [ ] Grid styling: Subtle cell borders + thick dividers
- [ ] Selection interaction: Track selectedTriangles state
- [ ] Clickable areas: Full cell rectangles for easy selection

### Testing Checklist
- [ ] All 4 triangles appear in correct grid positions
- [ ] Triangles scale properly on narrow screens (phone)
- [ ] Triangles scale properly on wide screens (desktop)
- [ ] No scrolling required on iPad
- [ ] Congruent triangles show matching tick marks
- [ ] Congruent triangles show matching arc marks
- [ ] For SAS: Angle arc is between the two marked sides
- [ ] Selection highlights work correctly
- [ ] Correct answer validation works
- [ ] Wrong answer feedback works
- [ ] No "undefined" text appearing
- [ ] Grid lines visible and prominent

---

## Common Pitfalls

1. **Don't use array index for vertex lookups** - Always use `angle.vertex` property
2. **Don't cap canvas height for grid mode** - Breaks aspect ratio on wide screens
3. **Don't forget `show: true` on angles** - Frontend won't render them otherwise
4. **Don't use `angle.measure`** - Backend provides `angle.value`
5. **Don't make canvas square for grid mode** - Must match backend's 400:360 ratio
6. **Don't forget to restart backend** - After backend changes, must restart server
7. **Don't forget hard refresh** - Browser caches `questionAnswerArray` data

---

## Performance Considerations

- Grid mode generates 4 triangles per problem
- Each triangle can have up to 3 sides with tick marks
- Each congruent triangle needs arc marks
- Canvas is responsive and re-renders on window resize
- Use `useMemo` for canvas dimensions to avoid unnecessary recalculations
- Use `useCallback` for event handlers to avoid re-creating functions

---

## Future Enhancements to Consider

1. **Animations**: Fade in tick marks and arc marks after triangle renders
2. **Hints**: Highlight the congruency markings when hint is shown
3. **Accessibility**: Add ARIA labels for screen readers
4. **Touch feedback**: Haptic feedback on mobile devices
5. **Color coding**: Different colors for matching vs non-matching triangles
6. **Progressive difficulty**: Start with obvious orientations, increase complexity
7. **Explanation mode**: Highlight matching parts in the explanation

---

## References

- Backend generators: `/backend/aqueous-eyrie-54478/services/lessonProcessors/questions/`
- Frontend components: `/frontends/lessons/src/features/lessons/lessonTypes/geometry/`
- Konva documentation: https://konvajs.org/docs/
- Design space: 400x360 (CANVAS_DESIGN_WIDTH × CANVAS_DESIGN_HEIGHT)
- Grid layout: 2×2 (cellWidth × cellHeight = 200 × 180 in design space)

---

## Summary

The key to successful implementation of grid-based triangle selection lessons:

1. **Consistent coordinate system**: Backend and frontend must agree on design space dimensions
2. **Correct aspect ratio**: Canvas must maintain backend's aspect ratio for uniform scaling
3. **Property-based vertex lookup**: Use explicit `angle.vertex` property, not array indices
4. **Complete data structure**: Include all properties (`show`, `value`, `tickMarks`, `arcMark`)
5. **Dynamic responsiveness**: Remove height caps to scale properly across all screen sizes
6. **Proper SAS semantics**: Included angle must be at the vertex between the two marked sides

Following these principles will prevent the common issues we encountered and ensure a smooth development experience.
