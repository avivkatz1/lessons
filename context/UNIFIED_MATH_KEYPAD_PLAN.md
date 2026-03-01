# Unified Math Keypad - Implementation Plan

**Status:** Planning Phase
**Created:** 2026-02-28
**Approach:** Option A - Breaking change, migrate all 24 lessons at once
**Timeline:** Single PR, comprehensive testing before merge

---

## 🎯 Project Goals

1. **Consolidate** 3 separate math keypad implementations into 1 unified component
2. **Reduce code duplication** (~800 lines → ~400 lines)
3. **Improve maintainability** (1 component to update vs 3)
4. **Enable extensibility** (screen prop for future patterns)
5. **Maintain feature parity** (all existing functionality preserved)

---

## 📊 Current State Analysis

### Existing Components

| Component | Lines | Location | Users | Features |
|-----------|-------|----------|-------|----------|
| **MathKeypad** | ~388 | `shared/components/MathKeypad.js` | 6 lessons | Bottom-sheet, fraction mode, coordinates, 4 cols |
| **SlimMathKeypad** | ~283 | `shared/components/SlimMathKeypad.js` | 8+ lessons | Inline, extraButtons, keepOpen, random, 3 cols |
| **FractionKeypad** | ~300 | `algebra/components/FractionKeypad.js` | 1 lesson | Inline, validation, submit button, 3 cols |
| **TOTAL** | **~971** | 3 files | 24+ lessons | Overlapping features |

### Lessons to Migrate (24 files)

**MathKeypad users (6):**
- `GraphingLinesLesson.jsx`
- `PlottingPoints.jsx`
- `SymmetryLesson.jsx`
- `SymmetryIdentify.jsx`
- `RotationLesson.jsx`
- `SubtractingIntegersLesson.jsx`

**SlimMathKeypad users (17):**
- `GraphingLinesLesson.jsx` (also uses for L3-5 panels)
- `SolvingEquationsLesson.jsx`
- `PatternsLesson.jsx`
- `Level3CalculateRectangle.jsx`
- `Level4RightTriangle.jsx`
- `Level5AnyTriangle.jsx`
- `Level6TrapezoidDecomposition.jsx`
- `Level7MixedShapes.jsx`
- `useInputOverlay.js` (algebra/hooks)
- `useInputOverlay.js` (geometry/hooks)
- Plus 7 more files from grep results

**FractionKeypad users (1):**
- `AddingFractions.jsx`

---

## 🏗️ UnifiedMathKeypad Component Specification

### Component API

```javascript
<UnifiedMathKeypad
  // ===== CORE FUNCTIONALITY =====
  value=""                      // Current input value
  onChange={(val) => {}}        // Value change callback
  onSubmit={() => {}}           // Submit callback (optional)

  // ===== LAYOUT & DISPLAY =====
  layout="inline"               // "inline" | "bottom-sheet" (Phase 1: all "inline")
  columns={3}                   // 3 | 4 (auto-set by buttonSet)
  visible={true}                // For bottom-sheet mode (future)
  onClose={() => {}}            // For bottom-sheet mode (future)

  // ===== SCREEN COMPONENT =====
  screen={null}                 // Custom screen component (replaces default display)
  // Built-in screens:
  // - null = default display (shows value)
  // - <TwoFieldScreen /> = GraphingLines L3 pattern (rise/run with divider)
  // - <FractionScreen /> = stacked fraction display (numerator/denominator)
  // Future: custom screens can be passed in

  hideDisplay={false}           // Hide default display area (when using custom screen)

  // ===== BUTTON CONFIGURATION =====
  buttonSet="basic"             // "basic" | "full" | "fraction"
  extraButtons={[]}             // APPEND additional buttons (e.g., ["/", "x", "y", "="])
  includeRandom={false}         // Add random number button (for geometry lessons)

  // ===== FRACTION MODE =====
  fractionMode={false}          // Enable fraction mode (built-in FractionDisplay)
  activeField="numerator"       // "numerator" | "denominator" (for fraction mode)
  onFieldSwitch={(field) => {}} // Callback when switching fraction fields

  // ===== VALIDATION & SUBMIT =====
  enableSubmit={false}          // Show submit button in keypad
  submitLabel="Submit"          // Custom submit button text
  submitDisabled={false}        // External disable condition

  // ===== KEEP OPEN FEATURE =====
  showKeepOpen={false}          // Show "keep this open" checkbox
  keepOpen={false}
  onKeepOpenChange={(checked) => {}}

  // ===== STYLING =====
  minHeight={48}                // Minimum button height (iPad: 48-56px)
  spacing={8}                   // Gap between buttons
/>
```

### Button Set Presets

```javascript
const BUTTON_SETS = {
  basic: {
    // 3 columns, 5 rows (current SlimMathKeypad layout)
    columns: 3,
    layout: [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['0', '.', '⌫'],
      ['C', '-', null]  // null = placeholder for extraButtons or random
    ]
  },

  full: {
    // 4 columns, 5 rows (current MathKeypad layout)
    columns: 4,
    layout: [
      ['7', '8', '9', '⌫'],
      ['4', '5', '6', 'C'],
      ['1', '2', '3', '-'],
      ['0', '.', ',', 'Space'],
      ['(', ')', '⬜/⬜', null]  // Fraction toggle button
    ]
  },

  fraction: {
    // 3 columns, 5 rows (current FractionKeypad layout)
    columns: 3,
    layout: [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['0', '/', '⌫'],
      ['C', { type: 'submit', span: 2 }]  // Submit spans 2 columns
    ]
  }
};
```

### Screen Component Interface

```javascript
// Custom screen components receive these props:
interface ScreenProps {
  value: string;           // Current input value
  onChange: (val) => void; // Update value
  activeField?: string;    // For multi-field screens
  onFieldSwitch?: (field) => void;
  // Screen-specific props passed through
}

// Example: TwoFieldScreen (for GraphingLines L3)
<TwoFieldScreen
  fields={[
    { name: 'rise', label: 'Rise:', value: riseInput },
    { name: 'run', label: 'Run:', value: runInput }
  ]}
  activeField="rise"
  onFieldSwitch={(field) => setActiveField(field)}
  dividerColor="#EF4444"  // Red fraction bar
/>
```

### extraButtons Behavior

When `extraButtons` is provided, they **append** to the button set:

```javascript
// Example 1: Basic + slash for fractions
<UnifiedMathKeypad
  buttonSet="basic"
  extraButtons={['/']}
/>
// Result: Adds 6th row: [ / ]

// Example 2: Basic + algebra symbols (GraphingLines L5)
<UnifiedMathKeypad
  buttonSet="basic"
  extraButtons={['/', 'x', 'y', '=']}
/>
// Result: Adds 6th row: [ / ] [ x ] [ y ] [ = ]

// Example 3: Basic + random (geometry lessons)
<UnifiedMathKeypad
  buttonSet="basic"
  includeRandom={true}
/>
// Result: Replaces null in row 5 with "Random" button
```

---

## 🤖 Bot Role Assignments

### 1️⃣ **Product Manager**

**Responsibilities:**
- Own overall project timeline and coordination
- Track migration progress across all 24 lessons
- Ensure no regressions in user experience
- Sign off on final implementation

**Tasks:**
1. Review this plan and approve scope
2. Identify high-traffic lessons (prioritize testing)
3. Create testing matrix (all lessons × all levels)
4. Coordinate bot handoffs
5. Final QA approval before merge

**Deliverables:**
- Testing matrix spreadsheet
- Migration checklist
- Risk assessment

---

### 2️⃣ **Architect**

**Responsibilities:**
- Design UnifiedMathKeypad component API
- Review technical approach for scalability
- Ensure separation of concerns (screen components)
- Approve file structure and exports

**Tasks:**
1. Review and refine component specification above
2. Design screen component interface
3. Plan for future extensibility (bottom-sheet mode, new screens)
4. Review React Specialist's implementation for architecture quality
5. Document architectural decisions

**Deliverables:**
- Approved component API specification
- Screen component interface design
- Architecture review sign-off

**Reference:**
- MASTER_BOT_CONVERSATIONS.md → Architect section
- Pattern: Backend generates, frontend renders (separation of concerns)

---

### 3️⃣ **React Specialist**

**Responsibilities:**
- Implement UnifiedMathKeypad component
- Build default screen components (TwoFieldScreen, FractionScreen)
- Ensure React best practices (hooks, memoization, performance)
- Handle all edge cases and interactions

**Tasks:**
1. Create `src/shared/components/UnifiedMathKeypad.js`
2. Implement button set presets (basic, full, fraction)
3. Build default display area
4. Build screen component system:
   - TwoFieldScreen (for GraphingLines L3)
   - FractionScreen (for fraction mode with stacked display)
5. Implement all handler functions:
   - handleDigit, handleDecimal, handleBackspace, handleClear
   - handleMinus, handleRandom, handleFraction, handleCharacter
6. Implement fraction mode logic (from current MathKeypad)
7. Add "keep this open" checkbox feature
8. Style all components (responsive, iPad-optimized)
9. Export from `src/shared/components/index.js`

**Deliverables:**
- `UnifiedMathKeypad.js` (~400-500 lines)
- `screens/TwoFieldScreen.js`
- `screens/FractionScreen.js`
- Updated `index.js` exports

**Reference:**
- MASTER_BOT_CONVERSATIONS.md → React Specialist section
- Current files: MathKeypad.js, SlimMathKeypad.js, FractionKeypad.js

---

### 4️⃣ **Engineer**

**Responsibilities:**
- Migrate all 24 lesson files to use UnifiedMathKeypad
- Delete old keypad components
- Ensure no regressions in functionality
- Update all imports and props

**Tasks:**

**Phase 1: Update Imports (all 24 files)**
```javascript
// BEFORE
import { MathKeypad, SlimMathKeypad } from "../../../../shared/components";
import FractionKeypad from "../algebra/components/FractionKeypad";

// AFTER
import { UnifiedMathKeypad } from "../../../../shared/components";
```

**Phase 2: Migrate MathKeypad users (6 files)**
```javascript
// Example: SymmetryLesson.jsx
// BEFORE
<MathKeypad
  value={value}
  onChange={onChange}
  onSubmit={onSubmit}
  visible={visible}
  onClose={closeKeypad}
/>

// AFTER
<UnifiedMathKeypad
  value={value}
  onChange={onChange}
  onSubmit={onSubmit}
  layout="inline"
  buttonSet="full"
  // Note: Remove visible/onClose (bottom-sheet mode deferred to Phase 2)
/>
```

**Phase 3: Migrate SlimMathKeypad users (17 files)**
```javascript
// Example: Level3CalculateRectangle.jsx
// BEFORE
<SlimMathKeypad
  value={inputValue}
  onChange={setInputValue}
  keepOpen={keepOpen}
  onKeepOpenChange={setKeepOpen}
/>

// AFTER
<UnifiedMathKeypad
  value={inputValue}
  onChange={setInputValue}
  layout="inline"
  buttonSet="basic"
  showKeepOpen={true}
  keepOpen={keepOpen}
  onKeepOpenChange={setKeepOpen}
/>
```

**Phase 4: Migrate GraphingLines L3 (TwoFieldScreen pattern)**
```javascript
// BEFORE
<SlimMathKeypad
  value={activeField === "rise" ? riseInput : runInput}
  onChange={(val) => { /* ... */ }}
  hideDisplay={true}
/>

// AFTER
<UnifiedMathKeypad
  value={activeField === "rise" ? riseInput : runInput}
  onChange={(val) => { /* ... */ }}
  layout="inline"
  buttonSet="basic"
  screen={
    <TwoFieldScreen
      fields={[
        { name: 'rise', label: 'Rise:', value: riseInput },
        { name: 'run', label: 'Run:', value: runInput }
      ]}
      activeField={activeField}
      onFieldSwitch={setActiveField}
      dividerColor="#EF4444"
    />
  }
/>
```

**Phase 5: Migrate FractionKeypad (AddingFractions.jsx)**
```javascript
// BEFORE
<FractionKeypad
  value={value}
  onChange={onChange}
  onSubmit={onSubmit}
  keepOpen={keepOpen}
  onKeepOpenChange={setKeepOpen}
/>

// AFTER
<UnifiedMathKeypad
  value={value}
  onChange={onChange}
  onSubmit={onSubmit}
  layout="inline"
  buttonSet="fraction"
  enableSubmit={true}
  showKeepOpen={true}
  keepOpen={keepOpen}
  onKeepOpenChange={setKeepOpen}
/>
```

**Phase 6: Delete Old Components**
1. Delete `src/shared/components/MathKeypad.js`
2. Delete `src/shared/components/SlimMathKeypad.js`
3. Delete `src/features/lessons/lessonTypes/algebra/components/FractionKeypad.js`
4. Update `src/shared/components/index.js` (remove old exports)

**Deliverables:**
- 24 migrated lesson files
- 3 deleted old component files
- Updated exports

**Migration Checklist:** (Track progress)
- [ ] GraphingLinesLesson.jsx (complex: uses both MathKeypad and SlimMathKeypad)
- [ ] PlottingPoints.jsx
- [ ] SymmetryLesson.jsx
- [ ] SymmetryIdentify.jsx
- [ ] RotationLesson.jsx
- [ ] SubtractingIntegersLesson.jsx
- [ ] SolvingEquationsLesson.jsx
- [ ] PatternsLesson.jsx
- [ ] Level3CalculateRectangle.jsx
- [ ] Level4RightTriangle.jsx
- [ ] Level5AnyTriangle.jsx
- [ ] Level6TrapezoidDecomposition.jsx
- [ ] Level7MixedShapes.jsx
- [ ] AddingFractions.jsx
- [ ] useInputOverlay.js (algebra/hooks)
- [ ] useInputOverlay.js (geometry/hooks)
- [ ] + 8 more files from grep

---

### 5️⃣ **Pipeline Specialist (Backend)**

**Responsibilities:**
- Ensure no backend changes needed
- Verify lesson configs still work
- Check generator patterns unaffected

**Tasks:**
1. Verify: No backend generator changes needed (frontend-only refactor)
2. Confirm: All lesson configs unchanged
3. Smoke test: Backend API still returns correct data shapes

**Deliverables:**
- Confirmation: Backend unaffected
- Smoke test results

---

### 6️⃣ **Tester / QA**

**Responsibilities:**
- Test all 24 lessons across all levels
- Verify no regressions in functionality
- Test on multiple devices (iPad, desktop, mobile)
- Document any issues found

**Tasks:**

**Testing Matrix:**
| Lesson | Levels | Keypad Features | iPad | Desktop | Mobile | Status |
|--------|--------|-----------------|------|---------|--------|--------|
| GraphingLinesLesson | 1-8 | Full + Slim + TwoField | ⬜ | ⬜ | ⬜ | Pending |
| SymmetryLesson | 1-5 | Full + Fraction mode | ⬜ | ⬜ | ⬜ | Pending |
| AreaPerimeter L3-7 | 1 | Slim + KeepOpen | ⬜ | ⬜ | ⬜ | Pending |
| AddingFractions | 1-3 | Fraction + Submit | ⬜ | ⬜ | ⬜ | Pending |
| ... | ... | ... | ... | ... | ... | ... |

**Test Cases:**
1. **Basic input:** Type digits, decimal, clear, backspace
2. **Fraction mode:** Toggle fraction, enter numerator/denominator, switch fields
3. **Extra buttons:** Tap custom buttons (/, x, y, =), verify correct insertion
4. **Random button:** Generate random numbers, verify range
5. **Keep open:** Check checkbox, verify panel stays open after submit
6. **Two-field screen:** Switch fields, verify correct value updates
7. **Submit validation:** Verify submit button enables/disables correctly
8. **Responsiveness:** Test on iPad (768px), desktop (1024px+), mobile (320px)
9. **Touch targets:** Verify 48-56px minimum (iOS guidelines)
10. **Theme support:** Test light/dark mode

**Regression Checklist:**
- [ ] All lessons load without errors
- [ ] All levels render correctly
- [ ] Input values update correctly
- [ ] Submit handlers fire correctly
- [ ] Validation works (fraction keypad)
- [ ] Keep open checkbox persists state
- [ ] No console errors
- [ ] No visual glitches
- [ ] Performance unchanged (no lag)

**Deliverables:**
- Completed testing matrix
- Bug reports (if any)
- Final QA sign-off

**Reference:**
- MASTER_BOT_CONVERSATIONS.md → Tester section
- Testing checklist template

---

### 7️⃣ **Documenter**

**Responsibilities:**
- Update lesson style guide
- Document UnifiedMathKeypad API
- Create migration guide for future developers
- Update MASTER_BOT_CONVERSATIONS.md

**Tasks:**

**1. Update Lesson Style Guide**
File: `frontends/lessons/docs/LESSON_STYLE_GUIDE.md`

Add section:
```markdown
## Math Input Components

### UnifiedMathKeypad

Use the UnifiedMathKeypad for all numerical input in lessons.

**Basic usage:**
```javascript
import { UnifiedMathKeypad } from "../../../../shared/components";

<UnifiedMathKeypad
  value={inputValue}
  onChange={setInputValue}
  layout="inline"
  buttonSet="basic"
/>
```

**With keep-open feature (geometry lessons):**
```javascript
<UnifiedMathKeypad
  value={inputValue}
  onChange={setInputValue}
  buttonSet="basic"
  showKeepOpen={true}
  keepOpen={keepOpen}
  onKeepOpenChange={setKeepOpen}
/>
```

**With extra buttons (algebra lessons):**
```javascript
<UnifiedMathKeypad
  buttonSet="basic"
  extraButtons={['/', 'x', 'y', '=']}
/>
```

**With custom screen (multi-field input):**
```javascript
<UnifiedMathKeypad
  screen={<TwoFieldScreen fields={...} />}
  buttonSet="basic"
/>
```
```

**2. Create API Documentation**
File: `frontends/lessons/docs/components/UNIFIED_MATH_KEYPAD.md`

Full component documentation with:
- All props and types
- Examples for each buttonSet
- Screen component guide
- Migration examples

**3. Update MASTER_BOT_CONVERSATIONS.md**

Add new section under React Specialist:
```markdown
### UnifiedMathKeypad Component (2026-02-28)
**Conversation:** unified-math-keypad-implementation.md

**What You Built:**
- Consolidated 3 keypad components into 1 unified component
- Reduced codebase from ~971 lines to ~500 lines
- Added extensible screen component system
- Migrated 24 lessons to use UnifiedMathKeypad

**Key Decisions:**
- Screen prop for custom displays (TwoFieldScreen, FractionScreen)
- extraButtons append to buttonSet (flexible)
- All "inline" for now (bottom-sheet deferred to Phase 2)
- Option A migration: Breaking change, all lessons at once

**Patterns to Reuse:**
[Code examples]
```

**Deliverables:**
- Updated LESSON_STYLE_GUIDE.md
- New UNIFIED_MATH_KEYPAD.md API doc
- Updated MASTER_BOT_CONVERSATIONS.md
- Migration guide for future components

---

## 📋 Implementation Phases

### Phase 0: Planning & Design ✓ (Current)
- [x] Analyze existing implementations
- [x] Design unified component API
- [x] Create implementation plan
- [x] Assign bot roles
- [ ] **BLOCKER:** Architect approval of API specification
- [ ] **BLOCKER:** Product Manager approval of scope

### Phase 1: Build UnifiedMathKeypad (React Specialist)
**Estimated:** 1 session

- [ ] Create UnifiedMathKeypad.js
- [ ] Implement button set presets
- [ ] Implement all handler functions
- [ ] Build TwoFieldScreen component
- [ ] Build FractionScreen component
- [ ] Add responsive styling
- [ ] Export from index.js
- [ ] **BLOCKER:** Code review by Architect

### Phase 2: Migrate All Lessons (Engineer)
**Estimated:** 1-2 sessions

- [ ] Update imports (24 files)
- [ ] Migrate MathKeypad users (6 files)
- [ ] Migrate SlimMathKeypad users (17 files)
- [ ] Migrate FractionKeypad user (1 file)
- [ ] Special case: GraphingLines L3 with TwoFieldScreen
- [ ] Delete old components (3 files)
- [ ] Update exports
- [ ] **BLOCKER:** Manual smoke test (all lessons load)

### Phase 3: Testing (Tester)
**Estimated:** 1 session

- [ ] Run testing matrix (24 lessons × 3 devices)
- [ ] Regression testing (all test cases)
- [ ] Document bugs (if any)
- [ ] Retest after fixes
- [ ] **BLOCKER:** QA sign-off

### Phase 4: Documentation (Documenter)
**Estimated:** 1 session

- [ ] Update LESSON_STYLE_GUIDE.md
- [ ] Create UNIFIED_MATH_KEYPAD.md
- [ ] Update MASTER_BOT_CONVERSATIONS.md
- [ ] Create migration guide
- [ ] **BLOCKER:** Documentation review

### Phase 5: Backend Verification (Pipeline Specialist)
**Estimated:** 15 minutes

- [ ] Smoke test backend API
- [ ] Verify lesson configs unchanged
- [ ] Confirm no backend changes needed
- [ ] **BLOCKER:** Backend confirmation

### Phase 6: Final Review & Merge (Product Manager)
**Estimated:** 30 minutes

- [ ] Review all deliverables
- [ ] Verify testing matrix complete
- [ ] Check documentation updated
- [ ] Final code review
- [ ] Approve merge to main
- [ ] Deploy to production

---

## 🚨 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Breaking 24 lessons at once** | High | Comprehensive testing matrix, manual QA on all lessons |
| **Missing edge cases in unified component** | Medium | Copy all logic from 3 existing components, line-by-line review |
| **TwoFieldScreen pattern doesn't work** | Medium | Build and test TwoFieldScreen in isolation first |
| **Performance regression** | Low | React.memo, useCallback on all handlers |
| **iPad touch targets too small** | Medium | Follow iOS guidelines (48-56px minimum), test on real iPad |
| **Theme compatibility issues** | Low | Use styled-components theme throughout |

---

## 🎯 Success Criteria

1. ✅ All 24 lessons working with UnifiedMathKeypad
2. ✅ Zero regressions in functionality
3. ✅ Code reduced from ~971 lines to ~500 lines
4. ✅ All test cases passing
5. ✅ Documentation complete
6. ✅ QA sign-off from Tester
7. ✅ Architect approval of implementation
8. ✅ Product Manager approval for merge

---

## 📊 Future Enhancements (Phase 2)

**Not included in this PR, but designed for:**

1. **Bottom-sheet mode** (layout="bottom-sheet")
   - Slides up from bottom (like original MathKeypad)
   - Overlay click to close
   - Fixed positioning, safe area insets

2. **New screen components**
   - EquationScreen (for complex equation entry)
   - CoordinateScreen (x, y fields with parentheses)
   - MatrixScreen (grid of input fields)

3. **Advanced features**
   - Copy/paste support
   - History/undo
   - Voice input (accessibility)
   - Haptic feedback (iOS)

---

## 🤝 Bot Coordination Workflow

```
Product Manager
    ↓ (Approves scope)
Architect
    ↓ (Reviews API design)
React Specialist
    ↓ (Builds component)
Architect
    ↓ (Code review)
Engineer
    ↓ (Migrates lessons)
Tester
    ↓ (Runs test matrix)
Documenter
    ↓ (Updates docs)
Pipeline Specialist
    ↓ (Verifies backend)
Product Manager
    ↓ (Final approval)
MERGE & DEPLOY
```

---

## 📝 Notes

- **Estimated total time:** 3-4 sessions across all bots
- **PR size:** ~30 files changed, ~600 lines added, ~1000 lines deleted
- **Testing priority:** High (touches 24 lessons)
- **Rollback plan:** Revert single PR if critical issues found

---

**Next Step:** Product Manager and Architect review and approve this plan, then hand off to React Specialist to begin implementation.
