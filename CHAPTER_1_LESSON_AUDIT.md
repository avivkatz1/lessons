# Chapter 1 Lesson Audit Report
**Date:** February 16, 2026
**Purpose:** Identify broken lessons in Chapter 1 homepage

## Chapter 1 Lessons (17 total)

From `/src/features/lessons/Data.js` - Chapter 1 text array:

| # | Lesson Name (UI) | Route Generated | DataLesson.js Key | Status | Issue |
|---|------------------|-----------------|-------------------|--------|-------|
| 1 | symmetry | `/symmetry` | `symmetry` | ✅ WORKING | - |
| 2 | equations | `/equations` | `equations` | ✅ WORKING | - |
| 3 | patterns | `/patterns` | `patterns` | ✅ WORKING | - |
| 4 | angles | `/angles` | `angles` | ✅ WORKING | - |
| 5 | **sides** | `/sides` | ❌ `measuring_sides` | ❌ **BROKEN** | Route mismatch |
| 6 | shapes | `/shapes` | `shapes` | ✅ WORKING | - |
| 7 | plotting points | `/plotting_points` | `plotting_points` | ✅ WORKING | - |
| 8 | area perimeter | `/area_perimeter` | `area_perimeter` | ✅ WORKING | - |
| 9 | reflection | `/reflection` | `reflection` | ✅ WORKING | - |
| 10 | **rotation** | `/rotation` | ❌ MISSING | ❌ **BROKEN** | No entry |
| 11 | translation | `/translation` | `translation` | ✅ WORKING | Just fixed |
| 12 | parallel | `/parallel` | `parallel` | ✅ WORKING | - |
| 13 | perpendicular | `/perpendicular` | `perpendicular` | ✅ WORKING | - |
| 14 | rotational symmetry | `/rotational_symmetry` | `rotational_symmetry` | ✅ WORKING | - |
| 15 | reflection symmetry | `/reflection_symmetry` | `reflection_symmetry` | ✅ WORKING | - |
| 16 | basic probability | `/basic_probability` | `basic_probability` | ✅ WORKING | - |
| 17 | venn diagrams | `/venn_diagrams` | `venn_diagrams` | ✅ WORKING | - |

## Summary

**Working:** 15/17 (88%)
**Broken:** 2/17 (12%)

## Issues Found

### 1. "sides" → Route Mismatch ❌

**Problem:**
- User clicks "sides" in Chapter 1
- Route generated: `/chapter/one/sides`
- DataLesson.js has: `measuring_sides`
- Result: 404 or blank screen

**Fix Options:**
1. **Option A:** Change Data.js to say "measuring sides" instead of "sides"
2. **Option B:** Add alias `sides: { ... }` in DataLesson.js pointing to MeasuringSides component
3. **Option C:** Add route alias in router configuration

**Recommended:** Option B - Add alias in DataLesson.js

### 2. "rotation" → Missing Entry ❌

**Problem:**
- User clicks "rotation" in Chapter 1
- Route generated: `/chapter/one/rotation`
- DataLesson.js: No `rotation` entry exists
- Component: No `Rotation.js` component exists (only `RotationalSymmetry.js`)
- Result: 404 or blank screen

**Fix Options:**
1. **Option A:** Remove "rotation" from Chapter 1 Data.js (it's redundant with "rotational symmetry")
2. **Option B:** Create a new Rotation.js component for rotation transformations
3. **Option C:** Add alias `rotation: { ... }` pointing to an existing component

**Recommended:** Option A - Remove from Data.js (redundant) OR Option B - Create proper Rotation component if it's meant to be a transformation lesson (like translation, reflection)

## Next Steps

1. ✅ Fix "sides" lesson mapping
2. ✅ Decide on "rotation" - remove or create component
3. ✅ Test all Chapter 1 lessons to verify they load
4. ✅ Check Chapter 0 (foundational lessons) for similar issues
