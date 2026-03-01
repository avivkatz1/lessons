# Orientation Support - Quick Start Guide

**Phase 1 Status:** Foundation infrastructure available, all lessons remain portrait-optimized.

---

## TL;DR

**For new lessons in Phase 1:**
1. Continue optimizing for portrait iPad (810×1080) ✅
2. Optionally add orientation analytics ℹ️
3. Do NOT implement landscape-specific layouts yet ⛔

**Hook available:** `useOrientation()` - use for logging only, not layouts.

---

## Quick Reference

### Import the Hook

```javascript
import { useOrientation } from '../../../../hooks';
```

### Basic Usage (Logging Only - Phase 1)

```javascript
function MyLesson() {
  const { orientation, deviceType } = useOrientation();

  useEffect(() => {
    console.log('Orientation:', orientation, 'Device:', deviceType);
  }, [orientation, deviceType]);

  // Continue with existing portrait-optimized layout
  return <YourPortraitLayout />;
}
```

### Add Analytics (Optional)

```javascript
import { useOrientation } from '../../../../hooks';
import {
  logInitialOrientation,
  logOrientationChange
} from '../../../../utils/orientationAnalytics';

function MyLesson({ lessonName, level }) {
  const { orientation, deviceType } = useOrientation();

  // Log initial orientation once
  useEffect(() => {
    logInitialOrientation(lessonName, orientation, deviceType, level);
  }, []);

  // Log orientation changes
  useEffect(() => {
    logOrientationChange(lessonName, orientation, deviceType, level);
  }, [orientation, lessonName, deviceType, level]);

  // ... rest of lesson code
}
```

---

## Hook API

### `useOrientation()` Returns:

| Property | Type | Example (Portrait) | Example (Landscape) |
|----------|------|-------------------|---------------------|
| `orientation` | string | `'portrait'` | `'landscape'` |
| `isPortrait` | boolean | `true` | `false` |
| `isLandscape` | boolean | `false` | `true` |
| `width` | number | `810` | `1080` |
| `height` | number | `1080` | `810` |
| `aspectRatio` | number | `0.75` | `1.33` |
| `deviceType` | string | `'tablet'` | `'tablet'` |

### Device Type Classification

- `'mobile'` - Max dimension ≤768px
- `'tablet'` - Max dimension ≤1366px (iPad Pro 12.9")
- `'desktop'` - Max dimension >1366px

---

## What NOT to Do (Phase 1)

❌ **Don't use orientation for layouts yet:**
```javascript
// ❌ WRONG - Don't do this in Phase 1
const canvasHeight = isLandscape ? 400 : 600;
```

❌ **Don't implement landscape-specific styling:**
```javascript
// ❌ WRONG - Don't do this in Phase 1
const Wrapper = styled.div`
  ${props => props.$isLandscape && css`
    flex-direction: row;
  `}
`;
```

✅ **Continue using width-based responsive design:**
```javascript
// ✅ CORRECT - Keep doing this
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 769px) {
    padding: 16px;
  }
`;
```

---

## Testing Your Lesson

**Phase 1 Checklist:**

1. **Portrait works perfectly** (primary target)
   - [ ] iPad 10.2" portrait (810×1080)
   - [ ] All content visible without scrolling
   - [ ] Touch targets ≥56px

2. **Landscape works via width-based layout**
   - [ ] iPad 10.2" landscape (1080×810)
   - [ ] No visual regressions
   - [ ] May not be optimal, but functional

3. **Hook works (if using analytics)**
   - [ ] Orientation logged to console (dev mode)
   - [ ] No errors on rotation
   - [ ] Analytics events sent (if gtag available)

---

## Common Questions

**Q: My lesson looks bad in landscape. Should I fix it?**
A: No need in Phase 1. All lessons are portrait-optimized. Landscape support comes in Phase 2+ based on usage data.

**Q: Can I use the hook to adjust spacing/sizing?**
A: Not recommended in Phase 1. Stick to width-based media queries. Save orientation-specific layouts for Phase 2+.

**Q: Should I add analytics to every lesson?**
A: Optional. Add to new lessons or high-traffic lessons if you want orientation usage data.

**Q: When will landscape-specific layouts be supported?**
A: Phase 2, triggered by >20% landscape usage in analytics (estimated 3-6 months after Phase 1 deployment).

---

## Next Steps

1. **Continue building portrait-optimized lessons** (no changes needed)
2. **Optionally add analytics** to track orientation usage
3. **Wait for Phase 2 decision** based on analytics data
4. **Reference full guide** at `docs/guides/ORIENTATION_SUPPORT.md`

---

**Quick Links:**
- Full Guide: `docs/guides/ORIENTATION_SUPPORT.md`
- Style Guide: `docs/LESSON_STYLE_GUIDE.md` (section 0)
- Hook Code: `src/hooks/useOrientation.js`
- Analytics Code: `src/utils/orientationAnalytics.js`

**Last Updated:** 2026-03-01
**Phase:** 1 (Foundation)
