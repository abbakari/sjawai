import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TestApp from './TestApp.tsx';
// import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);
