# Level 3 Validation Fix - Test Documentation

**Date:** February 28, 2026
**Issue:** Validation mismatch between display feedback and problem advancement
**Fix:** Removed `Math.abs()` from validation logic to use signed values

---

## The Bug

When the correct answer was `rise=-1, run=2`:

- **Entering rise='1', run='2'** (WRONG):
  - Display showed: ✓ "Correct! Rise = -1, Run = 2"
  - Problem behavior: Did NOT advance ❌

- **Entering rise='-1', run='2'** (CORRECT):
  - Display showed: ✗ "Not quite. Try again!"
  - Problem behavior: DID advance ✓

**Root Cause:** Two validation points with inconsistent logic:
1. Display validation (lines 439-441): Used `Math.abs(rise)` and `Math.abs(run)`
2. Submit handler (lines 296-297): Used signed `rise` and `run`

---

## The Fix

**File:** `GraphingLinesLesson.jsx`

### Before (WRONG):
```javascript
// Lines 439-441
const riseCorrect = parseInt(riseInput) === Math.abs(rise);
const runCorrect = parseInt(runInput) === Math.abs(run);
const level3Correct = riseCorrect && runCorrect;
```

### After (CORRECT):
```javascript
// Lines 439-441
const riseCorrect = parseInt(riseInput) === rise;
const runCorrect = parseInt(runInput) === run;
const level3Correct = riseCorrect && runCorrect;
```

**Submit handler (already correct):**
```javascript
// Lines 296-297
const riseCorrect = parseInt(riseInput) === rise;
const runCorrect = parseInt(runInput) === run;
```

---

## Test Cases

### Test Case 1: Negative Rise
**Backend data:** `rise=-2, run=4, yIntercept=4`
**Expected answer:** `-2/4`

| Student Input | riseCorrect | runCorrect | Display Feedback | Advances? |
|---------------|-------------|------------|------------------|-----------|
| rise='2', run='4' | `parseInt('2') === -2` → false | `parseInt('4') === 4` → true | ✗ "Not quite. Try again!" | NO ✓ |
| rise='-2', run='4' | `parseInt('-2') === -2` → true | `parseInt('4') === 4` → true | ✓ "Correct! Rise = -2, Run = 4" | YES ✓ |

### Test Case 2: Negative Rise with Negative Y-Intercept
**Backend data:** `rise=-1, run=1, yIntercept=-3`
**Expected answer:** `-1/1`

| Student Input | riseCorrect | runCorrect | Display Feedback | Advances? |
|---------------|-------------|------------|------------------|-----------|
| rise='1', run='1' | `parseInt('1') === -1` → false | `parseInt('1') === 1` → true | ✗ "Not quite. Try again!" | NO ✓ |
| rise='-1', run='1' | `parseInt('-1') === -1` → true | `parseInt('1') === 1` → true | ✓ "Correct! Rise = -1, Run = 1" | YES ✓ |

### Test Case 3: Positive Rise (Control)
**Backend data:** `rise=1, run=3, yIntercept=4`
**Expected answer:** `1/3`

| Student Input | riseCorrect | runCorrect | Display Feedback | Advances? |
|---------------|-------------|------------|------------------|-----------|
| rise='1', run='3' | `parseInt('1') === 1` → true | `parseInt('3') === 3` → true | ✓ "Correct! Rise = 1, Run = 3" | YES ✓ |
| rise='2', run='3' | `parseInt('2') === 1` → false | `parseInt('3') === 3` → true | ✗ "Not quite. Try again!" | NO ✓ |

### Test Case 4: Fractional Negative Slope
**Backend data:** `rise=-1, run=4, yIntercept=1`
**Expected answer:** `-1/4`

| Student Input | riseCorrect | runCorrect | Display Feedback | Advances? |
|---------------|-------------|------------|------------------|-----------|
| rise='1', run='4' | `parseInt('1') === -1` → false | `parseInt('4') === 4` → true | ✗ "Not quite. Try again!" | NO ✓ |
| rise='-1', run='4' | `parseInt('-1') === -1` → true | `parseInt('4') === 4` → true | ✓ "Correct! Rise = -1, Run = 4" | YES ✓ |

---

## Backend Verification

Generated 10 sample Level 3 problems - confirmed negative slopes are being generated:

```
Problem 1: rise=1, run=3, yIntercept=4, Answer: 1/3
Problem 2: rise=1, run=1, yIntercept=-3, Answer: 1/1
Problem 3: rise=-2, run=4, yIntercept=4, Answer: -2/4 ✓ NEGATIVE
Problem 4: rise=-2, run=1, yIntercept=3, Answer: -2/1 ✓ NEGATIVE
Problem 5: rise=1, run=3, yIntercept=-2, Answer: 1/3
Problem 6: rise=-2, run=1, yIntercept=-3, Answer: -2/1 ✓ NEGATIVE
Problem 7: rise=-1, run=4, yIntercept=1, Answer: -1/4 ✓ NEGATIVE
Problem 8: rise=1, run=2, yIntercept=4, Answer: 1/2
Problem 9: rise=3, run=4, yIntercept=-3, Answer: 3/4
Problem 10: rise=1, run=3, yIntercept=3, Answer: 1/3
```

**Result:** Backend is correctly generating signed values for rise (negative for downward slopes).

---

## Expected Behavior After Fix

1. **Students must enter signed values** (e.g., `-3` for negative rise)
2. **Display feedback matches actual correctness:**
   - Correct input → Shows "✓ Correct!" AND advances
   - Wrong input → Shows "✗ Not quite!" AND does NOT advance
3. **Both validation points use identical logic** (no Math.abs())

---

## Files Modified

1. **GraphingLinesLesson.jsx** (lines 439-441)
   - Changed from: `parseInt(riseInput) === Math.abs(rise)`
   - Changed to: `parseInt(riseInput) === rise`

2. **graphingLinesGenerator.js** (already correct)
   - Level 3 answer format uses signed values: `answer = [\`${rise}/${run}\`]`
   - Explanation uses signed values: `The rise is ${rise}...`

---

## Manual Testing Checklist

- [ ] Load GraphingLines lesson, Level 3
- [ ] Get a problem with negative rise (e.g., downward sloping line)
- [ ] Enter unsigned value (e.g., rise='2' when correct is '-2')
  - [ ] Verify display shows "Not quite. Try again!"
  - [ ] Verify problem does NOT advance
- [ ] Enter correct signed value (e.g., rise='-2')
  - [ ] Verify display shows "Correct! Rise = -2, Run = X"
  - [ ] Verify problem advances after 1 second
- [ ] Test positive rise (control case)
  - [ ] Verify entering correct positive value works
  - [ ] Verify entering wrong positive value shows error

---

## Status

✅ **Fix Applied:** Lines 439-441 updated to use signed values
✅ **Backend Verified:** Generates negative slopes correctly
✅ **Logic Consistent:** Display validation and submit validation now match
⏳ **Manual Testing:** Ready for user to test in browser

---

## Additional Notes

- Students are expected to understand that negative slope means negative rise
- The SlimMathKeypad includes a "±" button for entering negative values
- The visual grid shows rise/run arrows to help students understand direction
- Level 2 teaches slope sign (positive/negative/zero/undefined) before Level 3
