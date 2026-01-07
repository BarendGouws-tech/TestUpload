import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface Scenario {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface MyScenariosPageProps {
  onBack: () => void;
}

export function MyScenariosPage({ onBack }: MyScenariosPageProps) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchScenarios = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('scenarios')
          .select('id, name, type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setScenarios(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load scenarios');
        console.error('Error fetching scenarios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      tax: 'bg-amber-50 text-amber-700 border-amber-200',
      loan: 'bg-blue-50 text-blue-700 border-blue-200',
      estate: 'bg-purple-50 text-purple-700 border-purple-200',
      npv: 'bg-green-50 text-green-700 border-green-200',
      fv: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">My Scenarios</h1>
          <p className="text-gray-600">
            {scenarios.length === 0
              ? 'No scenarios yet. Start by creating a new calculation.'
              : `You have ${scenarios.length} scenario${scenarios.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading scenarios...</div>
          </div>
        )}

        {!loading && scenarios.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No scenarios saved yet</p>
            <button
              onClick={onBack}
              className="text-gray-900 font-medium hover:underline transition-colors"
            >
              Go back and explore calculators
            </button>
          </div>
        )}

        {!loading && scenarios.length > 0 && (
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {scenario.name}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeColor(
                            scenario.type
                          )}`}
                        >
                          {scenario.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(scenario.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
