# Interactive Lesson Patterns - Quick Reference Card
**For fast pattern lookup during development**

---

## 🎯 When to Use Each Pattern

| Pattern | Use When | Example Lessons |
|---------|----------|-----------------|
| **Button Selection** | Students need to make conceptual choices | Solving Equations L1, Symmetry Identify |
| **Multi-Stage** | Problem requires sequential steps | Solving Equations L2 (two-step equations) |
| **Drawing Canvas** | Students need to show work visually | Solving Equations L1-2, Symmetry lessons |
| **Visual Helpers** | Abstract concepts need visualization | Balance scale, number lines, diagrams |
| **Progressive Fade** | Scaffolding should decrease over time | Visual helpers after Q8 |

---

## 🚀 Quick Start Checklist

**Before writing code:**
- [ ] Read full guide: `/docs/INTERACTIVE_LESSON_PATTERNS.md`
- [ ] Review reference lesson: `SolvingEquationsLesson.jsx`
- [ ] Plan 5-level progression (easy → complex)
- [ ] Identify scaffolding needs per level
- [ ] Determine when to fade scaffolding

**While coding:**
- [ ] Use Redux for answer state: `dispatch(setUserAnswer(value))`
- [ ] Use local state for UI: `const [showHint, setShowHint] = useState(false)`
- [ ] Add visual feedback: green = correct, red = incorrect
- [ ] Include animations: `slideIn`, `fadeIn` keyframes
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Verify dark mode colors via theme
- [ ] Reset state on question change

**Before submitting:**
- [ ] Test on iPad Safari (primary target)
- [ ] Verify touch events work
- [ ] Check dark mode visual correctness
- [ ] Run accessibility audit
- [ ] Update INTERACTIVE_LESSON_PATTERNS.md if you discovered new patterns

---

## 📋 Code Snippets

### Button Selection Pattern

```javascript
const [selectedOption, setSelectedOption] = useState(null);

const handleSelect = (option) => {
  setSelectedOption(option);
  if (option.isCorrect) {
    // Success flow
  }
};

<OptionButton
  $selected={selectedOption === option}
  $correct={selectedOption === option && option.isCorrect}
  onClick={() => handleSelect(option)}
>
  <InlineMath math={option.display} />
</OptionButton>
```

**Styled Component:**
```javascript
const OptionButton = styled.button`
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
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;
```

---

### Multi-Stage Progression

```javascript
const [step1, setStep1] = useState(null);
const [step2, setStep2] = useState(null);

// Stage 1
{!step1 && <StageOne onSelect={setStep1} />}

// Stage 2 (only after Stage 1 correct)
{step1?.isCorrect && !step2 && (
  <>
    <SuccessMessage>✓ Correct! Now Step 2.</SuccessMessage>
    <StageTwo onSelect={setStep2} />
  </>
)}

// Final (after both correct)
{step1?.isCorrect && step2?.isCorrect && (
  <FinalStep />
)}

// Reset on question change
useEffect(() => {
  setStep1(null);
  setStep2(null);
}, [currentQuestionIndex]);
```

---

### Drawing Canvas Integration

```javascript
import { DrawingCanvas } from '../../../../shared/components';

const [showCanvas, setShowCanvas] = useState(false);

const handleCanvasSubmit = () => {
  const isCorrect = validateAnswer(userAnswer, correctAnswer, 'array', lessonName);
  dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));
  if (isCorrect) handleCorrectAnswer();
};

<DrawingCanvas
  equation={questionText}
  questionIndex={currentQuestionIndex}
  visible={showCanvas}
  onClose={() => setShowCanvas(false)}
  disabled={showAnswer}
  onAnswerRecognized={(text) => dispatch(setUserAnswer(text))}
  onSubmit={handleCanvasSubmit}
/>
```

---

### Progressive Scaffolding Fade

```javascript
const [showHelper, setShowHelper] = useState(true);

// Auto-hide after question 8
useEffect(() => {
  if (currentQuestionIndex >= 7) {
    setShowHelper(false);
  }
}, [currentQuestionIndex]);

// Toggle button (optional)
<ToggleButton onClick={() => setShowHelper(!showHelper)}>
  {showHelper ? 'Hide' : 'Show'} Helper
</ToggleButton>

{showHelper && <VisualHelper />}
```

---

### Visual Feedback Messages

```javascript
const SuccessMessage = styled.div`
  padding: 12px 20px;
  background: #10B98115;
  border-left: 4px solid #10B981;
  color: #065F46;
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;

  &::before {
    content: '✓ ';
    font-size: 18px;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 20px;
  background: #EF444415;
  border-left: 4px solid #EF4444;
  color: #991B1B;
  border-radius: 8px;
  animation: shake 0.4s ease-out;
`;

// Usage
{isCorrect && <SuccessMessage>Correct!</SuccessMessage>}
{!isCorrect && <ErrorMessage>Try again.</ErrorMessage>}
```

---

### Hint System

```javascript
const [showHint, setShowHint] = useState(false);

const hint = useMemo(() => {
  // Generate contextual hint based on level/question
  return "Think about the inverse operation...";
}, [levelNum, question]);

<HintButton onClick={() => setShowHint(true)}>
  Need a Hint?
</HintButton>

{showHint && <HintBox>{hint}</HintBox>}

// Reset on question change
useEffect(() => {
  setShowHint(false);
}, [currentQuestionIndex]);
```

---

## 🎨 Design Tokens

### Colors
```javascript
// Success
primary: '#10B981'         // Green
primaryLight: '#10B98115'  // Green with alpha

// Error
error: '#EF4444'           // Red
errorLight: '#EF444415'    // Red with alpha

// Canvas
canvasStroke: '#F97316'    // Orange (matches symmetry lessons)
```

### Animations
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

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;
```

---

## 🔧 Redux Integration

### Selectors
```javascript
const userAnswer = useSelector(state => state.lesson.userAnswer);
const answerFeedback = useSelector(state => state.lesson.answerFeedback);
const lessonName = useSelector(state => state.lesson.lessonProps.lessonName);
const isUsingBatch = useSelector(state =>
  state.lesson.questionAnswerArray?.length > 0
);
```

### Actions
```javascript
import { setUserAnswer, setAnswerFeedback, recordAnswer } from '../../../../store/lessonSlice';

dispatch(setUserAnswer(value));
dispatch(setAnswerFeedback('correct' | 'incorrect' | null));
dispatch(recordAnswer({ isCorrect: boolean }));
```

### Validation
```javascript
import { validateAnswer } from '../../../../shared/helpers/validateAnswer';

const isCorrect = validateAnswer(
  userAnswer,           // Student's answer
  correctAnswer,        // Expected answer
  'array',             // Answer type ('number' | 'array' | 'string')
  lessonName           // For lesson-specific validation rules
);
```

---

## 📱 Accessibility Checklist

```javascript
// ARIA labels
<Button
  aria-label="Select operation: Add 3"
  aria-pressed={selected}
  aria-describedby="instructions"
/>

// Screen reader only text
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
  Use Tab to navigate, Enter to select.
</SrOnly>

// Keyboard support
const handleKeyPress = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleSelect();
  }
};

<Button onKeyPress={handleKeyPress} tabIndex={0}>
  Select
</Button>
```

---

## 🚫 Common Pitfalls

### ❌ DON'T:
- Pre-load saved canvas drawings (start blank)
- Use multiple colors on canvas (stick to orange #F97316)
- Add visual clutter (dashed boxes, unnecessary borders)
- Attempt handwriting recognition (use manual typing)
- Keep scaffolding forever (fade after mastery)
- Forget to reset state on question change
- Use local state for answer data (use Redux)

### ✅ DO:
- Start canvas blank, auto-save as they draw
- Single orange color for drawing
- Minimal visual design (clean, focused)
- Manual typing input (100% accuracy)
- Progressive fade after Q7-8
- Reset all selections on question change
- Redux for answer, local state for UI

---

## 📚 Full Documentation

**Comprehensive guide:** `/docs/INTERACTIVE_LESSON_PATTERNS.md`
- Complete pattern explanations
- Detailed code examples
- Full drawing canvas integration guide
- State management deep dive
- Lessons learned & case studies

**Reference implementations:**
- `/src/features/lessons/lessonTypes/algebra/SolvingEquationsLesson.jsx`
- `/src/shared/components/DrawingCanvas.jsx`
- `/src/features/lessons/lessonTypes/geometry/SymmetryIdentify.jsx`

**Conversation history:**
- `/context/conversations/solving_equations_interactive_patterns.md`

---

**Last Updated:** 2026-02-24
**Quick Reference Version:** 1.0
**Full Guide:** INTERACTIVE_LESSON_PATTERNS.md
