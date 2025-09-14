import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import MainApp from './MainApp'; // All the main application logic is now in this component

//  main-> app-> mainapp
export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}



