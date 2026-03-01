# iPad Orientation Support Guide

## Current Status: Phase 1 (Foundation)

### What's Available

**Hook:** `useOrientation()`
- Returns: `{ orientation, isPortrait, isLandscape, width, height, aspectRatio, deviceType }`
- Usage: `import { useOrientation } from '../../../../hooks';`
- Auto-updates on device rotation

**Analytics:** Automatic orientation tracking (if enabled in lesson)
- Tracks: Initial orientation, orientation changes, device type
- Data informs Phase 2 priorities

### Current Lesson Behavior

**All lessons remain portrait-optimized** (no changes):
- Portrait iPad (810×1080): Works perfectly ✅
- Landscape iPad (1080×810): Uses existing width-based layout
- No landscape-specific styling yet

### Phase 1 Goals

1. ✅ Orientation detection infrastructure in place
2. ✅ Analytics tracking orientation usage patterns
3. ✅ Zero breaking changes to existing lessons
4. ✅ Foundation for future landscape support (Phase 2+)

### Using the Hook (Optional in Phase 1)

```javascript
import { useOrientation } from '../../../../hooks';

function MyLesson() {
  const { orientation, isPortrait, isLandscape, deviceType } = useOrientation();

  // Phase 1: Use for analytics/logging only
  useEffect(() => {
    console.log('Current orientation:', orientation);
  }, [orientation]);

  // Phase 2+: Use for layout decisions
  // const canvasHeight = isLandscape ? 400 : 600;

  return <Stage height={500} />; // Keep existing sizing for now
}
```

### Adding Analytics to Your Lesson

```javascript
import { useOrientation } from '../../../../hooks';
import { logOrientationChange, logInitialOrientation } from '../../../../utils/orientationAnalytics';

function MyLesson({ lessonName, level }) {
  const { orientation, deviceType } = useOrientation();

  // Track initial orientation on mount
  useEffect(() => {
    logInitialOrientation(lessonName, orientation, deviceType, level);
  }, []); // Run once

  // Track orientation changes
  useEffect(() => {
    logOrientationChange(lessonName, orientation, deviceType, level);
  }, [orientation, lessonName, deviceType, level]);

  // ... rest of lesson code
}
```

### Future Phases

**Phase 2 (Future):** Opt-in orientation styling
- Lessons declare: `LessonComponent.orientationSupport = { portrait: true, landscape: true }`
- Fallback mode: Portrait layout centered in landscape
- Gradual migration of high-priority lessons

**Phase 3 (Future):** Full dual-orientation support
- All lessons support both orientations
- Landscape-optimized layouts (side-by-side, etc.)
- Auto-layout utilities

### Analytics Queries (for Phase 2 planning)

```sql
-- Google Analytics example query
SELECT
  lesson_name,
  orientation,
  COUNT(*) as session_count
FROM orientation_events
WHERE device_type = 'tablet'
GROUP BY lesson_name, orientation
ORDER BY session_count DESC;
```

**Goal:** Identify which lessons have >20% landscape usage → prioritize for Phase 2

### FAQ

**Q: Should I use orientation in new lessons?**
A: Not yet (Phase 1). Continue optimizing for portrait. Use hook for logging only.

**Q: What if my lesson doesn't work well in landscape?**
A: Expected! All lessons are portrait-optimized. Landscape support comes in Phase 2+.

**Q: Can I implement landscape layouts now?**
A: Yes, but optional. Follow portrait-fallback pattern. See LESSON_STYLE_GUIDE.md for guidelines.

### Testing

**Phase 1 testing:**
- [ ] Rotate iPad (portrait ↔ landscape)
- [ ] Verify hook detects change (console.log or React DevTools)
- [ ] Verify lesson still works in both orientations
- [ ] Verify no visual changes (portrait layout in both modes)

**Testing checklist:**
```javascript
// 1. Hook returns correct data
const { orientation, isPortrait, isLandscape, width, height, deviceType } = useOrientation();
console.log({ orientation, isPortrait, isLandscape, width, height, deviceType });

// 2. Orientation updates on rotation
useEffect(() => {
  console.log('Orientation changed to:', orientation);
}, [orientation]);

// 3. Analytics events fire
// Check browser console for "[Orientation Analytics]" logs in dev mode
```

### Reference Lessons

- **SymmetryLesson** - Will be pilot for Phase 2
- **AreaPerimeterLesson** - High priority for landscape support
- **GraphingLinesLesson** - Complex diagram, good for side-by-side layout

### Hook API Reference

**`useOrientation()`**

Returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `orientation` | `'portrait' \| 'landscape'` | Current device orientation |
| `isPortrait` | `boolean` | True if portrait mode |
| `isLandscape` | `boolean` | True if landscape mode |
| `width` | `number` | Viewport width in pixels |
| `height` | `number` | Viewport height in pixels |
| `aspectRatio` | `number` | Width/height ratio |
| `deviceType` | `'mobile' \| 'tablet' \| 'desktop'` | Device classification |

**Device type classification:**
- `mobile`: max dimension ≤768px
- `tablet`: max dimension ≤1366px (includes iPad Pro 12.9")
- `desktop`: max dimension >1366px

**SSR Support:**
- Returns portrait fallback values on server
- Hydrates correctly on client

### Analytics API Reference

**`logInitialOrientation(lessonName, orientation, deviceType, level)`**

Call once on component mount to track initial orientation.

Parameters:
- `lessonName` (string): Lesson identifier (e.g., 'symmetry', 'area_perimeter')
- `orientation` (string): 'portrait' or 'landscape'
- `deviceType` (string): 'mobile', 'tablet', or 'desktop'
- `level` (number): Current lesson level (1-8)

**`logOrientationChange(lessonName, orientation, deviceType, level)`**

Call when orientation changes to track rotation events.

Parameters: Same as `logInitialOrientation`

**Google Analytics Events:**

Sends events to `window.gtag` if available:
- Event name: `orientation_change` or `lesson_load`
- Category: `orientation`
- Label: lesson name
- Custom dimensions: orientation, device_type, lesson_level

### Development Logging

In development mode (`NODE_ENV === 'development'`), analytics functions log to console:

```
[Orientation Analytics - Initial] {
  lessonName: 'symmetry',
  orientation: 'portrait',
  deviceType: 'tablet',
  level: 1,
  timestamp: '2026-03-01T12:00:00.000Z'
}
```

---

## Phase 2+ Roadmap (Future)

### Phase 2: Opt-In Landscape Support

**When to implement:**
- Analytics show >20% landscape usage for specific lessons
- User requests landscape support
- New lesson specifically designed for landscape

**Priority lessons (estimated):**
1. AreaPerimeterLesson (high traffic)
2. SymmetryLesson (gold standard reference)
3. GraphingLinesLesson (complex diagram)
4. SimilarTrianglesWordProblemsLesson (side-by-side potential)
5. OrderOfOperationsLesson (step-by-step with formula)

**Key features:**
- Lesson metadata: `LessonComponent.orientationSupport = { portrait: true, landscape: false }`
- Portrait-fallback mode wrapper component
- Gradual migration (5-10 lessons initially)

### Phase 3: Full Dual-Orientation Support

**Goal:** All 67+ lessons support both orientations

**Key features:**
- Auto-layout hook (calculates optimal canvas size per orientation)
- Landscape-specific layouts (side-by-side canvas + controls)
- Visual regression tests for both orientations

---

## Implementation Patterns (Phase 2+)

### Pattern 1: Portrait-Fallback Mode

```javascript
import { useOrientation } from '../../../../hooks';

function MyLesson() {
  const { isLandscape } = useOrientation();

  // Phase 2: Center portrait layout in landscape
  const wrapperStyle = isLandscape ? {
    maxWidth: '810px',
    margin: '0 auto'
  } : {};

  return (
    <Wrapper style={wrapperStyle}>
      {/* Existing portrait-optimized layout */}
    </Wrapper>
  );
}
```

### Pattern 2: Orientation-Specific Layouts

```javascript
import { useOrientation } from '../../../../hooks';

function MyLesson() {
  const { isLandscape } = useOrientation();

  if (isLandscape) {
    return <LandscapeLayout />; // Side-by-side canvas + controls
  }

  return <PortraitLayout />; // Vertical stack
}
```

### Pattern 3: Responsive Canvas Sizing

```javascript
import { useOrientation } from '../../../../hooks';

function MyLesson() {
  const { isLandscape, width, height } = useOrientation();

  const canvasSize = isLandscape
    ? Math.min(height - 100, 500) // Use vertical space
    : Math.min(width - 40, 600);  // Use horizontal space

  return <Stage width={canvasSize} height={canvasSize} />;
}
```

---

**Last Updated:** 2026-03-01
**Phase:** 1 (Foundation)
**Status:** Implementation complete
**Next Review:** After 2-4 weeks of analytics data
