'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAIStore } from '../../store/aiStore';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';

interface AICourseAssistantProps {
  subjectId?: number;
}

export const AICourseAssistant: React.FC<AICourseAssistantProps> = ({ subjectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, error } = useAIStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const context = `Subject ID: ${subjectId || 'N/A'}. This is an LMS application.`;
    const prompt = input;
    setInput('');
    await sendMessage(prompt, context);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* AI Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold text-sm">Course Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-indigo-500 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="bg-indigo-50 p-4 rounded-xl inline-block mb-4">
                  <Bot size={32} className="text-indigo-600" />
                </div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">How can I help you?</h4>
                <p className="text-xs text-slate-500 px-6">
                  Ask me about the course content, summaries, or specific questions you have about your studies.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                  <span className="text-xs text-slate-500 italic">Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 text-red-600 text-[10px] rounded text-center">
                {error}
              </div>
            )}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="p-4 border-t bg-slate-50"
          >
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your assistant..."
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 p-1 text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 text-center">
              Powered by Mistral AI on Hugging Face
            </p>
          </form>
        </div>
      </div>
    </>
  );
};
