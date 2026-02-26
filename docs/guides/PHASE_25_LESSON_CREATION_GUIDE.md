# Phase 2.5 Lesson Creation Guide
## Complete Reference for Creating Custom Batch-Cached Lessons

**Version:** 1.0
**Last Updated:** February 24, 2026
**Status:** Active - Based on Multiplying Integers Lesson
**Audience:** AI Developers, Lesson Creators

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Process](#step-by-step-process)
4. [Critical Patterns](#critical-patterns)
5. [Common Pitfalls](#common-pitfalls)
6. [Testing & Debugging](#testing--debugging)
7. [Reference Lessons](#reference-lessons)
8. [Checklist](#checklist)

---

## Overview

Phase 2.5 introduces **batch caching** for lessons - the backend generates 10 questions at once and caches them in Redux. This dramatically improves performance by eliminating API calls between questions.

**Key Features:**
- 10 questions generated per batch
- Instant question transitions (no loading)
- Completion modal after 10 questions
- Accuracy tracking per batch
- Level-specific generators

**This Guide Covers:**
- Creating lessons with multiple levels (1-6+)
- Custom frontend components with special interactions
- Backend generators with custom data structures
- Button-based choice systems (not just text input)
- State management for complex interactions

---

## Architecture Overview

### Data Flow

```
User requests Level X
     ↓
Backend generates 10 questions for Level X
     ↓
Frontend caches all 10 in Redux (questionAnswerArray)
     ↓
Component reads current question from array[currentQuestionIndex]
     ↓
User answers correctly → increment currentQuestionIndex
     ↓
Repeat until all 10 answered
     ↓
Show completion modal
```

### Key State Variables

**Redux State (Global):**
- `questionAnswerArray` - Array of 10 cached questions
- `currentQuestionIndex` - Which question we're on (0-9)
- `showAnswer` - Whether to show explanation (set by Redux)
- `lessonProps` - Current lesson data (partially updated by Redux)

**Component State (Local):**
- `phase` - UI phase: 'interact' or 'complete' (CRITICAL for Level 5+ button interactions)
- `selectedChoice` - Which button was clicked
- `shakingIdx` - Which button to animate on wrong answer
- `showHint` - Whether hint is visible

---

## Step-by-Step Process

### Phase 1: Planning & Requirements

**Before writing any code, define:**

1. **Levels & Pedagogy**
   - How many levels? (typically 5-6)
   - What skill does each level teach?
   - How do levels build on each other?
   - Example (Multiplying Integers):
     - L1: Positive × Positive (foundation)
     - L2: Positive × Negative (introduce negative result)
     - L3: Negative × Positive (commutative property)
     - L4: Negative × Negative (two negatives = positive)
     - L5: Sign Prediction (conceptual understanding)
     - L6: Word Problems (application)

2. **Data Structure**
   - What makes a question? (expression, answer, choices, etc.)
   - What visual data is needed? (graphs, diagrams, buttons)
   - Example structure:
     ```javascript
     {
       level: 5,
       levelNum: '5',
       question: [{ text: 'Will −3 · 7 be positive or negative?' }],
       answer: ['negative'],
       acceptedAnswers: ['negative'],
       hint: 'A positive times a negative always gives a negative result.',
       explanation: 'When you multiply numbers with different signs...',
       visualData: {
         type: 'signPrediction',
         expression: '−3 · 7',
         result: -21,
         choices: ['positive', 'negative']
       }
     }
     ```

3. **Interaction Type**
   - Text input? (use AnswerInput component)
   - Multiple choice buttons? (use custom buttons with phase state)
   - Canvas interaction? (use Konva)
   - Drag and drop? (use custom component)

4. **Reference Lessons**
   - Find 2-3 similar existing lessons
   - Study their patterns
   - Reuse their approaches
   - Key references:
     - `SubtractingIntegersLesson.jsx` - Text input pattern
     - `ShapesLesson.jsx` - Button interaction with phase state
     - `AddingIntegersLesson.jsx` - Number line visualization

### Phase 2: Backend Implementation

#### File 1: Generator (`backend/aqueous-eyrie-54478/services/lessonProcessors/questions/`)

**Template:**

```javascript
/**
 * [LESSON NAME] Question Generator
 * Phase 2.5 - Custom batch question generation
 *
 * Generates [X] levels of [topic] questions with batch caching support
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================== LEVEL GENERATORS ====================

function generateLevel1() {
  // Generate one question for Level 1
  // Return object with: level, levelNum, question, answer, acceptedAnswers, hint, explanation, visualData

  const num1 = getRandomInt(2, 12);
  const num2 = getRandomInt(2, 12);
  const answer = num1 + num2; // or whatever operation

  return {
    level: 1,
    levelNum: '1',
    question: [{ text: `What is ${num1} + ${num2}?` }],
    answer: [String(answer)],
    acceptedAnswers: [String(answer)],
    hint: 'Add the two numbers together.',
    explanation: `${num1} + ${num2} = ${answer}`,
    visualData: {
      // Any extra data for visualization
      num1,
      num2,
      operation: 'addition'
    },
    problemTypeReturned: 'lesson_name',
    wordProblemReturned: false,
    numbersReturned: true
  };
}

function generateLevel2() {
  // Similar to Level 1, but different difficulty/concept
  // ...
}

// ... more levels

// ==================== LEVEL MAPPING ====================

const LEVEL_GENERATORS = {
  1: generateLevel1,
  2: generateLevel2,
  3: generateLevel3,
  // ... etc
};

// ==================== MAIN GENERATOR ====================

/**
 * Main generator function - creates single question
 */
export function lessonNameGenerator({ lessonName, level }) {
  const generator = LEVEL_GENERATORS[level];

  if (!generator) {
    throw new Error(`No generator found for ${lessonName} level ${level}`);
  }

  return generator();
}

/**
 * Check if this generator supports a lesson
 */
export function supportsLesson(lessonName) {
  return lessonName === 'lesson_name';
}
```

**Critical Notes:**
- Use `export function` NOT `module.exports` (ES6 modules)
- Each level generator returns ONE question object
- The batch system calls it 10 times automatically
- Always include `problemTypeReturned`, `wordProblemReturned`, `numbersReturned`
- For button choices, put them in `visualData.choices`

#### File 2: Config (`backend/aqueous-eyrie-54478/config/lessonConfigs/`)

**Template:**

```javascript
/**
 * [LESSON NAME] Configuration
 * Phase 2.5 - Batch caching enabled
 */

export default {
  name: 'lesson_name',
  displayName: 'Lesson Display Name',

  // Pipeline configuration
  pipeline: {
    // Skip middleware steps we don't need
    skipSteps: [3, 5, 6, 7, 8, 9, 10, 11],

    // Enable custom data generation
    customDataGeneration: {
      enabled: true,
      levels: [1, 2, 3, 4, 5, 6], // Which levels to generate
      generator: 'lessonNameGenerator', // Function name from generator file
      batchSize: 10 // Always 10 for Phase 2.5
    }
  },

  // Frontend configuration
  frontend: {
    componentType: 'custom',
    levels: 6, // Total number of levels
    components: [
      'LessonNameLesson', // Level 1
      'LessonNameLesson', // Level 2
      'LessonNameLesson', // Level 3
      'LessonNameLesson', // Level 4
      'LessonNameLesson', // Level 5
      'LessonNameLesson', // Level 6
    ]
  }
};
```

**Critical Notes:**
- `generator` name must match the export name in generator file
- `levels` array must list all levels that need generation
- `skipSteps` should be `[3, 5, 6, 7, 8, 9, 10, 11]` for Phase 2.5
- Components array can use same component for all levels (it detects level internally)

#### File 3: Register Generator

**Location:** `backend/aqueous-eyrie-54478/services/lessonProcessors/questions/generatorRegistry.js`

Add one line:

```javascript
import { lessonNameGenerator, supportsLesson as supportsLessonName } from './lessonNameGenerator.js';

// In the registry object:
export const questionGeneratorRegistry = {
  // ... existing generators
  lessonNameGenerator: {
    generator: lessonNameGenerator,
    supportsLesson: supportsLessonName
  }
};
```

#### File 4: Register Config

**Location:** `backend/aqueous-eyrie-54478/config/lessonConfigs/index.js`

Add two lines:

```javascript
import lesson_name from './lesson_name.config.js';

// In the configs object:
export const lessonConfigs = {
  // ... existing configs
  lesson_name
};
```

#### File 5: Register Lesson Data

**Location:** `backend/aqueous-eyrie-54478/data/lessonRegistration.js`

Add entry:

```javascript
{
  name: 'lesson_name',
  displayName: 'Lesson Display Name',
  chapter: 'appropriate_chapter', // e.g., 'integers', 'geometry'
  order: 99, // Position in chapter
  image: '/images/lessons/lesson_name.png' // Optional
}
```

### Phase 3: Frontend Implementation

#### File 1: Component (`frontends/lessons/src/features/lessons/lessonTypes/[category]/`)

**CRITICAL PATTERN: Use Phase State for Button Interactions!**

```javascript
/**
 * [LESSON NAME] - Lesson Component
 *
 * [Brief description]
 * L1 — [Description]
 * L2 — [Description]
 * ... etc
 */

import React, { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

function LessonNameLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  // ==================== LOCAL STATE ====================

  const [showHint, setShowHint] = useState(false);

  // For text input levels (1-4):
  // No additional state needed, AnswerInput handles it

  // For button choice levels (5+):
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [shakingIdx, setShakingIdx] = useState(null);
  const [phase, setPhase] = useState('interact'); // ⚠️ CRITICAL for button levels!

  // ==================== DATA EXTRACTION ====================

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const {
    question,
    answer,
    acceptedAnswers,
    hint,
    explanation,
    visualData,
    level,
    levelNum: levelNumStr
  } = currentProblem;

  const levelNum = parseInt(levelNumStr || level || '1', 10);
  const questionText = question?.[0]?.text || question || '';

  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // For button levels:
  const choices = visualData?.choices || [];

  // ==================== EVENT HANDLERS ====================

  const handleTryAnother = () => {
    setShowHint(false);
    setSelectedChoice(null);
    setShakingIdx(null);
    setPhase('interact'); // ⚠️ CRITICAL: Reset phase FIRST
    hideAnswer();
    triggerNewProblem();
  };

  const handleCorrectAnswer = () => {
    revealAnswer();
  };

  // For button choice levels ONLY:
  const handleChoiceClick = (choice, idx) => {
    // ⚠️ CRITICAL: Check phase for button levels
    if (levelNum >= 5 && phase !== 'interact') return;
    if (selectedChoice !== null) return;

    const isCorrect = correctAnswer.includes(choice.toLowerCase());

    if (isCorrect) {
      setSelectedChoice(idx);
      setTimeout(() => {
        if (levelNum >= 5) {
          setPhase('complete'); // ⚠️ CRITICAL: Set phase before reveal
        }
        handleCorrectAnswer();
      }, 600);
    } else {
      setShakingIdx(idx);
      setTimeout(() => setShakingIdx(null), 500);
    }
  };

  // ==================== RESET ON QUESTION CHANGE ====================

  React.useEffect(() => {
    setSelectedChoice(null);
    setShakingIdx(null);
    setPhase('interact'); // ⚠️ CRITICAL: Reset phase when question changes
  }, [currentQuestionIndex]);

  // ==================== RENDER ====================

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {levelNum}</LevelBadge>
        <LevelTitle>
          {levelNum === 1 && 'Level 1 Title'}
          {levelNum === 2 && 'Level 2 Title'}
          {/* ... etc */}
        </LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Interaction Section */}
      <InteractionSection>
        {/* Hint */}
        {showHint && hint && <HintBox>{hint}</HintBox>}

        {/* TEXT INPUT LEVELS (1-4) */}
        {!showAnswer && levelNum < 5 && (
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="array"
              onCorrect={handleCorrectAnswer}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="Enter your answer"
            />
          </AnswerInputContainer>
        )}

        {/* BUTTON CHOICE LEVELS (5+) - ⚠️ CRITICAL PATTERN */}
        {levelNum >= 5 && phase === 'interact' && (
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && correctAnswer.includes(choice.toLowerCase());
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;

              return (
                <ChoiceButton
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  $faded={isFaded}
                  onClick={() => handleChoiceClick(choice, idx)}
                  disabled={selectedChoice !== null}
                >
                  {choice}
                  {isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        )}

        {/* EXPLANATION - TEXT INPUT LEVELS */}
        {showAnswer && levelNum < 5 && explanation && (
          <ExplanationSection>
            <ExplanationTitle>Explanation</ExplanationTitle>
            <ExplanationText>{explanation}</ExplanationText>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}

        {/* EXPLANATION - BUTTON CHOICE LEVELS (⚠️ CRITICAL PATTERN) */}
        {levelNum >= 5 && phase === 'complete' && (
          <ExplanationSection>
            <ExplanationTitle>Correct!</ExplanationTitle>
            {visualData?.result && (
              <AnswerDisplay>
                {visualData?.expression} = {visualData?.result}
              </AnswerDisplay>
            )}
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

// ==================== STYLED COMPONENTS ====================
// (Copy from similar lesson and adapt as needed)
```

**⚠️ CRITICAL PATTERN EXPLANATION:**

**Why Phase State?**
- Redux `showAnswer` has timing issues with batch caching
- Redux updates are async and can race with state changes
- Local `phase` state updates synchronously and reliably
- This is the pattern used by ShapesLesson (the reference implementation)

**Phase State Rules:**
1. Button choice levels MUST use phase state ('interact' / 'complete')
2. Text input levels can use showAnswer directly (AnswerInput handles it)
3. Always check `phase === 'interact'` before allowing button clicks
4. Always set `phase = 'complete'` when correct button clicked
5. Always reset `phase = 'interact'` in handleTryAnother
6. Always reset `phase = 'interact'` in useEffect when question changes

**Without phase state:** "Try Another Problem" doesn't advance to next question (the bug we fixed!)

#### File 2: Register Component

**Location:** `frontends/lessons/src/features/lessons/DataLesson.js`

Add import and mapping:

```javascript
const LessonNameLesson = lazy(() =>
  import('./lessonTypes/category/LessonNameLesson')
);

// In the lessonComponentsMap:
lesson_name: LessonNameLesson,
```

**Location:** `frontends/lessons/src/data/lessonRegistration.js`

Add the same entry as backend registration.

### Phase 4: Testing

**Must test in this order:**

1. **Backend API Test**
   ```bash
   curl "http://localhost:5001/lessons/content/lesson_name&1&1" | jq
   ```
   - Verify: Returns 200
   - Verify: `questionAnswerArray` has 10 items
   - Verify: Each item has correct structure
   - Verify: `visualData` is populated correctly

2. **Frontend Load Test**
   - Navigate to: `http://localhost:3000/lessons/lesson_name/1`
   - Verify: Question loads without errors
   - Verify: UI elements render correctly
   - Check console for errors

3. **Interaction Test** (MOST CRITICAL)
   - Answer question correctly
   - Verify: "Correct!" or explanation shows
   - Click "Try Another Problem"
   - **Verify: Next question appears immediately** ⚠️
   - Repeat for all 10 questions
   - Verify: Completion modal shows after 10th question

4. **Level Transition Test**
   - Navigate to Level 2, Level 3, etc.
   - Verify: Each level shows correct question type
   - Verify: Button labels match level requirements

5. **Error Handling Test**
   - Submit wrong answer
   - Verify: Feedback shows
   - Verify: Can try again
   - Test hint button if present

6. **State Reset Test**
   - Answer question halfway
   - Navigate away
   - Return to lesson
   - Verify: Starts fresh (no stale state)

---

## Critical Patterns

### Pattern 1: Phase State for Button Interactions

**❌ WRONG (causes "Try Another" to not work):**

```javascript
// Render choices:
{!showAnswer && levelNum === 5 && (
  <button onClick={handleClick}>Choice</button>
)}

// Render explanation:
{showAnswer && levelNum === 5 && (
  <div>Correct!</div>
)}
```

**✅ CORRECT:**

```javascript
// Add phase state:
const [phase, setPhase] = useState('interact');

// Render choices:
{levelNum === 5 && phase === 'interact' && (
  <button onClick={handleClick}>Choice</button>
)}

// Render explanation:
{levelNum === 5 && phase === 'complete' && (
  <div>Correct!</div>
)}

// On correct click:
setPhase('complete');
handleCorrectAnswer();

// On "Try Another":
setPhase('interact');
hideAnswer();
triggerNewProblem();

// On question change:
React.useEffect(() => {
  setPhase('interact');
}, [currentQuestionIndex]);
```

### Pattern 2: Reading Current Question

**✅ CORRECT:**

```javascript
const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
const { question, answer, visualData, hint, explanation } = currentProblem;
```

**Why:** Component reads directly from cached array. Redux `lessonProps` is only partially updated.

### Pattern 3: ES6 Module Exports (Backend)

**❌ WRONG:**

```javascript
module.exports = { myGenerator };
```

**✅ CORRECT:**

```javascript
export function myGenerator({ lessonName, level }) { ... }
export function supportsLesson(lessonName) { ... }
```

**Why:** Backend uses ES6 modules. CommonJS causes caching issues.

### Pattern 4: Function Call Order in handleTryAnother

**✅ CORRECT ORDER:**

```javascript
const handleTryAnother = () => {
  // 1. Reset all local state
  setShowHint(false);
  setSelectedChoice(null);
  setShakingIdx(null);
  setPhase('interact'); // For button levels

  // 2. Hide answer in Redux
  hideAnswer();

  // 3. Trigger next problem
  triggerNewProblem();
};
```

**Why:** State must be clean before Redux dispatch happens. Order matters!

### Pattern 5: Correct Answer Format

**Backend returns:**
```javascript
answer: ['negative'] // Array of strings
acceptedAnswers: ['negative'] // Array of strings
```

**Frontend processes:**
```javascript
const correctAnswer = useMemo(() => {
  if (acceptedAnswers?.length > 0) return acceptedAnswers;
  if (Array.isArray(answer)) return answer;
  return [String(answer)];
}, [answer, acceptedAnswers]);

// Check if correct:
const isCorrect = correctAnswer.includes(choice.toLowerCase());
```

**Why:** AnswerInput expects array. Button checks need lowercase comparison.

---

## Common Pitfalls

### Pitfall 1: "Try Another Problem" Button Doesn't Work

**Symptom:** Clicking "Try Another Problem" does nothing. Question doesn't change.

**Root Cause:** Using `showAnswer` instead of `phase` state for button levels.

**Solution:** Implement phase state pattern (see Pattern 1 above).

**How to diagnose:**
- Add console.log in handleTryAnother
- Check if it's being called
- Check if currentQuestionIndex increments
- If index increments but UI doesn't update → phase state issue

### Pitfall 2: Backend Returns 500 Error

**Symptom:** API request fails with 500 error or "Cannot read properties of undefined"

**Root Causes:**
1. Using `module.exports` instead of `export function`
2. Generator file not registered in generatorRegistry.js
3. Config file not registered in index.js
4. Generator returning wrong structure

**Solution:**
1. Use ES6 exports everywhere
2. Restart backend with `pkill -9 node && npm start`
3. Check all registration files
4. Verify generator returns required fields

### Pitfall 3: Questions Don't Load

**Symptom:** Frontend shows loading spinner forever or "Loading..." text

**Root Causes:**
1. Backend not running
2. Wrong lesson name in URL
3. Config missing levels array
4. Generator doesn't support requested level

**Solution:**
1. Check backend is running on port 5001
2. Verify lesson name matches exactly (snake_case)
3. Verify config has all levels listed
4. Add console.log in generator to see what's being called

### Pitfall 4: Visual Data Missing in Frontend

**Symptom:** Buttons don't render, choices are empty, custom data missing

**Root Cause:** Not including visualData in generator return

**Solution:**
```javascript
return {
  // ... other fields
  visualData: {
    choices: ['Option 1', 'Option 2'],
    expression: '−3 · 7',
    result: -21,
    // ... any other custom data
  }
};
```

### Pitfall 5: Notation Issues

**Symptom:** Wrong symbols showing (× instead of ·, parentheses around negatives)

**Solution:**
- Use Unicode dot: `·` (U+00B7) NOT `x` or `×`
- Use minus sign: `−` (U+2212) NOT hyphen `-`
- Don't wrap negatives in parentheses: `−3` NOT `(−3)`

**Template strings:**
```javascript
const expression = `${sign1 < 0 ? '−' : ''}${Math.abs(num1)} · ${sign2 < 0 ? '−' : ''}${Math.abs(num2)}`;
```

### Pitfall 6: State Not Resetting Between Questions

**Symptom:** Previous question's state carries over to next question

**Root Cause:** Missing useEffect or incomplete state reset

**Solution:**
```javascript
React.useEffect(() => {
  setSelectedChoice(null);
  setShakingIdx(null);
  setPhase('interact'); // If using phase state
  setShowHint(false);   // If needed
  // ... reset any other relevant state
}, [currentQuestionIndex]);
```

### Pitfall 7: Styling Issues (Button Colors, Animations)

**Symptom:** Buttons don't have correct colors, animations don't work

**Common mistakes:**
1. Forgetting `$` prefix for transient props: `$correct` not `correct`
2. Not using styled-components `css` helper for conditional styles
3. Hardcoding colors instead of theme tokens

**Solution:**
```javascript
import styled, { css } from 'styled-components';

const Button = styled.button`
  // Base styles

  ${props => props.$correct && css`
    background: ${props.theme.colors.success};
  `}

  ${props => props.$wrong && css`
    animation: shake 0.4s;
  `}

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
`;
```

---

## Testing & Debugging

### Debug Strategy

**When "Try Another Problem" doesn't work:**

1. **Add logging to handleTryAnother:**
   ```javascript
   const handleTryAnother = () => {
     console.log('[DEBUG] handleTryAnother called');
     console.log('[DEBUG] currentQuestionIndex:', currentQuestionIndex);
     console.log('[DEBUG] questionAnswerArray length:', questionAnswerArray?.length);
     console.log('[DEBUG] phase:', phase);
     console.log('[DEBUG] showAnswer:', showAnswer);
     // ... rest of function
   };
   ```

2. **Add logging to render:**
   ```javascript
   React.useEffect(() => {
     console.log('[DEBUG] Render - index:', currentQuestionIndex);
     console.log('[DEBUG] Render - phase:', phase);
     console.log('[DEBUG] Render - question:', questionText?.substring(0, 50));
   });
   ```

3. **Check Redux DevTools:**
   - Install Redux DevTools browser extension
   - Watch `currentQuestionIndex` as you click "Try Another"
   - Watch `questionAnswerArray` to see if questions are cached
   - Watch `showAnswer` state changes

4. **Check Network Tab:**
   - Open browser DevTools → Network
   - Filter by XHR
   - First question should trigger API call
   - Next 9 questions should NOT trigger API calls (using cache)
   - If every question calls API → batch caching not working

### Common Debug Findings

**If handleTryAnother is called but question doesn't change:**
→ Phase state issue. Implement phase pattern.

**If currentQuestionIndex increments but UI shows same question:**
→ Component not re-rendering. Check useEffect dependencies.

**If questionAnswerArray is empty:**
→ Backend not generating batch. Check config and generator registration.

**If every question triggers API call:**
→ Batch caching disabled. Check config has `customDataGeneration.enabled: true`.

### Testing Checklist

```
□ Backend API returns 10 questions
□ Frontend loads first question
□ Can answer question correctly
□ Explanation shows after correct answer
□ "Try Another Problem" advances to next question ⚠️ CRITICAL
□ Can cycle through all 10 questions
□ Completion modal shows after 10th question
□ Can answer question incorrectly (shows feedback)
□ Hint button works (if present)
□ All 6 levels work independently
□ Level transitions work correctly
□ No console errors
□ No Redux state pollution between levels
```

---

## Reference Lessons

### For Text Input Patterns
**SubtractingIntegersLesson.jsx**
- Clean implementation of text input levels
- Good error handling
- Standard AnswerInput usage

### For Button Choice Patterns
**ShapesLesson.jsx** ⭐ **PRIMARY REFERENCE**
- Uses phase state correctly
- Button interactions with animations
- Multiple choice levels
- **FOLLOW THIS PATTERN FOR BUTTON LEVELS**

### For Mixed Patterns
**MultiplyingIntegersLesson.jsx**
- Levels 1-4: Text input
- Level 5: Button choices with phase state
- Level 6: Word problems (text input)
- Shows how to mix patterns in one component

### For Complex Visualizations
**AddingIntegersLesson.jsx**
- Number line visualization
- Konva canvas integration
- Complex visual data

---

## Checklist

### Before Starting
```
□ Read this guide completely
□ Study 2-3 reference lessons
□ Define all levels and pedagogy
□ Sketch data structures
□ Plan interaction types per level
```

### Backend Checklist
```
□ Create generator file with ES6 exports
□ Implement all level generators
□ Return correct data structure (level, levelNum, question, answer, visualData, etc.)
□ Create config file with correct levels array
□ Register generator in generatorRegistry.js
□ Register config in index.js
□ Register lesson in lessonRegistration.js
□ Test API endpoint returns 10 questions
□ Restart backend with clean cache (pkill -9 node)
```

### Frontend Checklist
```
□ Create component file in correct category folder
□ Import useLessonState hook
□ Add phase state if using button choices (Level 5+)
□ Read data from questionAnswerArray[currentQuestionIndex]
□ Implement handleTryAnother correctly (order matters!)
□ Implement handleChoiceClick with phase checks (if buttons)
□ Add useEffect to reset state on question change
□ Use phase state for render conditions (if buttons)
□ Use showAnswer for text input render conditions
□ Add all styled components
□ Register component in DataLesson.js
□ Register lesson in lessonRegistration.js
```

### Testing Checklist
```
□ Backend API test (curl)
□ Frontend load test
□ Interaction test (answer question)
□ "Try Another Problem" test ⚠️ CRITICAL
□ Cycle through all 10 questions
□ Completion modal test
□ Wrong answer test
□ Hint button test
□ All levels test
□ Level transition test
□ Console error check
□ Network tab check (should see 1 API call, not 10)
```

---

## Quick Reference Card

### Must-Have Backend Fields
```javascript
{
  level: 1,                    // Number
  levelNum: '1',               // String
  question: [{text: '...'}],   // Array of objects
  answer: ['...'],             // Array of strings
  acceptedAnswers: ['...'],    // Array of strings
  hint: '...',                 // String
  explanation: '...',          // String
  visualData: {},              // Object with custom data
  problemTypeReturned: 'lesson_name',
  wordProblemReturned: false,
  numbersReturned: true
}
```

### Must-Have Frontend State (Button Levels)
```javascript
const [phase, setPhase] = useState('interact'); // ⚠️ CRITICAL
const [selectedChoice, setSelectedChoice] = useState(null);
const [shakingIdx, setShakingIdx] = useState(null);
```

### Must-Have Frontend Patterns
```javascript
// Read current question:
const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;

// handleTryAnother order:
setPhase('interact');  // 1. Reset local state
hideAnswer();          // 2. Hide answer
triggerNewProblem();   // 3. Load next

// Render conditions (button levels):
{phase === 'interact' && <Buttons />}
{phase === 'complete' && <Explanation />}

// Reset on question change:
React.useEffect(() => {
  setPhase('interact');
}, [currentQuestionIndex]);
```

---

## Version History

**1.0** (Feb 24, 2026)
- Initial guide based on Multiplying Integers lesson creation
- Documents phase state pattern for button interactions
- Complete backend and frontend patterns
- Common pitfalls and solutions
- Testing and debugging strategies

---

**Questions? Issues?**
- Review reference lessons: ShapesLesson.jsx (button patterns), SubtractingIntegersLesson.jsx (text input)
- Check MULTI_BOT_SYSTEM.md for workflow guidance
- Check LESSON_DEVELOPMENT_CHECKLIST.md for general lesson guidelines
- Add debug logging and check browser console
- Use Redux DevTools to inspect state changes
