import React from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css'; // KaTeX CSS for math rendering
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
