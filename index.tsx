import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress benign ResizeObserver loop errors often caused by React Flow or layout transitions
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications';
const resizeObserverLimitErr = 'ResizeObserver loop limit exceeded';

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes(resizeObserverLoopErr) || args[0].includes(resizeObserverLimitErr)) {
      return;
    }
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (event) => {
  if (event.message === resizeObserverLoopErr || event.message === resizeObserverLimitErr) {
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