# Lesson Development Quick Reference
## Based on TangentLesson Implementation (Feb 2026)

**Use this checklist for every new lesson to avoid common pitfalls!**

---

## 🚨 Critical Requirements (Do NOT skip!)

### ✅ Component Pattern
```javascript
// ✅ CORRECT Pattern
function MyLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();
  // ...
}

// ❌ WRONG Pattern (causes blank screen)
function MyLesson({ lessonData, onAnswerSubmit }) {
  if (!lessonData) return null;
  // ...
}
```

### ✅ Answer Input Component
```javascript
// ✅ CORRECT - Use shared component
<AnswerInput
  correctAnswer={correctAnswer}
  answerType="array"
  onCorrect={revealAnswer}
  onTryAnother={handleTryAnother}
  disabled={showAnswer}
/>

// ❌ WRONG - Custom input + validation
<input value={userAnswer} onChange={...} />
<button onClick={handleSubmit}>Submit</button>
```

### ✅ Answer Format
```javascript
// ✅ CORRECT - Always array
const correctAnswer = useMemo(() => {
  if (acceptedAnswers?.length > 0) return acceptedAnswers;
  if (Array.isArray(answer)) return answer;
  return [String(answer)];
}, [answer, acceptedAnswers]);

// ❌ WRONG - String or inconsistent format
const correctAnswer = answer;
```

---

## 📋 Pre-Implementation Checklist

### Before Writing Code
- [ ] Reviewed 2-3 similar existing lessons
- [ ] Identified shared components to reuse
- [ ] Defined backend data contract (JSON structure)
- [ ] Sketched visual requirements (if needed)
- [ ] Listed edge cases (small/large values, extreme angles)

---

## 🎨 Visual Component Checklist

### If Your Lesson Has Custom Visuals (Canvas, SVG)

#### Dynamic Sizing (NOT Fixed!)
```javascript
// ✅ CORRECT - Dynamic sizing
const maxWidth = width - (padding * 2);
const maxHeight = height - (padding * 2);
const scale = Math.min(maxWidth / dataMax, maxHeight / dataMax, 20);

// ❌ WRONG - Fixed sizing
const scale = 15;
```

#### ⚠️ CRITICAL: Angle Indicators MUST Be Inside Triangle

**Rule:** All angle indicators (arcs, squares, labels) MUST be positioned **INSIDE** the triangle to show **interior angles**.

```javascript
// ❌ WRONG - Angle arc extending OUTSIDE (exterior angle)
<Arc
  x={vertex.x}
  y={vertex.y}
  rotation={0}  // Wrong rotation makes arc point outward
/>

// ✅ CORRECT - Angle arc INSIDE triangle (interior angle)
<Arc
  x={vertex.x}
  y={vertex.y}
  rotation={calculateInwardRotation(orientation)}  // Arc points inward
/>

// ❌ WRONG - Right angle square hanging OUTSIDE corner
<Rect
  x={rightAngleX}  // Square top-left at vertex
  y={rightAngleY}
  width={20}
  height={20}
/>

// ✅ CORRECT - Right angle square INSIDE triangle corner
<Rect
  x={rightAngleX + offsetX}  // Offset to position inside
  y={rightAngleY + offsetY}
  width={squareSize}
  height={squareSize}
/>
```

**Why This Matters:**
- Interior angles are INSIDE the polygon
- Exterior angles are OUTSIDE the polygon
- Students must see INTERIOR angles (inside)
- Wrong placement causes mathematical confusion

**Testing:**
- Test ALL orientations (8 for rotated triangles)
- Visually verify arc curves inward
- Visually verify square is inside corner
- See: `VISUAL_DESIGN_RULES.md` for detailed guidance
- Use: `VISUAL_REGRESSION_TEST_CHECKLIST.md` for systematic testing

#### Collision Detection
```javascript
// ✅ CORRECT - Check for overlaps
const distance = Math.sqrt(
  Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
);
if (distance < threshold) {
  // Position outside with arrow
}

// ❌ WRONG - Assume labels fit
<Text x={x} y={y} text={label} />
```

#### Test Data Matrix
Test with these value ranges:

| Element | Small | Medium | Large |
|---------|-------|--------|-------|
| Angle | 15° | 45° | 85° |
| Length | 3 | 10 | 50 |
| Width | 5 | 15 | 40 |

---

## 🧪 Testing Checklist

### Manual Testing (All Levels)
- [ ] All levels load without blank screen
- [ ] Answer validation works (correct → shows explanation)
- [ ] Answer validation works (incorrect → shows feedback)
- [ ] Hint button displays (if hint exists)
- [ ] Explanation displays after correct answer
- [ ] "Try Another" cycles to new problem
- [ ] Batch mode works (10 problems without API calls)

### Edge Case Testing
- [ ] Small values (e.g., length=3, angle=15°)
- [ ] Large values (e.g., length=50, angle=85°)
- [ ] Extreme ratios (e.g., width 50, height 5)
- [ ] Missing optional fields (hint, explanation, visualData)
- [ ] Empty arrays (acceptedAnswers = [])

### Visual Testing (if applicable)
- [ ] No overlapping labels
- [ ] All text readable
- [ ] Labels don't extend outside canvas
- [ ] Scales properly on mobile (375px)
- [ ] Scales properly on desktop (1920px)

### Browser Console
- [ ] No React errors
- [ ] No Redux errors
- [ ] No PropTypes warnings
- [ ] Network requests only when needed

---

## 🐛 Common Bugs & Solutions

### Bug: Blank Screen
**Cause:** Using `lessonData` prop instead of `useLessonState()` hook
**Solution:** Refactor to standard pattern (see Critical Requirements)

### Bug: "Cannot read property of undefined"
**Cause:** Missing optional backend field
**Solution:** Use optional chaining `field?.subfield`

### Bug: Answer always wrong
**Cause:** Answer format mismatch (string vs array)
**Solution:** Use answer formatter (see Critical Requirements)

### Bug: Labels overlapping
**Cause:** Fixed positioning without collision detection
**Solution:** Calculate distances, move labels if too close

### Bug: Visual overflowing canvas
**Cause:** Fixed scale factor
**Solution:** Calculate dynamic scale based on data ranges

### Bug: "Try Another" doesn't work
**Cause:** Not calling `triggerNewProblem()`
**Solution:** Call `triggerNewProblem()` in handler

---

## 📝 Code Review Checklist

### Before Submitting PR
- [ ] Uses `useLessonState()` hook (not props)
- [ ] Uses shared `AnswerInput` component
- [ ] Answer formatted as array
- [ ] Visual elements scale dynamically
- [ ] Collision detection implemented
- [ ] All edge cases tested
- [ ] Screenshots attached for visual changes
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Commented complex logic
- [ ] Removed console.logs / debuggers

---

## 🚀 Quick Start Template

Copy this template for new lessons:

```javascript
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

function NewLesson({ triggerNewProblem }) {
  // Standard hook
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  // Local UI state
  const [showHint, setShowHint] = useState(false);

  // Current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const { question, answer, acceptedAnswers, hint, explanation } = currentProblem;

  // Format answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Event handler
  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  return (
    <Wrapper>
      <QuestionSection>
        <QuestionText>{question?.[0]?.text || question}</QuestionText>
      </QuestionSection>

      {/* Visual component here (if needed) */}

      <InteractionSection>
        {!showAnswer && (
          <>
            {!showHint && hint && (
              <HintButton onClick={() => setShowHint(true)}>
                Need a hint?
              </HintButton>
            )}

            {showHint && hint && <HintBox>{hint}</HintBox>}

            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="array"
                onCorrect={revealAnswer}
                onTryAnother={handleTryAnother}
                disabled={showAnswer}
                placeholder="Enter your answer"
              />
            </AnswerInputContainer>
          </>
        )}

        {showAnswer && explanation && (
          <ExplanationSection>
            <ExplanationText>{explanation}</ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default NewLesson;

// Styled Components
const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const QuestionSection = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const QuestionText = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
`;

const InteractionSection = styled.div`
  margin-top: 30px;
`;

const HintButton = styled.button`
  background: #edf2f7;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 16px;
  margin-bottom: 20px;
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const ExplanationSection = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 24px;
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #2d3748;
`;
```

---

## 📚 Additional Resources

### Core Documentation
- **Full Implementation Guide:** [`TANGENT_LESSON_IMPLEMENTATION_GUIDE.md`](./TANGENT_LESSON_IMPLEMENTATION_GUIDE.md)
- **Workflow Document:** [`/NEW_LESSON_WORKFLOW.md`](../../NEW_LESSON_WORKFLOW.md)

### Visual Design (CRITICAL for Geometry Lessons)
- **Visual Design Rules:** [`VISUAL_DESIGN_RULES.md`](./VISUAL_DESIGN_RULES.md) ⚠️
  - **Rule #1: Angle Indicators MUST Be Inside Triangle**
  - Examples of correct vs incorrect positioning
  - Implementation guide for Konva canvas
- **Visual Regression Testing:** [`VISUAL_REGRESSION_TEST_CHECKLIST.md`](./VISUAL_REGRESSION_TEST_CHECKLIST.md)
  - Systematic testing for all 8 triangle orientations
  - Edge case testing (extreme angles, sizes)
  - Screenshot comparison guide

### Testing
- **Testing Protocol:** [`LESSON_TESTING_PROTOCOL.md`](./LESSON_TESTING_PROTOCOL.md)
  - Phase-by-phase testing process
  - Visual verification requirements
  - Functional testing checklist

### Example Lessons
- **Basic Pattern:**
  - `src/features/lessons/lessonTypes/algebra/BasicProblemWordsOnly.js`
  - `src/features/lessons/lessonTypes/geometry/TriangleSum.js`
- **Geometry with Triangles:**
  - `src/features/lessons/lessonTypes/geometry/TangentLesson.jsx` ✓
  - `src/features/lessons/lessonTypes/geometry/MoreTangentLesson.jsx` ✓
  - `src/features/lessons/lessonTypes/geometry/PythagoreanTheorem.js`

---

## ⚡ One-Minute Checklist

**Before you start coding:**
1. ✅ Component uses `useLessonState()` hook
2. ✅ Component uses `<AnswerInput />` component
3. ✅ Component accepts only `triggerNewProblem` prop
4. ✅ Answers formatted as array
5. ✅ Dynamic sizing (not fixed)
6. ✅ Test edge cases (small/large values)
7. ✅ Screenshot visual changes
8. ✅ No console errors

**Follow this and avoid 90% of common bugs!** ✅

---

## 🔄 Advanced: Multi-Orientation Geometry Lessons
### Based on MoreTangentLesson (Feb 2026)

When creating geometry lessons with **rotated/flipped triangles** (8+ orientations):

#### ✅ Dynamic Arc Rotation (Interior Angles)

**Problem:** Hardcoded rotations fail for different orientations
**Solution:** Calculate dynamically based on triangle geometry

```javascript
// ✅ CORRECT - Dynamic calculation for ANY orientation
const adjacentAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
const hypotenuseAngle = Math.atan2(y3 - y1, x3 - x1) * (180 / Math.PI);

// Calculate angular difference and normalize to [-180, 180]
let angleDiff = hypotenuseAngle - adjacentAngle;
if (angleDiff > 180) angleDiff -= 360;
if (angleDiff < -180) angleDiff += 360;

// Determine rotation and sweep direction
let arcRotation, arcAngle;
if (angleDiff > 0) {
  arcRotation = adjacentAngle;
  arcAngle = angleDiff;
} else {
  arcRotation = hypotenuseAngle;
  arcAngle = -angleDiff;
}

<Arc rotation={arcRotation} angle={arcAngle} />

// ❌ WRONG - Hardcoded per orientation
if (orientation === 'bottom-left') arcRotation = 0;
else if (orientation === 'bottom-right') arcRotation = 180;
// ... fails for many cases
```

#### ✅ Dynamic Right Angle Square Positioning

```javascript
// ✅ CORRECT - Unit vectors for ANY orientation
const toAcuteX = x1 - x2;
const toAcuteY = y1 - y2;
const toAcuteLen = Math.sqrt(toAcuteX * toAcuteX + toAcuteY * toAcuteY);
const toAcuteUnitX = toAcuteX / toAcuteLen;
const toAcuteUnitY = toAcuteY / toAcuteLen;

const toThirdX = x3 - x2;
const toThirdY = y3 - y2;
const toThirdLen = Math.sqrt(toThirdX * toThirdX + toThirdY * toThirdY);
const toThirdUnitX = toThirdX / toThirdLen;
const toThirdUnitY = toThirdY / toThirdLen;

// Position square inside triangle
const corner2X = x2 + toAcuteUnitX * squareSize;
const corner2Y = y2 + toAcuteUnitY * squareSize;
// ... calculate other corners

// ❌ WRONG - Hardcoded offsets per orientation
if (orientation === 'bottom-left') {
  offsetX = 0;
  offsetY = -squareSize;
}
```

#### ✅ Preventing Skinny Triangles

**Problem:** Triangles drawn to scale can be very skinny (hard to see)
**Solution:** Normalize dimensions for visual appeal

```javascript
// ✅ CORRECT - Normalize for visual appeal
const MIN_SIDE = 100;  // Minimum display size
const MAX_SIDE = 180;  // Maximum display size
const MIN_RATIO = 0.5; // Prevent sides < 50% of each other

const ratio = Math.min(adjacent, opposite) / Math.max(adjacent, opposite);

if (ratio < MIN_RATIO) {
  // Triangle too skinny - normalize it
  if (adjacent > opposite) {
    displayAdjacent = MAX_SIDE;
    displayOpposite = Math.max(displayAdjacent * MIN_RATIO, MIN_SIDE);
  } else {
    displayOpposite = MAX_SIDE;
    displayAdjacent = Math.max(displayOpposite * MIN_RATIO, MIN_SIDE);
  }
}

// ❌ WRONG - Draw to exact scale
const scale = 15;
const displayAdjacent = adjacent * scale; // Can be very skinny!
const displayOpposite = opposite * scale;
```

#### ✅ Dynamic Side Label Positioning

**All orientations need labels outside the triangle:**

```javascript
// ✅ CORRECT - Perpendicular vectors for ANY orientation
const sideDx = x2 - x1;
const sideDy = y2 - y1;
const sideLen = Math.sqrt(sideDx * sideDx + sideDy * sideDy);

// Perpendicular vector (rotate 90° counterclockwise)
const perpX = -sideDy / sideLen;
const perpY = sideDx / sideLen;

// Test which direction points outside triangle
const testX = (x1 + x2) / 2 + perpX * 10;
const testY = (y1 + y2) / 2 + perpY * 10;
const distToOpposite = Math.sqrt((testX - x3) ** 2 + (testY - y3) ** 2);
const distMidToOpposite = Math.sqrt(((x1 + x2) / 2 - x3) ** 2 + ((y1 + y2) / 2 - y3) ** 2);

// Flip if pointing inward
const flip = distToOpposite < distMidToOpposite ? -1 : 1;

const labelX = (x1 + x2) / 2 + flip * perpX * 20;
const labelY = (y1 + y2) / 2 + flip * perpY * 20;
```

#### Testing Multi-Orientation Lessons

**Test ALL 8 orientations:**
- bottom-left, bottom-right, top-left, top-right
- left-bottom, left-top, right-bottom, right-top

**For each orientation verify:**
- [ ] Angle arc is INSIDE triangle
- [ ] Right angle square is INSIDE corner
- [ ] Side labels are OUTSIDE triangle
- [ ] Angle label doesn't overlap other elements
- [ ] Triangle fits within canvas bounds

**See:** `DYNAMIC_ANGLE_INDICATOR_SOLUTION.md` for complete algorithm

---

## 📱 iPad & Responsive Layout Optimization
### Key Learnings from More Tangent (Feb 2026)

**Goal:** All content (question, diagram, input) fits on iPad screen without scrolling

#### ✅ Canvas Size Reduction

```javascript
// ✅ CORRECT - Optimized for tablets
<RotatedTriangle width={500} height={300} />  // Was 600x400

// Adjust triangle rendering
const padding = 60;  // Was 80
const MIN_SIDE = 100;  // Was 120
const MAX_SIDE = 180;  // Was 220
```

#### ✅ Responsive Spacing with Media Queries

```javascript
const Wrapper = styled.div`
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 16px;  // Tablet
  }

  @media (max-width: 768px) {
    padding: 12px;  // Mobile
  }
`;

const QuestionText = styled.h2`
  font-size: 22px;

  @media (max-width: 1024px) {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;
```

#### ✅ Space-Saving Layout Changes

**Remove InstructionComponent:**
- Saves 80-120px vertical space
- Students see question/diagram immediately

**Move ProgressTracker to bottom:**
- Keeps focus on interactive elements
- Progress tracking below fold

**Hint button inline with header:**
```javascript
// ✅ Fixed positioning aligned with header
const TopHintButton = styled(HintButton)`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
  }
`;
```

#### iPad Compatibility Results

**Before:** ~850-950px vertical → requires scrolling
**After:** ~650-750px vertical → fits on iPad (768x1024)

**Key Targets:**
- iPad Portrait: 768x1024 (need <900px content)
- iPad Landscape: 1024x768 (need <700px content)

---

## 🎯 Progressive Difficulty Design
### Level Design Best Practices (MoreTangentLesson)

#### ✅ Color Coding Strategy

**Level 1: Single Color**
```javascript
// ✅ CORRECT - One colored side, student identifies it
const coloredSide = Math.random() < 0.5 ? 'opposite' : 'adjacent';
sides.opposite.color = coloredSide === 'opposite' ? '#EF4444' : '#666';
sides.adjacent.color = coloredSide === 'adjacent' ? '#EF4444' : '#666';

// Question: "Is the RED side the OPPOSITE or ADJACENT?"

// ❌ WRONG - Multiple colors (students memorize color=answer)
sides.opposite.color = '#EF4444';  // Red = opposite
sides.adjacent.color = '#3B82F6';  // Blue = adjacent
// Students learn "red = opposite" instead of the concept
```

#### ✅ Information Display Per Level

**Level 1:** Colored hints + angle value
**Level 2:** Side lengths + angle arc (no label/arrow on angle)
**Level 3:** One known side length + angle + "?" for unknown
**Level 4:** (Same as L3 with harder orientations)
**Level 5:** Both side lengths + angle arc with "?" label

```javascript
// Level 2 - Remove angle label to reduce clutter
angle: {
  value: angle,
  showValue: true,
  label: '',  // No label - arc is enough
}

// Level 3 - Show known side, hide unknown
sides: {
  opposite: {
    label: findSide === 'opposite' ? '?' : '',
    showLabel: true,
    showLength: findSide !== 'opposite',
  }
}

// Level 5 - Show arc with unknown angle
angle: {
  value: angle,  // For arc size
  showValue: true,
  label: '?',  // Indicates unknown
}
```

#### ✅ Orientation Difficulty Progression

```javascript
// Levels 1-2: Favor easier orientations (80%)
const easyOrientations = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
const challengingOrientations = ['left-bottom', 'left-top', 'right-bottom', 'right-top'];

if (level <= 2 && Math.random() < 0.8) {
  orientation = easyOrientations[Math.floor(Math.random() * easyOrientations.length)];
} else {
  // Levels 3-5: All orientations equally
  const allOrientations = [...easyOrientations, ...challengingOrientations];
  orientation = allOrientations[Math.floor(Math.random() * allOrientations.length)];
}
```

---

**Last Updated:** February 7, 2026
**Based on:** TangentLesson + MoreTangentLesson Implementation
