import apiClient from "../api/client";

/**
 * Fetch lesson content from the backend API
 * Phase 2 - Stage 1: Enhanced with error handling, timeout, and retry logic
 *
 * @param {Object} params - Lesson parameters
 * @param {string} params.lesson - Lesson name (e.g., "triangle_sum")
 * @param {number} params.levelNum - Lesson level (1, 2, 3, etc.)
 * @param {number} params.problemNumber - Problem number
 * @returns {Promise<Object>} Lesson data
 * @throws {Error} If API call fails after retries
 */
async function lessonContext({ lesson, levelNum, problemNumber }) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  const newTerm = lesson.replaceAll(" ", "_");
  const endpoint = `/lessons/content/${newTerm}&${problemNumber}&${levelNum}`;

  // Retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await apiClient.get(endpoint, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Validate response has required data
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const returningResponse = {
        ...response.data,
        stars: 1,
        showAnswer: false,
        level: "level1",
      };

      return returningResponse;
    } catch (error) {
      // Clear any pending timeout
      const isLastAttempt = attempt === MAX_RETRIES;

      // Handle different error types
      if (error.name === "AbortError") {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(`Request timeout (attempt ${attempt}/${MAX_RETRIES}):`, endpoint);
        }
        if (isLastAttempt) {
          throw new Error(
            "Request timed out. Please check your internet connection and try again."
          );
        }
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error(
            `API error ${status} (attempt ${attempt}/${MAX_RETRIES}):`,
            error.response.data
          );
        }

        if (status === 404) {
          throw new Error(`Lesson "${lesson}" not found. Please try a different lesson.`);
        } else if (status === 500) {
          if (isLastAttempt) {
            throw new Error("Server error. Please try again in a moment.");
          }
        } else {
          throw new Error(`Failed to load lesson (error ${status}). Please try again.`);
        }
      } else if (error.request) {
        // Request made but no response received
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(`No response received (attempt ${attempt}/${MAX_RETRIES}):`, endpoint);
        }
        if (isLastAttempt) {
          throw new Error("Unable to connect to server. Please check your internet connection.");
        }
      } else {
        // Something else happened
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error(`Request error (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
        }
        throw new Error(error.message || "An unexpected error occurred while loading the lesson.");
      }

      // Wait before retrying (except on last attempt)
      if (!isLastAttempt) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }

  // Should never reach here, but just in case
  throw new Error("Failed to load lesson after multiple attempts.");
}

export default lessonContext;
