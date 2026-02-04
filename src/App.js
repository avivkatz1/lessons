import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store/store';
import { SelectingSection, LessonGeneral, ChapterPages } from './features/lessons/pages';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SelectingSection />} />
          <Route path="/lessons/:lesson" element={<LessonGeneral />} />
          <Route path="/lessons/chapter/:chapter" element={<ChapterPages />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
