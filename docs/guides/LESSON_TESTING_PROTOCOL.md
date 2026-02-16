# Lesson Testing Protocol
## For New Lesson Implementation and Verification

**Purpose:** Ensure every new lesson is thoroughly tested before deployment
**Role:** Tester (to be automated)
**Created:** February 7, 2026

---

## Overview

This protocol should be followed for **every new lesson** created. It documents the manual testing process that should eventually be automated by a "tester" role/agent.

---

## Phase 1: Initial Setup Verification

### Backend Checks
- [ ] Lesson config file exists in `/backend/config/lessonConfigs/[lesson_name].config.js`
- [ ] Config is registered in `/backend/config/lessonConfigs/index.js`
- [ ] Question generator function exists (if custom data generation)
- [ ] API endpoint responds: `GET http://localhost:5001/lessons/content/[lesson_name]&1&1`
- [ ] API returns valid JSON with all required fields
- [ ] Batch mode returns 10 problems in `questionAnswerArray`

### Frontend Checks
- [ ] Component file exists in `/src/features/lessons/lessonTypes/[category]/[LessonName].jsx`
- [ ] Component exported in `/src/features/lessons/lessonTypes/[category]/index.js`
- [ ] Lazy loading added in `/src/features/lessons/DataLesson.js`
- [ ] Lesson registered with correct image and component array
- [ ] Frontend builds without errors: `npm run build`

---

## Phase 2: Visual Verification (CRITICAL)

### Process
1. **Open lesson in browser**: `http://localhost:3000/lessons/[lesson_name]`
2. **Take screenshots of EACH level** - Save to organized folder
3. **Analyze each screenshot** for visual issues

### Screenshot Checklist (for each level)

#### Visual Components
- [ ] **Question text displays correctly**
  - No text overflow
  - Grammar is correct
  - Math notation renders properly (if using KaTeX)

- [ ] **Visual elements render as expected**
  - Triangles/shapes are properly scaled
  - Labels don't overlap
  - Colors match specification
  - Angles/arcs are positioned correctly

- [ ] **Interactive elements visible**
  - Answer input field present
  - Hint button shows (if hint exists)
  - Submit button accessible

- [ ] **Layout is responsive**
  - Components centered properly
  - No horizontal scroll
  - Appropriate padding/margins

#### Specific Checks for Geometry Lessons

**For lessons with triangles/shapes:**

1. **Angle Position Verification**
   - Is the angle arc at the CORRECT vertex?
   - Does the angle label match the arc position?
   - Is the angle value accurate?

2. **Side Labeling**
   - Are "opposite" and "adjacent" correctly identified?
   - Do colors match the intended meaning?
     - Level 1 with hints: RED = opposite, BLUE = adjacent
     - Later levels: Neutral gray
   - Are side lengths visible when they should be?

3. **Right Angle Indicator**
   - Is the small square at the 90° corner?
   - Is it sized appropriately for the triangle?

4. **Orientation Variety**
   - Test multiple problems - do orientations change?
   - Are all orientations rendering correctly?

5. **⚠️ CRITICAL: Interior Angle Indicators (Added Feb 7, 2026)**
   - **Angle Arc MUST be INSIDE the triangle**
     - Arc should curve inward from one side to another
     - Arc should NOT extend outward (exterior angle)
     - Verify for ALL orientations

   - **Right Angle Square MUST be INSIDE the triangle**
     - Square should fit in the corner, not hang outside
     - All four corners of square should be within triangle bounds
     - Verify for ALL orientations (8 for rotated triangles)

   - **Test ALL 8 Orientations for Rotated Triangles:**
     - [ ] bottom-left
     - [ ] bottom-right
     - [ ] top-left
     - [ ] top-right
     - [ ] left-bottom
     - [ ] left-top
     - [ ] right-bottom
     - [ ] right-top

   - **For EACH orientation, verify:**
     - [ ] Angle arc is inside triangle (interior angle)
     - [ ] Right angle square is inside triangle corner
     - [ ] Both indicators are fully visible
     - [ ] No parts extending outside triangle boundary

   - **Common Failure Pattern:**
     - If arc extends OUTWARD → shows exterior angle (WRONG)
     - If square hangs OUTSIDE corner → incorrect offset (WRONG)
     - Both must be INSIDE to show interior angles (CORRECT)

   - **See:** `VISUAL_DESIGN_RULES.md` for detailed guidance

---

## Phase 3: Functional Testing

### Level-by-Level Testing

For EACH level (1 through N):

#### 1. Load Level
- [ ] Level button is clickable
- [ ] Level loads without errors
- [ ] Console shows no errors
- [ ] API call succeeds (check Network tab)

#### 2. Interaction Testing
- [ ] Answer input accepts text/numbers
- [ ] Can type in answer field
- [ ] Placeholder text is helpful
- [ ] Enter key submits answer (if applicable)

#### 3. Answer Validation
- [ ] **Submit correct answer**
  - Green checkmark or success indicator appears
  - Explanation section reveals
  - Calculation steps show (if applicable)
  - "Try Another" button appears

- [ ] **Submit incorrect answer**
  - Red X or error indicator appears
  - User can retry
  - Hint becomes available (if exists)

#### 4. Hint System
- [ ] "Need a hint?" button visible (if hint exists)
- [ ] Click shows hint text
- [ ] Hint is relevant and helpful
- [ ] Hint doesn't give away entire answer

#### 5. Explanation Display
- [ ] Shows after correct answer
- [ ] Contains clear explanation
- [ ] Shows calculation steps (for math lessons)
- [ ] Explanation is accurate
- [ ] No typos or grammar errors

#### 6. Problem Progression
- [ ] Click "Try Another Problem"
- [ ] New problem loads
- [ ] Visual changes (different orientation, numbers, etc.)
- [ ] Answer input resets
- [ ] Hint collapses
- [ ] Explanation hides

---

## Phase 4: Edge Case Testing

### Data Range Testing
Test with extreme values to ensure dynamic sizing works:

- [ ] **Small values** (e.g., side length = 3, angle = 15°)
  - Triangle renders at appropriate scale
  - Labels are readable
  - No overlap issues

- [ ] **Large values** (e.g., side length = 20, angle = 85°)
  - Triangle fits in canvas
  - Dynamic scaling prevents overflow
  - Labels positioned correctly

- [ ] **Extreme ratios** (e.g., very narrow or very wide triangles)
  - Shape renders correctly
  - All labels visible
  - No visual glitches

### Batch Mode Testing
- [ ] Complete 10 problems without refresh
- [ ] Progress tracking updates (if exists)
- [ ] No duplicate problems in batch
- [ ] "Load More Practice" button appears after batch
- [ ] Clicking loads new batch of 10

### Error Handling
- [ ] Missing optional fields don't crash (e.g., hint, explanation)
- [ ] Malformed data handled gracefully
- [ ] Network errors show user-friendly message
- [ ] Backend down shows appropriate error

---

## Phase 5: Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Edge

### Cross-Browser Checks
- [ ] Lesson loads successfully
- [ ] Visuals render identically
- [ ] Interactions work
- [ ] No console errors

---

## Phase 6: Responsive Design

Test at different screen sizes:
- [ ] **Desktop (1920×1080)**
  - Full layout displays
  - Appropriate spacing

- [ ] **Tablet (768px width)**
  - Layout adjusts
  - Touch targets are large enough
  - Text remains readable

- [ ] **Mobile (375px width)**
  - Single column layout
  - Canvas/visuals scale down
  - All features accessible
  - No horizontal scroll

---

## Phase 7: Accessibility

- [ ] Tab navigation works through all interactive elements
- [ ] Answer input has proper label/aria-label
- [ ] Buttons have descriptive text
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators visible

---

## Phase 8: Performance

- [ ] Initial load < 3 seconds
- [ ] Problem generation < 500ms
- [ ] Smooth transitions (no lag)
- [ ] No memory leaks (check DevTools)
- [ ] Canvas rendering performant (60fps)

---

## Issue Documentation Template

When issues are found, document them with:

```markdown
### Issue: [Brief Description]

**Severity:** Critical / High / Medium / Low
**Location:** [Component file:line or screenshot reference]
**Level:** Level [N]

**What's Wrong:**
[Detailed description with screenshot]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Steps to Reproduce:**
1. Navigate to [URL]
2. Click [button/action]
3. Observe [issue]

**Recommended Fix:**
[Code changes or approach to fix]

**Screenshot:**
![Issue screenshot](path/to/screenshot.png)
```

---

## Automated Testing (Future)

### Goals
- Automate screenshot capture for all levels
- Automated visual regression testing (Percy, Chromatic)
- Automated functional testing (Playwright, Cypress)
- CI/CD integration

### Tester Role Responsibilities
The "tester" role/agent should:

1. **Setup**
   - Ensure backend and frontend are running
   - Clear browser cache
   - Open browser in consistent environment

2. **Execution**
   - Navigate through all levels sequentially
   - Take screenshots at key points
   - Submit test answers (both correct and incorrect)
   - Trigger hints and explanations
   - Test "Try Another" functionality

3. **Analysis**
   - Compare screenshots against baseline (if exists)
   - Check for visual anomalies:
     - Overlapping text
     - Mispositioned elements
     - Wrong colors
     - Incorrect orientations
   - Verify functionality works
   - Check console for errors

4. **Reporting**
   - Generate test report with pass/fail status
   - Include all screenshots
   - List any issues found with severity
   - Provide recommendations

5. **Documentation**
   - Save artifacts to organized folder structure:
     ```
     /test-results/
       [lesson_name]/
         [timestamp]/
           level-1.png
           level-2.png
           ...
           test-report.md
           console-logs.txt
     ```

---

## Sign-Off Checklist

Before marking a lesson as "production-ready":

- [ ] All visual verification checks pass
- [ ] All functional tests pass
- [ ] All edge cases handled
- [ ] Tested in 3+ browsers
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
- [ ] Backend API tested with Postman/curl
- [ ] Documentation complete (README, implementation guide)
- [ ] Screenshots archived
- [ ] Code reviewed
- [ ] Backend deployed to staging/Heroku
- [ ] Frontend deployed to Vercel/staging

**Approved By:** _________________
**Date:** _________________
**Lesson Name:** _________________
**Status:** ✅ Production Ready / ⚠️ Needs Fixes

---

## Current Issue: More Tangent Lesson

**Date:** February 7, 2026
**Issue:** Angle position incorrect for certain orientations

**Screenshot Analysis:**
- Orientation appears to be "top-right" or similar
- Angle (53°) and arc rendered at TOP vertex
- But colored sides indicate angle should be at BOTTOM-LEFT
- Red (adjacent) and Blue (opposite) don't align with angle position

**Required Fix:**
- Review `RotatedTriangle` component angle positioning logic
- Ensure angle arc is always at the correct vertex (where adjacent meets hypotenuse)
- Test all 8 orientations after fix

---

**Next Steps:**
1. Fix angle positioning bug in MoreTangentLesson.jsx
2. Re-test all orientations
3. Take new screenshots to verify fix
4. Complete sign-off checklist
