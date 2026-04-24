'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ApplicationData {
  name: string;
  count: number;
}

const COLORS = ['#4569e0', '#f5f7f9'];

export const PremiumActivityChart: React.FC<{ data: ApplicationData[] }> = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-64 flex items-center justify-center bg-surface-soft/50 rounded-3xl animate-pulse">
    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/20">Calibrating Analytics...</p>
  </div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4569e0" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#4569e0" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 700, fill: 'rgba(0,0,0,0.3)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 700, fill: 'rgba(0,0,0,0.3)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '16px', 
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              fontSize: '11px',
              fontWeight: '800'
            }}
            cursor={{ stroke: '#4569e0', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#4569e0" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PremiumProgressGauge: React.FC<{ score: number }> = ({ score }) => {
  const [mounted, setMounted] = useState(false);
  const data = [
    { name: 'Strength', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-32 h-32 rounded-full border-4 border-surface-soft animate-spin border-t-primary" />;

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationBegin={500}
              animationDuration={1500}
            >
              <Cell fill="#4569e0" />
              <Cell fill="#f0f2f5" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-on-surface tracking-tighter">
          {score}<span className="text-sm font-bold text-primary">%</span>
        </span>
        <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest mt-1">Integrity</span>
      </div>
    </div>
  );
};
