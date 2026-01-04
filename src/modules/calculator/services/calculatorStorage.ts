
import { CalculatorSettings } from "../types/CalculatorSettings";

const STORAGE_KEY = "comptalink_calculator_settings";

const DEFAULT_SETTINGS: CalculatorSettings = {
  permanentRates: [
    { type: 'Commerce', monthly: 20000, quarterly: 55000, annual: 200000 },
    { type: 'Service', monthly: 15000, quarterly: 40000, annual: 150000 },
    { type: 'Production', monthly: 30000, quarterly: 85000, annual: 320000 },
    { type: 'Profession libérale', monthly: 15000, quarterly: 40000, annual: 150000 },
  ],
  nonPermanentServices: [
    { id: 'np1', name: "Déclaration fiscale", price: 50000 },
    { id: 'np2', name: "Audit ponctuel", price: 150000 },
    { id: 'np3', name: "Conseil spécialisé", price: 80000 },
    { id: 'np4', name: "Formation", price: 25000 }
  ],
  auditRanges: [
    { id: 'ar1', maxBalance: 10000000, minFee: 120000, maxFee: 250000 },
    { id: 'ar2', maxBalance: 50000000, minFee: 250000, maxFee: 500000 },
    { id: 'ar3', maxBalance: 100000000, minFee: 500000, maxFee: 1200000 }
  ],
  creationRates: [
    { 
      type: 'physique', 
      label: 'Personne Physique', 
      cabinetFee: 20000, 
      adminFees: [
        { label: "Droits d'enregistrement (CNRC)", amount: 8000 },
        { label: "Timbre fiscal", amount: 4000 },
        { label: "Frais divers (Dossier)", amount: 3000 }
      ]
    },
    { 
      type: 'morale', 
      label: 'Personne Morale (SARL/EURL)', 
      cabinetFee: 50000, 
      adminFees: [
        { label: "Frais Notaire (Est.)", amount: 30000 },
        { label: "Droits CNRC & BOAL", amount: 12000 },
        { label: "Timbre fiscal", amount: 4000 },
        { label: "Recherche d'antériorité", amount: 800 }
      ]
    }
  ],
  volumeRanges: [
    { min: 0, max: 50, price: 0 },
    { min: 51, max: 150, price: 5000 },
    { min: 151, max: 300, price: 15000 },
    { min: 301, max: 500, price: 25000 },
    { min: 501, max: 99999, price: 40000 }
  ],
  internalAccountantCost: 80000, // Salaire chargé + bureau + logiciels
  params: {
    employeeCost: 500,
    turnoverCostPerMillion: 1000,
    tvaRate: 19
  }
};

export const calculatorStorage = {
  getSettings: (): CalculatorSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      
      const parsed = JSON.parse(stored);
      
      // MIGRATION FORCEE : Si l'ancienne structure est détectée
      let hasChanged = false;
      
      // Migration Creation Rates
      if (parsed.creationRates) {
        parsed.creationRates = parsed.creationRates.map((rate: any) => {
          if (rate.adminFees === undefined && typeof rate.adminFee === 'number') {
            hasChanged = true;
            return {
              ...rate,
              adminFees: [
                { label: 'Frais Administratifs (Global)', amount: rate.adminFee }
              ],
              adminFee: undefined 
            };
          }
          return rate;
        });
      } else {
        parsed.creationRates = DEFAULT_SETTINGS.creationRates;
        hasChanged = true;
      }

      // Migration Volume & Internal Cost
      if (!parsed.volumeRanges) {
        parsed.volumeRanges = DEFAULT_SETTINGS.volumeRanges;
        hasChanged = true;
      }
      if (!parsed.internalAccountantCost) {
        parsed.internalAccountantCost = DEFAULT_SETTINGS.internalAccountantCost;
        hasChanged = true;
      }

      if (hasChanged) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }

      return parsed;
    } catch (error) {
      console.error("Erreur chargement calculateur:", error);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: CalculatorSettings): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },

  resetDefaults: (): CalculatorSettings => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
};
