/**
 * Debug utility for batch question caching
 * Phase 2 - Debugging batch mode implementation
 *
 * Add this to components to verify batch mode is working
 */

/* eslint-disable no-console */
export const logBatchStatus = (state, label = "Batch Status") => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🔍 ${label}`);
    console.log("isBatchMode:", state.isBatchMode);
    console.log("questionQueue length:", state.questionQueue?.length || 0);
    console.log("currentQuestionIndex:", state.currentQuestionIndex);
    console.log(
      "remainingQuestions:",
      state.questionQueue ? state.questionQueue.length - state.currentQuestionIndex - 1 : 0
    );
    console.groupEnd();
  }
};

export const logLessonResponse = (response, label = "Lesson Response") => {
  if (process.env.NODE_ENV === "development") {
    console.group(`📦 ${label}`);
    console.log("Has questionBatch:", !!response.questionBatch);
    console.log("questionBatch length:", response.questionBatch?.length || 0);
    console.log("First question:", response.questionBatch?.[0]);
    console.log("Full response keys:", Object.keys(response));
    console.groupEnd();
  }
};
/* eslint-enable no-console */
