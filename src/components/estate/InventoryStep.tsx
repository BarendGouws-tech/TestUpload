import { Plus, Trash2 } from 'lucide-react';
import { EstateItem } from '../../types/estateDuty';

interface InventoryStepProps {
  items: EstateItem[];
  onItemsChange: (items: EstateItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function InventoryStep({ items, onItemsChange, onNext, onBack }: InventoryStepProps) {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addItem = () => {
    const newItem: EstateItem = {
      id: generateId(),
      description: '',
      value: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof EstateItem, value: string | number) => {
    onItemsChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'value' ? parseFloat(value as string) || 0 : value,
            }
          : item
      )
    );
  };

  const totalEstate = items.reduce((sum, item) => sum + (item.value || 0), 0);
  const canProceed = items.length > 0 && items.every((item) => item.description && item.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Estate Inventory</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Value (R)</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., House, Car, Savings"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    value={item.value || ''}
                    onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                    placeholder="0"
                    min="0"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addItem}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Item</span>
      </button>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Estate Value:</span>
          <span className="text-lg font-semibold text-gray-900">R{totalEstate.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: View Results
        </button>
      </div>
    </div>
  );
}
