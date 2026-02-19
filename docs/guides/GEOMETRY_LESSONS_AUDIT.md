
# Geometry Lessons Layout Audit Report

**Audit Date:** 2026-02-16
**Reference Standard:** TangentLesson.jsx (5-section layout)
**Total Geometry Lessons Audited:** 19

---

## Summary Statistics

- **✅ COMPLIANT:** 2 lessons (10.5%)
- **⚠️ MINOR DEVIATIONS:** 0 lessons (0%)
- **❌ NON-COMPLIANT:** 17 lessons (89.5%)
  - **🔧 LEGACY PATTERNS:** ~12 lessons (estimated)
  - **❌ MISSING SECTIONS:** ~5 lessons (estimated)

---

## ✅ COMPLIANT LESSONS (2)

### 1. TangentLesson.jsx ✅
**Status:** REFERENCE STANDARD
**Location:** `/src/features/lessons/lessonTypes/geometry/TangentLesson.jsx`
**Analysis:**
- All 5 sections present and correctly styled
- TopHintButton: Fixed position (top: 15px, right: 20px, z-index: 100)
- QuestionSection: Centered with proper typography
- VisualSection: Light background (#f7fafc), rounded corners
- InteractionSection: Hint box + AnswerInput
- ExplanationSection: Green theme on answer reveal
- Uses useLessonState hook
- Responsive design with 3 breakpoints (768px, 1024px)

### 2. MoreTangentLesson.jsx ✅
**Status:** FULLY COMPLIANT
**Location:** `/src/features/lessons/lessonTypes/geometry/MoreTangentLesson.jsx`
**Analysis:**
- Perfect match with TangentLesson standard
- All sections present with identical styling
- Uses useLessonState hook
- Includes advanced RotatedTriangle component
- Responsive design matches standard

---

## ❌ NON-COMPLIANT LESSONS (17)

### Category 1: LEGACY PATTERNS (No Modern Hooks, Old State Management)

#### 3. Shapes.js 🔧
**Location:** `/src/features/lessons/lessonTypes/geometry/Shapes.js`
**Deviations:**
- ❌ Module-level state (lines 7-8: `numberSides`, `rotationAmount`)
- ❌ Uses old prop pattern (`answer`, `setAnswer` props)
- ❌ No useLessonState hook
- ❌ No TopHintButton
- ❌ No QuestionSection
- ❌ No VisualSection wrapper
- ❌ No InteractionSection
- ❌ No ExplanationSection
- ❌ "try problem" button pattern (legacy)
- ❌ Minimal wrapper styling

**Migration Complexity:** HIGH (complete rewrite needed)

#### 4. Symmetry.js 🔧
**Location:** `/src/features/lessons/lessonTypes/geometry/Symmetry.js`
**Deviations:**
- ❌ No useLessonState hook (local `showAnswer` state)
- ❌ No TopHintButton
- ❌ No QuestionSection (instruction text inline in Konva)
- ❌ No VisualSection wrapper
- ❌ No InteractionSection
- ❌ No ExplanationSection
- ❌ "New Problem" button pattern instead of modern flow
- ❌ Legacy answer checking pattern

**Migration Complexity:** HIGH

#### 5. Translation.js 🔧
**Location:** `/src/features/lessons/lessonTypes/geometry/Translation.js`
**Deviations:**
- ❌ Module-level state (lines 11-14: `PointX`, `PointY`, `OriginH`, `OriginV`)
- ❌ No useLessonState hook
- ❌ No TopHintButton
- ❌ No QuestionSection
- ❌ No VisualSection wrapper
- ❌ No InteractionSection
- ❌ No ExplanationSection
- ❌ "Reset Graph" button pattern
- ⚠️ Has comment "//not really working yet" (lines 196-209)

**Migration Complexity:** HIGH

#### 6. Dilation.js 🔧
**Location:** `/src/features/lessons/lessonTypes/geometry/Dilation.js`
**Deviations:**
- ❌ Module-level state (lines 11-14)
- ❌ Similar patterns to Translation.js
- ❌ No modern sections
- ❌ No useLessonState hook

**Migration Complexity:** HIGH

#### 7. CompositeShape.js 🔧
**Location:** `/src/features/lessons/lessonTypes/geometry/CompositeShape.js`
**Deviations:**
- ❌ Uses old prop pattern (`showAnswer`, `newProblem`, `seeAnswer` props)
- ❌ No useLessonState hook
- ❌ No TopHintButton
- ❌ No QuestionSection (instruction text inline: line 66)
- ❌ No VisualSection wrapper
- ❌ No distinct InteractionSection
- ❌ No ExplanationSection
- ❌ AnswerInput directly in minimal wrapper

**Migration Complexity:** MEDIUM-HIGH

#### 8. Reflection.js 🔧
**Location:** `/src/features/lessons/lessonTypes/geometry/Reflection.js`
**Status:** Recently migrated from module-level state (task-109), but layout not updated
**Deviations:**
- ⚠️ Uses useLessonState hook (recently added) ✓
- ❌ No TopHintButton
- ❌ No QuestionSection
- ❌ No VisualSection wrapper
- ❌ No InteractionSection
- ❌ No ExplanationSection
- ❌ Minimal layout structure

**Migration Complexity:** MEDIUM (hooks already in place, needs layout sections)

### Category 2: MISSING MODERN SECTIONS (Uses Some Modern Patterns)

#### 9. TriangleSum.js ❌
**Location:** `/src/features/lessons/lessonTypes/geometry/TriangleSum.js`
**Deviations:**
- ⚠️ Uses useLessonState hook ✓
- ⚠️ Uses useWindowDimensions hook ✓
- ❌ No TopHintButton (no hint functionality)
- ❌ No QuestionSection (no question text display)
- ❌ No VisualSection container (Konva Stage directly in component)
- ❌ No distinct InteractionSection
- ❌ No ExplanationSection (no explanation on answer reveal)
- ❌ AnswerInput directly in minimal wrapper
- ❌ Minimal wrapper styling (`const Wrapper = styled.div``;`)

**Migration Complexity:** MEDIUM (modern hooks present, needs section structure)

#### 10. PythagoreanTheorem.js ❌
**Location:** `/src/features/lessons/lessonTypes/geometry/PythagoreanTheorem.js`
**Status:** Recently modified (useWindowDimensions added to sub-components)
**Preliminary Analysis:** Likely similar to TriangleSum.js pattern

**Migration Complexity:** MEDIUM (estimated)

#### 11. InverseTrig.jsx ❌
**Location:** `/src/features/lessons/lessonTypes/geometry/InverseTrig.jsx`
**Status:** Recently modified (useWindowDimensions added to sub-components)
**Preliminary Analysis:** Large file (noted in system reminder), likely complex migration

**Migration Complexity:** HIGH (estimated - large file)

### Category 3: NOT YET AUDITED (12 files)

The following geometry lessons have not been read yet and need audit:

12. Tangent.js
13. TangentMultiple.js
14. CompositeShape2.js
15. CompositeShape3.js
16. Symmetry2.js
17. TriangleInequality.js
18. ReflectionSymmetry.js
19. RotationalSymmetry.js
20. SlopeTriangles.js
21. Proportions.js
22. GenericShape.js

---

## Common Deviation Patterns Found

### 1. Module-Level State ⚠️
**Files Affected:** Shapes.js, Translation.js, Dilation.js, (Reflection.js - fixed)
**Pattern:**
```javascript
let numberSides = Math.floor(Math.random() * 7) + 3;
let rotationAmount = 360 / (4 * numberSides);
```
**Issue:** State persists across component instances, causes bugs
**Fix:** Migrate to useState with lazy initializers

### 2. Legacy Prop Patterns 🔧
**Files Affected:** Shapes.js, CompositeShape.js
**Pattern:**
```javascript
function Lesson(props) {
  const { answer, setAnswer, showAnswer, newProblem, seeAnswer } = props;
```
**Issue:** Uses parent-managed state instead of useLessonState hook
**Fix:** Migrate to useLessonState hook

### 3. Missing Section Structure ❌
**Files Affected:** ALL non-compliant lessons
**Pattern:** Direct rendering without semantic sections
```javascript
<Wrapper>
  <div className="practice-container">
    <AnswerInput ... />
    <Stage ... />
  </div>
</Wrapper>
```
**Fix:** Wrap content in 5-section structure (QuestionSection, VisualSection, etc.)

### 4. Inline Instructions 📝
**Files Affected:** CompositeShape.js, Symmetry.js
**Pattern:**
```javascript
<Text
  text={`slide the rectangle to make x = ${randomNums[1]}`}
  fontSize={40}
/>
```
**Issue:** Question text embedded in visual instead of QuestionSection
**Fix:** Extract to QuestionSection component

### 5. Legacy Button Patterns 🔧
**Files Affected:** Shapes.js, Symmetry.js, Translation.js
**Pattern:**
```javascript
<button onClick={handlePractice}>try problem</button>
<button onClick={newShape}>Try another shape</button>
<button onClick={newGrid}>Reset Graph</button>
```
**Issue:** Custom buttons instead of AnswerInput component flow
**Fix:** Integrate with AnswerInput onTryAnother callback

---

## Migration Priority Recommendations

### HIGH PRIORITY (Quick Wins - Modern Hooks Already Present)
1. **TriangleSum.js** - Has hooks, just needs section structure
2. **Reflection.js** - Recently fixed, hooks in place
3. **PythagoreanTheorem.js** - Modern patterns, needs layout
4. **InverseTrig.jsx** - Modern patterns (if confirmed)

### MEDIUM PRIORITY (Partial Modern Patterns)
5. **CompositeShape.js** - Uses AnswerInput, needs hook migration + sections

### LOW PRIORITY (Complete Legacy Rewrites)
6. **Shapes.js** - Complete rewrite needed
7. **Symmetry.js** - Complete rewrite needed
8. **Translation.js** - Complete rewrite needed
9. **Dilation.js** - Complete rewrite needed
10. **CompositeShape2.js** - Unknown (needs audit)
11. **CompositeShape3.js** - Unknown (needs audit)
12. **Symmetry2.js** - Unknown (needs audit)

### AUDIT REQUIRED (Unknown Complexity)
- Tangent.js
- TangentMultiple.js
- TriangleInequality.js
- ReflectionSymmetry.js
- RotationalSymmetry.js
- SlopeTriangles.js
- Proportions.js
- GenericShape.js

---

## Next Steps

1. ✅ Complete audit of remaining 12 geometry lessons
2. 🔲 Audit angles lessons (7 files)
3. 🔲 Audit algebra lessons (12 files)
4. 🔲 Audit graphing lessons (1 file)
5. 🔲 Audit image lessons (4 files)
6. 🔲 Create comprehensive migration plan
7. 🔲 Begin migration starting with HIGH PRIORITY lessons

---

## Audit Notes

- The two compliant lessons (TangentLesson.jsx and MoreTangentLesson.jsx) are both recent tangent-related lessons, suggesting they were built to the new standard
- The majority of geometry lessons use legacy patterns from before the useLessonState hook was created
- Several lessons have module-level state that was identified in task-108/task-109 but not yet migrated
- Many lessons lack any hint/explanation functionality entirely
- Some lessons have inline comments suggesting they're not fully functional ("not really working yet")
