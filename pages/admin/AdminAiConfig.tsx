
import React, { useState, useEffect } from 'react';
import { aiConfigService, ChatBotConfig, BotTone, BotLanguage } from '../../src/modules/chat/services/aiConfigService';

const AdminAiConfig: React.FC = () => {
  const [config, setConfig] = useState<ChatBotConfig>(aiConfigService.getConfig());
  const [newChip, setNewChip] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (!config.systemPrompt.trim()) {
      alert("Le System Prompt ne peut pas être vide.");
      return;
    }
    aiConfigService.saveConfig({ ...config, modifiedBy: 'Admin' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addChip = () => {
    if (newChip.trim() && !config.suggestedQuestions.includes(newChip.trim())) {
      setConfig({
        ...config,
        suggestedQuestions: [...config.suggestedQuestions, newChip.trim()]
      });
      setNewChip('');
    }
  };

  const removeChip = (chip: string) => {
    setConfig({
      ...config,
      suggestedQuestions: config.suggestedQuestions.filter(q => q !== chip)
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 p-6">
      <div className="flex justify-between items-center sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-20 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personnalité du Chatbot</h1>
          <p className="text-slate-500 text-sm">Configurez l'intelligence et le ton de votre assistant virtuel.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { if(confirm("Réinitialiser tous les réglages ?")) setConfig(aiConfigService.resetToDefault()); }}
            className="px-4 py-2 text-slate-500 font-bold hover:text-red-500 transition-colors"
          >
            Réinitialiser
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">save</span> Publier les réglages
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in shadow-sm border border-green-200">
          <span className="material-symbols-outlined">check_circle</span> 
          Configuration déployée en direct sur le site !
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : SYSTEME & TON */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Prompt */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-primary">psychology</span> Instructions Système
                </h2>
                <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded font-mono">GEMINI-3-FLASH</span>
            </div>
            
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Instructions de comportement (System Prompt)</label>
                <textarea 
                    value={config.systemPrompt}
                    onChange={e => setConfig({...config, systemPrompt: e.target.value})}
                    className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Tu es un expert-comptable..."
                />
                <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>L'IA suivra ces consignes à chaque réponse.</span>
                    <span>{config.systemPrompt.length} caractères</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Ton du bot</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['formal', 'friendly', 'pedagogic', 'technical'] as BotTone[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setConfig({...config, tone: t})}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${config.tone === t ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-primary'}`}
                            >
                                {t === 'formal' ? '👨‍💼 Formel' : t === 'friendly' ? '🤝 Amical' : t === 'pedagogic' ? '👨‍🏫 Pédagogue' : '⚙️ Technique'}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Langue de base</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['fr', 'ar', 'en'] as BotLanguage[]).map(l => (
                            <button
                                key={l}
                                onClick={() => setConfig({...config, language: l})}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${config.language === l ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Note: Gemini reste polyglotte peu importe ce choix.</p>
                </div>
            </div>
          </div>

          {/* Section Bienvenue */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest border-b pb-4">
                <span className="material-symbols-outlined text-primary">chat_bubble</span> Message d'accueil
            </h2>
            <textarea 
                value={config.welcomeMessage}
                onChange={e => setConfig({...config, welcomeMessage: e.target.value})}
                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Bonjour..."
            />
          </div>
        </div>

        {/* COLONNE DROITE : CHIPS & LEADS */}
        <div className="space-y-6">
            
            {/* Suggested Questions */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-primary">magic_button</span> Suggestions (Chips)
                </h2>
                <div className="space-y-3 mb-6">
                    {config.suggestedQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 group">
                            <span className="text-xs font-bold text-slate-700 truncate">{q}</span>
                            <button onClick={() => removeChip(q)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newChip}
                        onChange={e => setNewChip(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addChip()}
                        placeholder="Nouvelle question..."
                        className="flex-1 p-2 border rounded-lg text-xs outline-none focus:border-primary"
                    />
                    <button onClick={addChip} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>

            {/* Leads Collection */}
            <div className={`p-6 rounded-3xl border-2 transition-all ${config.collectLeads ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">Collecte de Leads</h3>
                    <button 
                        onClick={() => setConfig({...config, collectLeads: !config.collectLeads})}
                        className={`w-10 h-5 rounded-full p-1 transition-colors ${config.collectLeads ? 'bg-green-600' : 'bg-slate-400'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${config.collectLeads ? 'translate-x-5' : ''}`}></div>
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    Si activé, l'IA tentera de détecter et d'enregistrer les emails et téléphones cités dans la conversation pour le CRM Admin.
                </p>
            </div>

            {/* History info */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Dernière mise à jour</h4>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">history</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold">{new Date(config.lastModified).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] text-slate-400">Par {config.modifiedBy}</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAiConfig;
