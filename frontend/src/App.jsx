import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import MainApp from './MainApp'; // All the main application logic is now in this component

// App.jsx is now the clean entry point for your application.
// Its only job is to wrap the main app with any context providers it needs.
export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

