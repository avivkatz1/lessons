# AAS (Angle-Angle-Side) Congruent Triangles Lesson Plan

**Date**: February 23, 2026
**Status**: Planning
**Pattern**: Following SAS/SSS implementation with lessons learned applied

---

## Mathematical Concept

### AAS Congruence Theorem
**Definition**: Two triangles are congruent if they have two angles and a non-included side that are equal.

**Key Components**:
1. **Angle 1**: First angle measurement
2. **Angle 2**: Second angle measurement
3. **Non-included Side**: A side that is NOT between the two marked angles

### Distinction from ASA
- **ASA** (Angle-Side-Angle): The side is BETWEEN the two angles (included side)
- **AAS** (Angle-Angle-Side): The side is NOT between the two angles (non-included side)

**Important**: Both theorems prove congruence, but the position of the side differs.

---

## 5-Level Progression

### Level 1: Recognition (Binary Choice)
**Learning Objective**: Recognize when two triangles are congruent by AAS

**Interaction**: Multiple choice (Yes/No)
- Show two triangles side-by-side
- Display angle measurements and one side measurement for each
- Question: "Are these triangles congruent by AAS (Angle-Angle-Side)?"
- Choices: "Yes, they are congruent by AAS" / "No, they are not congruent"

**Data Structure**:
```javascript
{
  level: 1,
  visualData: {
    mode: 'side-by-side',
    triangleA: {
      vertices: [...],
      sides: [
        { length: 8, showLabel: true },
        { length: 10, showLabel: false },
        { length: 12, showLabel: false },
      ],
      angles: [
        { value: 50, vertex: 0, show: true, showLabel: true },
        { value: 70, vertex: 1, show: true, showLabel: true },
        { value: 60, vertex: 2, show: true, showLabel: false },
      ],
    },
    triangleB: { ...similar structure },
    choices: [
      { text: 'Yes, they are congruent by AAS', correct: true },
      { text: 'No, they are not congruent', correct: false },
    ],
  },
  hint: "For AAS, check if two angles match AND a side that is NOT between those angles matches.",
  explanation: "These triangles ARE congruent by AAS because ∠A = ∠D = 50°, ∠B = ∠E = 70°, and side BC = EF = 8 (which is NOT between angles A and B).",
}
```

**Variations**:
- Congruent by AAS (correct match of 2 angles + non-included side)
- Not congruent (angles match but wrong side)
- Not congruent (one angle different)
- Not congruent (side between the angles - that would be ASA)

---

### Level 2: Identify AAS Parts (Classification)
**Learning Objective**: Identify which specific parts form the AAS relationship

**Interaction**: Toggle classification
- Show two triangles with all measurements labeled
- Student must classify which angles and which side prove AAS congruence
- Toggle buttons: "Angle 1", "Angle 2", "The Side", "Not part of AAS"
- Must correctly identify: 2 angles + the non-included side

**Data Structure**:
```javascript
{
  level: 2,
  visualData: {
    mode: 'side-by-side',
    triangleA: { ... all angles and sides labeled },
    triangleB: { ... all angles and sides labeled },
    parts: [
      { type: 'angle', indexA: 0, indexB: 0, labelA: '∠A', labelB: '∠D', correctMatch: 1 }, // Angle 1
      { type: 'angle', indexA: 2, indexB: 2, labelA: '∠C', labelB: '∠F', correctMatch: 2 }, // Angle 2
      { type: 'side', indexA: 1, indexB: 1, labelA: 'BC', labelB: 'EF', correctMatch: 3 }, // The side (non-included)
    ],
  },
  hint: "Find two matching angles, then find a matching side that is NOT between those two angles.",
  explanation: "The AAS parts are: ∠A = ∠D, ∠C = ∠F, and side BC = EF (NOT between ∠A and ∠C).",
}
```

---

### Level 3: Find the Congruent Pair (Grid Selection)
**Learning Objective**: Apply AAS recognition to multiple triangles

**Interaction**: Grid tap selection
- 4 individual triangles in 2x2 grid
- Different orientations and rotations
- Tap to select which 2 are congruent by AAS
- Max 2 selections
- Visual feedback: green highlight on selection, shake on wrong pair

**Data Structure**:
```javascript
{
  level: 3,
  visualData: {
    mode: 'grid',
    triangles: [
      {
        vertices: [...positioned in quadrant 0],
        sides: [
          { length: 9, showLabel: true, tickMarks: 1 },
          { length: 11, showLabel: true, tickMarks: 0 },
          { length: 13, showLabel: false, tickMarks: 0 },
        ],
        angles: [
          { value: 45, vertex: 0, show: true, showLabel: false, arcMark: 1 },
          { value: 65, vertex: 1, show: true, showLabel: false, arcMark: 2 },
          { value: 70, vertex: 2, show: true, showLabel: false, arcMark: 0 },
        ],
        isCongruent: true,
      },
      // ... 3 more triangles, only 2 are congruent by AAS
    ],
    correctIndices: [0, 2], // Triangles 0 and 2 are congruent
  },
  hint: "Look for matching arc marks on two angles and a tick mark on a side that is NOT between those angles.",
  explanation: "Triangles 1 and 3 are congruent by AAS: they have matching angles (marked with arcs) and a matching side (marked with a tick) that is NOT between those two angles.",
}
```

**Congruency Markings**:
- **Arc marks**: On the 2 matching angles (1 arc and 2 arcs)
- **Tick marks**: On the non-included side (1 tick)
- **Key**: The side with the tick mark must NOT be between the two angles with arc marks

---

### Level 4: Find Missing Measurement (Answer Input)
**Learning Objective**: Use AAS congruence to find unknown measurements

**Interaction**: Type answer
- Two triangles shown side-by-side
- One measurement is missing (shown as "?")
- If triangles are congruent by AAS, find the missing value
- AnswerInput with numerical validation

**Data Structure**:
```javascript
{
  level: 4,
  visualData: {
    mode: 'side-by-side',
    triangleA: {
      sides: [
        { length: 12, showLabel: true },
        { length: 15, showLabel: true },
        { length: 18, showLabel: false },
      ],
      angles: [
        { value: 55, show: true, showLabel: true },
        { value: 75, show: true, showLabel: true },
      ],
    },
    triangleB: {
      sides: [
        { length: 12, showLabel: true },
        { length: null, showLabel: false, showQuestion: true }, // Missing
        { length: 18, showLabel: false },
      ],
      angles: [
        { value: 55, show: true, showLabel: true },
        { value: 75, show: true, showLabel: true },
      ],
    },
    hiddenValue: 15,
    hiddenType: 'side',
  },
  answer: [15],
  acceptedAnswers: ['15', '15.0'],
  hint: "These triangles are congruent by AAS. Find the corresponding side in triangle ABC.",
  explanation: "Since the triangles are congruent by AAS (angles match and the non-included sides match), all corresponding sides are equal. Therefore, the missing side = 15.",
}
```

**Variations**:
- Missing side (non-included)
- Missing angle
- Different orientations

---

### Level 5: Word Problems (Multiple Choice)
**Learning Objective**: Apply AAS congruence to real-world scenarios

**Interaction**: Multiple choice
- Real-world problem scenarios
- Architecture, engineering, design contexts
- Multiple choice answers (3-4 options)

**Data Structure**:
```javascript
{
  level: 5,
  visualData: {
    mode: 'word-problem',
    problem: "Two triangular roof trusses are being installed. Truss A has angles of 40° and 60°, with a beam of 8 feet connecting the base. Truss B has angles of 40° and 60°, with a beam of 8 feet also connecting the base. Are the trusses congruent by AAS?",
    choices: [
      { text: 'Yes, they are congruent by AAS', correct: true },
      { text: 'No, we need the included side', correct: false },
      { text: 'No, we need all three sides', correct: false },
      { text: 'No, we need all three angles', correct: false },
    ],
  },
  hint: "Check if the given side is between the two angles (ASA) or not between them (AAS).",
  explanation: "Yes! The trusses are congruent by AAS because they have two matching angles (40° and 60°) and a matching side (8 feet) that is NOT between those angles.",
}
```

**Problem Contexts**:
1. **Architecture**: Roof trusses, support beams
2. **Engineering**: Bridge supports, frame structures
3. **Design**: Pattern matching, tile layouts
4. **Navigation**: Triangulation, surveying
5. **Art**: Geometric patterns, symmetry

---

## Congruency Markings System

### For AAS Triangles

**Arc Marks** (on angles):
- First matching angle: 1 arc
- Second matching angle: 2 arcs
- Third angle (derived): 0 arcs (not marked)

**Tick Marks** (on sides):
- The non-included side: 1 tick mark
- Other sides: 0 tick marks

**Critical Rule**: The side with tick marks must NOT be between the two angles with arc marks.

**Example**:
```
Triangle vertices: 0, 1, 2
- Angle at vertex 0: 1 arc (first angle)
- Angle at vertex 2: 2 arcs (second angle)
- Side from vertex 1 to vertex 2: 1 tick (non-included side, NOT between vertices 0 and 2)
```

---

## Backend Implementation Details

### Constants
```javascript
const CANVAS_DESIGN_WIDTH = 400;
const CANVAS_DESIGN_HEIGHT = 360;
const MIN_TOP_MARGIN = 40;
const MIN_HORIZONTAL_GAP = 50;
const TRIANGLE_PADDING = 30;
const ANNOTATION_BUFFER = 35;
```

### Helper Functions (Reuse from SAS/SSS)
1. `getTriangleBounds(vertices)` - Calculate bounding box
2. `getTriangleBoundsWithAnnotations(vertices)` - Include label space
3. `positionTrianglesSideBySide(verticesA, verticesB)` - Side-by-side layout
4. `positionTrianglesGrid(trianglesData)` - 2x2 grid layout

### Triangle Generation
```javascript
function generateAASTriangle(angle1, angle2, nonIncludedSide, orientation = 'bottom-left') {
  // Calculate third angle (angles sum to 180°)
  const angle3 = 180 - angle1 - angle2;

  // Use law of sines to calculate other sides
  // ...

  // Generate vertices with rotation
  const vertices = generateTriangleVertices(sideA, sideB, sideC, baseLength, rotation);

  return vertices;
}
```

### Validation
```javascript
function isValidAAS(triangleA, triangleB, angle1Idx, angle2Idx, sideIdx) {
  // Check angles match
  const anglesMatch =
    Math.abs(triangleA.angles[angle1Idx] - triangleB.angles[angle1Idx]) < 0.1 &&
    Math.abs(triangleA.angles[angle2Idx] - triangleB.angles[angle2Idx]) < 0.1;

  // Check side matches
  const sideMatches = Math.abs(triangleA.sides[sideIdx] - triangleB.sides[sideIdx]) < 0.1;

  // Check that the side is NOT between the two angles (non-included)
  const isNonIncluded = sideIdx !== angle1Idx && sideIdx !== angle2Idx;

  return anglesMatch && sideMatches && isNonIncluded;
}
```

---

## Frontend Implementation Details

### Component Structure
```javascript
function AASCongruentTrianglesLesson({ triggerNewProblem }) {
  // State management (same as SAS/SSS)
  const { lessonProps, questionAnswerArray, currentQuestionIndex } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [phase, setPhase] = useState('interact');
  const [selectedTriangles, setSelectedTriangles] = useState([]); // L3
  const [selectedChoice, setSelectedChoice] = useState(null); // L1, L5
  const [classifications, setClassifications] = useState({}); // L2

  // Canvas sizing (maintain 400:360 aspect ratio for grid mode)
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(width - 40, 500);
    if (width <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [width]);

  const canvasHeight = useMemo(() => {
    const designHeight = 360;
    const designWidth = 400;
    const scale = canvasWidth / designWidth;
    return mode === 'grid' ? designHeight * scale : Math.min(designHeight * scale, 450);
  }, [canvasWidth, mode]);

  // Render levels...
}
```

### TriangleDiagram Component
```javascript
function TriangleDiagram({ triangle, konvaTheme, offsetX, offsetY }) {
  // Render triangle outline, vertices, sides, angles
  // CRITICAL: Use angle.vertex property for angle positioning

  {angles && angles.map((angle, i) => {
    const vertexIndex = angle.vertex !== undefined ? angle.vertex : i;
    const vertex = vertices[vertexIndex];
    const v1 = vertices[(vertexIndex - 1 + vertices.length) % vertices.length];
    const v2 = vertices[(vertexIndex + 1) % vertices.length];

    // Render angle arc and arc marks
    // Render tick marks on sides
  })}
}
```

---

## Testing Checklist

### Functional Tests
- [ ] L1: Binary choice works, shake animation on wrong answer
- [ ] L2: Classification toggles work, validates all parts correctly
- [ ] L3: Grid selection allows 2 selections max, validates correct pair
- [ ] L4: Answer input validates numerical values
- [ ] L5: Multiple choice shows correct feedback

### Visual Tests
- [ ] Congruent triangles show matching arc marks (1 arc, 2 arcs)
- [ ] Non-included side shows tick mark
- [ ] Arc marks appear at correct vertices (using angle.vertex property)
- [ ] Triangles positioned correctly in grid cells
- [ ] No scrolling on iPad (all levels fit on screen)

### Congruency Validation
- [ ] Arc marks are on exactly 2 angles
- [ ] Tick mark is on the side NOT between the marked angles
- [ ] For congruent triangles: arc patterns match (1→1, 2→2)
- [ ] For congruent triangles: tick marks match
- [ ] For non-congruent triangles: no markings

### Edge Cases
- [ ] Different orientations (8 orientations tested)
- [ ] Decimal values handled correctly
- [ ] Very small/large triangles scale appropriately
- [ ] Extreme angles (near 0° or 180°) handled

---

## Common Pitfalls to Avoid

Based on SAS/SSS lessons learned:

1. ✅ **Use `angle.vertex` property** - Not array index
2. ✅ **Set `show: true` on all angles** - Otherwise they won't render
3. ✅ **Use `angle.value`** - Not `angle.measure`
4. ✅ **Maintain 400:360 aspect ratio** - For grid mode canvas
5. ✅ **No height cap for grid mode** - Allows proper scaling
6. ✅ **Tick mark on NON-included side** - Critical for AAS vs ASA distinction
7. ✅ **Backend restart required** - After backend changes
8. ✅ **Hard refresh browser** - To clear cached `questionAnswerArray`

---

## Success Criteria

### Educational Goals
- Students understand AAS congruence theorem
- Students can distinguish AAS from ASA
- Students can identify which parts prove AAS congruence
- Students can apply AAS to real-world problems

### Technical Goals
- Follows LESSON_STYLE_GUIDE.md patterns
- iPad optimized (no scrolling required)
- Dark mode compatible
- Responsive canvas sizing
- Proper congruency markings
- Clean, maintainable code

---

## Files to Create

1. **Backend**:
   - `/backend/aqueous-eyrie-54478/services/lessonProcessors/questions/aasCongruentTrianglesGenerator.js`
   - `/backend/aqueous-eyrie-54478/config/lessonConfigs/aas_congruent_triangles.config.js`

2. **Frontend**:
   - `/frontends/lessons/src/features/lessons/lessonTypes/geometry/AASCongruentTrianglesLesson.jsx`

3. **Configuration**:
   - Update `/backend/aqueous-eyrie-54478/services/lessonProcessors/index.js`
   - Update `/backend/aqueous-eyrie-54478/config/lessonConfigs/index.js`
   - Update `/frontends/lessons/src/features/lessons/DataLesson.js`
   - Update `/frontends/lessons/src/features/lessons/lessonTypes/geometry/index.js`
   - Update `/backend/aqueous-eyrie-54478/data/helperFunctions/getLessonDataInitial.js`

---

## Timeline Estimate

- Planning: 30 minutes ✓ (This document)
- Backend implementation: 1.5 hours
- Frontend implementation: 2 hours
- Testing and refinement: 1 hour
- **Total**: ~5 hours

---

## Next Steps

1. ✅ Complete this planning document
2. ⏳ Implement backend generator
3. ⏳ Create backend config
4. ⏳ Implement frontend component
5. ⏳ Register in system
6. ⏳ Test thoroughly
7. ⏳ Document in active.json

---

**Status**: Planning complete, ready for implementation
