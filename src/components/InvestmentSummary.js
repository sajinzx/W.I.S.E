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
        </div>
    );
}
