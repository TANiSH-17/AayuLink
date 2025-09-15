import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, X, Send, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function FloatingChatbot({ medicalHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your Aarogya AI assistant. How can I help you with this patient's records today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        medicalRecords: medicalHistory,
        question: userInput
      });
      setMessages([...newMessages, { sender: 'ai', text: response.data.answer }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-96 h-[60vh] rounded-2xl shadow-2xl flex flex-col transform transition-all animate-fade-in-up">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-lg">Aarogya AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-green-700">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <div className="bg-green-600 text-white rounded-full p-2"><Bot size={20}/></div>}
                  <div className={`max-w-xs px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.text}
                  </div>
                   {msg.sender === 'user' && <div className="bg-blue-500 text-white rounded-full p-2"><User size={20}/></div>}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white rounded-full p-2 animate-pulse"><Bot size={20}/></div>
                    <div className="max-w-xs px-4 py-2 rounded-xl bg-gray-100 text-gray-500">
                        Thinking...
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about the patient..."
                className="w-full p-3 pr-12 border rounded-lg"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-green-600 rounded-full hover:bg-green-700">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transform hover:scale-110 transition-transform"
        >
          <Bot size={32} />
        </button>
      )}
    </div>
  );
}
