
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { rateLimiting } from '../services/rateLimiting';
import { aiConfigService, ChatBotConfig } from '../services/aiConfigService';
import { contactStorage } from '../../contact/services/contactStorage';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [botConfig, setBotConfig] = useState<ChatBotConfig>(aiConfigService.getConfig());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAndReset = () => {
        const config = aiConfigService.getConfig();
        setBotConfig(config);
        const savedChat = localStorage.getItem('comptalink_chat_history');
        if (savedChat) setMessages(JSON.parse(savedChat));
        else setMessages([{ role: 'model', text: config.welcomeMessage, timestamp: Date.now() }]);
    };
    loadAndReset();
    window.addEventListener('chat-config-updated', loadAndReset);
    return () => window.removeEventListener('chat-config-updated', loadAndReset);
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
        localStorage.setItem('comptalink_chat_history', JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (botConfig.collectLeads) detectLeads();
  }, [messages, botConfig.collectLeads]);

  const detectLeads = () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') return;
    const text = lastMessage.text;
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(05|06|07|02)[0-9]{8}/);
    if (emailMatch || phoneMatch) {
        setLeadData(prev => ({
            ...prev,
            email: emailMatch ? emailMatch[0] : prev.email,
            phone: phoneMatch ? phoneMatch[0] : prev.phone
        }));
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    const { allowed } = rateLimiting.checkLimit();
    if (!allowed) {
        setMessages(prev => [...prev, { role: 'model', text: "Trop de messages. Patientez une minute.", timestamp: Date.now() }]);
        return;
    }
    const newUserMsg: Message = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    const botMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: Date.now() }]);
    let fullText = '';
    await geminiService.sendMessageStream(messages, textToSend, (chunk) => {
      fullText += chunk;
      setMessages(prev => prev.map((msg, idx) => 
        idx === botMsgIndex ? { ...msg, text: fullText } : msg
      ));
    });
    setIsLoading(false);
  };

  const handleQuoteRedirect = () => {
    // On passe toute la conversation dans l'état de navigation
    navigate('/quote-request', { 
        state: { 
            name: leadData.name || '', 
            email: leadData.email || '', 
            phone: leadData.phone || '',
            summary: "Demande issue du Chatbot IA",
            conversationLogs: messages // TRANSFERT DE L'HISTORIQUE
        } 
    });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <div className={`mb-4 w-[90vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none h-0'}`}>
        <div className="bg-slate-900 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Conseiller ComptaLink</h3>
              <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> IA Active
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                <div className="text-[9px] mt-1 opacity-50 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start"><div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm"><div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div></div></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {botConfig.suggestedQuestions.map(s => (
                <button key={s} onClick={() => handleSend(s)} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap transition-all">{s}</button>
            ))}
          </div>
          { (leadData.email || leadData.phone) && botConfig.collectLeads && (
              <button onClick={handleQuoteRedirect} className="w-full mb-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-green-100 transition-all animate-bounce">
                <span className="material-symbols-outlined text-sm">calculate</span> Générer mon devis personnalisé
              </button>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écrivez votre message..." className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            <button type="submit" disabled={!input.trim() || isLoading} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all disabled:opacity-50"><span className="material-symbols-outlined">send</span></button>
          </form>
        </div>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-slate-900 hover:bg-primary text-white rounded-3xl shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 group relative">
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce group-hover:bg-primary">1</div>
        {isOpen ? <span className="material-symbols-outlined text-3xl">expand_more</span> : <span className="material-symbols-outlined text-3xl">chat_bubble</span>}
      </button>
    </div>
  );
};

export default ChatBot;
