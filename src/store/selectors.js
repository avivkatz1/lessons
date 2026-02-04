/**
 * Redux Selectors for Lesson State
 * Phase 2 - Stage 2: Centralized state access patterns
 *
 * These selectors provide a single source of truth for accessing lesson state.
 * Benefits:
 * - Memoization opportunities with reselect
 * - Easy to test
 * - Consistent state access across components
 * - Easier refactoring of state structure
 */

// Basic selectors - direct state access
export const selectLesson = (state) => state.lesson;

export const selectChapterSelected = (state) => state.lesson.chapterSelected;

export const selectLessonSelected = (state) => state.lesson.lessonSelected;

export const selectLessonStats = (state) => state.lesson.lessonStats;

export const selectUserAnswer = (state) => state.lesson.userAnswer;

export const selectAnswerFeedback = (state) => state.lesson.answerFeedback;

// Phase 2.5: Batch system selectors
export const selectQuestionAnswerArray = (state) => state.lesson.questionAnswerArray;

export const selectCurrentQuestionIndex = (state) => state.lesson.currentQuestionIndex;

export const selectBatchAccuracy = (state) => state.lesson.batchAccuracy;

export const selectShowCompletionModal = (state) => state.lesson.showCompletionModal;

// Error handling selectors (Phase 2 - Stage 1)
export const selectLessonError = (state) => state.lesson.lessonError;

export const selectIsLoading = (state) => state.lesson.isLoading;

// Lesson props selectors
export const selectLessonProps = (state) => state.lesson.lessonProps;

export const selectLessonName = (state) => state.lesson.lessonProps.lessonName;

export const selectLessonImage = (state) => state.lesson.lessonProps.lessonImage;

export const selectHints = (state) => state.lesson.lessonProps.hints;

export const selectLessonComponent = (state) => state.lesson.lessonProps.lessonComponent;

export const selectQuestion = (state) => state.lesson.lessonProps.question;

export const selectAnswer = (state) => state.lesson.lessonProps.answer;

export const selectProblemNumber = (state) => state.lesson.lessonProps.problemNumber;

export const selectShowAnswer = (state) => state.lesson.lessonProps.showAnswer;

export const selectStars = (state) => state.lesson.lessonProps.stars;

export const selectOrder = (state) => state.lesson.lessonProps.order;

export const selectGrid = (state) => state.lesson.lessonProps.grid;

export const selectLevelNum = (state) => state.lesson.lessonProps.levelNum;

export const selectLessonString = (state) => state.lesson.lessonProps.lessonString;

export const selectWidth = (state) => state.lesson.lessonProps.width;

export const selectHeight = (state) => state.lesson.lessonProps.height;

export const selectNumbersReturned = (state) => state.lesson.lessonProps.numbersReturned;

// Computed selectors - derived state
export const selectHasError = (state) => state.lesson.lessonError !== null;

export const selectIsAnswerCorrect = (state) => state.lesson.answerFeedback === "correct";

export const selectIsAnswerIncorrect = (state) => state.lesson.answerFeedback === "incorrect";

// Phase 2.5: Computed selectors for batch system
// NOTE: All selectors include safety checks to handle undefined/null state gracefully
export const selectIsUsingBatch = (state) => {
  const arr = state.lesson.questionAnswerArray;
  return arr?.length > 0 || false;
};

export const selectRemainingQuestions = (state) => {
  const arr = state.lesson.questionAnswerArray;
  if (!arr || !Array.isArray(arr)) return 0;
  return arr.length - state.lesson.currentQuestionIndex - 1;
};

export const selectAccuracyPercentage = (state) => {
  const accuracy = state.lesson.batchAccuracy;
  if (!accuracy || typeof accuracy.total !== "number") return 0;
  const { correct, total } = accuracy;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

export const selectBatchSize = (state) => {
  const arr = state.lesson.questionAnswerArray;
  return arr?.length || 0;
};

export const selectHasQuestionsInCache = (state) => {
  const arr = state.lesson.questionAnswerArray;
  if (!arr || !Array.isArray(arr)) return false;
  return arr.length > 0 && state.lesson.currentQuestionIndex < arr.length - 1;
};

export const selectCurrentCachedQuestion = (state) => {
  const arr = state.lesson.questionAnswerArray;
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return null;
  }
  return arr[state.lesson.currentQuestionIndex];
};

// Status selectors - useful for UI decisions
export const selectIsLessonReady = (state) =>
  !state.lesson.isLoading &&
  state.lesson.lessonError === null &&
  state.lesson.lessonProps.lessonName !== "";

export const selectCanSubmitAnswer = (state) =>
  state.lesson.userAnswer !== "" && !state.lesson.isLoading;
