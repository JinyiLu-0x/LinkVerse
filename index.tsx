
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress benign ResizeObserver loop errors often caused by React Flow or layout transitions.
// These errors are generally harmless in this context but can be noisy in the console.
// "ResizeObserver loop completed with undelivered notifications"
// "ResizeObserver loop limit exceeded"
const resizeObserverErrRegex = /ResizeObserver loop/;

const originalError = console.error;
console.error = (...args) => {
  // Check if any argument matches the suppression regex
  const shouldSuppress = args.some(arg => 
    (typeof arg === 'string' && resizeObserverErrRegex.test(arg)) ||
    (arg instanceof Error && resizeObserverErrRegex.test(arg.message))
  );

  if (shouldSuppress) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (typeof message === 'string' && resizeObserverErrRegex.test(message)) {
    event.stopImmediatePropagation();
    event.preventDefault();
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
