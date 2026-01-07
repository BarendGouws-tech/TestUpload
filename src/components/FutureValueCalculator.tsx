import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface FutureValueCalculatorProps {
  onBack: () => void;
}

export function FutureValueCalculator({ onBack }: FutureValueCalculatorProps) {
  const [presentValue, setPresentValue] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [futureYear, setFutureYear] = useState<number>(2035);

  const [recurringAmount, setRecurringAmount] = useState<number>(0);
  const [escalationRate, setEscalationRate] = useState<number>(0);

  const currentYear = new Date().getFullYear();
  const years = Math.max(0, futureYear - currentYear);

  const calculateFutureValue = (): number => {
    if (annualRate < 0 || years <= 0) {
      // If no time to grow, just return current lump sum
      return presentValue;
    }

    const g = annualRate / 100; // growth rate
    const e = escalationRate / 100; // escalation rate for recurring

    // Lump sum growth
    const fvLump =
      presentValue > 0 ? presentValue * Math.pow(1 + g, years) : 0;

    // Recurring contributions with escalation
    let fvRecurring = 0;

    if (recurringAmount > 0) {
      // Assume one contribution at the end of each year, escalating annually
      for (let i = 1; i <= years; i++) {
        const contributionThisYear = recurringAmount * Math.pow(1 + e, i - 1);
        const yearsToGrow = years - i; // how many years this contribution still grows
        fvRecurring += contributionThisYear * Math.pow(1 + g, yearsToGrow);
      }
    }

    return fvLump + fvRecurring;
  };

  const futureValue = calculateFutureValue();

  const formatCurrency = (value: number): string =>
    value.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatNumber = (value: number): string =>
    value.toLocaleString('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const handleInputChange =
    (setter: (v: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '');
      const num = Number(raw);
      if (!isNaN(num)) setter(num);
    };

  return (
    <div className="py-16">
      <div className="flex items-center space-x-4 mb-12">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calculators</span>
        </button>
        <h1 className="text-4xl font-light text-gray-900">
          Future Value Calculator
        </h1>
      </div>

      <div className="max-w-3xl bg-black text-white rounded-lg overflow-hidden shadow-lg">
        <div className="bg-black px-8 py-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Estimate Future Value</h2>
          <p className="text-sm text-gray-400 mt-1">
            Based on a lump sum today and optional recurring contributions over
            time.
          </p>
        </div>

        <div className="bg-white text-gray-900 p-8 space-y-6">
          {/* Lump sum section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Present Value (lump sum) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formatNumber(presentValue)}
              onChange={handleInputChange(setPresentValue)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Annual Growth Rate (%) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Future Year <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={futureYear}
              onChange={(e) => setFutureYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
              min={currentYear}
            />
          </div>

          {/* Recurring contribution section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Recurring Contributions (optional)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recurring Amount (per year)
                </label>
                <input
                  type="text"
                  value={formatNumber(recurringAmount)}
                  onChange={handleInputChange(setRecurringAmount)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Annual Escalation of Recurring Amount (%)
                </label>
                <input
                  type="number"
                  value={escalationRate}
                  onChange={(e) => setEscalationRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Assumes one contribution at the end of each year, increasing
                  by this percentage annually.
                </p>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-black text-white rounded-lg p-6 mt-8">
            <div className="text-sm font-medium text-gray-300 mb-2">
              Future Value (lump sum + recurring)
            </div>
            <div className="text-4xl font-semibold">
              R{formatCurrency(futureValue)}
            </div>
            <div className="text-sm text-gray-300 mt-2">
              Years to grow: {years}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
