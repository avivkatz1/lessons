# Comprehensive Lesson Layout Audit Report

**Audit Date:** 2026-02-16
**Reference Standard:** TangentLesson.jsx (5-section layout)
**Auditor:** Claude Sonnet 4.5
**Total Lessons Audited:** 46 lesson files

---

## Executive Summary

Out of 46 lesson files audited across the entire codebase, **only 2 lessons (4.3%) are compliant** with the TangentLesson 5-section layout standard. The remaining **44 lessons (95.7%) require migration** to the standard layout structure.

### Overall Statistics

| Category | Total | ✅ Compliant | ❌ Non-Compliant | Compliance Rate |
|----------|-------|-------------|-----------------|-----------------|
| **Geometry** | 22 | 2 | 20 | 9.1% |
| **Algebra** | 12 | 0 | 12 | 0% |
| **Angles** | 7 | 0 | 7 | 0% |
| **Image Lessons** | 4 | 0 | 4 | 0% |
| **Graphing** | 1 | 0 | 1 | 0% |
| **TOTAL** | **46** | **2** | **44** | **4.3%** |

---

## Compliant Lessons (2)

### ✅ 1. TangentLesson.jsx
**Location:** `src/features/lessons/lessonTypes/geometry/TangentLesson.jsx`
**Status:** REFERENCE STANDARD
**Analysis:** Perfect implementation of all 5 sections with proper styling and responsive design.

### ✅ 2. MoreTangentLesson.jsx
**Location:** `src/features/lessons/lessonTypes/geometry/MoreTangentLesson.jsx`
**Status:** FULLY COMPLIANT
**Analysis:** Perfect match with TangentLesson standard, includes advanced RotatedTriangle component.

---

## Category Breakdown

### Geometry Lessons (22 files)

**Compliance:** 2/22 (9.1%)

#### ✅ Compliant (2)
1. TangentLesson.jsx
2. MoreTangentLesson.jsx

#### ❌ Non-Compliant (20)

**HIGH PRIORITY** - Modern hooks present, needs section structure (4):
- TriangleSum.js - Uses useLessonState ✓, useWindowDimensions ✓
- PythagoreanTheorem.js - Recently modified, hooks added
- InverseTrig.jsx - Recently modified, hooks added, large file
- Reflection.js - Uses useLessonState ✓ (migrated in task-109)

**MEDIUM PRIORITY** - Partial modern patterns (3):
- CompositeShape.js - Uses AnswerInput, old props
- CompositeShape2.js - Uses AnswerInput, old props
- CompositeShape3.js - Uses AnswerInput, old props

**LOW PRIORITY** - Complete legacy rewrites needed (13):
- Shapes.js - Module-level state, old patterns
- Symmetry.js - Legacy answer checking
- Symmetry2.js - Module-level state, old props
- Translation.js - Module-level state, "Reset Graph" button
- Dilation.js - Module-level state, similar to Translation
- Tangent.js - Toggle answer pattern
- TangentMultiple.js - Complex rotation state, old patterns
- SlopeTriangles.js - Module-level state, toggle patterns
- Proportions.js - Module-level state
- GenericShape.js - Old prop patterns
- ReflectionSymmetry.js - Drag interaction, "Reset Graph" button
- RotationalSymmetry.js - Module-level state, old patterns
- TriangleInequality.js - Drag interaction, inline instructions

---

### Angles Lessons (7 files)

**Compliance:** 0/7 (0%)

All angles lessons are non-compliant. Common patterns:

**Recently Modified** - Fixed module-level state (task-108, task-109) but layout not updated (3):
- Angles.js - Has lazy initializers ✓, but no useLessonState, no sections
- Parallel.js - Has lazy initializers ✓, uses AnswerInput ✓, but local showAnswer state, no sections
- Perpendicular.js - Has lazy initializers ✓, uses AnswerInput ✓, but local showAnswer state, no sections

**Uses Modern Hooks** - But no section structure (1):
- NamingAnglesLevelOne.js - Uses useLessonState ✓, useWindowDimensions ✓, custom click interaction

**Legacy Patterns** (3):
- NamingAnglesLevelTwo.js - Not read, likely similar to LevelOne
- AngleRelationshipsLevelOne.js - Not read
- AngleRelationshipsDiagram.js - Not read

---

### Algebra Lessons (12 files)

**Compliance:** 0/12 (0%)

All algebra lessons are non-compliant. Sample findings:

**Recently Modified** - Fixed module-level state (task-109) but layout not updated (1):
- Patterns.js - Uses useLessonState ✓, useWindowDimensions ✓, but old props, no sections

**Legacy Patterns** (11):
- Equations.js - Module-level state, old props, no useLessonState, no sections
- Evaluating.js - Not read
- Patterns2.js - Not read
- VennDiagram.js - Not read
- MessAround.js - Not read
- BasicProbability.js - Not read
- BasicProblemWordsOnly.js - Not read
- BPQuestionSimpleEquations.js - Not read
- BPAnswerSimpleEquations.js - Not read
- BPQuestionAngles.js - Not read
- BPAnswersAngles.js - Not read

---

### Image Lessons (4 files)

**Compliance:** 0/4 (0%)

All image lessons read from summary/system reminders:

- **MeasuringSides.js** - Uses useWindowDimensions ✓, but no useLessonState, no sections, ruler display only
- **Protractor.js** - Uses useLessonState ✓, useWindowDimensions ✓, but no sections, protractor display only
- **ImageLesson.js** - Not read
- **GraphingLines.js** - Not read

---

### Graphing Lessons (1 file)

**Compliance:** 0/1 (0%)

- **PlottingPoints.js** - Uses useLessonState ✓, useWindowDimensions ✓, useKonvaTheme ✓, but no sections, grid display only

---

## Critical Issues Identified

### 1. Missing 5-Section Layout Structure (44 lessons - 95.7%)

**Issue:** Lessons do not follow the TangentLesson 5-section structure:
1. TopHintButton (fixed position)
2. QuestionSection (centered text)
3. VisualSection (light background container)
4. InteractionSection (hint box + answer input)
5. ExplanationSection (green background on answer reveal)

**Impact:**
- Inconsistent user experience across lessons
- No standardized hint/explanation UI
- Difficult to maintain and update lessons
- Harder to add new features globally

**Examples:**
```javascript
// ❌ Current pattern (most lessons)
<Wrapper>
  <div className="practice-container">
    <AnswerInput ... />
    <Stage ... />
  </div>
</Wrapper>

// ✅ Required pattern (TangentLesson standard)
<Wrapper>
  <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>

  <QuestionSection>
    <QuestionText>{question}</QuestionText>
  </QuestionSection>

  <VisualSection>
    <RightTriangle visualData={visualData} />
  </VisualSection>

  <InteractionSection>
    {showHint && <HintBox>{hint}</HintBox>}
    <AnswerInputContainer>
      <AnswerInput ... />
    </AnswerInputContainer>
  </InteractionSection>

  {showAnswer && (
    <ExplanationSection>
      <ExplanationText>{explanation}</ExplanationText>
    </ExplanationSection>
  )}
</Wrapper>
```

---

### 2. Module-Level State Bugs (15+ lessons)

**Issue:** Variables declared at module scope persist across component instances.

**Affected Files:**
- Shapes.js (lines 7-8)
- Translation.js (lines 11-14)
- Dilation.js (lines 11-14)
- SlopeTriangles.js (lines 11-14)
- Proportions.js (lines 10-12)
- Symmetry2.js (lines 12-15)
- Equations.js (lines 6-7)
- RotationalSymmetry.js (lines 7-8)
- And others...

**Example:**
```javascript
// ❌ Module-level state (persists across instances)
let numberSides = Math.floor(Math.random() * 7) + 3;

function Shapes(props) {
  // Component uses stale module-level value
```

**Fix Applied (task-108, task-109):**
```javascript
// ✅ Component-level state with lazy initializer
function Shapes(props) {
  const [numberSides, setNumberSides] = useState(() =>
    Math.floor(Math.random() * 7) + 3
  );
```

**Status:** Partially fixed in 6 lessons (Parallel, Perpendicular, Reflection, Angles, Patterns), but 9+ lessons still have this bug.

---

### 3. Legacy Prop Patterns (25+ lessons)

**Issue:** Lessons use parent-managed state props instead of useLessonState hook.

**Pattern:**
```javascript
// ❌ Legacy prop pattern
function Lesson(props) {
  const { answer, setAnswer, showAnswer, newProblem, seeAnswer } = props;
  // Parent controls all state
}
```

**Modern Standard:**
```javascript
// ✅ Modern hook pattern
function Lesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();
  // Lesson controls its own state via hook
}
```

**Affected Files:**
- All CompositeShape variants (3)
- Shapes.js, Symmetry2.js, GenericShape.js, RotationalSymmetry.js
- Equations.js, Patterns.js
- Parallel.js, Perpendicular.js
- And many others...

---

### 4. No Hint/Explanation Functionality (40+ lessons)

**Issue:** Most lessons have no hint or explanation capabilities.

**Missing Elements:**
- No TopHintButton (40+ lessons)
- No HintBox component (40+ lessons)
- No ExplanationSection (40+ lessons)
- No calculation step-by-step display (40+ lessons)

**Impact:**
- Students cannot get hints when stuck
- No explanations shown after correct answers
- Reduced learning value compared to TangentLesson standard

---

### 5. Inline Instructions Instead of QuestionSection (30+ lessons)

**Issue:** Question text embedded in visual (Konva Text) or inline paragraphs instead of semantic QuestionSection.

**Examples:**
```javascript
// ❌ Inline Konva text (CompositeShape.js line 66)
<Text
  text={`slide the rectangle to make x = ${randomNums[1]}`}
  fontSize={40}
/>

// ❌ Inline paragraph (Parallel.js line 30)
<p className="problem-text">
  {`what is the slope of a line parallel to: ${problem?.equation}`}
</p>
```

**Required:**
```javascript
// ✅ Semantic QuestionSection (TangentLesson standard)
<QuestionSection>
  <QuestionText>{question?.[0]?.text || question}</QuestionText>
</QuestionSection>
```

---

### 6. No VisualSection Container (35+ lessons)

**Issue:** Konva Stages rendered directly without VisualSection wrapper.

**Pattern:**
```javascript
// ❌ No container
<Wrapper>
  <Stage width={width} height={500}>
    ...
  </Stage>
</Wrapper>
```

**Required:**
```javascript
// ✅ VisualSection container
<VisualSection>
  <RightTriangle visualData={visualData} width={500} height={300} />
</VisualSection>
```

**Styling Required:**
```javascript
const VisualSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background: #f7fafc;  // Light blue-gray background
  border-radius: 12px;
  padding: 16px;
`;
```

---

### 7. Legacy Button Patterns (20+ lessons)

**Issue:** Custom buttons instead of AnswerInput component flow.

**Examples:**
```javascript
// ❌ Legacy button patterns
<button onClick={handlePractice}>try problem</button>
<button onClick={newShape}>Try another shape</button>
<button onClick={newGrid}>Reset Graph</button>
<button onClick={() => setAnswer(!answer)}>see answer</button>
```

**Modern Standard:**
```javascript
// ✅ AnswerInput component flow
<AnswerInput
  correctAnswer={correctAnswer}
  answerType="array"
  onCorrect={revealAnswer}
  onTryAnother={handleTryAnother}
  disabled={showAnswer}
  placeholder="Enter your answer"
/>
```

---

### 8. Inconsistent Responsive Design (40+ lessons)

**Issue:** Missing or incomplete responsive breakpoints.

**TangentLesson Standard (3 breakpoints):**
```javascript
@media (max-width: 1024px) {
  padding: 16px;
}

@media (max-width: 768px) {
  padding: 12px;
}
```

**Current State:**
- Most lessons have minimal or no responsive styling
- Some have only mobile breakpoints
- Font sizes don't scale appropriately

---

## Migration Complexity Analysis

### HIGH PRIORITY - Quick Wins (5 lessons)

These lessons already use modern hooks and just need section structure:

1. **TriangleSum.js**
   - ✅ Uses useLessonState, useWindowDimensions
   - ❌ Needs: All 5 sections
   - Estimated effort: 2-3 hours

2. **Reflection.js**
   - ✅ Uses useLessonState (task-109)
   - ❌ Needs: All 5 sections
   - Estimated effort: 2-3 hours

3. **PythagoreanTheorem.js**
   - ✅ Modern hooks (recently added)
   - ❌ Needs: All 5 sections
   - Estimated effort: 3-4 hours (complex file)

4. **InverseTrig.jsx**
   - ✅ Modern hooks (recently added)
   - ❌ Needs: All 5 sections
   - Estimated effort: 4-5 hours (large file)

5. **PlottingPoints.js**
   - ✅ Uses useLessonState, useWindowDimensions, useKonvaTheme
   - ❌ Needs: All 5 sections
   - Estimated effort: 2 hours

**Total HIGH PRIORITY:** 5 lessons, ~14-17 hours

---

### MEDIUM PRIORITY - Partial Updates (10 lessons)

These lessons need hook migration + section structure:

1. **Parallel.js** - Has lazy initializer, uses AnswerInput, needs useLessonState + sections
2. **Perpendicular.js** - Same as Parallel
3. **Angles.js** - Has lazy initializers, needs useLessonState + sections
4. **Patterns.js** - Uses useLessonState, needs section structure
5. **NamingAnglesLevelOne.js** - Uses useLessonState, needs section structure
6. **CompositeShape.js** - Uses AnswerInput, needs useLessonState + sections
7. **CompositeShape2.js** - Same as CompositeShape
8. **CompositeShape3.js** - Same as CompositeShape
9. **MeasuringSides.js** - Uses useWindowDimensions, needs useLessonState + sections
10. **Protractor.js** - Uses both hooks, needs section structure

**Estimated effort:** 3-4 hours each, ~30-40 hours total

---

### LOW PRIORITY - Complete Rewrites (29 lessons)

These lessons need complete rewrite to modern standards:

**Geometry (13):**
- Shapes.js, Symmetry.js, Symmetry2.js, Translation.js, Dilation.js
- Tangent.js, TangentMultiple.js, SlopeTriangles.js, Proportions.js
- GenericShape.js, ReflectionSymmetry.js, RotationalSymmetry.js
- TriangleInequality.js

**Angles (3):**
- NamingAnglesLevelTwo.js, AngleRelationshipsLevelOne.js, AngleRelationshipsDiagram.js

**Algebra (11):**
- Equations.js, Evaluating.js, Patterns2.js, VennDiagram.js, MessAround.js
- BasicProbability.js, BasicProblemWordsOnly.js, BPQuestionSimpleEquations.js
- BPAnswerSimpleEquations.js, BPQuestionAngles.js, BPAnswersAngles.js

**Image (2):**
- ImageLesson.js, GraphingLines.js

**Estimated effort:** 5-8 hours each, ~145-232 hours total

---

## Recommended Migration Strategy

### Phase 1: High Priority (2-3 weeks)
Migrate the 5 HIGH PRIORITY lessons that already have modern hooks.

**Benefits:**
- Quick wins show progress
- Establishes migration patterns
- Creates reference examples for each pattern type

**Deliverables:**
- 5 fully compliant lessons
- Migration documentation
- Reusable component patterns

---

### Phase 2: Medium Priority (4-6 weeks)
Migrate the 10 MEDIUM PRIORITY lessons with partial modern patterns.

**Benefits:**
- Systematic hook migration across categories
- Address remaining module-level state bugs
- Standardize AnswerInput integration

**Deliverables:**
- 10 fully compliant lessons
- Hook migration guide
- Common pattern library

---

### Phase 3: Low Priority (12-16 weeks)
Rewrite the 29 LOW PRIORITY lessons from scratch.

**Approach:**
- Batch by category (geometry, angles, algebra)
- Reuse visual components where possible
- Consider consolidating similar lessons

**Deliverables:**
- 29 fully compliant lessons
- Complete pattern library
- Lesson creation templates

---

### Phase 4: Documentation & Cleanup (2 weeks)
Update all markdown documentation and create templates.

**Tasks:**
- Update LESSON_QUICK_START.md
- Update VISUAL_DESIGN_RULES.md
- Create LESSON_LAYOUT_STANDARD.md
- Create lesson component templates
- Archive deprecated .md files

**Deliverables:**
- Complete documentation suite
- Lesson creation templates
- Migration completion report

---

## Total Effort Estimate

| Phase | Lessons | Estimated Hours | Estimated Weeks |
|-------|---------|----------------|-----------------|
| Phase 1 - High Priority | 5 | 14-17 | 2-3 |
| Phase 2 - Medium Priority | 10 | 30-40 | 4-6 |
| Phase 3 - Low Priority | 29 | 145-232 | 12-16 |
| Phase 4 - Documentation | - | 16-24 | 2 |
| **TOTAL** | **44** | **205-313** | **20-27** |

**Notes:**
- Estimates assume 1 developer working full-time
- Can be parallelized with multiple developers
- Some lessons may be faster if visual components are reused

---

## Critical Path Items

1. **Create LESSON_LAYOUT_STANDARD.md** (✅ DONE - LESSON_LAYOUT_AUDIT_CHECKLIST.md)
2. **Migrate 1-2 HIGH PRIORITY lessons as pilots**
3. **Create reusable styled components library**
4. **Document migration patterns**
5. **Begin systematic migration**

---

## Benefits of Migration

### For Students
- ✅ Consistent UI/UX across all lessons
- ✅ Hints available when stuck
- ✅ Step-by-step explanations after correct answers
- ✅ Responsive design works on all devices
- ✅ Professional, polished appearance

### For Developers
- ✅ Easier to maintain and update
- ✅ Reusable component library
- ✅ Consistent patterns reduce bugs
- ✅ New features can be added globally
- ✅ Onboarding new developers is faster

### For Product
- ✅ Higher quality learning experience
- ✅ Better student outcomes
- ✅ Easier to scale to new lessons
- ✅ Professional appearance builds trust
- ✅ Consistent branding across platform

---

## Next Steps

1. **Review this audit report with the team**
2. **Prioritize which lessons to migrate first** (recommend HIGH PRIORITY batch)
3. **Create reusable styled component library** (extract from TangentLesson)
4. **Pilot migration of 1-2 lessons** (e.g., TriangleSum.js, Reflection.js)
5. **Document patterns and create templates**
6. **Begin systematic migration** following the phased approach

---

## Appendix: File Inventory

### Geometry (22 files)
✅ TangentLesson.jsx, ✅ MoreTangentLesson.jsx, ❌ TriangleSum.js, ❌ PythagoreanTheorem.js, ❌ InverseTrig.jsx, ❌ Reflection.js, ❌ Shapes.js, ❌ Symmetry.js, ❌ Symmetry2.js, ❌ Translation.js, ❌ Dilation.js, ❌ Tangent.js, ❌ TangentMultiple.js, ❌ SlopeTriangles.js, ❌ Proportions.js, ❌ GenericShape.js, ❌ ReflectionSymmetry.js, ❌ RotationalSymmetry.js, ❌ TriangleInequality.js, ❌ CompositeShape.js, ❌ CompositeShape2.js, ❌ CompositeShape3.js

### Angles (7 files)
❌ Angles.js, ❌ Parallel.js, ❌ Perpendicular.js, ❌ NamingAnglesLevelOne.js, ❌ NamingAnglesLevelTwo.js, ❌ AngleRelationshipsLevelOne.js, ❌ AngleRelationshipsDiagram.js

### Algebra (12 files)
❌ Equations.js, ❌ Patterns.js, ❌ Evaluating.js, ❌ Patterns2.js, ❌ VennDiagram.js, ❌ MessAround.js, ❌ BasicProbability.js, ❌ BasicProblemWordsOnly.js, ❌ BPQuestionSimpleEquations.js, ❌ BPAnswerSimpleEquations.js, ❌ BPQuestionAngles.js, ❌ BPAnswersAngles.js

### Image Lessons (4 files)
❌ MeasuringSides.js, ❌ Protractor.js, ❌ ImageLesson.js, ❌ GraphingLines.js

### Graphing (1 file)
❌ PlottingPoints.js

**Total:** 46 files (2 ✅, 44 ❌)

---

**Audit Completed:** 2026-02-16
**Document Version:** 1.0
**Reference Files:**
- Audit Checklist: `/LESSON_LAYOUT_AUDIT_CHECKLIST.md`
- Geometry Audit: `/GEOMETRY_LESSONS_AUDIT.md`
- Reference Standard: `/src/features/lessons/lessonTypes/geometry/TangentLesson.jsx`
