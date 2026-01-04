
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiService, ChatMessage } from '../src/services/aiService';
import { aiSettingsStorage, ExpertProfile } from '../src/services/aiSettingsStorage';
import { useNotification } from '../src/context/NotificationContext';
import { pdfService } from '../src/services/pdfService';
import { ImageCompressionService } from '../services/imageCompressionService';

const ExpertAi: React.FC = () => {
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [activeExpert, setActiveExpert] = useState<ExpertProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    const settings = aiSettingsStorage.getSettings();
    setExperts(settings.studioExperts);
    if (settings.studioExperts.length > 0) {
        setActiveExpert(settings.studioExperts[0]);
    }

    const handleUpdate = () => {
        const newSettings = aiSettingsStorage.getSettings();
        setExperts(newSettings.studioExperts);
    };
    window.addEventListener('ai-settings-updated', handleUpdate);
    return () => window.removeEventListener('ai-settings-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (activeExpert) {
        setMessages([{ role: 'model', text: `Bonjour ! Je suis **${activeExpert.name}**, votre ${activeExpert.role.toLowerCase()}. Je peux analyser vos **PDF de bilans**, rapports financiers ou factures. Téléchargez votre document pour commencer l'analyse.` }]);
    }
  }, [activeExpert?.id]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedFile({ data: event.target?.result as string, mimeType: file.type, name: file.name });
                addNotification('info', `PDF "${file.name}" prêt.`);
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('image/')) {
            try {
                const compressed = await ImageCompressionService.compress(file);
                setSelectedFile({ data: compressed.dataUrl, mimeType: file.type, name: file.name });
                addNotification('info', `Image "${file.name}" prête.`);
            } catch (err) { addNotification('error', "Erreur préparation image."); }
        } else { addNotification('error', "Format non supporté."); }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading || !activeExpert) return;

    const userMsgText = input.trim() || (selectedFile ? `Analyse financière du document joint : ${selectedFile.name}` : '');
    const userMsg: ChatMessage = { role: 'user', text: userMsgText };
    setMessages(prev => [...prev, userMsg]);
    const currentFile = selectedFile; 
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    const botMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'model', text: '' }]);
    let accumulatedText = '';

    try {
      await aiService.sendMessageStream(
        messages, 
        userMsgText, 
        (chunk) => {
          accumulatedText += chunk;
          setMessages(prev => prev.map((msg, idx) => 
            idx === botMsgIndex ? { ...msg, text: accumulatedText } : msg
          ));
        },
        currentFile ? { data: currentFile.data, mimeType: currentFile.mimeType } : undefined
      );
    } catch (error) { addNotification('error', "Erreur de connexion."); } finally { setIsLoading(false); }
  };

  const handleExport = (type: 'pdf' | 'word' | 'excel') => {
    if (messages.length <= 1) {
        addNotification('info', "Aucune donnée à exporter.");
        return;
    }
    if (activeExpert) {
        if (type === 'pdf') pdfService.generateExpertReportPdf(activeExpert, messages);
        else if (type === 'word') pdfService.generateWordReport(activeExpert, messages);
        else if (type === 'excel') pdfService.generateExcelReport(activeExpert, messages);
        addNotification('success', `Export ${type.toUpperCase()} réussi.`);
    }
    setShowExportMenu(false);
  };

  if (!activeExpert) return <div className="h-screen flex items-center justify-center">Initialisation du studio...</div>;

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900 overflow-hidden font-display transition-colors">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            Expert Studio
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Intelligence Analytique 2025</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {experts.map((expert) => (
            <button
              key={expert.id}
              onClick={() => setActiveExpert(expert)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-4 group ${activeExpert.id === expert.id ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${expert.color} ${activeExpert.id === expert.id ? 'scale-110' : 'opacity-80 group-hover:opacity-100'}`}>
                <span className="material-symbols-outlined">{expert.icon}</span>
              </div>
              <div className="min-w-0">
                <h4 className={`font-bold text-sm ${activeExpert.id === expert.id ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{expert.name}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-medium">{expert.description}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-900">
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white lg:hidden ${activeExpert.color}`}>
               <span className="material-symbols-outlined text-sm">{activeExpert.icon}</span>
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{activeExpert.name}</h3>
                <p className="text-[10px] text-slate-400 font-medium">{activeExpert.role}</p>
            </div>
          </div>
          <div className="relative">
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold text-xs transition-all shadow-lg"
            >
                <span className="material-symbols-outlined text-lg">download</span>
                <span>Exporter l'Analyse</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            
            {showExportMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 py-2 overflow-hidden animate-fade-in">
                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span> PDF Professionnel
                        </button>
                        <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-500">description</span> Document Word
                        </button>
                        <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">table_chart</span> Données Excel
                        </button>
                    </div>
                </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${msg.role === 'user' ? 'bg-slate-100 border-slate-200 text-slate-500' : `${activeExpert.color} border-white shadow-lg text-white`}`}>
                  <span className="material-symbols-outlined text-xl">
                    {msg.role === 'user' ? 'person' : activeExpert.icon}
                  </span>
                </div>
                <div className={`max-w-[85%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-sm md:prose-base leading-relaxed" 
                       dangerouslySetInnerHTML={{ 
                         __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                       }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 animate-fade-in">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeExpert.color} text-white shadow-lg`}>
                  <span className="material-symbols-outlined text-xl">{activeExpert.icon}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 md:p-8 shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            {selectedFile && (
                <div className="mb-4 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-2xl animate-slide-in">
                    {selectedFile.mimeType === 'application/pdf' ? (
                        <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                        </div>
                    ) : (
                        <img src={selectedFile.data} alt="Preview" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Prêt pour analyse</p>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined">cancel</span>
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="relative group">
              <div className="relative flex items-end gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] p-3 shadow-sm focus-within:border-primary/30 transition-all">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*, application/pdf" 
                    onChange={handleFileChange} 
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedFile ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    title="Joindre un bilan (PDF ou Image)"
                >
                  <span className="material-symbols-outlined">{selectedFile ? 'check_circle' : 'attach_file'}</span>
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Expliquez votre besoin ou téléchargez un bilan (PDF)...`}
                  rows={1}
                  className="flex-1 bg-transparent border-none py-3 px-2 text-slate-800 dark:text-white focus:ring-0 outline-none resize-none max-h-32 custom-scrollbar"
                />
                <button 
                  type="submit"
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpertAi;
