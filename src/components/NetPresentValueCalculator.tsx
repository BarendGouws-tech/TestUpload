import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NetPresentValueCalculatorProps {
  onBack: () => void;
}

export function NetPresentValueCalculator({
  onBack,
}: NetPresentValueCalculatorProps) {
  const [futureAmount, setFutureAmount] = useState<number>(1000000);
  const [discountRate, setDiscountRate] = useState<number>(8);
  const [futureYear, setFutureYear] = useState<number>(2035);

  const currentYear = new Date().getFullYear();
  const years = Math.max(0, futureYear - currentYear);

  const calculatePresentValue = (): number => {
    if (futureAmount <= 0) return 0;
    if (years === 0 || discountRate === 0) {
      // If future date is this year or no discount rate, PV = FV
      return futureAmount;
    }

    const r = discountRate / 100;
    return futureAmount / Math.pow(1 + r, years);
  };

  const presentValue = calculatePresentValue();

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = Number(raw);
    if (!isNaN(num)) {
      setFutureAmount(num);
    }
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
          Net Present Value Calculator
        </h1>
      </div>

      <div className="max-w-3xl bg-black text-white rounded-lg overflow-hidden shadow-lg">
        <div className="bg-black px-8 py-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">
            Present Value of a Future Amount
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Discount a future lump sum back to today at a chosen rate.
          </p>
        </div>

        <div className="bg-white text-gray-900 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Future Amount <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formatNumber(futureAmount)}
              onChange={handleAmountChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Discount Rate (%) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(Number(e.target.value))}
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

          <div className="bg-black text-white rounded-lg p-6 mt-8">
            <div className="text-sm font-medium text-gray-300 mb-2">
              Net Present Value (today)
            </div>
            <div className="text-4xl font-semibold">
              R{formatCurrency(presentValue)}
            </div>
            <div className="text-sm text-gray-300 mt-2">
              Years to discount: {years}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
