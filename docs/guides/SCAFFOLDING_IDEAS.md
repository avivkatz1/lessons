# Scaffolding Ideas & Pedagogical Patterns

**Version:** 1.0
**Last Updated:** Feb 28, 2026
**Purpose:** Reference guide for scaffolding techniques and interactive patterns used across all lessons

---

## Overview

This document catalogs proven scaffolding techniques, interactive manipulatives, and pedagogical progressions found across the lessons codebase. Use this as a reference when designing new lessons or reworking existing ones to ensure consistency and leverage patterns that work.

---

## 1. PROGRESSIVE SCAFFOLDING TECHNIQUES

### 1.1 Visualization Progression (Concrete → Visual → Abstract)

**Description:** Start with concrete, manipulable visuals and gradually transition to abstract representations.

**Lessons Using This Pattern:**

#### **SymmetryLesson.jsx** (Levels 1-5)
- **L1-3:** Click cells on grid (concrete manipulation)
- **L4:** Enter coordinates (abstract coordinate system)
- **L5:** Diagonal reflection (more complex transformations)

**Implementation:**
- Large, simple visuals in early levels
- Consistent color coding (green=correct, red=wrong, blue=neutral)
- Gradually remove visual scaffolds
- Each level removes one layer of support

#### **AddingIntegersLesson.jsx** (Levels 1-5)
- **L1:** Number line with jump visualization (highly concrete)
- **L2:** Chips visualization (concrete manipulatives)
- **L3-4:** Mixed signs (transitioning to abstract)
- **L5:** Word problems (real-world context)

**Implementation:**
- Animated number line jumps for visual tracking
- Color-coded chips (positive/negative)
- Progressive removal of visual aids
- Bridge to word problem context

#### **AnglesLesson.jsx** (Levels 1-5)
- **L1:** Identify vertex (find point)
- **L2:** Identify region (visual separation)
- **L3:** Classify (name the type)
- **L4:** Estimate (numeric reasoning)
- **L5:** Create/drag (manipulation)

**Key Principle:** Each level builds on previous knowledge while adding one new cognitive layer.

---

### 1.2 Interaction Mode Progression

**Description:** Binary Choice → Classification → Identification → Counting → Complex Problem-Solving

**Pattern Benefits:**
- Lowest cognitive load first (yes/no decisions)
- Build familiarity before complexity
- Each mode adds interaction sophistication
- Culminate in real-world application

#### **SidesAndAnglesLesson.jsx** (Levels 1-5) ⭐ GOLD STANDARD
- **L1:** Binary choice (Side or Angle?)
  - Two buttons, simple decision
  - Immediate feedback
  - Build conceptual distinction

- **L2:** Classification (Label all parts as Side/Angle)
  - Toggle buttons for each element
  - Must classify entire shape
  - Reinforces L1 learning

- **L3:** Tap identification (Click the correct side/angle)
  - Direct interaction with shape
  - "Find the highlighted side/angle"
  - Visual-spatial connection

- **L4:** Counting (Tap each element to count)
  - Systematic enumeration
  - Visual tracking with highlights
  - Builds cardinality understanding

- **L5:** Word problems (Real-world application)
  - Context-based reasoning
  - Apply all previous learning
  - Transfer to authentic scenarios

**Reference File:** `src/features/lessons/lessonTypes/geometry/SidesAndAnglesLesson.jsx`

#### **ShapesLesson.jsx** (Levels 1-5)
- **L1:** Binary choice (Is this a shape?)
- **L2:** Multi-select (Find all shapes in grid)
- **L3:** Name the shape (classification)
- **L4:** Identify specific shape (single choice)
- **L5:** Shape challenge (complex)

**Reference File:** `src/features/lessons/lessonTypes/geometry/ShapesLesson.jsx`

#### **PlottingPoints.jsx** (Levels 1-7)
- **L1:** Read coordinates via keypad
- **L2:** Verify with YES/NO binary choice
- **L3-4:** Plot points on grid (Quadrant I → All quadrants)
- **L5:** Plot multiple labeled points
- **L6:** Reflection coordinates
- **L7:** Word problems with plotting

**Reference File:** `src/features/lessons/lessonTypes/graphing/PlottingPoints.jsx`

---

### 1.3 Area/Perimeter Lesson Progression ⭐ COMPREHENSIVE MODEL

**AreaPerimeterLesson.jsx** - 8 Levels with 4 Component Types

#### **Level 1: Interactive Dragging** (Most Concrete)
- Drag corner handles to resize rectangle
- Real-time area/perimeter calculation displayed
- Visual feedback with target comparison
- Auto-trigger success on exact match
- **Cognitive Load:** LOW (exploration, immediate feedback)

**Implementation Details:**
```javascript
// Konva Transformer pattern
- Corner drag handles
- Live calculation display
- Visual target box for comparison
- onDragEnd triggers validation
```

**Reference File:** `Level1DragRectangle.jsx`

---

#### **Level 2: Comparison**
- Compare two rectangles side-by-side
- Identify which has larger area/perimeter
- Multiple choice buttons
- **Cognitive Load:** LOW-MEDIUM (comparison reasoning)

**Reference File:** `Level2CompareRectangles.jsx`

---

#### **Level 3: Calculate with Input Panel** ⭐ KEYPAD PATTERN INTRO
- Static rectangle with labeled dimensions
- InputOverlayPanel for numeric input
- UnifiedMathKeypad for number entry
- Canvas slides left when panel opens (iPad optimization)
- **Progressive Scaffolding Within Level:**
  - Q1-4: Area only
  - Q5-8: Perimeter only
  - Q9+: Both area and perimeter
- **Cognitive Load:** MEDIUM (formula application)

**Implementation Details:**
```javascript
// InputOverlayPanel Pattern (STANDARD)
- Desktop/iPad: Canvas slides 75% of panel width
- Mobile: Full-screen overlay, no slide
- Keep-open mode for continuous practice
- Multi-input support (area + perimeter fields)
```

**Reference File:** `Level3CalculateRectangle.jsx`

---

#### **Level 4: Right Triangles**
- Introduce formula: A = (1/2) × base × height
- Visual decomposition hints (show as half-rectangle)
- Build on rectangle knowledge
- **Cognitive Load:** MEDIUM-HIGH (new formula)

**Reference File:** `Level4RightTriangle.jsx`

---

#### **Level 5: Any Triangle**
- Full triangle area formula
- Remove decomposition scaffolds
- Higher abstraction
- **Cognitive Load:** HIGH (generalized formula)

**Reference File:** `Level5AnyTriangle.jsx`

---

#### **Level 6: Trapezoid with Decomposition**
- Show how to break trapezoid into simpler shapes
- Interactive decomposition visualization
- Connect to previous knowledge (rectangles + triangles)
- **Cognitive Load:** HIGH (multi-step reasoning)

**Reference File:** `Level6TrapezoidDecomposition.jsx`

---

#### **Level 7: Mixed Shapes**
- Combine multiple shapes in one figure
- Require mental decomposition
- Complex problem-solving
- **Cognitive Load:** VERY HIGH (synthesis)

**Reference File:** `Level7MixedShapes.jsx`

---

#### **Level 8: Word Problems**
- Real-world context (garden, fencing, room, carpet, painting)
- Keyword highlighting system
- Visual shape with dimensions embedded in story
- **Cognitive Load:** VERY HIGH (context interpretation + calculation)

---

## 2. INTERACTIVE MANIPULATIVES

### 2.1 Draggable Objects

**Used In:**
- **AreaPerimeterLesson L1:** Drag corner handles to resize rectangle
- **SimilarTrianglesWordProblemsLesson:** Drag objects to build scenes
- **AnglesLesson L5:** Drag to adjust angle measure

**Implementation Pattern (Konva):**
```javascript
// Konva Image/Shape with transformer
- onClick: Select object
- onDragEnd: Update position, trigger validation
- onTransformEnd: Handle scale/rotation changes
- Store state: { type, x, y, rotation, scaleX, scaleY }
```

**Visual Feedback:**
- Highlight on selection
- Snap guides for alignment
- Real-time position display

**Reference Files:**
- `Level1DragRectangle.jsx`
- `SimilarTrianglesWordProblemsLesson.jsx`

---

### 2.2 Grid Cell Selection

**Used In:**
- **SymmetryLesson L1-3:** Click cells to create/reflect shapes
- **ShapesLesson L2:** Multi-select shapes in grid
- **PlottingPoints L3-4:** Click grid to plot points

**Implementation Pattern:**
```javascript
// Canvas click handler
- Get pointer position from Konva stage
- Convert to grid coordinates
- Toggle cell state or validate selection
- Provide visual feedback (color change, highlight)
```

**Coordinate Transformations:**
```javascript
// 10×10 grid (even)
gridCol = mathX + 5
gridRow = 5 - mathY

// 11×11 grid (odd, has center)
gridCol = mathX + 5
gridRow = 5 - mathY
```

**Reference Files:**
- `SymmetryLesson.jsx`
- `COORDINATE_GRID_SYSTEM.md`

---

### 2.3 Tap to Count/Identify

**Used In:**
- **SidesAndAnglesLesson L3-4:** Tap sides/angles to identify or count
- **AnglesLesson L1-2:** Tap vertex or region
- **ShapesLesson L4:** Tap to select specific shape

**Implementation Pattern:**
```javascript
// Shape click handlers
- onClick: Record selection
- Visual highlight on selected element
- Track count or validate choice
- Disable after correct selection
```

**Visual Feedback:**
- Highlight color (yellow/orange for "active")
- Checkmark or count display
- Shake animation on wrong tap

---

### 2.4 Token-Based Interaction

**Used In:**
- **OrderOfOperations.jsx L1-3:** Click operators to evaluate step-by-step

**Implementation Pattern:**
```javascript
// Token array: { type: 'number'|'operator'|'paren', value }
// Steps: { correctOpIndex, tokensAfter }
- Clickable operator buttons
- Highlight next valid operation
- Shake on wrong selection
- Update display tokens after each step
- Show completion animation
```

**Visual Design:**
- KaTeX rendering for math notation
- Superscript for exponents
- Color-coded operators
- Animation between steps (200-500ms)

**Reference File:** `OrderOfOperations.jsx`

---

## 3. INPUT METHODS

### 3.1 Binary Choice Buttons ⭐ CRITICAL PATTERN

**Description:** Two-option selection with transparent border styling

**Used In:**
- SidesAndAnglesLesson L1
- ShapesLesson L1
- PlottingPoints L2
- GraphingLinesLesson (YES/NO verification)

**MANDATORY STYLING (from CLAUDE.md):**
```javascript
const ChoiceButton = styled.button`
  background-color: transparent;              // ← MUST be transparent
  border: 3px solid ${props => props.$borderColor};
  color: ${props => props.$borderColor};
  font-weight: 700;
  border-radius: 10px;
  padding: 14px 40px;

  &:hover:not(:disabled) {
    background-color: ${props => props.$borderColor};  // Fill on hover
    color: white;                                       // Text becomes white
  }
`;
```

**Standard Colors:**
- **Positive/Yes:** `#10B981` (green)
- **Negative/No:** `#EF4444` (red)
- **Zero/Neutral:** `#6B7280` (gray)
- **Undefined/Special:** `#8B5CF6` (purple)

**Animation Timings:**
- 800ms delay before success modal
- 600ms shake animation on wrong answer

**Reference Implementation:** `ShapesLesson.jsx` (YesButton, NoButton components)

---

### 3.2 InputOverlayPanel Pattern ⭐ STANDARD FOR NUMERICAL INPUT

**Description:** Slide-in panel with UnifiedMathKeypad for iPad-optimized input

**Used In:**
- SymmetryLesson L4
- AreaPerimeterLesson L3-7
- PlottingPoints L1, L6-7
- GraphingLinesLesson L3-5
- OrderOfOperations L4

**Features:**
- **Desktop/iPad:** Canvas slides left 75% of panel width
- **Mobile:** Full-screen overlay, no slide animation
- **Keep-open mode:** For continuous problem practice
- **Multi-input support:** Multiple fields in one panel
- **Immediate feedback:** Validation on submit

**Standard Configuration:**
```javascript
// Panel sizing
Panel width: 40% of window (min 360px, max 480px)
Slide distance: 75% of panel width

// Components
- UnifiedMathKeypad (layout="inline", buttonSet="basic")
- EnterAnswerButton (variant="static", below canvas)
- InputLabel + feedback section
```

**Implementation Hook:**
```javascript
const {
  panelOpen,
  inputValue,
  submitted,
  setInputValue,
  setSubmitted,
  openPanel,
  closePanel,
  resetAll,
  keepOpen,
  setKeepOpen,
} = useInputOverlay();
```

**Critical Bug Fix Pattern:**
```javascript
// ALWAYS add input change handler to reset submitted state
const handleInputChange = (value) => {
  setInputValue(value);
  if (submitted) setSubmitted(false);  // ← Enables re-submission
};

// Use in UnifiedMathKeypad
<UnifiedMathKeypad
  value={inputValue}
  onChange={handleInputChange}  // ← Not setInputValue directly
  // ...
/>
```

**Reference Files:**
- `INPUT_OVERLAY_PANEL_SYSTEM.md`
- `Level3CalculateRectangle.jsx`
- `useInputOverlay.js`

---

### 3.3 Multi-Select Toggle Buttons

**Used In:**
- ShapesLesson L2 (grid multi-select)
- SidesAndAnglesLesson L2 (classify all parts)

**Implementation Pattern:**
```javascript
// Array of selected items
const [selected, setSelected] = useState([]);

// Toggle handler
const handleToggle = (id) => {
  setSelected(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)  // Remove
      : [...prev, id]                // Add
  );
};

// Validation
const isCorrect = selected.length === correctSet.length &&
                  selected.every(id => correctSet.includes(id));
```

**Visual Feedback:**
- Selected: Filled background, checkmark
- Unselected: Transparent border
- Hover: Preview selection state

---

### 3.4 Coordinate Entry (Two-Field)

**Used In:**
- SymmetryLesson L4 (x, y coordinates)
- PlottingPoints L1 (read coordinates)
- GraphingLinesLesson L3 (rise, run)

**TwoFieldScreen Pattern:**
```javascript
<UnifiedMathKeypad
  screen={
    <TwoFieldScreen
      fields={[
        { name: 'x', label: 'X:', value: xInput },
        { name: 'y', label: 'Y:', value: yInput }
      ]}
      activeField={activeField}
      onFieldSwitch={setActiveField}
      dividerColor="#EF4444"
    />
  }
  value={activeField === 'x' ? xInput : yInput}
  onChange={(val) => {
    if (activeField === 'x') handleXChange(val);
    else handleYChange(val);
  }}
/>
```

**Features:**
- Tap to switch between fields
- Visual highlighting of active field
- Vertical divider with accent color
- Single keypad for both inputs

**Reference File:** `TwoFieldScreen.jsx`

---

## 4. COORDINATE GRID SYSTEMS

### 4.1 Grid Types & Transformations

**10×10 Grid (Even, Used in SymmetryLesson L1-3):**
- Grid cells: 0-9 (columns), 0-9 (rows)
- Mathematical coords: [-5, 4] × [-4, 5] (NO true center)
- Reflection formulas:
  - X-axis: `(x, y) → (x, -1 - y)`
  - Y-axis: `(x, y) → (-1 - x, y)`

**11×11 Grid (Odd, Used in SymmetryLesson L4-5):**
- Grid cells: 0-10 (columns), 0-10 (rows)
- Mathematical coords: [-5, 5] × [-5, 5] (true center at origin)
- Reflection formulas:
  - X-axis: `(x, y) → (x, -y)`
  - Y-axis: `(x, y) → (-x, y)`
  - Diagonal: `(x, y) → (y, x)`

**Coordinate Transformations:**
```javascript
// Mathematical to Grid
gridCol = mathX + 5
gridRow = 5 - mathY

// Grid to Mathematical
mathX = gridCol - 5
mathY = 5 - gridRow
```

**Reference Documentation:** `COORDINATE_GRID_SYSTEM.md`

---

### 4.2 Plotting Interaction Modes

**Read Mode:** Student enters coordinates of shown point
**Plot Mode:** Student clicks grid to place point
**Verify Mode:** Student answers YES/NO to "Is point at (x,y)?"
**Word Problem Mode:** Read context, plot answer point

**Visual Supports:**
- Coordinate axes with labels
- Grid background for alignment
- Point highlighting on hover
- Feedback colors (green=correct, red=wrong, blue=pending)

---

## 5. CANVAS SIZING STRATEGY

### 5.1 Responsive Breakpoints

```javascript
// Mobile (< 768px)
Canvas: min(windowWidth - 40px, 500px)
Panel: Full-screen overlay, no slide animation
Touch targets: 50-60px hit area
Font size: 15-16px

// iPad (768-1024px)
Canvas: min(windowWidth - 40px, 400px)
Canvas with keypad open: 320px
Panel: Slide animation 75% of panel width
Touch targets: 44-50px

// Desktop (> 1024px)
Canvas: Full responsive width up to 500px
Panel: Smooth slide transition
Touch targets: 30-40px (normal)
Font size: 16-18px
```

### 5.2 InputOverlayPanel Slide Calculation

```javascript
const slideDistance = useMemo(() => {
  // Mobile: No slide
  if (windowWidth <= 768) return 0;

  // Desktop/iPad: Calculate panel width, then slide distance
  const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
  return panelWidth * 0.75; // Slide by 75% of panel width
}, [windowWidth]);
```

---

## 6. COMPLETION & FEEDBACK MECHANICS

### 6.1 Standard Success Pattern

1. User completes interaction
2. **800ms delay** (visual feedback, celebrate moment)
3. ExplanationModal appears
4. Shows success message + explanation
5. Button: "Try Another Problem"

**Implementation:**
```javascript
if (isCorrect) {
  setTimeout(() => {
    if (keepOpen) {
      // Keep-open mode: reset and advance
      setInputValue('');
      setSubmitted(false);
      onNextProblem?.();
    } else {
      // Normal mode: close panel, show modal
      closePanel();
      setTimeout(() => {
        onComplete?.(true);
      }, 500);
    }
  }, 800);  // ← Standard delay
}
```

---

### 6.2 Wrong Answer Feedback

1. **Shake animation** (600ms)
2. Feedback text below interaction
3. Hint button becomes available
4. Allow retry (panel stays open)
5. No penalty, just guidance

**Shake Animation Pattern:**
```javascript
// CSS keyframes
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

// Apply on wrong answer
animation: shake 0.6s ease-in-out;
```

---

### 6.3 Hint System

**Standard Implementation:**
- **TopHintButton:** Fixed position (top-right), always visible
- Click reveals hint box below instructions
- Hint box styling: left border accent (orange/gold `#F59E0B`)
- Hidden on completion
- Reset on new problem

**Styling:**
```javascript
const HintBox = styled.div`
  border-left: 4px solid #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
  padding: 16px 20px;
  border-radius: 8px;
  margin-top: 12px;
`;
```

---

## 7. MATHEMATICAL EXPRESSION PATTERNS

### 7.1 KaTeX Rendering

**Used In:**
- OrderOfOperations (all levels)
- FractionsLesson
- EquationsLesson

**Implementation:**
```javascript
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Inline math in text
<InlineMath math="2^3 + 4 \times 5" />

// Block (centered) math
<BlockMath math="A = \frac{1}{2} \times b \times h" />
```

**Special Handling:**
- Exponents: Use superscript `^{}`
- Fractions: `\frac{num}{denom}`
- Multiplication: `\times` or `\cdot`
- Variables: Italic by default

---

### 7.2 Step-by-Step Expression Solving

**OrderOfOperations Pattern:**
- Display expression as token array
- Highlight valid operations (PEMDAS order)
- Click correct operator to evaluate
- Update expression after each step
- Show completion when fully simplified

**Token Structure:**
```javascript
{
  type: 'number' | 'operator' | 'paren',
  value: string,
  clickable: boolean
}
```

**Steps Structure:**
```javascript
{
  correctOpIndex: number,
  tokensAfter: Token[]
}
```

**Reference File:** `OrderOfOperations.jsx`

---

## 8. WORD PROBLEM PATTERNS

### 8.1 Keyword Highlighting

**Used In:**
- AreaPerimeterLesson L8
- AddingIntegersLesson L5
- PlottingPoints L7

**Pattern:**
- Identify mathematical keywords in problem text
- Highlight in color (bold + colored background)
- Examples: "area", "perimeter", "total", "difference", "sum"

**Implementation:**
```javascript
const highlightKeywords = (text) => {
  const keywords = ['area', 'perimeter', 'fencing', 'carpet', 'paint'];
  let result = text;
  keywords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, `<span class="keyword">$&</span>`);
  });
  return result;
};
```

---

### 8.2 Context-Rich Problems

**Structure:**
1. **Story Setup:** Real-world scenario (garden, room, playground)
2. **Visual:** Diagram with labeled dimensions
3. **Question:** Clear ask with highlighted keywords
4. **Input:** Keypad for numeric answer
5. **Feedback:** Explain solution steps

**Examples:**
- "A garden measures 12 m by 8 m. How much fencing is needed?"
- "A rectangular room is 15 ft long and 10 ft wide. How much carpet?"

---

## 9. PEDAGOGICAL PATTERNS SUMMARY TABLE

| Pattern | Lessons Using It | Typical Levels | Input Method | Cognitive Load |
|---------|-----------------|----------------|--------------|----------------|
| **Binary Choice** | SidesAndAngles, Shapes, Angles | 1, 3, 5 | Buttons (2) | LOW |
| **Multi-Select** | Shapes, ShapesLesson | 2 | Tap/Click (grid) | MEDIUM |
| **Classification** | SidesAndAngles | 2 | Toggle buttons | MEDIUM |
| **Counting** | SidesAndAngles | 4 | Tapping objects | MEDIUM |
| **Dragging** | AreaPerimeter L1, SimilarTriangles | 1-2 (early) | Drag handles | MEDIUM |
| **Numerical Input** | AreaPerimeter L3+, PlottingPoints | 3-7 (mid) | Keypad | MEDIUM |
| **Coordinate Entry** | Symmetry L4, PlottingPoints | 4-6 (late) | Two-field keypad | HIGH |
| **Word Problems** | All lessons L5+ | 5-8 (late) | Context reading | HIGH |
| **Visual Manipulation** | Angles L5 | 5+ (late) | Drag to adjust | HIGH |
| **Step-by-Step** | OrderOfOperations | 1-3 | Click tokens | MEDIUM-HIGH |

---

## 10. KEY IMPLEMENTATION FILES TO REFERENCE

### Styling & UI Patterns
- **Binary Choice Buttons:** `ShapesLesson.jsx` → `YesButton`, `NoButton` components
- **InputOverlayPanel:** `Level3CalculateRectangle.jsx` → complete pattern
- **TwoFieldScreen:** `TwoFieldScreen.jsx` → multi-input keypad

### Coordinate Systems
- **Grid Transformations:** `SymmetryLesson.jsx` → `mathToGrid`, `gridToMath` functions
- **Documentation:** `COORDINATE_GRID_SYSTEM.md`

### Progressive Scaffolding
- **Interaction Progression:** `SidesAndAnglesLesson.jsx` → L1-5 complete flow
- **Area/Perimeter Progression:** `AreaPerimeterLesson.jsx` + `Level1-7` components
- **Graphing Progression:** `PlottingPoints.jsx` → L1-7 complete flow

### Mathematical Rendering
- **KaTeX Examples:** `OrderOfOperations.jsx` → token-based expressions
- **Step-by-Step Solving:** `OrderOfOperations.jsx` → click-to-evaluate pattern

### Interactive Manipulatives
- **Draggable Objects:** `SimilarTrianglesWordProblemsLesson.jsx` → scene building
- **Resizable Shapes:** `Level1DragRectangle.jsx` → corner handles with Transformer

---

## 11. LESSON CREATION WORKFLOW INTEGRATION

### When Designing a New Lesson

**Step 1: Choose Scaffolding Progression**
- Review section 1 (Progressive Scaffolding Techniques)
- Select a progression that matches content (e.g., Binary → Classify → Count)

**Step 2: Select Interaction Patterns**
- Review section 2 (Interactive Manipulatives)
- Choose manipulatives appropriate for cognitive level
- Start concrete (L1-2), move to abstract (L5+)

**Step 3: Plan Input Methods**
- Review section 3 (Input Methods)
- L1-2: Binary choice or multi-select (low load)
- L3-4: Keypad input with InputOverlayPanel
- L5+: Complex input or word problems

**Step 4: Reference Existing Lessons**
- Find similar lesson in section 10 (Key Implementation Files)
- Copy patterns, adapt to new content
- Maintain consistent styling and timing

**Step 5: Follow Style Guide**
- Read `LESSON_STYLE_GUIDE.md` for iPad optimization
- Use standard button styling (section 3.1)
- Apply responsive breakpoints (section 5)
- Implement standard feedback mechanics (section 6)

---

## 12. ANTI-PATTERNS TO AVOID

### ❌ Don't Do This

1. **Skip Binary Choice in L1**
   - Starting with complex input overwhelms students
   - Always begin with simple yes/no or click interactions

2. **Fill Button Backgrounds Initially**
   - Buttons must be `transparent` with colored borders
   - Fill only on hover/selection (see section 3.1)

3. **Use setInputValue Directly in onChange**
   - Always wrap in handler that resets `submitted` flag
   - Prevents Submit button from becoming inactive

4. **Forget Mobile Responsiveness**
   - Always test on mobile breakpoint (< 768px)
   - Full-screen overlays, no slide animations on mobile

5. **Add Too Many Features in One Level**
   - Each level should add ONE new concept/interaction
   - Cognitive load increases gradually

6. **Skip the 800ms Success Delay**
   - Students need time to process success
   - Immediate modal close feels abrupt

7. **Provide No Visual Feedback on Wrong Answer**
   - Always shake animation (600ms)
   - Always show hint button
   - Never punish, always guide

---

## Appendix: Quick Reference Cheat Sheet

### Button Colors
```
Positive/Yes:  #10B981 (green)
Negative/No:   #EF4444 (red)
Neutral/Zero:  #6B7280 (gray)
Special:       #8B5CF6 (purple)
Info:          #3B82F6 (blue)
Success:       #4ADE80 (light green)
Danger:        #F87171 (light red)
Hint:          #F59E0B (orange/gold)
```

### Animation Timings
```
Success Delay:      800ms
Wrong Shake:        600ms
Panel Slide:        300ms
Step Transition:    200-500ms
```

### Responsive Breakpoints
```
Mobile:   <= 768px
iPad:     769-1024px
Desktop:  > 1024px
```

### Standard Component Sizes
```
Touch Target (Mobile):  50-60px
Touch Target (iPad):    44-50px
Touch Target (Desktop): 30-40px
Panel Width:            40% window (min 360px, max 480px)
Slide Distance:         75% of panel width
```

---

**End of Document**

*For questions or to suggest new patterns, update this document and notify the team.*
