
export interface RegulatoryAlert {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'warning' | 'critical';
  date: string;
}

const STORAGE_KEY = 'comptalink_reg_alerts_v1';

const DEFAULT_ALERTS: RegulatoryAlert[] = [
  {
    id: '1',
    title: 'Mise à jour LF 2025',
    content: 'Modifications des seuils IFU pour les micro-entreprises validées par le ministère.',
    level: 'warning',
    date: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Portail DAS CNAS',
    content: 'Ouverture du nouveau portail pour les déclarations annuelles des salaires.',
    level: 'info',
    date: new Date().toISOString()
  }
];

export const regulatoryService = {
  getAlerts: (): RegulatoryAlert[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_ALERTS;
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ALERTS;
    }
  },

  saveAlerts: (alerts: RegulatoryAlert[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new Event('reg-alerts-updated'));
  },

  addAlert: (alert: Omit<RegulatoryAlert, 'id' | 'date'>): void => {
    const alerts = regulatoryService.getAlerts();
    const newAlert: RegulatoryAlert = {
      ...alert,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    regulatoryService.saveAlerts([newAlert, ...alerts]);
  },

  updateAlert: (id: string, data: Partial<RegulatoryAlert>): void => {
    const alerts = regulatoryService.getAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...data, date: new Date().toISOString() };
      regulatoryService.saveAlerts(alerts);
    }
  },

  deleteAlert: (id: string): void => {
    const alerts = regulatoryService.getAlerts();
    regulatoryService.saveAlerts(alerts.filter(a => a.id !== id));
  }
};
