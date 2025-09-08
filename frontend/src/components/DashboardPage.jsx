// frontend/src/components/DashboardPage.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = 'http://localhost:8000';

// Receive the onLogout function as a prop
export default function DashboardPage({ onLogout }) {
  // --- STATE MANAGEMENT ---
  const [abhaId, setAbhaId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [summary, setSummary] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // --- API HANDLER FUNCTIONS ---
  const handleFetchRecords = async (e) => {
    e.preventDefault();
    if (!abhaId.trim()) return;
    setIsFetching(true);
    setError('');
    setPatientData(null);
    setSummary('');
    setChatHistory([]);
    try {
      const response = await axios.post(`${API_URL}/api/fetch-records`, { abhaId });
      setPatientData(response.data);
    } catch (err) {
      setError('Failed to fetch patient records. Please check the ABHA ID and try again.');
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  // RESTORED: Generates the AI summary
  const handleSummarize = async () => {
    if (!patientData) return;
    setIsSummarizing(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/summarize`, { 
        medicalRecords: patientData.medicalHistory 
      });
      setSummary(response.data.summary);
    } catch (err) {
      setError('Failed to generate summary.');
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // RESTORED: Handles submitting a message to the chatbot
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        medicalRecords: patientData.medicalHistory,
        question: chatInput,
      });
      setChatHistory([...newHistory, { role: 'model', text: response.data.answer }]);
    } catch (err) {
      setError('AI chat failed. Please try again.');
      console.error(err);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">AarogyaAI 🩺</h1>
            <p className="text-slate-400 mt-1">Your Smart Health Record Assistant</p>
          </div>
          <button 
            onClick={onLogout} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Logout
          </button>
        </header>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* ABHA Input Section (RESTORED) */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
              <form onSubmit={handleFetchRecords}>
                <label htmlFor="abhaId" className="block text-lg font-semibold mb-2 text-slate-300">Enter Patient's ABHA Number</label>
                <div className="flex gap-2">
                  <input
                    id="abhaId"
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="e.g., 12-3456-7890-1234"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                  <button type="submit" disabled={isFetching} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors">
                    {isFetching ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
              </form>
            </div>

            {/* AI Summary Section (RESTORED) */}
            {patientData && (
              <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-slate-200">AI Summary</h2>
                <button onClick={handleSummarize} disabled={isSummarizing} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-md mb-4 transition-colors">
                  {isSummarizing ? 'Generating...' : 'Generate Patient Summary'}
                </button>
                {summary && <div className="bg-slate-700/50 p-4 rounded-lg whitespace-pre-wrap text-slate-300">{summary}</div>}
              </div>
            )}
            
            {/* Emergency QR Code Section (Corrected) */}
            {patientData && (
              <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-slate-200">Emergency QR Code</h2>
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <QRCodeSVG 
                    value={`${window.location.origin}/emergency/${patientData.abhaId}`} 
                    size={180} 
                  />
                </div>
                <p className="text-slate-400 text-sm mt-4 text-center">
                  Save this. First responders can scan it to see critical info.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (RESTORED) */}
          <div className="lg:col-span-2 space-y-8">
            {!patientData && !isFetching && (
              <div className="bg-slate-800 p-10 rounded-xl shadow-lg text-center h-full flex flex-col justify-center">
                  <p className="text-slate-400 text-lg">Patient data will appear here once fetched.</p>
              </div>
            )}
            {isFetching && (
              <div className="bg-slate-800 p-10 rounded-xl shadow-lg text-center h-full flex flex-col justify-center">
                  <p className="text-slate-400 text-lg animate-pulse">Retrieving secure health records...</p>
              </div>
            )}

            {patientData && (
              <>
                {/* Patient Information Section */}
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-slate-200">Patient Details</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><strong className="block text-slate-400">Name</strong> {patientData.personalInfo.name}</div>
                    <div><strong className="block text-slate-400">Age</strong> {patientData.personalInfo.age}</div>
                    <div><strong className="block text-slate-400">Gender</strong> {patientData.personalInfo.gender}</div>
                    <div><strong className="block text-slate-400">Blood Type</strong> <span className="font-mono text-red-400">{patientData.personalInfo.bloodType}</span></div>
                  </div>
                </div>

                {/* Medical History Section */}
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-slate-200">Medical History</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {patientData.medicalHistory.map((record) => (
                      <div key={record.recordId} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-cyan-400">{record.type}</h3>
                          <span className="text-xs text-slate-400 font-mono">{record.date}</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-1"><strong className="text-slate-400">Hospital:</strong> {record.hospital}</p>
                        <p className="text-sm text-slate-300"><strong className="text-slate-400">Details:</strong> {record.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* AI Chatbot Section */}
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-slate-200">AI Assistant Chat</h2>
                  <div ref={chatContainerRef} className="h-64 overflow-y-auto bg-slate-700/50 p-4 rounded-lg mb-4 space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-cyan-800' : 'bg-slate-600'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isChatting && <div className="flex justify-start"><div className="p-3 rounded-xl bg-slate-600 animate-pulse">...</div></div>}
                  </div>
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question about the patient's history..."
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button type="submit" disabled={isChatting || !patientData} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 font-bold py-2 px-4 rounded-md transition-colors">Send</button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}