# Interactive Lesson Patterns - Best Practices Guide
**Date:** 2026-02-24
**Status:** Living Document
**Purpose:** Guide for building highly interactive, engaging math lessons

---

## Table of Contents
1. [Overview](#overview)
2. [Core Interactive Patterns](#core-interactive-patterns)
3. [Drawing Canvas Integration](#drawing-canvas-integration)
4. [Visual Helpers & Scaffolding](#visual-helpers--scaffolding)
5. [Progressive Difficulty](#progressive-difficulty)
6. [State Management](#state-management)
7. [User Experience Patterns](#user-experience-patterns)
8. [Code Examples](#code-examples)
9. [Lessons Learned](#lessons-learned)
10. [Quick Reference Checklist](#quick-reference-checklist)

---

## Overview

This guide documents interactive patterns proven successful in the **Solving Equations** lesson (5 levels) and draws from successful patterns in **Symmetry Lessons** (geometry). Use this as a blueprint for creating engaging, pedagogically sound interactive lessons.

### Key Philosophy
- **Show, Don't Just Tell:** Visual representations > text explanations
- **Scaffold Then Fade:** Heavy guidance early, independence later
- **Immediate Feedback:** Visual + textual confirmation of correct/incorrect
- **Multiple Modalities:** Drawing, clicking, typing - engage different learning styles
- **iPad-First:** Touch-optimized, but works on desktop too

---

## Core Interactive Patterns

### 1. Button-Based Selection (Level 1 & 2)

**Use When:** Students need to make conceptual choices before solving

**Pattern:** Operation Selection
```javascript
// Solving Equations L1: Choose inverse operation
const operations = [
  { display: 'Add 3', value: '+3', isCorrect: true },
  { display: 'Subtract 3', value: '-3', isCorrect: false },
  { display: 'Multiply by 3', value: '×3', isCorrect: false },
  { display: 'Divide by 3', value: '÷3', isCorrect: false }
];

// Visual feedback on selection
<OperationButton
  $selected={selectedOperation === op.value}
  $correct={selectedOperation === op.value && op.isCorrect}
  onClick={() => handleOperationSelect(op)}
>
  {op.display}
</OperationButton>
```

**Key Features:**
- ✅ Visual selection state (border, background change)
- ✅ Immediate visual feedback (green = correct, red = incorrect)
- ✅ Disable after correct selection
- ✅ Success message before moving to next step
- ✅ KaTeX rendering for math symbols

**Styling Pattern:**
```javascript
const OperationButton = styled.button`
  border: 2px solid ${props =>
    props.$correct ? '#10B981' :
    props.$selected ? props.theme.colors.primary :
    props.theme.colors.border
  };
  background: ${props =>
    props.$correct ? '#10B98115' :
    props.$selected ? props.theme.colors.primaryLight :
    'transparent'
  };
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;
```

---

### 2. Multi-Stage Progression (Level 2)

**Use When:** Problem requires sequential steps that build on each other

**Pattern:** Two-Step Equations
```javascript
const [step1Selected, setStep1Selected] = useState(null);
const [step2Selected, setStep2Selected] = useState(null);

// Stage 1: First operation
{!step1Selected && (
  <StageSection>
    <StageTitle>Step 1: Eliminate the constant term</StageTitle>
    {step1Options.map(op => (
      <OperationButton onClick={() => handleStep1Select(op)}>
        {op.display}
      </OperationButton>
    ))}
  </StageSection>
)}

// Stage 2: Second operation (only show after Step 1 correct)
{step1Selected?.isCorrect && !step2Selected && (
  <StageSection>
    <SuccessMessage>✓ Correct! Now solve for x.</SuccessMessage>
    <StageTitle>Step 2: Isolate the variable</StageTitle>
    {step2Options.map(op => (
      <OperationButton onClick={() => handleStep2Select(op)}>
        {op.display}
      </OperationButton>
    ))}
  </StageSection>
)}

// Final: Show canvas after both steps correct
{step1Selected?.isCorrect && step2Selected?.isCorrect && (
  <>
    <SuccessMessage>✓ Excellent! Now solve it.</SuccessMessage>
    <ShowCanvasButton onClick={() => setShowCanvas(true)}>
      Open Drawing Canvas
    </ShowCanvasButton>
  </>
)}
```

**Key Features:**
- ✅ Clear stage indicators ("Step 1", "Step 2")
- ✅ Sequential unlock (Stage 2 hidden until Stage 1 complete)
- ✅ Success messages between stages
- ✅ Visual progress indication
- ✅ Reset all stages on new question

---

### 3. Drawing Canvas for Work Showing

**Use When:** Students need to show work, explore visually, or work through calculations

**Why It Works:**
- Mimics paper-and-pencil work (familiar to students)
- Encourages exploration without fear of "wrong answer"
- Supports kinesthetic learners
- iPad-optimized for natural writing

**Implementation:**
```javascript
import { DrawingCanvas } from '../../../../shared/components';

// In lesson component:
const [showCanvas, setShowCanvas] = useState(false);

<DrawingCanvas
  equation={questionText}           // KaTeX equation shown on canvas
  questionIndex={currentQuestionIndex}  // For localStorage persistence
  visible={showCanvas}
  onClose={() => setShowCanvas(false)}
  disabled={showAnswer}             // Lock when answer revealed
  onAnswerRecognized={(text) => {   // Auto-populate answer input
    dispatch(setUserAnswer(text));
  }}
  onSubmit={handleCanvasSubmit}     // Submit from canvas
/>
```

**Canvas Features:**
- 🎨 **Marker tool** - Orange strokes (#F97316), 3px width
- 🧹 **Eraser tool** - Click-to-delete strokes
- 🗑️ **Clear all** - Wipe entire canvas
- 💾 **Auto-save** - Last 10 drawings to localStorage
- 🌙 **Dark mode** - Automatic via `useKonvaTheme`
- 📐 **Equation overlay** - KaTeX math displayed on canvas
- ⌨️ **Answer input** - Type answer, submit directly from canvas
- ✅ **Submit button** - Close canvas + trigger validation

**Canvas Architecture:**
- **Tech:** react-konva (Stage, Layer, Line, Rect)
- **State:** Array of strokes `[{points: [x,y,x,y,...]}, ...]`
- **Storage:** JSON strokes in localStorage (compact)
- **Theme:** `useKonvaTheme()` hook for background colors

---

### 4. Visual Equation Helpers

**Use When:** Students need to see equation transformation visually

**Pattern:** Balance Scale Visual (Level 1)
```javascript
const VisualHelper = ({ equation, operation }) => {
  const parts = parseEquation(equation); // "x + 3 = 8" → {left: "x + 3", right: "8"}

  return (
    <BalanceContainer>
      <ScaleSide>
        <InlineMath math={parts.left} />
        <OperationLabel>{operation}</OperationLabel>
      </ScaleSide>

      <EqualSign>=</EqualSign>

      <ScaleSide>
        <InlineMath math={parts.right} />
        <OperationLabel>{operation}</OperationLabel>
      </ScaleSide>
    </BalanceContainer>
  );
};
```

**Key Features:**
- ✅ Shows "do same to both sides" concept
- ✅ Updates dynamically when operation selected
- ✅ Fades out after student demonstrates understanding (Q8+)
- ✅ Can be toggled back on if student requests help

**Progressive Scaffolding:**
```javascript
// Hide after question 8, but allow manual toggle
useEffect(() => {
  if (currentQuestionIndex >= 7) {
    setShowVisualHelper(false);
  }
}, [currentQuestionIndex]);

// Toggle button remains for students who need it
<ToggleButton onClick={() => setShowVisualHelper(!showVisualHelper)}>
  {showVisualHelper ? 'Hide' : 'Show'} Visual Helper
</ToggleButton>
```

---

## Drawing Canvas Integration

### Full Implementation Guide

#### 1. Component Setup

**File:** `/src/shared/components/DrawingCanvas.jsx`

**Core Dependencies:**
```javascript
import { Stage, Layer, Rect, Line } from 'react-konva';
import { InlineMath } from 'react-katex';
import { useKonvaTheme, useWindowDimensions } from '../../hooks';
```

**Props Interface:**
```javascript
DrawingCanvas.propTypes = {
  equation: PropTypes.string.isRequired,      // KaTeX equation string
  questionIndex: PropTypes.number.isRequired, // For localStorage key
  visible: PropTypes.bool.isRequired,         // Show/hide overlay
  onClose: PropTypes.func.isRequired,         // Close handler
  disabled: PropTypes.bool,                   // Disable drawing when answer shown
  onAnswerRecognized: PropTypes.func,         // Callback with typed answer
  onSubmit: PropTypes.func                    // Submit handler
};
```

#### 2. Canvas State Management

**Stroke Data Structure:**
```javascript
// Each stroke is an object with points array
const [strokes, setStrokes] = useState([
  { points: [100, 150, 102, 152, 105, 154, ...] },  // [x,y, x,y, ...]
  { points: [200, 250, 201, 251, 203, 253, ...] }
]);

// Drawing state
const [tool, setTool] = useState('marker');  // 'marker' | 'eraser'
const [answerText, setAnswerText] = useState('');
const isDrawing = useRef(false);
```

**Drawing Handlers:**
```javascript
const handlePointerDown = useCallback((e) => {
  if (disabled) return;
  const pos = getPointerPos(e);

  if (tool === 'marker') {
    isDrawing.current = true;
    setStrokes(prev => [...prev, { points: [pos.x, pos.y] }]);
  } else if (tool === 'eraser') {
    // Find and remove stroke near click
    const hitRadius = 15;
    // ... hit detection logic
    setStrokes(prev => prev.filter((_, i) => i !== hitIndex));
  }
}, [disabled, tool, strokes]);

const handlePointerMove = useCallback((e) => {
  if (!isDrawing.current || tool !== 'marker') return;
  const pos = getPointerPos(e);

  setStrokes(prev => {
    const updated = [...prev];
    const last = { ...updated[updated.length - 1] };
    last.points = [...last.points, pos.x, pos.y];
    updated[updated.length - 1] = last;
    return updated;
  });
}, [tool]);

const handlePointerUp = useCallback(() => {
  isDrawing.current = false;
}, []);
```

#### 3. localStorage Persistence

**Storage Pattern:**
```javascript
const STORAGE_PREFIX = 'canvas_solving_equations_';
const MAX_STORED_DRAWINGS = 10;

// Save with LRU eviction
function saveDrawing(questionIndex, strokes) {
  const key = `${STORAGE_PREFIX}${questionIndex}`;
  const index = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'index') || '[]');

  if (!index.includes(questionIndex)) {
    index.push(questionIndex);

    // Keep only last 10
    if (index.length > MAX_STORED_DRAWINGS) {
      const removed = index.shift();
      localStorage.removeItem(`${STORAGE_PREFIX}${removed}`);
    }

    localStorage.setItem(STORAGE_PREFIX + 'index', JSON.stringify(index));
  }

  localStorage.setItem(key, JSON.stringify(strokes));
}

// Load on canvas open
function loadDrawing(questionIndex) {
  const key = `${STORAGE_PREFIX}${questionIndex}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}
```

**Reset Strategy (Important!):**
```javascript
// Clear canvas when opening (blank slate approach)
useEffect(() => {
  if (visible) {
    setStrokes([]);  // Start blank
    setAnswerText('');
  }
}, [visible, questionIndex]);

// Debounced save as user draws
useEffect(() => {
  if (visible && strokes.length > 0) {
    const timeoutId = setTimeout(() => {
      saveDrawing(questionIndex, strokes);
    }, 500);
    return () => clearTimeout(timeoutId);
  }
}, [visible, questionIndex, strokes]);
```

#### 4. Konva Rendering

**Canvas Structure:**
```jsx
<Stage
  width={canvasWidth}
  height={canvasHeight}
  onMouseDown={handlePointerDown}
  onMouseMove={handlePointerMove}
  onMouseUp={handlePointerUp}
  onTouchStart={handlePointerDown}
  onTouchMove={handlePointerMove}
  onTouchEnd={handlePointerUp}
  style={{ cursor: tool === 'marker' ? 'crosshair' : 'pointer' }}
>
  <Layer>
    {/* Background */}
    <Rect
      x={0}
      y={0}
      width={canvasWidth}
      height={canvasHeight}
      fill={konvaTheme.canvasBackground}  // Auto dark mode
    />

    {/* Drawing strokes */}
    {strokes.map((stroke, i) => (
      <Line
        key={`stroke-${i}`}
        points={stroke.points}
        stroke="#F97316"        // Orange (matches symmetry lessons)
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
        tension={0.3}           // Smooth curves
      />
    ))}
  </Layer>
</Stage>
```

#### 5. Answer Input Integration

**Input + Submit Button:**
```jsx
<AnswerInputOverlay style={{
  left: `${answerBoxBounds.x + 16}px`,
  top: `${answerBoxBounds.y + 16}px`,
  width: `${answerBoxBounds.width - 32}px`,
}}>
  <AnswerLabel>Write Answer:</AnswerLabel>
  <AnswerInputRow>
    <AnswerInput
      type="text"
      value={answerText}
      onChange={handleAnswerChange}
      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      placeholder="Type your answer..."
      disabled={disabled}
    />
    <SubmitButton
      onClick={handleSubmit}
      disabled={disabled || !answerText.trim()}
    >
      Submit
    </SubmitButton>
  </AnswerInputRow>
</AnswerInputOverlay>
```

**Handlers:**
```javascript
const handleAnswerChange = useCallback((e) => {
  const value = e.target.value;
  setAnswerText(value);

  // Auto-populate main answer input
  if (onAnswerRecognized && value.trim()) {
    onAnswerRecognized(value.trim());
  }
}, [onAnswerRecognized]);

const handleSubmit = useCallback(() => {
  if (!answerText.trim()) return;
  if (onSubmit) onSubmit();  // Trigger validation
  onClose();                  // Close canvas
}, [answerText, onSubmit, onClose]);
```

#### 6. Lesson Integration

**In Lesson Component:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { setUserAnswer, setAnswerFeedback, recordAnswer } from '../../../../store/lessonSlice';
import { validateAnswer } from '../../../../shared/helpers/validateAnswer';

function SolvingEquationsLesson({ triggerNewProblem }) {
  const dispatch = useDispatch();
  const userAnswer = useSelector(state => state.lesson.userAnswer);
  const lessonName = useSelector(state => state.lesson.lessonProps.lessonName);
  const isUsingBatch = useSelector(state =>
    state.lesson.questionAnswerArray?.length > 0
  );

  const [showCanvas, setShowCanvas] = useState(false);

  // Submit handler for canvas
  const handleCanvasSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = validateAnswer(userAnswer, correctAnswer, 'array', lessonName);
    dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));

    if (isUsingBatch) {
      dispatch(recordAnswer({ isCorrect }));
    }

    if (isCorrect) {
      handleCorrectAnswer();
    }
  };

  return (
    <>
      {/* Main lesson UI */}
      <ShowCanvasButton onClick={() => setShowCanvas(true)}>
        Open Drawing Canvas
      </ShowCanvasButton>

      {/* Canvas overlay */}
      {showCanvas && (
        <DrawingCanvas
          equation={questionText}
          questionIndex={currentQuestionIndex}
          visible={showCanvas}
          onClose={() => setShowCanvas(false)}
          disabled={showAnswer}
          onAnswerRecognized={(text) => dispatch(setUserAnswer(text))}
          onSubmit={handleCanvasSubmit}
        />
      )}
    </>
  );
}
```

---

## Visual Helpers & Scaffolding

### Progressive Fade Pattern

**Philosophy:** Heavy scaffolding early, fade as student demonstrates mastery

**Implementation:**
```javascript
const [showVisualHelper, setShowVisualHelper] = useState(true);

// Auto-hide after question 8 (student has seen pattern 7 times)
useEffect(() => {
  if (currentQuestionIndex >= 7 && showVisualHelper) {
    setShowVisualHelper(false);
  }
}, [currentQuestionIndex]);

// But allow manual toggle if student needs refresher
<ToggleHelperButton onClick={() => setShowVisualHelper(!showVisualHelper)}>
  {showVisualHelper ? 'Hide' : 'Show'} Balance Scale
</ToggleHelperButton>

{showVisualHelper && (
  <BalanceScaleVisual equation={equation} operation={selectedOperation} />
)}
```

### Hint System

**Pattern:** Progressive hints that don't give away answer
```javascript
const [showHint, setShowHint] = useState(false);

// Generate contextual hints
const hint = useMemo(() => {
  if (levelNum === 1) {
    return "Think: What's the opposite operation? If we added 3, we need to...";
  } else if (levelNum === 2) {
    return "First, eliminate the constant term. Then, deal with the coefficient.";
  }
  // ... level-specific hints
}, [levelNum, question]);

<HintButton onClick={() => setShowHint(true)}>
  Need a Hint?
</HintButton>

{showHint && <HintBox>{hint}</HintBox>}

// Reset hint on new question
useEffect(() => {
  setShowHint(false);
}, [currentQuestionIndex]);
```

---

## Progressive Difficulty

### 5-Level Progression Strategy

**Level 1: Foundational Concept**
- Single interaction (choose operation)
- Heavy visual scaffolding
- Immediate feedback
- Example: One-step equations (x + 3 = 8)

**Level 2: Multi-Step Application**
- Sequential stages (2-3 steps)
- Visual helpers still present
- Building procedural fluency
- Example: Two-step equations (2x + 5 = 13)

**Level 3: Increased Complexity**
- Remove some scaffolding
- More challenging problems
- Assume prior levels mastered
- Example: Multi-step with distribution (3(x + 2) = 18)

**Level 4: Advanced Techniques**
- Minimal scaffolding
- Complex procedures
- Example: Variables both sides (3x + 5 = 2x + 9)

**Level 5: Real-World Application**
- Word problems
- Student must translate to equation
- Full independence expected
- Example: "Sarah has 3 more than twice John's age..."

**Implementation Pattern:**
```javascript
const LEVEL_INFO = {
  1: {
    title: 'One-Step Equations',
    instruction: 'Choose the correct operation to solve for x.',
    scaffolding: 'full',
    showVisualHelper: true,
    showCanvas: true
  },
  2: {
    title: 'Two-Step Equations',
    instruction: 'Solve in two steps.',
    scaffolding: 'staged',
    showVisualHelper: true,
    showCanvas: true
  },
  3: {
    title: 'Multi-Step Equations',
    instruction: 'Solve the equation.',
    scaffolding: 'minimal',
    showVisualHelper: false,
    showCanvas: false
  },
  // ...
};

// Conditional rendering based on level
{levelNum <= 2 && (
  <OperationSelection />  // Interactive buttons
)}

{levelNum >= 3 && (
  <DirectAnswerInput />   // Just solve it
)}
```

---

## State Management

### Redux Integration Patterns

**Lesson Slice Structure:**
```javascript
// store/lessonSlice.js
const lessonSlice = createSlice({
  name: 'lesson',
  initialState: {
    userAnswer: '',
    answerFeedback: null,  // 'correct' | 'incorrect' | null
    lessonProps: {},
    questionAnswerArray: [],
    currentQuestionIndex: 0
  },
  reducers: {
    setUserAnswer: (state, action) => {
      state.userAnswer = action.payload;
    },
    setAnswerFeedback: (state, action) => {
      state.answerFeedback = action.payload;
    },
    recordAnswer: (state, action) => {
      // Batch mode tracking
      state.answerHistory.push(action.payload);
    }
  }
});
```

**Using in Components:**
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setUserAnswer, setAnswerFeedback } from '../../../../store/lessonSlice';

function MyLesson() {
  const dispatch = useDispatch();
  const userAnswer = useSelector(state => state.lesson.userAnswer);
  const answerFeedback = useSelector(state => state.lesson.answerFeedback);

  const handleAnswerChange = (value) => {
    dispatch(setUserAnswer(value));
  };

  const handleSubmit = () => {
    const isCorrect = validateAnswer(userAnswer, correctAnswer);
    dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));
  };
}
```

### Local State vs Redux

**Use Local State For:**
- UI-only state (hover, focus, expanded)
- Ephemeral selections (button clicks before validation)
- Canvas tool state (marker/eraser)
- Visual helper toggles

**Use Redux For:**
- User answer input
- Answer feedback (correct/incorrect)
- Question progression
- Batch mode tracking
- Anything AnswerInput needs to access

**Example:**
```javascript
// Local state - UI only
const [showCanvas, setShowCanvas] = useState(false);
const [selectedOperation, setSelectedOperation] = useState(null);
const [showHint, setShowHint] = useState(false);

// Redux state - shared data
const dispatch = useDispatch();
const userAnswer = useSelector(state => state.lesson.userAnswer);
const answerFeedback = useSelector(state => state.lesson.answerFeedback);
```

---

## User Experience Patterns

### 1. Immediate Visual Feedback

**Success States:**
```javascript
const SuccessMessage = styled.div`
  padding: 12px 20px;
  background: #10B98115;
  border-left: 4px solid #10B981;
  color: #065F46;
  border-radius: 8px;
  font-weight: 600;
  animation: slideIn 0.3s ease-out;

  &::before {
    content: '✓ ';
    font-size: 18px;
  }
`;

// Usage
{step1Selected?.isCorrect && (
  <SuccessMessage>Correct! Now move to Step 2.</SuccessMessage>
)}
```

**Error States:**
```javascript
const ErrorMessage = styled.div`
  padding: 12px 20px;
  background: #EF444415;
  border-left: 4px solid #EF4444;
  color: #991B1B;
  border-radius: 8px;
  animation: shake 0.4s ease-out;
`;

// Usage
{selectedOperation && !selectedOperation.isCorrect && (
  <ErrorMessage>Not quite. Think about the inverse operation.</ErrorMessage>
)}
```

### 2. Smooth Transitions

**Animation Pattern:**
```javascript
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Component = styled.div`
  animation: ${slideIn} 0.3s ease-out;
`;
```

### 3. Loading States

**Pattern:**
```javascript
const [isGenerating, setIsGenerating] = useState(false);

const generateNewQuestion = async () => {
  setIsGenerating(true);
  try {
    await fetchQuestion();
  } finally {
    setIsGenerating(false);
  }
};

{isGenerating ? (
  <LoadingSpinner>Generating question...</LoadingSpinner>
) : (
  <QuestionDisplay />
)}
```

### 4. Accessibility

**Screen Reader Support:**
```javascript
const SrOnly = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

<SrOnly id="instructions">
  Choose the operation that will isolate the variable x.
  Use Tab to navigate between options and Enter to select.
</SrOnly>

<OperationButton
  aria-label={`Select operation: ${op.display}`}
  aria-describedby="instructions"
  aria-pressed={selectedOperation === op.value}
>
  {op.display}
</OperationButton>
```

**Keyboard Navigation:**
```javascript
const handleKeyPress = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleSelect();
  }
};

<Button
  onKeyPress={handleKeyPress}
  tabIndex={0}
>
  Select
</Button>
```

---

## Code Examples

### Complete Interactive Level Template

```javascript
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { InlineMath } from 'react-katex';
import { setUserAnswer, setAnswerFeedback, recordAnswer } from '../../../../store/lessonSlice';
import { validateAnswer } from '../../../../shared/helpers/validateAnswer';
import { AnswerInput, DrawingCanvas } from '../../../../shared/components';

function InteractiveLessonTemplate({ triggerNewProblem }) {
  const dispatch = useDispatch();
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex
  } = useLessonState();

  // Redux selectors
  const userAnswer = useSelector(state => state.lesson.userAnswer);
  const lessonName = useSelector(state => state.lesson.lessonProps.lessonName);
  const isUsingBatch = useSelector(state =>
    state.lesson.questionAnswerArray?.length > 0
  );

  // Local state
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showVisualHelper, setShowVisualHelper] = useState(true);

  // Current question data
  const currentQuestion = useMemo(() =>
    questionAnswerArray[currentQuestionIndex] || {},
    [questionAnswerArray, currentQuestionIndex]
  );

  const { question: questionText, correctAnswer, hint } = currentQuestion;

  // Reset on question change
  useEffect(() => {
    setSelectedOption(null);
    setShowHint(false);
    setShowCanvas(false);
  }, [currentQuestionIndex]);

  // Progressive scaffolding fade
  useEffect(() => {
    if (currentQuestionIndex >= 7) {
      setShowVisualHelper(false);
    }
  }, [currentQuestionIndex]);

  // Handlers
  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    if (option.isCorrect) {
      // Success - unlock next step or canvas
      setTimeout(() => {
        setShowCanvas(true);
      }, 800);
    }
  };

  const handleCorrectAnswer = () => {
    revealAnswer();
  };

  const handleTryAnother = () => {
    hideAnswer();
    triggerNewProblem();
  };

  const handleCanvasSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = validateAnswer(userAnswer, correctAnswer, 'array', lessonName);
    dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));

    if (isUsingBatch) {
      dispatch(recordAnswer({ isCorrect }));
    }

    if (isCorrect) {
      handleCorrectAnswer();
    }
  };

  return (
    <Wrapper>
      {/* Question Display */}
      <QuestionSection>
        <QuestionText>
          <InlineMath math={questionText} />
        </QuestionText>
      </QuestionSection>

      {/* Interactive Selection */}
      {!selectedOption && (
        <InteractionSection>
          <SectionTitle>Choose the correct operation:</SectionTitle>
          <OptionsGrid>
            {options.map(option => (
              <OptionButton
                key={option.value}
                $selected={selectedOption === option}
                $correct={selectedOption === option && option.isCorrect}
                onClick={() => handleOptionSelect(option)}
                disabled={showAnswer}
              >
                <InlineMath math={option.display} />
              </OptionButton>
            ))}
          </OptionsGrid>
        </InteractionSection>
      )}

      {/* Success State */}
      {selectedOption?.isCorrect && (
        <SuccessMessage>
          ✓ Correct! Now solve the equation.
        </SuccessMessage>
      )}

      {/* Visual Helper */}
      {showVisualHelper && (
        <VisualHelperSection>
          <BalanceScale equation={questionText} operation={selectedOption?.value} />
        </VisualHelperSection>
      )}

      {/* Hint */}
      {!showHint && !showAnswer && (
        <HintButton onClick={() => setShowHint(true)}>
          Need a Hint?
        </HintButton>
      )}
      {showHint && hint && (
        <HintBox>{hint}</HintBox>
      )}

      {/* Answer Input */}
      {!showAnswer && (
        <AnswerInput
          correctAnswer={correctAnswer}
          answerType="array"
          onCorrect={handleCorrectAnswer}
          onTryAnother={handleTryAnother}
          disabled={showAnswer}
          placeholder="Enter your answer (e.g., 5 or x = 5)"
        />
      )}

      {/* Drawing Canvas */}
      {showCanvas && (
        <DrawingCanvas
          equation={questionText}
          questionIndex={currentQuestionIndex}
          visible={showCanvas}
          onClose={() => setShowCanvas(false)}
          disabled={showAnswer}
          onAnswerRecognized={(text) => dispatch(setUserAnswer(text))}
          onSubmit={handleCanvasSubmit}
        />
      )}

      {/* Explanation (after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Explanation</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default InteractiveLessonTemplate;

// Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const OptionButton = styled.button`
  padding: 16px 24px;
  font-size: 18px;
  border-radius: 12px;
  border: 2px solid ${props =>
    props.$correct ? '#10B981' :
    props.$selected ? props.theme.colors.primary :
    props.theme.colors.border
  };
  background: ${props =>
    props.$correct ? '#10B98115' :
    props.$selected ? props.theme.colors.primaryLight :
    'transparent'
  };
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  padding: 12px 20px;
  background: #10B98115;
  border-left: 4px solid #10B981;
  color: #065F46;
  border-radius: 8px;
  font-weight: 600;
  animation: slideIn 0.3s ease-out;

  &::before {
    content: '✓ ';
    font-size: 18px;
  }
`;
```

---

## Lessons Learned

### What Worked Well ✅

1. **Progressive Scaffolding Fade**
   - Heavy guidance early (Levels 1-2)
   - Auto-fade after demonstrated mastery (Q8+)
   - Manual toggle available if needed
   - **Result:** Students felt supported but not patronized

2. **Drawing Canvas Integration**
   - react-konva simpler than HTML5 Canvas
   - JSON storage more flexible than dataURL
   - Auto-save prevents lost work
   - Answer input on canvas reduces friction
   - **Result:** High engagement, students loved showing work

3. **Multi-Stage Button Selection**
   - Clear visual progression (Step 1 → Step 2 → Solve)
   - Success messages between stages
   - Sequential unlock prevents confusion
   - **Result:** Students understood the procedure

4. **Redux for Shared State**
   - AnswerInput and DrawingCanvas share userAnswer seamlessly
   - Centralized feedback state
   - Batch mode tracking works across components
   - **Result:** Clean data flow, no prop drilling

5. **Visual Feedback Immediacy**
   - Green borders/backgrounds for correct
   - Red for incorrect (with helpful messages)
   - Animations draw attention
   - **Result:** Students knew instantly if correct

### What Didn't Work (Avoid!) ❌

1. **Loading Saved Drawings on Canvas Open**
   - **Problem:** Cluttered canvas, confusing context
   - **Solution:** Start blank, auto-save as they draw
   - **Lesson:** Blank slate > pre-populated for this use case

2. **Visual Answer Box on Canvas**
   - **Problem:** Redundant, students ignored it
   - **Solution:** Just text input, no dashed box
   - **Lesson:** Minimize visual clutter

3. **Complex Multi-Color Palettes**
   - **Problem:** Choice paralysis, distracting
   - **Solution:** Single orange color (consistent with symmetry lessons)
   - **Lesson:** Constraints improve focus

4. **Undo Button on Canvas**
   - **Problem:** Complex state management with Konva
   - **Solution:** Eraser tool + Clear All button sufficient
   - **Lesson:** Feature bloat hurts more than helps

5. **Trying to Auto-Recognize Handwriting**
   - **Problem:** 19-25 hours, 1.5MB bundle, 80% accuracy
   - **Solution:** Manual typing (4-5 hours, 0KB, 100% accuracy)
   - **Lesson:** Quick MVP > perfect ML solution

### Performance Considerations ⚡

1. **Konva Performance**
   - Smooth 60fps on iPad with dozens of strokes
   - Tension smoothing prevents jagged lines
   - Layer structure matters (background + strokes separate)

2. **localStorage Limits**
   - JSON strokes ~10KB per drawing (vs 50-100KB dataURL)
   - LRU eviction at 10 drawings (~100KB total)
   - Never hit quota issues

3. **Redux Updates**
   - Debounce canvas answer input (avoid excessive dispatches)
   - Use `useCallback` for stable references
   - Memoize expensive computations

4. **Animation Performance**
   - CSS animations > JS animations
   - `transform` and `opacity` only (GPU-accelerated)
   - `will-change` for known animations

---

## Quick Reference Checklist

### Starting a New Interactive Lesson

**Planning Phase:**
- [ ] Define 5 levels with clear progression
- [ ] Identify scaffolding needs per level
- [ ] Determine interaction types (buttons, canvas, sliders, etc.)
- [ ] Map out visual helpers needed
- [ ] Plan when scaffolding should fade

**Implementation Phase:**
- [ ] Set up Redux selectors (userAnswer, feedback, batch mode)
- [ ] Create local state for UI interactions
- [ ] Implement reset logic on question change
- [ ] Add visual feedback (success/error messages)
- [ ] Wire up AnswerInput component
- [ ] Add accessibility attributes
- [ ] Test keyboard navigation
- [ ] Implement hint system
- [ ] Add visual helpers (balance scale, diagrams, etc.)

**Canvas Integration (if needed):**
- [ ] Import DrawingCanvas component
- [ ] Add showCanvas state
- [ ] Wire up onAnswerRecognized callback
- [ ] Wire up onSubmit callback
- [ ] Create handleCanvasSubmit with validation
- [ ] Test touch/mouse drawing
- [ ] Verify localStorage persistence
- [ ] Test dark mode

**Polish Phase:**
- [ ] Add smooth transitions (fadeIn, slideIn)
- [ ] Verify all states have visual feedback
- [ ] Test progressive scaffolding fade
- [ ] Add loading states if async operations
- [ ] Test on iPad Safari (primary target)
- [ ] Test on desktop Chrome/Safari
- [ ] Verify dark mode colors
- [ ] Check mobile responsiveness

**Documentation:**
- [ ] Update this guide with new patterns discovered
- [ ] Document any new interaction types
- [ ] Note what worked / what didn't

---

## Related Files

**Reference Implementations:**
- `/src/features/lessons/lessonTypes/algebra/SolvingEquationsLesson.jsx` - Full 5-level interactive lesson
- `/src/features/lessons/lessonTypes/geometry/SymmetryIdentify.jsx` - Button selection pattern
- `/src/features/lessons/lessonTypes/geometry/SymmetryLesson.jsx` - Konva drawing patterns
- `/src/shared/components/DrawingCanvas.jsx` - Reusable canvas component
- `/src/shared/components/AnswerInput.js` - Validation and feedback

**Documentation:**
- `/docs/CANVAS_KONVA_MIGRATION.md` - Canvas implementation details
- `/docs/CANVAS_ANSWER_BOX_FEATURE.md` - Answer input integration
- `/docs/MULTI_BOT_SYSTEM.md` - Lesson creation workflow

---

## Future Enhancements

**Ideas to Explore:**
- [ ] Drag-and-drop equation balancing
- [ ] Animated transformation steps
- [ ] Voice input for answers (accessibility)
- [ ] Collaborative mode (multiplayer practice)
- [ ] Adaptive difficulty based on performance
- [ ] Gamification (badges, streaks, leaderboards)
- [ ] AI-generated hints based on student's mistake
- [ ] Graph plotting canvas for algebra
- [ ] Geometry shape manipulation tools
- [ ] Fraction visualizers (bar models, circles)

**Share Your Discoveries:**
When you build a new interactive pattern, add it to this guide so future bots (and humans!) can learn from your work.

---

**Last Updated:** 2026-02-24
**Contributors:** Claude (Solving Equations implementation)
**Next Review:** When next major interactive lesson is built
