export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type Residency = 'resident' | 'non-resident';

export interface EstateDutyProfile {
  name: string;
  age: number;
  residency: Residency;
  maritalStatus: MaritalStatus;
  dateOfDeath: string;
}

export interface EstateItem {
  id: string;
  description: string;
  value: number;
}

export interface EstateDutyResults {
  totalEstate: number;
  estateExemption: number;
  taxableEstate: number;
  estateDuty: number;
  executorsFeesPercentage: number;
  executorsFees: number;
  totalDeductions: number;
  netEstate: number;
  calculationPath: string;
}

export interface EstateDutyCalculation {
  profile: EstateDutyProfile;
  items: EstateItem[];
  results: EstateDutyResults;
}
