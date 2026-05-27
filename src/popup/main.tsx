import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/globals.css';

/**
 * Popup entry point.
 *
 * Mounts the React application into the #root element defined in index.html.
 * StrictMode is enabled to surface potential issues during development.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
