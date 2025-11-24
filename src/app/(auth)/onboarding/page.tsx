'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
const sectors = [
  'Technology',
  'Healthcare',
  'Finance',
  'Energy',
  'Consumer',
  'Industrial',
  'Real Estate',
  'Utilities',
];
const investmentStyles = [
  'Value',
  'Growth',
  'Income',
  'Momentum',
  'Index',
  'Swing Trading',
  'Day Trading',
];
const goals = [
  'Wealth Building',
  'Retirement',
  'Income Generation',
  'Capital Preservation',
  'Speculation',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    experienceLevel: '',
    sectors: [] as string[],
    investmentStyle: [] as string[],
    goals: [] as string[],
  });

  const handleArrayToggle = (field: 'sectors' | 'investmentStyle' | 'goals', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Deep Terminal</h1>
          <p className="text-gray-600">Let&apos;s personalize your experience</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-1/4 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What&apos;s your investing experience?</h2>
              <div className="grid grid-cols-2 gap-3">
                {experienceLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, experienceLevel: level })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.experienceLevel === level
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Which sectors interest you?</h2>
              <div className="grid grid-cols-2 gap-3">
                {sectors.map(sector => (
                  <button
                    key={sector}
                    onClick={() => handleArrayToggle('sectors', sector)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.sectors.includes(sector)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What&apos;s your investment style?</h2>
              <div className="grid grid-cols-2 gap-3">
                {investmentStyles.map(style => (
                  <button
                    key={style}
                    onClick={() => handleArrayToggle('investmentStyle', style)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.investmentStyle.includes(style)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What are your investment goals?</h2>
              <div className="grid grid-cols-2 gap-3">
                {goals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => handleArrayToggle('goals', goal)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.goals.includes(goal)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={loading}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : step < 4 ? 'Continue' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
