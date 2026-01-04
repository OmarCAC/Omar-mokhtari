
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { legalStorage } from '../src/modules/legal/services/legalStorage';
import { LegalContent, LegalPageType } from '../src/modules/legal/types/LegalContent';

const LegalPage: React.FC = () => {
  const location = useLocation();
  const [data, setData] = useState<LegalContent | null>(null);

  useEffect(() => {
    // Déterminer le type de page basé sur l'URL
    const path = location.pathname.substring(1); // enlever le '/'
    let type: LegalPageType = 'mentions-legales';
    
    if (path.includes('mentions-legales')) type = 'mentions-legales';
    else if (path.includes('politique-confidentialite')) type = 'politique-confidentialite';
    else if (path.includes('conditions-utilisation')) type = 'conditions-utilisation';

    const content = legalStorage.getPage(type);
    setData(content);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!data) return null;

  return (
    <div className="bg-background-light min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{data.title}</h1>
          <p className="text-sm text-slate-500 mb-8">Dernière mise à jour : {new Date(data.lastUpdated).toLocaleDateString('fr-FR')}</p>
          
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary">
            <div dangerouslySetInnerHTML={{ __html: data.content }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
