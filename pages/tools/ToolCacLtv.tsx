
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pdfService } from '../../src/services/pdfService';

// --- TYPES & INTERFACES ---

type Mode = 'landing' | 'quick' | 'complete';
type Tab = 'cac' | 'ltv' | 'economics' | 'scenarios' | 'benchmarks';

interface QuickInputs {
  expenses: number;
  customers: number;
  arpu: number;
  retention: number;
  margin: number;
}

interface CompleteInputs {
  // CAC Breakdown
  expGoogle: number;
  expFacebook: number;
  expLinkedin: number;
  expSeo: number;
  expEmail: number;
  expAffiliates: number;
  expEvents: number;
  expSalaries: number;
  expCommissions: number;
  expTools: number;
  
  // Funnel
  totalLeads: number;
  qualifiedLeads: number;
  newCustomers: number; // Override if needed, usually driven by funnel or direct input

  // LTV Drivers
  arpu: number;
  basket: number;
  frequency: number;
  churn: number;
  upsell: number;
  cogs: number;

  // Economics
  supportCost: number;
  otherCosts: number;
}

// --- CONSTANTS ---

const DEFAULT_QUICK: QuickInputs = {
  expenses: 500000,
  customers: 50,
  arpu: 5000,
  retention: 24,
  margin: 70
};

const DEFAULT_COMPLETE: CompleteInputs = {
  expGoogle: 150000, expFacebook: 100000, expLinkedin: 0, expSeo: 50000,
  expEmail: 20000, expAffiliates: 0, expEvents: 0, expSalaries: 150000,
  expCommissions: 20000, expTools: 10000,
  totalLeads: 1000, qualifiedLeads: 200, newCustomers: 50,
  arpu: 5000, basket: 0, frequency: 0,
  churn: 5, upsell: 0, cogs: 30,
  supportCost: 200, otherCosts: 100
};

const ToolCacLtv: React.FC = () => {
  const [mode, setMode] = useState<Mode>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('cac');
  
  const [quickData, setQuickData] = useState<QuickInputs>(DEFAULT_QUICK);
  const [completeData, setCompleteData] = useState<CompleteInputs>(DEFAULT_COMPLETE);

  // --- HELPERS ---
  
  const formatMoney = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return '0 DA';
    return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(Math.round(num)) + ' DA';
  };
  const formatPercent = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return '0%';
    return num.toFixed(1) + '%';
  };

  // --- CALCULATIONS: QUICK ---

  const calculateQuick = () => {
    const expenses = quickData.expenses || 0;
    const customers = quickData.customers || 0;
    const arpu = quickData.arpu || 0;
    const retention = quickData.retention || 0;
    const margin = quickData.margin || 0;

    const cac = customers > 0 ? expenses / customers : 0;
    const ltv = arpu * retention * (margin / 100);
    const ratio = cac > 0 ? ltv / cac : 0;
    const monthlyContribution = arpu * (margin / 100);
    const payback = monthlyContribution > 0 ? cac / monthlyContribution : 0;

    return { cac, ltv, ratio, payback };
  };

  const quickResults = calculateQuick();

  // --- CALCULATIONS: COMPLETE ---

  const calculateComplete = () => {
    // 1. CAC
    const totalExpenses = completeData.expGoogle + completeData.expFacebook + completeData.expLinkedin + 
                          completeData.expSeo + completeData.expEmail + completeData.expAffiliates + 
                          completeData.expEvents + completeData.expSalaries + completeData.expCommissions + completeData.expTools;
    
    const cac = completeData.newCustomers > 0 ? totalExpenses / completeData.newCustomers : 0;

    // Funnel Rates
    const qualRate = completeData.totalLeads > 0 ? (completeData.qualifiedLeads / completeData.totalLeads) * 100 : 0;
    const convRate = completeData.qualifiedLeads > 0 ? (completeData.newCustomers / completeData.qualifiedLeads) * 100 : 0;
    const globalConv = completeData.totalLeads > 0 ? (completeData.newCustomers / completeData.totalLeads) * 100 : 0;

    // 2. LTV
    const marginPercent = 100 - completeData.cogs;
    const lifetime = completeData.churn > 0 ? (100 / completeData.churn) : 24; // Cap à 24 mois si churn 0 pour eviter infini
    
    const ltvSimple = completeData.arpu * lifetime * (marginPercent / 100);
    const ltvUpsell = ltvSimple * (1 + completeData.upsell / 100);

    // 3. Unit Economics
    const cogsAmount = completeData.arpu * (completeData.cogs / 100);
    const contributionMargin = completeData.arpu - cogsAmount - completeData.supportCost - completeData.otherCosts;
    const contributionRatio = completeData.arpu > 0 ? (contributionMargin / completeData.arpu) * 100 : 0;
    const payback = contributionMargin > 0 ? cac / contributionMargin : 0;
    const ratio = cac > 0 ? ltvUpsell / cac : 0;

    return {
      totalExpenses, cac,
      qualRate, convRate, globalConv,
      marginPercent, lifetime, ltvSimple, ltvUpsell,
      contributionMargin, contributionRatio, payback, ratio
    };
  };

  const fullResults = calculateComplete();

  // --- EVENT HANDLERS ---

  const handleQuickChange = (field: keyof QuickInputs, value: number) => {
    setQuickData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteChange = (field: keyof CompleteInputs, value: number) => {
    setCompleteData(prev => ({ ...prev, [field]: value }));
  };

  const switchToComplete = () => {
    // Transfert intelligent des données
    setCompleteData(prev => ({
      ...prev,
      expGoogle: quickData.expenses, // On met tout dans Google par défaut pour matcher le total
      expFacebook: 0, expSalaries: 0, expCommissions: 0, expTools: 0, expSeo: 0, expEmail: 0,
      newCustomers: quickData.customers,
      arpu: quickData.arpu,
      cogs: 100 - quickData.margin,
      // churn estimé depuis retention
      churn: quickData.retention > 0 ? 100 / quickData.retention : 5
    }));
    setMode('complete');
  };

  // --- EXPORT ---

  const exportPDF = (type: 'quick' | 'complete') => {
    const results = type === 'quick' ? quickResults : fullResults;
    const inputs = type === 'quick' ? quickData : completeData;
    
    pdfService.generateCacLtvPdf({ inputs, results });
  };

  const getRatioColor = (ratio: number) => {
    if (!isFinite(ratio)) return 'text-slate-500';
    if (ratio >= 3) return 'text-green-500';
    if (ratio >= 1) return 'text-yellow-500';
    return 'text-red-500';
  };

  // --- RENDER ---

  if (mode === 'landing') {
    return (
      <div className="bg-background-light min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Calculateur CAC/LTV & Unit Economics</h1>
            <p className="text-lg text-slate-600">Mesurez la rentabilité de votre modèle d'acquisition client.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12 text-center">
            <p className="text-blue-900 font-medium">Le ratio LTV/CAC est l'indicateur roi des investisseurs. Un ratio {'>'} 3 indique un modèle sain et scalable.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Calculateur Rapide</h3>
              <p className="text-slate-500 mb-8">Estimation en 30 secondes avec 5 indicateurs clés.</p>
              <button onClick={() => setMode('quick')} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                Commencer
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">analytics</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Calculateur Complet</h3>
              <p className="text-slate-500 mb-8">Analyse détaillée du funnel, des coûts et des scénarios.</p>
              <button onClick={() => setMode('complete')} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quick') {
    return (
      <div className="bg-background-light min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setMode('landing')} className="text-slate-500 hover:text-primary mb-6 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Retour
          </button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">bolt</span>
                Mode Rapide
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dépenses Marketing (Mensuel)</label>
                  <input type="number" className="w-full p-3 border border-slate-300 rounded-xl" value={quickData.expenses || ''} onChange={e => handleQuickChange('expenses', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nouveaux Clients (Mensuel)</label>
                  <input type="number" className="w-full p-3 border border-slate-300 rounded-xl" value={quickData.customers || ''} onChange={e => handleQuickChange('customers', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ARPU (Revenu/client/mois)</label>
                  <input type="number" className="w-full p-3 border border-slate-300 rounded-xl" value={quickData.arpu || ''} onChange={e => handleQuickChange('arpu', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rétention moyenne (mois)</label>
                  <input type="number" className="w-full p-3 border border-slate-300 rounded-xl" value={quickData.retention || ''} onChange={e => handleQuickChange('retention', parseFloat(e.target.value))} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-bold text-slate-700">Marge Brute</label>
                    <span className="font-bold text-primary">{quickData.margin}%</span>
                  </div>
                  <input type="range" min="0" max="100" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" value={quickData.margin} onChange={e => handleQuickChange('margin', parseFloat(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase">CAC</p>
                  <p className="text-2xl font-black text-slate-900">{formatMoney(quickResults.cac)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase">LTV</p>
                  <p className="text-2xl font-black text-slate-900">{formatMoney(quickResults.ltv)}</p>
                </div>
              </div>

              <div className={`p-8 rounded-2xl border-2 text-center ${quickResults.ratio >= 3 ? 'bg-green-50 border-green-200' : quickResults.ratio >= 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm font-bold uppercase opacity-70 mb-2">Ratio LTV / CAC</p>
                <p className={`text-6xl font-black ${getRatioColor(quickResults.ratio)}`}>{!isFinite(quickResults.ratio) ? '∞' : quickResults.ratio.toFixed(2)}x</p>
                <div className="mt-4 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${quickResults.ratio >= 3 ? 'bg-green-200 text-green-800' : quickResults.ratio >= 1 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                    {quickResults.ratio >= 3 ? "Excellent" : quickResults.ratio >= 1 ? "Moyen" : "Critique"}
                  </span>
                </div>
                <p className="text-sm mt-4 opacity-80">Payback Period : <b>{!isFinite(quickResults.payback) ? '-' : quickResults.payback.toFixed(1)} mois</b></p>
              </div>

              {/* Simple Chart Visualization */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-center">Comparaison Visuelle</h3>
                <div className="flex items-end justify-center gap-8 h-40">
                  <div className="w-16 bg-red-400 rounded-t-lg relative group" style={{ height: '40%' }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">CAC</span>
                  </div>
                  <div className="w-16 bg-green-500 rounded-t-lg relative group" style={{ height: `${Math.min(quickResults.ratio * 40, 100)}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">LTV</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={switchToComplete} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">
                  Basculer vers le mode Complet
                </button>
                <button onClick={() => exportPDF('quick')} className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Télécharger le rapport (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE MODE
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => setMode('landing')} className="text-slate-500 hover:text-primary mb-6 flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Retour
        </button>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Calculateur Complet</h1>
            <p className="text-slate-500">Analyse détaillée de vos unit economics.</p>
          </div>
          <button onClick={() => exportPDF('complete')} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined">download</span> Rapport
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
          {[
            { id: 'cac', label: 'Coût Acquisition (CAC)' },
            { id: 'ltv', label: 'Lifetime Value (LTV)' },
            { id: 'economics', label: 'Unit Economics' },
            { id: 'scenarios', label: 'Scénarios' },
            { id: 'benchmarks', label: 'Benchmarks' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          
          {activeTab === 'cac' && (
            <div className="animate-fade-in">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b">Dépenses Mensuelles (DZD)</h3>
                  <div className="space-y-4">
                    {[
                      { k: 'expGoogle', l: 'Google Ads' }, { k: 'expFacebook', l: 'Facebook / Insta' }, 
                      { k: 'expLinkedin', l: 'LinkedIn Ads' }, { k: 'expSeo', l: 'SEO / Contenu' },
                      { k: 'expEmail', l: 'Emailing' }, { k: 'expSalaries', l: 'Salaires Sales/Mkt' }
                    ].map(({ k, l }) => (
                      <div key={k} className="flex items-center justify-between">
                        <label className="text-sm text-slate-600 font-medium">{l}</label>
                        <input 
                          type="number" 
                          className="w-32 p-2 border border-slate-300 rounded text-right font-mono" 
                          value={(completeData as any)[k]} 
                          onChange={e => handleCompleteChange(k as keyof CompleteInputs, parseFloat(e.target.value))} 
                        />
                      </div>
                    ))}
                    <div className="pt-4 border-t flex justify-between items-center font-bold text-lg">
                      <span>Total Dépenses</span>
                      <span>{formatMoney(fullResults.totalExpenses)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b">Funnel d'Acquisition</h3>
                  <div className="space-y-6 relative">
                    {/* Funnel Visual */}
                    <div className="relative z-10">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-bold text-blue-900">Total Leads</label>
                          <input type="number" className="w-24 p-1 border rounded text-right text-sm" value={completeData.totalLeads} onChange={e => handleCompleteChange('totalLeads', parseFloat(e.target.value))} />
                        </div>
                      </div>
                      
                      <div className="w-0.5 h-6 bg-slate-300 mx-auto"></div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2 w-[90%] mx-auto">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-bold text-blue-900">Leads Qualifiés</label>
                          <input type="number" className="w-24 p-1 border rounded text-right text-sm" value={completeData.qualifiedLeads} onChange={e => handleCompleteChange('qualifiedLeads', parseFloat(e.target.value))} />
                        </div>
                        <div className="text-xs text-blue-600 text-right">Taux Qualif: {formatPercent(fullResults.qualRate)}</div>
                      </div>

                      <div className="w-0.5 h-6 bg-slate-300 mx-auto"></div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 w-[80%] mx-auto">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-bold text-green-900">Clients</label>
                          <input type="number" className="w-24 p-1 border rounded text-right text-sm" value={completeData.newCustomers} onChange={e => handleCompleteChange('newCustomers', parseFloat(e.target.value))} />
                        </div>
                        <div className="text-xs text-green-600 text-right">Taux Conv: {formatPercent(fullResults.convRate)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-slate-900 text-white rounded-xl text-center shadow-lg">
                    <p className="text-sm opacity-60 uppercase font-bold mb-1">CAC Global</p>
                    <p className="text-4xl font-black">{formatMoney(fullResults.cac)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ltv' && (
            <div className="animate-fade-in grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b">Paramètres Revenus</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ARPU (Revenu/client/mois)</label>
                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={completeData.arpu} onChange={e => handleCompleteChange('arpu', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-bold text-slate-700">Taux de Churn Mensuel</label>
                      <span className="font-bold text-red-500">{completeData.churn}%</span>
                    </div>
                    <input type="range" min="0.5" max="20" step="0.5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" value={completeData.churn} onChange={e => handleCompleteChange('churn', parseFloat(e.target.value))} />
                    <p className="text-xs text-slate-500 mt-1">Durée de vie estimée : <b>{fullResults.lifetime.toFixed(1)} mois</b></p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Coût des services (COGS %)</label>
                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={completeData.cogs} onChange={e => handleCompleteChange('cogs', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Expansion / Upsell (%)</label>
                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={completeData.upsell} onChange={e => handleCompleteChange('upsell', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase">Marge Brute</p>
                  <p className="text-3xl font-black text-slate-900">{fullResults.marginPercent}%</p>
                </div>
                <div className="bg-green-50 p-8 rounded-xl border border-green-200 text-center shadow-sm">
                  <p className="text-sm font-bold text-green-800 uppercase mb-2">LTV (Lifetime Value)</p>
                  <p className="text-5xl font-black text-green-600 mb-2">{formatMoney(fullResults.ltvUpsell)}</p>
                  <p className="text-sm text-green-700 opacity-80">Revenu net total généré par un client</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'economics' && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4">Revenus</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span>ARPU</span>
                    <span className="font-bold">{formatMoney(completeData.arpu)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2 text-green-600">
                    <span>Upsell ({completeData.upsell}%)</span>
                    <span className="font-bold">+{formatMoney(completeData.arpu * (completeData.upsell/100))}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4">Coûts Variables</h4>
                  <div className="flex justify-between text-sm mb-2 text-red-500">
                    <span>COGS ({completeData.cogs}%)</span>
                    <span className="font-bold">-{formatMoney(completeData.arpu * (completeData.cogs/100))}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Support Client</span>
                    <input type="number" className="w-20 p-1 text-right border rounded" value={completeData.supportCost} onChange={e => handleCompleteChange('supportCost', parseFloat(e.target.value))} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Autres</span>
                    <input type="number" className="w-20 p-1 text-right border rounded" value={completeData.otherCosts} onChange={e => handleCompleteChange('otherCosts', parseFloat(e.target.value))} />
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center">
                  <p className="opacity-70 text-sm font-bold uppercase">Marge de Contribution</p>
                  <p className="text-3xl font-black my-2">{formatMoney(fullResults.contributionMargin)}</p>
                  <p className="text-sm opacity-60">par client / mois</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Rentabilité Unitaire</h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center flex-1">
                    <p className="text-xs text-slate-500 uppercase font-bold">CAC</p>
                    <p className="text-2xl font-bold text-red-500">{formatMoney(fullResults.cac)}</p>
                  </div>
                  <div className="text-2xl text-slate-300">→</div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-slate-500 uppercase font-bold">Payback Period</p>
                    <p className="text-2xl font-bold text-slate-900">{fullResults.payback.toFixed(1)} mois</p>
                  </div>
                  <div className="text-2xl text-slate-300">→</div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-slate-500 uppercase font-bold">LTV</p>
                    <p className="text-2xl font-bold text-green-500">{formatMoney(fullResults.ltvUpsell)}</p>
                  </div>
                </div>
                
                {/* Visual Bar */}
                <div className="mt-8 h-8 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                  {/* Payback zone */}
                  <div className="h-full bg-red-400" style={{ width: `${Math.min((fullResults.payback / fullResults.lifetime) * 100, 100)}%` }}></div>
                  {/* Profit zone */}
                  <div className="h-full bg-green-500 flex-1"></div>
                  
                  <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                    Seuil de rentabilité à {fullResults.payback.toFixed(1)} mois sur {fullResults.lifetime.toFixed(1)} mois de vie
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="animate-fade-in space-y-6">
              <h3 className="font-bold text-lg text-slate-900">Analyse de Sensibilité</h3>
              <p className="text-slate-500">Quel impact si vous améliorez vos métriques de 10% ou 20% ?</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="p-4">Scénario</th>
                      <th className="p-4">Impact CAC</th>
                      <th className="p-4">Impact LTV</th>
                      <th className="p-4">Nouveau Ratio</th>
                      <th className="p-4 text-right">Gain LTV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 font-medium text-slate-900">Actuel</td>
                      <td className="p-4">{formatMoney(fullResults.cac)}</td>
                      <td className="p-4">{formatMoney(fullResults.ltvUpsell)}</td>
                      <td className="p-4 font-bold">{fullResults.ratio.toFixed(2)}x</td>
                      <td className="p-4 text-right">-</td>
                    </tr>
                    <tr className="bg-green-50/50">
                      <td className="p-4 font-medium text-slate-900">Réduire le Churn de 20%</td>
                      <td className="p-4 text-slate-500">{formatMoney(fullResults.cac)}</td>
                      <td className="p-4 font-bold text-green-600">{formatMoney(fullResults.ltvUpsell * 1.25)}</td>
                      <td className="p-4 font-bold">{(fullResults.ratio * 1.25).toFixed(2)}x</td>
                      <td className="p-4 text-right font-bold text-green-600">+{formatMoney(fullResults.ltvUpsell * 0.25)}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate-900">Augmenter ARPU de 20%</td>
                      <td className="p-4 text-slate-500">{formatMoney(fullResults.cac)}</td>
                      <td className="p-4 font-bold text-green-600">{formatMoney(fullResults.ltvUpsell * 1.2)}</td>
                      <td className="p-4 font-bold">{(fullResults.ratio * 1.2).toFixed(2)}x</td>
                      <td className="p-4 text-right font-bold text-green-600">+{formatMoney(fullResults.ltvUpsell * 0.2)}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate-900">Réduire CAC de 20%</td>
                      <td className="p-4 font-bold text-green-600">{formatMoney(fullResults.cac * 0.8)}</td>
                      <td className="p-4 text-slate-500">{formatMoney(fullResults.ltvUpsell)}</td>
                      <td className="p-4 font-bold">{(fullResults.ltvUpsell / (fullResults.cac * 0.8)).toFixed(2)}x</td>
                      <td className="p-4 text-right text-slate-400">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Ratio LTV/CAC", val: fullResults.ratio.toFixed(2), target: "> 3.0", good: fullResults.ratio >= 3 },
                  { label: "Payback Period", val: fullResults.payback.toFixed(1) + " mois", target: "< 12 mois", good: fullResults.payback <= 12 },
                  { label: "Churn Mensuel", val: completeData.churn + "%", target: "< 5%", good: completeData.churn <= 5 },
                  { label: "Marge Brute", val: fullResults.marginPercent + "%", target: "> 70%", good: fullResults.marginPercent >= 70 }
                ].map((bench, idx) => (
                  <div key={idx} className={`p-6 rounded-xl border ${bench.good ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs font-bold uppercase text-slate-500 mb-2">{bench.label}</p>
                    <p className={`text-2xl font-black mb-1 ${bench.good ? 'text-green-700' : 'text-red-700'}`}>{bench.val}</p>
                    <p className="text-xs text-slate-600">Cible : {bench.target}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800 text-white p-8 rounded-xl shadow-lg">
                <h3 className="font-bold text-xl mb-4">Nos Recommandations</h3>
                <ul className="space-y-3 text-slate-300">
                  {fullResults.ratio < 3 && <li className="flex gap-2">⚠️ <b>Ratio LTV/CAC faible :</b> Vous dépensez trop pour acquérir des clients par rapport à ce qu'ils rapportent. Essayez d'augmenter vos prix ou de réduire vos coûts marketing.</li>}
                  {fullResults.payback > 12 && <li className="flex gap-2">⚠️ <b>Payback long :</b> Il vous faut plus d'un an pour rentabiliser un client. Cela pèse sur votre trésorerie. Focalisez-vous sur l'upsell rapide.</li>}
                  {completeData.churn > 5 && <li className="flex gap-2">⚠️ <b>Churn élevé :</b> Améliorez votre produit et votre service client. Une réduction de 50% du churn doublerait votre LTV !</li>}
                  {fullResults.ratio >= 3 && fullResults.payback <= 12 && <li className="flex gap-2">✅ <b>Excellents fondamentaux :</b> Votre modèle est sain. C'est le moment d'accélérer les dépenses marketing pour scaler !</li>}
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ToolCacLtv;
