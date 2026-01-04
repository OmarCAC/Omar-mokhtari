
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
      return JSON.parse(stored);
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
