'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import InvestmentSummary from './InvestmentSummary';
import PortfolioTable from './PortfolioTable';
import AllocationPieChart from './PieChart';
import GrowthGraph from './GrowthGraph';

export default function ResultsDashboard({ data, onReset }) {
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSavePlan = async () => {
        if (!session) {
            alert("Please login to save your plan.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/iterations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Investment Plan - ${new Date().toLocaleDateString()}`,
                    type: 'PLAN',
                    data: data
                })
            });

            if (res.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert("Failed to save plan.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving plan");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Header with source badge and reset */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 fade-in-up">
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25">
                        <span className="text-2xl">✅</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Your Investment Plan</h2>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            Generated
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">
                                ⚡ Engine Calculated
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSavePlan}
                        disabled={isSaving || !session}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            saveSuccess ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            !session ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50' :
                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                        }`}
                        title={!session ? "Login to save" : "Save to dashboard"}
                    >
                        {saveSuccess ? '✓ Saved' : isSaving ? 'Saving...' : '💾 Save Plan'}
                    </button>
                    <button onClick={onReset} className="reset-btn">
                        <span>← New Plan</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <InvestmentSummary summary={data.summary} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AllocationPieChart data={data.pieChart} />
                <GrowthGraph data={data.projections} />
            </div>

            {/* Portfolio Table */}
            <PortfolioTable portfolio={data.portfolio} />

            {/* Disclaimer */}
            <div className="glass-card p-4 !border-amber-500/20 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-amber-400/80 text-xs text-center leading-relaxed">
                    ⚠️ <strong>Disclaimer:</strong> This is a projection based on historical average returns.
                    Actual returns may vary. Mutual fund investments are subject to market risks.
                    Please read scheme-related documents carefully before investing. Past performance is not indicative of future results.
                </p>
            </div>
        </div>
    );
}
