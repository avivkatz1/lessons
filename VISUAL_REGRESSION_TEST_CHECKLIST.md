# Visual Regression Test Checklist
## For Geometry Lessons with Triangles

**Purpose:** Systematic visual verification for all triangle orientations
**Created:** February 7, 2026
**Updated:** After fixing More Tangent angle indicator positioning

---

## Overview

This checklist ensures that triangle-based lessons render correctly across ALL orientations and configurations. Use this for any lesson that displays triangles with angle indicators.

---

## Quick Verification (5 minutes)

Use this for rapid checks during development:

### ✅ Quick Check - Any Triangle Lesson

- [ ] Angle arc is **inside** triangle (not extending outward)
- [ ] Right angle square is **inside** triangle corner (not hanging outside)
- [ ] All sides are clearly visible
- [ ] Labels don't overlap
- [ ] Triangle fits within canvas boundaries

---

## Full Orientation Test (15-30 minutes)

### For Lessons with Rotated Triangles (8 Orientations)

Test EACH orientation by loading multiple problems until all 8 appear:

#### Orientation 1: bottom-left
- [ ] Triangle renders with acute angle at bottom-left
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from bottom-left → right
- [ ] Opposite side goes from right angle → up
- [ ] Hypotenuse from bottom-left → top
- [ ] **Screenshot saved:** `test-results/more_tangent/bottom-left.png`

#### Orientation 2: bottom-right
- [ ] Triangle renders with acute angle at bottom-right
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from bottom-right → left
- [ ] Opposite side goes from right angle → up
- [ ] Hypotenuse from bottom-right → top
- [ ] **Screenshot saved:** `test-results/more_tangent/bottom-right.png`

#### Orientation 3: top-left
- [ ] Triangle renders with acute angle at top-left
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from top-left → right
- [ ] Opposite side goes from right angle → down
- [ ] Hypotenuse from top-left → bottom
- [ ] **Screenshot saved:** `test-results/more_tangent/top-left.png`

#### Orientation 4: top-right
- [ ] Triangle renders with acute angle at top-right
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from top-right → left
- [ ] Opposite side goes from right angle → down
- [ ] Hypotenuse from top-right → bottom
- [ ] **Screenshot saved:** `test-results/more_tangent/top-right.png`

#### Orientation 5: left-bottom
- [ ] Triangle renders with acute angle at left-bottom
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from left-bottom → up
- [ ] Opposite side goes from right angle → right
- [ ] Hypotenuse from left-bottom → right
- [ ] **Screenshot saved:** `test-results/more_tangent/left-bottom.png`

#### Orientation 6: left-top
- [ ] Triangle renders with acute angle at left-top
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from left-top → down
- [ ] Opposite side goes from right angle → right
- [ ] Hypotenuse from left-top → right
- [ ] **Screenshot saved:** `test-results/more_tangent/left-top.png`

#### Orientation 7: right-bottom
- [ ] Triangle renders with acute angle at right-bottom
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from right-bottom → up
- [ ] Opposite side goes from right angle → left
- [ ] Hypotenuse from right-bottom → left
- [ ] **Screenshot saved:** `test-results/more_tangent/right-bottom.png`

#### Orientation 8: right-top
- [ ] Triangle renders with acute angle at right-top
- [ ] Angle arc curves **inward** (into triangle)
- [ ] Right angle square **inside** corner
- [ ] Adjacent side goes from right-top → down
- [ ] Opposite side goes from right angle → left
- [ ] Hypotenuse from right-top → left
- [ ] **Screenshot saved:** `test-results/more_tangent/right-top.png`

---

## Edge Case Testing

### Extreme Angle Values

Test with small, medium, and large angles:

#### Small Angles (15° - 25°)
- [ ] Angle arc doesn't become too small to see
- [ ] Arc still **inside** triangle
- [ ] Right angle square still visible
- [ ] No overlap between arc and square

#### Medium Angles (40° - 50°)
- [ ] Angle arc clearly visible
- [ ] Arc properly **inside** triangle
- [ ] Right angle square positioned correctly
- [ ] Good visual separation

#### Large Angles (70° - 85°)
- [ ] Angle arc doesn't become too large
- [ ] Arc stays **inside** triangle (doesn't overflow)
- [ ] Right angle square resizes appropriately (smaller)
- [ ] No overlap with triangle sides

### Extreme Side Lengths

Test with small and large triangles:

#### Small Triangles (adjacent = 3-5, opposite = 3-5)
- [ ] Triangle scales appropriately
- [ ] Angle arc scales down proportionally
- [ ] Right angle square scales down
- [ ] Both indicators still **inside** triangle
- [ ] Labels readable and positioned correctly

#### Large Triangles (adjacent = 18-20, opposite = 18-20)
- [ ] Triangle fits in canvas
- [ ] Angle arc scales appropriately
- [ ] Right angle square sized correctly
- [ ] Both indicators still **inside** triangle
- [ ] No overflow beyond canvas bounds

#### Narrow Triangles (adjacent = 15, opposite = 4)
- [ ] Triangle renders without distortion
- [ ] Angle arc doesn't overflow sides
- [ ] Right angle square fits in narrow corner
- [ ] Both indicators **inside** triangle

#### Wide Triangles (adjacent = 5, opposite = 18)
- [ ] Triangle renders without distortion
- [ ] Angle arc sized proportionally
- [ ] Right angle square positioned correctly
- [ ] Both indicators **inside** triangle

---

## Visual Comparison Test

### Side-by-Side Orientation Comparison

Take screenshots of all 8 orientations and arrange in a grid:

```
bottom-left    bottom-right    top-left      top-right
[screenshot]   [screenshot]    [screenshot]  [screenshot]

left-bottom    left-top        right-bottom  right-top
[screenshot]   [screenshot]    [screenshot]  [screenshot]
```

**Visual Inspection:**
- [ ] All angle arcs curve **inward**
- [ ] All right angle squares are **inside** corners
- [ ] Consistent styling across orientations
- [ ] No orientation has indicators outside triangle
- [ ] Triangle sizes are comparable
- [ ] Labels positioned consistently relative to sides

---

## Automated Testing (Future)

### Playwright/Cypress Test Script

```javascript
// Example test structure
describe('Triangle Orientation Tests', () => {
  const orientations = [
    'bottom-left', 'bottom-right', 'top-left', 'top-right',
    'left-bottom', 'left-top', 'right-bottom', 'right-top'
  ];

  orientations.forEach(orientation => {
    it(`should render ${orientation} with indicators inside`, async () => {
      // Load lesson until this orientation appears
      // Take screenshot
      // Verify angle arc is inside triangle bounds
      // Verify right angle square is inside triangle bounds
      // Compare against baseline screenshot
    });
  });
});
```

### Visual Regression Tools

**Recommended:**
- **Percy.io** - Automated visual regression testing
- **Chromatic** - Storybook visual testing
- **Playwright** - Screenshot comparison

**Setup:**
1. Capture baseline screenshots for all 8 orientations
2. Run visual regression on each PR
3. Flag any differences for review
4. Update baselines when intentional changes are made

---

## Documentation Reference

When testing fails, refer to:

- **VISUAL_DESIGN_RULES.md** - Detailed rules for angle indicator placement
- **LESSON_TESTING_PROTOCOL.md** - General testing protocol
- **MORE_TANGENT_BACKEND_GUIDE.md** - Backend data structure
- **LESSON_DEVELOPMENT_CHECKLIST.md** - Development standards

---

## Common Failure Patterns

### ❌ Angle Arc Extending Outward (WRONG)

**Visual:** Arc curves away from triangle interior
**Cause:** Incorrect arc rotation calculation
**Fix:** Review `arcRotation` calculation in component
**See:** VISUAL_DESIGN_RULES.md, Rule #1

### ❌ Right Angle Square Outside Corner (WRONG)

**Visual:** Square hangs outside triangle boundary
**Cause:** Incorrect offset calculation for that orientation
**Fix:** Review `rightAngleOffsetX/Y` for that orientation
**See:** VISUAL_DESIGN_RULES.md, Rule #1

### ❌ Both Indicators Outside (WRONG)

**Visual:** Both arc and square extend beyond triangle
**Cause:** Both calculations incorrect
**Fix:** Review both arc rotation and offset calculations
**Priority:** CRITICAL - Fix immediately

---

## Test Report Template

```markdown
# Visual Regression Test Report
**Date:** [Date]
**Lesson:** [Lesson Name]
**Tested By:** [Name/Role]

## Summary
- Total Orientations Tested: 8
- Passed: [N]
- Failed: [N]
- Issues Found: [N]

## Orientation Results

### ✅ Passed
- bottom-left
- bottom-right
- [etc.]

### ❌ Failed
- [Orientation name]
  - Issue: [Description]
  - Screenshot: [Link]
  - Severity: Critical/High/Medium/Low

## Edge Case Results

### Extreme Angles
- Small (15-25°): ✅/❌
- Medium (40-50°): ✅/❌
- Large (70-85°): ✅/❌

### Extreme Sizes
- Small triangles: ✅/❌
- Large triangles: ✅/❌
- Narrow triangles: ✅/❌
- Wide triangles: ✅/❌

## Recommendations
[List any fixes or improvements needed]

## Approval
- [ ] All critical issues resolved
- [ ] Visual quality acceptable
- [ ] Ready for production

**Approved By:** _________________
**Date:** _________________
```

---

## Quick Reference: Inside vs Outside

### ✅ CORRECT - Indicators Inside
```
        /|
       / |θ
      /  |  <- Arc curves inward
     / ⦜ |  <- Square inside corner
    /____|
```

### ❌ WRONG - Indicators Outside
```
      θ
     ⌒  /|   <- Arc curves outward
       / |
      /  |
     /   |
    /____|⦜  <- Square outside corner
```

---

**Last Updated:** February 7, 2026
**Next Review:** After next geometry lesson implementation
