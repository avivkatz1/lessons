import { configureStore } from '@reduxjs/toolkit';
import lessonReducer from './lessonSlice';

export const store = configureStore({
  reducer: {
    lesson: lessonReducer,
  },
});
