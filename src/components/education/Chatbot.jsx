import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useElectionStore } from '../../store/useElectionStore';
import { API_BASE_URL } from '../../config';
import { cn } from '../../lib/utils';

const languageMap = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
  or: 'Odia (ଓଡ଼ିଆ)'
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { t } = useTranslation();
  const { language } = useElectionStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: t('assistant_welcome') }
      ]);
    }
  }, [isOpen, language, t]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for API
      const apiMessages = [
        { 
          role: "system", 
          content: `You are Matdan Mitra, a specialized Voter Education Assistant. Your primary role is to educate voters on election processes, registration, eligibility, and polling information in India. Be concise, friendly, and easy to understand. Do not use any markdown, HTML tags, or scripts. Your output must be plain text ONLY. IMPORTANT: You MUST respond exclusively in ${languageMap[language] || 'English'}.` 
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }
      ];

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (response.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', content: t('rate_limit_error') }]);
        return;
      }
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('analysis_failed') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden flex flex-col transition-colors"
            style={{ height: '400px', maxHeight: '60vh' }}
          >
            {/* Header */}
            <div className="bg-governance-900 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-governance-500 p-2 rounded-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">{t('assistant_name')}</h3>
                  <p className="text-xs text-governance-300">Matdan Mitra Education</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-governance-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 transition-colors">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex max-w-[85%]",
                    msg.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
                  )}
                >
                    <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed transition-all",
                    msg.role === 'user' 
                      ? "bg-governance-600 text-white rounded-br-sm" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm rounded-bl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex mr-auto justify-start max-w-[85%]">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl rounded-bl-sm p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-governance-500 animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('gemini_analyzing')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSend}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0 transition-colors"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('type_message')}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-governance-500 rounded-full px-4 py-2.5 text-sm outline-none transition-all dark:text-white dark:placeholder-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-governance-600 hover:bg-governance-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-governance-900 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all border-4 border-white dark:border-slate-900"
        title={t('ask_assistant')}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
