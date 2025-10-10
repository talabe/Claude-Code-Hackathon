/**
 * main.jsx - Application Entry Point
 *
 * This is the entry point for the SlideRx React application.
 * It mounts the App component to the DOM and imports global styles.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
