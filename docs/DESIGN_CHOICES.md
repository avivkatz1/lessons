# Design Choices & UI/UX Decisions

**Version:** 1.0
**Last Updated:** March 1, 2026
**Status:** Living Document
**Purpose:** Track UI/UX design decisions for consistency across lessons

---

## 📋 Table of Contents

1. [Orientation-Based Layouts](#orientation-based-layouts)
2. [Button Positioning](#button-positioning)
3. [Touch Interactions](#touch-interactions)
4. [Future Design Choices](#future-design-choices)

---

## 🎯 Design Philosophy

### Core Principles

1. **iPad-First Optimization** - All lessons must work perfectly on iPad (portrait primary, landscape secondary)
2. **Contextual Adaptation** - UI elements should adapt based on device orientation, size, and context
3. **Smooth Transitions** - All layout changes should animate smoothly (300ms standard)
4. **Consistency** - Similar UI patterns should behave the same way across all lessons
5. **Progressive Enhancement** - Start with portrait, enhance for landscape when beneficial

---

## 1. Orientation-Based Layouts

### Decision: Conditional Button Positioning Based on Orientation

**Date:** March 1, 2026
**Status:** ✅ Implemented
**First Implementation:** `AddingIntegersLesson.jsx`
**Related:** Phase 1 Orientation System

#### Problem Statement

The "Need help?" button had a fixed position (top-right corner) that worked well in landscape mode but was inconsistent with the visual hierarchy in portrait mode. In portrait, the button felt disconnected from the answer input it relates to.

#### Design Decision

**Portrait Mode (Vertical iPad):**
- Position: **Below AnswerInput**, in document flow
- Styling: Full width with `max-width: 400px` (matches AnswerInput)
- Rationale: Creates clear visual hierarchy - Question → Visual → Input → Help

**Landscape Mode (Horizontal iPad):**
- Position: **Top-right corner**, fixed position
- Styling: Auto-width, floating above content
- Rationale: Saves vertical space, traditional "help" button placement

#### Implementation Pattern

```javascript
// Import orientation detection
import { useOrientation } from '../../../../hooks';

// Detect orientation
const { isPortrait, isLandscape } = useOrientation();

// Conditional rendering in JSX
{/* Landscape: Top-right fixed */}
{!showAnswer && !showHint && hint && isLandscape && (
  <HintButton $isLandscape={isLandscape} onClick={() => setShowHint(true)}>
    Need a hint?
  </HintButton>
)}

{/* Portrait: Below AnswerInput */}
{!showHint && hint && isPortrait && (
  <HintButton $isPortrait={isPortrait} onClick={() => setShowHint(true)}>
    Need a hint?
  </HintButton>
)}
```

#### Styled Component Pattern

```javascript
const HintButton = styled.button`
  /* Base styles (shared) */
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.3s ease-in-out; /* Smooth transitions */

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
  }

  /* LANDSCAPE: Fixed top-right */
  ${props => props.$isLandscape && css`
    position: fixed;
    top: 15px;
    right: 20px;
    z-index: 100;

    @media (max-width: 1024px) {
      top: 12px;
      right: 16px;
      padding: 6px 12px;
      font-size: 13px;
    }
  `}

  /* PORTRAIT: Static below AnswerInput */
  ${props => props.$isPortrait && css`
    position: static;
    width: 100%;
    max-width: 400px;
    margin-top: 16px;

    @media (max-width: 1024px) {
      padding: 8px 16px;
      font-size: 14px;
      margin-top: 12px;
    }
  `}
`;
```

#### Visual Comparison

**Portrait (810×1080):**
```
┌──────────────────────┐
│ Level 1              │
│ What is 5 + 3?       │
│                      │
│  [Visual Canvas]     │
│                      │
│  [Answer Input]      │
│  [Submit]            │
│  [Need a hint?]      │ ← Below input, centered
│                      │
└──────────────────────┘
```

**Landscape (1080×810):**
```
┌────────────────────────────────────────┐
│                      [Need a hint?]    │ ← Top-right, fixed
│                                        │
│  Level 1: Positive Numbers             │
│  What is 5 + 3?                        │
│  [Visual Canvas]                       │
│  [Answer Input] [Submit]               │
└────────────────────────────────────────┘
```

#### When to Apply This Pattern

✅ **Use this pattern when:**
- Lesson has optional help/hint button
- Button relates to specific input field
- Layout has sufficient vertical space in portrait
- Button is not critical to primary workflow

❌ **Don't use this pattern when:**
- Button is critical primary action (use fixed position always)
- Multiple hint buttons exist (creates layout confusion)
- Lesson already has complex orientation-specific layouts

#### Lessons Using This Pattern

- ✅ `AddingIntegersLesson.jsx` (implemented March 1, 2026)
- 🔄 Future: Can be applied to SubtractingIntegers, MultiplyingIntegers, etc.

#### Transition Behavior

- **Animation:** 300ms ease-in-out
- **Properties:** Position, width, margin-top
- **Trigger:** Orientation change detected by `useOrientation()` hook

#### Testing Requirements

- [ ] Portrait: Button appears below AnswerInput, max-width 400px
- [ ] Landscape: Button appears top-right, fixed position
- [ ] Rotation: Smooth 300ms transition between positions
- [ ] Click: Functionality unchanged in both orientations
- [ ] Responsive: Works on iPad 10.2", 11", 12.9"
- [ ] Dark mode: Proper theming in both orientations

---

## 2. Button Positioning

### General Guidelines

#### Primary Action Buttons

**Location:** Below main content (canvas/visual), centered
**Width:** Full width with max-width constraint (typically 400-600px)
**Examples:** Submit, Check Answer, Next Problem

#### Secondary Action Buttons

**Landscape:** Fixed top-right corner
**Portrait:** Below primary action or in button group
**Examples:** Hint, Help, Reset

#### Tertiary Actions

**Location:** Top-left corner (for navigation back/close)
**Examples:** Close, Back to Menu

---

## 3. Touch Interactions

### Touch Target Sizes

**Minimum Sizes (WCAG 2.1 Level AA):**
- Primary buttons: 56×56px (iPad/Desktop)
- Secondary buttons: 48×48px (Mobile)
- Tap targets on canvas: 44×44px minimum

**Implementation:**
```javascript
const Button = styled.button`
  min-height: 56px;
  min-width: 56px;
  padding: 14px 32px;

  @media (max-width: 768px) {
    min-height: 48px;
    padding: 12px 24px;
  }
`;
```

---

## 4. Future Design Choices

### Template for New Entries

When adding a new design choice, use this template:

```markdown
### Decision: [Clear Title]

**Date:** YYYY-MM-DD
**Status:** ✅ Implemented | 🚧 In Progress | 📋 Planned
**First Implementation:** `ComponentName.jsx`
**Related:** [Related systems/docs]

#### Problem Statement
[What problem does this solve?]

#### Design Decision
[What was decided and why?]

#### Implementation Pattern
[Code example]

#### Visual Comparison
[Screenshots or ASCII diagrams]

#### When to Apply This Pattern
✅ Use when...
❌ Don't use when...

#### Lessons Using This Pattern
- ✅ LessonA
- 🔄 LessonB (planned)

#### Testing Requirements
- [ ] Test case 1
- [ ] Test case 2
```

---

## 📊 Design Decision Log

| Date | Decision | Status | File Reference |
|------|----------|--------|----------------|
| 2026-03-01 | Orientation-based button positioning | ✅ Implemented | `AddingIntegersLesson.jsx` |
| TBD | [Next decision] | 📋 Planned | - |

---

## 🔗 Related Documentation

- **LESSON_STYLE_GUIDE.md** - Comprehensive iPad optimization requirements
- **ORIENTATION_SUPPORT.md** - Full orientation system documentation
- **INPUT_OVERLAY_PANEL_SYSTEM.md** - Input panel design patterns
- **BINARY_CHOICE_BUTTONS.md** - Button styling standards

---

## 🤝 Contributing

When making a design decision:

1. **Document it here** - Use the template above
2. **Update related docs** - Cross-reference in other .md files
3. **Add visual examples** - Screenshots or diagrams
4. **List affected lessons** - Track implementation status
5. **Update decision log** - Add entry to the table

---

## 📝 Notes

- This document tracks **UI/UX design patterns**, not technical implementation details
- Focus on **user-facing decisions** that affect multiple lessons
- Include **visual reasoning** - why this design works better
- Keep entries **concise but complete** - enough detail to implement without guessing

---

**Last Updated:** March 1, 2026
**Maintained By:** Development Team
**Next Review:** April 1, 2026
