import { createSlice } from "@reduxjs/toolkit";

const lessonSlice = createSlice({
  name: "lesson",
  initialState: {
    chapterSelected: "0",
    lessonSelected: "",
    lessonStats: {},
    userAnswer: "",
    answerFeedback: null, // "correct" | "incorrect" | null
    // Phase 2.5: Unified question-answer array batch system
    questionAnswerArray: [], // Array of complete question objects from backend
    currentQuestionIndex: 0, // Current position in batch (0-9)
    batchAccuracy: {
      correct: 0, // Number of correct answers in current batch
      total: 0, // Number of answered questions in current batch
    },
    showCompletionModal: false, // Show completion modal after finishing batch
    // Error handling and loading states (Phase 2 - Stage 1)
    lessonError: null, // Error message if lesson fails to load
    isLoading: false, // Whether lesson is currently loading
    lessonProps: {
      lessonName: "",
      lessonImage: "",
      hints: [],
      lessonComponent: [],
      question: "",
      answer: "",
      problemNumber: 0,
      showAnswer: true,
      order: [],
      grid: {},
    },
  },
  reducers: {
    selectChapter(state, action) {
      return { ...state, chapterSelected: action.payload };
      //which Chapter is selected payload will be the selected chapter
    },
    selectLesson(state, action) {
      return { ...state, lessonSelected: action.payload };
    },
    // Phase 2 - Stage 2: Removed empty changeLessonStats reducer (dead code)
    changeLessonProps(state, action) {
      const data = action.payload;

      // Phase 2.5: Check if response includes questionAnswerArray
      if (
        data.questionAnswerArray &&
        Array.isArray(data.questionAnswerArray) &&
        data.questionAnswerArray.length > 0
      ) {
        // Batch mode - cache questions and use first one
        state.questionAnswerArray = data.questionAnswerArray;
        state.currentQuestionIndex = 0;
        state.batchAccuracy = { correct: 0, total: 0 };
        state.showCompletionModal = false;

        // Extract first question data for current display
        const firstQuestion = data.questionAnswerArray[0];
        state.lessonProps = {
          grid: state.lessonProps.grid,
          ...data,
          // Override with first question's specific data
          numbersReturned: firstQuestion.numbersReturned,
          answer: firstQuestion.answer,
          problemTypeReturned: firstQuestion.problemTypeReturned,
          wordProblemReturned: firstQuestion.wordProblemReturned,
          hints: firstQuestion.hints || [],
        };
        state.showAnswer = false;
        state.userAnswer = "";
        state.answerFeedback = null;
      } else {
        // Single question mode (backward compatible)
        state.questionAnswerArray = [];
        state.currentQuestionIndex = 0;
        state.batchAccuracy = { correct: 0, total: 0 };
        state.showCompletionModal = false;
        state.lessonProps = { grid: state.lessonProps.grid, ...action.payload };
        state.showAnswer = false;
        state.userAnswer = "";
        state.answerFeedback = null;
      }
    },
    changeStars(state, action) {
      return {
        ...state,
        lessonProps: { ...state.lessonProps, stars: action.payload },
      };
    },
    newProblem(state, action) {
      return {
        ...state,
        lessonProps: {
          ...state.lessonProps,
          problemNumber: state.lessonProps.problemNumber + 1,
        },
      };
    },
    toggleAnswer(state, action) {
      return {
        ...state,
        showAnswer: action.payload,
      };
    },
    changeScreenSize(state, action) {
      return {
        ...state,
        lessonProps: {
          ...state.lessonProps,
          width: action.payload.width,
          height: action.payload.height,
        },
      };
    },
    setGrid(state, action) {
      return {
        ...state,
        lessonProps: {
          ...state.lessonProps,
          grid: action.payload,
        },
      };
    },
    functionCheckOrder(state, action) {
      return {
        ...state,
        lessonProps: {
          ...state.lessonProps,
          order: [...state.lessonProps.order, action.payload],
        },
      };
    },
    setUserAnswer(state, action) {
      return {
        ...state,
        userAnswer: action.payload,
      };
    },
    setAnswerFeedback(state, action) {
      return {
        ...state,
        answerFeedback: action.payload,
      };
    },
    resetUserAnswer(state) {
      return {
        ...state,
        userAnswer: "",
        answerFeedback: null,
      };
    },
    // Phase 2.5: Get next question from questionAnswerArray
    getNextQuestionFromArray(state) {
      const nextIndex = state.currentQuestionIndex + 1;

      // Check if we have more questions in the array
      if (nextIndex < state.questionAnswerArray.length) {
        // Use cached question from array
        const nextQuestion = state.questionAnswerArray[nextIndex];

        state.currentQuestionIndex = nextIndex;
        state.lessonProps = {
          ...state.lessonProps,
          numbersReturned: nextQuestion.numbersReturned,
          answer: nextQuestion.answer,
          problemTypeReturned: nextQuestion.problemTypeReturned,
          wordProblemReturned: nextQuestion.wordProblemReturned,
          hints: nextQuestion.hints || [],
          problemNumber: state.lessonProps.problemNumber + 1,
        };
        state.showAnswer = false;
        state.userAnswer = "";
        state.answerFeedback = null;
      } else {
        // End of batch - show completion modal
        state.showCompletionModal = true;
      }
    },
    // Phase 2.5: Record answer for accuracy tracking
    recordAnswer(state, action) {
      const { isCorrect } = action.payload;
      state.batchAccuracy.total += 1;
      if (isCorrect) {
        state.batchAccuracy.correct += 1;
      }
    },
    // Phase 2.5: Load more practice (close modal, prepare for new batch)
    loadMorePractice(state) {
      state.showCompletionModal = false;
      // Reset batch state - caller will fetch new batch
      state.questionAnswerArray = [];
      state.currentQuestionIndex = 0;
      state.batchAccuracy = { correct: 0, total: 0 };
    },
    // Phase 2.5: Exit batch mode (close modal and reset)
    exitBatch(state) {
      state.showCompletionModal = false;
      state.questionAnswerArray = [];
      state.currentQuestionIndex = 0;
      state.batchAccuracy = { correct: 0, total: 0 };
    },
    // Phase 2.5: Skip to completion modal (for testing or skip feature)
    skipBatch(state) {
      state.showCompletionModal = true;
    },
    // Phase 2 - Stage 2: Removed hasMoreQuestionsInCache reducer (replaced with selector)
    // Use selectHasQuestionsInCache from selectors instead
    // Phase 2 - Stage 1: Error handling and loading states
    setLessonError(state, action) {
      state.lessonError = action.payload;
      state.isLoading = false;
    },
    clearLessonError(state) {
      state.lessonError = null;
    },
    setLessonLoading(state, action) {
      state.isLoading = action.payload;
      if (action.payload) {
        // Clear any previous errors when starting a new load
        state.lessonError = null;
      }
    },
  },
});

export const {
  selectChapter,
  selectLesson,
  changeLessonProps,
  changeStars,
  newProblem,
  toggleAnswer,
  changeScreenSize,
  setGrid,
  functionCheckOrder,
  setUserAnswer,
  setAnswerFeedback,
  resetUserAnswer,
  getNextQuestionFromArray,
  recordAnswer,
  loadMorePractice,
  exitBatch,
  skipBatch,
  setLessonError,
  clearLessonError,
  setLessonLoading,
} = lessonSlice.actions;

export default lessonSlice.reducer;
