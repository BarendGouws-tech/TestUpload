import { EstateDutyProfile, MaritalStatus, Residency } from '../../types/estateDuty';

interface ProfileStepProps {
  profile: EstateDutyProfile;
  onProfileChange: (profile: EstateDutyProfile) => void;
  onNext: () => void;
}

export function ProfileStep({ profile, onProfileChange, onNext }: ProfileStepProps) {
  const handleChange = (field: keyof EstateDutyProfile, value: string | number) => {
    onProfileChange({
      ...profile,
      [field]: field === 'age' ? parseInt(value as string, 10) : value,
    });
  };

  const canProceed = profile.name && profile.age > 0 && profile.dateOfDeath && profile.residency && profile.maritalStatus;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Deceased Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter deceased name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age at Death</label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => handleChange('age', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label>
            <input
              type="date"
              value={profile.dateOfDeath}
              onChange={(e) => handleChange('dateOfDeath', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Residency Status</label>
            <select
              value={profile.residency}
              onChange={(e) => handleChange('residency', e.target.value as Residency)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="resident">Resident</option>
              <option value="non-resident">Non-Resident</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
            <select
              value={profile.maritalStatus}
              onChange={(e) => handleChange('maritalStatus', e.target.value as MaritalStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next: Add Estate Items
      </button>
    </div>
  );
}
