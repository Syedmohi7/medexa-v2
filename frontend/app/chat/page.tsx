'use client';

import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const enhanceReply = (text: string) => {
    return text
      .replace(/fever/gi, '🤒 Fever')
      .replace(/diet/gi, '🥗 Diet')
      .replace(/exercise/gi, '🏃 Exercise')
      .replace(/sleep/gi, '😴 Sleep')
      .replace(/water/gi, '💧 Water')
      .replace(/doctor/gi, '👨‍⚕️ Doctor');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: input,
        sessionId: sessionId || undefined,
      });

      if (!sessionId) setSessionId(res.data.sessionId);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: enhanceReply(res.data.message),
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]">
        <Sidebar />

        <div className="flex-1 md:ml-64 pt-16 md:pt-0 flex flex-col h-screen overflow-hidden">
          
          {/* GLASS HEADER */}
          <div className="backdrop-blur-md bg-white/10 border-b border-white/20 px-4 md:px-6 py-4 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <Bot className="h-6 w-6 text-[#2563eb]" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">
                  MEDEXA • JOZO AI
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest">
                  Personal Virtual Health Assistant 🛡️
                </p>
              </div>
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center mt-12 md:mt-20 px-4">
                <div className="h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-12 transition-transform">
                  <Bot className="h-12 w-12 text-[#2563eb]" />
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] max-w-xl shadow-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles className="h-3 w-3 text-yellow-300" /> AI-Powered
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-4">
                        ASK JOZO-AI 🤖
                    </h2>
                    <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed mb-6">
                        Ask about symptoms, health metrics, or wellness advice. Your data is encrypted and private.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['Check Symptoms', 'Diet Plan', 'Health Risks'].map((tag) => (
                            <span key={tag} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-bold cursor-pointer transition-all border border-white/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className="flex items-end gap-3 max-w-[85%] md:max-w-2xl">
                  {message.role === 'assistant' && (
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg mb-1 flex-shrink-0">
                      <Bot className="h-6 w-6 text-[#2563eb]" />
                    </div>
                  )}

                  <div
                    className={`px-6 py-4 rounded-[1.8rem] text-sm md:text-base shadow-xl leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-[#2563eb] text-white rounded-br-none border border-white/20'
                        : 'bg-white text-slate-800 rounded-bl-none font-medium'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#2563eb] mb-2 font-black border-b border-blue-50 pb-1 flex items-center gap-2">
                        JOZO-AI <Sparkles className="h-3 w-3" />
                      </div>
                    )}
                    <div className="whitespace-pre-line font-bold">
                      {message.content}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg mb-1 flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 md:p-6 backdrop-blur-xl bg-white/5 border-t border-white/10">
            <div className="max-w-4xl mx-auto relative group">
              <input
                type="text"
                className="w-full bg-white border-2 border-transparent rounded-[2rem] px-6 py-4 pr-16 text-sm md:text-base focus:outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-500/20 shadow-2xl transition-all font-bold text-slate-900"
                placeholder="Describe your symptoms or ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[#2563eb] hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-50 group-hover:shadow-blue-500/40"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="text-center mt-3">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center justify-center gap-2">
                    <AlertCircle className="h-3 w-3" /> Medexa AI provides general info only. Consult a doctor 👨‍⚕️
                </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}