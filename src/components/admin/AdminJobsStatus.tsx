'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminJobsStatusProps {
    opened: number;
    closed: number;
}

export const AdminJobsStatus = ({ opened, closed }: AdminJobsStatusProps) => {
    const data = [
        { name: 'Active', value: opened, color: '#10b981' },
        { name: 'Archived', value: closed, color: '#6b7280' },
    ];

    const total = opened + closed;
    const activePercentage = total > 0 ? Math.round((opened / total) * 100) : 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-[160px] relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                            width={80}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
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
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-600 mb-1">Open Positions</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-gray-900 leading-none">{opened}</span>
                        <span className="text-xs text-emerald-600 font-medium pb-0.5">{activePercentage}% of total</span>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Closed / Filled</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-gray-900 leading-none">{closed}</span>
                        <span className="text-xs text-gray-500 font-medium pb-0.5">{100 - activePercentage}% of total</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center px-1">
                <span className="text-xs text-gray-500 font-medium">Platform Fulfillment Rate</span>
                <span className="text-xs font-semibold text-gray-900">{total} Total Records</span>
            </div>
        </div>
    );
};
