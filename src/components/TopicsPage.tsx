import { BookOpen, Home, TrendingUp, PiggyBank, Clock } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const topics: Topic[] = [
  {
    id: 'tax',
    title: 'Conversations on Tax',
    description: 'Tax planning, calculations, and financial strategies.',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 'property',
    title: 'Conversations on Property',
    description: 'Property valuation, mortgage, and real estate planning.',
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: 'investments',
    title: 'Conversations on Investments',
    description: 'Investment analysis, portfolio planning, and strategies.',
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: 'debt',
    title: 'Conversations on Debt',
    description: 'Loan management, debt repayment, and financial planning.',
    icon: <PiggyBank className="w-6 h-6" />,
  },
  {
    id: 'pensions',
    title: 'Conversations on Pensions',
    description: 'Retirement planning and pension management strategies.',
    icon: <Clock className="w-6 h-6" />,
  },
];

interface TopicsPageProps {
  onSelectTopic: (topicId: string) => void;
  onBack: () => void;
}

export function TopicsPage({ onSelectTopic, onBack }: TopicsPageProps) {
  return (
    <div className="py-16">
      <div className="flex items-center space-x-4 mb-12">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-light text-gray-900">Specialist Topics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left bg-white hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                {topic.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{topic.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
