# GraphingLines Lesson - Data Variety Plan

**Version:** 2.0
**Date:** February 28, 2026
**Purpose:** Ensure proper mix of problem types for educational value and prevent pattern recognition

---

## Overview

This document specifies the exact distribution of problem types for Levels 1-2 to ensure students encounter all variations within every 6-problem set.

---

## Level 1: Y-Intercept Sign

### Educational Goal
Students identify whether the y-intercept is positive, negative, or zero by visually inspecting where the line crosses the y-axis.

### Problem Requirements

**CRITICAL**: Level 1 problems should include lines with **varied slopes** (positive, negative, zero) AND varied y-intercepts. This prevents students from just looking at slope direction.

### Distribution Strategy (Per 6 Problems)

**IMPORTANT**: Level 1 focuses on y-intercept identification but uses varied slopes to prevent pattern recognition.

| Slope Type | Count (per 6 problems) | Y-Intercept Variety |
|------------|------------------------|---------------------|
| **Positive slope** | 3 problems | Mix of positive, negative, zero y-intercepts |
| **Negative slope** | 2 problems | Mix of positive, negative y-intercepts |
| **Zero slope (horizontal)** | 1 problem | Positive or negative y-intercept |

### Detailed Breakdown

#### Per 6-Problem Set:
1. **Problem 1**: Positive slope, positive y-intercept (e.g., y = 2x + 3)
2. **Problem 2**: Positive slope, negative y-intercept (e.g., y = x - 2)
3. **Problem 3**: Positive slope, zero y-intercept (e.g., y = 3x, through origin)
4. **Problem 4**: Negative slope, positive y-intercept (e.g., y = -x + 4)
5. **Problem 5**: Negative slope, negative y-intercept (e.g., y = -2x - 1)
6. **Problem 6**: Zero slope (horizontal), positive or negative y-intercept (e.g., y = 3 or y = -2)

**Key Points**:
- 3 positive slopes cover all y-intercept types (positive, negative, zero)
- 2 negative slopes cover positive and negative y-intercepts
- 1 zero slope (horizontal line) varies between above/below x-axis
- Shuffle order to prevent predictable patterns

### Example 6-Problem Set (Level 1)

```javascript
[
  { rise: 2, run: 1, yIntercept: 3 },    // Positive slope, positive y-int
  { rise: 1, run: 2, yIntercept: -2 },   // Positive slope, negative y-int
  { rise: 3, run: 1, yIntercept: 0 },    // Positive slope, zero y-int

  { rise: -1, run: 1, yIntercept: 4 },   // Negative slope, positive y-int
  { rise: -2, run: 1, yIntercept: -1 },  // Negative slope, negative y-int

  { rise: 0, run: 1, yIntercept: 3 },    // Zero slope, positive y-int
]
```

### Constraints

**Y-Intercept Range**: -8 to +8 (must be visible on 20×20 grid with origin at (10,10))
**Slope Range**: -3 to +3 (avoid extremely steep lines)
**Rise/Run Values**: Integers between -6 and +6
**Grid Visibility**: Line must cross visible portion of grid

### Randomization Strategy

**DO**:
- ✅ Shuffle order to prevent predictable patterns
- ✅ Vary steepness (gentle slopes like 1/3, steep slopes like 3/1)
- ✅ Mix integer and fractional slopes
- ✅ Include both upward and downward slanting lines
- ✅ Ensure all 3 y-intercept types (positive, negative, zero) appear across positive slopes

**DON'T**:
- ❌ Put all positive slopes first (shuffle the order)
- ❌ Only use positive slopes with positive y-intercepts
- ❌ Repeat exact same line parameters in a 6-problem set

---

## Level 2: Slope Sign

### Educational Goal
Students identify slope type (positive, negative, zero, undefined) by observing rise/run direction.

### Problem Requirements

All slope types (positive, negative, zero) must appear in every 6-problem set. Undefined slope should appear occasionally.

### Distribution Strategy (Per 6 Problems)

| Slope Type | Count (per 6 problems) | Y-Intercept Variety |
|------------|------------------------|---------------------|
| **Positive slope** | 3 problems | Mix of positive, negative, zero y-intercepts |
| **Negative slope** | 2 problems | Mix of positive, negative y-intercepts |
| **Zero slope (horizontal)** | 1 problem | Positive or negative y-intercept |
| **Undefined slope (vertical)** | Occasional (every few sets) | N/A (no y-intercept) |

### Detailed Breakdown

#### Per 6-Problem Set (Standard):
1. **Problem 1**: Positive slope, varied y-intercept (e.g., rise=2, run=1, yInt=3)
2. **Problem 2**: Positive slope, varied y-intercept (e.g., rise=1, run=2, yInt=-2)
3. **Problem 3**: Positive slope, varied y-intercept (e.g., rise=3, run=1, yInt=0)
4. **Problem 4**: Negative slope, positive y-intercept (e.g., rise=-1, run=1, yInt=4)
5. **Problem 5**: Negative slope, negative y-intercept (e.g., rise=-2, run=1, yInt=-1)
6. **Problem 6**: Zero slope (horizontal), positive or negative y-int (e.g., rise=0, run=1, yInt=3)

#### Occasional Vertical Line (Undefined Slope):
- Every 2-3 sets, replace one positive or negative slope problem with a vertical line
- **Example**: { rise: 1, run: 0, xIntercept: 3 } (vertical line at x=3)

### Example 6-Problem Set (Level 2)

```javascript
[
  { rise: 2, run: 1, yIntercept: 3 },    // Positive slope
  { rise: 1, run: 2, yIntercept: -2 },   // Positive slope (gentle)
  { rise: 3, run: 1, yIntercept: 0 },    // Positive slope (steep)

  { rise: -1, run: 1, yIntercept: 4 },   // Negative slope
  { rise: -2, run: 1, yIntercept: -1 },  // Negative slope (steep)

  { rise: 0, run: 1, yIntercept: -3 },   // Zero slope (horizontal below x-axis)
]
```

### Example with Undefined Slope

```javascript
[
  { rise: 2, run: 1, yIntercept: 2 },    // Positive slope
  { rise: 1, run: 2, yIntercept: -1 },   // Positive slope

  { rise: -1, run: 1, yIntercept: 3 },   // Negative slope
  { rise: -3, run: 1, yIntercept: -2 },  // Negative slope

  { rise: 0, run: 1, yIntercept: 4 },    // Zero slope

  { rise: 1, run: 0, xIntercept: 2 },    // Undefined slope (vertical line)
]
```

### Special Case: Vertical Lines (Undefined Slope)

**Backend Data Structure**:
```javascript
{
  level: 2,
  rise: 1,  // Any non-zero value (not used for rendering)
  run: 0,   // ZERO indicates vertical line
  yIntercept: null,  // Not applicable
  xIntercept: 2,  // X-value where line passes through
  mode: "identify"
}
```

**Frontend Rendering**:
- Detect `run === 0` → Draw vertical line at `xIntercept`
- Vertical line: `x = xIntercept` (constant x-value)
- Draw from top to bottom of grid

### Constraints

**Positive/Negative Slopes**:
- Rise: -6 to +6 (excluding 0)
- Run: 1 to 6 (excluding 0)
- Y-Intercept: -8 to +8

**Zero Slope (Horizontal)**:
- Rise: 0
- Run: Any positive integer (typically 1)
- Y-Intercept: -8 to +8 (must be visible)

**Undefined Slope (Vertical)**:
- Rise: Any non-zero integer (typically 1)
- Run: 0
- X-Intercept: -8 to +8 (must be visible)

### Randomization Strategy

**DO**:
- ✅ Shuffle order (don't group by slope type)
- ✅ Vary steepness within positive/negative slopes
- ✅ Mix y-intercept signs for each slope type
- ✅ Include at least one "through origin" line (yInt=0) in positive slopes
- ✅ Introduce undefined slope occasionally for variety

**DON'T**:
- ❌ Put all positive slopes together
- ❌ Always use same y-intercept for zero slopes
- ❌ Make undefined slope too common (overwhelming for students)

---

## Implementation Checklist

### Backend Generator Requirements

- [ ] **Level 1**: Generate problems following 3-2-1 distribution (positive/negative/zero slopes per 6 problems)
- [ ] **Level 1**: Ensure 3 positive slopes cover all y-intercept types (positive, negative, zero)
- [ ] **Level 2**: Generate problems following 3-2-1 distribution (positive/negative/zero slopes per 6 problems)
- [ ] **Level 2**: Introduce vertical lines (undefined slope) occasionally
- [ ] **Both Levels**: Shuffle problem order (don't cluster by type)
- [ ] **Both Levels**: Ensure grid visibility (clip lines to -10 to +10 range)
- [ ] **Both Levels**: Validate rise/run values produce visible lines

### Frontend Requirements

- [ ] **Level 2**: Handle `run === 0` case for vertical lines
- [ ] **Level 2**: Render vertical line using `xIntercept` value
- [ ] **Both Levels**: Display correct answer choices based on slope/intercept
- [ ] **Both Levels**: Validate modal works for all problem types

---

## Testing Protocol

### Level 1 Testing (6-Problem Set)

Run through 6 problems and tally results:

| Slope Type | Expected Count | Actual Count | ✓ |
|------------|----------------|--------------|---|
| Positive   | 3              | _____        | [ ] |
| Negative   | 2              | _____        | [ ] |
| Zero       | 1              | _____        | [ ] |

**Additional Checks**:
- [ ] Positive slopes include all y-intercept types (positive, negative, zero)
- [ ] Negative slopes have varied y-intercepts (at least one positive, one negative)
- [ ] Zero slope (horizontal line) appears above or below x-axis
- [ ] Order is shuffled (not all positive slopes first)

### Level 2 Testing (6-Problem Set)

Run through 6 problems and tally results:

| Slope Type | Expected Count | Actual Count | ✓ |
|------------|----------------|--------------|---|
| Positive   | 3              | _____        | [ ] |
| Negative   | 2              | _____        | [ ] |
| Zero       | 1              | _____        | [ ] |
| Undefined  | 0-1 (occasional) | _____      | [ ] |

**Additional Checks**:
- [ ] Positive slope problems have varied y-intercepts
- [ ] Negative slope problems have varied y-intercepts
- [ ] Zero slope includes both above and below x-axis across multiple sets
- [ ] Undefined slope (vertical) renders correctly when present
- [ ] Undefined slope appears at different x-values

---

## Edge Cases to Handle

### Level 1
1. **Zero y-intercept + zero slope**: INVALID (line would be x-axis, invisible)
2. **Very steep slopes**: Limit to ±3 to avoid clipping issues
3. **Off-grid intercepts**: Validate -8 ≤ yIntercept ≤ 8

### Level 2
1. **Vertical line at origin (x=0)**: VALID, falls on y-axis
2. **Horizontal line at origin (y=0)**: VALID, falls on x-axis
3. **run=0 without xIntercept**: INVALID, backend must provide xIntercept

---

## Success Criteria

✅ **Educational Value**: Students see all variations within 6 problems
✅ **No Pattern Recognition**: Shuffled order prevents memorization
✅ **Complete Coverage**: 3-2-1 slope distribution consistently applied
✅ **Grid Visibility**: All lines visible on standard 20×20 grid
✅ **Edge Cases Handled**: Vertical/horizontal lines render correctly

---

## Backend Implementation Example

```javascript
function generateLevel1ProblemSet() {
  const problems = [];

  // 3 positive slopes (cover all y-intercept types)
  problems.push(
    { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(1, 8) },  // Positive y-int
    { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: -randInt(1, 8) }, // Negative y-int
    { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: 0 }                // Zero y-int
  );

  // 2 negative slopes (varied y-intercepts)
  problems.push(
    { rise: -randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(1, 8) },  // Positive y-int
    { rise: -randInt(1, 3), run: randInt(1, 3), yIntercept: -randInt(1, 8) }  // Negative y-int
  );

  // 1 zero slope (horizontal)
  problems.push(
    { rise: 0, run: 1, yIntercept: Math.random() > 0.5 ? randInt(1, 8) : -randInt(1, 8) }
  );

  // Shuffle to prevent pattern
  return shuffle(problems);
}

function generateLevel2ProblemSet() {
  const problems = [];
  const includeUndefined = Math.random() < 0.3; // 30% chance of vertical line

  if (includeUndefined) {
    // 2 positive slopes
    problems.push(
      { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) },
      { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) }
    );

    // 2 negative slopes
    problems.push(
      { rise: -randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) },
      { rise: -randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) }
    );

    // 1 zero slope
    problems.push(
      { rise: 0, run: 1, yIntercept: Math.random() > 0.5 ? randInt(1, 8) : -randInt(1, 8) }
    );

    // 1 undefined slope
    problems.push(
      { rise: 1, run: 0, xIntercept: Math.random() > 0.5 ? randInt(1, 8) : -randInt(1, 8) }
    );
  } else {
    // Standard 3-2-1 distribution
    // 3 positive slopes
    problems.push(
      { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) },
      { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) },
      { rise: randInt(1, 3), run: randInt(1, 3), yIntercept: 0 }
    );

    // 2 negative slopes
    problems.push(
      { rise: -randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) },
      { rise: -randInt(1, 3), run: randInt(1, 3), yIntercept: randInt(-5, 5) }
    );

    // 1 zero slope
    problems.push(
      { rise: 0, run: 1, yIntercept: Math.random() > 0.5 ? randInt(1, 8) : -randInt(1, 8) }
    );
  }

  return shuffle(problems);
}
```

---

## Summary

This plan ensures that every 6-problem set provides:
- **3-2-1 distribution**: 3 positive slope, 2 negative slope, 1 zero slope
- **Complete coverage** of all slope and intercept types
- **Educational variety** to prevent pattern recognition
- **Balanced distribution** for effective learning
- **Proper edge case handling** (vertical/horizontal lines)

Students will encounter all variations within a single practice session, ensuring comprehensive understanding of slope and y-intercept concepts.
