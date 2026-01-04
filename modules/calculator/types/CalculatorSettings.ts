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

export interface CalculatorSettings {
  permanentRates: ActivityRate[];
  nonPermanentServices: NonPermanentService[];
  auditRanges: AuditRange[];
  params: {
    employeeCost: number;
    turnoverCostPerMillion: number;
    tvaRate: number;
  };
}