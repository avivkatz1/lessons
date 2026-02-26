# AAS Frontend Fixes Needed
**Date:** 2026-02-23
**Status:** In Progress

## Issues from Screenshot Review

### CRITICAL FIXES NEEDED

---

## 1. Level 1: Binary Choice Buttons

**Current State:**
- Showing regular choice buttons
- Lots of overlapping text labels on triangles (BC, AB, CA, FD, EF, DE, etc.)

**Required Changes:**
- [ ] Use Yes/No button pattern from shapes lesson
- [ ] Hide all side labels (`showLabel: false` for sides)
- [ ] Hide vertex letter labels
- [ ] Only show congruency markings (arc marks on angles, tick marks on sides)
- [ ] Clean triangle rendering with minimal labels

**Files to Modify:**
- Backend: `aasCongruentTrianglesGenerator.js` - Level 1 generator
- Frontend: `AASCongruentTrianglesLesson.jsx` - Level 1 rendering

---

## 2. Level 2: Random Letters Everywhere

**Current State:**
- Random letters appearing all over inside triangles
- Unreadable decimal numbers (1111.95304365365527)
- Vertex labels in wrong positions

**Required Changes:**
- [ ] Hide side labels on triangles
- [ ] Round all decimal numbers to nearest integer
- [ ] Fix vertex label positioning
- [ ] Only show labels for parts being classified

**Root Cause:**
- Backend setting `showLabel: true` on sides when it shouldn't
- Numbers not being rounded
- Label positioning calculation incorrect

---

## 3. Level 3 (Grid Mode): Text Overload

**Current State:**
- Too much text written all over triangles
- Numbers overlapping each other
- Unreadable clutter
- Long decimals: "51.699999999999999°"

**Required Changes:**
- [ ] Round ALL numbers to integers (no decimals)
- [ ] Reduce label density
- [ ] Fix label spacing to prevent overlap
- [ ] Show only essential measurements

**Number Rounding Rules:**
- Sides: Round to 1 decimal IF needed, otherwise integer
- Angles: Always round to nearest integer (52° not 51.7°)
- Remove floating point artifacts (51.6999... → 52)

---

## 4. Level 4: Number Formatting

**Current State:**
- Numbers way too big with excessive decimal places
- "51.699999999999999°" should be "52°"
- "31.4°" is fine, "96.9°" should be "97°"

**Required Changes:**
- [ ] Round all angles to nearest integer
- [ ] Format sides to 1 decimal max
- [ ] Use Math.round() for angles
- [ ] Use toFixed(1) for sides, then remove trailing .0

**Implementation:**
```javascript
// Angles
const formatAngle = (angle) => `${Math.round(angle)}°`;

// Sides
const formatSide = (length) => {
  const rounded = Number(length.toFixed(1));
  return rounded % 1 === 0 ? Math.round(rounded) : rounded;
};
```

---

## 5. Level 5: Duplicate Word Problem

**Current State:**
- Word problem written TWICE
- Once in question text above canvas
- Once rendered ON the canvas

**Required Changes:**
- [ ] Remove word problem text from canvas rendering
- [ ] Only show word problem in question text area
- [ ] Canvas should show ONLY the triangles and measurements
- [ ] NO text paragraphs on canvas for Level 5

**Files to Modify:**
- Frontend: `AASCongruentTrianglesLesson.jsx` - Level 5 canvas rendering
- Check for conditional: `if (level !== 5) { render word problem }`

---

## 6. Answer Layout: 2x2 Grid (ALL LEVELS)

**Current State:**
- Answers in 1x4 vertical column
- Takes up too much space
- Doesn't match other lessons

**Required Changes:**
- [ ] Change from flex-column to CSS Grid
- [ ] Use `display: grid; grid-template-columns: repeat(2, 1fr);`
- [ ] Create `AnswerGrid` styled component
- [ ] Apply to Levels with multiple choice answers

**Pattern to Follow:**
```javascript
const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;
```

**Affected Levels:**
- Level 5: Word problem multiple choice answers

---

## Implementation Priority

### Phase 1: Backend Number Formatting (URGENT)
1. Add number rounding functions to backend generator
2. Round all angles to integers
3. Round all sides appropriately
4. Fix floating point artifacts

### Phase 2: Label Control (URGENT)
1. Set `showLabel: false` for sides in Level 1, 2, 3
2. Control vertex label visibility
3. Only show labels where needed for pedagogy

### Phase 3: Frontend Layout (HIGH)
1. Implement 2x2 answer grid
2. Remove duplicate word problem text in Level 5
3. Adjust canvas rendering conditionals

### Phase 4: Button Pattern (MEDIUM)
1. Implement Yes/No buttons for Level 1 (like shapes lesson)

---

## Code Locations

**Backend Generator:**
```
backend/aqueous-eyrie-54478/services/lessonProcessors/questions/aasCongruentTrianglesGenerator.js
```

**Frontend Component:**
```
frontends/lessons/src/features/lessons/lessonTypes/geometry/AASCongruentTrianglesLesson.jsx
```

---

## Testing Checklist

After each fix:
- [ ] Level 1: Clean triangles, Yes/No buttons
- [ ] Level 2: No random letters, numbers rounded
- [ ] Level 3: Readable grid, all numbers rounded
- [ ] Level 4: All numbers properly formatted
- [ ] Level 5: Word problem shown once, 2x2 answer grid
- [ ] No console errors
- [ ] Matches visual quality of SSS/SAS lessons
