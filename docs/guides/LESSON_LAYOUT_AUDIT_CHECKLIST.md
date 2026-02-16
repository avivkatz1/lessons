# Lesson Layout Audit Checklist

**Reference Standard:** `TangentLesson.jsx` (Lines 61-116, Styled Components 366-561)

This checklist defines the 5-section layout standard that all lessons should follow.

## Required Layout Sections

### 1. TopHintButton (Optional - Only if Hints Exist)
**Purpose:** Fixed-position button for accessing hints, stays visible while scrolling

**Requirements:**
- [ ] Position: `fixed` (top: 15px, right: 20px)
- [ ] z-index: 100 (ensures it stays above other content)
- [ ] Conditional rendering: Only visible when `!showAnswer && !showHint && hint`
- [ ] onClick handler: `setShowHint(true)`
- [ ] Text: "Need a hint?"

**Styled Component Example:**
```javascript
const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;
  background: #edf2f7;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
    padding: 5px 10px;
    font-size: 12px;
  }
`;
```

---

### 2. QuestionSection (Required)
**Purpose:** Display the current question/problem text

**Requirements:**
- [ ] margin-bottom: 20px
- [ ] text-align: center
- [ ] Contains QuestionText component
- [ ] QuestionText font-size: 22px (desktop), 20px (tablet), 18px (mobile)
- [ ] QuestionText font-weight: 600
- [ ] QuestionText color: #1a202c

**Styled Component Example:**
```javascript
const QuestionSection = styled.div`
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const QuestionText = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;
```

**JSX Pattern:**
```jsx
<QuestionSection>
  <QuestionText>{question?.[0]?.text || question}</QuestionText>
</QuestionSection>
```

---

### 3. VisualSection (Conditional - Only if Visual Content Exists)
**Purpose:** Container for visual elements (Konva canvas, diagrams, images)

**Requirements:**
- [ ] background: #f7fafc (light blue-gray)
- [ ] border-radius: 12px (8px on tablet, default on mobile)
- [ ] padding: 16px (12px on tablet, 8px on mobile)
- [ ] margin: 20px 0 (16px on tablet, 12px on mobile)
- [ ] display: flex
- [ ] justify-content: center
- [ ] Conditional rendering: Only when visual content exists

**Styled Component Example:**
```javascript
const VisualSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;

  @media (max-width: 1024px) {
    margin: 16px 0;
    padding: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 8px;
  }
`;
```

**JSX Pattern:**
```jsx
{isVisualLevel && visualData && (
  <VisualSection>
    <RightTriangle visualData={visualData} width={500} height={300} />
  </VisualSection>
)}
```

---

### 4. InteractionSection (Required)
**Purpose:** Container for user interaction (hint box, answer input)

**Requirements:**
- [ ] margin-top: 20px (16px on tablet)
- [ ] Contains HintBox (conditional)
- [ ] Contains AnswerInputContainer
- [ ] AnswerInput uses shared component from `shared/components`

**Styled Component Example:**
```javascript
const InteractionSection = styled.div`
  margin-top: 20px;

  @media (max-width: 1024px) {
    margin-top: 16px;
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;

  @media (max-width: 1024px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 14px;
  }
`;

const AnswerInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    margin: 12px 0;
  }
`;
```

**JSX Pattern:**
```jsx
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
</InteractionSection>
```

---

### 5. ExplanationSection (Conditional - Only When Answer is Revealed)
**Purpose:** Display explanation and calculation steps after correct answer

**Requirements:**
- [ ] background: #f0fff4 (light green)
- [ ] border: 2px solid #68d391 (green)
- [ ] border-radius: 12px (8px on tablet)
- [ ] padding: 20px (16px on tablet, 12px on mobile)
- [ ] margin-top: 16px (12px on tablet)
- [ ] Conditional rendering: Only when `showAnswer === true`
- [ ] Contains CalculationBox (optional)
- [ ] Contains ExplanationText (optional)

**Styled Component Example:**
```javascript
const ExplanationSection = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;

  @media (max-width: 1024px) {
    padding: 16px;
    margin-top: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const CalculationBox = styled.div`
  background: white;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 10px;
  }
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #2d3748;
  margin: 12px 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
    margin: 10px 0;
  }
`;
```

**JSX Pattern:**
```jsx
{showAnswer && (
  <ExplanationSection>
    {calculation && (
      <CalculationBox>
        <CalculationStep><strong>Formula:</strong> {calculation.formula}</CalculationStep>
        <CalculationStep><strong>Substitution:</strong> {calculation.substitution}</CalculationStep>
        <CalculationStep><strong>Result:</strong> {calculation.result}</CalculationStep>
      </CalculationBox>
    )}

    {explanation && (
      <ExplanationText>{explanation}</ExplanationText>
    )}
  </ExplanationSection>
)}
```

---

## Root Wrapper Requirements

**Requirements:**
- [ ] max-width: 900px
- [ ] margin: 0 auto (centers content)
- [ ] padding: 20px (16px on tablet, 12px on mobile)
- [ ] font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif

**Styled Component Example:**
```javascript
const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;

  @media (max-width: 1024px) {
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;
```

---

## Complete Section Order

The sections MUST appear in this order:
1. TopHintButton (fixed position, outside main flow)
2. QuestionSection
3. VisualSection (if applicable)
4. InteractionSection
   - HintBox (when hint is showing)
   - AnswerInputContainer
5. ExplanationSection (when answer is revealed, INSIDE InteractionSection)

---

## Audit Questions for Each Lesson

### Structure
- [ ] Does the lesson use the 5-section layout structure?
- [ ] Are sections in the correct order?
- [ ] Is the root Wrapper properly configured?

### TopHintButton
- [ ] Is the hint button fixed position (top-right)?
- [ ] Does it have z-index: 100?
- [ ] Is it conditionally rendered based on hint availability?

### QuestionSection
- [ ] Is the question centered?
- [ ] Does it use proper responsive font sizing?
- [ ] Is margin-bottom consistent (20px)?

### VisualSection
- [ ] Does it have the light background (#f7fafc)?
- [ ] Is border-radius 12px with responsive adjustments?
- [ ] Is padding 16px with responsive adjustments?
- [ ] Is it conditionally rendered?

### InteractionSection
- [ ] Does the HintBox have the orange/yellow theme (#fff5e6 bg, #f6ad55 border)?
- [ ] Does AnswerInput use the shared component?
- [ ] Is the AnswerInputContainer centered with flexbox?

### ExplanationSection
- [ ] Does it have the green theme (#f0fff4 bg, #68d391 border)?
- [ ] Is it only visible when showAnswer is true?
- [ ] Does it properly display calculations and explanations?

### Responsive Design
- [ ] Are all three breakpoints implemented (768px, 1024px)?
- [ ] Do font sizes scale appropriately?
- [ ] Do spacing values reduce on smaller screens?

---

## Common Deviations to Look For

1. **Inline styles** instead of styled-components
2. **Custom positioning** instead of standard layout flow
3. **Different color schemes** (not matching the standard)
4. **Missing responsive breakpoints**
5. **Hint button not fixed position** (e.g., inline with content)
6. **Explanation section not conditionally rendered**
7. **Custom wrapper dimensions** instead of max-width: 900px
8. **Missing or inconsistent spacing** between sections
9. **Non-centered question text**
10. **VisualSection without the light background**

---

## Audit Status Codes

- **✅ COMPLIANT** - Fully follows the 5-section layout standard
- **⚠️ MINOR** - Follows structure but has minor styling differences (colors, spacing)
- **❌ NON-COMPLIANT** - Does not follow the 5-section structure, needs major refactoring
- **🔧 LEGACY** - Uses old patterns (different architecture entirely)
- **📝 N/A** - Lesson type doesn't fit this pattern (e.g., pure image lessons)
