import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light', // 'light' | 'dark'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('theme', state.mode);
    },
    initializeTheme: (state, action) => {
      state.mode = action.payload;
      // Don't save to localStorage on initialization
      // This allows system preference detection without forcing a saved preference
    },
  },
});

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
