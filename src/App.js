import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { store } from './store/store';
import { initializeTheme } from './store/themeSlice';
import { lightTheme, darkTheme, GlobalStyle } from './theme';
import { SelectingSection, LessonGeneral, ChapterPages } from './features/lessons/pages';
import './App.css';

// Theme wrapper component to access Redux state
function ThemedApp() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialTheme = savedTheme || systemTheme;
    dispatch(initializeTheme(initialTheme));
  }, [dispatch]);

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SelectingSection />} />
          <Route path="/lessons/:lesson" element={<LessonGeneral />} />
          <Route path="/lessons/chapter/:chapter" element={<ChapterPages />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
}

export default App;
