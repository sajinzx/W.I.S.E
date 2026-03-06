'use client';

export default function PortfolioTable({ portfolio }) {
    return (
        <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="section-heading">
                <span className="text-2xl mr-2">📑</span> Portfolio Allocation
            </h3>
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="table-header">Category</th>
                                <th className="table-header text-center">Allocation</th>
                                <th className="table-header text-center">Monthly SIP</th>
                                <th className="table-header">Example Funds</th>
                                <th className="table-header">Major Companies</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.map((item, i) => (
                                <tr
                                    key={item.category}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(i)}`} />
                                            <span className="font-medium text-white text-sm">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-bold text-sm">
                                            {item.allocation}%
                                        </span>
                                    </td>
                                    <td className="table-cell text-center font-semibold text-white text-sm">
                                        ₹{item.monthlySIP.toLocaleString('en-IN')}
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {item.exampleFunds?.slice(0, 2).map((fund) => (
                                                <span key={fund} className="tag">{fund}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {item.majorCompanies?.slice(0, 3).map((company) => (
                                                <span key={company} className="tag-company">{company}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function getCategoryColor(index) {
    const colors = ['bg-cyan-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-amber-400'];
    return colors[index % colors.length];
}
