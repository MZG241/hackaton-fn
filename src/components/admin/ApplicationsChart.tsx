'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ApplicationsChartProps {
    statuses: Record<string, { count: number, percentage: number }> | any[];
    total: number;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const ApplicationsChart = ({ statuses, total }: ApplicationsChartProps) => {
    const data = Array.isArray(statuses)
        ? statuses.map(s => ({ name: s.status, value: s.count }))
        : Object.entries(statuses || {}).map(([key, val]: [string, any]) => ({
            name: key,
            value: val.count
        }));

    return (
        <div className="h-full flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '8px 12px'
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-[-18px]">
                <span className="text-2xl font-bold text-gray-900">{total}</span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Total</span>
            </div>
        </div>
    );
};
