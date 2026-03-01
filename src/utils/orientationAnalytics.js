/**
 * Tracks orientation changes for analytics
 * Helps understand how students use iPads and inform Phase 2 priorities
 *
 * @param {string} lessonName - Current lesson (e.g., 'symmetry', 'area_perimeter')
 * @param {string} orientation - 'portrait' | 'landscape'
 * @param {string} deviceType - 'mobile' | 'tablet' | 'desktop'
 * @param {number} level - Current lesson level (1-8)
 */
export function logOrientationChange(lessonName, orientation, deviceType, level) {
  // Send to analytics service (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'orientation_change', {
      event_category: 'orientation',
      event_label: lessonName,
      orientation,
      device_type: deviceType,
      lesson_level: level,
    });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Orientation Analytics]', {
      lessonName,
      orientation,
      deviceType,
      level,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track initial orientation on lesson load
 */
export function logInitialOrientation(lessonName, orientation, deviceType, level) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'lesson_load', {
      event_category: 'orientation',
      event_label: lessonName,
      orientation,
      device_type: deviceType,
      lesson_level: level,
    });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Orientation Analytics - Initial]', {
      lessonName,
      orientation,
      deviceType,
      level,
      timestamp: new Date().toISOString(),
    });
  }
}
