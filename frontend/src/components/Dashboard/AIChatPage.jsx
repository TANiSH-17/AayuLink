import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function AIChatPage({ medicalHistory }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;
    setIsLoading(true);
    setAnswer('');
    try {
      const response = await axios.post(`${API_URL}/api/chat`, { medicalRecords: medicalHistory, question });
      setAnswer(response.data.answer);
    } catch (err) {
      setAnswer('Sorry, an error occurred while getting an answer from the AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Assistant Chat</h1>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <form onSubmit={handleSubmit}>
                <label className="text-lg font-semibold text-gray-800">Ask a question about the patient's history:</label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows="3"
                    className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Is there a history of diabetes? Any allergies to penicillin?"
                />
                <button type="submit" disabled={isLoading} className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors">
                    {isLoading ? 'Thinking...' : 'Get AI Answer'}
                </button>
            </form>
            {answer && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-800">AI Response:</h2>
                    <div className="mt-2 p-4 bg-slate-50 border rounded-md whitespace-pre-wrap font-mono">{answer}</div>
                </div>
            )}
        </div>
    </div>
  );
}
