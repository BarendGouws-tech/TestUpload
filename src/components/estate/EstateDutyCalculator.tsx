import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { EstateDutyProfile, EstateItem, EstateDutyResults } from '../types/estateDuty';
import { ProfileStep } from './estate/ProfileStep';
import { InventoryStep } from './estate/InventoryStep';
import { ResultsStep } from './estate/ResultsStep';
import { calculateEstateDuty } from '../lib/calculateEstateDuty';

interface EstateDutyCalculatorProps {
  onBack: () => void;
}

type Step = 'profile' | 'inventory' | 'results';

export function EstateDutyCalculator({ onBack }: EstateDutyCalculatorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('profile');

  const [profile, setProfile] = useState<EstateDutyProfile>({
    name: '',
    age: 0,
    residency: 'resident',
    maritalStatus: 'single',
    dateOfDeath: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<EstateItem[]>([]);
  const [results, setResults] = useState<EstateDutyResults | null>(null);

  const handleProfileNext = () => {
    setCurrentStep('inventory');
  };

  const handleInventoryNext = () => {
    const calculatedResults = calculateEstateDuty(profile, items);
    setResults(calculatedResults);
    setCurrentStep('results');
  };

  const handleInventoryBack = () => {
    setCurrentStep('profile');
  };

  const handleResultsBack = () => {
    setCurrentStep('inventory');
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
            <h1 className="text-2xl font-semibold">Estate Duty Calculator</h1>
            <p className="text-sm text-gray-400 mt-1">
              Step {currentStep === 'profile' ? '1' : currentStep === 'inventory' ? '2' : '3'} of 3
            </p>
          </div>

          <div className="bg-white text-gray-900 p-8">
            {currentStep === 'profile' && (
              <ProfileStep
                profile={profile}
                onProfileChange={setProfile}
                onNext={handleProfileNext}
              />
            )}

            {currentStep === 'inventory' && (
              <InventoryStep
                items={items}
                onItemsChange={setItems}
                onNext={handleInventoryNext}
                onBack={handleInventoryBack}
              />
            )}

            {currentStep === 'results' && results && (
              <ResultsStep
                results={results}
                onBack={handleResultsBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
