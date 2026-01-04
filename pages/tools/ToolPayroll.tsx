
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pdfService } from '../../src/services/pdfService';
import { userStorage } from '../../src/services/userStorage';

// Interface pour une prime dynamique
interface Bonus {
  id: number;
  name: string;
  amount: number;
  isContributable: boolean; // Soumis à cotisation CNAS (9%)
  isTaxable: boolean;      // Soumis à l'impôt IRG
}

const ToolPayroll: React.FC = () => {
  // --- STATE INPUTS ---
  const [baseSalary, setBaseSalary] = useState(70000);
  const [daysWorked, setDaysWorked] = useState(22);
  const [hoursWorked, setHoursWorked] = useState(173.33);
  
  // Informations Entreprise & Employé
  const [companyInfo, setCompanyInfo] = useState({
    name: 'SARL EXEMPLE ALGÉRIE',
    address: '123 Rue Didouche Mourad, Alger',
    phone: '+213 21 XX XX XX',
    nif: '98765432100012',
    nis: '123456789',
    cnas: '16340414771'
  });
  
  const [employeeInfo, setEmployeeInfo] = useState({
    name: 'BOURRAOUI Ahmed',
    position: 'Responsable RH',
    category: 'Cadre',
    matricule: '00001',
    ss: '99 99 99 99 99',
    entryDate: '2020-01-01',
    rib: '001 234 567 890 123 456 78',
    children: 2,
    situation: 'Marié(e)'
  });

  const [showCompanyForm, setShowCompanyForm] = useState(false);

  // Liste des primes
  const [bonuses, setBonuses] = useState<Bonus[]>([
    { id: 1, name: 'IEP (Expérience)', amount: 10500, isContributable: true, isTaxable: true },
    { id: 2, name: 'PRI (Rendement)', amount: 8000, isContributable: true, isTaxable: true },
    { id: 3, name: 'Indemnité de Panier', amount: 5000, isContributable: false, isTaxable: true },
    { id: 4, name: 'Transport', amount: 2000, isContributable: false, isTaxable: true },
  ]);

  const [isHandicapped, setIsHandicapped] = useState(false);

  // --- STATE RESULTS ---
  const [results, setResults] = useState<any>(null);

  // CHARGEMENT PROFIL CENTRALISÉ
  useEffect(() => {
    const globalProfile = userStorage.getUserProfile();
    if (globalProfile.companyName && globalProfile.companyName !== 'Ma Société') {
        setCompanyInfo(prev => ({
            ...prev,
            name: globalProfile.companyName,
            address: globalProfile.address,
            nif: globalProfile.nif
        }));
    }
  }, []);

  // Force recalculation on any change
  useEffect(() => {
    calculatePayroll();
  }, [baseSalary, bonuses, isHandicapped]);

  // --- ACTIONS ---

  const addBonus = () => {
    const newId = bonuses.length > 0 ? Math.max(...bonuses.map(b => b.id)) + 1 : 1;
    setBonuses(prev => [...prev, { id: newId, name: 'Nouvelle Prime', amount: 0, isContributable: true, isTaxable: true }]);
  };

  const removeBonus = (id: number) => {
    setBonuses(prev => prev.filter(b => b.id !== id));
  };

  const updateBonus = (id: number, field: keyof Bonus, value: any) => {
    setBonuses(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, [field]: value };
      }
      return b;
    }));
  };

  // --- CALCULATION ENGINE ---

  const calculateIRG = (imposable: number) => {
    // Barème IRG 2020/2025
    let impm = 0; 
    
    if (imposable <= 20000) {
        impm = 0;
    } else if (imposable <= 40000) {
        impm = (imposable - 20000) * 0.23;
    } else if (imposable <= 80000) {
        impm = (40000 - 20000) * 0.23 + (imposable - 40000) * 0.27;
    } else if (imposable <= 160000) {
        impm = (40000 - 20000) * 0.23 + (80000 - 40000) * 0.27 + (imposable - 80000) * 0.30;
    } else if (imposable <= 320000) {
         impm = (40000 - 20000) * 0.23 + (80000 - 40000) * 0.27 + (160000 - 80000) * 0.30 + (imposable - 160000) * 0.33;
    } else {
         impm = (40000 - 20000) * 0.23 + (80000 - 40000) * 0.27 + (160000 - 80000) * 0.30 + (320000 - 160000) * 0.33 + (imposable - 320000) * 0.35;
    }

    // Abattement 40%
    let abat = impm * 0.40;
    if (abat < 1000) abat = 1000;
    if (abat > 1500) abat = 1500;
    
    let ret = impm - abat;
    if (ret < 0) ret = 0;
    
    // Décotes Spécifiques
    if (imposable <= 30000) {
        return 0;
    }

    let n_rv = ret;

    if (isHandicapped) { 
        if (imposable <= 42500) {
            let x = ret * 93;
            x = x / 61;
            let y = 81213;
            y = y / 41;
            n_rv = x - y;
        }
    } else {
        if (imposable <= 35000) {
            let x = ret * 137;
            x = x / 51;
            let y = 27925;
            y = y / 8;
            n_rv = x - y;
        }
    }

    if (n_rv < 0) n_rv = 0;

    return n_rv;
  };

  const calculatePayroll = () => {
    const cotisableBonuses = bonuses.filter(b => b.isContributable).reduce((sum, b) => sum + (b.amount || 0), 0);
    const taxableNonContributableBonuses = bonuses.filter(b => !b.isContributable && b.isTaxable).reduce((sum, b) => sum + (b.amount || 0), 0);
    const exemptBonuses = bonuses.filter(b => !b.isContributable && !b.isTaxable).reduce((sum, b) => sum + (b.amount || 0), 0);

    const salaryPoste = baseSalary + cotisableBonuses;
    const cnas = salaryPoste * 0.09;
    const taxableIncome = (salaryPoste - cnas) + taxableNonContributableBonuses;
    const irg = calculateIRG(taxableIncome);
    const netSalary = taxableIncome - irg + exemptBonuses;
    const patronalCharges = salaryPoste * 0.26;
    const totalEmployerCost = salaryPoste + taxableNonContributableBonuses + exemptBonuses + patronalCharges;

    setResults({
      salaryPoste,
      cnas,
      taxableIncome,
      irg,
      netSalary,
      patronalCharges,
      totalEmployerCost,
      cotisableBonuses,
      taxableNonContributableBonuses,
      exemptBonuses
    });
  };

  const handleExport = () => {
    if (results) {
        pdfService.generatePayslipPdf({
            baseSalary,
            bonuses,
            results,
            daysWorked,
            hoursWorked,
            companyInfo,
            employeeInfo
        });
    }
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 2 }).format(amount);

  return (
    <div className="bg-background-light min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/outils" className="text-slate-500 hover:text-primary mb-4 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Retour aux outils
          </Link>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Simulateur de Paie Algérie</h1>
                <p className="text-slate-600">Calcul conforme IRG 2025 (Fiche de Paie Détaillée).</p>
            </div>
            <Link to="/dashboard" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-2 md:mt-0">
                <span className="material-symbols-outlined text-xs">settings</span> Gérer l'entreprise
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* GAUCHE : Formulaire */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Informations Entreprise & Employé */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                    onClick={() => setShowCompanyForm(!showCompanyForm)}
                    className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">domain</span>
                        Informations En-tête Bulletin
                    </span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${showCompanyForm ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                
                {showCompanyForm && (
                    <div className="p-6 space-y-4 border-t border-slate-100 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nom de l'Entreprise</label>
                            <input type="text" className="w-full p-2 border rounded text-sm" value={companyInfo.name} onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">NIF</label>
                                <input type="text" className="w-full p-2 border rounded text-sm" value={companyInfo.nif} onChange={e => setCompanyInfo({...companyInfo, nif: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">N° CNAS</label>
                                <input type="text" className="w-full p-2 border rounded text-sm" value={companyInfo.cnas} onChange={e => setCompanyInfo({...companyInfo, cnas: e.target.value})} />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Employé</label>
                            <input type="text" className="w-full p-2 border rounded text-sm" value={employeeInfo.name} onChange={e => setEmployeeInfo({...employeeInfo, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fonction</label>
                                <input type="text" className="w-full p-2 border rounded text-sm" value={employeeInfo.position} onChange={e => setEmployeeInfo({...employeeInfo, position: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                                <input type="text" className="w-full p-2 border rounded text-sm" value={employeeInfo.category} onChange={e => setEmployeeInfo({...employeeInfo, category: e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Salaire Base */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Salaire de Base (DA)</label>
              <input 
                type="number" 
                value={baseSalary} 
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono text-lg text-right font-bold text-slate-800"
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Jours travaillés</label>
                    <input type="number" className="w-full p-2 border rounded text-sm" value={daysWorked} onChange={e => setDaysWorked(parseFloat(e.target.value))} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Heures (Mensuel)</label>
                    <input type="number" className="w-full p-2 border rounded text-sm" value={hoursWorked} onChange={e => setHoursWorked(parseFloat(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Gestion des Primes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Primes & Indemnités</h3>
                <button onClick={addBonus} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">add</span> Ajouter
                </button>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {bonuses.map((bonus) => (
                  <div key={bonus.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between gap-2 mb-2">
                      <input 
                        type="text" 
                        value={bonus.name}
                        onChange={(e) => updateBonus(bonus.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-b border-slate-300 text-sm font-medium focus:border-primary outline-none"
                        placeholder="Nom de la prime"
                      />
                      <input 
                        type="number" 
                        value={bonus.amount}
                        onChange={(e) => updateBonus(bonus.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-24 text-right bg-transparent border-b border-slate-300 text-sm font-bold focus:border-primary outline-none"
                        placeholder="0"
                      />
                      <button onClick={() => removeBonus(bonus.id)} className="text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={bonus.isContributable} 
                          onChange={(e) => updateBonus(bonus.id, 'isContributable', e.target.checked)}
                          className="w-3.5 h-3.5 text-primary rounded border-slate-300"
                        />
                        <span className="text-xs text-slate-600">Cotisable</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={bonus.isTaxable} 
                          onChange={(e) => updateBonus(bonus.id, 'isTaxable', e.target.checked)}
                          className="w-3.5 h-3.5 text-primary rounded border-slate-300"
                        />
                        <span className="text-xs text-slate-600">Imposable</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* DROITE : Résultats */}
          <div className="lg:col-span-7">
            {results && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-24 font-[Segoe UI,Tahoma,Geneva,Verdana,sans-serif]">
                    
                    {/* Header Premium style HTML Model */}
                    <div className="bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
                                <p className="text-white/80 text-xs mt-1">BULLETIN DE PAIE</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium opacity-70 mb-1">NET À PAYER</p>
                                <p className="text-4xl font-black text-white tracking-tight whitespace-nowrap font-mono">{formatMoney(results.netSalary)} <span className="text-lg font-bold">DA</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Corps du bulletin */}
                    <div className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-[#ecf0f7] text-[#1e3c72] font-bold uppercase text-xs border-b-2 border-[#2a5298]">
                                <tr>
                                    <th className="p-4 text-left pl-6">Désignation</th>
                                    <th className="p-4 text-center">Taux</th>
                                    <th className="p-4 text-right pr-6 w-[180px]">Montant (DA)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[#333]">
                                <tr>
                                    <td className="p-3 pl-6 font-medium text-slate-900">Salaire de Base</td>
                                    <td className="p-3 text-center text-slate-500"></td>
                                    <td className="p-3 text-right pr-6 font-bold text-[#1e3c72] font-mono whitespace-nowrap">{formatMoney(baseSalary)}</td>
                                </tr>
                                
                                {bonuses.filter(b => b.isContributable).map(b => (
                                  <tr key={'b-'+b.id}>
                                      <td className="p-3 pl-6 text-slate-600">{b.name}</td>
                                      <td className="p-3 text-center text-slate-400"></td>
                                      <td className="p-3 text-right pr-6 text-[#1e3c72] font-mono whitespace-nowrap">{formatMoney(b.amount)}</td>
                                  </tr>
                                ))}

                                <tr className="bg-[#f8f9fb]">
                                    <td className="p-3 pl-6 font-bold text-[#1e3c72]">Total Salaire Brut</td>
                                    <td className="p-3 text-center"></td>
                                    <td className="p-3 text-right pr-6 font-bold text-[#1e3c72] font-mono whitespace-nowrap">{formatMoney(results.salaryPoste)}</td>
                                </tr>

                                <tr>
                                    <td className="p-3 pl-6 text-slate-600">Retenue SS (CNAS)</td>
                                    <td className="p-3 text-center text-red-500 font-bold">9%</td>
                                    <td className="p-3 text-right pr-6 text-red-600 font-mono whitespace-nowrap">-{formatMoney(results.cnas)}</td>
                                </tr>

                                {/* LIGNE AJOUTÉE : ASSIETTE IMPOSABLE */}
                                <tr className="bg-[#f0f4f8]">
                                    <td className="p-3 pl-6 font-bold text-slate-800">Assiette Imposable IRG</td>
                                    <td className="p-3 text-center text-slate-500"></td>
                                    <td className="p-3 text-right pr-6 font-bold text-slate-800 font-mono whitespace-nowrap">{formatMoney(results.taxableIncome)}</td>
                                </tr>

                                <tr>
                                    <td className="p-3 pl-6 text-slate-600">Retenue IRG</td>
                                    <td className="p-3 text-center text-slate-500">Barème</td>
                                    <td className="p-3 text-right pr-6 text-red-600 font-mono whitespace-nowrap">-{formatMoney(results.irg)}</td>
                                </tr>

                                {bonuses.filter(b => !b.isContributable && b.isTaxable).map(b => (
                                  <tr key={'b-nci-'+b.id}>
                                      <td className="p-3 pl-6 text-slate-600">{b.name} <span className="text-[10px] text-orange-500 bg-orange-50 px-1 rounded ml-2">Non Cot.</span></td>
                                      <td className="p-3 text-center"></td>
                                      <td className="p-3 text-right pr-6 text-[#1e3c72] font-mono whitespace-nowrap">{formatMoney(b.amount)}</td>
                                  </tr>
                                ))}

                                {bonuses.filter(b => !b.isContributable && !b.isTaxable).map(b => (
                                  <tr key={'b-exo-'+b.id}>
                                      <td className="p-3 pl-6 text-slate-600">{b.name} <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded ml-2">Exonéré</span></td>
                                      <td className="p-3 text-center"></td>
                                      <td className="p-3 text-right pr-6 text-[#1e3c72] font-mono whitespace-nowrap">{formatMoney(b.amount)}</td>
                                  </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-center">
                        <button 
                            onClick={handleExport}
                            className="px-8 py-3 bg-[#1e3c72] text-white font-bold rounded-xl hover:bg-[#2a5298] transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">download</span>
                            Télécharger Bulletin Officiel PDF
                        </button>
                    </div>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ToolPayroll;
