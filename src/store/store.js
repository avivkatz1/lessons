import { configureStore } from '@reduxjs/toolkit';
import lessonReducer from './lessonSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    lesson: lessonReducer,
    theme: themeReducer,
  },
});
