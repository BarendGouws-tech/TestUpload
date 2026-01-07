import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface LoanCalculatorProps {
  onBack: () => void;
}

export function LoanCalculator({ onBack }: LoanCalculatorProps) {
  // --- Calculator 1: Standard monthly repayment ---
  const [principal, setPrincipal] = useState<number>(1000000);
  const [annualRate, setAnnualRate] = useState<number>(10);
  const [months, setMonths] = useState<number>(240);

  // --- Calculator 2: Remaining term given a different repayment ---
  const [outstanding, setOutstanding] = useState<number>(1000000);
  const [remainingAnnualRate, setRemainingAnnualRate] = useState<number>(10);
  const [altMonthlyPayment, setAltMonthlyPayment] = useState<number>(9650);

  // --- Shared helpers ---
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatMonthsAsYearsMonths = (totalMonths: number): string => {
    const m = Math.abs(Math.round(totalMonths));
    const years = Math.floor(m / 12);
    const remainingMonths = m % 12;

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    }
    if (remainingMonths > 0) {
      parts.push(
        `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
      );
    }

    if (parts.length === 0) return '0 months';
    return parts.join(' and ');
  };

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(value))) {
      setPrincipal(Number(value));
    }
  };

  const handleOutstandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(value))) {
      setOutstanding(Number(value));
    }
  };

  const handleAltPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(value))) {
      setAltMonthlyPayment(Number(value));
    }
  };

  // --- Calculator 1 logic: monthly repayment ---
  const calculateMonthlyPayment = (): number => {
    if (principal <= 0 || annualRate < 0 || months <= 0) {
      return 0;
    }

    const monthlyRate = annualRate / 100 / 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return (principal * numerator) / denominator;
  };

  const monthlyPayment = calculateMonthlyPayment();

  // --- Calculator 2 logic: remaining term (months) ---
  const calculateRemainingTerm = (): number => {
    if (outstanding <= 0 || remainingAnnualRate < 0 || altMonthlyPayment <= 0) {
      return 0;
    }

    const monthlyRate = remainingAnnualRate / 100 / 12;

    // No interest case: simple division
    if (monthlyRate === 0) {
      return outstanding / altMonthlyPayment;
    }

    const interestOnlyPayment = outstanding * monthlyRate;

    // If payment doesn't cover interest, the loan will never amortise
    if (altMonthlyPayment <= interestOnlyPayment) {
      return Infinity;
    }

    const numerator = Math.log(
      altMonthlyPayment / (altMonthlyPayment - monthlyRate * outstanding)
    );
    const denominator = Math.log(1 + monthlyRate);

    return numerator / denominator; // months
  };

  const rawRemainingTerm = calculateRemainingTerm();
  const remainingTermMonths = Number.isFinite(rawRemainingTerm)
    ? Math.ceil(rawRemainingTerm)
    : null;

  // --- Loan summary values ---

  // Original terms (Calculator 1)
  const totalPaidOriginal = monthlyPayment * months;
  const totalInterestOriginal = totalPaidOriginal - principal;

  // Alternative repayment (Calculator 2)
  let totalPaidAlt: number | null = null;
  let totalInterestAlt: number | null = null;

  if (remainingTermMonths !== null) {
    totalPaidAlt = altMonthlyPayment * remainingTermMonths;
    totalInterestAlt = totalPaidAlt - outstanding;
  }

  // --- Comparison: savings / cost ---

  let totalPaidDifference: number | null = null;
  let interestDifference: number | null = null;
  let termDifferenceMonths: number | null = null;
  let isSaving = false;

  if (
    remainingTermMonths !== null &&
    totalPaidAlt !== null &&
    totalInterestAlt !== null
  ) {
    totalPaidDifference = totalPaidOriginal - totalPaidAlt;
    interestDifference = totalInterestOriginal - totalInterestAlt;
    termDifferenceMonths = months - remainingTermMonths;
    isSaving = interestDifference > 0;
  }

  return (
    <div className="py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Calculators</span>
      </button>

      <div className="max-w-5xl">
        {/* Two calculators side by side on larger screens */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* --- Calculator 1: Monthly repayment --- */}
          <div className="bg-black text-white rounded-lg overflow-hidden shadow-lg">
            <div className="bg-black px-8 py-6 border-b border-gray-700">
              <h1 className="text-2xl font-semibold">Calculate Monthly Repayment</h1>
            </div>

            <div className="bg-white text-gray-900 p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Principal Amount <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(principal)}
                  onChange={handlePrincipalChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Annual Interest Rate (%) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Loan Term (months) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                  min="1"
                />
              </div>

              <div className="bg-black text-white rounded-lg p-6 mt-8">
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Monthly Repayment
                </div>
                <div className="text-4xl font-semibold">
                  R{formatCurrency(monthlyPayment)}
                </div>
              </div>
            </div>
          </div>

          {/* --- Calculator 2: Remaining term --- */}
          <div className="bg-black text-white rounded-lg overflow-hidden shadow-lg">
            <div className="bg-black px-8 py-6 border-b border-gray-700">
              <h1 className="text-2xl font-semibold">Calculate Remaining Term</h1>
            </div>

            <div className="bg-white text-gray-900 p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Outstanding Amount <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(outstanding)}
                  onChange={handleOutstandingChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Annual Interest Rate (%) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={remainingAnnualRate}
                  onChange={(e) => setRemainingAnnualRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Repayment <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(altMonthlyPayment)}
                  onChange={handleAltPaymentChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-right text-lg"
                />
              </div>

              <div className="bg-black text-white rounded-lg p-6 mt-8">
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Remaining Term (months)
                </div>
                {remainingTermMonths !== null ? (
                  <div className="text-4xl font-semibold">
                    {remainingTermMonths} months
                  </div>
                ) : (
                  <div className="text-sm text-red-400">
                    Monthly repayment is too low to ever repay this loan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loan Summary for both calculators */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Summary</h3>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Summary for Calculator 1 */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Original Terms</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount Paid:</span>
                  <span className="font-medium text-gray-900">
                    R{formatCurrency(totalPaidOriginal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest Paid:</span>
                  <span className="font-medium text-gray-900">
                    R{formatCurrency(totalInterestOriginal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary for Calculator 2 */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Alternative Repayment</h4>
              {remainingTermMonths !== null &&
              totalPaidAlt !== null &&
              totalInterestAlt !== null ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount Paid:</span>
                    <span className="font-medium text-gray-900">
                      R{formatCurrency(totalPaidAlt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest Paid:</span>
                    <span className="font-medium text-gray-900">
                      R{formatCurrency(totalInterestAlt)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-500">
                  Monthly repayment is too low to calculate a valid total — the loan
                  never amortises.
                </div>
              )}
            </div>
          </div>

          {/* Comparison strip: savings / cost */}
          {totalPaidDifference !== null &&
            interestDifference !== null &&
            termDifferenceMonths !== null && (
              <div
                className={`mt-6 p-6 rounded-lg border text-sm ${
                  isSaving
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <h4 className="font-semibold mb-2">
                  {isSaving ? 'Savings with Alternative Repayment' : 'Extra Cost with Alternative Repayment'}
                </h4>
                <p className="mb-1">
                  By paying <span className="font-semibold">R{formatCurrency(altMonthlyPayment)}</span> per month
                  instead of <span className="font-semibold">R{formatCurrency(monthlyPayment)}</span>, the client
                  would:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    {isSaving ? 'Save' : 'Pay an extra'}{' '}
                    <span className="font-semibold">
                      R{formatCurrency(Math.abs(totalPaidDifference))}
                    </span>{' '}
                    in total, of which{' '}
                    <span className="font-semibold">
                      R{formatCurrency(Math.abs(interestDifference))}
                    </span>{' '}
                    is {isSaving ? 'interest saved' : 'additional interest'}.
                  </li>
                  <li>
                    {termDifferenceMonths === 0
                      ? 'Keep the same overall term.'
                      : isSaving
                      ? `Finish the loan approximately ${formatMonthsAsYearsMonths(
                          termDifferenceMonths
                        )} sooner.`
                      : `Take approximately ${formatMonthsAsYearsMonths(
                          termDifferenceMonths
                        )} longer to repay the loan.`}
                  </li>
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
