
import React, { useEffect, useState } from 'react';

interface AiAdvisorProps {
  data: any; // Can be forecast or BP data
  type: 'forecast' | 'business-plan';
}

interface Advice {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ data, type }) => {
  const [adviceList, setAdviceList] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulation d'une analyse "IA" (règles métier)
    setTimeout(() => {
      const advice: Advice[] = [];

      if (type === 'forecast') {
        // Analyse Prévisions
        const results = data.results; // Assuming results are passed or derived
        if (results && results.length > 0) {
            const y1 = results[0];
            
            // Rentabilité
            const netMargin = (y1.resultatNet / y1.caHT) * 100;
            if (netMargin > 15) {
                advice.push({ type: 'success', title: 'Rentabilité Excellente', message: `Votre marge nette de ${netMargin.toFixed(1)}% est très performante.` });
            } else if (netMargin < 5 && netMargin > 0) {
                advice.push({ type: 'warning', title: 'Rentabilité Faible', message: `Votre marge nette de ${netMargin.toFixed(1)}% est fragile. Surveillez vos coûts.` });
            } else if (netMargin < 0) {
                advice.push({ type: 'danger', title: 'Déficitaire', message: 'Attention, votre première année est déficitaire. Assurez-vous d\'avoir assez de trésorerie.' });
            }

            // Trésorerie
            if (y1.cashEnd < 0) {
                advice.push({ type: 'danger', title: 'Impasse de Trésorerie', message: 'Votre trésorerie devient négative. Vous devez augmenter votre capital ou trouver un financement.' });
            } else if (y1.cashEnd < y1.caHT * 0.1) {
                advice.push({ type: 'warning', title: 'Trésorerie Tendue', message: 'Votre trésorerie de fin d\'année est faible (< 10% du CA). Prévoyez une marge de sécurité.' });
            }
        }
      } else {
        // Analyse Business Plan
        const fin = data.financials;
        if (fin) {
            if (fin.van > 0) {
                advice.push({ type: 'success', title: 'Projet Viable', message: 'La VAN positive indique que votre projet crée de la valeur.' });
            } else {
                advice.push({ type: 'danger', title: 'Projet Non Rentable', message: 'La VAN est négative. Votre projet coûte plus qu\'il ne rapporte à long terme.' });
            }

            if (data.formData.investTotal && data.formData.fondsPropres) {
                const ratio = (data.formData.fondsPropres / data.formData.investTotal) * 100;
                if (ratio < 30) {
                    advice.push({ type: 'warning', title: 'Autonomie Financière Faible', message: `Vos fonds propres (${ratio.toFixed(0)}%) sont bas. Les banques demandent souvent 30%.` });
                }
            }
        }
        
        // Check SWOT
        if (!data.formData.force1 || !data.formData.menace1) {
             advice.push({ type: 'info', title: 'SWOT Incomplet', message: 'Complétez votre analyse SWOT pour mieux défendre votre projet.' });
        }
      }

      setAdviceList(advice);
      setLoading(false);
    }, 1500); // Fake delay for "AI thinking" effect
  }, [data, type]);

  return (
    <div className="bg-slate-900 text-white rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 animate-pulse">auto_awesome</span>
            <h3 className="font-bold">ComptaLink AI Advisor</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">BETA</span>
      </div>
      
      <div className="p-6">
        {loading ? (
            <div className="flex flex-col items-center py-4 text-slate-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                <p className="text-sm">Analyse de vos données en cours...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {adviceList.length === 0 ? (
                    <p className="text-sm text-slate-300">Aucune remarque particulière. Vos données semblent cohérentes.</p>
                ) : (
                    adviceList.map((item, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border-l-4 text-sm ${
                            item.type === 'success' ? 'bg-green-900/30 border-green-500' :
                            item.type === 'warning' ? 'bg-yellow-900/30 border-yellow-500' :
                            item.type === 'danger' ? 'bg-red-900/30 border-red-500' :
                            'bg-blue-900/30 border-blue-500'
                        }`}>
                            <div className="flex items-center gap-2 font-bold mb-1">
                                <span className="material-symbols-outlined text-sm">
                                    {item.type === 'success' ? 'check_circle' :
                                     item.type === 'warning' ? 'warning' :
                                     item.type === 'danger' ? 'error' : 'info'}
                                </span>
                                {item.title}
                            </div>
                            <p className="opacity-90 pl-6">{item.message}</p>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AiAdvisor;
