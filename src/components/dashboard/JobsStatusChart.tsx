'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface Job {
    _id: string;
    isClosed: boolean;
}

interface JobsStatusChartProps {
    jobs: Job[];
}

export const JobsStatusChart = ({ jobs }: JobsStatusChartProps) => {
    const chartData = useMemo(() => {
        const counts = jobs.reduce((acc, job) => {
            job.isClosed ? acc.closed++ : acc.open++;
            return acc;
        }, { open: 0, closed: 0 });

        return [
            { name: 'Postes Ouverts', value: counts.open, color: '#10B981', bg: '#ECFDF5' },
            { name: 'Postes Fermés', value: counts.closed, color: '#EF4444', bg: '#FEF2F2' }
        ];
    }, [jobs]);

    if (jobs.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold">Aucune donnée à afficher.</p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
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
                        formatter={(value: any) => [`${value} poste(s)`, '']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-2">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
