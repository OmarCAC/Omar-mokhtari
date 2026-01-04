
import React, { useState, useEffect } from 'react';
import { aiSettingsStorage, AiSettings, AgentConfig, ExpertProfile } from '../../src/services/aiSettingsStorage';
import { GoogleGenAI } from "@google/genai";

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash (Vitesse & Éco)', recommendedFor: ['chatbot', 'ocr'] },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (Intelligence Max)', recommendedFor: ['blog', 'advisor', 'studio'] },
  { id: 'gemini-2.5-flash-lite-latest', name: 'Gemini 2.5 Lite (Ultra Rapide)', recommendedFor: ['chatbot'] }
];

const COLORS = [
  { id: 'bg-primary', label: 'Bleu ComptaLink' },
  { id: 'bg-red-500', label: 'Rouge Fiscal' },
  { id: 'bg-blue-600', label: 'Bleu Royal Juridique' },
  { id: 'bg-purple-600', label: 'Violet Stratégie' },
  { id: 'bg-emerald-500', label: 'Vert Émeraude' },
  { id: 'bg-slate-800', label: 'Gris Carbone' }
];

const AdminAi: React.FC = () => {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'chatbot' | 'blog' | 'ocr' | 'advisor' | 'studio'>('general');
  const [editingExpertId, setEditingExpertId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setSettings(aiSettingsStorage.getSettings());
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsConnected(hasKey);
    }
  };

  const handleConnectGemini = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // On assume que le succès déclenche la disponibilité de process.env.API_KEY
            setIsConnected(true);
            setTestStatus('success');
            setTestMessage("Compte Google lié avec succès.");
        } catch (error) {
            console.error("Erreur de sélection de clé", error);
        }
    }
  };

  const handleGlobalChange = (field: keyof AiSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleAgentChange = (agent: keyof Omit<AiSettings, 'globalContext' | 'studioExperts'>, field: keyof AgentConfig, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [agent]: {
          ...settings[agent],
          [field]: value
        }
      });
    }
  };

  const updateExpert = (id: string, updates: Partial<ExpertProfile>) => {
    if (settings) {
        const newExperts = settings.studioExperts.map(e => e.id === id ? { ...e, ...updates } : e);
        setSettings({ ...settings, studioExperts: newExperts });
    }
  };

  const handleSave = () => {
    if (settings) {
      aiSettingsStorage.saveSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleTestConnection = async (modelToTest: string) => {
    setTestStatus('testing');
    setTestMessage(`Initialisation du moteur ${modelToTest}...`);
    try {
      // On crée une instance fraîche pour utiliser la clé sélectionnée
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ 
        model: modelToTest, 
        contents: "Réponds par 'OK' si tu es prêt." 
      });
      if (response.text) { 
        setTestStatus('success'); 
        setTestMessage(`L'IA ComptaLink est connectée et opérationnelle.`); 
      }
    } catch (error: any) {
      setTestStatus('error');
      if (error.message?.includes("Requested entity was not found")) {
          setTestMessage("Session expirée. Veuillez relier votre compte Gemini.");
          setIsConnected(false);
      } else {
          setTestMessage("Erreur de communication : " + (error.message || "Problème inconnu."));
      }
    }
  };

  if (!settings) return <div className="p-8 text-center font-bold">Chargement du Studio IA...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 font-display">
      
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
            Configuration IA Studio
          </h1>
          <p className="text-slate-500 text-sm">Gérez l'intelligence artificielle de ComptaLink.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg transition-all flex items-center gap-2">
          <span className="material-symbols-outlined">save</span> Enregistrer les prompts
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {[
            { id: 'general', label: 'Connexion & Système', icon: 'hub' },
            { id: 'studio', label: 'Studio Experts', icon: 'group_work' },
            { id: 'chatbot', label: 'Assistant Client', icon: 'smart_toy' },
            { id: 'blog', label: 'Rédaction Blog', icon: 'edit_note' }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {activeTab === 'general' && (
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    {/* Badge Google Official */}
                    <div className="absolute top-0 right-0 p-4">
                        <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24dp.svg" alt="Google" className="h-4 opacity-50" />
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">cloud_sync</span> 
                        Liaison de compte Gemini
                    </h2>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Pour utiliser les modèles haute performance (Gemini 3.0 Pro), vous devez lier un compte Google avec un projet payant. Les jetons seront facturés directement sur votre console Google Cloud.
                    </p>

                    <div className={`p-8 rounded-2xl border-2 mb-6 flex flex-col items-center text-center transition-all ${isConnected ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                        {isConnected ? (
                            <>
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg mb-4">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-lg font-bold text-green-900 mb-1">Compte Professionnel Connecté</h3>
                                <p className="text-green-700 text-sm mb-6">Votre cabinet ComptaLink est authentifié auprès des services Google AI.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleTestConnection('gemini-3-flash-preview')} className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-sm">Tester la connexion</button>
                                    <button onClick={handleConnectGemini} className="px-5 py-2 border border-green-200 text-green-700 font-bold rounded-lg hover:bg-white transition-all text-sm">Changer de compte</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl">link_off</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun compte lié</h3>
                                <p className="text-slate-500 text-sm mb-6">Veuillez lier votre compte pour activer les fonctionnalités IA.</p>
                                <button 
                                    onClick={handleConnectGemini}
                                    className="px-8 py-4 bg-primary text-white font-black rounded-xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined">key</span>
                                    Connecter mon compte Gemini
                                </button>
                            </>
                        )}
                    </div>

                    {testStatus !== 'idle' && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${testStatus === 'testing' ? 'bg-blue-50 text-blue-700' : testStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {testStatus === 'testing' && <span className="material-symbols-outlined animate-spin">sync</span>}
                            {testStatus === 'success' && <span className="material-symbols-outlined">verified</span>}
                            {testStatus === 'error' && <span className="material-symbols-outlined">error</span>}
                            {testMessage}
                        </div>
                    )}
                    
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">Note sur la facturation :</p>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            Consulter la documentation Google Billing <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </a>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">domain</span> Contexte Global du Cabinet
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">Ces instructions sont transmises à chaque agent IA pour qu'ils gardent l'identité de ComptaLink.</p>
                    <textarea 
                        value={settings.globalContext}
                        onChange={(e) => handleGlobalChange('globalContext', e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-48 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    ></textarea>
                </div>
            </div>
        )}

        {activeTab === 'studio' && (
            <div className="lg:col-span-12 space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settings.studioExperts.map(expert => (
                        <div key={expert.id} className={`bg-white rounded-2xl border-2 p-6 transition-all ${editingExpertId === expert.id ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${expert.color}`}>
                                        <span className="material-symbols-outlined">{expert.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">{expert.name}</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase">{expert.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditingExpertId(editingExpertId === expert.id ? null : expert.id)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                                    <span className="material-symbols-outlined">{editingExpertId === expert.id ? 'close' : 'edit'}</span>
                                </button>
                            </div>

                            {editingExpertId === expert.id && (
                                <div className="space-y-4 animate-slide-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nom Affiché</label>
                                            <input type="text" className="w-full p-2 border rounded-lg text-sm" value={expert.name} onChange={e => updateExpert(expert.id, { name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Rôle / Titre</label>
                                            <input type="text" className="w-full p-2 border rounded-lg text-sm" value={expert.role} onChange={e => updateExpert(expert.id, { role: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Couleur Signature</label>
                                        <div className="flex gap-2">
                                            {COLORS.map(c => (
                                                <button key={c.id} onClick={() => updateExpert(expert.id, { color: c.id })} className={`w-6 h-6 rounded-full border-2 ${c.id} ${expert.color === c.id ? 'border-slate-900 scale-125' : 'border-white'}`} title={c.label} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Instruction Système (Prompt spécialisé)</label>
                                        <textarea className="w-full p-3 border rounded-xl h-32 text-xs font-mono" value={expert.prompt} onChange={e => updateExpert(expert.id, { prompt: e.target.value })} placeholder="Détaillez ici le comportement de cet expert..." />
                                    </div>
                                </div>
                            )}
                            {!editingExpertId && (
                                <p className="text-xs text-slate-500 line-clamp-2 italic">"{expert.prompt.substring(0, 100)}..."</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab !== 'general' && activeTab !== 'studio' && (
            <div className="lg:col-span-8 space-y-6 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Modèle Gemini dédié</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {MODELS.map(model => (
                                <div 
                                    key={model.id}
                                    onClick={() => handleAgentChange(activeTab as any, 'model', model.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${(settings as any)[activeTab].model === model.id ? 'bg-primary/5 border-primary ring-4 ring-primary/5 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                >
                                    <p className="font-black text-sm text-slate-900 mb-1">{model.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Idéal pour : {model.recommendedFor.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-bold text-slate-700">Instructions du "Cerveau" de l'Agent</label>
                            <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded-full font-bold uppercase tracking-widest">Prompting</span>
                        </div>
                        <textarea 
                            value={(settings as any)[activeTab].systemInstruction}
                            onChange={(e) => handleAgentChange(activeTab as any, 'systemInstruction', e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-64 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        ></textarea>
                    </div>
                </div>
            </div>
        )}

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl">lightbulb</span>
                </div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-400">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Guide Studio IA
                </h3>
                <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                    <p>Chaque expert du Studio hérite automatiquement du <b>Contexte Global</b> de ComptaLink (page Accueil & Système).</p>
                    <p>Pour le <b>Maître Fiscal</b>, utilisez un prompt qui cite explicitement les lois algériennes comme le <b>Code Général des Impôts</b>.</p>
                    <p>Pour le <b>Conseil Légal</b>, précisez-lui qu'il doit toujours suggérer une validation finale par un notaire ou un avocat partenaire de ComptaLink.</p>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border-2 border-primary/10">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Consommation Token</h4>
                <div className="h-2 bg-slate-100 rounded-full mb-2">
                    <div className="h-full bg-primary rounded-full w-1/4"></div>
                </div>
                <p className="text-[10px] text-slate-500">Utilisation modérée. Prochaine facturation Google : 01/06/2025.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAi;
