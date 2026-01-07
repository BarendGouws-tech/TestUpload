import { useState } from 'react';
import { Calculator, X, DollarSign, Percent, Briefcase, TrendingUp, LogOut } from 'lucide-react';
import { LoanCalculator } from './components/LoanCalculator';
import { TaxCalculator } from './components/TaxCalculator';
import { EstateDutyCalculator } from './components/EstateDutyCalculator';
import { NetPresentValueCalculator } from './components/NetPresentValueCalculator';
import { FutureValueCalculator } from './components/FutureValueCalculator';
import { TopicsPage } from './components/TopicsPage';
import { MyScenariosPage } from './components/MyScenariosPage';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';

type View = 'home' | 'topics' | 'calculators' | 'loan' | 'tax' | 'estate' | 'npv' | 'fv' | 'scenarios';

function App() {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  const handleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      setLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setCurrentView('home');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
      });
      if (error) throw error;
      setRegisterOpen(false);
      setRegisterEmail('');
      setRegisterPassword('');
      setLoginOpen(true);
      setAuthError('Account created! Please log in.');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentView('home');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-gray-800" />
              <span className="text-sm font-medium text-gray-600">CalcHub</span>
            </div>

            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentView('topics');
                  setSelectedTopic(null);
                }}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Specialist Topics
              </button>
              {!loading && user && (
                <button
                  onClick={() => setCurrentView('scenarios')}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  My Scenarios
                </button>
              )}
              {!loading && !user && (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </button>
              )}
              {!loading && user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && (
          <div className="flex flex-col items-center justify-center py-32">
            <h1 className="text-5xl font-light text-gray-900 mb-4 text-center">
              Welcome to CalcHub
            </h1>
            <p className="text-xl text-gray-600 text-center max-w-2xl">
              Your collection of helpful calculators in one place.
              Simple, fast, and easy to use.
            </p>
          </div>
        )}

        {currentView === 'topics' && (
          <TopicsPage
            onSelectTopic={(topicId) => {
              setSelectedTopic(topicId);
              setCurrentView('calculators');
            }}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'calculators' && selectedTopic && (
          <div className="py-16">
            <div className="flex items-center space-x-4 mb-12">
              <button
                onClick={() => {
                  setCurrentView('topics');
                  setSelectedTopic(null);
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-4xl font-light text-gray-900">
                {selectedTopic === 'tax' && 'Conversations on Tax'}
                {selectedTopic === 'debt' && 'Conversations on Debt'}
                {selectedTopic === 'property' && 'Conversations on Property'}
                {selectedTopic === 'investments' && 'Conversations on Investments'}
                {selectedTopic === 'pensions' && 'Conversations on Pensions'}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTopic === 'tax' && (
                <>
                  <button
                    onClick={() => setCurrentView('tax')}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Percent className="w-6 h-6 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Tax Calculator</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Calculate taxes on your income or purchases with ease.
                    </p>
                  </button>

                  <button
                    onClick={() => setCurrentView('estate')}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Estate Duty Calculator</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Calculate estate duty on inheritance and estates.
                    </p>
                  </button>
                </>
              )}

              {selectedTopic === 'debt' && (
                <button
                  onClick={() => setCurrentView('loan')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-gray-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Loan Repayment Calculator</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Calculate your monthly loan payments and total interest over the life of your loan.
                  </p>
                </button>
              )}

              {selectedTopic === 'investments' && (
                <>
                  <button
                    onClick={() => setCurrentView('npv')}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Net Present Value Calculator</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Evaluate investment decisions using net present value analysis.
                    </p>
                  </button>

                  <button
                    onClick={() => setCurrentView('fv')}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-left bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Future Value Calculator</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Calculate the future value of your investments and savings.
                    </p>
                  </button>
                </>
              )}

              {(selectedTopic === 'property' || selectedTopic === 'pensions') && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No calculators available in this topic yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'loan' && (
          <LoanCalculator onBack={() => setCurrentView('calculators')} />
        )}

        {currentView === 'tax' && (
          <TaxCalculator onBack={() => {
            setCurrentView('calculators');
          }} />
        )}

        {currentView === 'estate' && (
          <EstateDutyCalculator onBack={() => {
            setCurrentView('calculators');
          }} />
        )}

        {currentView === 'npv' && (
          <NetPresentValueCalculator onBack={() => {
            setCurrentView('calculators');
          }} />
        )}

        {currentView === 'fv' && (
          <FutureValueCalculator onBack={() => {
            setCurrentView('calculators');
          }} />
        )}

        {currentView === 'scenarios' && user && (
          <MyScenariosPage onBack={() => setCurrentView('home')} />
        )}
      </main>

      {loginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Login</h2>
              <button
                onClick={() => {
                  setLoginOpen(false);
                  setAuthError('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setLoginOpen(false);
                    setRegisterOpen(true);
                    setAuthError('');
                  }}
                  className="text-gray-900 font-medium hover:underline transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {registerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Account</h2>
              <button
                onClick={() => {
                  setRegisterOpen(false);
                  setAuthError('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {authError && (
                <div className={`p-3 rounded-lg border ${
                  authError.includes('created')
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm ${authError.includes('created') ? 'text-green-700' : 'text-red-700'}`}>
                    {authError}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={authLoading}
                className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setRegisterOpen(false);
                    setLoginOpen(true);
                    setAuthError('');
                  }}
                  className="text-gray-900 font-medium hover:underline transition-colors"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
