import React from 'react';
import { createRoot } from 'react-dom/client'; // Changed import
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // Correct path
import './i18n'; // Initialize i18next configuration

const container = document.getElementById('root');
const root = createRoot(container); // New API for React 18

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem'}}>Loading translations...</div>}> {/* Suspense for i18next */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
