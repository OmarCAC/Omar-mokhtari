
export interface ActivityRate {
  type: string;
  monthly: number;
  quarterly: number;
  annual: number;
}

export interface NonPermanentService {
  id: string;
  name: string;
  price: number;
  linkedServiceId?: string;
}

export interface AuditRange {
  id: string;
  maxBalance: number; // Montant max du bilan pour cette tranche
  minFee: number;
  maxFee: number;
}

export interface AdminFee {
  label: string;
  amount: number;
}

export interface CreationRate {
  type: 'physique' | 'morale';
  label: string;
  cabinetFee: number; // Honoraires du cabinet
  adminFees: AdminFee[]; // Liste détaillée des frais administratifs
}

export interface VolumeRange {
  min: number;
  max: number;
  price: number;
}

export interface CalculatorSettings {
  permanentRates: ActivityRate[];
  nonPermanentServices: NonPermanentService[];
  auditRanges: AuditRange[];
  creationRates: CreationRate[];
  volumeRanges: VolumeRange[];
  internalAccountantCost: number; // Coût de référence interne pour le comparatif
  params: {
    employeeCost: number;
    turnoverCostPerMillion: number;
    tvaRate: number;
  };
}
