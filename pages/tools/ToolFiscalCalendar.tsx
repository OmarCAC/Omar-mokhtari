import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FISCAL_EVENTS_2025, FiscalFormDefinition, FiscalCategory } from '../../src/modules/tools/services/fiscalCalendarData';
import { fiscalStorage, EventStatusMap } from '../../src/modules/tools/services/fiscalStorage';
import { icsService } from '../../src/services/icsService';
import { TaxRegime } from '../../src/modules/tools/types/Tool';

// --- DATA: GUIDES CONTEXTUELS COMPLETS ---
const QUICK_GUIDES: Record<string, { title: string; steps: string[] }> = {
  // PAIEMENTS MENSUELS
  'G50': {
    title: "G50 - Déclaration Mensuelle (Le Classique)",
    steps: [
      "Cadre I (TAP) : Reportez le Chiffre d'Affaires (CA) imposable encaissé. (Note: TAP supprimée en 2024/2025 pour la plupart, vérifiez votre éligibilité).",
      "Cadre II (TVA) : Indiquez le CA taxable. Calculez la TVA collectée. Déduisez la TVA sur achats (récupérable) du mois.",
      "Cadre III (IRG/IBS) : Reportez la masse salariale brute et l'IRG retenu à la source sur les salaires.",
      "Cadre Timbre : Si paiement en espèces > 0 DA, ajoutez 1% (Min 2500 DA).",
      "Paiement : Total = TVA à payer + IRG Salaires + Timbre."
    ]
  },
  'G50A': {
    title: "G50 A - Déclaration Simplifiée / Agricole",
    steps: [
      "Utilisé principalement par les agriculteurs ou régimes simplifiés.",
      "Déclarez le chiffre d'affaires réalisé sur la période.",
      "Calculez l'impôt forfaitaire ou la retenue selon votre taux spécifique.",
      "N'oubliez pas de signer le bordereau avant dépôt."
    ]
  },
  'G51': {
    title: "G51 - Acompte Provisionnel (IBS/IRG)",
    steps: [
      "Prenez le montant de l'impôt (IBS ou IRG) payé lors du dernier exercice clos (N-1).",
      "Calculez 30% de ce montant pour l'acompte.",
      "Remplissez le bordereau G51 avec ce montant.",
      "Le paiement doit être effectué avant le 20 mars, 20 juin et 20 novembre."
    ]
  },

  // DÉCLARATIONS ANNUELLES
  'G12': {
    title: "G12 / G12 Bis - IFU (Forfaitaire)",
    steps: [
      "G12 (Prévisionnel) : Estimez votre CA annuel. Payez 50% de l'impôt (5% production/vente, 12% services) au dépôt.",
      "G12 Bis (Définitif) : Reportez le CA réel encaissé l'année précédente.",
      "Si le CA réel > CA prévisionnel : Payez la différence (Régularisation).",
      "Si le CA réel < CA prévisionnel : Le trop-perçu est un crédit d'impôt pour l'année suivante."
    ]
  },
  'G4': {
    title: "G4 - Bilan Fiscal (IBS)",
    steps: [
      "Cadre Résultat : Reportez le bénéfice comptable net.",
      "Tableau des Réintégrations : Ajoutez les charges non déductibles (Amendes, Cadeaux > 500 DA, etc.).",
      "Tableau des Déductions : Retirez les produits non imposables ou déjà taxés.",
      "Résultat Fiscal = Résultat Comptable + Réintégrations - Déductions.",
      "Calculez l'IBS dû (19%, 23% ou 26%) et déduisez les acomptes (G51) déjà versés."
    ]
  },
  'G11': {
    title: "G11 - Bénéfices Industriels & Commerciaux (IRG)",
    steps: [
      "Réservé aux personnes physiques au régime réel.",
      "Déclarez le bénéfice net de l'entreprise (comme pour la G4).",
      "Ce montant sera reporté ensuite sur votre déclaration de revenu global (G1)."
    ]
  },
  'G13': {
    title: "G13 - Bénéfices Non Commerciaux (Professions Libérales)",
    steps: [
      "Déclarez l'ensemble des recettes encaissées durant l'année.",
      "Déduisez les dépenses professionnelles justifiées (Loyer, électricité, personnel...).",
      "Le résultat (Bénéfice) sera soumis au barème IRG.",
      "Joignez l'état détaillé des recettes et dépenses."
    ]
  },
  'G1': {
    title: "G1 - Déclaration du Revenu Global",
    steps: [
      "C'est la synthèse de tous vos revenus personnels.",
      "Reportez vos bénéfices professionnels (issus de G11, G13...).",
      "Ajoutez les revenus fonciers (loyers), agricoles ou salariaux.",
      "L'administration calcule l'IRG total dû selon le barème progressif."
    ]
  },
  'G29': {
    title: "G29 - État Annuel des Salaires",
    steps: [
      "Listez tous les employés ayant travaillé durant l'année.",
      "Pour chaque employé : Nom, Prénom, Matricule, Période de travail.",
      "Indiquez le Salaire Brut Imposable et le montant de l'IRG retenu.",
      "Le total de l'IRG doit correspondre à la somme des G50 de l'année."
    ]
  },
  'G37': {
    title: "G37 - Impôt sur la Fortune (IGF)",
    steps: [
      "Concerne les personnes dont le patrimoine net > 100.000.000 DA.",
      "Listez les biens immobiliers (sauf résidence principale), véhicules, bateaux, etc.",
      "Appliquez le taux correspondant à la tranche de valeur.",
      "À déposer et payer avant le 31 mars."
    ]
  },

  // SOCIAL
  'CNAS': {
    title: "Déclaration CNAS (Télécl@r)",
    steps: [
      "Connectez-vous sur le portail Teledeclaration.",
      "Vérifiez l'assiette (Salaire brut imposable de tous les employés).",
      "Taux global : 34.5% (25% patronal + 9% ouvrier).",
      "Pour la DAS (Annuelle) : Déposez le fichier 'das.txt' généré par votre logiciel de paie avant le 31 janvier."
    ]
  },
  'CASNOS': {
    title: "Paiement CASNOS (Non-Salariés)",
    steps: [
      "Assiette : Revenu annuel déclaré de l'année précédente (Min: 32.400 DA/an, Max: 648.000 DA/an).",
      "Taux : 15%.",
      "Déclarez via le portail DAMANE avant le 30 juin.",
      "Le paiement peut être échelonné si demande acceptée."
    ]
  },

  // AUTRES
  'G17': {
    title: "G17 - Plus-Value Immobilière",
    steps: [
      "À déposer sous 30 jours après la vente d'un bien immobilier.",
      "Base imposable = Prix de vente - Prix d'achat (revalorisé).",
      "Taux : 15% libératoire.",
      "Exonération possible si le bien a été détenu plus de 10 ans."
    ]
  },
  
  // DEFAUT
  'DEFAULT': {
    title: "Guide Général",
    steps: [
      "Téléchargez le formulaire officiel via le lien PDF.",
      "Remplissez l'en-tête avec vos coordonnées (NIF, Nom, Adresse).",
      "Ne remplissez que les cases qui concernent votre activité.",
      "Datez, signez et apposez le cachet de l'entreprise.",
      "Payez auprès de votre recette des impôts ou par virement (Jibayatic)."
    ]
  }
};

interface SmartAdvice {
  level: 'success' | 'warning' | 'critical';
  title: string;
  message: string;
  action?: string;
}

interface SimResult {
  principal: number;
  penaltyAmount: number;
  total: number;
  monthsLate: number;
  ruleUsed: string;
  breakdown: string;
  advice: SmartAdvice | null;
}

// État flexible pour gérer les différents champs des formulaires
interface DynamicFormData {
  // G50
  tls_base: number;
  tva_payee: number;
  irg_salaires: number;
  ibs_acompte: number;
  timbre: number;
  
  // G12 / IFU
  ca_production: number; // 5%
  ca_service: number; // 12%
  
  // G4 / G11 / G13
  benefice_imposable: number;
  
  // G17
  plus_value: number;
  
  // Default (Pour les formulaires personnalisés)
  montant_global: number;
}

const INITIAL_DYNAMIC_FORM: DynamicFormData = {
  tls_base: 0,
  tva_payee: 0,
  irg_salaires: 0,
  ibs_acompte: 0,
  timbre: 0,
  ca_production: 0,
  ca_service: 0,
  benefice_imposable: 0,
  plus_value: 0,
  montant_global: 0
};

const ToolFiscalCalendar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'simulator'>('calendar');
  const [userRegime, setUserRegime] = useState<TaxRegime>('reel');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [forms, setForms] = useState<FiscalFormDefinition[]>([]);
  const [categories, setCategories] = useState<FiscalCategory[]>([]);
  const [customLinks, setCustomLinks] = useState<Record<string, string>>({});
  
  // User Progress State
  const [completedEvents, setCompletedEvents] = useState<EventStatusMap>({});

  // Guide Modal State
  const [guideModal, setGuideModal] = useState<{ isOpen: boolean; title: string; steps: string[] } | null>(null);

  // Simulator State
  const [taxType, setTaxType] = useState('G50_PAIEMENT');
  const [formData, setFormData] = useState<DynamicFormData>(INITIAL_DYNAMIC_FORM);
  
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [simResult, setSimResult] = useState<SimResult | null>(null);

  // Charger les données dynamiques
  useEffect(() => {
    const loadData = () => {
        setForms(fiscalStorage.getVisibleForms());
        setCategories(fiscalStorage.getCategories());
        setCustomLinks(fiscalStorage.getLinks());
        setCompletedEvents(fiscalStorage.getEventStatus());
        setUserRegime(fiscalStorage.getUserRegime()); 
    };
    
    loadData();
    
    window.addEventListener('fiscal-links-updated', loadData);
    window.addEventListener('fiscal-rules-updated', loadData); // Listen for rule changes
    window.addEventListener('fiscal-status-updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
        window.removeEventListener('fiscal-links-updated', loadData);
        window.removeEventListener('fiscal-rules-updated', loadData);
        window.removeEventListener('fiscal-status-updated', loadData);
        window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleRegimeChange = (regime: TaxRegime) => {
      setUserRegime(regime);
      fiscalStorage.saveUserRegime(regime);
  };

  const handleToggleEvent = (id: string) => {
      fiscalStorage.toggleEventStatus(id);
      setCompletedEvents(fiscalStorage.getEventStatus());
  };

  // --- NOUVELLE LOGIQUE DE DÉTECTION DU GUIDE ---
  const openGuide = (eventTitle: string) => {
    const titleUpper = eventTitle.toUpperCase();
    let guideKey = 'DEFAULT';

    if (titleUpper.includes('G12') && titleUpper.includes('BIS')) guideKey = 'G12'; 
    else if (titleUpper.includes('G12')) guideKey = 'G12';
    else if (titleUpper.includes('G50 A') || titleUpper.includes('G50A')) guideKey = 'G50A';
    else if (titleUpper.includes('G50')) guideKey = 'G50';
    else if (titleUpper.includes('G51') || titleUpper.includes('ACOMPTE')) guideKey = 'G51';
    else if (titleUpper.includes('G4')) guideKey = 'G4';
    else if (titleUpper.includes('G11')) guideKey = 'G11';
    else if (titleUpper.includes('G13')) guideKey = 'G13';
    else if (titleUpper.includes('G1') && !titleUpper.includes('G11')) guideKey = 'G1'; 
    else if (titleUpper.includes('G29')) guideKey = 'G29';
    else if (titleUpper.includes('G37') || titleUpper.includes('FORTUNE')) guideKey = 'G37';
    else if (titleUpper.includes('G15')) guideKey = 'G15'; 
    else if (titleUpper.includes('G17') || titleUpper.includes('PLUS-VALUE')) guideKey = 'G17';
    else if (titleUpper.includes('CNAS')) guideKey = 'CNAS';
    else if (titleUpper.includes('CASNOS')) guideKey = 'CASNOS';

    const selectedGuide = QUICK_GUIDES[guideKey] || QUICK_GUIDES['DEFAULT'];

    setGuideModal({ 
        isOpen: true, 
        title: selectedGuide.title,
        steps: selectedGuide.steps 
    });
  };

  // Trouver le formulaire actuel et sa catégorie
  const currentForm = forms.find(f => f.id === taxType);
  const currentCategory = currentForm ? categories.find(c => c.id === currentForm.category) : null;

  // Helper pour trouver le lien et le titre
  const getFormInfo = () => {
    if (currentForm) {
        const link = customLinks[currentForm.id] || currentForm.defaultLink;
        return { link, title: currentForm.label };
    }
    return null;
  };

  const formInfo = getFormInfo();

  useEffect(() => {
    setSimResult(null);
    setFormData(INITIAL_DYNAMIC_FORM);
  }, [taxType]);

  const updateField = (field: keyof DynamicFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredEvents = FISCAL_EVENTS_2025.filter(event => {
    const matchesRegime = event.regimes.includes(userRegime);
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegime && matchesSearch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
      const aDone = completedEvents[a.id] ? 1 : 0;
      const bDone = completedEvents[b.id] ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return a.date.localeCompare(b.date);
  });

  const getNextDeadline = () => {
      const now = new Date();
      now.setHours(0,0,0,0);
      const nextEvent = sortedEvents.find(e => {
          const eDate = new Date(e.date);
          eDate.setHours(0,0,0,0);
          return eDate >= now && !completedEvents[e.id];
      });
      return nextEvent;
  };

  const nextDeadline = getNextDeadline();

  const getEventStatus = (date: string, isDone: boolean) => {
    if (isDone) return { label: 'Payé', color: 'bg-green-100 text-green-700 border-green-200' };

    const eventDate = new Date(date);
    const now = new Date();
    now.setHours(0,0,0,0);
    eventDate.setHours(0,0,0,0);

    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'En retard', color: 'bg-red-100 text-red-700 border-red-200 animate-pulse' };
    if (diffDays === 0) return { label: "Aujourd'hui", color: 'bg-orange-100 text-orange-700 border-orange-200 font-bold' };
    if (diffDays <= 7) return { label: `Dans ${diffDays}j`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'À venir', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const calculatePrincipal = (): number => {
    switch (taxType) {
        case 'G50_PAIEMENT':
        case 'G50A_PAIEMENT':
            return (formData.tls_base || 0) + (formData.tva_payee || 0) + (formData.irg_salaires || 0) + (formData.ibs_acompte || 0) + (formData.timbre || 0);
        case 'G12_IFU':
        case 'G12_IFU_DEF':
            return (formData.ca_production * 0.05) + (formData.ca_service * 0.12);
        case 'G4_IBS':
            return formData.benefice_imposable * 0.19;
        case 'G11_IRG':
        case 'G13_BNC':
            return formData.benefice_imposable * 0.20;
        case 'G17_PLUSVALUE':
            return formData.plus_value * 0.15;
        default:
            return formData.montant_global;
    }
  };

  const calculateAdvanced = () => {
    const principal = calculatePrincipal();
    let penaltyAmount = 0;
    let monthsLate = 0;
    let diffDays = 0;
    let ruleDescription = "";
    let breakdownText = "";
    let currentAdvice: SmartAdvice | null = null;

    const due = new Date(dueDate);
    const payment = new Date(paymentDate);

    if (payment > due || taxType.includes('DEFAUT') || taxType.includes('NON_AFFILIATION')) {
      const diffTime = Math.abs(payment.getTime() - due.getTime());
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      monthsLate = Math.ceil(diffDays / 30); 

      // RECUPERATION DE LA RÈGLE DYNAMIQUE
      const rules = fiscalStorage.getPenaltyRules();
      const ruleId = currentCategory?.ruleId || 'rule_flat'; // Fallback
      const rule = rules.find(r => r.id === ruleId) || rules.find(r => r.id === 'rule_flat');

      if (rule) {
          ruleDescription = rule.description || rule.name;

          if (rule.mode === 'cumulative') {
              const base = rule.baseRate / 100;
              const increment = rule.monthlyIncrement / 100;
              let astreinte = 0;
              if (monthsLate > 0) {
                  astreinte = monthsLate * increment;
              }
              
              let totalRate = base + astreinte;
              if (rule.maxRate > 0 && totalRate > (rule.maxRate/100)) {
                  totalRate = rule.maxRate / 100;
              }

              penaltyAmount = principal * totalRate;
              breakdownText = `Principal : ${new Intl.NumberFormat('fr-DZ').format(principal)} DA\n` + 
                              `Base : ${rule.baseRate}%\n` + 
                              `Majoration : ${(increment*100).toFixed(0)}% x ${monthsLate} mois\n` + 
                              `Taux final : ${(totalRate*100).toFixed(0)}%`;

          } else if (rule.mode === 'fixed_rate') {
              const rate = rule.baseRate / 100;
              penaltyAmount = principal * rate;
              breakdownText = `Principal : ${new Intl.NumberFormat('fr-DZ').format(principal)} DA\n` + 
                              `Taux fixe : ${rule.baseRate}%`;

          } else if (rule.mode === 'fixed_amount') {
              penaltyAmount = rule.fixedAmount;
              breakdownText = `Amende forfaitaire : ${new Intl.NumberFormat('fr-DZ').format(rule.fixedAmount)} DA`;
          }
      } else {
          // Fallback ultra-safe
          penaltyAmount = 0;
          ruleDescription = "Règle inconnue";
      }

      if (!currentAdvice && monthsLate >= 1) {
          const impact = (penaltyAmount / (principal || 1)) * 100;
          if (impact > 20) {
             currentAdvice = {
                level: 'critical',
                title: 'Surcoût Important',
                message: `Les pénalités représentent déjà +${impact.toFixed(0)}% de la dette.`,
             };
          } else {
             currentAdvice = {
                level: 'warning',
                title: 'Retard Constaté',
                message: `Vous avez ${diffDays} jours de retard.`,
            };
          }
      }

    } else {
        ruleDescription = "Délais respectés";
        breakdownText = `Principal à payer : ${new Intl.NumberFormat('fr-DZ').format(principal)} DA\nAucune pénalité applicable.`;
        currentAdvice = {
            level: 'success',
            title: 'Situation Conforme',
            message: 'Bravo ! Vous respectez les échéances.',
        };
    }

    setSimResult({
      principal,
      penaltyAmount,
      total: principal + penaltyAmount,
      monthsLate,
      ruleUsed: ruleDescription,
      breakdown: breakdownText,
      advice: currentAdvice
    });
  };

  const renderDynamicInputs = () => {
    switch(taxType) {
        case 'G50_PAIEMENT':
        case 'G50A_PAIEMENT':
            return (
                <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                        Détail G50 (Mensuel)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">TAP/TLS (Montant)</label>
                            <input type="number" className="w-full p-2 border rounded" value={formData.tls_base || ''} onChange={e => updateField('tls_base', parseFloat(e.target.value))} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">TVA à payer</label>
                            <input type="number" className="w-full p-2 border rounded" value={formData.tva_payee || ''} onChange={e => updateField('tva_payee', parseFloat(e.target.value))} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">IRG Salaires</label>
                            <input type="number" className="w-full p-2 border rounded" value={formData.irg_salaires || ''} onChange={e => updateField('irg_salaires', parseFloat(e.target.value))} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">IBS (Acompte)</label>
                            <input type="number" className="w-full p-2 border rounded" value={formData.ibs_acompte || ''} onChange={e => updateField('ibs_acompte', parseFloat(e.target.value))} placeholder="0" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Droit de Timbre</label>
                            <input type="number" className="w-full p-2 border rounded" value={formData.timbre || ''} onChange={e => updateField('timbre', parseFloat(e.target.value))} placeholder="0" />
                        </div>
                    </div>
                </div>
            );
        case 'G12_IFU':
        case 'G12_IFU_DEF':
            return (
                <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">store</span>
                        Chiffre d'Affaires (G12/G12 Bis)
                    </h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">CA Production/Vente (Taux 5%)</label>
                        <input type="number" className="w-full p-2 border rounded" value={formData.ca_production || ''} onChange={e => updateField('ca_production', parseFloat(e.target.value))} placeholder="0" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">CA Prestation de Services (Taux 12%)</label>
                        <input type="number" className="w-full p-2 border rounded" value={formData.ca_service || ''} onChange={e => updateField('ca_service', parseFloat(e.target.value))} placeholder="0" />
                    </div>
                </div>
            );
        case 'G4_IBS':
        case 'G11_IRG':
        case 'G13_BNC':
            return (
                <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-2">Résultat Fiscal</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Bénéfice Imposable (Déclaré)</label>
                        <input type="number" className="w-full p-2 border rounded" value={formData.benefice_imposable || ''} onChange={e => updateField('benefice_imposable', parseFloat(e.target.value))} placeholder="0" />
                    </div>
                </div>
            );
        case 'G17_PLUSVALUE':
            return (
                <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-2">Cession Immobilière</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Montant de la Plus-Value</label>
                        <input type="number" className="w-full p-2 border rounded" value={formData.plus_value || ''} onChange={e => updateField('plus_value', parseFloat(e.target.value))} placeholder="0" />
                    </div>
                </div>
            );
        default:
            return (
                <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        Montant Global (Générique)
                    </h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Montant total des droits (Principal)</label>
                        <input type="number" className="w-full p-2 border rounded" value={formData.montant_global || ''} onChange={e => updateField('montant_global', parseFloat(e.target.value))} placeholder="0" />
                        <p className="text-[10px] text-slate-400 mt-1">Saisissez le montant total dû hors pénalités.</p>
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/outils" className="text-slate-500 hover:text-primary mb-4 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Retour aux outils
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Assistant Fiscal & Social</h1>
              <p className="text-slate-600">Calendrier des échéances et simulateur de pénalités.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'calendar' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined">calendar_month</span> Calendrier
                </button>
                <button 
                    onClick={() => setActiveTab('simulator')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'simulator' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined">calculate</span> Simulateur Pénalités
                </button>
            </div>
          </div>
        </div>

        {/* GUIDE MODAL */}
        {guideModal && guideModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setGuideModal(null)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">lightbulb</span>
                            {guideModal.title}
                        </h3>
                        <button onClick={() => setGuideModal(null)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-4">
                            {guideModal.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-700">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                                        {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button onClick={() => setGuideModal(null)} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">
                            Compris, merci !
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'calendar' && (
            <div className="space-y-8">
                
                {/* BANNIERE URGENCE (SMART ALERT) */}
                {nextDeadline && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-1 shadow-lg animate-fade-in">
                        <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                                    <span className="material-symbols-outlined text-2xl">warning</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Prochaine échéance prioritaire</p>
                                    <h3 className="text-lg font-black text-slate-900">{nextDeadline.title}</h3>
                                    <p className="text-sm text-slate-600">
                                        Date limite : <span className="font-bold">{new Date(nextDeadline.date).toLocaleDateString('fr-FR')}</span>
                                        {(() => {
                                            const diff = Math.ceil((new Date(nextDeadline.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                            return diff <= 0 ? <span className="text-red-600 font-bold ml-1">(Aujourd'hui !)</span> : <span className="text-orange-600 font-bold ml-1">(Dans {diff} jours)</span>;
                                        })()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openGuide(nextDeadline.title)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">lightbulb</span> Aide
                                </button>
                                <button 
                                    onClick={() => handleToggleEvent(nextDeadline.id)}
                                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">check</span> Marquer payé
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4">Filtrer par Régime</h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'reel', label: 'Réel (IBS/IRG)' },
                                    { id: 'simplifie', label: 'Réel Simplifié' },
                                    { id: 'ifu', label: 'IFU (Forfaitaire)' },
                                    { id: 'auto-entrepreneur', label: 'Auto-Entrepreneur' },
                                    { id: 'agricole', label: 'Agricole' }
                                ].map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => handleRegimeChange(r.id as TaxRegime)}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${userRegime === r.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {r.label}
                                        {userRegime === r.id && <span className="material-symbols-outlined text-sm">check</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Statistiques rapides */}
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                            <h4 className="font-bold text-sm uppercase text-slate-400 mb-3">Votre Progression</h4>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-3xl font-black">{Object.keys(completedEvents).length}</span>
                                <span className="text-sm mb-1.5 opacity-80">échéances validées</span>
                            </div>
                            <div className="h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-green-500 w-1/4"></div> {/* Visuel statique pour l'instant */}
                            </div>
                        </div>
                    </div>

                    {/* Calendar List */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Rechercher une échéance (ex: G50, CNAS, G12...)"
                                    className="w-full pl-10 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {sortedEvents.map(event => {
                            const isDone = completedEvents[event.id] || false;
                            const status = getEventStatus(event.date, isDone);
                            
                            return (
                                <div key={event.id} className={`p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-6 items-start md:items-center transition-all ${isDone ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:border-primary/30 hover:shadow-md'}`}>
                                    <div className={`flex-shrink-0 text-center rounded-xl p-3 border w-20 ${isDone ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                                        <span className="block text-2xl font-black">{new Date(event.date).getDate()}</span>
                                        <span className="block text-xs font-bold uppercase">{new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-slate-100 text-slate-500">
                                                {event.type}
                                            </span>
                                        </div>
                                        <h3 className={`text-lg font-bold mb-1 ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{event.title}</h3>
                                        <p className="text-slate-600 text-sm">{event.description}</p>
                                        
                                        {/* Lien Guide Rapide */}
                                        <button 
                                            onClick={() => openGuide(event.title)}
                                            className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                        >
                                            <span className="material-symbols-outlined text-sm">lightbulb</span>
                                            Comment remplir ?
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        {/* BOUTON CHECKLIST */}
                                        <button 
                                            onClick={() => handleToggleEvent(event.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${isDone ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-slate-500 border-slate-200 hover:border-green-500 hover:text-green-600'}`}
                                            title={isDone ? "Marquer comme non fait" : "Marquer comme fait"}
                                        >
                                            <span className="material-symbols-outlined text-lg">{isDone ? 'check_circle' : 'radio_button_unchecked'}</span>
                                            <span className="hidden md:inline">{isDone ? 'Fait' : 'Valider'}</span>
                                        </button>

                                        {event.formLink && event.formLink !== '#' && (
                                            <a 
                                                href={event.formLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border border-slate-200" 
                                                title="Télécharger formulaire"
                                            >
                                                <span className="material-symbols-outlined">description</span>
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => icsService.downloadIcs(event)}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                            title="Ajouter au calendrier"
                                        >
                                            <span className="material-symbols-outlined">event</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {filteredEvents.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                <p>Aucune échéance trouvée pour ces critères.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'simulator' && (
            <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span> Paramètres de calcul
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Type d'obligation / Formulaire</label>
                                <select 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 bg-white"
                                    value={taxType}
                                    onChange={(e) => setTaxType(e.target.value)}
                                >
                                    {categories.map(cat => {
                                        const catForms = forms.filter(f => f.category === cat.id);
                                        if (catForms.length === 0) return null;
                                        
                                        return (
                                            <optgroup key={cat.id} label={cat.label}>
                                                {catForms.map(f => (
                                                    <option key={f.id} value={f.id}>{f.label}</option>
                                                ))}
                                            </optgroup>
                                        );
                                    })}
                                    
                                    {forms.some(f => !categories.find(c => c.id === f.category)) && (
                                        <optgroup label="Non Classés">
                                            {forms.filter(f => !categories.find(c => c.id === f.category)).map(f => (
                                                <option key={f.id} value={f.id}>{f.label}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <span className="text-xs font-bold text-blue-800 truncate pr-2 flex-1">{formInfo ? formInfo.title : 'Formulaire Officiel'}</span>
                                    <div className="flex gap-2 shrink-0">
                                        {formInfo && formInfo.link && (
                                            <a 
                                                href={formInfo.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-xs font-bold bg-white text-primary border border-primary px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                                                download 
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                PDF
                                            </a>
                                        )}
                                        <a 
                                            href={`https://www.google.com/search?q=télécharger+formulaire+${taxType.replace('_', '+')}+DGI+Algérie+filetype:pdf`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs font-bold bg-white text-slate-500 border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
                                            title="Rechercher sur Google si le lien direct échoue"
                                        >
                                            <span className="material-symbols-outlined text-sm">search</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC FIELDS */}
                            {renderDynamicInputs()}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date d'exigibilité</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date de paiement</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={calculateAdvanced}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                            >
                                <span className="material-symbols-outlined">calculate</span>
                                Simuler les pénalités
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                        {simResult ? (
                            <>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Résultat de la simulation</h3>
                                    
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-500">Principal (Calculé)</span>
                                        <span className="font-bold text-slate-900">{new Intl.NumberFormat('fr-DZ').format(simResult.principal)} DA</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 text-red-500">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">warning</span> Pénalités</span>
                                        <span className="font-bold">+{new Intl.NumberFormat('fr-DZ').format(simResult.penaltyAmount)} DA</span>
                                    </div>
                                    
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-slate-700">Total à payer</span>
                                            <span className="text-2xl font-black text-primary">{new Intl.NumberFormat('fr-DZ').format(simResult.total)} DA</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono whitespace-pre-line">
                                        {simResult.breakdown}
                                    </div>
                                </div>

                                {simResult.advice && (
                                    <div className={`p-4 rounded-xl border-l-4 ${simResult.advice.level === 'critical' ? 'bg-red-50 border-red-500' : simResult.advice.level === 'warning' ? 'bg-orange-50 border-orange-500' : 'bg-green-50 border-green-500'}`}>
                                        <h4 className={`font-bold mb-1 ${simResult.advice.level === 'critical' ? 'text-red-800' : simResult.advice.level === 'warning' ? 'text-orange-800' : 'text-green-800'}`}>
                                            {simResult.advice.title}
                                        </h4>
                                        <p className="text-sm text-slate-700">{simResult.advice.message}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">analytics</span>
                                <p className="text-center">Remplissez les détails du formulaire pour estimer vos droits et pénalités.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ToolFiscalCalendar;