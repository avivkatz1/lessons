# Input Overlay Panel System Guide

**Version:** 2.0
**Last Updated:** February 26, 2026
**Status:** Production-Ready - iPad Standard
**Implemented In:** Geometry Area/Perimeter Lessons (Levels 3-7), All Congruent Triangles Lessons, SymmetryLesson

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Implementation Pattern](#implementation-pattern)
5. [Key Design Decisions](#key-design-decisions)
6. [Migration Checklist](#migration-checklist)
7. [Common Patterns](#common-patterns)
8. [Touch Optimization](#touch-optimization)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Input Overlay Panel system provides a **touch-optimized, iPad-friendly input solution** for geometry lessons. It replaces inline input fields with a slide-in overlay panel containing a compact math keypad.

### Why This System?

**Problem Solved:**
- Traditional inline inputs + native keyboards push content off-screen on iPad
- Numeric keypads are too large (300-400px) for iPad landscape mode
- Canvas resizing creates jarring UX when input opens

**Solution:**
- Panel overlays on top (canvas stays full width - **no resize**)
- SlimMathKeypad is compact (3 columns vs 4, 15 keys vs 17)
- Smooth 300ms slide-in animation from right
- Floating "Enter Answer" button centered on canvas

### Visual Flow

```
1. User sees canvas with floating "Enter Answer" button (centered)
   ┌─────────────────────────────────────┐
   │         Canvas Area                 │
   │                                     │
   │      ┌──────────────────┐          │
   │      │  Enter Answer    │          │
   │      └──────────────────┘          │
   └─────────────────────────────────────┘

2. User taps button → Panel slides in from right (300ms)
   ┌────────────────────┬────────────────┐
   │  Canvas (same size)│ ┌────────────┐ │
   │                    │ │ Area (cm²):│ │
   │                    │ │ [keypad]   │ │
   │                    │ │ [feedback] │ │
   │                    │ └────────────┘ │
   └────────────────────┴────────────────┘

3. User submits → Success modal appears (panel closes first)
```

### Enhanced Visual Flow (v2.0 - Recommended)

**NEW STANDARD:** Static button below canvas + canvas slide animation

```
1. User sees canvas with STATIC button below (not floating)
   ┌─────────────────────────────────────┐
   │         Canvas Area                 │
   │      [Rectangle Diagram]            │
   │                                     │
   └─────────────────────────────────────┘
   ┌──────────────────┐
   │  Enter Answer    │  ← BELOW canvas
   └──────────────────┘

2. User taps button → Canvas slides LEFT, panel slides in RIGHT
   ┌──────────┬────────────────┐
   │  Canvas  │ ┌────────────┐ │
   │[Rectangle│ │ Area (cm²):│ │
   │ visible] │ │ [keypad]   │ │
   │          │ │ [feedback] │ │
   └──────────┴─└────────────┘─┘
   ↑ Slides 75% of panel width left

3. User submits correct → Panel closes, modal appears
   ┌─────────────────────────────────────┐
   │      ┌─────────────────┐            │
   │      │  ✓ Correct!     │            │
   │      │  [Explanation]  │            │
   │      │ [Try Another]   │            │
   │      └─────────────────┘            │
   └─────────────────────────────────────┘

4. User closes modal with X → Button changes
   ┌─────────────────────────────────────┐
   │         Canvas Area                 │
   │      [Rectangle Diagram]            │
   │                                     │
   └─────────────────────────────────────┘
   ┌──────────────────────┐
   │  Try Another Problem │  ← Changed!
   └──────────────────────┘
```

**Key Benefits:**
- Canvas and button slide together (unified motion)
- Figure remains visible when panel is open
- Button state reflects user's progress
- iPad landscape fits perfectly (no scrolling)

---

## System Architecture

### File Structure

```
frontends/lessons/src/
├── shared/components/
│   ├── InputOverlayPanel.js      # Slide-in overlay container
│   ├── SlimMathKeypad.js         # Compact 3-column keypad
│   ├── EnterAnswerButton.js      # Floating CTA button
│   └── index.js                  # Exports all above
│
└── features/lessons/lessonTypes/geometry/
    ├── hooks/
    │   └── useInputOverlay.js    # State management hook
    │
    └── components/areaPerimeter/
        ├── Level3CalculateRectangle.jsx   # Area/Perimeter/Both
        ├── Level4RightTriangle.jsx        # Right triangle
        ├── Level5AnyTriangle.jsx          # Scalene/Isosceles/Equilateral
        ├── Level6TrapezoidDecomposition.jsx # Trapezoid formulas
        └── Level7MixedShapes.jsx          # 4 shape types
```

---

## Core Components

### 1. InputOverlayPanel

**Purpose:** Slide-in container from right that overlays on top of content.

**Key Props:**
```javascript
<InputOverlayPanel
  visible={panelOpen}           // Controls slide animation
  onClose={closePanel}          // X button handler
  title="Calculate Area"        // Panel header text
>
  {children}                    // Keypad + feedback + buttons
</InputOverlayPanel>
```

**Styling Details:**
```javascript
position: fixed;
top: 0;
right: 0;
bottom: 0;
width: 40%;                     // Desktop: 40% (min 360px, max 480px)
transform: translateX(${props => props.$visible ? "0" : "100%"});
transition: transform 0.3s ease-in-out;
z-index: 1000;

// Mobile: Full screen
@media (max-width: 768px) {
  width: 100%;
}
```

**Critical:** Uses `transform: translateX()` for smooth GPU-accelerated animation.

---

### 2. SlimMathKeypad

**Purpose:** Compact 3-column numeric keypad optimized for touch input.

**Key Props:**
```javascript
<SlimMathKeypad
  value={inputValue}            // Current input string
  onChange={setInputValue}      // Value change handler
  onSubmit={handleSubmit}       // Enter/Submit handler
/>
```

**Layout:**
```
┌─────┬─────┬─────┐
│  7  │  8  │  9  │
├─────┼─────┼─────┤
│  4  │  5  │  6  │
├─────┼─────┼─────┤
│  1  │  2  │  3  │
├─────┼─────┼─────┤
│  0  │  .  │  ⌫  │  (backspace)
├─────┼─────┼─────┤
│  C  │  −  │Submit│ (clear, minus, submit)
└─────┴─────┴─────┘
```

**Touch Targets:**
- Desktop/Tablet: 56px × 56px (exceeds WCAG 44px minimum)
- Mobile: 48px × 48px

**Why 3 columns?**
- Saves 80-100px horizontal space vs 4-column layout
- Fits comfortably in 40% width panel
- All essential math operations included

---

### 3. EnterAnswerButton

**Purpose:** Floating CTA button that triggers panel open.

**Evolution (based on user feedback):**

| Iteration | Position | Style | Issue |
|-----------|----------|-------|-------|
| v1 | Inline below canvas | Gray with pencil icon | Not visible on canvas |
| v2 | `bottom: 40px` centered | Gray | Too far from center |
| v3 | `top: 50%; left: 50%` | Gray | ✅ Perfect position |
| v4 | Same | Blue border + shadow | ✅ Final design |

**Final Implementation:**
```javascript
<EnterAnswerButton
  onClick={openPanel}
  disabled={submitted && isCorrect}  // Disable when complete
/>
```

**Styling:**
```javascript
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);  // Perfect centering
z-index: 100;

background: ${theme.colors.cardBackground};       // Gray
border: 2px solid ${theme.colors.info};           // Blue (#3B82F6)
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);  // Blue glow

min-height: 56px;                  // Touch-friendly
padding: 16px 32px;

&:hover {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  border-width: 3px;
}

// Mobile: Inline centered
@media (max-width: 768px) {
  position: static;
  transform: none;
  width: 100%;
}
```

**Design Notes:**
- No emoji (removed pencil icon per user feedback)
- Gray background matches theme (not green/bright colors)
- Blue border matches shape fill color (#3B82F6)
- Hover effect: scale + stronger shadow + thicker border

---

### 4. useInputOverlay Hook

**Purpose:** Centralized state management for overlay system.

**Usage:**
```javascript
import { useInputOverlay } from '../../hooks/useInputOverlay';

function MyLesson({ visualData, onComplete, questionIndex }) {
  const {
    panelOpen,        // Boolean: is panel visible?
    inputValue,       // String: current input
    submitted,        // Boolean: has user submitted?
    setInputValue,    // (value: string) => void
    setSubmitted,     // (bool: boolean) => void
    openPanel,        // () => void
    closePanel,       // () => void
    resetInput,       // () => void - clears input only
    resetAll,         // () => void - resets everything
  } = useInputOverlay();

  // Reset on problem change
  useEffect(() => {
    resetAll();
  }, [questionIndex, resetAll]);

  // ... rest of implementation
}
```

**Implementation:**
```javascript
export function useInputOverlay() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const resetInput = useCallback(() => setInputValue(""), []);
  const resetAll = useCallback(() => {
    setPanelOpen(false);
    setInputValue("");
    setSubmitted(false);
  }, []);

  return {
    panelOpen, inputValue, submitted,
    setInputValue, setSubmitted,
    openPanel, closePanel, resetInput, resetAll,
  };
}
```

---

## Implementation Pattern

### ⭐ Enhanced Pattern with Canvas Slide (v2.0 - NEW STANDARD)

**Use this for ALL new iPad-optimized lessons.**

This pattern adds:
- Static button below canvas (not floating)
- Canvas slides left when panel opens (figure stays visible)
- Modal close tracking (button changes to "Try Another Problem")

```javascript
import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

function MyLesson({ visualData, onComplete, onNextProblem, questionIndex = 0, modalClosedWithX = false }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const { answer = 42 } = visualData;

  // 1. Input Overlay system hook
  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll,
  } = useInputOverlay();

  // 2. Calculate slide distance (75% of panel width)
  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0; // Mobile: No slide
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75; // Slide 75% of panel width
  }, [windowWidth]);

  // 3. Canvas sizing (NO panelOpen dependency)
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200);
  }, [windowWidth]);

  const canvasHeight = 400;

  // 4. Check correctness
  const isCorrect = parseInt(inputValue) === answer;

  // 5. Auto-trigger success modal
  useEffect(() => {
    if (isCorrect && submitted && onComplete) {
      closePanel();
      const timer = setTimeout(() => {
        onComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, submitted, onComplete, closePanel]);

  // 6. Reset state on problem change
  useEffect(() => {
    resetAll();
  }, [questionIndex, resetAll]);

  // 7. Handlers
  const handleSubmit = () => {
    if (inputValue.trim() === '') return;
    setSubmitted(true);
  };

  const handleNextProblem = () => {
    resetAll();
    if (onNextProblem) onNextProblem();
  };

  return (
    <Container>
      {/* 8. Wrapper with slide animation */}
      <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
        <CanvasContainer>
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              <Rect
                x={0} y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={konvaTheme.canvasBackground}
              />
              {/* Your shape rendering */}
            </Layer>
          </Stage>
        </CanvasContainer>

        {/* 9. Static button below canvas - changes based on modalClosedWithX */}
        {!panelOpen && (
          <ButtonContainer>
            {modalClosedWithX ? (
              <TryAnotherButton onClick={handleNextProblem}>
                Try Another Problem
              </TryAnotherButton>
            ) : (
              <EnterAnswerButton
                onClick={openPanel}
                disabled={submitted && isCorrect}
                variant="static"
              />
            )}
          </ButtonContainer>
        )}
      </CanvasWrapper>

      {/* 10. Input Overlay Panel */}
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

        {submitted && (
          <FeedbackSection $isCorrect={isCorrect}>
            {isCorrect ? (
              <FeedbackText>✓ Correct! Area = {answer} cm²</FeedbackText>
            ) : (
              <FeedbackText>Not quite. Try again!</FeedbackText>
            )}
          </FeedbackSection>
        )}

        <PanelButtonRow>
          <ResetButton onClick={() => { setInputValue(''); setSubmitted(false); }}>
            Clear
          </ResetButton>
          {submitted && isCorrect && (
            <NextButton onClick={handleNextProblem}>
              Next Problem
            </NextButton>
          )}
        </PanelButtonRow>
      </InputOverlayPanel>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;
`;

// NEW: Wrapper that slides left when panel opens
const CanvasWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px; /* Gap between canvas and button */

  /* Smooth slide transition */
  transition: transform 0.3s ease-in-out;

  /* Desktop + iPad: Slide left when panel opens */
  @media (min-width: 769px) {
    transform: translateX(\${props => props.$panelOpen ? \`-\${props.$slideDistance}px\` : '0'});
  }

  /* Mobile: No slide */
  @media (max-width: 768px) {
    transform: translateX(0);
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: \${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

// NEW: Container for static button below canvas
const ButtonContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  padding: 0 16px;
`;

// NEW: "Try Another Problem" button (shown after modal X click)
const TryAnotherButton = styled.button`
  width: 100%;
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: \${props => props.theme.colors.info || '#3B82F6'};
  color: \${props => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 56px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

/* ... other styled components same as before ... */

export default MyLesson;
```

**Parent Lesson Component (Required):**

```javascript
// AreaPerimeterLesson.jsx (or similar parent)
function AreaPerimeterLesson({ triggerNewProblem }) {
  const [isComplete, setIsComplete] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  // Reset on problem change
  useEffect(() => {
    setIsComplete(false);
    setModalClosedWithX(false);
  }, [currentQuestionIndex, level]);

  // Handle completion - don't show modal if manually closed
  const handleComplete = (success) => {
    if (success && !modalClosedWithX) {
      setIsComplete(true);
    }
  };

  // Handle modal X button
  const handleClose = () => {
    setIsComplete(false);
    setModalClosedWithX(true); // Mark as manually closed
  };

  // Handle "Try Another Problem" button
  const handleTryAnother = () => {
    setIsComplete(false);
    setModalClosedWithX(false);
    triggerNewProblem();
  };

  return (
    <Wrapper>
      {/* Level component */}
      <Level3CalculateRectangle
        visualData={visualData}
        onComplete={handleComplete}
        onNextProblem={handleTryAnother}
        questionIndex={currentQuestionIndex}
        modalClosedWithX={modalClosedWithX}  // ← Pass down
      />

      {/* Success modal */}
      {isComplete && (
        <ExplanationModal
          explanation={explanation}
          onClose={handleClose}        // ← X button
          onTryAnother={handleTryAnother}  // ← Button inside modal
        />
      )}
    </Wrapper>
  );
}
```

---

### Standard Single-Input Lesson (v1.0 - Original)

Use this pattern for lessons with one numeric input (e.g., calculate area).

```javascript
import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

function MyLesson({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const { answer = 42 } = visualData;

  // 1. Input Overlay system hook
  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll,
  } = useInputOverlay();

  // 2. Canvas sizing (NO panelOpen dependency - canvas stays full width)
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200);
  }, [windowWidth]); // ← panelOpen NOT included!

  const canvasHeight = 400;

  // 3. Check correctness
  const isCorrect = parseInt(inputValue) === answer;

  // 4. Auto-trigger success modal on correct submission
  useEffect(() => {
    if (isCorrect && submitted && onComplete) {
      closePanel();  // Close panel first
      const timer = setTimeout(() => {
        onComplete(true);  // Then show modal
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, submitted, onComplete, closePanel]);

  // 5. Reset state when problem changes
  useEffect(() => {
    resetAll();
  }, [questionIndex, resetAll]);

  // 6. Handle submit from keypad
  const handleSubmit = () => {
    if (inputValue.trim() === '') return;  // Don't submit empty
    setSubmitted(true);
    // If incorrect, panel stays open for retry
    // If correct, useEffect above triggers modal
  };

  // 7. Handle next problem
  const handleNextProblem = () => {
    resetAll();
    if (onNextProblem) onNextProblem();
  };

  return (
    <Container>
      {/* 8. Enter Answer Button (hidden when panel open) */}
      {!panelOpen && (
        <EnterAnswerButton
          onClick={openPanel}
          disabled={submitted && isCorrect}
        />
      )}

      {/* 9. Canvas - stays at full width */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect
              x={0} y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />
            {/* Your shape rendering here */}
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* 10. Input Overlay Panel */}
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

        {/* Feedback inside panel */}
        {submitted && (
          <FeedbackSection $isCorrect={isCorrect}>
            {isCorrect ? (
              <FeedbackText>✓ Correct! Area = {answer} cm²</FeedbackText>
            ) : (
              <FeedbackText>Not quite. Try again!</FeedbackText>
            )}
          </FeedbackSection>
        )}

        {/* Action buttons inside panel */}
        <PanelButtonRow>
          <ResetButton onClick={() => { setInputValue(''); setSubmitted(false); }}>
            Clear
          </ResetButton>
          {submitted && isCorrect && (
            <NextButton onClick={handleNextProblem}>
              Next Problem
            </NextButton>
          )}
        </PanelButtonRow>
      </InputOverlayPanel>
    </Container>
  );
}

// Styled Components (minimal set)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const InputLabel = styled.label`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: -8px;  /* Reduce gap before keypad */
`;

const FeedbackSection = styled.div`
  padding: 16px 24px;
  background-color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess + '20'
    : props.theme.colors.buttonDanger + '20'
  };
  border-radius: 8px;
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonDanger
  };
`;

const FeedbackText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
`;

const PanelButtonRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textPrimary};
  min-height: 44px;
`;

const NextButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  color: ${props => props.theme.colors.textInverted || '#FFFFFF'};
  min-height: 44px;
`;

export default MyLesson;
```

---

## NEW: Modal Close Tracking Pattern

### Problem Solved

**Issue:** After submitting a correct answer, the success modal would reappear when advancing to the next problem, even if the user had manually closed it with the X button.

**User Experience Impact:**
- Confusing: Modal shows for new problem without user answering it
- Annoying: User has to close modal twice (once for completed problem, once for new problem)

### Solution: Separate Modal Dismissal from Problem Advancement

Track **HOW** the modal was dismissed:
1. **Via "Try Another Problem" button** → Advance to next question, show modal for next correct answer
2. **Via X button** → Just close modal, button changes to "Try Another Problem", wait for user to advance

```javascript
// Parent lesson component
const [modalClosedWithX, setModalClosedWithX] = useState(false);

// Don't show modal if it was manually closed
const handleComplete = (success) => {
  if (success && !modalClosedWithX) {  // ← Key check
    setIsComplete(true);
  }
};

// X button handler
const handleClose = () => {
  setIsComplete(false);
  setModalClosedWithX(true);  // Mark as manually closed
};

// "Try Another Problem" handler
const handleTryAnother = () => {
  setIsComplete(false);
  setModalClosedWithX(false);  // Reset flag
  triggerNewProblem();
};

// Reset on problem change
useEffect(() => {
  setIsComplete(false);
  setModalClosedWithX(false);  // Reset flag
}, [currentQuestionIndex, level]);
```

### Implementation Checklist

For ANY lesson with ExplanationModal:

- [ ] Add `modalClosedWithX` state to parent component
- [ ] Update `handleComplete` to check `!modalClosedWithX` before showing modal
- [ ] Create `handleClose` function that sets `modalClosedWithX = true`
- [ ] Update `handleTryAnother` to reset `modalClosedWithX = false`
- [ ] Reset `modalClosedWithX` in useEffect when problem changes
- [ ] Pass `modalClosedWithX` as prop to child Level components (for button change)
- [ ] Add `onClose={handleClose}` to ExplanationModal

**Affected Lessons (all updated):**
- AreaPerimeterLesson + Levels 3-7
- SymmetryLesson
- All Congruent Triangles (SSS, SAS, ASA, AAS)

---

## Key Design Decisions

### 1. Canvas Does NOT Resize

**❌ Initial Implementation (WRONG):**
```javascript
const canvasWidth = useMemo(() => {
  const padding = 40;
  const baseWidth = Math.min(windowWidth - padding, 1200);
  // WRONG: Canvas resizes when panel opens
  return panelOpen ? baseWidth * 0.6 : baseWidth;
}, [windowWidth, panelOpen]);  // ← panelOpen causes resize!
```

**✅ Correct Implementation:**
```javascript
const canvasWidth = useMemo(() => {
  const padding = 40;
  return Math.min(windowWidth - padding, 1200);
}, [windowWidth]);  // ← panelOpen NOT included
```

**User Feedback:**
> "When the 'enter answer' button is pressed the calculator should open, but it doesn't have to change anything else on the page, the canvas should not shrink or slide over"

**Why This Matters:**
- Overlay panel uses `position: fixed` - it floats above content
- No need to make room by resizing canvas
- Smoother UX: canvas stays stable, only panel animates

---

### 2. Canvas Slide Animation (v2.0 - NEW)

**Problem:** On iPad landscape, when the panel opens, it covers the right side of the screen. For geometry lessons, the figure/shape often ended up hidden behind the panel.

**User Feedback:**
> "I really like this new style to work with the math pad and how to enter answers while still seeing the problem."

**Solution:** Slide both canvas AND button left by 75% of panel width when panel opens.

```javascript
// Calculate slide distance
const slideDistance = useMemo(() => {
  if (windowWidth <= 768) return 0; // Mobile: No slide
  const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
  return panelWidth * 0.75; // 75% of panel width
}, [windowWidth]);

// Wrapper that slides
<CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
  <CanvasContainer>
    {/* Canvas */}
  </CanvasContainer>
  <ButtonContainer>
    {/* Button */}
  </ButtonContainer>
</CanvasWrapper>

// Styled component
const CanvasWrapper = styled.div`
  transition: transform 0.3s ease-in-out;

  @media (min-width: 769px) {
    transform: translateX(\${props => props.$panelOpen ? \`-\${props.$slideDistance}px\` : '0'});
  }

  @media (max-width: 768px) {
    transform: translateX(0); // Mobile: No slide
  }
`;
```

**Why 75% of panel width?**
- Panel is 40% of screen width (360-480px)
- 75% of panel = ~270-360px slide distance
- Figure (typically 200-300px wide) stays fully visible
- Smooth, unified motion (canvas and button move together)

**Device-Specific Behavior:**
- **Desktop/iPad (>768px):** Canvas slides left, figure stays visible
- **Mobile (≤768px):** Panel is full-screen overlay, no slide needed

---

### 3. Static Button Below Canvas (v2.0 - NEW)

**Evolution from floating to static:**

| Version | Position | Rationale |
|---------|----------|-----------|
| v1.0 | `position: fixed; top: 50%; left: 50%` | Floating centered on canvas |
| v2.0 | Static below canvas in flow | Slides with canvas, clearer hierarchy |

**v2.0 Implementation:**

```javascript
<CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
  <CanvasContainer>
    {/* Canvas */}
  </CanvasContainer>

  {/* Button INSIDE wrapper - slides with canvas */}
  {!panelOpen && (
    <ButtonContainer>
      <EnterAnswerButton variant="static" onClick={openPanel} />
    </ButtonContainer>
  )}
</CanvasWrapper>
```

**EnterAnswerButton Variants:**

```javascript
// In EnterAnswerButton.js
const EnterAnswerButton = ({ variant = "floating", onClick, disabled }) => (
  <CTAButton onClick={onClick} disabled={disabled} $variant={variant}>
    <ButtonText>Enter Answer</ButtonText>
  </CTAButton>
);

const CTAButton = styled.button`
  \${props => props.$variant === "floating" && css\`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  \`}

  \${props => props.$variant === "static" && css\`
    position: static;
    transform: none;
    width: 100%;
  \`}
`;
```

**Benefits:**
- Button placement clearer (directly below what it controls)
- Slides together with canvas (unified motion)
- Easier to find on iPad (not floating in random position)
- Can include formula helpers between canvas and button

**Typical Layout:**
```
┌─────────────────┐
│     Canvas      │
└─────────────────┘
┌─────────────────┐
│ Formula Helper  │  ← Optional
└─────────────────┘
┌─────────────────┐
│  Enter Answer   │  ← Static button
└─────────────────┘
```

---

### 4. Button Position Evolution (v1.0 - Historical)

**User wanted:** Centered floating button on canvas (like original design, but more centered)

**Final Solution:**
```javascript
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);  // Mathematical perfect center
```

**Why This Works:**
- `top: 50%; left: 50%` positions top-left corner at center
- `translate(-50%, -50%)` shifts button back by half its width/height
- Result: button is perfectly centered in viewport
- `z-index: 100` keeps it above canvas but below panel (z-index: 1000)

**Mobile Override:**
```javascript
@media (max-width: 768px) {
  position: static;       // No longer floating
  transform: none;        // No centering transform
  width: 100%;           // Full width
  margin: 0 auto;        // Center in flow
}
```

---

### 3. Hybrid State for Multiple Inputs

**Use Case:** Level 3 - Calculate Rectangle (Area + Perimeter)

When asking for both area AND perimeter, use hybrid state:

```javascript
function Level3CalculateRectangle({ visualData, onComplete, questionIndex = 0 }) {
  const { area = 40, perimeter = 26, askingFor = 'both' } = visualData;

  // Hook handles area input
  const {
    inputValue,        // Used for area
    setInputValue,
    // ... rest of hook
  } = useInputOverlay();

  // Local state handles perimeter input
  const [perimeterInput, setPerimeterInput] = useState('');

  // Check correctness for both
  const areaCorrect = parseInt(inputValue) === area;
  const perimeterCorrect = parseInt(perimeterInput) === perimeter;
  const allCorrect = askingFor === 'area' ? areaCorrect :
                     askingFor === 'perimeter' ? perimeterCorrect :
                     areaCorrect && perimeterCorrect;

  // Reset both on problem change
  useEffect(() => {
    resetAll();
    setPerimeterInput('');
  }, [questionIndex, resetAll]);

  return (
    <InputOverlayPanel visible={panelOpen} onClose={closePanel}>
      {/* Area input */}
      {(askingFor === 'area' || askingFor === 'both') && (
        <>
          <InputLabel>
            Area (cm²): {submitted && (areaCorrect ? ' ✓' : ' ✗')}
          </InputLabel>
          <SlimMathKeypad
            value={inputValue}
            onChange={setInputValue}
            onSubmit={askingFor === 'area' ? handleSubmit : undefined}
          />
        </>
      )}

      {/* Perimeter input */}
      {(askingFor === 'perimeter' || askingFor === 'both') && (
        <>
          {askingFor === 'both' && <InputDivider />}
          <InputLabel>
            Perimeter (cm): {submitted && (perimeterCorrect ? ' ✓' : ' ✗')}
          </InputLabel>
          <SlimMathKeypad
            value={perimeterInput}
            onChange={setPerimeterInput}
            onSubmit={handleSubmit}
          />
        </>
      )}

      {/* Rest of panel */}
    </InputOverlayPanel>
  );
}
```

**Key Points:**
- `inputValue` from hook used for first/primary input
- Local `useState` for additional inputs
- Check marks (✓/✗) show individual correctness
- `InputDivider` separates multiple inputs visually

---

### 4. Submit Flow: Panel → Modal

**Timing is critical:**

```javascript
useEffect(() => {
  if (isCorrect && submitted && onComplete) {
    closePanel();  // 1. Close panel first
    const timer = setTimeout(() => {
      onComplete(true);  // 2. Show modal after 500ms
    }, 500);
    return () => clearTimeout(timer);
  }
}, [isCorrect, submitted, onComplete, closePanel]);
```

**Why 500ms delay?**
- Panel slide-out animation is 300ms
- Extra 200ms lets panel fully close before modal appears
- Prevents visual overlap/confusion
- Smooth transition: panel out → brief pause → modal in

**Wrong Approach:**
```javascript
// ❌ DON'T DO THIS - jarring UX
if (isCorrect && submitted) {
  onComplete(true);  // Modal appears while panel is still visible!
}
```

---

## Migration Checklist

Use this checklist when migrating existing lessons to Input Overlay Panel system:

### Step 1: Update Imports
```javascript
// Remove useState if only used for userInput/submitted
- import React, { useState, useMemo, useEffect } from 'react';
+ import React, { useMemo, useEffect } from 'react';

// Add overlay system imports
+ import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
+ import { useInputOverlay } from '../../hooks/useInputOverlay';
```

### Step 2: Replace State with Hook
```javascript
// Remove old state
- const [userInput, setUserInput] = useState('');
- const [submitted, setSubmitted] = useState(false);

// Add hook
+ const {
+   panelOpen, inputValue, submitted,
+   setInputValue, setSubmitted,
+   openPanel, closePanel, resetAll,
+ } = useInputOverlay();
```

### Step 3: Update isCorrect Check
```javascript
- const isCorrect = parseInt(userInput) === answer;
+ const isCorrect = parseInt(inputValue) === answer;
```

### Step 4: Update/Add useEffect Hooks
```javascript
// Update success modal trigger
useEffect(() => {
  if (isCorrect && submitted && onComplete) {
-   // Old approach
+   closePanel();
+   const timer = setTimeout(() => {
      onComplete(true);
+   }, 500);
+   return () => clearTimeout(timer);
  }
- }, [isCorrect, submitted, onComplete]);
+ }, [isCorrect, submitted, onComplete, closePanel]);

// Add reset on problem change
+ useEffect(() => {
+   resetAll();
+ }, [questionIndex, resetAll]);
```

### Step 5: Update Handlers
```javascript
// Update submit handler
- const handleReset = () => {
-   setUserInput('');
-   setSubmitted(false);
- };

+ const handleSubmit = () => {
+   if (inputValue.trim() === '') return;
+   setSubmitted(true);
+ };

// Update next problem handler
const handleNextProblem = () => {
+   resetAll();
  if (onNextProblem) onNextProblem();
};
```

### Step 6: Update JSX - Add EnterAnswerButton
```javascript
return (
  <Container>
+   {!panelOpen && (
+     <EnterAnswerButton onClick={openPanel} disabled={submitted && isCorrect} />
+   )}

    <CanvasContainer>
      {/* Canvas stays same */}
    </CanvasContainer>
```

### Step 7: Update JSX - Replace Input Section
```javascript
-   <InputSection>
-     <InputRow>
-       <InputLabel>Area:</InputLabel>
-       <InputField
-         value={userInput}
-         onChange={(e) => setUserInput(e.target.value)}
-         disabled={submitted}
-       />
-       <UnitLabel>cm²</UnitLabel>
-     </InputRow>
-   </InputSection>

+   <InputOverlayPanel
+     visible={panelOpen}
+     onClose={closePanel}
+     title="Calculate Area"
+   >
+     <InputLabel>Area (cm²):</InputLabel>
+     <SlimMathKeypad
+       value={inputValue}
+       onChange={setInputValue}
+       onSubmit={handleSubmit}
+     />
```

### Step 8: Update JSX - Move Feedback Inside Panel
```javascript
-   {submitted && (
-     <FeedbackSection $isCorrect={isCorrect}>
-       {/* feedback */}
-     </FeedbackSection>
-   )}

+     {submitted && (
+       <FeedbackSection $isCorrect={isCorrect}>
+         {/* Same feedback, now inside panel */}
+       </FeedbackSection>
+     )}
```

### Step 9: Update JSX - Move Buttons Inside Panel
```javascript
-   <ButtonRow>
-     <ResetButton onClick={handleReset}>Reset</ResetButton>
-     {isCorrect && <NextButton onClick={handleNextProblem}>Next</NextButton>}
-   </ButtonRow>

+     <PanelButtonRow>
+       <ResetButton onClick={() => { setInputValue(''); setSubmitted(false); }}>
+         Clear
+       </ResetButton>
+       {submitted && isCorrect && (
+         <NextButton onClick={handleNextProblem}>Next Problem</NextButton>
+       )}
+     </PanelButtonRow>
+   </InputOverlayPanel>
```

### Step 10: Update Styled Components
```javascript
// Remove these
- const InputSection = styled.div`...`;
- const InputRow = styled.div`...`;
- const InputField = styled.input`...`;
- const UnitLabel = styled.span`...`;
- const ButtonRow = styled.div`...`;

// Update InputLabel
const InputLabel = styled.label`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
+ margin-bottom: -8px;  /* Reduce gap before keypad */
`;

// Add PanelButtonRow
+ const PanelButtonRow = styled.div`
+   display: flex;
+   gap: 12px;
+   width: 100%;
+ `;
```

### Step 11: Test
- [ ] Button appears centered on canvas
- [ ] Panel slides in smoothly from right
- [ ] Canvas does NOT resize when panel opens
- [ ] Keypad inputs work correctly
- [ ] Submit triggers feedback
- [ ] Incorrect answer shows error (panel stays open)
- [ ] Correct answer triggers modal (panel closes first)
- [ ] Next problem resets state correctly
- [ ] Mobile responsive (button inline, panel full screen)
- [ ] Dark mode support

---

## Common Patterns

### Pattern: Dynamic Panel Title

For lessons with multiple shape types:

```javascript
<InputOverlayPanel
  title={`Calculate ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Area`}
>
```

Result:
- `shapeType = 'rectangle'` → "Calculate Rectangle Area"
- `shapeType = 'triangle'` → "Calculate Triangle Area"
- `shapeType = 'trapezoid'` → "Calculate Trapezoid Area"

---

### Pattern: Conditional Keypad Submit

For multi-input lessons, only trigger submit on last keypad:

```javascript
{/* First input - no submit */}
<SlimMathKeypad
  value={inputValue}
  onChange={setInputValue}
  onSubmit={undefined}  // ← No submit
/>

{/* Second input - triggers submit */}
<SlimMathKeypad
  value={perimeterInput}
  onChange={setPerimeterInput}
  onSubmit={handleSubmit}  // ← Submits when user hits Submit
/>
```

---

### Pattern: Visual Checkmarks

Show instant feedback on multi-input correctness:

```javascript
<InputLabel>
  Area (cm²): {submitted && (areaCorrect ? ' ✓' : ' ✗')}
</InputLabel>
```

---

### Pattern: Formula Helpers

Keep formula hints outside the panel (below canvas):

```javascript
return (
  <Container>
    <EnterAnswerButton ... />
    <CanvasContainer>...</CanvasContainer>

    {/* Formula helper - stays visible */}
    <FormulaHelper>
      <Formula>Area = ½ × base × height</Formula>
      <HintText>The height must be perpendicular (90°) to the base!</HintText>
    </FormulaHelper>

    <InputOverlayPanel>...</InputOverlayPanel>
  </Container>
);
```

**Why outside panel?**
- Students can reference formula while inputting
- Formula visible when panel is closed
- Saves vertical space in panel

---

## Touch Optimization

### Minimum Touch Targets

All interactive elements meet WCAG 2.1 Level AA guidelines:

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| EnterAnswerButton | 56px | 52px | 48px |
| SlimMathKeypad keys | 56px | 56px | 48px |
| ResetButton | 44px | 44px | 44px |
| NextButton | 44px | 44px | 44px |

**Implementation:**
```javascript
const KeyButton = styled.button`
  min-width: 56px;
  min-height: 56px;

  @media (max-width: 1024px) {
    min-width: 56px;
    min-height: 56px;
  }

  @media (max-width: 768px) {
    min-width: 48px;
    min-height: 48px;
  }
`;
```

---

### Hover Effects (Desktop Only)

Avoid hover effects on touch devices:

```javascript
const EnterAnswerButton = styled.button`
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 768px) {
    &:hover:not(:disabled) {
      transform: translateY(-2px);  // Different hover for mobile
    }
  }
`;
```

---

### Active/Press States

Provide visual feedback on tap:

```javascript
&:active:not(:disabled) {
  transform: translate(-50%, -50%) scale(0.98);  // Slight shrink
}
```

---

## Troubleshooting

### Issue: Canvas resizes when panel opens

**Symptom:** Canvas shrinks or shifts when panel appears.

**Cause:** `panelOpen` is in `canvasWidth` dependency array.

**Fix:**
```javascript
// ❌ WRONG
const canvasWidth = useMemo(() => {
  return panelOpen ? width * 0.6 : width;
}, [width, panelOpen]);

// ✅ CORRECT
const canvasWidth = useMemo(() => {
  return Math.min(width - 40, 1200);
}, [width]);  // panelOpen NOT included
```

---

### Issue: Button not centered

**Symptom:** Button appears off-center on canvas.

**Cause:** Using `left: 50%` without centering transform.

**Fix:**
```javascript
// ✅ Use both positioning AND transform
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
```

---

### Issue: Modal appears before panel closes

**Symptom:** Success modal shows while panel is still sliding out.

**Cause:** No delay between panel close and modal trigger.

**Fix:**
```javascript
useEffect(() => {
  if (isCorrect && submitted && onComplete) {
    closePanel();
    const timer = setTimeout(() => {
      onComplete(true);  // ← 500ms delay
    }, 500);
    return () => clearTimeout(timer);
  }
}, [isCorrect, submitted, onComplete, closePanel]);
```

---

### Issue: State persists between problems

**Symptom:** Input values from previous problem appear on next problem.

**Cause:** Missing reset on `questionIndex` change.

**Fix:**
```javascript
useEffect(() => {
  resetAll();
}, [questionIndex, resetAll]);
```

---

### Issue: Empty submission accepted

**Symptom:** User can submit without entering a value.

**Cause:** No validation in submit handler.

**Fix:**
```javascript
const handleSubmit = () => {
  if (inputValue.trim() === '') return;  // ← Guard clause
  setSubmitted(true);
};
```

---

### Issue: Panel doesn't slide smoothly

**Symptom:** Panel jumps instead of sliding.

**Cause:** Using `display: none` instead of `transform`.

**Fix:**
```javascript
// ❌ WRONG
display: ${props => props.$visible ? 'block' : 'none'};

// ✅ CORRECT
transform: translateX(${props => props.$visible ? '0' : '100%'});
transition: transform 0.3s ease-in-out;
```

---

## Best Practices Summary

### ✅ DO

- Use `useInputOverlay` hook for state management
- Keep canvas width calculation independent of `panelOpen`
- Add 500ms delay between panel close and modal open
- Reset state on `questionIndex` change
- Validate input before submission (reject empty strings)
- Keep formula helpers outside panel (below canvas)
- Use `transform: translate()` for animations (GPU-accelerated)
- Provide visual feedback on touch (active states)
- Test on actual iPad devices

### ❌ DON'T

- Include `panelOpen` in `canvasWidth` dependencies
- Show modal while panel is still visible
- Use `display: none` for panel hide (breaks animation)
- Put formula reference inside panel (students need to see it)
- Accept empty submissions
- Use hover effects as primary interaction cues on touch
- Forget to disable button when answer is correct
- Skip mobile responsive testing

---

## Production Implementations

### Verified Working Lessons

These lessons successfully use the Input Overlay Panel system:

1. **Level3CalculateRectangle.jsx**
   - Special case: Handles area/perimeter/both
   - Hybrid state pattern
   - Multiple keypads

2. **Level4RightTriangle.jsx**
   - Standard single-input
   - Optional rectangle outline

3. **Level5AnyTriangle.jsx**
   - Standard single-input
   - Height line visualization

4. **Level6TrapezoidDecomposition.jsx**
   - Standard single-input
   - Decomposition type variations

5. **Level7MixedShapes.jsx**
   - Standard single-input
   - Dynamic panel title
   - 4 shape type support

### Reference Implementation

**Best example:** Level5AnyTriangle.jsx

**Why?**
- Cleanest implementation of standard pattern
- Well-commented
- No special cases or hybrid state
- Good model for future migrations

---

## Future Considerations

### Potential Enhancements

1. **Keyboard Support**
   - Add keyboard event listeners for desktop users
   - Arrow keys, Enter, Backspace support
   - Tab navigation between inputs

2. **Haptic Feedback**
   - Vibration on iOS when tapping keys
   - Different patterns for correct/incorrect

3. **Sound Effects**
   - Optional click sounds for keypad
   - Success/error audio feedback

4. **Accessibility**
   - Screen reader announcements for panel state
   - ARIA labels for all interactive elements
   - Focus management when panel opens

5. **Analytics**
   - Track time to first input
   - Number of attempts before correct
   - Common incorrect answers

---

## Summary

The Input Overlay Panel system provides a **production-ready, iPad-optimized input solution** for geometry lessons. Key achievements:

✅ **Canvas stability** - No resize/shift when panel opens
✅ **Touch-optimized** - 56px+ touch targets, smooth animations
✅ **Space-efficient** - Compact 3-column keypad saves horizontal space
✅ **Smooth UX** - 300ms slide animation, 500ms modal delay
✅ **Reusable** - Drop-in solution via `useInputOverlay` hook
✅ **Flexible** - Handles single/multiple inputs
✅ **Accessible** - Meets WCAG 2.1 Level AA guidelines
✅ **Dark mode** - Full theme support

**Migration time:** ~20-30 minutes per lesson with this guide.

---

**Questions or issues?** Refer to existing implementations in `/features/lessons/lessonTypes/geometry/components/areaPerimeter/` directory.
