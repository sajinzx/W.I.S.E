'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const formatValue = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-4 !border-white/20 shadow-xl min-w-[200px]">
                <p className="text-slate-300 text-sm mb-2">Year {label}</p>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-cyan-400 text-sm">💰 Invested</span>
                        <span className="text-white font-bold text-sm">
                            ₹{payload[0]?.value?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-emerald-400 text-sm">📈 Portfolio</span>
                        <span className="text-white font-bold text-sm">
                            ₹{payload[1]?.value?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    {payload[1]?.value && payload[0]?.value && (
                        <div className="flex justify-between items-center pt-1 border-t border-white/10">
                            <span className="text-amber-400 text-sm">✨ Returns</span>
                            <span className="text-emerald-400 font-bold text-sm">
                                +{((payload[1].value / payload[0].value - 1) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export default function GrowthGraph({ data }) {
    return (
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="section-heading">
                <span className="text-2xl mr-2">📈</span> Yearly Growth Projection
            </h3>
            <div className="glass-card p-6">
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="year"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={formatValue}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '10px' }}
                                formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{value}</span>}
                            />
                            <Area
                                type="monotone"
                                dataKey="invested"
                                name="Total Invested"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="url(#investedGradient)"
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name="Portfolio Value"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fill="url(#valueGradient)"
                                animationDuration={1500}
                                animationEasing="ease-out"
                                animationBegin={300}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Final year summary */}
                {data.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Invested</p>
                            <p className="text-lg font-bold text-cyan-400">₹{data[data.length - 1].invested.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Portfolio Value</p>
                            <p className="text-lg font-bold text-emerald-400">₹{data[data.length - 1].value.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Wealth Gained</p>
                            <p className="text-lg font-bold text-amber-400">
                                ₹{(data[data.length - 1].value - data[data.length - 1].invested).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
