# More Tangent - Backend Data Guide

## Lesson Overview
**Lesson Name:** `more_tangent`
**Levels:** 5
**Focus:** Advanced tangent problems with rotated/flipped triangles to build spatial reasoning

## Level Progression

### Level 1: Identify Sides (With Color Hints)
**Goal:** Identify opposite and adjacent sides in rotated triangles
**Visual:** Colored sides (red=opposite, blue=adjacent)
**Answer Type:** Text (side names)

### Level 2: Calculate Tangent (No Color Hints)
**Goal:** Calculate tangent value for rotated triangles
**Visual:** Labeled sides but no color coding
**Answer Type:** Numeric

### Level 3: Find Missing Side (Basic)
**Goal:** Find opposite or adjacent side given angle and one side
**Visual:** Triangle with one unknown side
**Answer Type:** Numeric

### Level 4: Find Missing Side (Challenging)
**Goal:** More complex orientations and values
**Visual:** Various orientations
**Answer Type:** Numeric

### Level 5: Find Angle (Inverse Tangent)
**Goal:** Find angle given two sides
**Visual:** Triangle with labeled sides
**Answer Type:** Numeric (degrees)

---

## Triangle Orientations

The component supports 8 different orientations:

1. **`bottom-left`** - Angle at bottom-left corner, opens upward-right
2. **`bottom-right`** - Angle at bottom-right corner, opens upward-left
3. **`top-left`** - Angle at top-left corner, opens downward-right
4. **`top-right`** - Angle at top-right corner, opens downward-left
5. **`left-bottom`** - Angle at left-bottom corner, opens rightward-upward
6. **`left-top`** - Angle at left-top corner, opens rightward-downward
7. **`right-bottom`** - Angle at right-bottom corner, opens leftward-upward
8. **`right-top`** - Angle at right-top corner, opens leftward-downward

**Best Practice:** Vary orientations across problems to challenge spatial reasoning.

---

## Backend Response Structure

### Level 1 Example (Identify Sides - With Colors)

```json
{
  "levelNum": 1,
  "question": [
    {
      "text": "Look at the rotated triangle. Which side is the OPPOSITE side to the marked angle?"
    }
  ],
  "answer": ["opposite", "opp", "red"],
  "acceptedAnswers": ["opposite", "opp", "red", "vertical"],
  "visualData": {
    "orientation": "top-right",
    "angle": {
      "position": "marked",
      "value": 42,
      "showValue": true,
      "label": "42°"
    },
    "sides": {
      "opposite": {
        "length": 12,
        "color": "#EF4444",
        "label": "Opposite",
        "showLabel": false,
        "showLength": false
      },
      "adjacent": {
        "length": 10,
        "color": "#3B82F6",
        "label": "Adjacent",
        "showLabel": false,
        "showLength": false
      },
      "hypotenuse": {
        "length": 15.62,
        "color": "#9CA3AF",
        "label": "Hypotenuse",
        "showLabel": false,
        "showLength": false
      }
    },
    "rightAngle": true
  },
  "hint": "Remember: the opposite side is across from the angle, the adjacent side touches the angle.",
  "explanation": "The opposite side is the one directly across from the marked angle. Even when the triangle is rotated, this relationship stays the same."
}
```

### Level 2 Example (Calculate Tangent - No Colors)

```json
{
  "levelNum": 2,
  "question": [
    {
      "text": "Calculate tan(θ) for the marked angle in this rotated triangle."
    }
  ],
  "answer": ["0.75"],
  "acceptedAnswers": ["0.75", "0.750", ".75", "3/4"],
  "visualData": {
    "orientation": "left-bottom",
    "angle": {
      "position": "marked",
      "value": 37,
      "showValue": true,
      "label": "θ"
    },
    "sides": {
      "opposite": {
        "length": 6,
        "color": "#666",
        "label": "Opposite",
        "showLabel": true,
        "showLength": true
      },
      "adjacent": {
        "length": 8,
        "color": "#666",
        "label": "Adjacent",
        "showLabel": true,
        "showLength": true
      },
      "hypotenuse": {
        "length": 10,
        "color": "#9CA3AF",
        "label": "Hypotenuse",
        "showLabel": false,
        "showLength": false
      }
    },
    "rightAngle": true
  },
  "hint": "tan(θ) = opposite / adjacent",
  "explanation": "For this triangle, tan(θ) = 6 / 8 = 0.75. The orientation doesn't change the tangent ratio!",
  "calculation": {
    "formula": "tan(θ) = opposite / adjacent",
    "substitution": "tan(37°) = 6 / 8",
    "result": "0.75"
  }
}
```

### Level 3 Example (Find Missing Side - Basic)

```json
{
  "levelNum": 3,
  "question": [
    {
      "text": "Find the length of the opposite side. Round to 1 decimal place."
    }
  ],
  "answer": ["8.4"],
  "acceptedAnswers": ["8.4", "8.39", "8.390"],
  "visualData": {
    "orientation": "bottom-right",
    "angle": {
      "position": "marked",
      "value": 48,
      "showValue": true,
      "label": "48°"
    },
    "sides": {
      "opposite": {
        "length": null,
        "color": "#666",
        "label": "?",
        "showLabel": true,
        "showLength": false
      },
      "adjacent": {
        "length": 7.5,
        "color": "#666",
        "label": "",
        "showLabel": false,
        "showLength": true
      },
      "hypotenuse": {
        "length": 11.11,
        "color": "#9CA3AF",
        "label": "",
        "showLabel": false,
        "showLength": false
      }
    },
    "rightAngle": true
  },
  "hint": "Use tan(48°) = opposite / adjacent. You know adjacent = 7.5.",
  "explanation": "tan(48°) ≈ 1.1106. So opposite = 1.1106 × 7.5 ≈ 8.4",
  "calculation": {
    "formula": "tan(θ) = opposite / adjacent → opposite = adjacent × tan(θ)",
    "substitution": "opposite = 7.5 × tan(48°) = 7.5 × 1.1106",
    "result": "8.4"
  }
}
```

### Level 4 Example (Find Missing Side - Challenging)

```json
{
  "levelNum": 4,
  "question": [
    {
      "text": "Find the length of the adjacent side. Round to 2 decimal places."
    }
  ],
  "answer": ["13.74"],
  "acceptedAnswers": ["13.74", "13.740"],
  "visualData": {
    "orientation": "right-top",
    "angle": {
      "position": "marked",
      "value": 52,
      "showValue": true,
      "label": "52°"
    },
    "sides": {
      "opposite": {
        "length": 17.6,
        "color": "#666",
        "label": "",
        "showLabel": false,
        "showLength": true
      },
      "adjacent": {
        "length": null,
        "color": "#666",
        "label": "?",
        "showLabel": true,
        "showLength": false
      },
      "hypotenuse": {
        "length": 22.36,
        "color": "#9CA3AF",
        "label": "",
        "showLabel": false,
        "showLength": false
      }
    },
    "rightAngle": true
  },
  "hint": "Use tan(52°) = opposite / adjacent. Rearrange to solve for adjacent.",
  "explanation": "tan(52°) ≈ 1.2799. So adjacent = opposite / tan(52°) = 17.6 / 1.2799 ≈ 13.74",
  "calculation": {
    "formula": "tan(θ) = opposite / adjacent → adjacent = opposite / tan(θ)",
    "substitution": "adjacent = 17.6 / tan(52°) = 17.6 / 1.2799",
    "result": "13.74"
  }
}
```

### Level 5 Example (Find Angle - Inverse Tangent)

```json
{
  "levelNum": 5,
  "question": [
    {
      "text": "Find the measure of angle θ using inverse tangent. Round to the nearest degree."
    }
  ],
  "answer": ["34"],
  "acceptedAnswers": ["34", "34°"],
  "visualData": {
    "orientation": "top-left",
    "angle": {
      "position": "marked",
      "value": null,
      "showValue": false,
      "label": "θ"
    },
    "sides": {
      "opposite": {
        "length": 8.5,
        "color": "#666",
        "label": "",
        "showLabel": false,
        "showLength": true
      },
      "adjacent": {
        "length": 12.6,
        "color": "#666",
        "label": "",
        "showLabel": false,
        "showLength": true
      },
      "hypotenuse": {
        "length": 15.19,
        "color": "#9CA3AF",
        "label": "",
        "showLabel": false,
        "showLength": false
      }
    },
    "rightAngle": true
  },
  "hint": "Use tan⁻¹(opposite / adjacent) to find the angle.",
  "explanation": "θ = tan⁻¹(8.5 / 12.6) = tan⁻¹(0.6746) ≈ 34°",
  "calculation": {
    "formula": "θ = tan⁻¹(opposite / adjacent)",
    "substitution": "θ = tan⁻¹(8.5 / 12.6) = tan⁻¹(0.6746)",
    "result": "34°"
  }
}
```

---

## Batch Mode Support

For practice mode, provide 10 problems in `questionAnswerArray`:

```json
{
  "levelNum": 2,
  "questionAnswerArray": [
    { /* problem 1 - orientation: bottom-left */ },
    { /* problem 2 - orientation: bottom-right */ },
    { /* problem 3 - orientation: top-left */ },
    { /* problem 4 - orientation: top-right */ },
    { /* problem 5 - orientation: left-bottom */ },
    { /* problem 6 - orientation: left-top */ },
    { /* problem 7 - orientation: right-bottom */ },
    { /* problem 8 - orientation: right-top */ },
    { /* problem 9 - orientation: bottom-left */ },
    { /* problem 10 - orientation: bottom-right */ }
  ]
}
```

**Best Practice:** Mix orientations within each batch for varied practice.

---

## API Endpoint

```
GET /lessons/content/more_tangent&:problemNumber&:levelNum
```

### Example Requests

- Level 1, Problem 1: `GET /lessons/content/more_tangent&1&1`
- Level 2, Problem 5: `GET /lessons/content/more_tangent&5&2`
- Level 3, Problem 1: `GET /lessons/content/more_tangent&1&3`

---

## Required vs Optional Fields

### Required Fields (All Levels)
- `levelNum`
- `question`
- `answer`
- `visualData` (for levels 1-5)
- `visualData.orientation`
- `visualData.angle`
- `visualData.sides`
- `visualData.rightAngle`

### Optional Fields
- `acceptedAnswers` (recommended for flexibility)
- `hint` (recommended for student support)
- `explanation` (recommended for learning)
- `calculation` (recommended for showing work)

---

## Testing Checklist

### Backend Testing
- [ ] All 5 levels return valid data
- [ ] At least 4 different orientations used per level
- [ ] Batch mode returns 10 problems
- [ ] Answer arrays include common variations
- [ ] Side lengths are reasonable (3-20 units)
- [ ] Angles are realistic (15°-75°)

### Frontend Testing
- [ ] All orientations render correctly
- [ ] Level 1 shows colored sides
- [ ] Levels 2-5 show gray sides
- [ ] Answer validation works for all levels
- [ ] Hints display correctly
- [ ] Explanations show after correct answer
- [ ] "Try Another" cycles problems correctly

---

## Common Issues & Solutions

### Issue: Triangle appears upside down
**Solution:** Check orientation value - use proper orientation string

### Issue: Colors not showing in Level 1
**Solution:** Ensure `levelNum === 1` and colors are set in `visualData.sides`

### Issue: Angle arc in wrong position
**Solution:** Arc rotation is calculated from orientation - verify orientation matches angle position

### Issue: Right angle square misaligned
**Solution:** Component auto-calculates position from orientation

---

## Tips for Backend Implementation

1. **Vary orientations** - Don't repeat the same orientation consecutively
2. **Reasonable values** - Keep side lengths 3-20, angles 20-70 for best visuals
3. **Multiple accepted answers** - Include decimal variations (e.g., 0.75, 0.750, .75, 3/4)
4. **Progressive difficulty** - Increase complexity within each level
5. **Clear explanations** - Show the calculation steps in the explanation field

---

**Created:** February 2026
**Related Component:** `MoreTangentLesson.jsx`
**Related Guide:** `LESSON_DEVELOPMENT_CHECKLIST.md`
