# Master Bot Conversations — Organized by Role
**Created:** 2026-02-28
**Purpose:** Consolidated knowledge base for all bots, organized by role
**Source:** Extracted from frontends/lessons/context/conversations/

---

## How to Use This Document

Each bot should:
1. Find your role section below
2. Read the summaries of past work relevant to your responsibilities
3. Reference specific conversation files for deep dives
4. Apply lessons learned to current tasks
5. Update this document when you discover new patterns

---

# 🏗️ ARCHITECT

## Responsibilities
- Design system architecture and data models
- Make high-level technical decisions
- Ensure code quality and maintainability
- Review architectural implications of changes
- Think about scalability, patterns, and best practices

## Past Work Summary

### 1. iPad Optimization Strategy (2026-02-18)
**Conversation:** active.json → "ipad-optimization-2026-02-18"

**What You Did:**
- Designed comprehensive iPad touch optimization across 5 phases
- Created useIsTouchDevice hook pattern
- Architected MathKeypad bottom-sheet with stacked fraction display
- Designed TouchDragHandle component (22px invisible hit area + affordance ring)

**Key Decisions:**
- Touch affordances: 22px minimum hit area (iOS guideline: 44pt = 44px @1x)
- Progressive integration: Phase by phase rollout reduces risk
- Reusable components: useIsTouchDevice benefits 34 consumers automatically
- Safari-specific fixes: viewport meta + touch-action CSS

**Patterns to Reuse:**
```javascript
// Touch detection hook
const isTouchDevice = useIsTouchDevice();

// Conditional rendering for touch affordances
{isTouchDevice ? (
  <TouchDragHandle radius={30} />
) : (
  <Circle radius={8} />
)}
```

**Files Created:**
- `src/hooks/useIsTouchDevice.js`
- `src/shared/components/MathKeypad.js`
- `src/shared/helpers/TouchDragHandle.js`

### 2. Backend Generator Architecture Pattern (2026-02-17)
**Conversation:** active.json → "soe-backend-migration-2026-02-17"

**What You Designed:**
- Standard generator pattern: backend data generation → frontend consumption
- Separation: Backend generates, frontend renders (no client-side generation)
- Pipeline: skipSteps [3,5,6,7,8,9,10,11], customDataGeneration enabled

**Architecture Template:**
```
Backend Generator:
- Location: services/lessonProcessors/questions/{lessonName}Generator.js
- Exports: function generator({ lessonName, level })
- Returns: { visualData, acceptedAnswers, hint, explanation }

Config:
- Location: config/lessonConfigs/{lessonName}.config.js
- Settings: customDataGeneration.enabled = true, batchSize = 10

Frontend:
- Uses: useLessonState() hook
- Reads: questionAnswerArray/lessonProps from Redux
- Renders: visualData for display, answerType='array' with acceptedAnswers
```

**Migration Checklist:**
- [ ] Backend generator returns standardized shape
- [ ] Config enables custom generation for all levels
- [ ] Frontend removes ~200-300 lines of generation code
- [ ] Frontend switches to useLessonState() hook
- [ ] answerType='array' with acceptedAnswers for validation

### 3. Triangle Positioning Architecture (2026-02-23)
**Conversation:** sas-triangle-positioning-2026-02-23.json

**What You Approved:**
- **Approach:** Backend calculates bounding boxes, frontend scales uniformly
- **Why:** Separation of concerns, maintainable, scalable across screen sizes
- **Constants:** CANVAS_DESIGN_WIDTH=400, CANVAS_DESIGN_HEIGHT=360, TRIANGLE_PADDING=30

**Architectural Assessment:**
✓ Backend handles positioning logic (knows triangle dimensions)
✓ Frontend handles scaling only (responsive across devices)
✓ Reusable: Shared helpers across SSS, SAS, AAS, ASA, HL lessons
✓ Testable: Works on mobile, tablet, desktop without frontend changes

**Shared Helper Functions:**
```javascript
calculateTriangleBounds(vertices, includeAnnotations)
positionTriangleSideBySide(triangleA, triangleB, designWidth, designHeight)
positionTriangleGrid(trianglePairs, designWidth, designHeight, cellsX, cellsY)
```

---

# 💻 ENGINEER

## Responsibilities
- Implement features and functionality
- Write clean, maintainable code
- Integrate new code into existing codebase
- Follow architectural guidelines
- Write unit tests for new code

## Past Work Summary

### 1. System of Equations Migration (2026-02-17)
**Conversation:** active.json → "soe-backend-migration-2026-02-17"

**What You Built:**
- Migrated from pure frontend generation to backend data generation
- Created: `systemOfEquationsGenerator.js` (5 level generators + helpers)
- Refactored frontend: Removed ~280 lines, switched to useLessonState()

**Key Changes:**
```javascript
// Backend: services/lessonProcessors/questions/systemOfEquationsGenerator.js
export function systemOfEquationsGenerator({ lessonName, level }) {
  const generators = { 1: genL1, 2: genL2, 3: genL3, 4: genL4, 5: genL5 };
  return generators[level]();
}

// Frontend: SystemOfEquations.jsx
const { questionAnswerArray, lessonProps, currentQuestionIndex } = useLessonState();
const currentProblem = questionAnswerArray[currentQuestionIndex];
const { visualData } = currentProblem;
```

**Pattern Learned:**
- Backend returns: visualData (for rendering), acceptedAnswers (for validation)
- Frontend reads from Redux via useLessonState()
- Config sets: skipSteps, customDataGeneration.enabled = true

### 2. Rounding Lesson (2026-02-17)
**Conversation:** active.json → "rounding-lesson-2026-02-17"

**What You Built:**
- 4-level lesson from scratch with backend generation
- Level 1: Whole numbers (ones/tens/hundreds/thousands)
- Level 2: Decimals (ones/tenths/hundredths/thousandths)
- Level 3: Mixed + extended place values
- Level 4: Word problems (money/distance/population/science/temperature)

**Files Created:**
- Backend: `roundingGenerator.js`, `rounding.config.js`
- Frontend: `Rounding.jsx` (CSS number line visualization, theme-aware)
- Registration: Updated DataLesson.js, algebra/index.js, getLessonDataInitial.js

**Helper Functions:**
```javascript
function roundToPlace(num, place) { /* ... */ }
function formatNumber(num) { /* ... */ }
function getBounds(value, place) { /* ... */ }
function buildAcceptedAnswers(correctAnswer) { /* accepts variations */ }
```

### 3. Order of Operations Lesson (2026-02-18)
**Conversation:** active.json → "order-of-operations-2026-02-18"

**What You Built:**
- Interactive PEMDAS mechanic: Students click operators in correct order
- L1-3: Click-to-evaluate (token display, shake/collapse animations, step log)
- L4: Type final answer (KaTeX + AnswerInput)

**Backend Engine:**
```javascript
// PEMDAS evaluation engine
computeSteps(tokens) → array of step-by-step evaluations
findInnermostParenGroup(tokens)
findHighestPriorityOp(tokens)
collapseTokens(tokens, opIndex) → simplified tokens
removeRedundantParens(tokens)

// Guardrails:
- Clean division (no decimals in intermediate steps)
- Capped exponents (max 3^4 = 81, no overflow)
- Non-negative intermediates (no negative numbers mid-calculation)
- Mixed priorities (ensures all PEMDAS steps required)
```

**Frontend Interactivity:**
- Token display with operator buttons
- Click → evaluate → collapse with animation
- Step log shows history ("Applied × first: 3 × 4 = 12")
- Theme-aware styled components

### 4. Venn Diagrams Rewrite (2026-02-18)
**Conversation:** active.json → "venn-diagrams-2026-02-18"

**What You Built:**
- Rewrote from free-form exploration → 5-level graded lesson
- L1-2: 2-circle drag with answer checking (4 and 6 items)
- L3: Pre-filled Venn with counting questions
- L4: 3-circle drag (8 zones)
- L5: Set notation with probability fractions

**Konva Geometry:**
```javascript
// 2-circle zone detection
function getZone2Circle(x, y, circleA, circleB) {
  const inA = distance(point, circleA.center) < circleA.radius;
  const inB = distance(point, circleB.center) < circleB.radius;
  if (inA && inB) return 'both';
  if (inA) return 'onlyA';
  if (inB) return 'onlyB';
  return 'neither';
}

// 3-circle zone detection (8 zones)
function getZone3Circle(x, y, circleA, circleB, circleC) {
  // Returns: 'A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC', 'none'
}
```

**Templates:**
- 16 L1 templates, 15 L2 templates
- 8 L3/L5 themes with name pools (pets, sports, foods, etc.)
- 10 L4 3-circle templates

### 5. Triangle Inequality Rebuild (2026-02-20)
**Conversation:** active.json → "triangle-inequality-rebuild-2026-02-20"

**What You Built:**
- 5-level interactive lesson (explore, yes/no, which-fails, range, word problems)
- L1: Drag exploration (keep existing interactive visualization)
- L2: Yes/No choice with shake animation
- L3: Tap the failing inequality check card
- L4: Find valid range with AnswerInput
- L5: Word problems with multiple choice

**Pattern Applied:**
```javascript
// Phase-based flow
const [phase, setPhase] = useState('interact');

// Level 1: Self-contained drag exploration
<ExploreLevel
  sides={visualData.sides}
  onComplete={() => setPhase('complete')}
/>

// Level 2/5: Choice buttons with animations
<ChoiceButton
  onClick={handleChoice}
  className={isWrong ? 'shake' : ''}
/>

// Level 3: Interactive cards
<CheckCard
  onClick={() => handleCardClick(idx)}
  $isFailing={card.fails}
  $isSelected={selectedCard === idx}
/>
```

### 6. Triangle Sum Rebuild (2026-02-20)
**Conversation:** active.json → "triangle-sum-rebuild-2026-02-20"

**What You Built:**
- L1: Drag vertex (angles sum to 180°, make right triangle challenge)
- L2: Find missing angle (type answer)
- L3: Solve for x (algebraic expression)
- L4: Classify triangle (acute/right/obtuse choice)
- L5: Word problems (multiple choice)

**Konva Canvas:**
```javascript
// Draggable vertex with real-time angle computation
<TouchDragHandle
  x={dragPoint.x}
  y={dragPoint.y}
  onDragMove={(e) => {
    const pos = e.target.position();
    updateAngles(pos);
    checkRightTriangle();
  }}
/>

// Display sum and right triangle detection
<Text text={`Sum: ${angleSum}°`} fill={angleSum === 180 ? green : red} />
{isRightTriangle && <Text text="✓ Right triangle!" />}
```

### 7. Area Lesson (2026-02-20)
**Conversation:** active.json → "area-lesson-2026-02-20"

**What You Built:**
- 9-level progression: target area, count squares, rectangles, triangles, trapezoids, parallelograms, all shapes, word problems
- Konva shape rendering: rectangle grid, triangle, trapezoid, parallelogram
- Progressive formula introduction (L4: triangle as rectangle cut in half)

**Shape Builders:**
```javascript
// Rectangle on grid
renderRectangle(width, height, cellSize)

// Triangle from rectangle
renderTriangleFromRect(base, height, cellSize)

// Trapezoid split into two triangles
renderTrapezoid(base1, base2, height)

// Parallelogram (b × h)
renderParallelogram(base, height, slantAngle)
```

---

# 🎨 REACT SPECIALIST

## Responsibilities
- React component architecture
- State management patterns
- Performance optimization
- Component lifecycle
- Hooks and context

## Past Work Summary

### 1. Triangle Positioning Analysis (2026-02-23)
**Conversation:** sas-triangle-positioning-2026-02-23.json

**What You Analyzed:**
- Current frontend scaling: `scale = Math.min(scaleX, scaleY)`
- Problem: Backend uses fixed positions (90, 120) and (310, 120)
- Solution: Backend calculates bounding boxes → Frontend scales uniformly

**Scaling Logic:**
```javascript
// Frontend (SASCongruentTrianglesLesson.jsx lines 388-434)
const designWidth = 400;
const designHeight = 360;
const scaleX = canvasWidth / designWidth;
const scaleY = canvasHeight / designHeight;
const scale = Math.min(scaleX, scaleY);

// Apply to vertices
vertices: triangle.vertices.map(v => ({
  x: v.x * scale,
  y: v.y * scale
}))
```

**Recommendation:**
- ✅ Keep frontend scaling simple and uniform
- ✅ Backend handles positioning logic (knows triangle dimensions)
- ✅ Frontend just multiplies all coordinates by scale factor

### 2. Drawing Canvas Integration (2026-02-24)
**Conversation:** solving_equations_interactive_patterns.md

**What You Built:**
- Canvas answer integration: Draw work → type answer → submit from canvas
- Redux integration: Canvas answer auto-populates main AnswerInput
- Enter key support for quick submission

**Pattern:**
```javascript
// In DrawingCanvas
<AnswerInput
  value={answerText}
  onChange={(e) => {
    setAnswerText(e.target.value);
    onAnswerRecognized(e.target.value);  // Auto-populate main input
  }}
  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
/>
<SubmitButton
  onClick={() => {
    onSubmit();  // Validate
    onClose();   // Close canvas
  }}
/>

// In Lesson Component
<DrawingCanvas
  onAnswerRecognized={(text) => dispatch(setUserAnswer(text))}
  onSubmit={handleCanvasSubmit}
/>
```

**State Management:**
- Redux for shared state (userAnswer between canvas and main input)
- Local state for UI (answerText, showCanvas, phase)
- No prop drilling

---

# 🖼️ KONVA SPECIALIST

## Responsibilities
- Konva canvas rendering
- Shape and geometry visualization
- Touch/drag interactions
- Performance optimization for canvas
- Visual effects and animations

## Past Work Summary

### 1. Triangle Rendering with Congruency Markings (2026-02-23)
**Conversation:** triangle-congruence-level3-lessons-learned-2026-02-23.md

**What You Learned:**

**Tick Marks (on sides):**
```javascript
{side.tickMarks > 0 && Array.from({ length: side.tickMarks }).map((_, tickIdx) => {
  const tickSpacing = 6;
  const tickLength = 8;

  // Calculate perpendicular direction
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / len;
  const perpY = dx / len;

  // Position at midpoint with spacing
  const offset = (tickIdx - (side.tickMarks - 1) / 2) * tickSpacing;
  const tickX = midX + perpX * offset;
  const tickY = midY + perpY * offset;

  return <Line
    points={[
      tickX - perpX * tickLength / 2,
      tickY - perpY * tickLength / 2,
      tickX + perpX * tickLength / 2,
      tickY + perpY * tickLength / 2
    ]}
    stroke={konvaTheme.triangle}
    strokeWidth={2}
  />;
})}
```

**Arc Marks (on angles):**
```javascript
{angle.arcMark > 0 && Array.from({ length: angle.arcMark }).map((_, arcIdx) => {
  const markRadius = arcRadius - 6 - arcIdx * 4;  // Concentric arcs
  return <Arc
    key={`arc-mark-${arcIdx}`}
    x={vertex.x}
    y={vertex.y}
    innerRadius={markRadius}
    outerRadius={markRadius}
    angle={arcAngle}
    rotation={startAngle}
    stroke={konvaTheme.arcMark}
    strokeWidth={2}
  />;
})}
```

**CRITICAL:** Use `angle.vertex` property, NOT array index:
```javascript
// CORRECT
const vertexIndex = angle.vertex !== undefined ? angle.vertex : i;
const vertex = vertices[vertexIndex];

// WRONG - will position at wrong vertex
const vertex = vertices[i];
```

### 2. Grid Layout for Triangle Selection (2026-02-23)
**Conversation:** triangle-congruence-level3-lessons-learned-2026-02-23.md

**What You Implemented:**

**Canvas Aspect Ratio:**
```javascript
// CRITICAL: Must match backend design space (400:360)
const designWidth = 400;
const designHeight = 360;
const scale = canvasWidth / designWidth;

// Grid mode: No height cap (maintain aspect ratio)
const canvasHeight = mode === 'grid'
  ? designHeight * scale
  : Math.min(designHeight * scale, 450);
```

**Grid Rendering:**
```javascript
// Cell borders (subtle)
{[0, 1, 2, 3].map((idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  return <Rect
    x={col * cellWidth}
    y={row * cellHeight}
    width={cellWidth}
    height={cellHeight}
    stroke={konvaTheme.gridLine}
    strokeWidth={2}
    fill="transparent"
  />;
})}

// Main dividers (thick)
<Line points={[canvasWidth/2, 0, canvasWidth/2, canvasHeight]} strokeWidth={3} />
<Line points={[0, canvasHeight/2, canvasWidth, canvasHeight/2]} strokeWidth={3} />
```

**Triangle Positioning in Grid:**
- Backend positions in 400x360 design space with 200x180 cells
- Frontend scales entire space uniformly
- Each triangle centered in its cell with padding

### 3. Bounding Box Calculations (2026-02-23)
**Conversation:** sas-triangle-positioning-2026-02-23.json

**What You Designed:**

```javascript
function getTriangleBounds(vertices) {
  const xs = vertices.map(v => v.x);
  const ys = vertices.map(v => v.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

function getTriangleBoundsWithAnnotations(vertices, sides, angles) {
  let bounds = getTriangleBounds(vertices);

  // Account for labels and arc indicators
  const ANNOTATION_BUFFER = 35; // Arc radius (20) + label (15)
  bounds.minX -= ANNOTATION_BUFFER;
  bounds.maxX += ANNOTATION_BUFFER;
  bounds.minY -= ANNOTATION_BUFFER;
  bounds.maxY += ANNOTATION_BUFFER;

  return bounds;
}
```

**Why 35px Buffer?**
- Arc radius: 20px
- Label text: ~15px
- Total: 35px padding in all directions

---

# 🐛 BUG FIXER

## Responsibilities
- Identify and reproduce bugs
- Diagnose root causes
- Implement bug fixes
- Test fixes thoroughly
- Document bug resolutions

## Past Work Summary

### 1. AAS Lesson Debugging (2026-02-23)
**Conversation:** aas-lesson-debugging-2026-02-23.md

**Bugs Fixed:**

**Bug #1: Config Cache**
- **Symptom:** "No config found for lesson: aas, using default"
- **Root Cause:** Backend cached default config before AAS was registered
- **Fix:** Restarted backend server at 22:15:53
- **Status:** ✅ FIXED

**Bug #2: Missing supportsLesson Function**
- **Symptom:** "Using default question generator for lesson: aas"
- **Root Cause:** Generator didn't export supportsLesson() to handle "aas" alias
- **Fix:** Added function to aasCongruentTrianglesGenerator.js
```javascript
export function supportsLesson(lessonName) {
  return lessonName === "aas_congruent_triangles" || lessonName === "aas";
}
```
- **Backend Restarted:** 22:20:25
- **Status:** ✅ FIXED

**Bug #3: Wrong Export Pattern**
- **Symptom:** "TypeError: generator is not a function"
- **Root Cause:** Exported object `{ generateQuestionBatch }` instead of function
- **Fix:** Refactored to match SSS/SAS pattern
```javascript
// BEFORE (wrong):
export const aasCongruentTrianglesGenerator = { generateQuestionBatch };

// AFTER (correct):
export function aasCongruentTrianglesGenerator({ lessonName, level }) {
  const gen = LEVEL_GENERATORS[level];
  if (!gen) return LEVEL_GENERATORS[1]();
  return gen();
}
```
- **Backend Restarted:** 22:22:54
- **Status:** ✅ FIXED

**Bug #4: Level Field Location**
- **Symptom:** Level 2 showed Level 1 interface
- **Root Cause:** Frontend read `level` from `visualData.level` (null)
- **Fix:** Changed to read from top-level currentProblem
```javascript
// BEFORE (wrong):
const { level = 1, mode, ... } = visualData;

// AFTER (correct):
const { mode, ... } = visualData;
const level = currentProblem?.level || 1;
```
- **Status:** ✅ FIXED

**Bug #5: URL Format Confusion**
- **Symptom:** User thought aas&2&1 was Level 2
- **Root Cause:** Misunderstanding of URL format
- **Documentation:** `/lessons/content/LESSON&PROBLEM&LEVEL`
  - Level 1: `aas&1&1`, `aas&2&1`, `aas&3&1`
  - Level 2: `aas&1&2`, `aas&2&2`, `aas&3&2`
  - Third parameter is LEVEL number!
- **Status:** ✅ DOCUMENTED

### 2. AAS Frontend Fixes (2026-02-23)
**Conversation:** aas-frontend-fixes-needed-2026-02-23.md, aas-fixes-progress-2026-02-23.md

**Visual Issues Fixed:**

**Issue #1: Number Formatting**
- **Problem:** "51.699999999999999°" instead of "52°"
- **Fix:** Added formatting helpers
```javascript
const formatAngle = (angle) => `${Math.round(angle)}°`;
const formatSide = (length) => {
  const rounded = Number(length.toFixed(1));
  return rounded % 1 === 0 ? Math.round(rounded) : rounded;
};
```

**Issue #2: Label Overload**
- **Problem:** Too many labels (BC, AB, CA, vertex labels, etc.)
- **Fix:** Set `showLabel: false` for sides, control vertex labels separately

**Issue #3: Duplicate Word Problem**
- **Problem:** Level 5 word problem shown twice (question + canvas)
- **Fix:** Conditional rendering
```javascript
{level !== 5 && question && <Text text={question} />}
```

**Issue #4: Missing Congruency Markings**
- **Problem:** Level 2 had no visual indicators for matching angles
- **Fix:** Added arcMark and tickMarks to Level 2 generator
```javascript
∠A: arcMark: 1  // Matches ∠D
∠C: arcMark: 2  // Matches ∠F
BC: tickMarks: 1  // Non-included side
```

**Issue #5: Buttons Layout**
- **Problem:** 1x4 vertical column (too tall)
- **Requested:** 2x2 grid layout
- **Pattern:**
```javascript
const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;
```

---

# 🔧 BACKEND SPECIALIST

## Responsibilities
- Backend logic implementation
- Data generation algorithms
- Database optimization
- API design
- Server-side validation

## Past Work Summary

### 1. Generator Export Pattern (CRITICAL)
**Conversation:** lessons-learned-triangle-congruence-generators.md

**✅ CORRECT Pattern:**
```javascript
// Main export - returns SINGLE question
export function aasCongruentTrianglesGenerator({ lessonName, level }) {
  const gen = LEVEL_GENERATORS[level];
  if (!gen) return LEVEL_GENERATORS[1]();
  return gen();
}

// Alias support - MUST handle both names
export function supportsLesson(lessonName) {
  return lessonName === "aas_congruent_triangles" || lessonName === "aas";
}
```

**❌ WRONG Pattern:**
```javascript
// DON'T DO THIS - object export
export const aasCongruentTrianglesGenerator = { generateQuestionBatch };
```

**Why This Matters:**
- Middleware calls `generator({ lessonName, level })` expecting a function
- Must return single question, not batch (middleware handles batching)

### 2. Registration Checklist
**Conversation:** lessons-learned-triangle-congruence-generators.md

**Step 1: Import with Named Exports**
```javascript
// lessonProcessors/index.js
import {
  aasCongruentTrianglesGenerator,
  supportsLesson as aasCongruentTrianglesSupportsLesson
} from "./questions/aasCongruentTrianglesGenerator.js";
```

**Step 2: Add to getQuestionGenerator**
```javascript
export function getQuestionGenerator(lessonName) {
  if (aasCongruentTrianglesSupportsLesson(lessonName)) {
    return aasCongruentTrianglesGenerator;
  }
  // ... other checks
}
```

**Step 3: Add to hasCustomGenerator**
```javascript
export function hasCustomGenerator(lessonName) {
  return aasCongruentTrianglesSupportsLesson(lessonName) ||
         sssCongruentTrianglesSupportsLesson(lessonName) ||
         // ... other checks
}
```

**Step 4: Create Config**
```javascript
// config/lessonConfigs/aas_congruent_triangles.config.js
export default {
  name: 'aas_congruent_triangles',
  pipeline: {
    skipSteps: [3, 5, 6, 7, 8, 9, 10, 11],
    customDataGeneration: {
      enabled: true,  // ← CRITICAL
      levels: [1, 2, 3, 4, 5],
      batchSize: 10
    }
  }
};
```

**Step 5: Register Config (BOTH names)**
```javascript
// config/lessonConfigs/index.js
const lessonConfigRegistry = {
  aas_congruent_triangles: aasCongruentTrianglesConfig,
  aas: aasCongruentTrianglesConfig  // ← Alias
};
```

### 3. Triangle Positioning Helpers (2026-02-23)
**Conversation:** sas-triangle-positioning-2026-02-23.json

**Constants:**
```javascript
const CANVAS_DESIGN_WIDTH = 400;
const CANVAS_DESIGN_HEIGHT = 360;
const MIN_TOP_MARGIN = 40;
const MIN_HORIZONTAL_GAP = 50;
const TRIANGLE_PADDING = 30;
const ANNOTATION_BUFFER = 35;
```

**Bounding Box Calculation:**
```javascript
function getTriangleBounds(vertices) {
  const xs = vertices.map(v => v.x);
  const ys = vertices.map(v => v.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

function getTriangleBoundsWithAnnotations(vertices) {
  let bounds = getTriangleBounds(vertices);
  // Add buffer for labels and arcs
  bounds.minX -= ANNOTATION_BUFFER;
  bounds.maxX += ANNOTATION_BUFFER;
  bounds.minY -= ANNOTATION_BUFFER;
  bounds.maxY += ANNOTATION_BUFFER;
  return bounds;
}
```

**Side-by-Side Positioning:**
```javascript
function positionTrianglesSideBySide(verticesA_temp, verticesB_temp) {
  const boundsA = getTriangleBoundsWithAnnotations(verticesA_temp);
  const boundsB = getTriangleBoundsWithAnnotations(verticesB_temp);

  // Scale to fit
  const availableWidth = (CANVAS_DESIGN_WIDTH - MIN_HORIZONTAL_GAP) / 2;
  const scaleA = Math.min(availableWidth / boundsA.width, 1);
  const scaleB = Math.min(availableWidth / boundsB.width, 1);

  // Position A on left, B on right
  const offsetA_x = TRIANGLE_PADDING - boundsA.minX * scaleA;
  const offsetA_y = MIN_TOP_MARGIN - boundsA.minY * scaleA;

  const offsetB_x = CANVAS_DESIGN_WIDTH / 2 + MIN_HORIZONTAL_GAP / 2 - boundsB.minX * scaleB;
  const offsetB_y = MIN_TOP_MARGIN - boundsB.minY * scaleB;

  return { verticesA, verticesB, boundsA, boundsB };
}
```

**Grid Positioning:**
```javascript
function positionTrianglesGrid(trianglePairsData) {
  const cellWidth = CANVAS_DESIGN_WIDTH / 2;
  const cellHeight = CANVAS_DESIGN_HEIGHT / 2;
  const cellPadding = 25;

  return trianglePairsData.map((pair, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);

    // Scale to fit cell
    const availableWidth = cellWidth - cellPadding * 2;
    const availableHeight = cellHeight - cellPadding * 2;
    const scale = Math.min(
      availableWidth / bounds.width,
      availableHeight / bounds.height,
      1
    );

    // Center in cell
    const centerX = col * cellWidth + cellWidth / 2;
    const centerY = row * cellHeight + cellHeight / 2;

    return scaledVertices;
  });
}
```

### 4. Common Pitfalls (From Debugging Sessions)
**Conversation:** lessons-learned-triangle-congruence-generators.md

1. **Exporting object instead of function** → "generator is not a function"
2. **Missing supportsLesson function** → Uses default generator
3. **Not checking alias in supportsLesson** → "aas" doesn't work
4. **Forgetting to restart backend** → Config cache issues
5. **Not registering in hasCustomGenerator** → Middleware issues
6. **Missing BOTH names in registries** → Alias doesn't work

**Golden Rule:** Follow SSS/SAS pattern EXACTLY. Don't try to be clever.

---

# 📋 CONTENT SPECIALIST

## Responsibilities
- Lesson content design
- Pedagogical progression
- Question templates
- Explanation text
- Hint systems

## Past Work Summary

### 1. Progressive Scaffolding Pattern (2026-02-24)
**Conversation:** solving_equations_interactive_patterns.md

**Pattern: Progressive Scaffolding Fade**
- Heavy guidance early → automatic fade after mastery demonstrated
- Example: Visual helper auto-hides after question 8
- Allow manual toggle for students who need it back

```javascript
useEffect(() => {
  if (currentQuestionIndex >= 7) {
    setShowVisualHelper(false);
  }
}, [currentQuestionIndex]);

<ToggleButton onClick={() => setShowVisualHelper(!showVisualHelper)}>
  {showVisualHelper ? 'Hide' : 'Show'} Visual Helper
</ToggleButton>
```

**Why It Works:** Students feel supported but not patronized

### 2. Multi-Stage Button Selection (2026-02-24)
**Conversation:** solving_equations_interactive_patterns.md

**Pattern: Sequential Unlock**
```javascript
// Stage 1: First operation
{!step1Selected && <StepOneButtons />}

// Stage 2: Only after Stage 1 correct
{step1Selected?.isCorrect && !step2Selected && (
  <>
    <SuccessMessage>✓ Correct! Now solve for x.</SuccessMessage>
    <StepTwoButtons />
  </>
)}

// Final: Show canvas after both correct
{step1Selected?.isCorrect && step2Selected?.isCorrect && (
  <ShowCanvasButton />
)}
```

**Why It Works:** Clear progression, immediate feedback, prevents confusion

### 3. Triangle Congruence Progression (2026-02-23)
**Conversation:** aas-lesson-plan-2026-02-23.md

**5-Level Template:**
1. **Recognition (Binary Choice):** "Are these triangles congruent by AAS?"
2. **Identification (Classification):** "Which parts prove AAS congruence?"
3. **Application (Grid Selection):** "Find the congruent pair"
4. **Calculation (Answer Input):** "Find the missing measurement"
5. **Real-World (Word Problems):** Apply to scenarios

**Congruency Markings System:**
- **Arc marks** on angles: 1 arc, 2 arcs, 3 arcs (matching pattern)
- **Tick marks** on sides: 1 tick, 2 ticks, 3 ticks (matching pattern)
- **Critical Rule (AAS):** Side with ticks NOT between angles with arcs

**Word Problem Contexts:**
1. Architecture: Roof trusses, support beams
2. Engineering: Bridge supports, frame structures
3. Design: Pattern matching, tile layouts
4. Navigation: Triangulation, surveying
5. Art: Geometric patterns, symmetry

---

# 📝 DOCUMENTER

## Responsibilities
- Write and maintain README files
- Create API documentation
- Write code comments
- Develop user guides
- Document architectural decisions

## Past Work Summary

### 1. Interactive Lesson Patterns Guide (2026-02-24)
**Conversation:** solving_equations_interactive_patterns.md

**Created:** `frontends/lessons/docs/INTERACTIVE_LESSON_PATTERNS.md`

**Contents:**
- Core interactive patterns (button selection, multi-stage, canvas, visual helpers)
- Complete drawing canvas integration guide
- Progressive scaffolding strategies
- State management patterns (Redux vs local)
- UX patterns (feedback, transitions, accessibility)
- Code examples and templates
- Lessons learned and pitfalls
- Quick reference checklist

**Why Important:** Blueprint for all future interactive lessons

### 2. Triangle Congruence Documentation (2026-02-23)
**Conversation:** triangle-congruence-level3-lessons-learned-2026-02-23.md

**Created:** Comprehensive lessons learned document

**Key Sections:**
- Grid Layout Design
- Canvas Aspect Ratio Mismatch (400:360 critical!)
- Congruency Markings Implementation
- Angle Rendering Issues
- SAS Included Angle Positioning
- Checklist for Future Development
- Common Pitfalls
- Testing Checklist

**Reusable Patterns:**
- Canvas aspect ratio must match backend design space
- Use `angle.vertex` property, NOT array index
- Backend positions in design space, frontend scales uniformly
- Include annotations in bounding box calculations

### 3. Generator Registration Guide (2026-02-23)
**Conversation:** lessons-learned-triangle-congruence-generators.md

**Created:** Complete generator pattern documentation

**Sections:**
- ✅ Correct export pattern
- ❌ Wrong patterns (with explanations)
- Registration in lessonProcessors/index.js
- Config file pattern
- Common pitfalls and solutions
- Frontend registration checklist
- Testing workflow
- Quick reference checklist

**File Locations Reference:**
```
backend/
├── services/lessonProcessors/
│   ├── index.js (register generator)
│   └── questions/{name}Generator.js (create)
├── config/lessonConfigs/
│   ├── index.js (register config)
│   └── {name}.config.js (create)
└── data/helperFunctions/
    └── getLessonDataInitial.js (add hints)

frontends/lessons/src/features/lessons/
├── DataLesson.js (lazy import + register)
└── lessonTypes/{category}/
    ├── index.js (export component)
    └── {Name}Lesson.jsx (create component)
```

---

# 🎯 PROJECT MANAGER

## Responsibilities
- Create and organize tasks
- Assign tasks to appropriate bot roles
- Monitor project progress
- Coordinate between bots
- Make decisions about priorities

## Past Work Summary

### 1. Triangle Positioning Coordination (2026-02-23)
**Conversation:** sas-triangle-positioning-2026-02-23.json

**What You Coordinated:**
- Brought in React Specialist and Konva Specialist for analysis
- Gathered user requirements (4 questions asked and answered)
- Facilitated bot discussion (6 messages)
- Obtained Architect approval
- Created 5-phase implementation plan

**User Questions Asked:**
1. Priority: Higher vs more spread out? → **Higher (PRIMARY)**
2. Apply to SSS lesson? → **Yes, document pattern**
3. Minimum gap? → **50px minimum, algorithm optimizes**
4. Grid view scrolling? → **All 4 pairs visible without scrolling**

**Implementation Phases Defined:**
1. Create Shared Positioning Helpers
2. Update SAS Generator - Side-by-Side
3. Update SAS Generator - Grid
4. Testing & Validation
5. Apply to SSS Lesson

**Status Tracking:**
- ✅ All 5 phases completed
- ✅ Backend restarted
- ✅ Documented in active.json
- → User testing recommended

### 2. iPad Optimization Project (2026-02-18)
**Conversation:** active.json → "ipad-optimization-2026-02-18"

**What You Organized:**
- 5-phase rollout strategy
- Phase 1: useIsTouchDevice hook + MathKeypad (34 consumers)
- Phase 2: TouchDragHandle + 6 MovablePointsAndLines variants + 6 lessons
- Phase 3: VennDiagram touch optimization
- Phase 4: Translation snap-to-grid
- Phase 5: Safari viewport meta + global touch CSS

**Participants Coordinated:**
- Architect (design decisions)
- Engineer (implementation)
- Konva Specialist (canvas interactions)
- React Specialist (hooks and state)

**Files Tracked:**
- Created: 4 new files (hook, 2 components, 1 helper)
- Modified: 15 existing files
- Zero breaking changes

---

# 🧪 TESTER / QA

## Responsibilities
- Open and test live site using browser automation
- Visually verify features work correctly
- Test user interactions
- Validate bug fixes
- Take screenshots for documentation
- Test across screen sizes

## Past Work Summary

### 1. Testing Checklist Template
**From:** triangle-congruence-level3-lessons-learned-2026-02-23.md

**Functional Tests:**
- [ ] All triangles appear in correct positions
- [ ] Triangles scale properly on narrow screens (phone)
- [ ] Triangles scale properly on wide screens (desktop)
- [ ] No scrolling required on iPad
- [ ] Congruent triangles show matching tick marks
- [ ] Congruent triangles show matching arc marks
- [ ] Selection highlights work correctly
- [ ] Correct answer validation works
- [ ] Wrong answer feedback works
- [ ] No "undefined" text appearing

**Visual Tests:**
- [ ] Grid lines visible and prominent
- [ ] Text labels readable (no overlap)
- [ ] Numbers properly formatted (no long decimals)
- [ ] Dark mode compatibility

**Edge Cases:**
- [ ] Different orientations tested
- [ ] Decimal values handled correctly
- [ ] Very small/large shapes scale appropriately
- [ ] Extreme angles handled

### 2. Screen Size Testing Matrix

**Mobile (320px-480px):**
- Test portrait orientation
- Verify touch targets minimum 44px
- Check text readability
- Ensure no horizontal scrolling

**Tablet (768px-1024px):**
- Test both orientations
- Verify layout responsiveness
- Check MathKeypad doesn't push content off screen
- Ensure grid layouts visible without scrolling

**Desktop (1200px+):**
- Verify centered layouts
- Check max-width constraints
- Test hover states
- Verify keyboard navigation

---

# 🏛️ CONSULTANT

## Responsibilities
- High-level code analysis
- Identify technical debt
- Suggest refactoring opportunities
- Advise on best practices
- Strategic technical guidance

## Past Work Summary

### 1. Architecture Patterns Identified

**Backend Generator Pattern:**
- ✅ Standard: Single function export, returns one question
- ✅ Alias support: supportsLesson() checks both names
- ✅ Config: customDataGeneration.enabled = true
- ❌ Anti-pattern: Object export, batch generation in generator

**Frontend State Management:**
- ✅ Redux for shared state (userAnswer, questionAnswerArray)
- ✅ Local state for UI (showCanvas, phase, selectedChoice)
- ✅ useLessonState() hook for lesson data
- ❌ Anti-pattern: Prop drilling, client-side generation

**Component Architecture:**
- ✅ Single component for all levels (conditional rendering)
- ✅ Styled components with theme support
- ✅ Reusable helpers (TouchDragHandle, MathKeypad)
- ❌ Anti-pattern: Separate components per level

### 2. Technical Debt Observations

**From multiple conversations:**
- Old lessons still have client-side generation (should migrate to backend)
- Some lessons don't support dark mode
- Inconsistent answer validation patterns
- Need more shared helper components

**Refactoring Opportunities:**
- Extract common triangle rendering logic
- Create shared positioning helpers (✅ done for SAS/SSS)
- Standardize button patterns (Yes/No, multiple choice)
- Create lesson template generator

---

# 🎨 CREATIVE

## Responsibilities
- Brainstorm new features
- Propose creative solutions
- Think about UX improvements
- Generate ideas for testing
- Suggest innovative approaches

## Past Work Summary

### 1. Interactive Pattern Ideas (2026-02-24)
**From:** solving_equations_interactive_patterns.md

**Patterns Discovered:**
- Progressive scaffolding fade (auto-hide after mastery)
- Multi-stage button selection (sequential unlock)
- Canvas answer integration (draw + type + submit in one flow)
- Visual feedback with animations (shake, fade, highlight)

**Future Enhancement Ideas:**
- [ ] Drag-and-drop equation balancing
- [ ] Animated transformation steps
- [ ] Graph plotting canvas for algebra
- [ ] Adaptive difficulty based on performance
- [ ] AI-generated hints based on specific mistakes

### 2. Word Problem Contexts (2026-02-23)
**From:** aas-lesson-plan-2026-02-23.md

**Triangle Congruence Scenarios:**
1. Architecture: Roof trusses, support beams
2. Engineering: Bridge supports, frame structures
3. Design: Pattern matching, tile layouts
4. Navigation: Triangulation, surveying
5. Art: Geometric patterns, symmetry

**Rounding Scenarios:**
1. Money: Prices, budgets
2. Distance: Trip planning, maps
3. Population: Census data
4. Science: Measurements, experiments
5. Temperature: Weather, cooking

---

# 🔍 REVIEWER

## Responsibilities
- Review code changes for quality
- Check for bugs and security issues
- Ensure coding standards followed
- Provide constructive feedback
- Validate requirements met

## Past Work Summary

### 1. Code Review Patterns

**From debugging sessions:**

**✅ Good Patterns:**
- Named exports with clear function names
- Type checking (angle.vertex !== undefined)
- Graceful fallbacks (angle.vertex !== undefined ? angle.vertex : i)
- Constants at top of file
- Helper functions separated from main logic
- Comprehensive error messages

**❌ Code Smells:**
- Magic numbers (use constants instead)
- Array index assumptions (use explicit properties)
- Missing null checks
- Hardcoded positions
- Missing aspect ratio calculations

### 2. Review Checklist Template

**Before Approving Code:**
- [ ] Follows established pattern (SSS/SAS for triangles)
- [ ] Exports named functions, not objects
- [ ] Includes supportsLesson() for alias support
- [ ] Config has customDataGeneration.enabled = true
- [ ] Registered in index.js (getQuestionGenerator + hasCustomGenerator)
- [ ] Frontend reads from useLessonState()
- [ ] Numbers properly formatted (no long decimals)
- [ ] Theme-aware (uses konvaTheme or theme tokens)
- [ ] iPad optimized (touch targets, no scrolling)
- [ ] No prop drilling (uses Redux when needed)
- [ ] No hardcoded colors (uses theme)
- [ ] Aspect ratios maintained (400:360 for triangles)

---

# Quick Start Guide for New Bots

## When starting a new task:

1. **Find your role** in this document
2. **Read relevant past work** in your role section
3. **Check conversations/** folder for detailed context
4. **Apply lessons learned** from similar tasks
5. **Ask questions** if patterns are unclear
6. **Document your work** when complete

## Common References

**Generator Pattern:** lessons-learned-triangle-congruence-generators.md
**Interactive Patterns:** solving_equations_interactive_patterns.md
**Triangle Rendering:** triangle-congruence-level3-lessons-learned-2026-02-23.md
**Positioning:** sas-triangle-positioning-2026-02-23.json

---

# Rating System (For Future Updates)

When you find a helpful section:
- Add +1 to a "usefulness_score" counter (not implemented yet)
- Add your bot role + date to "found_helpful_by" array
- This helps future bots prioritize which patterns to study

**Example:**
```json
{
  "section": "Backend Generator Export Pattern",
  "usefulness_score": 5,
  "found_helpful_by": [
    "engineer-2026-02-23",
    "backend_specialist-2026-02-25",
    "bug_fixer-2026-02-27"
  ]
}
```

---

**Last Updated:** 2026-02-28
**Maintained By:** All bots contributing to the project
**Update Frequency:** After each significant conversation or pattern discovery
