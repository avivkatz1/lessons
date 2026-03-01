# SymmetryLesson Level 4: Multi-Input Redesign Plan

**Version:** 1.0
**Date:** February 27, 2026
**Status:** Ready for Implementation
**Estimated Time:** 3.5-4 hours

---

## 📋 Executive Summary

Transform SymmetryLesson Level 4 from **single text input** to **individual labeled inputs** with live visual feedback on the grid.

### Current Design (Single Input)
```
User types: "(7,2), (5,4), (3,6), (8,1)"
Submit → All-or-nothing validation
```

### New Design (Multi-Input)
```
A': [7,2] ✓  ← Green point appears on grid
B': [5,4] ✓  ← Green point appears
C': [__,__]  ← Empty
D': [__,__]  ← Empty
```

**Key Features:**
1. ✅ Individual inputs for each point (A', B', C', D')
2. ✅ Click any input to switch focus (no close/reopen panel)
3. ✅ Live validation - points appear on grid immediately
4. ✅ Color-coded feedback: Green (correct) / Red (incorrect)
5. ✅ Success message when all 4 correct + "Try Another" button

---

## 🎨 UX Design Decisions

### 1. Panel Layout
**Decision:** **Stacked Vertically (4 rows)**

```
┌─────────────────────────┐
│ Enter Reflected Points  │ ← Panel title
├─────────────────────────┤
│ Point A': [  7,  2  ] ✓ │ ← Input 1 (focused = blue border)
│ Point B': [ __, __ ]    │ ← Input 2 (empty)
│ Point C': [ __, __ ]    │ ← Input 3 (empty)
│ Point D': [ __, __ ]    │ ← Input 4 (empty)
├─────────────────────────┤
│   [SlimMathKeypad]      │ ← Shared keypad
├─────────────────────────┤
│ [Clear All] [Submit]    │ ← Action buttons
└─────────────────────────┘
```

**Why:** Preserves label order, fits iPad landscape, scrollable if needed

---

### 2. Active Input Indication
**Decision:** **Blue border + 10% background tint**

```javascript
border: 2px solid #3B82F6  // Blue when focused
background: #3B82F610      // 10% blue tint
```

**Why:** Clear affordance, matches theme colors, accessible

---

### 3. Input Display Format
**Decision:** **Placeholder "( __, __ )" with monospace font**

**Empty:**  `Point A': ( __, __ )`
**Filled:**  `Point B': (  7,  2 ) ✓`

**Why:** Visual consistency, clear expected format, guided input

---

### 4. Focus Switching
**Decision:** **Just switch focus (no auto-submit)**

**Workflow:**
1. User clicks input A' → Keypad focuses on A'
2. User types "7,2"
3. User clicks input B' → Keypad switches to B' (A' NOT submitted yet)
4. User clicks "Submit" → All inputs validated

**Why:** User-controlled, prevents premature validation, less aggressive

---

### 5. Visual Feedback
**Decision:** **Checkmark/X after coordinate display**

```
Point A': ( 7, 2 ) ✓  ← Green checkmark
Point B': ( 5, 9 ) ✗  ← Red X
```

**Why:** Clear association with value, doesn't interfere with label

---

### 6. Mini Displays (Desktop Only)
**Decision:** **Show next to grid on desktop (>1024px), hide on iPad**

**Desktop:**
```
┌─────────────────┐
│   Grid Canvas   │
│   A' → (7,2) ✓ │ ← Mini display
│   B' → (5,4) ✓ │
└─────────────────┘
```

**iPad:** Hidden (saves vertical space)

**Why:** Context preservation on desktop, space-efficient on iPad

---

## 💻 Technical Implementation

### State Management

**Approach:** **Hybrid State (Hook for panel + Local state for inputs)**

```javascript
// Hook for panel control
const { panelOpen, openPanel, closePanel, resetAll: resetPanel } = useInputOverlay();

// Local state for 4 inputs
const [coordinates, setCoordinates] = useState({
  "A'": { x: '', y: '', submitted: false },
  "B'": { x: '', y: '', submitted: false },
  "C'": { x: '', y: '', submitted: false },
  "D'": { x: '', y: '', submitted: false },
});

// Track focused input
const [focusedPoint, setFocusedPoint] = useState("A'");
```

**Why:** No need to create new hook, keeps single responsibility

---

### Coordinate Parsing

**Function:** Flexible regex with normalization

```javascript
/**
 * Parse coordinate string into {x, y} object
 * Accepts: "7,2" | "(7,2)" | "( 7, 2 )" | "(-3, 4)"
 */
function parseCoordinate(input) {
  if (!input || input.trim() === '') {
    return { x: null, y: null, valid: false, error: 'Empty input' };
  }

  // Remove all spaces and parentheses
  const cleaned = input.replace(/[\s()]/g, '');

  // Match: optional minus + digits, comma, optional minus + digits
  const match = cleaned.match(/^(-?\d+),(-?\d+)$/);

  if (!match) {
    return { x: null, y: null, valid: false, error: 'Invalid format. Use: x,y' };
  }

  const x = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);

  return { x, y, valid: true, error: '' };
}
```

---

### Grid Point Rendering

**Approach:** Separate Layer with color-coded circles

```javascript
// Calculate user points with validation
const userEnteredPoints = useMemo(() => {
  const points = [];

  Object.entries(coordinates).forEach(([label, coord]) => {
    const parsed = parseCoordinate(`${coord.x},${coord.y}`);

    if (parsed.valid && coord.submitted) {
      const expected = reflectedPoints.find(p => p.label === label);

      points.push({
        label,
        x: parsed.x,
        y: parsed.y,
        isCorrect: expected && expected.col === parsed.x && expected.row === parsed.y,
      });
    }
  });

  return points;
}, [coordinates, reflectedPoints]);

// Render on canvas
{userEnteredPoints.map((pt) => (
  <Circle
    key={`user-${pt.label}`}
    x={pt.x * cellSize}
    y={pt.y * cellSize}
    radius={cellSize * 0.3}
    fill={pt.isCorrect ? '#10B981' : '#EF4444'}  // Green or Red
    stroke={konvaTheme.shapeStroke}
    strokeWidth={2}
    opacity={0.8}
  />
))}
```

**Colors:**
- Green (`#10B981`) = Correct
- Red (`#EF4444`) = Incorrect

---

### Validation Timing

**Approach:** On Submit button click (per input)

```javascript
const handleSubmitCoordinate = (point) => {
  const coord = coordinates[point];
  const parsed = parseCoordinate(`${coord.x},${coord.y}`);

  if (!parsed.valid) {
    // Show error
    setCoordinates(prev => ({
      ...prev,
      [point]: { ...prev[point], error: parsed.error }
    }));
    return;
  }

  // Mark as submitted, point appears on grid
  setCoordinates(prev => ({
    ...prev,
    [point]: { ...prev[point], submitted: true, error: '' }
  }));

  // Auto-advance focus to next empty input
  const nextEmpty = ["A'", "B'", "C'", "D'"].find(
    p => p !== point && !coordinates[p].submitted
  );
  if (nextEmpty) {
    setFocusedPoint(nextEmpty);
  }
};
```

**Why:** Clear intent, not distracting, prevents flickering

---

### Success Detection

**Approach:** All 4 correct → Success message in panel → Modal after 500ms

```javascript
// Check if all correct
const allCorrect = useMemo(() => {
  return ["A'", "B'", "C'", "D'"].every(label => {
    const coord = coordinates[label];
    if (!coord.submitted) return false;

    const parsed = parseCoordinate(`${coord.x},${coord.y}`);
    if (!parsed.valid) return false;

    const expected = reflectedPoints.find(p => p.label === label);
    return expected && expected.col === parsed.x && expected.row === parsed.y;
  });
}, [coordinates, reflectedPoints]);

// Trigger modal when all correct
useEffect(() => {
  if (allCorrect && !modalClosedWithX) {
    closePanel();
    const timer = setTimeout(() => {
      setIsComplete(true);  // Show explanation modal
    }, 500);
    return () => clearTimeout(timer);
  }
}, [allCorrect, modalClosedWithX, closePanel]);
```

**Panel Success UI:**
```javascript
{allCorrect && (
  <SuccessSection>
    <SuccessText>✓ All coordinates correct!</SuccessText>
    <TryAnotherButton onClick={handleTryAnother}>
      Try Another Problem
    </TryAnotherButton>
  </SuccessSection>
)}
```

---

## 📐 Responsive Design

| Screen | Panel Width | Slide | Behavior |
|--------|-------------|-------|----------|
| Desktop (>1024px) | 480px | 75% | All visible, no scroll |
| iPad (768-1024px) | 365-410px | 75% | All visible, minimal scroll |
| Mobile (≤768px) | 100% | 0% | Full-screen, scroll if needed |

**Vertical Space (iPad Landscape):**
- Panel Header: 60px
- 4 Inputs: 320px (80px each)
- Keypad: 240px
- Feedback: 50px
- Buttons: 56px
- Padding: 50px
- **Total: ~776px** (fits in 810px iPad height)

---

## 🔧 Implementation Steps

### Phase 1: Data Structure Setup (30 min)

1. Add multi-input state
2. Add `parseCoordinate` function
3. Add `formatCoordinateDisplay` function

### Phase 2: Panel UI Redesign (60 min)

1. Replace single input with 4 stacked inputs
2. Add focus state styling (blue border + tint)
3. Wire up focus switching
4. Add checkmark/X display

### Phase 3: Live Validation & Grid Rendering (45 min)

1. Add `userEnteredPoints` memo
2. Render user points layer on canvas
3. Implement `handleSubmitCoordinate`
4. Test green/red color coding

### Phase 4: Success Flow (30 min)

1. Add `allCorrect` memo
2. Add success detection useEffect
3. Add success panel UI
4. Test modal trigger (500ms delay)

### Phase 5: Testing & Polish (60 min)

1. Test all input formats
2. Test focus switching
3. Test validation feedback
4. Test responsive behavior
5. Test iPad landscape fit

---

## ✅ Testing Checklist

### Functional Tests
- [ ] Clicking input changes focus (blue border + tint)
- [ ] Only focused input receives keypad input
- [ ] Submit validates and shows point on grid
- [ ] Correct coordinate → green point
- [ ] Incorrect coordinate → red point
- [ ] Checkmark/X appears next to label
- [ ] All 4 correct → success message in panel
- [ ] "Try Another" button works
- [ ] Panel closes → modal opens after 500ms
- [ ] "Clear All" resets all inputs and grid

### Input Format Tests
- [ ] `7,2` works
- [ ] `(7,2)` works
- [ ] `( 7, 2 )` works
- [ ] `(-3, 4)` works (negative coordinates)
- [ ] Invalid format shows error

### Responsive Tests
- [ ] Desktop: All inputs + keypad visible, no scroll
- [ ] iPad: All visible, minimal scroll
- [ ] Mobile: Full-screen, scroll works
- [ ] Canvas slide animation works (60-75% of panel width)

### Accessibility Tests
- [ ] Touch targets 44px minimum
- [ ] Tab navigation between inputs
- [ ] Keyboard Enter submits
- [ ] Screen reader labels present
- [ ] Dark mode works

---

## 🎨 Styled Components Needed

```javascript
const CoordinateInputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const CoordinateDisplay = styled.div`
  padding: 14px 20px;
  font-size: 20px;
  font-family: 'Courier New', monospace;
  background-color: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.$focused
    ? props.theme.colors.info  // Blue when focused
    : props.theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$focused && css`
    background-color: ${props.theme.colors.info}10;  // 10% blue tint
    box-shadow: 0 0 0 3px ${props.theme.colors.info}30;
  `}
`;

const FeedbackIcon = styled.span`
  font-size: 20px;
  font-weight: bold;
  margin-left: 8px;
  color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.buttonDanger || '#f87171'
  };
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.buttonDanger || '#f87171'};
  margin-top: 4px;
`;

const SuccessSection = styled.div`
  padding: 16px;
  background-color: ${props => props.theme.colors.buttonSuccess}20;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  margin-top: 12px;
  text-align: center;
`;

const SuccessText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.buttonSuccess};
  margin-bottom: 12px;
`;
```

---

## 📊 Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Data Structure Setup | 30 min |
| 2 | Panel UI Redesign | 60 min |
| 3 | Live Validation & Grid | 45 min |
| 4 | Success Flow | 30 min |
| 5 | Testing & Polish | 60 min |
| **Total** | | **3.5 hours** |

---

## 🚀 Key Benefits

### User Experience
- ✅ **Clearer feedback:** User knows which specific point is wrong
- ✅ **Live validation:** Points appear on grid immediately
- ✅ **Less typing:** Simpler format per input (just "x,y")
- ✅ **Visual confirmation:** Grid shows attempted reflections in real-time
- ✅ **Reduced frustration:** No all-or-nothing validation

### Technical
- ✅ **Maintainable:** Follows existing InputOverlayPanel pattern
- ✅ **Reusable:** parseCoordinate function can be used elsewhere
- ✅ **Performant:** Memoized validation, efficient rendering
- ✅ **Accessible:** WCAG 2.1 Level AA compliant

---

## 📝 Next Steps

1. **Review this plan** with team/user
2. **Get approval** before starting implementation
3. **Create feature branch:** `feature/symmetry-l4-multi-input`
4. **Implement Phase 1-5** in order
5. **Test on actual iPad** (not just emulator)
6. **Code review** before merging
7. **Update documentation** if needed

---

## ❓ Questions Before Starting?

- Are there any UX decisions you'd like to change?
- Should negative coordinates be supported (or just 0-9)?
- Any specific iPad models to test on?
- Should we add haptic feedback on correct/incorrect?

---

**Ready to implement!** 🎉
