
import React, { useEffect, useState } from 'react';
import { legalStorage } from '../../src/modules/legal/services/legalStorage';
import { LegalContent, LegalPageType } from '../../src/modules/legal/types/LegalContent';

const AdminLegal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LegalPageType>('mentions-legales');
  const [formData, setFormData] = useState<LegalContent>({
    type: 'mentions-legales',
    title: '',
    content: '',
    lastUpdated: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const data = legalStorage.getPage(activeTab);
    setFormData(data);
  }, [activeTab]);

  const handleSave = () => {
    legalStorage.savePage(activeTab, formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs: { id: LegalPageType; label: string }[] = [
    { id: 'mentions-legales', label: 'Mentions Légales' },
    { id: 'politique-confidentialite', label: 'Politique de Confidentialité' },
    { id: 'conditions-utilisation', label: "Conditions d'Utilisation" },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pages Légales</h1>
          <p className="text-slate-500">Gérez le contenu de vos mentions légales et politiques.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">save</span> Enregistrer
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          Modifications enregistrées avec succès !
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editor Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Titre de la page</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contenu (HTML accepté)</label>
            <div className="text-xs text-slate-500 mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              Astuce : Vous pouvez utiliser des balises HTML simples comme &lt;h2&gt; pour les titres, &lt;p&gt; pour les paragraphes, et &lt;ul&gt;&lt;li&gt; pour les listes.
            </div>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm leading-relaxed h-96"
              placeholder="<p>Votre contenu ici...</p>"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLegal;
