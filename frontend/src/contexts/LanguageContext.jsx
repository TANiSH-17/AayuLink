import React, { createContext, useState, useContext } from 'react';

// This is our dictionary of translations.
const translations = {
  en: {
    // --- Landing Page ---
    oneNationOneHealth: "One Nation, One Health",
    tagline: "A unified digital front door for citizens, providers, and administrators.",
    accessPortal: "Access Portal",
    individual: "Individual",
    admin: "Admin",
    welcomeBack: "Welcome Back",
    createAccount: "Create an Account",
    forCitizens: "For all citizens of India",
    forStaff: "For authorized hospital staff only",
    langButton: "हिंदी", // Text for the button when language is English

    // --- NEW: Patient Lookup Page ---
    patientLookup: "Patient Lookup",
    enterAbhaToFind: "Enter an ABHA number to find a patient's record.",
    abhaNumber: "ABHA Number",
    findPatient: "Find Patient",
    patientFound: "Patient Found:",
    getCompleteHistory: "Get Complete Medical History",
    quickDetails: "Quick Details (Emergency Mode)",
    lookupAnother: "Look up another patient"
  },
  hi: {
    // --- Landing Page ---
    oneNationOneHealth: "एक राष्ट्र, एक स्वास्थ्य",
    tagline: "नागरिकों, प्रदाताओं और प्रशासकों के लिए एक एकीकृत डिजिटल फ्रंट डोर।",
    accessPortal: "एक्सेस पोर्टल",
    individual: "व्यक्तिगत",
    admin: "प्रशासक",
    welcomeBack: "वापसी पर स्वागत है",
    createAccount: "खाता बनाएं",
    forCitizens: "भारत के सभी नागरिकों के लिए",
    forStaff: "केवल अधिकृत अस्पताल कर्मचारियों के लिए",
    langButton: "English", // Text for the button when language is Hindi

    // --- NEW: Patient Lookup Page ---
    patientLookup: "रोगी खोज",
    enterAbhaToFind: "रोगी का रिकॉर्ड खोजने के लिए एक ABHA नंबर दर्ज करें।",
    abhaNumber: "ABHA नंबर",
    findPatient: "रोगी खोजें",
    patientFound: "रोगी मिल गया:",
    getCompleteHistory: "संपूर्ण मेडिकल इतिहास प्राप्त करें",
    quickDetails: "त्वरित विवरण (आपातकालीन मोड)",
    lookupAnother: "दूसरे रोगी को खोजें"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'hi' : 'en'));
  };

  // 't' is a standard abbreviation for "translate"
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// This is a custom hook that makes it easy to use our context in any component
export const useLanguage = () => useContext(LanguageContext);

