import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userStorage } from '../../src/services/userStorage';
import { pdfService } from '../../src/services/pdfService';
import AiAdvisor from '../../src/components/AiAdvisor';

// --- TYPES ---

interface Investment {
  id: number;
  name: string;
  amount: number;
  duration: number; // en années
  method: 'lineaire' | 'degressif';
  type: 'incorp' | 'corp';
}

interface Funding {
  id: number;
  source: string;
  amount: number;
  type: 'capital' | 'emprunt' | 'subvention' | 'cca';
  rate?: number; // Pour emprunts
  duration?: number; // Pour emprunts
}

interface Product {
  id: number;
  name: string;
  price: number;
  qtyMonth1: number;
  growth: number; // % mensuel
  tva: number;
}

interface Charge {
  id: number;
  name: string;
  amount: number; // Mensuel ou % CA
  type: 'fixe' | 'variable';
  growth?: number; // % annuel pour fixe
  category: '60' | '61' | '62' | '63' | '64' | '65' | '66' | '68'; // Classes SCF
}

interface Staff {
  id: number;
  position: string;
  count: number;
  salary: number; // Brut mensuel
}

interface AppState {
  // Step 1
  companyName: string;
  sector: string;
  legalForm: string;
  nif: string;
  startDate: string;
  duration: number; // 12, 24, 36 mois

  // Data
  investments: Investment[];
  fundings: Funding[];
  products: Product[];
  charges: Charge[];
  staff: Staff[];
  
  // Config
  stockInitial: number;
  tvaRate: number;
  ibsRate: number; // 10, 19, 23, 26
  tapRate: number; // 0 (Supprimée LF 2024/2025)
}

const INITIAL_STATE: AppState = {
  companyName: '',
  sector: '',
  legalForm: 'SARL',
  nif: '',
  startDate: new Date().toISOString().split('T')[0],
  duration: 36,
  investments: [],
  fundings: [],
  products: [],
  charges: [],
  staff: [],
  stockInitial: 0,
  tvaRate: 19,
  ibsRate: 19, // Taux standard production/tourisme/BTP (ou 26% service/commerce)
  tapRate: 0
};

// --- CONSTANTS ---

const SCF_CHARGES_CATEGORIES = [
  { code: '60', label: 'Achats consommés' },
  { code: '61', label: 'Services extérieurs' },
  { code: '62', label: 'Autres services extérieurs' },
  { code: '63', label: 'Charges de personnel' },
  { code: '64', label: 'Impôts, taxes et versements assimilés' },
  { code: '65', label: 'Autres charges opérationnelles' },
  { code: '66', label: 'Charges financières' },
  { code: '68', label: 'Dotations aux amortissements' },
] as const;

// Fix: Completed ToolForecast component to return JSX and added default export
const ToolForecast: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AppState>(INITIAL_STATE);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const location = useLocation();

  // Load from Dashboard if ID provided
  useEffect(() => {
    if (location.state && (location.state as any).data) {
        setFormData((location.state as any).data);
        setProjectId((location.state as any).projectId);
    }
  }, [location.state]);

  // --- ACTIONS ---

  const updateField = (field: keyof AppState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (list: 'investments' | 'fundings' | 'products' | 'charges' | 'staff', item: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [list]: [...(prev[list] as any[]), { ...item, id: Date.now() }] 
    }));
  };

  const removeItem = (list: 'investments' | 'fundings' | 'products' | 'charges' | 'staff', id: number) => {
    setFormData(prev => ({ 
      ...prev, 
      [list]: (prev[list] as any[]).filter(item => item.id !== id) 
    }));
  };

  const calculateResults = () => {
    const years = [1, 2, 3];
    return years.map(year => {
      const caHT = formData.products.reduce((acc, p) => acc + (p.price * p.qtyMonth1 * 12 * Math.pow(1 + p.growth/100, (year-1)*12)), 0);
      const chargesExploit = formData.charges.reduce((acc, c) => {
        if (c.type === 'fixe') return acc + (c.amount * 12 * Math.pow(1 + (c.growth || 0)/100, year-1));
        return acc + (caHT * c.amount / 100);
      }, 0);
      const chargesPersonnel = formData.staff.reduce((acc, s) => acc + (s.salary * s.count * 12 * 1.26), 0);
      
      const ebitda = caHT - chargesExploit - chargesPersonnel;
      const amortissement = formData.investments.reduce((acc, i) => acc + (i.amount / i.duration), 0);
      const resultatExploit = ebitda - amortissement;
      const ibs = resultatExploit > 0 ? resultatExploit * (formData.ibsRate / 100) : 0;
      const resultatNet = resultatExploit - ibs;
      
      return {
        year,
        caHT,
        ebitda,
        resultatExploit,
        resultatNet,
        cashEnd: ebitda * 0.8 // Simple simulation
      };
    });
  };

  const results = calculateResults();

  const handleSave = async () => {
    try {
      const id = await userStorage.saveProject({
        id: projectId || undefined,
        type: 'forecast',
        name: formData.companyName || 'Prévisions Financières',
        data: formData
      });
      setProjectId(id);
      alert("Projet sauvegardé dans Mon Espace !");
    } catch (e) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  if (step === 3) {
    return (
      <div className="bg-slate-50 min-h-screen p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black">Résultats Prévisionnels</h1>
            <div className="flex gap-4">
              <button onClick={handleSave} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold">Sauvegarder</button>
              <button onClick={() => pdfService.generateForecastPdf(formData, results)} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Exporter PDF</button>
              <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-xl font-bold bg-white">Retour</button>
            </div>
          </div>

          <AiAdvisor data={{ results }} type="forecast" />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map(r => (
              <div key={r.year} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Année {r.year}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>CA HT :</span> <span className="font-bold">{Math.round(r.caHT).toLocaleString()} DA</span></div>
                  <div className="flex justify-between text-sm"><span>EBITDA :</span> <span className="font-bold">{Math.round(r.ebitda).toLocaleString()} DA</span></div>
                  <div className="flex justify-between border-t pt-2 mt-2 text-primary"><span>Résultat Net :</span> <span className="font-black text-lg">{Math.round(r.resultatNet).toLocaleString()} DA</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-black mb-8">Prévisions Financières SCF</h1>
        
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold border-b pb-2">1. Configuration</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1">Nom du projet</label>
                <input type="text" className="w-full p-3 border rounded-xl" value={formData.companyName} onChange={e => updateField('companyName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Durée (Mois)</label>
                <select className="w-full p-3 border rounded-xl" value={formData.duration} onChange={e => updateField('duration', parseInt(e.target.value))}>
                  <option value={12}>12 Mois</option>
                  <option value={24}>24 Mois</option>
                  <option value={36}>36 Mois</option>
                </select>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-4 bg-primary text-white font-black rounded-2xl mt-8">Passer aux flux financiers →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
             <h2 className="text-xl font-bold border-b pb-2">2. Saisie des Flux</h2>
             
             <div className="bg-slate-50 p-6 rounded-2xl">
                <h3 className="font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined">payments</span> Investissements</h3>
                <button 
                  onClick={() => addItem('investments', { name: 'Équipement', amount: 500000, duration: 5, method: 'lineaire', type: 'corp' })}
                  className="text-primary font-bold text-sm mb-4"
                >+ Ajouter une ligne</button>
                <div className="space-y-2">
                  {formData.investments.map(inv => (
                    <div key={inv.id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                      <span className="text-sm font-medium">{inv.name} - {inv.amount.toLocaleString()} DA</span>
                      <button onClick={() => removeItem('investments', inv.id)} className="text-red-500 material-symbols-outlined">delete</button>
                    </div>
                  ))}
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 border rounded-2xl font-bold">Retour</button>
                <button onClick={() => setStep(3)} className="flex-1 py-4 bg-primary text-white font-black rounded-2xl">Lancer les calculs →</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolForecast;
