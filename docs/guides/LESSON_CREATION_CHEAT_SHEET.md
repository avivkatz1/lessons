# Lesson Creation Cheat Sheet
## Quick Reference for Phase 2.5 Lessons

**Last Updated:** February 24, 2026

---

## 🚨 CRITICAL: Phase State Pattern

**For button-based choice levels (multiple choice, yes/no, etc.):**

```javascript
// ✅ ALWAYS use local phase state
const [phase, setPhase] = useState('interact');

// ✅ Render based on phase
{phase === 'interact' && <Buttons />}
{phase === 'complete' && <Explanation />}

// ✅ Set phase on correct answer
setPhase('complete');
revealAnswer();

// ✅ Reset phase on "Try Another"
const handleTryAnother = () => {
  setPhase('interact');  // MUST be first!
  hideAnswer();
  triggerNewProblem();
};

// ✅ Reset phase on question change
React.useEffect(() => {
  setPhase('interact');
}, [currentQuestionIndex]);
```

**❌ DON'T use Redux showAnswer for button levels - causes race conditions!**

**✅ DO use showAnswer for text input levels - AnswerInput handles it correctly**

---

## 📋 Backend Checklist

```javascript
// 1. Generator file (ES6 modules!)
export function lessonNameGenerator({ lessonName, level }) {
  const generator = LEVEL_GENERATORS[level];
  return generator(); // Returns ONE question
}

export function supportsLesson(lessonName) {
  return lessonName === 'lesson_name';
}

// 2. Each question MUST return:
{
  level: 1,
  levelNum: '1',
  question: [{ text: '...' }],
  answer: ['...'],
  acceptedAnswers: ['...'],
  hint: '...',
  explanation: '...',
  visualData: { /* custom data */ },
  problemTypeReturned: 'lesson_name',
  wordProblemReturned: false,
  numbersReturned: true
}

// 3. Config file
export default {
  name: 'lesson_name',
  displayName: 'Lesson Name',
  pipeline: {
    skipSteps: [3, 5, 6, 7, 8, 9, 10, 11],
    customDataGeneration: {
      enabled: true,
      levels: [1, 2, 3, 4, 5, 6],
      generator: 'lessonNameGenerator',
      batchSize: 10
    }
  },
  frontend: {
    componentType: 'custom',
    levels: 6,
    components: ['LessonNameLesson', ...]
  }
};

// 4. Register in 3 places:
// - generatorRegistry.js
// - config/index.js
// - data/lessonRegistration.js
```

---

## 📋 Frontend Checklist

```javascript
// 1. Import Phase 2.5 hook
const {
  lessonProps,
  showAnswer,
  revealAnswer,
  hideAnswer,
  questionAnswerArray,
  currentQuestionIndex,
} = useLessonState();

// 2. Local state
const [showHint, setShowHint] = useState(false);
const [phase, setPhase] = useState('interact'); // For button levels!

// 3. Read from cache
const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;

// 4. Format answer
const correctAnswer = useMemo(() => {
  if (acceptedAnswers?.length > 0) return acceptedAnswers;
  if (Array.isArray(answer)) return answer;
  return [String(answer)];
}, [answer, acceptedAnswers]);

// 5. Event handlers
const handleTryAnother = () => {
  setPhase('interact');  // Button levels: MUST reset phase first!
  hideAnswer();
  triggerNewProblem();
};

// 6. Reset on question change
React.useEffect(() => {
  setPhase('interact');
  setSelectedChoice(null);
  // ... reset other state
}, [currentQuestionIndex]);

// 7. Register in 2 places:
// - DataLesson.js (lazy import + mapping)
// - data/lessonRegistration.js
```

---

## 🎯 Testing Checklist

```
□ Backend API returns 10 questions
□ Frontend loads first question
□ Can answer correctly
□ Explanation shows
□ "Try Another Problem" advances ⚠️ MOST CRITICAL
□ Can cycle through all 10 questions
□ Completion modal appears
□ Wrong answer shows feedback
□ All levels work
```

---

## 🐛 Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Try Another" doesn't work | Using showAnswer instead of phase | Add phase state pattern |
| Backend 500 error | Using module.exports | Use `export function` |
| Questions don't load | Backend not registered | Check all 3 registration files |
| Buttons wrong colors | Missing $ prefix | Use `$correct`, `$wrong`, etc. |
| Every question calls API | Batch caching off | Check config has `enabled: true` |
| Visual data missing | Not in generator | Add to visualData object |

---

## 📚 Reference Lessons

- **ShapesLesson.jsx** - Button interactions (PRIMARY REFERENCE)
- **SubtractingIntegersLesson.jsx** - Text input pattern
- **MultiplyingIntegersLesson.jsx** - Mixed levels (text + buttons)

---

## 🎨 Notation Standards

```javascript
// ✅ CORRECT
'−3 · 7'   // Unicode minus (−) and dot (·)
'−5'       // No parentheses

// ❌ WRONG
'(−3) × 7' // Don't use parentheses or ×
'-3 * 7'   // Don't use ASCII hyphen or *
```

---

## 🔧 Debug Commands

```bash
# Test backend
curl "http://localhost:5001/lessons/content/lesson_name&1&1" | jq

# Restart backend (clear cache)
pkill -9 node && npm start

# Check frontend compile
tail -f /tmp/frontend-*.log

# Test lesson
open http://localhost:3000/lessons/lesson_name/1
```

---

## 📖 Full Documentation

**Read first:** `/docs/guides/PHASE_25_LESSON_CREATION_GUIDE.md`

**Summary:** `/docs/MULTIPLYING_INTEGERS_LESSON_SUMMARY.md`

**Workflow:** `/docs/MULTI_BOT_SYSTEM.md`

---

## ⚡ Quick Start

1. Read PHASE_25_LESSON_CREATION_GUIDE.md
2. Study ShapesLesson.jsx and SubtractingIntegersLesson.jsx
3. Define your 5-6 levels and pedagogy
4. Create backend generator (ES6 exports!)
5. Create backend config
6. Register in 3 backend files
7. Test API: `curl http://localhost:5001/...`
8. Create frontend component (phase state for buttons!)
9. Register in 2 frontend files
10. Test: Load → Answer → **"Try Another"** → Repeat 10x

**Most Important:** Use phase state for button levels, test "Try Another Problem" early!

---

**Version:** 1.0 | **Based on:** Multiplying Integers Lesson
