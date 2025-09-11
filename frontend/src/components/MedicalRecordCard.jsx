import React, { useState } from 'react';
import axios from 'axios';
import { FileText, TestTube, Pill, Languages, Volume2, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const getRecordIcon = (type) => {
  if (type.toLowerCase().includes('summary') || type.toLowerCase().includes('note')) return <FileText className="h-5 w-5 text-blue-600" />;
  if (type.toLowerCase().includes('report')) return <TestTube className="h-5 w-5 text-purple-600" />;
  if (type.toLowerCase().includes('prescription')) return <Pill className="h-5 w-5 text-red-600" />;
  return <FileText className="h-5 w-5 text-gray-600" />;
};

export default function MedicalRecordCard({ record }) {
  const { date, recordType, hospitalName, doctor, details } = record;

  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTranslate = async (language) => {
    setIsTranslating(true);
    setError('');
    setTranslatedText('');
    try {
      const response = await axios.post(`${API_URL}/api/translate/translate-record`, {
        text: details,
        language: language,
      });
      setTranslatedText(response.data.translatedText);
    } catch (err) {
      setError('Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = () => {
    if (!translatedText || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      return setIsSpeaking(false);
    }
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getRecordIcon(recordType)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-900">{recordType}</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{new Date(date).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">At <span className="font-semibold">{hospitalName}</span> with <span className="font-semibold">{doctor}</span></p>
          <p className="text-sm text-gray-700 mt-3 border-l-2 border-green-500 pl-3">{details}</p>

          <div className="mt-4 pt-3 border-t border-dashed">
            {isTranslating ? (
              <p className="text-sm text-gray-500">Translating...</p>
            ) : translatedText ? (
              <div>
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-gray-800">Simplified Translation (Hindi)</h4>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleSpeak} title={isSpeaking ? "Stop Speaking" : "Read Aloud"} className="text-green-600 hover:text-green-800">
                           <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        </button>
                        <button onClick={() => setTranslatedText('')} title="Close Translation" className="text-gray-400 hover:text-gray-600">
                           <XCircle className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-sm text-gray-700 bg-slate-50 p-3 rounded-md">{translatedText}</p>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                 <button onClick={() => handleTranslate('Hindi')} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    <Languages className="h-4 w-4 mr-1.5"/> Translate & Simplify
                 </button>
                 {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

