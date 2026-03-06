'use client';

export default function InvestmentSummary({ summary }) {
    const formatCurrency = (num) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    const cards = [
        { label: 'Monthly Salary', value: formatCurrency(summary.salary), icon: '💼', gradient: 'from-blue-500 to-cyan-500' },
        { label: 'Monthly Investment', value: formatCurrency(summary.monthlyInvestment), icon: '📊', gradient: 'from-emerald-500 to-green-500' },
        { label: 'Target Goal', value: formatCurrency(summary.targetGoal), icon: '🎯', gradient: 'from-purple-500 to-pink-500' },
        { label: 'Timeline', value: `${summary.timeline} Years`, icon: '⏳', gradient: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="fade-in-up">
            <h3 className="section-heading">
                <span className="text-2xl mr-2">📋</span> Investment Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div key={card.label} className="glass-card p-5 text-center group hover:scale-105 transition-transform duration-300">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                            <span className="text-2xl">{card.icon}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                        <p className="text-xl font-bold text-white">{card.value}</p>
                    </div>
                ))}
            </div>
            {summary.choiceMode && (
                <div className="glass-card p-6 mt-4">
                    {summary.choiceMode === 'timeline' ? (
                        <div className="text-center">
                            <p className="text-slate-300 mb-2">Based on your {summary.timeline}-year timeline:</p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                                    <span className="text-emerald-400 font-semibold">Required Return: {summary.calculatedReturn}%</span>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                                    <span className="text-cyan-400 font-semibold">Risk Level: {summary.riskLevel === 'minimal' ? 'Low' : summary.riskLevel === 'medium' ? 'Medium' : 'High'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-300 mb-3">Based on your {summary.riskLevel === 'minimal' ? 'Low' : summary.riskLevel === 'medium' ? 'Medium' : 'High'} risk appetite:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className={`p-3 rounded-lg ${summary.riskLevel === 'minimal' ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-slate-700/30 border border-slate-600'}`}>
                                    <p className="text-xs text-slate-400 mb-1">Low Risk (8-10%)</p>
                                    <p className="text-lg font-bold text-white">{summary.timelineOptions?.minimal || 'N/A'} years</p>
                                </div>
                                <div className={`p-3 rounded-lg ${summary.riskLevel === 'medium' ? 'bg-cyan-500/20 border-2 border-cyan-500' : 'bg-slate-700/30 border border-slate-600'}`}>
                                    <p className="text-xs text-slate-400 mb-1">Medium Risk (12-15%)</p>
                                    <p className="text-lg font-bold text-white">{summary.timelineOptions?.medium || 'N/A'} years</p>
                                </div>
                                <div className={`p-3 rounded-lg ${summary.riskLevel === 'high' ? 'bg-purple-500/20 border-2 border-purple-500' : 'bg-slate-700/30 border border-slate-600'}`}>
                                    <p className="text-xs text-slate-400 mb-1">High Risk (15%+)</p>
                                    <p className="text-lg font-bold text-white">{summary.timelineOptions?.high || 'N/A'} years</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
