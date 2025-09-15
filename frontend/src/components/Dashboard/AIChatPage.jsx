import React, { useState } from 'react';
import axios from 'axios';
import { Bot, Sparkles, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // ✅ 1. IMPORT THE NEW COMPONENT

const API_URL = 'http://localhost:8000';

export default function AIChatPage({ patientData }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetAnswer = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        medicalRecords: patientData.medicalHistory || [],
        reportsAndScans: patientData.reportsAndScans || [],
        question: question,
      });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Error fetching AI answer:", err);
      setError('Sorry, an error occurred while getting an answer from the AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant Chat</h1>
          <p className="text-gray-600 mt-1">Ask an intelligent question about the patient's complete record.</p>
        </div>
      </div>

      <div className="mt-6">
        <form onSubmit={handleGetAnswer}>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Are there any contraindications for prescribing beta-blockers based on the full record?"
              className="w-full p-2 border-none rounded-md focus:ring-0 text-lg"
              rows="3"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-all duration-200 disabled:bg-green-300"
              >
                {isLoading ? 'Analyzing...' : 'Get AI Insights'}
                {isLoading ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      {(answer || error || isLoading) && (
        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Insights:</h2>
          {isLoading && <p className="text-gray-500">The AI is analyzing the records...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {/* ✅ 2. RENDER THE ANSWER USING THE REACTMARKDOWN COMPONENT */}
          {answer && (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}