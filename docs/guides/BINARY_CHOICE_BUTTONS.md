# Binary Choice Button Pattern - Quick Reference

**Version:** 1.0
**Last Updated:** February 28, 2026
**Status:** MANDATORY for all binary/multiple choice questions

---

## 🚨 MANDATORY PATTERN

**This is the ONLY acceptable button style for binary and multiple choice questions.**

---

## Reference Implementation

**Canonical Example:** `ShapesLesson.jsx` Lines 876-918
- `YesButton` (green)
- `NoButton` (red)

**Other Examples:**
- `GraphingLinesLesson.jsx` → `ChoiceButton`
- `SidesAndAnglesLesson.jsx` Level 1

---

## Complete Button Code

```javascript
import styled, { keyframes } from "styled-components";

// Shake animation for wrong answers
const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

// Binary choice button (2-4 options)
const ChoiceButton = styled.button`
  flex: 1;
  min-width: 140px;
  min-height: 56px;
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;                          // Bold
  border-radius: 10px;
  border: 3px solid ${props => props.$borderColor};
  background-color: transparent;             // ← CRITICAL: Must be transparent
  color: ${props => props.$borderColor};     // ← Text matches border
  cursor: pointer;
  transition: all 0.2s;
  animation: ${props => props.$shake ? shakeAnim : 'none'} 0.6s;

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

  @media (max-width: 480px) {
    min-width: 80px;
    padding: 10px 16px;
    font-size: 15px;
  }
`;

// Button row container
const ChoiceButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 800px;

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;
```

---

## Usage Example

```javascript
// In your lesson component
function MyLesson() {
  const [phase, setPhase] = useState("interact");
  const [shakingIdx, setShakingIdx] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleChoiceClick = (choice, index, correctChoice) => {
    if (phase !== "interact" || shakingIdx !== null) return;

    if (choice === correctChoice) {
      setSelectedChoice(index);
      setTimeout(() => {
        setPhase("complete");
        setShowModal(true);
        revealAnswer();
      }, 800);  // 800ms celebration delay
    } else {
      setShakingIdx(index);
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setShakingIdx(null), 600);  // 600ms shake
    }
  };

  return (
    <Wrapper>
      {/* Binary choice buttons */}
      <ChoiceButtonRow>
        <ChoiceButton
          onClick={() => handleChoiceClick("positive", 0, correctAnswer)}
          disabled={phase === "complete"}
          $shake={shakingIdx === 0}
          $borderColor="#10B981"  // Green
        >
          Positive
        </ChoiceButton>
        <ChoiceButton
          onClick={() => handleChoiceClick("negative", 1, correctAnswer)}
          disabled={phase === "complete"}
          $shake={shakingIdx === 1}
          $borderColor="#EF4444"  // Red
        >
          Negative
        </ChoiceButton>
        <ChoiceButton
          onClick={() => handleChoiceClick("zero", 2, correctAnswer)}
          disabled={phase === "complete"}
          $shake={shakingIdx === 2}
          $borderColor="#6B7280"  // Gray
        >
          Zero
        </ChoiceButton>
      </ChoiceButtonRow>

      {/* Modal for explanation (iPad optimized) */}
      {showModal && (
        <ExplanationModal
          explanation={explanation}
          onClose={() => setShowModal(false)}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
}
```

---

## Standard Colors

| Choice Type | Color | Hex Code | Border Color |
|-------------|-------|----------|--------------|
| **Positive / Yes** | Green | `#10B981` | Green |
| **Negative / No** | Red | `#EF4444` | Red |
| **Zero / Neutral** | Gray | `#6B7280` | Gray |
| **Undefined / Special** | Purple | `#8B5CF6` | Purple |
| **Alternative** | Blue | `#3B82F6` | Blue |
| **Warning** | Orange | `#F59E0B` | Orange |

---

## Visual States

### Default State
```
┌─────────────────┐
│   Positive      │  ← Transparent background
└─────────────────┘  ← Green border (3px solid #10B981)
                     ← Green text (#10B981)
```

### Hover State
```
┌─────────────────┐
│   Positive      │  ← GREEN FILLED background (#10B981)
└─────────────────┘  ← Green border (3px solid)
                     ← WHITE text
```

### Disabled State
```
┌─────────────────┐
│   Positive      │  ← 50% opacity
└─────────────────┘  ← Grayed out, not clickable
```

### Shake Animation (Wrong Answer)
```
┌─────────────────┐
│   Positive      │  ← Shakes left-right (600ms)
└─────────────────┘  ← -10px → +10px → -10px → +10px
```

---

## Animation Timing

| Event | Duration | Description |
|-------|----------|-------------|
| **Correct answer delay** | 800ms | Wait before showing modal |
| **Wrong answer shake** | 600ms | Shake animation duration |
| **Hover transition** | 200ms | Background fill transition |
| **Active press** | Instant | Scale to 98% on press |

---

## Common Mistakes

### ❌ WRONG - Filled Background

```javascript
const ChoiceButton = styled.button`
  background-color: #10B981;  // ❌ WRONG - should be transparent
  color: white;
  border: 3px solid #10B981;
`;
```

### ❌ WRONG - No Hover Effect

```javascript
const ChoiceButton = styled.button`
  background-color: transparent;
  border: 3px solid #10B981;
  // ❌ MISSING: &:hover state
`;
```

### ❌ WRONG - Incorrect Border Width

```javascript
const ChoiceButton = styled.button`
  border: 2px solid #10B981;  // ❌ WRONG - should be 3px
`;
```

### ✅ CORRECT - Follow the Pattern

```javascript
const ChoiceButton = styled.button`
  background-color: transparent;              // ✅ Transparent
  border: 3px solid ${props => props.$borderColor};  // ✅ 3px
  color: ${props => props.$borderColor};      // ✅ Matches border
  font-weight: 700;                           // ✅ Bold

  &:hover:not(:disabled) {
    background-color: ${props => props.$borderColor};  // ✅ Fill
    color: white;                                       // ✅ White text
  }
`;
```

---

## Integration with ExplanationModal

**IMPORTANT:** Use ExplanationModal for iPad optimization (no scrolling).

```javascript
// After correct answer (800ms delay)
setTimeout(() => {
  setPhase("complete");
  setShowModal(true);  // Show modal overlay
  revealAnswer();
}, 800);

// Render modal
{showModal && (
  <ExplanationModal
    explanation={explanation}
    onClose={() => setShowModal(false)}
    onTryAnother={handleTryAnother}
  />
)}
```

**Why Modal?**
- ✅ No scrolling needed on iPad
- ✅ Centered overlay with backdrop blur
- ✅ Saves vertical space (150-200px)
- ✅ Clear visual hierarchy

---

## Checklist

Before committing binary choice buttons, verify:

- [ ] Background is `transparent` initially
- [ ] Border is `3px solid` with choice color
- [ ] Text color matches border color
- [ ] Hover fills background and inverts text to white
- [ ] Font weight is `700` (bold)
- [ ] Border radius is `10px`
- [ ] 800ms delay before showing modal on correct answer
- [ ] 600ms shake animation on wrong answer
- [ ] Disabled state has 50% opacity
- [ ] Responsive sizing (56px → 48px on mobile)
- [ ] Uses ExplanationModal (not inline explanation)

---

## When to Use This Pattern

✅ **USE for:**
- Binary choice questions (Yes/No)
- Multiple choice with 2-4 options
- Classification questions (Positive/Negative/Zero)
- Sign identification (slope sign, y-intercept sign)
- Type selection (shape types, angle types)

❌ **DON'T USE for:**
- Text input fields
- Numerical keypads
- Canvas interactions
- Drag-and-drop
- More than 4 options (use radio buttons or dropdown)

---

## Summary

**The Golden Rule:**
> If you're creating binary or multiple choice buttons (2-4 options), copy the exact pattern from ShapesLesson.jsx. Transparent background, colored border, hover fills. No exceptions.

**Quick Copy-Paste:**
1. Copy `ChoiceButton` styled component from ShapesLesson.jsx
2. Copy `shakeAnim` keyframes
3. Copy `handleChoiceClick` handler pattern
4. Use ExplanationModal for success (not inline explanation)
5. Use standard colors (green/red/gray/purple)

**Reference Files:**
- `ShapesLesson.jsx` (lines 876-918)
- `GraphingLinesLesson.jsx`
- LESSON_STYLE_GUIDE.md section "Binary Choice Button Pattern"

---

**Last Updated:** February 28, 2026
**Author:** Claude Code (with user requirements)
**Status:** Production Standard - DO NOT DEVIATE
