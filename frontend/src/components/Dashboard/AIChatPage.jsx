import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// A simple component for the "AI is thinking..." animation
const TypingIndicator = () => (
  <div className="flex items-center gap-2 bg-slate-100 self-start rounded-xl px-4 py-3">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
  </div>
);

export default function AIChatPage({ patientData }) {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Automatically scroll to the bottom of the chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = async (questionText) => {
    const question = questionText || input;
    if (!question.trim()) return;

    const newConversation = [...conversation, { role: 'user', content: question }];
    setConversation(newConversation);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        medicalRecords: patientData.medicalHistory || [],
        reportsAndScans: patientData.reportsAndScans || [],
        question: question,
      });

      // Add the AI's response to the conversation history
      setConversation([...newConversation, { role: 'ai', content: response.data.answer }]);

    } catch (err) {
      console.error("Error fetching AI answer:", err);
      setConversation([...newConversation, { 
        role: 'ai', 
        content: 'Sorry, an error occurred while getting an answer from the AI.',
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const examplePrompts = [
    "Summarize the patient's cardiac health.",
    "Are there any potential drug interactions?",
    "What was the outcome of the last MRI?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
            <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant Chat</h1>
            <p className="text-gray-600">Ask about the patient's complete record.</p>
        </div>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {conversation.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <div className="bg-primary/10 p-2 rounded-full"><Bot className="w-6 h-6 text-primary" /></div>
            )}
            <div className={`max-w-xl px-4 py-3 rounded-xl ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 
              msg.isError ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
            }`}>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
             {msg.role === 'user' && (
              <div className="bg-slate-200 p-2 rounded-full"><User className="w-6 h-6 text-slate-600" /></div>
            )}
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t bg-slate-50">
        {conversation.length === 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-3">
            {examplePrompts.map(prompt => (
              <button 
                key={prompt} 
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 bg-white border rounded-full text-sm text-slate-600 hover:bg-slate-100"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Ask a question about the patient's history, reports, and scans..."
            className="w-full p-3 border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            rows="1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Sparkles className="h-6 w-6 animate-pulse" /> : <Send className="h-6 w-6" />}
          </button>
        </form>
      </div>
    </div>
  );
}