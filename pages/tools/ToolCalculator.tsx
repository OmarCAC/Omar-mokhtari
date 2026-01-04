
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { calculatorStorage } from '../../src/modules/calculator/services/calculatorStorage';
import { CalculatorSettings } from '../../src/modules/calculator/types/CalculatorSettings';
import { pdfService } from '../../src/services/pdfService';

const ToolCalculator: React.FC = () => {
  const [settings, setSettings] = useState<CalculatorSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'permanent' | 'ponctuel' | 'audit' | 'creation'>('permanent');
  const location = useLocation();

  // --- State Permanent ---
  const [employees, setEmployees] = useState(2);
  const [turnover, setTurnover] = useState(5000000);
  const [activity, setActivity] = useState('Commerce');
  const [invoiceVolume, setInvoiceVolume] = useState(30); // Nouveau slider

  // --- State Ponctuel ---
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // --- State Audit ---
  const [bilanTotal, setBilanTotal] = useState(25000000);

  // --- State Creation ---
  const [creationType, setCreationType] = useState<'physique' | 'morale'>('morale');

  useEffect(() => {
    try {
      const data = calculatorStorage.getSettings();
      setSettings(data);
    } catch (e) {
      console.error("Erreur chargement settings", e);
      // Fallback au cas où le storage est corrompu
      setSettings(calculatorStorage.resetDefaults());
    }
  }, []);

  // Gestion de l'auto-sélection depuis la navigation (Service Card)
  useEffect(() => {
    if (settings && location.state && (location.state as any).serviceId) {
        const targetServiceId = (location.state as any).serviceId;
        const linkedService = settings.nonPermanentServices?.find(s => s.linkedServiceId === targetServiceId);
        
        if (linkedService) {
            setActiveTab('ponctuel');
            setSelectedServices(prev => {
                if (!prev.includes(linkedService.id)) {
                    return [...prev, linkedService.id];
                }
                return prev;
            });
        }
    }
  }, [settings, location.state]);

  if (!settings) return <div className="min-h-screen bg-background-light flex items-center justify-center">Chargement...</div>;

  // --- Calculs (Sécurisés) ---

  const calculatePermanentFee = () => {
    if (!settings?.permanentRates) return 0;
    
    const baseRate = settings.permanentRates.find(r => r.type === activity)?.monthly || 15000;
    const empCost = employees * (settings.params?.employeeCost || 0);
    const turnoverCost = Math.floor(turnover / 1000000) * (settings.params?.turnoverCostPerMillion || 0);
    
    // Coût volume (Sécurisé)
    const ranges = settings.volumeRanges || [];
    const volumeRange = ranges.find(r => invoiceVolume >= r.min && invoiceVolume <= r.max);
    const volumeCost = volumeRange ? volumeRange.price : 0;

    return baseRate + empCost + turnoverCost + volumeCost;
  };

  const calculatePonctuelFee = () => {
    if (!settings?.nonPermanentServices) return 0;
    return settings.nonPermanentServices
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  };

  const getAuditFee = () => {
    if (!settings?.auditRanges || settings.auditRanges.length === 0) return { min: 0, max: 0 };
    
    const range = settings.auditRanges.find(r => bilanTotal <= r.maxBalance);
    if (range) {
        return { min: range.minFee, max: range.maxFee };
    }
    const lastRange = settings.auditRanges[settings.auditRanges.length - 1];
    return lastRange ? { min: lastRange.minFee, max: lastRange.maxFee } : { min: 0, max: 0 };
  };

  const getCreationFee = () => {
    const defaultRate = { type: 'unknown', label: 'Inconnu', cabinetFee: 0, adminFees: [] };
    if (!settings?.creationRates) return defaultRate;
    // @ts-ignore
    const rate = settings.creationRates.find(r => r.type === creationType);
    return rate || defaultRate;
  };

  const monthlyFee = calculatePermanentFee();
  const ponctuelFee = calculatePonctuelFee();
  const auditFee = getAuditFee();
  const creationRate = getCreationFee();
  const totalAdminFees = creationRate.adminFees ? creationRate.adminFees.reduce((acc, fee) => acc + (fee.amount || 0), 0) : 0;

  // Comparatif Interne
  const internalCost = settings.internalAccountantCost || 80000;
  const savings = internalCost - monthlyFee;
  const savingsYearly = savings * 12;

  // --- Helpers ---
  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
        setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
        setSelectedServices([...selectedServices, id]);
    }
  };

  const handleDownloadPdf = () => {
    const data = getQuoteData();
    pdfService.generateQuotePdf(data, settings);
  };

  // Préparation des données à envoyer au devis
  const getQuoteData = () => {
    if (activeTab === 'permanent') {
      return {
        type: 'Comptabilité Mensuelle',
        price: monthlyFee,
        details: {
          Activity: activity,
          Employees: employees,
          Turnover: turnover,
          Volume: invoiceVolume
        },
        summary: `Estimation pour ${activity} avec ${employees} salariés, un CA de ${(turnover/1000000).toFixed(1)}M DA et ~${invoiceVolume} factures/mois.`
      };
    } else if (activeTab === 'ponctuel') {
      const servicesList = (settings?.nonPermanentServices || [])
        .filter(s => selectedServices.includes(s.id))
        .map(s => s.name)
        .join(', ');
      return {
        type: 'Prestations Ponctuelles',
        price: ponctuelFee,
        details: {
          Services: servicesList || 'Aucun'
        },
        summary: `Demande pour les services suivants : ${servicesList}.`
      };
    } else if (activeTab === 'audit') {
      return {
        type: 'Commissariat aux Comptes',
        price: auditFee.min,
        priceMax: auditFee.max,
        details: {
          BilanTotal: bilanTotal
        },
        summary: `Audit légal pour un bilan total de ${bilanTotal.toLocaleString()} DA.`
      };
    } else {
        const detailsFees = creationRate.adminFees ? creationRate.adminFees.map(f => `${f.label}: ${f.amount} DA`).join('\n') : '';
        return {
            type: "Création d'entreprise",
            price: creationRate.cabinetFee,
            details: {
                Forme: creationRate.label,
                HonorairesCabinet: creationRate.cabinetFee,
                TotalFraisAdmin: totalAdminFees
            },
            summary: `Accompagnement à la création d'une entreprise (${creationRate.label}).\nHonoraires: ${creationRate.cabinetFee} DA\nFrais Admin Estimés: ${totalAdminFees} DA\nDétail: ${detailsFees}`
        };
    }
  };

  const quoteData = getQuoteData();

  return (
    <div className="bg-background-light min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Calculateur d'Honoraires</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Obtenez une estimation précise et immédiate de nos tarifs pour vos besoins comptables.
            </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
            <button onClick={() => setActiveTab('permanent')} className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all ${activeTab === 'permanent' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Comptabilité</button>
            <button onClick={() => setActiveTab('ponctuel')} className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all ${activeTab === 'ponctuel' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Ponctuel</button>
            <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all ${activeTab === 'audit' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Audit</button>
            <button onClick={() => setActiveTab('creation')} className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all ${activeTab === 'creation' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Création</button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left: Inputs */}
          <div className="flex-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
            
            {activeTab === 'permanent' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Paramètres de votre entreprise</h2>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Type d'activité</label>
                        <select 
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 bg-slate-50"
                        >
                            {settings.permanentRates?.map(r => (
                                <option key={r.type} value={r.type}>{r.type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">Effectif</label>
                                <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md text-xs">{employees} pers.</span>
                            </div>
                            <input 
                                type="range" min="0" max="50" value={employees}
                                onChange={(e) => setEmployees(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">Factures / mois</label>
                                <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md text-xs">{invoiceVolume} docs</span>
                            </div>
                            <input 
                                type="range" min="0" max="500" step="10" value={invoiceVolume}
                                onChange={(e) => setInvoiceVolume(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-slate-700">Chiffre d'affaires annuel</label>
                            <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md text-sm">{turnover.toLocaleString()} DA</span>
                        </div>
                        <input 
                            type="range" min="1000000" max="100000000" step="1000000" value={turnover}
                            onChange={(e) => setTurnover(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'ponctuel' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Sélectionnez les services</h2>
                    <div className="space-y-3">
                        {settings.nonPermanentServices?.map((service) => (
                            <div 
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedServices.includes(service.id) ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedServices.includes(service.id) ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                                        {selectedServices.includes(service.id) && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                                    </div>
                                    <span className="font-medium text-slate-800">{service.name}</span>
                                </div>
                                <span className="font-bold text-slate-600">{service.price.toLocaleString()} DA</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="space-y-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Commissariat aux Comptes</h2>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Total du Bilan (Actif ou Passif)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={bilanTotal}
                                onChange={(e) => setBilanTotal(parseInt(e.target.value) || 0)}
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none bg-slate-50 font-mono text-lg"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">DZD</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'creation' && (
                <div className="space-y-8 animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Création d'Entreprise</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div 
                            onClick={() => setCreationType('physique')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${creationType === 'physique' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${creationType === 'physique' ? 'border-primary' : 'border-slate-400'}`}>
                                    {creationType === 'physique' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Personne Physique</h3>
                                    <p className="text-xs text-slate-500">Commerçant, Artisan</p>
                                </div>
                            </div>
                        </div>
                        <div 
                            onClick={() => setCreationType('morale')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${creationType === 'morale' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${creationType === 'morale' ? 'border-primary' : 'border-slate-400'}`}>
                                    {creationType === 'morale' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Personne Morale</h3>
                                    <p className="text-xs text-slate-500">SARL, EURL, SPA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

          </div>

          {/* Right: Summary */}
          <div className="lg:w-1/3 bg-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Estimation</h3>
                
                {activeTab === 'permanent' && (
                    <>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl lg:text-5xl font-black">{monthlyFee.toLocaleString()}</span>
                            <span className="text-xl font-bold text-primary">DZD</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-8">par mois (HT)</p>
                        
                        {/* Comparatif Visuel */}
                        <div className="mb-8">
                            <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Vos économies</p>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-slate-300">
                                        <span>Interne</span>
                                        <span>{internalCost.toLocaleString()} DA</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full w-full"></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-white font-bold">
                                        <span>ComptaLink</span>
                                        <span>{monthlyFee.toLocaleString()} DA</span>
                                    </div>
                                    <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min((monthlyFee/internalCost)*100, 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="mt-3 bg-green-500/20 text-green-400 text-xs px-3 py-2 rounded-lg font-bold text-center border border-green-500/30">
                                Vous économisez {savingsYearly.toLocaleString()} DA / an !
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'ponctuel' && (
                    <>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl lg:text-5xl font-black">{ponctuelFee.toLocaleString()}</span>
                            <span className="text-xl font-bold text-primary">DZD</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-8">Total Estimé (HT)</p>
                        <p className="text-xs text-slate-500">{selectedServices.length} service(s) sélectionné(s)</p>
                    </>
                )}

                {activeTab === 'audit' && (
                    <>
                        <div className="flex flex-col gap-1 mb-8">
                            <span className="text-lg font-bold text-slate-400">Entre</span>
                            <span className="text-3xl lg:text-4xl font-black text-white">{auditFee.min.toLocaleString()} DA</span>
                            <span className="text-lg font-bold text-slate-400">Et</span>
                            <span className="text-3xl lg:text-4xl font-black text-white">{auditFee.max.toLocaleString()} DA</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-8">Honoraires Annuels (HT)</p>
                    </>
                )}

                {activeTab === 'creation' && (
                    <>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl lg:text-5xl font-black">{(creationRate.cabinetFee + totalAdminFees).toLocaleString()}</span>
                            <span className="text-xl font-bold text-primary">DZD</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-8">Total Estimé (Pack Complet)</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm border-b border-slate-700 pb-2">
                                <span className="text-slate-300">Honoraires Cabinet</span>
                                <span className="font-bold text-white">{creationRate.cabinetFee.toLocaleString()}</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2 border-b border-slate-700 pb-2">
                                    <span className="text-slate-300 font-bold">Frais Admin</span>
                                    <span className="font-bold text-slate-400">{totalAdminFees.toLocaleString()}</span>
                                </div>
                                <div className="space-y-1 pl-2">
                                    {creationRate.adminFees && creationRate.adminFees.map((fee, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-slate-500">
                                            <span>• {fee.label}</span>
                                            <span>{fee.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>

            <div className="relative z-10 mt-auto space-y-3">
                <button 
                    onClick={handleDownloadPdf}
                    className="block w-full py-3 bg-slate-800 text-center text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                >
                    <span className="material-symbols-outlined text-sm align-middle mr-2">download</span>
                    Télécharger l'estimation
                </button>
                <Link 
                    to="/quote-request" 
                    state={quoteData}
                    className="block w-full py-4 bg-white text-center text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                >
                    Obtenir mon devis officiel
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCalculator;
