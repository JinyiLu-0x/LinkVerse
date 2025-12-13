
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress benign ResizeObserver loop errors often caused by React Flow or layout transitions
// Using a regex to catch "ResizeObserver loop completed with undelivered notifications" 
// and "ResizeObserver loop limit exceeded" variants.
const resizeObserverErrRegex = /ResizeObserver loop/;

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    if (resizeObserverErrRegex.test(args[0])) {
      return;
    }
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (event) => {
  if (resizeObserverErrRegex.test(event.message)) {
    event.stopImmediatePropagation();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
