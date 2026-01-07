import { EstateDutyResults } from '../../types/estateDuty';

interface ResultsStepProps {
  results: EstateDutyResults;
  onBack: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ResultsStep({ results, onBack }: ResultsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Estate Duty Calculation Results</h2>

      <div className="space-y-4">
        {/* Main Results */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Estate Value</p>
              <p className="text-2xl font-semibold text-gray-900">R{formatCurrency(results.totalEstate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Taxable Estate</p>
              <p className="text-2xl font-semibold text-gray-900">R{formatCurrency(results.taxableEstate)}</p>
            </div>
          </div>
        </div>

        {/* Estate Duty and Fees */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Estate Duty</p>
            <p className="text-xl font-semibold text-red-600">R{formatCurrency(results.estateDuty)}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Executor's Fees ({results.executorsFeesPercentage}%)</p>
            <p className="text-xl font-semibold text-amber-600">R{formatCurrency(results.executorsFees)}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estate Exemption</span>
            <span className="font-medium text-gray-900">R{formatCurrency(results.estateExemption)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
            <span className="text-gray-600">Total Deductions</span>
            <span className="font-medium text-gray-900">R{formatCurrency(results.totalDeductions)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
            <span className="text-gray-900">Net Estate After Duties</span>
            <span className="text-lg text-gray-900">R{formatCurrency(results.netEstate)}</span>
          </div>
        </div>

        {/* Calculation Path Info */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm">
          <p className="text-gray-600">
            <span className="font-medium">Calculation Path:</span> {results.calculationPath}
          </p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-gray-300 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
      >
        Back to Inventory
      </button>
    </div>
  );
}
