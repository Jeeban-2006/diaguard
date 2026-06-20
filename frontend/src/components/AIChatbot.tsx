import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { HealthData } from '@/app/DiaGuardApp';

interface AIChatbotProps {
  healthData: HealthData;
  riskScore: number;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const AIChatbot: React.FC<AIChatbotProps> = ({ healthData, riskScore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your DiaGuard Health Assistant. I have your metabolic profile and risk score loaded. How can I help you understand your health today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Build history for the API (excluding the initial hardcoded greeting)
      const history = messages.filter(m => m.id !== '1').map(m => ({
        role: m.role,
        content: m.content
      }));

      // Extract health profile context separately so the backend can inject it softly into the system prompt
      const contextProfile = `User Health Profile Context: Age ${healthData.age}, BMI ${healthData.bmi}, Fasting Glucose ${healthData.fastingGlucose} mg/dL, Sleep ${healthData.sleepHours} hrs/night, Stress Level ${healthData.stressLevel}/10, Activity ${healthData.physicalActivity}. Current Risk Score: ${Math.round(riskScore)}/100.`;

      const nodeApiUrl = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';
      const response = await fetch(`${nodeApiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: history,
          context: contextProfile
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI server');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to my knowledge base right now. Please ensure the Node backend server is running on port 3000."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-900/50 hover:bg-green-500 transition-colors z-50"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-[#0c1218] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111820] p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center text-green-500">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">DiaGuard AI</h3>
                  <p className="text-green-500 text-xs font-semibold">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-green-600 text-white rounded-br-none' 
                      : 'bg-white/10 text-gray-200 rounded-bl-none'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none 
                        prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10
                        prose-a:text-green-400 hover:prose-a:text-green-300
                        prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-white/20 prose-td:p-2 prose-th:border prose-th:border-white/20 prose-th:p-2 prose-th:bg-black/20"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-gray-400 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-[#111820] border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your risk score..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-green-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
