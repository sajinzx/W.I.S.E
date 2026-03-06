'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b'];
const LABELS = {
    Nifty50: 'Nifty 50',
    LargeCap: 'Large Cap',
    MidCap: 'Mid Cap',
    SmallCap: 'Small Cap',
    FlexiCap: 'Flexi Cap',
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 !border-white/20 shadow-xl">
                <p className="text-white font-semibold text-sm">{payload[0].name}</p>
                <p className="text-emerald-400 font-bold">{payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize="13">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function AllocationPieChart({ data }) {
    const chartData = Object.entries(data).map(([key, value]) => ({
        name: LABELS[key] || key,
        value,
    }));

    return (
        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="section-heading">
                <span className="text-2xl mr-2">🥧</span> Portfolio Distribution
            </h3>
            <div className="glass-card p-6">
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={130}
                                innerRadius={50}
                                paddingAngle={3}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1200}
                                animationEasing="ease-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="rgba(0,0,0,0.3)"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
