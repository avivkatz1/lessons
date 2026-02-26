# Lessons Learned: Triangle Congruence Generator Patterns
**Date:** 2026-02-23
**Context:** SSS, SAS, and AAS Congruent Triangles Lessons

## Critical Requirements for New Congruent Triangle Lessons

When creating a new triangle congruence lesson (SSS, SAS, AAS, ASA, HL, etc.), follow this exact pattern to avoid common pitfalls.

---

## 1. Generator File Export Pattern

### ✅ CORRECT Pattern (SSS/SAS/AAS)

```javascript
// ==================== MAIN EXPORTS ====================

const LEVEL_GENERATORS = {
  1: generateLevel1,
  2: generateLevel2,
  3: generateLevel3,
  4: generateLevel4,
  5: generateLevel5,
};

/**
 * Main generator function - returns a SINGLE question for the given level
 * The middleware handles batching - this just returns one question
 */
export function sssCongruentTrianglesGenerator({ lessonName, level }) {
  const gen = LEVEL_GENERATORS[level];
  if (!gen) return LEVEL_GENERATORS[1]();
  return gen();
}

/**
 * Check if this generator supports a given lesson
 * MUST handle both full name AND alias
 */
export function supportsLesson(lessonName) {
  return lessonName === "sss_congruent_triangles" || lessonName === "sss";
}
```

### ❌ WRONG Pattern (AAS Initial Mistake)

```javascript
// DON'T DO THIS - Object export
function generateQuestionBatch(lessonName, level, batchSize = 10) {
  const batch = [];
  for (let i = 0; i < batchSize; i++) {
    batch.push(generator());
  }
  return batch;
}

export const aasCongruentTrianglesGenerator = { generateQuestionBatch };
```

**Why This Fails:**
- `index.js` line 390 calls `generator({ lessonName, level })` expecting a function
- Returns object `{ generateQuestionBatch }` instead of function
- Error: "generator is not a function"

---

## 2. Registration in lessonProcessors/index.js

### Step 1: Import with Named Exports

```javascript
import {
  aasCongruentTrianglesGenerator,
  supportsLesson as aasCongruentTrianglesSupportsLesson
} from "./questions/aasCongruentTrianglesGenerator.js";
```

### Step 2: Add to getQuestionGenerator Function

```javascript
export function getQuestionGenerator(lessonName) {
  // ... other checks ...

  // Check if AAS congruent triangles generator supports this lesson
  if (aasCongruentTrianglesSupportsLesson(lessonName)) {
    return aasCongruentTrianglesGenerator;
  }

  // ... more checks ...
}
```

### Step 3: Add to hasCustomGenerator Function

```javascript
export function hasCustomGenerator(lessonName) {
  return triangleInequalitySupportsLesson(lessonName) ||
         // ... other checks ...
         sssCongruentTrianglesSupportsLesson(lessonName) ||
         sasCongruentTrianglesSupportsLesson(lessonName) ||
         aasCongruentTrianglesSupportsLesson(lessonName) ||  // ← ADD THIS
         // ... more checks ...
}
```

---

## 3. Config File Pattern

### Create config file: `config/lessonConfigs/aas_congruent_triangles.config.js`

```javascript
export default {
  name: 'aas_congruent_triangles',
  displayName: 'AAS Congruent Triangles',

  pipeline: {
    // Skip standard middleware, use custom data generation
    skipSteps: [3, 5, 6, 7, 8, 9, 10, 11],

    customDataGeneration: {
      enabled: true,              // ← CRITICAL
      levels: [1, 2, 3, 4, 5],
      generator: 'aasCongruentTrianglesGenerator',
      batchSize: 10,
    }
  },

  frontend: {
    componentType: 'custom',
    levels: 5,
    components: [
      'AASCongruentTrianglesLesson',
      'AASCongruentTrianglesLesson',
      'AASCongruentTrianglesLesson',
      'AASCongruentTrianglesLesson',
      'AASCongruentTrianglesLesson',
    ]
  },

  metadata: {
    category: 'geometry',
    difficulty: 'intermediate',
    topics: ['congruence', 'triangles', 'AAS'],
    prerequisites: ['triangle_properties', 'angle_measurement', 'sas_congruent_triangles'],
  }
};
```

### Register in `config/lessonConfigs/index.js`

```javascript
// Import at top
import aasCongruentTrianglesConfig from './aas_congruent_triangles.config.js';

// Add to registry (with BOTH full name and alias)
const lessonConfigRegistry = {
  // ... other lessons ...

  aas_congruent_triangles: aasCongruentTrianglesConfig,
  aas: aasCongruentTrianglesConfig,  // ← Alias
};
```

---

## 4. Common Pitfalls and Solutions

### Pitfall #1: Config Cache Issues

**Symptom:**
```
No config found for lesson: aas, using default
[MW3.5] Custom data generation NOT enabled for aas
```

**Cause:** Backend cached default config before proper config was registered

**Solution:** Restart backend server to clear config cache

### Pitfall #2: Missing supportsLesson Function

**Symptom:**
```
Using default question generator for lesson: aas
problemTypeReturned: angles
Has visualData: false
```

**Cause:** Generator doesn't export `supportsLesson()` function to handle aliases

**Solution:** Add the function:
```javascript
export function supportsLesson(lessonName) {
  return lessonName === "aas_congruent_triangles" || lessonName === "aas";
}
```

### Pitfall #3: Wrong Export Pattern

**Symptom:**
```
TypeError: generator is not a function
    at generateQuestionBatch (index.js:390:16)
```

**Cause:** Exported object `{ generateQuestionBatch }` instead of function

**Solution:** Export function that returns single question:
```javascript
export function aasCongruentTrianglesGenerator({ lessonName, level }) {
  const gen = LEVEL_GENERATORS[level];
  if (!gen) return LEVEL_GENERATORS[1]();
  return gen();
}
```

### Pitfall #4: Frontend Not Rendering

**Symptom:** Blank screen, data loads but nothing displays

**Possible Causes:**
- Missing conditional rendering for level
- Accessing undefined properties in visualData
- Component error caught silently
- Wrong component name in getLessonDataInitial.js

**Solution:** Check browser console for React errors, verify component name matches

---

## 5. Frontend Registration Checklist

### File 1: `frontends/lessons/src/features/lessons/DataLesson.js`

```javascript
// Lazy import
const AASCongruentTrianglesLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({
    default: m.AASCongruentTrianglesLesson
  }))
);

// Add to DataLesson export (with BOTH names)
export const DataLesson = {
  // ... other lessons ...

  aas_congruent_triangles: {
    lessonImage: aas,
    LessonComponent: [
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
    ],
  },

  aas: {  // Alias
    lessonImage: aas,
    LessonComponent: [
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
      AASCongruentTrianglesLesson,
    ],
  },
};
```

### File 2: `backend/data/helperFunctions/getLessonDataInitial.js`

```javascript
const dataLesson = {
  // ... other lessons ...

  aas_congruent_triangles: {
    lessonImage: "aas",
    hints: [
      "AAS means Angle-Angle-Side: two angles and a NON-INCLUDED side must match",
      "The side is NOT between the two marked angles (that would be ASA)",
      "Look for two angles and a side that's NOT between them",
      "If AAS parts match, the triangles are congruent",
      "Use the congruent parts to find the missing measurement",
    ],
    LessonComponent: [
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
    ],
  },

  aas: {  // Alias with same data
    lessonImage: "aas",
    hints: [
      "AAS means Angle-Angle-Side: two angles and a NON-INCLUDED side must match",
      "The side is NOT between the two marked angles (that would be ASA)",
      "Look for two angles and a side that's NOT between them",
      "If AAS parts match, the triangles are congruent",
      "Use the congruent parts to find the missing measurement",
    ],
    LessonComponent: [
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
      "AASCongruentTrianglesLesson",
    ],
  },
};
```

### File 3: `frontends/lessons/src/features/lessons/lessonTypes/geometry/index.js`

```javascript
// Import
import AASCongruentTrianglesLesson from "./AASCongruentTrianglesLesson";

// Export
export {
  // ... other exports ...
  SSSCongruentTrianglesLesson,
  SASCongruentTrianglesLesson,
  AASCongruentTrianglesLesson,  // ← Add this
};
```

---

## 6. Testing Workflow

### After All Changes, Test in This Order:

1. **Restart Backend** - Clear config cache
   ```bash
   # Stop current backend
   # npm start
   ```

2. **Check Backend Logs** for:
   - ✅ "Server started on port 5001"
   - ✅ "Custom data generation ENABLED for aas"
   - ✅ "Generated data keys: 0, 1, 2, ..."
   - ❌ "Using default question generator"
   - ❌ "generator is not a function"
   - ❌ "Cannot read properties of undefined"

3. **Check Frontend** for:
   - ✅ Component renders
   - ✅ Triangles display
   - ✅ Congruency markings visible
   - ✅ No console errors
   - ❌ Blank screen
   - ❌ "Cannot read property 'map'"

4. **Test All 5 Levels**
   - Level 1: Binary choice
   - Level 2: Classification
   - Level 3: Grid selection (2x2)
   - Level 4: Input answer
   - Level 5: Word problems

---

## 7. Quick Reference Checklist

When creating a new triangle congruence lesson:

**Backend:**
- [ ] Generator exports function (not object)
- [ ] Generator exports `supportsLesson(lessonName)` function
- [ ] `supportsLesson` checks BOTH full name and alias
- [ ] Registered in `lessonProcessors/index.js` (getQuestionGenerator)
- [ ] Registered in `lessonProcessors/index.js` (hasCustomGenerator)
- [ ] Config file created with `customDataGeneration.enabled: true`
- [ ] Config registered in `lessonConfigs/index.js` (BOTH names)
- [ ] Backend restarted

**Frontend:**
- [ ] Component created (e.g., AASCongruentTrianglesLesson.jsx)
- [ ] Lazy import added to DataLesson.js
- [ ] Entry in DataLesson export (BOTH names)
- [ ] Entry in getLessonDataInitial.js (BOTH names with hints)
- [ ] Exported from geometry/index.js

**Testing:**
- [ ] Backend logs show custom generator used
- [ ] Frontend renders without errors
- [ ] All 5 levels work
- [ ] Congruency markings correct
- [ ] No scrolling on iPad

---

## 8. File Locations Reference

```
backend/aqueous-eyrie-54478/
├── services/lessonProcessors/
│   ├── index.js                           ← Register generator
│   └── questions/
│       └── aasCongruentTrianglesGenerator.js  ← Create generator
├── config/lessonConfigs/
│   ├── index.js                           ← Register config
│   └── aas_congruent_triangles.config.js  ← Create config
└── data/helperFunctions/
    └── getLessonDataInitial.js            ← Add hints

frontends/lessons/src/features/lessons/
├── DataLesson.js                          ← Lazy import + register
└── lessonTypes/geometry/
    ├── index.js                           ← Export component
    └── AASCongruentTrianglesLesson.jsx    ← Create component
```

---

## Summary: The Most Common Mistakes

1. **Exporting object instead of function** → "generator is not a function"
2. **Missing `supportsLesson` function** → Uses default generator
3. **Not checking alias in `supportsLesson`** → "aas" doesn't work, only "aas_congruent_triangles"
4. **Forgetting to restart backend** → Config cache issues
5. **Not registering in `hasCustomGenerator`** → Middleware issues
6. **Missing BOTH names in registries** → Alias doesn't work

**Golden Rule:** Follow SSS/SAS pattern EXACTLY. Don't try to be clever with different export patterns.
