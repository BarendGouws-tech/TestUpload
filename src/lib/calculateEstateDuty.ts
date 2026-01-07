import { EstateDutyProfile, EstateItem, EstateDutyResults } from '../types/estateDuty';

export function calculateEstateDuty(profile: EstateDutyProfile, items: EstateItem[]): EstateDutyResults {
  const totalEstate = items.reduce((sum, item) => sum + (item.value || 0), 0);

  const estateExemption = 3500000;
  const taxableEstate = Math.max(0, totalEstate - estateExemption);

  const estateDuty = taxableEstate * 0.20;
  const executorsFeesPercentage = 3.5;
  const executorsFees = (totalEstate * executorsFeesPercentage) / 100;

  const totalDeductions = estateDuty + executorsFees;
  const netEstate = totalEstate - totalDeductions;

  const calculationPath = `${profile.maritalStatus === 'married' ? 'Married' : 'Single'} ${profile.residency === 'resident' ? 'Resident' : 'Non-Resident'} - Age ${profile.age}`;

  return {
    totalEstate,
    estateExemption,
    taxableEstate,
    estateDuty,
    executorsFeesPercentage,
    executorsFees,
    totalDeductions,
    netEstate,
    calculationPath,
  };
}
