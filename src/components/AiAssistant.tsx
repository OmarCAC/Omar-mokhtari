
import React, { useState, useRef, useEffect } from 'react';
import { aiService, ChatMessage } from '../services/aiService';
import { aiSettingsStorage } from '../services/aiSettingsStorage';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialisation du message d'accueil depuis les paramètres
  useEffect(() => {
    const settings = aiSettingsStorage.getSettings();
    const welcome = settings.chatbot.welcomeMessage || "Bonjour ! Je suis ComptaBot 🤖. Comment puis-je vous aider ?";
    setMessages([{ role: 'model', text: welcome }]);
    
    // Ecouter les mises à jour des paramètres en direct
    const handleSettingsUpdate = () => {
        const newSettings = aiSettingsStorage.getSettings();
        const newWelcome = newSettings.chatbot.welcomeMessage || welcome;
        setMessages(prev => {
            if (prev.length <= 1) return [{ role: 'model', text: newWelcome }];
            return prev;
        });
    };
    window.addEventListener('ai-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('ai-settings-updated', handleSettingsUpdate);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Placeholder pour la réponse
    const botMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    let accumulatedText = '';

    await aiService.sendMessageStream(messages, userMsg.text, (chunk) => {
      accumulatedText += chunk;
      setMessages(prev => prev.map((msg, idx) => 
        idx === botMsgIndex ? { ...msg, text: accumulatedText } : msg
      ));
    });

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Fenêtre de Chat */}
      <div className={`mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 h-0 w-0'}`}>
        
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">ComptaBot AI</h3>
              <p className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> En ligne
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
              }`}>
                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ 
                    __html: msg.text.replace(/\n/g, '<br/>') 
                }} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>

      {/* Bouton Flottant */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-900 hover:bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 pointer-events-auto border-2 border-white/20"
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-2xl">expand_more</span>
        ) : (
          <span className="material-symbols-outlined text-2xl animate-pulse">chat_bubble</span>
        )}
      </button>
    </div>
  );
};

export default AiAssistant;
