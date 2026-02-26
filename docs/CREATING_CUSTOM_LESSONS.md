# Creating Custom Lessons - Complete Guide

**Version**: 1.0
**Last Updated**: February 24, 2026
**Example Lesson**: Adding Integers

This guide documents the complete process for creating a custom lesson with backend data generation and frontend visualization.

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Testing Checklist](#testing-checklist)
6. [Visual Scaffolding Pattern](#visual-scaffolding-pattern)

---

## Overview

Custom lessons consist of:
- **Backend Generator**: Creates randomized question data
- **Backend Config**: Defines lesson settings and pipeline behavior
- **Frontend Component**: Renders interactive lesson UI with visualizations
- **Registration**: Connects backend and frontend through config files

**Key Benefit**: Backend generates batches of 10 questions, reducing API calls and improving performance.

---

## Backend Setup

### Step 1: Create Question Generator

**Location**: `/backend/services/lessonProcessors/questions/[lessonName]Generator.js`

**Required Structure**:
```javascript
/**
 * [Lesson Name] - Custom Data Generator
 *
 * Level Progression:
 * L1 — Description
 * L2 — Description
 * ...
 */

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Level generators
function generateLevel1() {
  // Generate question data
  const question = "...";
  const answer = ...;

  return {
    level: 1,
    question: [{ text: question }],
    answer: [String(answer)],
    acceptedAnswers: [String(answer)],
    hint: "...",
    explanation: "...",
    visualData: { /* visualization data */ },
    problemTypeReturned: 'lesson_name',
    wordProblemReturned: 'lesson_name',
    numbersReturned: [...],  // ⚠️ REQUIRED FOR VALIDATION
  };
}

// Registry
const LEVEL_GENERATORS = {
  1: generateLevel1,
  2: generateLevel2,
  // ...
};

// Main export
export function lessonNameGenerator({ lessonName, level }) {
  const generator = LEVEL_GENERATORS[level];
  if (!generator) {
    return LEVEL_GENERATORS[1](); // Fallback
  }
  return generator();
}

export function supportsLesson(lessonName) {
  return lessonName === 'lesson_name';
}
```

**⚠️ CRITICAL**: Every question object MUST include `numbersReturned` field (even if empty array) to pass validation.

**Example from Adding Integers**:
```javascript
return {
  level: 1,
  question: [{ text: `${num1} + ${num2} = ?` }],
  answer: [String(sum)],
  acceptedAnswers: [String(sum)],
  hint: "Add the two positive numbers together.",
  explanation: `${num1} + ${num2} = ${sum}. When adding two positive numbers, just add them together!`,
  visualData: {
    type: 'numberLine',
    start: 0,
    end: Math.max(sum + 3, 15),
    num1,
    num2,
    sum,
    showJumps: true,
  },
  problemTypeReturned: 'adding_integers',
  wordProblemReturned: 'adding_integers',
  numbersReturned: [num1, num2, sum],  // Required!
};
```

### Step 2: Create Lesson Config

**Location**: `/backend/config/lessonConfigs/[lesson_name].config.js`

```javascript
export default {
  name: 'lesson_name',
  displayName: 'Lesson Display Name',

  pipeline: {
    // Skip middleware steps that aren't needed for custom generation
    skipSteps: [3, 5, 6, 7, 8, 9, 10, 11],

    customDataGeneration: {
      enabled: true,
      levels: [1, 2, 3, 4, 5],  // Which levels need backend data
      generator: 'lessonNameGenerator',
      batchSize: 10,  // Generate 10 questions at once
    }
  },

  frontend: {
    componentType: 'custom',
    levels: 5,
    components: [
      'LessonComponent',  // L1
      'LessonComponent',  // L2
      'LessonComponent',  // L3
      'LessonComponent',  // L4
      'LessonComponent',  // L5
    ]
  },

  metadata: {
    category: 'algebra',
    difficulty: 'beginner',
    topics: ['topic1', 'topic2'],
    prerequisites: [],
    relatedLessons: [],
  }
};
```

### Step 3: Register Backend Generator

**File**: `/backend/services/lessonProcessors/index.js`

**Add three places**:

1. Import at top:
```javascript
import { lessonNameGenerator, supportsLesson as lessonNameSupportsLesson } from "./questions/lessonNameGenerator.js";
```

2. In `getQuestionGenerator()` function:
```javascript
if (lessonNameSupportsLesson(lessonName)) {
  return lessonNameGenerator;
}
```

3. In `hasCustomGenerator()` function:
```javascript
return lessonNameSupportsLesson(lessonName) || ...
```

### Step 4: Register Backend Config

**File**: `/backend/config/lessonConfigs/index.js`

**Add two places**:

1. Import at top:
```javascript
import lessonNameConfig from './lesson_name.config.js';
```

2. Add to registry object:
```javascript
const lessonConfigRegistry = {
  // ...
  lesson_name: lessonNameConfig,
};
```

### Step 5: Remove Hardcoded References (if any)

**File**: `/backend/middlewares/middleware5QuestionCode.js`

Check if your lesson name is in the hardcoded list around line 23. If so, REMOVE it:
```javascript
// REMOVE if present:
lessonName == "your_lesson_name" ||
```

This is critical! Hardcoded references prevent custom generators from running.

### Step 6: Update Initial Lesson Data

**File**: `/backend/data/helperFunctions/getLessonDataInitial.js`

Add entry with level-specific hints:
```javascript
lesson_name: {
  lessonImage: "equation",
  hints: [
    "Level 1 hint",
    "Level 2 hint",
    "Level 3 hint",
    "Level 4 hint",
    "Level 5 hint"
  ],
  LessonComponent: [
    "LessonComponent",  // L1
    "LessonComponent",  // L2
    "LessonComponent",  // L3
    "LessonComponent",  // L4
    "LessonComponent",  // L5
  ]
},
```

---

## Frontend Setup

### Step 1: Create Lesson Component

**Location**: `/frontends/lessons/src/features/lessons/lessonTypes/[category]/[LessonName].jsx`

**Required Pattern (Phase 2.5)**:
```jsx
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Circle, Line, Text, Arrow } from 'react-konva';
import { useLessonState, useKonvaTheme, useWindowDimensions } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// Visualization components (if needed)
function VisualizationComponent({ visualData, konvaTheme, width, height }) {
  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Konva shapes */}
      </Layer>
    </Stage>
  );
}

// Main component
function LessonNameLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const konvaTheme = useKonvaTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [showHint, setShowHint] = useState(false);

  // Current problem from batch
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const { question, answer, acceptedAnswers, hint, explanation, visualData, level, levelNum: levelNumStr } = currentProblem;

  // Parse level number (comes as string from backend)
  const levelNum = parseInt(levelNumStr || level || '1', 10);

  // Question text
  const questionText = question?.[0]?.text || question || '';

  // Format answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Event handlers
  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  return (
    <Wrapper>
      {/* Hint button - fixed top right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {levelNum}</LevelBadge>
        <LevelTitle>Level Title</LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Visualization (see Visual Scaffolding Pattern below) */}
      {visualData && (currentQuestionIndex < 4 || showHint) && (
        <CanvasWrapper>
          <VisualizationComponent
            visualData={visualData}
            konvaTheme={konvaTheme}
            width={canvasWidth}
            height={canvasHeight}
          />
        </CanvasWrapper>
      )}

      {/* Answer input */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

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
            <ExplanationTitle>Explanation</ExplanationTitle>
            <ExplanationText>{explanation}</ExanationText>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default LessonNameLesson;

// Styled components
const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }
`;

// ... other styled components
```

### Step 2: Register in Category Index

**File**: `/frontends/lessons/src/features/lessons/lessonTypes/[category]/index.js`

```javascript
import LessonNameLesson from "./LessonNameLesson";

export {
  // ...
  LessonNameLesson,
};
```

### Step 3: Register in DataLesson

**File**: `/frontends/lessons/src/features/lessons/DataLesson.js`

**Add lazy import**:
```javascript
const LessonNameLesson = lazy(() =>
  import("../lessons/lessonTypes/category/index").then((m) => ({
    default: m.LessonNameLesson
  }))
);
```

**Update lesson mapping**:
```javascript
lesson_name: {
  1: LessonNameLesson,
  2: LessonNameLesson,
  3: LessonNameLesson,
  4: LessonNameLesson,
  5: LessonNameLesson,
},
```

---

## Common Issues & Solutions

### Issue 1: Validation Failed - "Question array validation FAILED"

**Symptom**: Backend logs show validation failure, questionAnswerArray is null

**Cause**: Missing `numbersReturned` field in generator return object

**Solution**: Add `numbersReturned` to every level generator:
```javascript
return {
  // ... other fields
  numbersReturned: [num1, num2, result],  // Or [] if not needed
};
```

### Issue 2: Old Format Data Returned

**Symptom**: Backend returns data with topButtons/bottomButtons, wrong problemTypeReturned

**Cause**: Lesson name hardcoded in middleware5QuestionCode.js

**Solution**: Remove hardcoded reference in middleware5:
```javascript
// Remove this line if present:
lessonName == "your_lesson" ||
```

### Issue 3: No Visualization Showing

**Symptom**: Canvas area is empty or not rendering

**Causes & Solutions**:

1. **Level number type mismatch**:
   - Problem: `levelNum` is string "1" but comparing with number 1
   - Solution: Use `parseInt(levelNumStr || level || '1', 10)`

2. **Wrong visualData type**:
   - Problem: Generator returns `type: 'text'` but frontend expects `type: 'numberLine'`
   - Solution: Check generator returns correct type

3. **Canvas dimensions**:
   - Problem: Canvas height is 0 or too small
   - Solution: Set appropriate dimensions based on level/visual type

### Issue 4: Backend Not Returning Batch

**Symptom**: Only single question returned, no questionAnswerArray

**Cause**: Backend not restarted after config changes

**Solution**: Restart backend to load new configs:
```bash
pkill -f "node index.js"
cd backend/aqueous-eyrie-54478
npm start
```

### Issue 5: Visual Arrows/Elements Overlapping

**Symptom**: Multiple elements drawn at same position

**Solution**: Offset elements vertically or horizontally:
```javascript
// Bad: Both at same y
<Arrow points={[x1, y, x2, y]} />
<Arrow points={[x3, y, x4, y]} />

// Good: Different y values
<Arrow points={[x1, y - 40, x2, y - 40]} />
<Arrow points={[x3, y - 20, x4, y - 20]} />
```

---

## Testing Checklist

### Backend Testing

```bash
# Test single level
curl -s "http://localhost:5001/lessons/content/lesson_name&1&1" | jq '.'

# Verify batch generation
curl -s "http://localhost:5001/lessons/content/lesson_name&1&1" | jq '{
  questionCount: (.questionAnswerArray | length),
  batchSize: .batchSize,
  problemType: .problemTypeReturned
}'

# Test all levels
for level in 1 2 3 4 5; do
  echo "=== Level $level ==="
  curl -s "http://localhost:5001/lessons/content/lesson_name&1&$level" | jq '{
    level: .levelNum,
    questions: (.questionAnswerArray | length),
    sample: .questionAnswerArray[0].question[0].text
  }'
done
```

**Expected Results**:
- ✅ Each level returns 10 questions
- ✅ `questionAnswerArray` is an array of length 10
- ✅ `batchSize` is 10
- ✅ `problemTypeReturned` matches lesson name
- ✅ Each question has required fields (question, answer, visualData, etc.)

### Frontend Testing

**Manual Test Steps**:

1. **Load Lesson**: Navigate to `http://localhost:3000/lessons/lesson_name`
   - ✅ Lesson loads without errors
   - ✅ Level badge shows correct level
   - ✅ Question displays

2. **Visualizations**:
   - ✅ Canvas renders (if visualization exists)
   - ✅ Correct visual type for each level
   - ✅ Dark mode styling works (check useKonvaTheme)

3. **Question Flow**:
   - ✅ Questions 1-4 show visualization (if using scaffolding pattern)
   - ✅ Questions 5-10 hide visualization (if using scaffolding pattern)
   - ✅ "Need a hint?" button appears
   - ✅ Clicking hint button shows hint text and visualization

4. **Answer Input**:
   - ✅ Answer input accepts typed input
   - ✅ Correct answer shows explanation
   - ✅ Incorrect answer shows try again
   - ✅ "Try Another Problem" loads next question

5. **Navigation**:
   - ✅ Cycles through all 10 questions
   - ✅ No API calls between questions (batch caching)
   - ✅ Level buttons switch between levels
   - ✅ Each level loads its own batch of 10

6. **Browser Console**:
   - ✅ No JavaScript errors
   - ✅ No React warnings
   - ✅ No failed network requests

### Compilation Check

```bash
# Check frontend compilation
tail -20 /tmp/frontend-start.log | grep -E "(Compiled|Failed)"

# Expected: "Compiled successfully!"
```

---

## Visual Scaffolding Pattern

### When to Use Progressive Disclosure

**Use this pattern when visualizations are HELPFUL but NOT REQUIRED**:
- Number lines showing addition steps
- Chips/counters showing grouping
- Diagrams illustrating concepts
- Graphs showing patterns

**Example lessons**: adding_integers, multiplying_integers, fractions concepts

### When NOT to Use Progressive Disclosure

**Do NOT hide visualizations when they are ESSENTIAL to answer the question**:
- Measuring tasks (measuring_sides, measuring_angles)
- Image-based questions where the image contains the data
- Geometry proofs where the diagram shows given information
- Word problems with accompanying diagrams that contain specific values

**⚠️ IMPORTANT RULE**:
> Only hide visualizations after question 4 if students can solve the problem through mental math or without seeing the visual. If the visual contains information NEEDED to answer (measurements, specific values, given data), always show it.

### Implementation

**Pattern for optional visualizations** (hide after Q4):
```jsx
{visualData && (currentQuestionIndex < 4 || showHint) && (
  <CanvasWrapper>
    <VisualizationComponent {...props} />
  </CanvasWrapper>
)}
```

**Pattern for required visualizations** (always show):
```jsx
{visualData && (
  <CanvasWrapper>
    <VisualizationComponent {...props} />
  </CanvasWrapper>
)}
```

### Behavior with Scaffolding

**Questions 1-4**: Visualization always visible
- Helps students learn the concept
- Shows the process visually
- Builds mental models

**Questions 5-10**: Visualization hidden by default
- Students practice independently
- Removes training wheels
- Can still click "Need a hint?" to see visualization
- When "Try Another Problem" clicked, visualization resets to hidden

**Hint Button Integration**:
```jsx
const [showHint, setShowHint] = useState(false);

const handleTryAnother = () => {
  setShowHint(false);  // Reset hint state
  triggerNewProblem();
  hideAnswer();
};
```

---

## Summary Checklist

### Backend
- [ ] Create generator in `/backend/services/lessonProcessors/questions/`
- [ ] Add `numbersReturned` field to all level generators
- [ ] Create config in `/backend/config/lessonConfigs/`
- [ ] Register generator in `/backend/services/lessonProcessors/index.js`
- [ ] Register config in `/backend/config/lessonConfigs/index.js`
- [ ] Remove hardcoded references in middleware5 (if any)
- [ ] Update getLessonDataInitial.js with hints
- [ ] Restart backend server
- [ ] Test all levels return 10 questions

### Frontend
- [ ] Create component in `/frontends/lessons/src/features/lessons/lessonTypes/[category]/`
- [ ] Use `useLessonState` hook
- [ ] Use `questionAnswerArray[currentQuestionIndex]`
- [ ] Parse `levelNum` with parseInt
- [ ] Use `AnswerInput` component
- [ ] Implement visualization (if needed)
- [ ] Add visual scaffolding pattern (if appropriate)
- [ ] Position hint button (top-right fixed)
- [ ] Export from category index.js
- [ ] Add lazy import to DataLesson.js
- [ ] Register in DataLesson mapping
- [ ] Test in browser

### Validation
- [ ] Backend returns batch of 10 questions
- [ ] Frontend loads without errors
- [ ] Visualizations render correctly
- [ ] Answer input works
- [ ] Question navigation works
- [ ] Level switching works
- [ ] Dark mode works
- [ ] Responsive layout works

---

## Example: Adding Integers Lesson

**Full implementation example**: See commit history for adding_integers lesson

**Key Files**:
- Backend Generator: `backend/services/lessonProcessors/questions/addingIntegersGenerator.js`
- Backend Config: `backend/config/lessonConfigs/adding_integers.config.js`
- Frontend Component: `frontends/lessons/src/features/lessons/lessonTypes/algebra/AddingIntegersLesson.jsx`

**Features Implemented**:
- 5 levels with different difficulty
- Number line visualization (L1, L3, L4)
- Chips visualization (L2)
- Word problems with thermometer (L5)
- Visual scaffolding (hide after Q4)
- Batch generation (10 questions per level)
- Dark mode support
- Responsive design

---

## Additional Resources

- **Phase 2.5 Patterns**: `/frontends/lessons/REFACTORING.md`
- **Lesson Architecture**: `/backend/CLAUDE.md`
- **Hook Documentation**: `/frontends/lessons/src/hooks/README.md`
- **Validation System**: `/backend/services/lessonProcessors/validation/questionValidator.js`

---

**Questions or Issues?**
Check past conversations in `~/.claude/projects/` for debugging examples and solutions.
