# Lesson Style Guide
**Version:** 1.0
**Last Updated:** February 23, 2026
**Reference Implementation:** Reflection Lesson (SymmetryLesson.jsx)

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

### 🌟 **SymmetryLesson.jsx** - Gold Standard (Primary Reference)
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
- ✅ Input fields
- ✅ Primary action buttons
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
