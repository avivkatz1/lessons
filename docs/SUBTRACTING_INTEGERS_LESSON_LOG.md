# Subtracting Integers Lesson - Development Log

**Date**: February 24, 2026
**Lesson**: Subtracting Integers with Interactive "Keep, Change, Change" Method
**Purpose**: Document all changes, issues, and solutions for future lesson development

---

## Table of Contents

1. [Initial Requirements](#initial-requirements)
2. [Design Decisions](#design-decisions)
3. [Implementation Timeline](#implementation-timeline)
4. [Issues Encountered & Solutions](#issues-encountered--solutions)
5. [Key Learnings](#key-learnings)
6. [Final Implementation Details](#final-implementation-details)

---

## Initial Requirements

### User Request
Create a subtracting integers lesson with:
- **Level 1**: Visual demonstration of "Keep, Change, Change" (KCC) method
  - First integer: Keep it the same
  - Minus sign: Change to plus (with marker stroke)
  - Second integer: Change to opposite sign (with marker stroke)
- **Marker tool available** for students to manually perform the transformation
- **Other levels**: User unsure, but needs word problems at end
- **Must read conversations** about adding_integers to apply lessons learned

### Design Choices Made

**Level Structure:**
- L1: Keep Change Change (Positive - Positive)
- L2: Subtracting Negatives (Positive - Negative)
- L3: Negative Minus Positive
- L4: Negative Minus Negative (trickiest case)
- L5: Word Problems (real-world applications)

---

## Design Decisions

### 1. Interactive vs Automatic Visualization

**Initial Approach**: Show automatic 4-step transformation
- Step 1: Original problem
- Step 2: Change minus to plus (marker stroke 1)
- Step 3: Change sign (marker stroke 2)
- Step 4: Final result

**Changed To**: Interactive drawing canvas (like Symmetry lesson)
- Show only the original problem
- Students manually draw marker strokes
- Provides hands-on learning experience

**Rationale**: More engaging, helps students internalize the method by doing it themselves

### 2. Canvas Layout Pattern

**Decision**: Match Symmetry Level 1 structure
- Clean, centered canvas
- Drawing tools as buttons below canvas (not floating)
- Consistent with existing lesson patterns

---

## Implementation Timeline

### Phase 1: Backend Setup (✅ Complete)

**Files Created:**
1. `subtractingIntegersGenerator.js` - Question generator with 5 levels
2. `subtracting_integers.config.js` - Lesson configuration
3. Backend registration in:
   - `lessonProcessors/index.js` (3 locations)
   - `lessonConfigs/index.js` (import + registry)
   - `getLessonDataInitial.js` (hints + components)

**Key Point**: Applied lesson from adding_integers - included `numbersReturned` field from the start to pass validation.

### Phase 2: Frontend Setup (✅ Complete)

**Files Created:**
1. `SubtractingIntegersLesson.jsx` - Main component with interactive canvas
2. Registration in:
   - `algebra/index.js`
   - `DataLesson.js` (lazy loading)

**Initial Implementation**:
- Konva canvas for drawing
- Automatic 4-step KCC visualization
- Red marker strokes and green transformations

### Phase 3: Iterative Improvements (✅ Complete)

Major changes based on user feedback...

---

## Issues Encountered & Solutions

### Issue 1: Font Size Too Small
**Problem**: Numbers difficult to read
**Solution**: Increased font sizes:
- Labels: 14 → 16
- Original: 20 → 32
- Step 2: 18 → 28
- Step 3: 20 → 32
- Result: 22 → 36
- Marker +: 24 → 32

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

### Issue 2: Dark Mode Visibility
**Problem**: Black text invisible in dark mode
**Solution**: Changed to theme-aware colors:
- `textPrimary` → `adjacent` (bright, visible color)
- `textSecondary` → `opposite` (high contrast)
- Green `#10B981` (already bright)
- Result uses `angle` (theme-aware)

**Key Learning**: Always use theme colors (konvaTheme.adjacent, konvaTheme.opposite) instead of hardcoded black/white for canvas text.

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

### Issue 3: Design Pattern Mismatch
**Problem**: Drawing tools as separate buttons above canvas didn't match app pattern
**Solution**: Restructured to match Symmetry Level 1:
- Canvas displayed centered without wrapper
- Tool buttons (Marker, Eraser, Clear) below canvas
- Clean ButtonContainer layout

**Key Learning**: Always check existing lessons for established patterns before implementing new UI.

**Files Changed**:
- `SubtractingIntegersLesson.jsx` - Complete restructure
- Replaced `DrawingTools` → `ButtonContainer`
- Added `VisualSection`, `ToolButton`, `ActionButton` styled components

---

### Issue 4: Positioning - "50 pixels to the left"
**Problem**: User wanted expression shifted 50px left
**Initial Fix**: `problemX = 50`

**Then Changed**: User wanted it back in center
**Final Fix**: `problemX = width / 2 - 100`

**Key Learning**: Be prepared for design iteration. Position calculations may need multiple adjustments.

---

### Issue 5: Expression Size and Centering
**Problem**: Expression not big enough and not centered
**Solution**:
- Font size: 48px → **72px**
- Position: Back to center of canvas
- Y-offset adjusted: -20 → -35

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

### Issue 6: Clear Drawing Button Not Working
**Problem**: Clear button didn't actually clear drawings
**Root Cause**: Incorrect callback mechanism using `useState`
- `setState` with a function treats it as updater function, not stored value

**Solution 1 (Failed)**: `setClearDrawingFn(() => setLines([]))`
**Solution 2 (Failed)**: `setClearDrawingFn(() => () => setLines([]))`
**Solution 3 (Success)**: Used `useRef` + `useImperativeHandle`

```javascript
// Child component
React.useImperativeHandle(onClearDrawing, () => ({
  clear: () => setLines([])
}), []);

// Parent component
const clearDrawingRef = React.useRef(null);

const handleClearDrawing = () => {
  if (clearDrawingRef.current) {
    clearDrawingRef.current.clear();
  }
};
```

**Key Learning**: When exposing child methods to parent in React:
- ❌ Don't use `useState` for function references
- ✅ Use `useRef` + `useImperativeHandle`

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

### Issue 7: Eraser Drawing Black Marks
**Problem**: Eraser tool drew black marks instead of erasing
**Root Cause**: Stroke color was `konvaTheme.canvasBackground` which might be dark

**Solution**:
- Changed stroke to white `#FFFFFF`
- Increased width: 20 → 30
- Kept `globalCompositeOperation: 'destination-out'`

**Key Learning**: For eraser with `destination-out`, use white stroke with thicker width for better visibility.

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

### Issue 8: Drawing Not Clearing After Submit
**Problem**: Drawing persisted after correct answer or "Try Another"
**Solution**: Added clear calls to:
1. `handleCorrectAnswer()` - New handler that clears before revealing answer
2. `handleTryAnother()` - Already existed, added clear call

```javascript
const handleCorrectAnswer = () => {
  if (clearDrawingRef.current) {
    clearDrawingRef.current.clear();
  }
  revealAnswer();
};
```

**Key Learning**: Track all user actions that should reset the canvas state.

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

### Issue 9: Plain Text Not Clean Enough
**Problem**: Canvas text didn't look professional
**Solution**: Integrated KaTeX for mathematical typography

**Implementation**:
1. Removed Konva `Text` component (can't use KaTeX directly)
2. Added HTML overlay with KaTeX rendering
3. Positioned absolutely on top of canvas

```javascript
// KaTeX overlay
<KaTeXOverlay ref={katexRef} />

// CSS
const KaTeXOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;  // Critical!
  user-select: none;
`;
```

**Key Learning**:
- Konva (canvas) and KaTeX (HTML/DOM) can't mix directly
- Use absolute positioning with `pointer-events: none` for overlays
- Students can still draw over the KaTeX expression

**Files Changed**:
- `SubtractingIntegersLesson.jsx`
- Added `CanvasContainer`, `KaTeXOverlay` styled components
- Imported `katex` and CSS

---

### Issue 10: Drawing Not Clearing on Level Change
**Problem**: Drawings persisted when switching levels
**Solution**: Added `useEffect` watching `levelNum`

```javascript
React.useEffect(() => {
  if (clearDrawingRef.current) {
    clearDrawingRef.current.clear();
  }
}, [levelNum]);
```

**Key Learning**: Track level changes as a trigger for clearing ephemeral state like drawings.

**Files Changed**: `SubtractingIntegersLesson.jsx`

---

## Key Learnings

### 1. Follow Established Patterns
✅ **Always check existing lessons** (like Symmetry, MeasuringSides) for UI patterns
✅ Match button placement, canvas layout, and interaction patterns
✅ Consistency improves user experience

### 2. Theme-Aware Colors for Canvas
✅ Use `konvaTheme.adjacent`, `konvaTheme.opposite`, `konvaTheme.angle`
❌ Never hardcode black/white text colors
✅ Ensures visibility in both light and dark modes

### 3. React Patterns for Child-Parent Communication
✅ Use `useRef` + `useImperativeHandle` for exposing child methods
❌ Don't use `useState` for function references
✅ Cleaner, more reliable pattern

### 4. Canvas + HTML Overlays
✅ Can overlay HTML (KaTeX) on Konva canvas
✅ Use `pointer-events: none` so overlay doesn't block drawing
✅ Position absolutely with center transform

### 5. Clear State Management
Track all events that should clear ephemeral state:
- ✅ Correct answer submission
- ✅ "Try Another" button
- ✅ "Clear" button
- ✅ Level changes
- ✅ New questions

### 6. Iterative Design
✅ Be prepared for multiple design iterations
✅ Size, positioning, colors may need adjustments
✅ Keep code flexible for changes

### 7. Visual Scaffolding
✅ Show visualizations for first 4 questions
✅ Hide after Q4 to challenge students (unless hint clicked)
⚠️ Only hide if visual is not essential to answer

---

## Final Implementation Details

### Component Structure

```
SubtractingIntegersLesson
├── TopHintButton (fixed top-right)
├── LevelHeader (level badge + title)
├── QuestionSection (question text)
├── VisualSection (if levels 1-4 or hint shown)
│   └── KeepChangeChange
│       ├── Konva Stage/Layer (drawing canvas)
│       └── KaTeXOverlay (math expression)
├── InteractionSection
│   ├── HintBox (if hint clicked)
│   ├── ButtonContainer (Marker, Eraser, Clear)
│   ├── AnswerInput
│   └── ExplanationSection (if answer shown)
```

### Key Technologies

**Canvas Drawing**: Konva React
- `Stage`, `Layer`, `Rect`, `Line` components
- Mouse/touch event handlers for drawing
- `globalCompositeOperation: 'destination-out'` for erasing

**Math Typography**: KaTeX
- HTML overlay positioned absolutely
- `pointer-events: none` to allow drawing through it
- Responsive font sizes (72px → 60px → 48px)

**State Management**:
- React hooks (`useState`, `useRef`, `useEffect`, `useImperativeHandle`)
- Phase 2.5 pattern: `useLessonState` hook

### Drawing Tools Implementation

**Marker Tool**:
- Stroke: `#EF4444` (red)
- Width: 5px
- Operation: `source-over`

**Eraser Tool**:
- Stroke: `#FFFFFF` (white)
- Width: 30px
- Operation: `destination-out`

**Drawing State**:
```javascript
const [lines, setLines] = useState([]);
const [tool, setTool] = useState('marker');
const [isDrawing, setIsDrawing] = useState(false);

// Each line: { tool: 'marker'|'eraser', points: [x1,y1,x2,y2,...] }
```

### Visual Scaffolding Logic

```javascript
{visualData && visualData.type === 'keepChangeChange' &&
 (currentQuestionIndex < 4 || showHint) && (
  <VisualSection>
    <KeepChangeChange ... />
  </VisualSection>
)}
```

- Questions 0-3 (1-4): Always show
- Questions 4-9 (5-10): Only if hint clicked
- Appropriate for this lesson since visual is supplementary, not required

---

## Backend Implementation

### Generator Pattern

**Location**: `/backend/services/lessonProcessors/questions/subtractingIntegersGenerator.js`

**Structure**:
```javascript
// Helper functions
function randomInt(min, max) { ... }
function pick(arr) { ... }

// Level generators (5 functions)
function generateLevel1() {
  return {
    level: 1,
    question: [{ text: question }],
    answer: [String(result)],
    acceptedAnswers: [String(result)],
    hint,
    explanation,
    visualData: { type: 'keepChangeChange', ... },
    problemTypeReturned: 'subtracting_integers',
    wordProblemReturned: 'subtracting_integers',
    numbersReturned: [num1, num2, result],  // ⚠️ REQUIRED
  };
}

// Registry
const LEVEL_GENERATORS = { 1: generateLevel1, ... };

// Exports
export function subtractingIntegersGenerator({ lessonName, level }) { ... }
export function supportsLesson(lessonName) { ... }
```

**Critical Field**: `numbersReturned` - Required for validation, even if empty array

### Config Pattern

**Location**: `/backend/config/lessonConfigs/subtracting_integers.config.js`

```javascript
export default {
  name: 'subtracting_integers',
  displayName: 'Subtracting Integers',

  pipeline: {
    skipSteps: [3, 5, 6, 7, 8, 9, 10, 11],
    customDataGeneration: {
      enabled: true,
      levels: [1, 2, 3, 4, 5],
      generator: 'subtractingIntegersGenerator',
      batchSize: 10,
    }
  },

  frontend: {
    componentType: 'custom',
    levels: 5,
    components: [
      'SubtractingIntegersLesson',
      'SubtractingIntegersLesson',
      'SubtractingIntegersLesson',
      'SubtractingIntegersLesson',
      'SubtractingIntegersLesson',
    ]
  },

  metadata: {
    category: 'algebra',
    difficulty: 'beginner',
    topics: ['integers', 'subtraction', 'negative numbers', 'keep change change', 'word problems'],
    prerequisites: ['adding_integers'],
    relatedLessons: ['adding_integers', 'multiplying_integers'],
  }
};
```

### Registration Checklist

**Backend**:
- ✅ Create generator in `services/lessonProcessors/questions/`
- ✅ Create config in `config/lessonConfigs/`
- ✅ Import generator in `services/lessonProcessors/index.js`
- ✅ Add to `getQuestionGenerator()` function
- ✅ Add to `hasCustomGenerator()` function
- ✅ Import config in `config/lessonConfigs/index.js`
- ✅ Add to `lessonConfigRegistry`
- ✅ Update `data/helperFunctions/getLessonDataInitial.js`

**Frontend**:
- ✅ Create component in `lessonTypes/[category]/`
- ✅ Export from `lessonTypes/[category]/index.js`
- ✅ Add lazy import in `DataLesson.js`
- ✅ Add to lesson mapping in `DataLesson.js`

---

## Testing Checklist

### Backend Testing

```bash
# Test single level
curl -s "http://localhost:5001/lessons/content/subtracting_integers&1&1" | jq '.'

# Verify batch generation
curl -s "http://localhost:5001/lessons/content/subtracting_integers&1&1" | jq '{
  questionCount: (.questionAnswerArray | length),
  batchSize: .batchSize,
  sample: .questionAnswerArray[0].question[0].text
}'

# Test all levels
for level in 1 2 3 4 5; do
  echo "=== Level $level ==="
  curl -s "http://localhost:5001/lessons/content/subtracting_integers&1&$level" | jq '{
    level: .levelNum,
    questions: (.questionAnswerArray | length),
    sample: .questionAnswerArray[0].question[0].text
  }'
done
```

### Frontend Testing

**Manual Tests**:
1. ✅ Lesson loads without errors
2. ✅ KaTeX expression renders cleanly
3. ✅ Expression is large (72px) and centered
4. ✅ Marker tool draws red strokes
5. ✅ Eraser tool erases (not black marks)
6. ✅ Clear Drawing button clears all marks
7. ✅ Drawing clears on correct answer
8. ✅ Drawing clears on "Try Another"
9. ✅ Drawing clears on level change
10. ✅ Questions 1-4 show canvas
11. ✅ Questions 5-10 hide canvas (show with hint)
12. ✅ All 5 levels work correctly
13. ✅ Dark mode works (text visible)
14. ✅ Answer input accepts correct answers
15. ✅ Batch caching works (10 questions, no API calls between)

---

## Common Pitfalls & How to Avoid

### 1. Validation Failures
**Pitfall**: Forgetting `numbersReturned` field
**Solution**: Always include in generator return object (can be empty array)

### 2. useState for Functions
**Pitfall**: Using `setState` with function values
**Solution**: Use `useRef` + `useImperativeHandle` pattern

### 3. Canvas Text Colors
**Pitfall**: Hardcoding black/white colors
**Solution**: Use theme colors (konvaTheme.adjacent, etc.)

### 4. Overlay Blocking Interaction
**Pitfall**: HTML overlay blocks canvas drawing
**Solution**: Add `pointer-events: none` to overlay styles

### 5. Incomplete State Clearing
**Pitfall**: Forgetting to clear on some user actions
**Solution**: Track all events: submit, try another, clear button, level change

### 6. Design Pattern Inconsistency
**Pitfall**: Creating unique UI patterns
**Solution**: Check existing lessons first, match established patterns

---

## File Change Summary

### Files Created
1. `/backend/services/lessonProcessors/questions/subtractingIntegersGenerator.js` (334 lines)
2. `/backend/config/lessonConfigs/subtracting_integers.config.js` (49 lines)
3. `/frontends/lessons/src/features/lessons/lessonTypes/algebra/SubtractingIntegersLesson.jsx` (500+ lines)

### Files Modified
1. `/backend/services/lessonProcessors/index.js` (3 additions)
2. `/backend/config/lessonConfigs/index.js` (2 additions)
3. `/backend/data/helperFunctions/getLessonDataInitial.js` (1 addition)
4. `/frontends/lessons/src/features/lessons/lessonTypes/algebra/index.js` (2 additions)
5. `/frontends/lessons/src/features/lessons/DataLesson.js` (2 additions)

### Total Changes
- **Backend**: 334 new lines, 6 registration points
- **Frontend**: 500+ new lines, 4 registration points
- **Issues Resolved**: 10 major issues with iterative fixes

---

## Future Improvements

### Potential Enhancements
1. **Undo/Redo**: Add drawing history with undo/redo buttons
2. **Color Selection**: Let students choose marker colors
3. **Drawing Recognition**: AI to detect if student performed KCC correctly
4. **Guided Mode**: Show dotted lines where to draw
5. **Animation**: Animate the KCC transformation for demo

### Lessons for Next Time
1. Start with design pattern research (check existing lessons)
2. Use theme colors from the start
3. Implement `useRef` pattern for child methods immediately
4. Plan all clear/reset triggers upfront
5. Consider KaTeX for all math expressions
6. Test clearing behavior thoroughly before marking complete

---

## Success Metrics

**Achieved**:
- ✅ Full 5-level lesson with custom generator
- ✅ Interactive drawing canvas with marker/eraser
- ✅ Professional KaTeX typography
- ✅ Visual scaffolding (hide after Q4)
- ✅ Dark mode support
- ✅ Batch caching (10 questions)
- ✅ Clean, intuitive UI matching app patterns
- ✅ All drawing state properly cleared on all events

**Time Investment**: ~2-3 hours of iterative development
**Issues Encountered**: 10
**All Issues Resolved**: Yes ✅

---

## Conclusion

The Subtracting Integers lesson demonstrates the importance of:
1. **Reading past conversations** - Applied numbersReturned lesson from adding_integers
2. **Following patterns** - Matched Symmetry lesson structure
3. **Iterative refinement** - 10 issues, 10 solutions
4. **Proper React patterns** - useRef + useImperativeHandle
5. **Theme consistency** - Dark mode support
6. **User experience** - Clear state on all relevant events

This log serves as a blueprint for future interactive math lessons with drawing capabilities.

---

**End of Development Log**
