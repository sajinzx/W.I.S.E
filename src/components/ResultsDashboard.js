'use client';

import InvestmentSummary from './InvestmentSummary';
import PortfolioTable from './PortfolioTable';
import AllocationPieChart from './PieChart';
import GrowthGraph from './GrowthGraph';

export default function ResultsDashboard({ data, onReset }) {
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
                            {data.source === 'ai' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium border border-purple-500/30">
                                    🤖 AI Powered
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">
                                    ⚡ Engine Calculated
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button onClick={onReset} className="reset-btn">
                    <span>← New Plan</span>
                </button>
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
                    ⚠️ <strong>Disclaimer:</strong> This is an AI-generated projection based on historical average returns.
                    Actual returns may vary. Mutual fund investments are subject to market risks.
                    Please read scheme-related documents carefully before investing. Past performance is not indicative of future results.
                </p>
            </div>
        </div>
    );
}
