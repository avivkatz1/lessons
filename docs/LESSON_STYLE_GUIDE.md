# Lesson Style Guide
**Version:** 2.0
**Last Updated:** February 26, 2026
**Reference Implementation:** Area/Perimeter Levels 3-7 (InputOverlayPanel Pattern)

## 📋 Table of Contents

1. [Overview](#overview)
2. [Reference Lessons](#reference-lessons)
3. [iPad Optimization Requirements](#ipad-optimization-requirements)
4. [Component Architecture](#component-architecture)
5. [Layout Structure](#layout-structure)
6. [User Interaction Patterns](#user-interaction-patterns)
7. [Styling Guidelines](#styling-guidelines)
8. [Canvas & Konva Best Practices](#canvas--konva-best-practices)
9. [Touch Device Optimization](#touch-device-optimization)
10. [Accessibility](#accessibility)
11. [Testing Checklist](#testing-checklist)

---

## Overview

**Critical Rule:** All lessons MUST fit on a single iPad screen without scrolling.

**Target Devices:**
- iPad 10.2" (1080×810 landscape, 810×1080 portrait)
- iPad Pro 11" (1194×834 landscape, 834×1194 portrait)
- iPad Pro 12.9" (1366×1024 landscape, 1024×1366 portrait)

**Maximum Vertical Space Budget:** 768px (iPad landscape height)

---

## Reference Lessons

When creating new lessons, study these existing implementations for specific patterns and techniques:

### ⭐ **NEW STANDARD: InputOverlayPanel Pattern** (v2.1)
**Path:** `src/features/lessons/lessonTypes/geometry/components/areaPerimeter/Level3-7.jsx`
**Full Documentation:** `docs/guides/INPUT_OVERLAY_PANEL_SYSTEM.md`

**🎯 USE THIS FOR ALL NEW LESSONS WITH NUMERIC INPUT**

**Use this for:**
- ✅ **iPad optimization** - Canvas/content + button slide left, figure stays visible when panel opens
- ✅ **SlimMathKeypad integration** - Touch-optimized numeric input
- ✅ **Static button placement** - Below canvas/content, slides with it
- ✅ **Modal close tracking** - Button changes to "Try Another Problem" after modal X click
- ✅ **Smooth animations** - 300ms slide, unified motion
- ✅ **No canvas resize** - Overlay panel doesn't force canvas to shrink
- ✅ **Touch targets** - 56px minimum (exceeds WCAG 44px)
- ✅ **NEW: Flexible layout support** - Slide + scale for non-canvas content (60% slide + scale(0.95))

**Key Features:**
```javascript
// 1. Canvas slides left when panel opens (figure stays visible)
const slideDistance = panelWidth * 0.75; // 75% of panel width

// 2. Static button below canvas (not floating)
<CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
  <CanvasContainer>{/* Canvas */}</CanvasContainer>
  <ButtonContainer>
    {modalClosedWithX ? (
      <TryAnotherButton onClick={handleNextProblem}>
        Try Another Problem
      </TryAnotherButton>
    ) : (
      <EnterAnswerButton variant="static" onClick={openPanel} />
    )}
  </ButtonContainer>
</CanvasWrapper>

// 3. Modal close tracking (prevents modal from reappearing)
const handleComplete = (success) => {
  if (success && !modalClosedWithX) {  // Only show if not manually closed
    setIsComplete(true);
  }
};
```

**Why This is the New Standard:**
- ✅ Fits iPad landscape perfectly (no scrolling)
- ✅ Figure remains visible when entering answer
- ✅ Clear visual hierarchy (canvas → formula → button)
- ✅ Intuitive: user sees what they're calculating while inputting
- ✅ Reusable: drop-in solution via `useInputOverlay` hook

**User Feedback:**
> "I really like this new style to work with the math pad and how to enter answers while still seeing the problem. I want this to be a standard for using the math pad so that everything can stay on the ipad page."

**Implemented In:**
- AreaPerimeterLesson (Levels 3-7) - Canvas with 75% slide
- All Congruent Triangles lessons (SSS, SAS, ASA, AAS) - Canvas with 75% slide
- SymmetryLesson - Canvas with 75% slide
- **PatternsLesson (Algebra)** - Flexible layout with 60% slide + scale(0.95) ⭐ NEW

---

### 🌟 **SymmetryLesson.jsx** - Gold Standard (Legacy Reference)
**Path:** `src/features/lessons/lessonTypes/geometry/SymmetryLesson.jsx`

**Use this for:**
- ✅ iPad optimization patterns (all 5 levels fit on screen)
- ✅ ExplanationModal for post-completion feedback
- ✅ Dynamic canvas sizing based on keypad state
- ✅ Touch-friendly interactions
- ✅ MathKeypad integration
- ✅ Progressive difficulty across levels
- ✅ Visual feedback (highlights, animations)

**Key Takeaways:**
- Modal explanations save 150-205px vertical space
- Canvas shrinks from 400px → 320px when keypad opens
- All spacing uses `@media (max-width: 1024px)` queries
- Touch targets are 44px minimum
- Smooth transitions for canvas resize

---

### 📐 **SidesAndAnglesLesson.jsx** - Scaffolding with Progressive Difficulty
**Path:** `src/features/lessons/lessonTypes/geometry/SidesAndAnglesLesson.jsx`

**Use this for:**
- ✅ Progressive scaffolding: Binary choice → Classification → Tap → Count → Word problems
- ✅ Multi-step classification with toggle buttons
- ✅ Interactive tapping on Konva shapes (sides and angles)
- ✅ Visual feedback with highlights and flash effects
- ✅ Count tracking with visual badges
- ✅ Phase-based state management

**Key Patterns:**
```javascript
// Level 1: Binary choice (side vs angle)
const handleChoiceClick = (choice, idx) => {
  if (choice.correct) {
    setSelectedChoice(idx);
    setTimeout(() => setPhase("complete"), 800);
  } else {
    setShakingIdx(idx);
    setWrongAttempts(prev => prev + 1);
  }
};

// Level 2: Toggle classification
<ToggleButton
  $active={classifications[part.label] === "Side"}
  onClick={() => handleClassifyToggle(part.label, "Side")}
>
  Side
</ToggleButton>

// Level 4: Count by tapping
const handleSideTapL4 = (index) => {
  const key = `side-${index}`;
  if (countedElements.has(key)) return;
  setCountedElements(prev => new Set([...prev, key]));
  setCurrentCount(prev => prev + 1);
};
```

**Scaffolding Progression:**
1. Level 1: Binary choice (recognize concept)
2. Level 2: Classify multiple items (apply concept)
3. Level 3: Tap to identify (direct interaction)
4. Level 4: Count items (deeper understanding)
5. Level 5: Word problems (real-world application)

---

### 🔷 **ShapesLesson.jsx** - Multi-Select & Grid Interactions
**Path:** `src/features/lessons/lessonTypes/geometry/ShapesLesson.jsx`

**Use this for:**
- ✅ Multi-select interactions (Level 2: Find all shapes)
- ✅ Grid mode for displaying multiple figures
- ✅ Selection state with visual checkmarks
- ✅ Toggle selection (tap to select/deselect)
- ✅ Binary yes/no choices (Level 1)
- ✅ Grid tap targets with invisible rectangles

**Key Patterns:**
```javascript
// Multi-select with Set
const [selectedFigures, setSelectedFigures] = useState(new Set());

const handleFigureTapL2 = (idx) => {
  setSelectedFigures(prev => {
    const next = new Set(prev);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    return next;
  });
};

// Check selection against correct answer
const handleCheckSelection = () => {
  const correctSet = new Set(correctIndices);
  const isCorrect =
    correctSet.size === selectedFigures.size &&
    [...correctSet].every(i => selectedFigures.has(i));
};

// Grid tap targets (invisible rectangles)
<Rect
  key={`tap-${idx}`}
  x={(idx % 2) * canvasWidth / 2}
  y={Math.floor(idx / 2) * canvasHeight / 2}
  width={canvasWidth / 2}
  height={canvasHeight / 2}
  fill="transparent"
  onTap={() => onFigureTap(idx)}
  onClick={() => onFigureTap(idx)}
/>
```

**Scaffolding Progression:**
1. Level 1: Shape or not? (binary recognition)
2. Level 2: Find all shapes (multi-select)
3. Level 3: Name the shape (specific identification)
4. Level 4: Pick the shape on grid (spatial reasoning)
5. Level 5: Word problems (contextual application)

---

### 🏗️ **SimilarTrianglesWordProblemsLesson.jsx** - Interactive Scene Building
**Path:** `src/features/lessons/lessonTypes/geometry/SimilarTrianglesWordProblemsLesson.jsx`

**Use this for:**
- ✅ Draggable objects with Konva (Transformer API)
- ✅ Scene builder with object palette
- ✅ Image-based draggable components
- ✅ Rotation and scaling interactions
- ✅ Scene validation (checking required objects)
- ✅ Auto-advance after correct answer
- ✅ Interactive Level 1 with scene building

**Key Patterns:**
```javascript
// Draggable object with transformer
function DraggableObject({ obj, isSelected, onSelect, onDragEnd, onTransform }) {
  const imageRef = useRef();
  const trRef = useRef();
  const [image] = useImage(`/${obj.type}.png`);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        draggable
        onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
        onTransformEnd={(e) => {
          const node = imageRef.current;
          onTransform(node.x(), node.y(), node.rotation(), node.scaleX());
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </>
  );
}

// Add object to canvas
const handleAddObject = (objectType) => {
  const newObject = {
    type: objectType,
    x: 100 + canvasObjects.length * 60,
    y: 200,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    id: Date.now() + Math.random(),
  };
  setCanvasObjects([...canvasObjects, newObject]);
  setSelectedObjectId(newObject.id);
};

// Scene validation
const handleCheckScene = () => {
  const requiredObjects = visualData.requiredObjects || [];
  const objectTypes = canvasObjects.map(obj => obj.type);
  const hasAllRequired = requiredObjects.every(req =>
    objectTypes.includes(req)
  );

  if (hasAllRequired && canvasObjects.length === requiredObjects.length) {
    revealAnswer();
  }
};
```

**Interactive Patterns:**
- Object palette with add buttons
- Drag to position
- Click to select → Transform handles appear
- Rotate and scale with touch/mouse
- Clear canvas button
- Validation before revealing answer

---

### 🧮 **OrderOfOperations.jsx** - Step-by-Step Scaffolding
**Path:** `src/features/lessons/lessonTypes/algebra/OrderOfOperations.jsx`

**Use this for:**
- ✅ Step-by-step interactive problem solving
- ✅ Clickable tokens (operators, numbers, exponents)
- ✅ Progress tracking ("Step 2 of 5")
- ✅ Completed steps log
- ✅ KaTeX rendering for math expressions
- ✅ Color-coded operators by type
- ✅ Visual token replacement after each step
- ✅ Educational reference boxes (PEMDAS)

**Key Patterns:**
```javascript
// Clickable operator tokens
const handleOperatorClick = (clickedOpIndex) => {
  const step = steps[currentStep];

  if (clickedOpIndex === step.correctOpIndex) {
    // Correct - update tokens
    setIsAnimating(true);
    setCompletedSteps(prev => [...prev, step]);

    setTimeout(() => {
      setDisplayTokens(step.tokensAfter);
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);

      if (currentStep + 1 >= steps.length) {
        setIsComplete(true);
      }
    }, 400);
  } else {
    // Wrong - shake animation
    setShakeOpIndex(clickedOpIndex);
    setTimeout(() => setShakeOpIndex(null), 600);
  }
};

// Color-coded operators
const OperatorButton = styled.button`
  background-color: ${props => {
    if (props.$opType === '*' || props.$opType === '/')
      return props.theme.colors.info + '18';
    if (props.$opType === '+' || props.$opType === '-')
      return props.theme.colors.buttonSuccess + '18';
    return props.theme.colors.pageBackground;
  }};
`;

// Completed steps log
{completedSteps.map((s, i) => (
  <StepLogItem key={i}>
    {s.operandLeft} {getDisplayOp(s.operator)} {s.operandRight} = {s.result}
  </StepLogItem>
))}

// KaTeX rendering
function KaTeXExpression({ tokens }) {
  const containerRef = useRef();
  useEffect(() => {
    if (containerRef.current) {
      const tex = tokensToKatex(tokens);
      katex.render(tex, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [tokens]);
  return <div ref={containerRef} />;
}
```

**Scaffolding Progression:**
1. Level 1: Click first operation (recognition)
2. Level 2: Click all operations in order (parentheses)
3. Level 3: Click all operations in order (exponents)
4. Level 4: Type final answer (full evaluation)

**Educational Features:**
- Static expression shown above (reference)
- Interactive token display below
- Step counter ("Step 2 of 5")
- Completed steps log shows work
- PEMDAS reference box in explanation
- Color coding: Blue for ×÷, Green for +-

---

### 📱 **Area/Perimeter Lessons (Levels 3-7)** - Input Overlay Panel System
**Path:** `src/features/lessons/lessonTypes/geometry/components/areaPerimeter/`

**Use this for:**
- ✅ iPad-optimized numeric input without canvas resize
- ✅ Slide-in overlay panel with compact keypad
- ✅ Floating "Enter Answer" button on canvas
- ✅ Touch-friendly 56px+ buttons
- ✅ Multiple input fields (area + perimeter)
- ✅ Smooth 300ms animations
- ✅ Modal success flow (panel closes → modal opens)

**Key Components:**
- `InputOverlayPanel` - Slide-in container from right
- `SlimMathKeypad` - Compact 3-column numeric keypad
- `EnterAnswerButton` - Floating CTA button (centered on canvas)
- `useInputOverlay` - State management hook

**Reference Implementations:**
- `Level3CalculateRectangle.jsx` - Multi-input (area + perimeter)
- `Level4RightTriangle.jsx` - Standard single-input
- `Level5AnyTriangle.jsx` - Best example (cleanest code)
- `Level6TrapezoidDecomposition.jsx` - Formula helpers
- `Level7MixedShapes.jsx` - Dynamic panel titles

**Key Patterns:**
```javascript
// 1. Setup with hook
const {
  panelOpen, inputValue, submitted,
  setInputValue, setSubmitted,
  openPanel, closePanel, resetAll,
} = useInputOverlay();

// 2. Canvas width (NO panelOpen dependency - stays full width)
const canvasWidth = useMemo(() => {
  return Math.min(windowWidth - 40, 1200);
}, [windowWidth]);  // ← panelOpen NOT included

// 3. Success flow: panel closes first, then modal
useEffect(() => {
  if (isCorrect && submitted && onComplete) {
    closePanel();  // Close panel first
    const timer = setTimeout(() => {
      onComplete(true);  // Show modal after 500ms
    }, 500);
    return () => clearTimeout(timer);
  }
}, [isCorrect, submitted, onComplete, closePanel]);

// 4. Floating Enter Answer button
{!panelOpen && (
  <EnterAnswerButton
    onClick={openPanel}
    disabled={submitted && isCorrect}
  />
)}

// 5. Overlay panel with keypad
<InputOverlayPanel
  visible={panelOpen}
  onClose={closePanel}
  title="Calculate Area"
>
  <InputLabel>Area (cm²):</InputLabel>
  <SlimMathKeypad
    value={inputValue}
    onChange={setInputValue}
    onSubmit={handleSubmit}
  />
  {/* Feedback + buttons inside panel */}
</InputOverlayPanel>
```

**Critical Design Decisions:**
- Canvas does NOT resize when panel opens (overlay-only approach)
- Button centered at `top: 50%; left: 50%; transform: translate(-50%, -50%)`
- Gray background with blue border (matches shape colors)
- 500ms delay between panel close and modal open
- Panel uses `transform: translateX()` for smooth GPU animation

**Full Documentation:** See `docs/guides/INPUT_OVERLAY_PANEL_SYSTEM.md` for complete migration guide, troubleshooting, and best practices.

---

## Pattern Selection Guide

When designing a new lesson, choose patterns based on your learning objectives:

| Learning Goal | Recommended Pattern | Reference Lesson |
|---------------|---------------------|------------------|
| Recognize vs Identify | Binary choice | ShapesLesson L1, SidesAndAnglesLesson L1 |
| Classify multiple items | Toggle buttons / Multi-select | SidesAndAnglesLesson L2, ShapesLesson L2 |
| Direct canvas interaction | Tap to select | SidesAndAnglesLesson L3, ShapesLesson L4 |
| Count or enumerate | Tap to count with badges | SidesAndAnglesLesson L4 |
| Step-by-step solving | Interactive tokens | OrderOfOperations L1-L3 |
| Build or construct | Draggable objects | SimilarTrianglesWordProblemsLesson L1 |
| Coordinate entry | MathKeypad with coordinates | SymmetryLesson L4 |
| Fraction entry | MathKeypad with fraction mode | SymmetryLesson (extensible) |
| Final evaluation | AnswerInput with validation | SymmetryLesson, OrderOfOperations L4 |
| Real-world application | Word problems | All lessons L5 |

---

## iPad Optimization Requirements

### 1. Universal Spacing Reduction

All spacing MUST use iPad-specific media queries:

```javascript
@media (max-width: 1024px) {
  padding: 12px; /* reduced from 20px */
  gap: 8px; /* reduced from 12px */
  margin-bottom: 8px; /* reduced from 12px */
}
```

### 2. Spacing Budget Guidelines

| Element | Desktop | iPad | Notes |
|---------|---------|------|-------|
| Wrapper padding | 20-30px | 12px | Outer container |
| Section padding | 16-20px | 12px | Canvas container, etc. |
| Section margins | 20px | 12px | Between sections |
| Header gaps | 12px | 8px | Between badge and title |
| Button padding | 12px 28px | 10px 24px | Touch-friendly |
| Text margins | 12px | 8px | Between paragraphs |
| Font sizes (body) | 15-16px | 14-15px | Readability maintained |
| Font sizes (title) | 20-22px | 18px | Headers |

### 3. Modal vs Inline Content

**CRITICAL:** Use modals for content that appears after interaction to avoid pushing content off-screen.

**Use Modals For:**
- ✅ Explanation after correct answer
- ✅ Hints (optional - can be popover)
- ✅ Error messages (if lengthy)
- ✅ Success celebrations

**Keep Inline:**
- ✅ Instructions (must be compact)
- ✅ Primary action buttons (e.g., "Enter Answer")

**Use InputOverlayPanel For:** (NEW STANDARD)
- ✅ **Numeric input** - SlimMathKeypad for calculations
- ✅ **Any input that needs a keyboard** - Overlay prevents content from being pushed off-screen
- ✅ **iPad landscape optimization** - Canvas slides left, figure stays visible

### 4. InputOverlayPanel Pattern (NEW - Required for Numeric Input)

**CRITICAL:** For ANY lesson requiring numeric input (calculations, measurements, coordinates, etc.), you MUST use the InputOverlayPanel pattern.

**Why:**
- ❌ **Problem with inline inputs:** Native keyboard pushes content off-screen on iPad
- ❌ **Problem with canvas resize:** Jarring UX when canvas shrinks to make room
- ✅ **Solution:** Overlay panel slides in from right, canvas slides left to keep figure visible

**Implementation Requirements:**

1. **Use `useInputOverlay` hook** (not raw useState)
   ```javascript
   import { useInputOverlay } from '../../hooks/useInputOverlay';
   const { panelOpen, inputValue, ... } = useInputOverlay();
   ```

2. **Static button below canvas** (not floating)
   ```javascript
   <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
     <CanvasContainer>{/* Canvas */}</CanvasContainer>
     {!panelOpen && (
       <ButtonContainer>
         <EnterAnswerButton variant="static" onClick={openPanel} />
       </ButtonContainer>
     )}
   </CanvasWrapper>
   ```

3. **Canvas slide animation** (75% of panel width)
   ```javascript
   const slideDistance = useMemo(() => {
     if (windowWidth <= 768) return 0; // Mobile: No slide
     const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
     return panelWidth * 0.75;
   }, [windowWidth]);
   ```

4. **Modal close tracking** (prevent modal from reappearing)
   ```javascript
   // Parent component
   const handleComplete = (success) => {
     if (success && !modalClosedWithX) {
       setIsComplete(true);
     }
   };
   ```

**Full Documentation:** See `docs/guides/INPUT_OVERLAY_PANEL_SYSTEM.md`

**Reference Implementation:**
- `components/areaPerimeter/Level3CalculateRectangle.jsx` (simplest example)
- `components/areaPerimeter/Level5AnyTriangle.jsx` (cleanest example)
- ✅ Feedback text (short, 1-2 lines max)

### 4. Dynamic Canvas Sizing

Canvas must shrink on iPad and further shrink when keyboard/keypad opens:

```javascript
const canvasWidth = useMemo(() => {
  const baseMax = Math.min(width - 40, 500);

  // With keypad open (Level 4 coordinate entry)
  if (needsKeypad && keypadOpen && width <= 1024) {
    return Math.min(baseMax, 320);
  }

  // iPad general optimization
  if (width <= 1024) {
    return Math.min(baseMax, 400);
  }

  return baseMax;
}, [width, needsKeypad, keypadOpen]);
```

**Canvas Size Guidelines:**
- Desktop: 500px max
- iPad (normal): 400px
- iPad (with keypad): 320px
- Must remain square for grid-based lessons

---

## Component Architecture

### Required Imports

```javascript
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import styled from "styled-components";
import { Stage, Layer, Rect, Line, Text, Circle } from "react-konva";
import ExplanationModal from "./ExplanationModal"; // Always use modal
```

### State Management Pattern

```javascript
function LessonComponent({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width, height } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Local UI state
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false); // If using keypad

  // Get current problem data
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";

  // Reset state when problem changes
  useEffect(() => {
    setShowHint(false);
    setIsComplete(false);
    // Reset other UI state...
  }, [currentQuestionIndex]);

  // ... rest of component
}
```

### File Structure

```
src/features/lessons/lessonTypes/
└── [subject]/
    ├── LessonName.jsx          // Main lesson component
    ├── ExplanationModal.jsx    // Reusable explanation modal
    ├── HintPopover.jsx         // Optional: Reusable hint popover
    └── index.js                // Export file
```

---

## Layout Structure

### Standard Layout Hierarchy

```jsx
<Wrapper>
  {/* 1. Fixed hint button (doesn't consume vertical space) */}
  {!isComplete && !showAnswer && !showHint && hint && (
    <TopHintButton onClick={() => setShowHint(true)}>
      Need a hint?
    </TopHintButton>
  )}

  {/* 2. Level header (compact) */}
  <LevelHeader>
    <LevelBadge>Level {level}</LevelBadge>
    <LevelTitle>{title}</LevelTitle>
  </LevelHeader>

  {/* 3. Instructions (compact, HTML-safe) */}
  <InstructionText
    dangerouslySetInnerHTML={{ __html: instruction }}
  />

  {/* 4. Visual/Canvas section */}
  <VisualSection>
    <Stage>{/* Konva content */}</Stage>
  </VisualSection>

  {/* 5. Interaction section (buttons/input) */}
  <InteractionSection>
    {showHint && <HintBox>{hint}</HintBox>}

    {/* Choice buttons OR AnswerInput */}
    <ButtonRow>
      <CheckButton>Check Answer</CheckButton>
      <ResetButton>Reset</ResetButton>
    </ButtonRow>
  </InteractionSection>

  {/* 6. Explanation modal (overlay, not in flow) */}
  {isComplete && (
    <ExplanationModal
      explanation={explanation}
      onTryAnother={handleTryAnother}
    />
  )}
</Wrapper>
```

### Vertical Space Budget Breakdown

| Section | Max Height (iPad) | Notes |
|---------|-------------------|-------|
| Wrapper padding | 24px | 12px top + 12px bottom |
| Level header | 35px | Badge + title + gap |
| Instructions | 30-40px | 1-2 lines max |
| Canvas section | 424px | 400px canvas + 24px padding |
| Interaction | 80-100px | Buttons, input, feedback |
| **Total** | **593-623px** | Fits in 768px viewport ✅ |

**Explanation modal:** Doesn't count (overlay)

---

## User Interaction Patterns

### 1. Hint System

**Fixed Top-Right Button (Recommended):**
```javascript
const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }
`;
```

**Options:**
- Inline HintBox (takes vertical space)
- Popover overlay (saves space, recommended)

### 2. Answer Submission Patterns

**Multiple Choice:**
```javascript
<ButtonRow>
  {choices.map((choice, idx) => (
    <ChoiceButton
      key={idx}
      onClick={() => handleChoiceClick(choice, idx)}
      disabled={isComplete}
      $isCorrect={isComplete && choice.correct}
    >
      {choice.text}
    </ChoiceButton>
  ))}
</ButtonRow>
```

**Text Input:**
```javascript
<AnswerInput
  correctAnswer={correctAnswer}
  answerType="array" // or "number", "text"
  onCorrect={() => setIsComplete(true)}
  onTryAnother={handleTryAnother}
  disabled={isComplete}
  placeholder="e.g. (7,2), (5,4)"
  onKeypadOpenChange={setKeypadOpen} // For coordinate entry
/>
```

**Grid Clicking (Interactive Canvas):**
```javascript
const handleStageClick = (e) => {
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();
  if (!pos) return;

  const col = Math.floor(pos.x / cellSize);
  const row = Math.floor(pos.y / cellSize);

  if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
    handleCellClick(row, col);
  }
};

// Transparent click layer on top of everything
<Layer>
  <Rect
    x={0}
    y={0}
    width={canvasWidth}
    height={canvasHeight}
    fill="transparent"
    onClick={handleStageClick}
    onTap={handleStageClick}
  />
</Layer>
```

### 3. Completion Flow

```javascript
const handleCheckAnswer = () => {
  if (answerIsCorrect) {
    setIsComplete(true); // Triggers modal
  } else {
    setFeedback("Try again!");
  }
};

const handleTryAnother = () => {
  setIsComplete(false);
  setShowHint(false);
  // Reset UI state
  triggerNewProblem(); // Get new problem from backend
};
```

---

### 🎯 **ShapesLesson.jsx - Binary Choice Button Pattern** ⭐ STANDARD

**Path:** `src/features/lessons/lessonTypes/geometry/ShapesLesson.jsx`

**🚨 CRITICAL: This is the STANDARD button style for ALL binary/multiple choice questions.**

**Use this pattern for:**
- ✅ Yes/No questions
- ✅ Positive/Negative/Zero choices
- ✅ Any multiple choice with 2-4 options
- ✅ Classification questions (e.g., shape types, slope types)

**Reference Implementation:** ShapesLesson Level 1 (`YesButton` and `NoButton`)

**Required Button Styling:**

```javascript
// Example: Positive/Negative/Zero buttons (like ShapesLesson L1)
const ChoiceButton = styled.button`
  flex: 1;
  min-width: 140px;
  min-height: 56px;
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;                          // Bold text
  border-radius: 10px;
  border: 3px solid ${props => props.$borderColor};  // 3px solid border
  background-color: transparent;             // ← CRITICAL: Transparent background
  color: ${props => props.$borderColor};     // ← Text matches border color
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:hover:not(:disabled) {
    background-color: ${props => props.$borderColor};  // ← Fill on hover
    color: white;                                       // ← Text becomes white
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  // Responsive scaling
  @media (max-width: 1024px) {
    min-width: 120px;
    padding: 12px 24px;
    font-size: 17px;
  }

  @media (max-width: 768px) {
    min-height: 48px;
    font-size: 16px;
    min-width: 100px;
    padding: 12px 20px;
  }
`;
```

**Usage Example:**

```javascript
// Level with binary choice (e.g., GraphingLines L1: Y-Intercept Sign)
<ChoiceButtonRow>
  <ChoiceButton
    onClick={() => handleChoiceClick("positive", 0, correctAnswer)}
    disabled={phase === "complete"}
    $borderColor="#10B981"  // Green
  >
    Positive
  </ChoiceButton>
  <ChoiceButton
    onClick={() => handleChoiceClick("negative", 1, correctAnswer)}
    disabled={phase === "complete"}
    $borderColor="#EF4444"  // Red
  >
    Negative
  </ChoiceButton>
  <ChoiceButton
    onClick={() => handleChoiceClick("zero", 2, correctAnswer)}
    disabled={phase === "complete"}
    $borderColor="#6B7280"  // Gray
  >
    Zero
  </ChoiceButton>
</ChoiceButtonRow>
```

**Standard Colors for Common Choices:**

| Choice Type | Color | Hex Code | Usage |
|-------------|-------|----------|-------|
| **Yes / Positive / Correct** | Green | `#10B981` | Affirmative choices |
| **No / Negative / Incorrect** | Red | `#EF4444` | Negative choices |
| **Zero / Neutral** | Gray | `#6B7280` | Neutral/zero values |
| **Undefined / Special** | Purple | `#8B5CF6` | Edge cases (e.g., undefined slope) |
| **Alternative option** | Blue | `#3B82F6` | Third/fourth options |
| **Warning option** | Orange | `#F59E0B` | Caution choices |

**Key Design Principles:**

1. **Transparent Background**: Buttons start with transparent background, NOT filled
2. **Colored Border**: 3px solid border in the choice color
3. **Matching Text**: Text color matches border color
4. **Hover Fill**: On hover, background fills with border color and text becomes white
5. **Bold Weight**: Font weight 700 for emphasis
6. **Touch Targets**: Minimum 56px height (desktop/tablet), 48px (mobile)

**Visual Flow:**

```
Default State:
┌─────────────────┐
│   Positive      │  ← Transparent background
└─────────────────┘     Green border (#10B981)
                        Green text

Hover State:
┌─────────────────┐
│   Positive      │  ← GREEN FILLED background
└─────────────────┘     Green border
                        WHITE text

Disabled State (after selection):
┌─────────────────┐
│   Positive      │  ← 50% opacity
└─────────────────┘     Grayed out
```

**Common Mistakes to Avoid:**

❌ **DON'T**: Use filled background initially
```javascript
background-color: #10B981;  // WRONG - breaks the pattern
color: white;
```

❌ **DON'T**: Skip the hover effect
```javascript
// WRONG - no hover state defined
```

❌ **DON'T**: Use different border widths
```javascript
border: 2px solid #10B981;  // WRONG - should be 3px
```

✅ **DO**: Follow ShapesLesson pattern exactly
```javascript
background-color: transparent;       // Correct
border: 3px solid ${borderColor};    // Correct
color: ${borderColor};               // Correct

&:hover:not(:disabled) {
  background-color: ${borderColor};  // Fills on hover
  color: white;                      // Text becomes white
}
```

**Animation Pattern (Wrong Answer):**

```javascript
const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

const ChoiceButton = styled.button`
  // ... other styles
  animation: ${props => props.$shake ? shakeAnim : 'none'} 0.6s;
`;
```

**Handler Pattern:**

```javascript
const handleChoiceClick = (choice, index, correctChoice) => {
  if (phase !== "interact" || shakingIdx !== null) return;

  if (choice === correctChoice) {
    setSelectedChoice(index);
    setTimeout(() => {
      setPhase("complete");
      setShowModal(true);  // Show ExplanationModal
      revealAnswer();
    }, 800);  // 800ms celebration delay
  } else {
    setShakingIdx(index);
    setWrongAttempts(prev => prev + 1);
    setTimeout(() => setShakingIdx(null), 600);  // 600ms shake duration
  }
};
```

**Required Features:**

- [ ] Transparent background initially
- [ ] 3px solid border
- [ ] Text color matches border color
- [ ] Hover fills background, text becomes white
- [ ] 800ms delay before showing ExplanationModal on correct answer
- [ ] 600ms shake animation on wrong answer
- [ ] Disabled state (50% opacity) after selection
- [ ] Responsive sizing (56px → 48px on mobile)
- [ ] Font weight 700 (bold)

**Lessons Using This Pattern:**

- ShapesLesson Level 1 (YesButton/NoButton) - **CANONICAL REFERENCE**
- SidesAndAnglesLesson Level 1 (Side/Angle binary choice)
- GraphingLinesLesson Level 1-2 (Y-intercept sign, Slope sign)
- Any lesson with binary/multiple choice questions

**When Creating New Lessons:**

If your lesson has binary or multiple choice questions, **YOU MUST USE THIS BUTTON STYLE**. Copy the styled component from ShapesLesson.jsx and adapt the colors to your specific choices.

---

## Styling Guidelines

### Theme-Aware Colors

**ALWAYS use theme colors, never hardcoded colors:**

```javascript
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  border: 2px solid ${(props) => props.theme.colors.border};
`;
```

**Available Theme Colors:**
- `pageBackground`
- `cardBackground`
- `textPrimary`
- `textSecondary`
- `textInverted`
- `buttonSuccess` (green)
- `buttonDanger` (red)
- `buttonNeutral`
- `info` (blue)
- `warning` (orange/yellow)
- `border`
- `hoverBackground`

### Styled Components Template

```javascript
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease-in-out; /* Smooth canvas resize */

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const CheckButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  min-height: 44px; /* Touch target minimum */

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;
```

---

## Canvas & Konva Best Practices

### 1. Canvas Setup

```javascript
// Responsive canvas sizing
const { width } = useWindowDimensions();
const konvaTheme = useKonvaTheme();

const canvasWidth = useMemo(() => {
  const baseMax = Math.min(width - 40, 500);
  if (width <= 1024) return Math.min(baseMax, 400);
  return baseMax;
}, [width]);

const cellSize = canvasWidth / gridSize;
const canvasHeight = canvasWidth; // Keep square

// Render canvas
<Stage width={canvasWidth} height={canvasHeight}>
  <Layer listening={false}>
    {/* Background */}
    <Rect
      x={0}
      y={0}
      width={canvasWidth}
      height={canvasHeight}
      fill={konvaTheme.canvasBackground}
    />

    {/* Content layers */}
  </Layer>

  {/* Interactive layer (if needed) */}
  <Layer>
    <Rect
      x={0}
      y={0}
      width={canvasWidth}
      height={canvasHeight}
      fill="transparent"
      onClick={handleStageClick}
      onTap={handleStageClick}
    />
  </Layer>
</Stage>
```

### 2. Theme-Aware Konva Elements

```javascript
import { useKonvaTheme } from "../../../../hooks";

const konvaTheme = useKonvaTheme();

// Use theme colors in Konva shapes
<Rect fill={konvaTheme.canvasBackground} />
<Line stroke={konvaTheme.shapeStroke} />
<Text fill={konvaTheme.labelText} />
<Circle fill={konvaTheme.gridRegular} />
```

### 3. Touch-Friendly Canvas Interactions

```javascript
// Use both onClick and onTap for touch devices
<Circle
  x={x}
  y={y}
  radius={10}
  onClick={handleClick}
  onTap={handleClick}
/>

// Minimum touch target: 44px diameter
const touchRadius = Math.max(radius, 22); // 44px diameter
```

### 4. Grid Rendering Pattern

```javascript
// Grid lines
{Array.from({ length: gridSize + 1 }).map((_, i) => {
  const isCenter = i === Math.floor(gridSize / 2);
  return (
    <React.Fragment key={`grid-${i}`}>
      {/* Horizontal line */}
      <Line
        points={[0, i * cellSize, canvasWidth, i * cellSize]}
        stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
        strokeWidth={isCenter ? 2.5 : 1}
        opacity={isCenter ? 0.6 : 0.3}
      />
      {/* Vertical line */}
      <Line
        points={[i * cellSize, 0, i * cellSize, canvasHeight]}
        stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
        strokeWidth={isCenter ? 2.5 : 1}
        opacity={isCenter ? 0.6 : 0.3}
      />
    </React.Fragment>
  );
})}
```

---

## Touch Device Optimization

### 1. Detect Touch Devices

```javascript
import { useIsTouchDevice } from "../../../../hooks";

const { isTouchDevice } = useIsTouchDevice();
```

### 2. MathKeypad for Coordinate Entry

When lessons require coordinate input like `(7,2), (5,4)`:

```javascript
<AnswerInput
  correctAnswer={correctAnswer}
  answerType="array"
  placeholder="e.g. (7,2), (5,4)"
  onKeypadOpenChange={setKeypadOpen} // Track keypad state
/>
```

**Canvas must shrink when keypad opens:**
```javascript
if (needsCoordinateEntry && keypadOpen && width <= 1024) {
  return Math.min(baseMax, 320); // Smaller canvas
}
```

### 3. Touch Targets

**Minimum size:** 44×44px (Apple HIG, WCAG 2.1)

```javascript
const Button = styled.button`
  min-height: 44px;
  min-width: 44px;
  padding: 10px 24px; /* Ensures 44px with content */
`;
```

### 4. Touch Actions

```javascript
// Always provide both mouse and touch events
<Shape
  onClick={handleClick}
  onTap={handleClick}
  onDragEnd={handleDragEnd}
  onTouchEnd={handleTouchEnd}
/>
```

---

## Accessibility

### 1. Semantic HTML

```javascript
<LevelTitle as="h2">Level 1: Introduction</LevelTitle>
<InstructionText as="p">Click cells to reflect...</InstructionText>
```

### 2. ARIA Labels

```javascript
<button aria-label="Check your answer">Check</button>
<button aria-label="Reset the grid">Reset</button>
<button aria-label="Show hint">Need a hint?</button>
```

### 3. Keyboard Navigation

**All interactive elements must be keyboard accessible:**
```javascript
const handleKeyPress = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    handleSubmit();
  }
};

<button
  onClick={handleSubmit}
  onKeyPress={handleKeyPress}
  tabIndex={0}
>
  Submit
</button>
```

### 4. Color Contrast

**Minimum contrast ratios:**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Use theme colors which are pre-validated for contrast**

---

## Testing Checklist

### iPad Testing (Required)

Test on each device size:
- [ ] iPad 10.2" portrait (810×1080)
- [ ] iPad 10.2" landscape (1080×810)
- [ ] iPad Pro 11" both orientations
- [ ] iPad Pro 12.9" both orientations

### Functional Tests

For each level:
- [ ] **No scrolling required** - All content fits on screen
- [ ] **Hint button** - Appears correctly, doesn't obstruct content
- [ ] **Instructions** - Clear, readable, 1-2 lines max
- [ ] **Canvas** - Visible, proportional, interactive
- [ ] **Input/Buttons** - Touch-friendly (44px min), easy to tap
- [ ] **Feedback** - Clear, visible, doesn't push content off-screen
- [ ] **Explanation modal** - Centers on screen, easy to dismiss
- [ ] **Try Another** - Resets state, loads new problem
- [ ] **Canvas shrinking** - Smooth transition when keypad opens (if applicable)
- [ ] **MathKeypad** - All buttons work, display shows typed values (if applicable)

### Cross-Browser Tests

- [ ] Safari (primary iPad browser)
- [ ] Chrome (desktop testing)
- [ ] Firefox (desktop testing)

### Dark Mode Test

- [ ] All colors use theme tokens
- [ ] Canvas background appropriate
- [ ] Text readable
- [ ] Buttons have sufficient contrast

### Performance Tests

- [ ] Canvas renders in < 100ms
- [ ] State updates are instant
- [ ] No lag when clicking grid cells
- [ ] Smooth animations (explanation modal, canvas resize)

---

## Common Patterns Library

### Pattern 1: Grid-Based Interactive Lesson

**Use for:** Reflection, Translation, Rotation, Shapes, etc.

```javascript
// State
const [clickedCells, setClickedCells] = useState(new Set());

// Click handler
const handleCellClick = (r, c) => {
  setClickedCells((prev) => {
    const next = new Set(prev);
    const key = `${r},${c}`;
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    return next;
  });
};

// Check answer
const handleCheckAnswer = () => {
  const expectedSet = new Set(correctCells.map(([r,c]) => `${r},${c}`));
  const isCorrect =
    clickedCells.size === expectedSet.size &&
    [...clickedCells].every(key => expectedSet.has(key));

  if (isCorrect) {
    setIsComplete(true);
  }
};
```

### Pattern 2: Multiple Choice Lesson

**Use for:** Classification, Identification, True/False

```javascript
const [selectedChoice, setSelectedChoice] = useState(null);

const handleChoiceClick = (choice, idx) => {
  setSelectedChoice(idx);

  if (choice.correct) {
    setIsComplete(true);
  } else {
    // Shake animation
    setShakingIdx(idx);
    setTimeout(() => setShakingIdx(null), 500);
  }
};
```

### Pattern 3: Coordinate Entry Lesson

**Use for:** Plotting, Graphing, Transformations

```javascript
const [keypadOpen, setKeypadOpen] = useState(false);

// Canvas shrinks when keypad opens
const canvasWidth = useMemo(() => {
  if (keypadOpen && width <= 1024) return 320;
  if (width <= 1024) return 400;
  return 500;
}, [width, keypadOpen]);

<AnswerInput
  answerType="array"
  placeholder="e.g. (7,2), (5,4)"
  onKeypadOpenChange={setKeypadOpen}
/>
```

---

## ExplanationModal Template

**File: `ExplanationModal.jsx`**

```javascript
import React from 'react';
import styled from 'styled-components';

function ExplanationModal({ explanation, onTryAnother }) {
  return (
    <ModalOverlay onClick={onTryAnother}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Correct! ✓</ModalTitle>
          <CloseButton onClick={onTryAnother}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{explanation}</ModalBody>
        <ModalFooter>
          <TryAnotherButton onClick={onTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.cardBackground};
  border: 3px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// ... rest of styled components
export default ExplanationModal;
```

---

## Migration Guide: Converting Old Lessons

### Step 1: Add iPad Media Queries

```javascript
// Before
const Wrapper = styled.div`
  padding: 20px;
`;

// After
const Wrapper = styled.div`
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;
```

### Step 2: Replace Inline Explanation with Modal

```javascript
// Before
{isComplete && (
  <ExplanationSection>
    <ExplanationText>{explanation}</ExplanationText>
    <TryAnotherButton>Try Another</TryAnotherButton>
  </ExplanationSection>
)}

// After
{isComplete && (
  <ExplanationModal
    explanation={explanation}
    onTryAnother={handleTryAnother}
  />
)}
```

### Step 3: Implement Dynamic Canvas Sizing

```javascript
// Before
const canvasWidth = Math.min(width - 40, 500);

// After
const canvasWidth = useMemo(() => {
  const baseMax = Math.min(width - 40, 500);
  if (width <= 1024) return Math.min(baseMax, 400);
  return baseMax;
}, [width]);
```

### Step 4: Add Keypad Support (if needed)

```javascript
const [keypadOpen, setKeypadOpen] = useState(false);

<AnswerInput
  onKeypadOpenChange={setKeypadOpen}
/>
```

---

## Quick Reference Card

### Vertical Space Targets (iPad)

```
Total budget: 768px (landscape) to 1024px (portrait)

Allocation:
- Wrapper padding: 24px (12px × 2)
- Header: 35px
- Instructions: 30-40px
- Canvas: 424px (400px + 24px padding)
- Interaction: 80-100px
- Modal: 0px (overlay)
─────────────────────
Total: ~593-623px ✅
```

### Must-Have Features

✅ Modal explanation
✅ iPad media queries on all spacing
✅ Dynamic canvas sizing
✅ Touch-friendly buttons (44px min)
✅ Theme-aware colors
✅ Smooth transitions
✅ Fixed hint button (optional)

### Files to Create

1. `LessonName.jsx` - Main component
2. `ExplanationModal.jsx` - Reusable modal
3. Backend generator - `lessonNameGenerator.js`
4. Backend config - `lesson_name.config.js`

---

## Support & Questions

**Reference Implementation:**
`/Users/avivkatz/Desktop/claude_cowork/frontends/lessons/src/features/lessons/lessonTypes/geometry/SymmetryLesson.jsx`

**Related Documents:**
- `/docs/REFLECTION_IPAD_OPTIMIZATION_PLAN.md` - Full optimization case study
- `/docs/MULTI_BOT_SYSTEM.md` - Bot coordination guidelines
- `/docs/guides/LESSON_LAYOUT_AUDIT_CHECKLIST.md` - Layout audit process

**For questions or clarifications, refer to the reflection lesson implementation as the gold standard.**
