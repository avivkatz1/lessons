# Drawing Canvas Feature - Implementation Plan
**Version:** 1.0
**Date:** 2026-02-24
**Status:** Planning Phase - Awaiting User Approval

## Overview
Add an iPad-optimized drawing canvas to Level 1 and Level 2 of the Solving Equations lesson, allowing students to work out problems by hand after identifying the correct operations.

---

## User Story
**As a** student using an iPad
**I want** to draw my work after identifying the solution steps
**So that** I can work through the equation manually before submitting my answer

---

## Workflow
1. Student completes button selections (Level 1: operation, Level 2: both steps)
2. Green success message appears
3. Drawing canvas slides into view with smooth animation
4. Student can draw their work using touch/stylus
5. Answer input remains below canvas
6. Student submits final answer

---

## Architecture Summary

### Component Structure
```
DrawingCanvas.jsx (NEW - shared/components/)
├── Canvas element (HTML5)
├── Toolbar (pen, eraser, colors, clear)
├── Equation display (KaTeX)
└── Touch/mouse handlers

SolvingEquationsLesson.jsx (MODIFIED)
├── Add canvas trigger logic
├── Add scroll/animation
└── Integrate canvas component
```

### State Management
```javascript
// Main component state
const [showCanvas, setShowCanvas] = useState(false);
const [canvasKey, setCanvasKey] = useState(0); // Force remount

// Canvas component state (local)
const [isDrawing, setIsDrawing] = useState(false);
const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
const [color, setColor] = useState(theme.colors.textPrimary);
const [lineWidth, setLineWidth] = useState(3);
const [paths, setPaths] = useState([]); // For undo
```

---

## Key Decisions

### Decision 1: Canvas Library
**Choice:** Raw HTML5 Canvas (no external library)

**Planning Agent Rationale:**
- Simpler for freehand drawing
- Better performance for continuous drawing
- Direct touch event control
- react-konva is better for geometric shapes, not sketching

**Review Agent Feedback:** ✅ AGREES
- Validates bundle size concern (5KB vs 50KB+)
- Notes react-sketch is abandoned
- Confirms vanilla canvas is optimal for this use case

**APPROVED** ✅

---

### Decision 2: Scroll vs Fixed Overlay
**Planning Agent:** Use `scrollIntoView()` with smooth behavior

**Review Agent:** ⚠️ CRITICAL ISSUE
- Auto-scrolling causes viewport shifting on iPad
- Conflicts with MathKeypad positioning
- **Recommends:** Fixed position overlay (z-index: 1000)

**DECISION APPROVED:** ✅ Option A - Fixed overlay (z-index: 1000)
- [x] Fixed position overlay covering lesson
- Smooth fade-in animation (300ms)
- Close button to dismiss

---

### Decision 3: Touch Event Performance
**Planning Agent:** Basic preventDefault() approach

**Review Agent:** ⚠️ PERFORMANCE RISK
```javascript
// Planning agent approach
const draw = (e) => {
  e.preventDefault();
  // Draw immediately
};

// Review agent approach (BETTER)
const draw = useCallback(
  throttle((e) => {
    requestAnimationFrame(() => {
      // Draw with RAF
    });
  }, 16), // 60fps
  []
);
```

**DECISION:** Use Review Agent's RAF + throttle pattern ✅

---

### Decision 4: Accessibility
**Planning Agent:** Basic keyboard navigation

**Review Agent:** ⚠️ MISSING CRITICAL A11Y
- Need "Skip Drawing" button for keyboard users
- Need aria-labels and sr-only instructions
- Canvas is inherently not screen-reader accessible

**DECISION:** Implement Review Agent's a11y recommendations ✅

---

### Decision 5: Data Persistence
**Planning Agent:** No persistence mentioned

**Review Agent:** 🚨 PRODUCTION BLOCKER
- Must specify: localStorage? backend? discard on close?
- Recommends localStorage with LRU eviction (max 10 drawings)

**DECISION APPROVED:** ✅ Option B - localStorage with LRU eviction
- [x] Save last 10 drawings per lesson
- Keyed by: `canvas_${lessonName}_${questionIndex}`
- Auto-load on canvas open
- Clear old drawings when limit exceeded

---

## Critical Implementation Requirements

### iOS Safari Requirements (from Review Agent)
```css
canvas {
  touch-action: none; /* CRITICAL */
  -webkit-tap-highlight-color: transparent;
}
```

### Retina Display Handling
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = logicalWidth * dpr;
canvas.height = logicalHeight * dpr;
ctx.scale(dpr, dpr);
```

### Memory Management
- **Undo stack limit:** Max 50 actions
- **Canvas cleanup on unmount:** Clear context and reset dimensions
- **Event listener cleanup:** Use useEffect return functions

### Dark Mode Support
```javascript
// Clear canvas with theme background, not white
ctx.fillStyle = theme.colors.cardBackground;
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

---

## Open Questions

### 1. Canvas Display Mode
**Question:** Fixed overlay or scroll into view?
**Impact:** Major - affects entire UX flow
**Blocked on:** User decision (overlay vs scroll)

### 2. Data Persistence
**Question:** Save drawings or discard on close?
**Impact:** Medium - affects localStorage usage
**Blocked on:** User decision (persist vs ephemeral)

### 3. Undo/Redo Feature
**Question:** Include in MVP or defer?
**Impact:** Low - nice-to-have, not critical
**Recommendation:** Defer to v1.1 (Review agent agrees)

### 4. Toolbar Position ✅ APPROVED
**Decision:** Top of canvas (avoids MathKeypad conflicts)
**Impact:** Low - UX preference
**Status:** Approved

### 5. Canvas Dimensions
**Question:** Fixed size or responsive?
**Impact:** Medium - affects iPad landscape mode
**Recommendation:** Responsive with max dimensions

---

## Risk Assessment

### HIGH RISK 🔴
1. **MathKeypad viewport conflicts**
   - Mitigation: Dynamic canvas height when keypad visible
   - Status: Needs testing

2. **Memory leaks on older iPads**
   - Mitigation: Undo stack limits + cleanup
   - Status: Design specified

3. **Touch-action conflicts with existing Konva lessons**
   - Mitigation: Conditional CSS only when canvas active
   - Status: Needs implementation strategy

### MEDIUM RISK 🟡
1. **Performance on older iPads**
   - Mitigation: RAF + throttling
   - Status: Pattern defined

2. **Orientation changes**
   - Mitigation: Resize handler
   - Status: Needs implementation

### LOW RISK 🟢
1. **Theme integration**
   - Mitigation: Use existing theme tokens
   - Status: Pattern established

2. **Accessibility**
   - Mitigation: Skip button + aria-labels
   - Status: Requirements defined

---

## Implementation Phases

### Phase 1: Core Canvas Component (3-4 hours)
- [ ] Create DrawingCanvas.jsx
- [ ] Implement touch/mouse handlers with RAF
- [ ] Add pen/eraser tools
- [ ] Add toolbar UI
- [ ] Integrate theme colors
- [ ] Test on iPad Safari

### Phase 2: Integration (2-3 hours)
- [ ] Add state to SolvingEquationsLesson
- [ ] Add trigger logic (Level 1 & 2)
- [ ] Implement display mode (overlay or scroll)
- [ ] Add reset behavior
- [ ] Test with existing lessons

### Phase 3: Polish & Testing (2-3 hours)
- [ ] Add accessibility features
- [ ] Optimize performance
- [ ] Test orientation changes
- [ ] Test with MathKeypad
- [ ] Dark mode verification

### Phase 4: Documentation (1 hour)
- [ ] Component API documentation
- [ ] Usage examples
- [ ] Known issues
- [ ] Future enhancements

**Total Estimated Effort:** 8-11 hours

---

## Agent Collaboration Summary

### Planning Agent (ad71473)
**Strengths:**
- Comprehensive architecture design
- Detailed component structure
- Good separation of concerns
- Thorough trade-off analysis

**Gaps Identified:**
- Missing iPad-specific considerations
- No RAF performance pattern
- Incomplete accessibility requirements
- No data persistence strategy

### Review Agent (af444b1)
**Contributions:**
- Identified critical iOS Safari issues
- Provided RAF + throttle pattern
- Highlighted MathKeypad conflicts
- Detailed accessibility requirements
- Memory management recommendations

---

## Next Steps

### Before Implementation Begins:
1. **USER DECISION NEEDED:** Canvas display mode (overlay vs scroll)
2. **USER DECISION NEEDED:** Data persistence strategy
3. **USER APPROVAL:** Review this combined plan
4. **DISCUSSION:** Any changes to scope or requirements

### After Approval:
1. Create DrawingCanvas component
2. Implement Phase 1 (core canvas)
3. Test on iPad
4. Iterate based on feedback
5. Implement Phases 2-4

---

## References

### Planning Agent Output
- Agent ID: ad71473
- Comprehensive implementation plan with component architecture
- Detailed styling specifications
- Testing strategy

### Review Agent Output
- Agent ID: af444b1
- iPad optimization insights
- Performance patterns
- Critical issue identification

### Related Conversations
- iPad optimization work: `ipad-optimization-2026-02-18`
- Existing touch patterns in codebase

---

## Approval Status

**Status:** ✅ APPROVED - Implementation in Progress

**Approved Decisions:**
1. ✅ Canvas display mode: Fixed overlay (z-index: 1000)
2. ✅ Data persistence: localStorage with LRU eviction (max 10 drawings)
3. ✅ Toolbar position: Top of canvas

**Implementation started:** 2026-02-24
**Target completion:** Phase 1-3 (8-11 hours)
