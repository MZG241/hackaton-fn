'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MatchRateChartProps {
    percentage: number;
}

export const MatchRateChart = ({ percentage }: MatchRateChartProps) => {
    const data = [
        { name: 'Matched', value: percentage },
        { name: 'Remaining', value: 100 - percentage }
    ];

    const COLORS = ['#3B82F6', '#F1F5F9'];

    return (
        <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index]}
                                className="transition-all hover:opacity-80"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '1.5rem',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '1rem'
                        }}
                        formatter={(value: any) => [`${value}%`, '']}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-blue-600 tracking-tighter">{percentage}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match Rate</span>
            </div>
        </div>
    );
};
