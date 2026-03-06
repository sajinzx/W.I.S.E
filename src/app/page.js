'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import ResultsDashboard from '@/components/ResultsDashboard';

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-600/20 to-cyan-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/15 to-pink-600/10 blur-[120px] animate-float-delayed" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 blur-[100px] animate-float-slow" />
      </div>

      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                W.I.S.E
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">WEALTH INTELLIGENCE THROUGH STRATEGY AND ENGINEERING</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pb-16 pt-4">
        {!result ? (
          <div className="fade-in-up">
            {/* Hero text */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Plan Your Wealth,{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Intelligently
                </span>
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Get AI-powered personalized investment strategies with diversified portfolios,
                SIP recommendations, and compound growth projections.
              </p>
            </div>
            <InputForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <div className="max-w-2xl mx-auto mt-4">
                <div className="glass-card p-4 !border-red-500/30 text-center">
                  <p className="text-red-400 text-sm">❌ {error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ResultsDashboard data={result} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
