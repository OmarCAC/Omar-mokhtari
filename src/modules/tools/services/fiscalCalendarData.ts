import { FiscalEvent, TaxRegime } from "../types/Tool";

export type FiscalCalculationMode = 'cumulative' | 'fixed_rate' | 'fixed_amount';

export interface PenaltyRule {
  id: string;
  name: string; // Ex: "Retard Paiement G50"
  mode: FiscalCalculationMode;
  baseRate: number; // Ex: 10 (pour 10%)
  monthlyIncrement: number; // Ex: 3 (pour +3% par mois)
  maxRate: number; // Ex: 25 (plafond)
  fixedAmount: number; // Ex: 10000 (si amende forfaitaire)
  description: string; // Ex: "Art 301: 10% fixe + 3% par mois de retard"
}

export interface FiscalCategory {
  id: string;
  label: string;
  ruleId: string; // Lien vers la règle de pénalité
  isSystem?: boolean;
}

export interface FiscalFormDefinition {
  id: string;
  label: string;
  defaultLink: string;
  category: string; // ID de la catégorie
  isSystem?: boolean;
}

// Règles par défaut (Système)
export const DEFAULT_PENALTY_RULES: PenaltyRule[] = [
  {
    id: 'rule_monthly',
    name: 'Paiement Mensuel (G50)',
    mode: 'cumulative',
    baseRate: 10,
    monthlyIncrement: 3,
    maxRate: 25,
    fixedAmount: 0,
    description: "10% de base + 3% par mois de retard (Plafond 25%)"
  },
  {
    id: 'rule_annual',
    name: 'Déclaration Tardive (Annuel)',
    mode: 'fixed_rate',
    baseRate: 25,
    monthlyIncrement: 0,
    maxRate: 25,
    fixedAmount: 0,
    description: "Majoration fixe de 25% pour dépôt tardif"
  },
  {
    id: 'rule_social',
    name: 'Cotisations Sociales',
    mode: 'cumulative',
    baseRate: 5,
    monthlyIncrement: 1,
    maxRate: 100, // Pas de plafond bas réel
    fixedAmount: 0,
    description: "5% de base + 1% par mois de retard"
  },
  {
    id: 'rule_flat',
    name: 'Amende Forfaitaire',
    mode: 'fixed_amount',
    baseRate: 0,
    monthlyIncrement: 0,
    maxRate: 0,
    fixedAmount: 5000,
    description: "Amende fixe de 5 000 DA"
  }
];

export const DEFAULT_FISCAL_CATEGORIES: FiscalCategory[] = [
  { id: 'Paiement', label: 'Paiements Mensuels & Acomptes', ruleId: 'rule_monthly', isSystem: true },
  { id: 'Déclaration', label: 'Déclarations Annuelles', ruleId: 'rule_annual', isSystem: true },
  { id: 'Social', label: 'Social (CNAS/CASNOS)', ruleId: 'rule_social', isSystem: true },
  { id: 'Autre', label: 'Autres Obligations', ruleId: 'rule_flat', isSystem: true }
];

// Liste des types de formulaires par défaut (Système)
export const FISCAL_FORM_TYPES: FiscalFormDefinition[] = [
  // PAIEMENTS
  { id: 'G50_PAIEMENT', label: 'G50 - Déclaration Mensuelle (Réel)', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G50.pdf', category: 'Paiement' },
  { id: 'G50A_PAIEMENT', label: 'G50 A - Déclaration Mensuelle (Agricole/Simplifié)', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G50A.pdf', category: 'Paiement' },
  { id: 'G51_ACOMPTE', label: 'G51 - Acompte IBS/IRG', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G51.pdf', category: 'Paiement' },
  
  // DÉCLARATIONS ANNUELLES
  { id: 'G4_IBS', label: 'G4 - Déclaration Annuelle IBS', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G4.pdf', category: 'Déclaration' },
  { id: 'G11_IRG', label: 'G11 - Déclaration IRG/BIC (Réel)', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G11.pdf', category: 'Déclaration' },
  { id: 'G12_IFU_DEF', label: 'G12 Bis - IFU Déclaration Définitive', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G12bis.pdf', category: 'Déclaration' },
  { id: 'G12_IFU', label: 'G12 - IFU Prévisionnel', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G12.pdf', category: 'Déclaration' },
  { id: 'G13_BNC', label: 'G13 - Déclaration BNC (Professions Libérales)', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G13.pdf', category: 'Déclaration' },
  { id: 'G1_IRG', label: 'G1 - Revenu Global (Particulier)', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G01.pdf', category: 'Déclaration' },
  { id: 'G15_AGRICOLE', label: 'G15 - Revenus Agricoles', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G15.pdf', category: 'Déclaration' },
  
  // AUTRES
  { id: 'G29_SALAIRES', label: 'G29 - État Annuel des Salaires', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G29.pdf', category: 'Autre' },
  { id: 'G3_CLIENTS', label: 'G3 - État Clients (Ventes en gros)', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G03.pdf', category: 'Autre' },
  { id: 'G37_FORTUNE', label: 'G37 - Impôt sur la Fortune', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G37.pdf', category: 'Autre' },
  { id: 'G17_PLUSVALUE', label: 'G17 - Plus-Value Immobilière', defaultLink: 'https://mfdgi.mf.gov.dz/images/imprimes/G17.pdf', category: 'Autre' },

  // SOCIAL
  { id: 'CNAS_PAIEMENT', label: 'CNAS - Paiement Mensuel', defaultLink: 'https://teledeclaration.cnas.dz', category: 'Social' },
  { id: 'CASNOS_PAIEMENT', label: 'CASNOS - Paiement Annuel', defaultLink: 'https://damane.casnos.com.dz', category: 'Social' }
];

// Helper pour générer les événements mensuels
const generateRecurringEvents = (year: number): FiscalEvent[] => {
  const events: FiscalEvent[] = [];
  
  // G50 Mensuel (Régime Réel & Simplifié)
  for (let month = 0; month < 12; month++) {
    // Le mois 0 (Janvier) déclare Décembre N-1. Deadline le 20.
    const deadline = new Date(year, month, 20).toISOString().split('T')[0];
    const declarationMonthName = new Date(year, month - 1, 1).toLocaleString('fr-FR', { month: 'long' });

    events.push({
      id: `g50-mensuel-${month}`,
      title: `G50 Mensuel (${declarationMonthName})`,
      date: deadline,
      type: 'mensuel',
      description: `Déclaration mensuelle des impôts (TAP/TLS, TVA, IRG Salaires, etc.) via le formulaire Série G N°50.`,
      formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G50.pdf",
      isRecurring: true,
      regimes: ['reel', 'simplifie']
    });
  }

  return events;
};

const FIXED_EVENTS_2025: FiscalEvent[] = [
  // --- JANVIER ---
  {
    id: 'g12-bis-definitif',
    title: "G12 Bis - IFU Déclaration Définitive",
    date: "2025-01-20",
    type: "annuel",
    description: "Déclaration définitive du chiffre d'affaires 2024 (Série G N°12 Bis). Régularisation IFU.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G12bis.pdf", 
    regimes: ['ifu', 'auto-entrepreneur']
  },
  {
    id: 'das-cnas',
    title: "DAS CNAS (Déclaration Annuelle)",
    date: "2025-01-31",
    type: "annuel",
    description: "Déclaration Annuelle des Salaires et Salariés (DAS) via le portail Teledeclaration.",
    formLink: "https://teledeclaration.cnas.dz",
    regimes: ['reel', 'simplifie', 'ifu', 'auto-entrepreneur']
  },

  // --- MARS ---
  {
    id: 'g15-agricole',
    title: "G15 - Revenus Agricoles",
    date: "2025-03-01",
    type: "annuel",
    description: "Déclaration des revenus agricoles série G N°15.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G15.pdf",
    regimes: ['agricole']
  },
  {
    id: 'g37-fortune',
    title: "G37 - Impôt sur la Fortune",
    date: "2025-03-31",
    type: "annuel",
    description: "Déclaration du patrimoine (Série G N°37) pour l'IGF.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G37.pdf",
    regimes: ['particulier', 'reel']
  },
  {
    id: 'ibs-1',
    title: "1er Acompte IBS (G51)",
    date: "2025-03-20",
    type: "acompte",
    description: "Paiement du 1er acompte IBS via le bordereau G51.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G51.pdf",
    regimes: ['reel']
  },

  // --- AVRIL (Liasse Fiscale) ---
  {
    id: 'g4-ibs',
    title: "G4 - Déclaration Annuelle IBS",
    date: "2025-04-30",
    type: "annuel",
    description: "Déclaration annuelle des résultats IBS (Série G N°4).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G4.pdf",
    regimes: ['reel']
  },
  {
    id: 'g11-bic',
    title: "G11 - Déclaration IRG/BIC",
    date: "2025-04-30",
    type: "annuel",
    description: "Déclaration annuelle des bénéfices industriels et commerciaux (Série G N°11).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G11.pdf",
    regimes: ['reel']
  },
  {
    id: 'g13-bnc',
    title: "G13 - Déclaration BNC",
    date: "2025-04-30",
    type: "annuel",
    description: "Déclaration des bénéfices non commerciaux (Série G N°13).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G13.pdf",
    regimes: ['reel', 'simplifie']
  },
  {
    id: 'g29-salaires',
    title: "G29 - État Annuel des Salaires",
    date: "2025-04-30",
    type: "annuel",
    description: "État récapitulatif annuel des traitements et salaires (Série G N°29).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G29.pdf",
    regimes: ['reel', 'simplifie', 'ifu']
  },
  {
    id: 'g2-bilan',
    title: "G2 - Bilan Fiscal (Liasse)",
    date: "2025-04-30",
    type: "annuel",
    description: "Dépôt légal du Bilan (Actif/Passif/TCR) Série G N°2.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G02.pdf",
    regimes: ['reel', 'simplifie']
  },
  {
    id: 'g3-clients',
    title: "G3 - État Clients",
    date: "2025-04-30",
    type: "annuel",
    description: "État détaillé des clients (Ventes en gros) Série G N°3.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G03.pdf",
    regimes: ['reel', 'simplifie']
  },

  // --- JUIN ---
  {
    id: 'g1-irg',
    title: "G1 - Revenu Global",
    date: "2025-06-30",
    type: "annuel",
    description: "Déclaration annuelle du revenu global pour les personnes physiques (Série G N°1).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G01.pdf",
    regimes: ['particulier', 'reel', 'simplifie', 'agricole']
  },
  {
    id: 'g12-previsionnel',
    title: "G12 - IFU Prévisionnel",
    date: "2025-06-30",
    type: "annuel",
    description: "Déclaration prévisionnelle IFU (Série G N°12).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G12.pdf",
    regimes: ['ifu']
  },
  {
    id: 'ibs-2',
    title: "2ème Acompte IBS (G51)",
    date: "2025-06-20",
    type: "acompte",
    description: "Paiement du 2ème acompte IBS.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G51.pdf",
    regimes: ['reel']
  },

  // --- NOVEMBRE ---
  {
    id: 'ibs-3',
    title: "3ème Acompte IBS (G51)",
    date: "2025-11-20",
    type: "acompte",
    description: "Paiement du 3ème acompte IBS.",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G51.pdf",
    regimes: ['reel']
  },
  
  // --- AUTRES (Sans date fixe ou sur évènement) ---
  {
    id: 'g17-plusvalue',
    title: "G17 - Plus-Value Immobilière",
    date: "2025-12-31", // Date fictive pour affichage
    type: "annuel",
    description: "Déclaration de plus-value de cession (à déposer sous 30 jours après l'acte).",
    formLink: "https://mfdgi.mf.gov.dz/images/imprimes/G17.pdf",
    regimes: ['particulier', 'reel']
  }
];

export const FISCAL_EVENTS_2025 = [...generateRecurringEvents(2025), ...FIXED_EVENTS_2025].sort((a, b) => a.date.localeCompare(b.date));