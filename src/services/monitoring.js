import * as Sentry from "@sentry/react";

/**
 * Monitoring Service - Frontend Error Tracking
 *
 * This module initializes Sentry for the React frontend to track:
 * - JavaScript errors and exceptions
 * - React component errors
 * - User interactions and navigation
 * - Performance metrics
 * - Lesson load times and batch system usage
 */

/**
 * Initialize Sentry for frontend monitoring
 * Call this in index.js before rendering the app
 */
export function initMonitoring() {
  const environment = process.env.NODE_ENV || "development";
  const dsn = process.env.REACT_APP_SENTRY_DSN;

  // Only initialize if DSN is provided
  if (!dsn) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("⚠️  Sentry DSN not configured. Error tracking disabled.");
      // eslint-disable-next-line no-console
      console.warn("   Set REACT_APP_SENTRY_DSN in your .env file to enable monitoring.");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Session Replay - record user sessions for debugging
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media for privacy
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Session Replay
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive data from user context
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",

      // Browser quirks
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",

      // Network errors (user's connection, not our fault)
      "Failed to fetch",
      "NetworkError",
      "Load failed",
    ],
  });

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(`✅ Sentry monitoring initialized for ${environment}`);
  }
}

/**
 * Track a custom event (e.g., lesson completion, batch usage)
 */
export function trackEvent(eventName, data = {}) {
  Sentry.captureMessage(eventName, {
    level: "info",
    extra: data,
  });
}

/**
 * Track lesson load performance
 */
export function trackLessonLoad(lessonName, loadTime) {
  Sentry.addBreadcrumb({
    category: "lesson",
    message: `Loaded lesson: ${lessonName}`,
    level: "info",
    data: {
      lessonName,
      loadTime,
    },
  });
}

/**
 * Track batch system usage
 */
export function trackBatchUsage(lessonName, batchSize, accuracy) {
  Sentry.addBreadcrumb({
    category: "batch",
    message: `Completed batch: ${lessonName}`,
    level: "info",
    data: {
      lessonName,
      batchSize,
      accuracy,
    },
  });

  // Also send as event for analytics
  trackEvent("Batch Completed", {
    lessonName,
    batchSize,
    accuracy,
    accuracyPercentage: Math.round((accuracy.correct / accuracy.total) * 100),
  });
}

/**
 * Set user context (without sensitive data)
 */
export function setUserContext(userId, username) {
  Sentry.setUser({
    id: userId,
    username: username, // No email or sensitive data
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Capture an error manually
 */
export function captureError(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(message, category = "custom", data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: "info",
    data,
  });
}

/**
 * Create an error boundary component
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

export default {
  initMonitoring,
  trackEvent,
  trackLessonLoad,
  trackBatchUsage,
  setUserContext,
  clearUserContext,
  captureError,
  addBreadcrumb,
  ErrorBoundary,
};
