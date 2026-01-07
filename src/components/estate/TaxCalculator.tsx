import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';

interface TaxCalculatorProps {
  onBack: () => void;
}

type TaxYear = 2025 | 2026;

interface TaxBracket {
  tax_year: TaxYear;
  min_amount: number;
  max_amount: number | null;
  tax_rate: number;       // marginal rate for this band (e.g. 26 means 26%)
  base_tax: number;       // base Rand amount for this band
  base_threshold: number; // "above" threshold used in SARS table
}

type AgeBand = 'under65' | '65to74' | '75plus';

// SARS brackets for 2025/2026 (same table for both years)
const TAX_BRACKETS: TaxBracket[] = [
  // 2025 SARS brackets
  { tax_year: 2025, min_amount: 0,       max_amount: 237_100,  tax_rate: 18, base_tax: 0,       base_threshold: 0 },
  { tax_year: 2025, min_amount: 237_101, max_amount: 370_500,  tax_rate: 26, base_tax: 42_678,  base_threshold: 237_100 },
  { tax_year: 2025, min_amount: 370_501, max_amount: 512_800,  tax_rate: 31, base_tax: 77_362,  base_threshold: 370_500 },
  { tax_year: 2025, min_amount: 512_801, max_amount: 673_000,  tax_rate: 36, base_tax: 121_475, base_threshold: 512_800 },
  { tax_year: 2025, min_amount: 673_001, max_amount: 857_900,  tax_rate: 39, base_tax: 179_147, base_threshold: 673_000 },
  { tax_year: 2025, min_amount: 857_901, max_amount: 1_817_000,tax_rate: 41, base_tax: 251_258, base_threshold: 857_900 },
  { tax_year: 2025, min_amount: 1_817_001,max_amount: null,    tax_rate: 45, base_tax: 644_489, base_threshold: 1_817_000 },

  // 2026 SARS brackets (same as 2025 for now)
  { tax_year: 2026, min_amount: 0,       max_amount: 237_100,  tax_rate: 18, base_tax: 0,       base_threshold: 0 },
  { tax_year: 2026, min_amount: 237_101, max_amount: 370_500,  tax_rate: 26, base_tax: 42_678,  base_threshold: 237_100 },
  { tax_year: 2026, min_amount: 370_501, max_amount: 512_800,  tax_rate: 31, base_tax: 77_362,  base_threshold: 370_500 },
  { tax_year: 2026, min_amount: 512_801, max_amount: 673_000,  tax_rate: 36, base_tax: 121_475, base_threshold: 512_800 },
  { tax_year: 2026, min_amount: 673_001, max_amount: 857_900,  tax_rate: 39, base_tax: 179_147, base_threshold: 673_000 },
  { tax_year: 2026, min_amount: 857_901, max_amount: 1_817_000,tax_rate: 41, base_tax: 251_258, base_threshold: 857_900 },
  { tax_year: 2026, min_amount: 1_817_001,max_amount: null,    tax_rate: 45, base_tax: 644_489, base_threshold: 1_817_000 },
];

// Rebates per age band, per year (same values for 2025 and 2026)
const TAX_REBATES: Record<TaxYear, Record<AgeBand, number>> = {
  2025: {
    under65: 17235,
    '65to74': 17235 + 9444,
    '75plus': 17235 + 9444 + 3145,
  },
  2026: {
    under65: 17235,
    '65to74': 17235 + 9444,
    '75plus': 17235 + 9444 + 3145,
  },
};

function getAgeBand(age: number): AgeBand {
  if (age >= 75) return '75plus';
  if (age >= 65) return '65to74';
  return 'under65';
}

function findTaxBracket(taxYear: TaxYear, incomeAmount: number): TaxBracket | null {
  const bracketsForYear = TAX_BRACKETS.filter((b) => b.tax_year === taxYear);

  for (const bracket of bracketsForYear) {
    const withinMin = incomeAmount >= bracket.min_amount;
    const withinMax = bracket.max_amount === null || incomeAmount <= bracket.max_amount;
    if (withinMin && withinMax) return bracket;
  }
  return null;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type TaxScenarioPayload = {
  taxYear: TaxYear;
  age: number;
  income: number;
};

type SavedScenario = {
  id: string;
  type: 'tax';
  name: string;
  clientName?: string;
  createdAt: string;
  payload: TaxScenarioPayload;
};

function safeUuid(): string {
  // crypto.randomUUID exists in modern browsers
  // fallback keeps it working in older environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `scn_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function saveScenarioToStorage(scenario: SavedScenario) {
  const key = 'calchub_scenarios';
  const existingRaw = localStorage.getItem(key);
  const existing: SavedScenario[] = existingRaw ? JSON.parse(existingRaw) : [];
  existing.unshift(scenario);
  localStorage.setItem(key, JSON.stringify(existing));
}

export function TaxCalculator({ onBack }: TaxCalculatorProps) {
  const [taxYear, setTaxYear] = useState<TaxYear>(2025);
  const [income, setIncome] = useState('');
  const [age, setAge] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number | null>(null);
  const [grossTax, setGrossTax] = useState<number | null>(null);
  const [rebateUsed, setRebateUsed] = useState<number | null>(null);
  const [netTax, setNetTax] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Save scenario UI state
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [clientName, setClientName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const canCalculate = useMemo(() => {
    const incomeValue = parseFloat(income);
    const ageValue = parseInt(age, 10);
    return (
      income !== '' &&
      age !== '' &&
      !isNaN(incomeValue) &&
      !isNaN(ageValue) &&
      incomeValue >= 0 &&
      ageValue >= 0
    );
  }, [income, age]);

  const calculateTax = () => {
    const incomeValue = parseFloat(income);
    const ageValue = parseInt(age, 10);

    if (!income || isNaN(incomeValue) || incomeValue < 0) return;
    if (!age || isNaN(ageValue) || ageValue < 0) return;

    setLoading(true);
    setTaxRate(null);
    setGrossTax(null);
    setRebateUsed(null);
    setNetTax(null);

    const bracket = findTaxBracket(taxYear, incomeValue);

    if (bracket) {
      const band = getAgeBand(ageValue);
      const rebate = TAX_REBATES[taxYear][band];

      const rate = bracket.tax_rate;
      const gross =
        bracket.base_tax +
        (incomeValue - bracket.base_threshold) * (rate / 100);

      const net = Math.max(0, gross - rebate);

      setTaxRate(rate);
      setGrossTax(gross);
      setRebateUsed(rebate);
      setNetTax(net);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calculateTax();
  };

  const openSave = () => {
    if (!canCalculate) {
      // Keep it simple: user must have valid inputs before saving
      setSaveError('Please enter a valid age and taxable income before saving.');
      setSaveOpen(true);
      return;
    }

    const incomeValue = parseFloat(income);
    const ageValue = parseInt(age, 10);

    // Helpful default name
    const suggested = `Tax – ${taxYear} – Age ${ageValue} – R${formatCurrency(incomeValue)}`;
    setScenarioName(suggested);
    setClientName('');
    setSaveError(null);
    setSaveOpen(true);
  };

  const confirmSave = () => {
    const incomeValue = parseFloat(income);
    const ageValue = parseInt(age, 10);

    if (!canCalculate) {
      setSaveError('Please enter a valid age and taxable income before saving.');
      return;
    }

    if (!scenarioName.trim()) {
      setSaveError('Scenario name is required.');
      return;
    }

    const scenario: SavedScenario = {
      id: safeUuid(),
      type: 'tax',
      name: scenarioName.trim(),
      clientName: clientName.trim() ? clientName.trim() : undefined,
      createdAt: new Date().toISOString(),
      payload: {
        taxYear,
        age: ageValue,
        income: incomeValue,
      },
    };

    saveScenarioToStorage(scenario);

    setSaveOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const generateReport = () => {
    if (!canCalculate || netTax === null) {
      return;
    }

    const incomeValue = parseFloat(income);
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text('Tax Report', 20, 20);

    doc.setFontSize(10);
    doc.text(`Taxable Income: R${formatCurrency(incomeValue)}`, 20, 40);

    doc.save('tax-report.pdf');
  };

  return (
    <div className="py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Calculators</span>
      </button>

      <div className="max-w-2xl">
        <div className="bg-black text-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-black px-8 py-6 border-b border-gray-700">
            <h1 className="text-2xl font-semibold">Tax Calculator</h1>
          </div>

          <div className="bg-white text-gray-900 p-8">
            <div className="space-y-6">
              {/* Tax Year */}
              <div>
                <label
                  htmlFor="taxYear"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tax Year
                </label>
                <select
                  id="taxYear"
                  value={taxYear}
                  onChange={(e) => setTaxYear(Number(e.target.value) as TaxYear)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  min={0}
                />
              </div>

              {/* Income */}
              <div>
                <label
                  htmlFor="income"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Taxable Income
                </label>
                <input
                  id="income"
                  type="number"
                  placeholder="Enter your taxable income"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  min={0}
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={calculateTax}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Calculating...' : 'Calculate Tax'}
                </button>

                <button
                  onClick={openSave}
                  className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Save Scenario
                </button>

                <button
                  onClick={generateReport}
                  disabled={!canCalculate || netTax === null}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Report
                </button>
              </div>

              {/* Result */}
              {taxRate !== null && netTax !== null && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      Marginal Tax Rate
                    </p>
                    <p className="text-3xl font-semibold text-gray-900">
                      {taxRate}%
                    </p>
                  </div>

                  {grossTax !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Gross tax (before rebate):
                      </span>
                      <span className="font-medium text-gray-900">
                        R{formatCurrency(grossTax)}
                      </span>
                    </div>
                  )}

                  {rebateUsed !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Less age rebate:</span>
                      <span className="font-medium text-gray-900">
                        R{formatCurrency(rebateUsed)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">
                      Estimated Tax Payable (after rebate)
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      R{formatCurrency(netTax)}
                    </p>
                  </div>
                </div>
              )}

              {taxRate === null && !loading && income && age && (
                <p className="text-sm text-red-500">
                  No tax bracket found for this income and year.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved toast */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Scenario saved ✓
        </div>
      )}

      {/* Save modal */}
      {saveOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Save Scenario</h2>
              <button
                onClick={() => setSaveOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario name <span className="text-red-600">*</span>
                </label>
                <input
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., Tax – 2025 – John – Base case"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client name (optional)
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setSaveOpen(false)}
                  className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Save
                </button>
              </div>

              <p className="text-xs text-gray-500 pt-1">
                (For now this saves locally in your browser. Later we'll point this to your external DB.)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
