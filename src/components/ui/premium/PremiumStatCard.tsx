import React from 'react';
import { ChartIcon } from './PremiumIcons';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  tone?: 'success' | 'warning' | 'primary';
  icon?: React.ReactNode;
}

export const PremiumStatCard: React.FC<PremiumStatCardProps> = ({ 
  title, 
  value, 
  delta, 
  tone = 'primary',
  icon = <ChartIcon />
}) => {
  const toneClass = 
    tone === 'success' ? 'text-success' : 
    tone === 'warning' ? 'text-[#a86d15]' : 
    'text-primary';

  return (
    <article className="apple-card rounded-panel p-5 bg-white border border-outline-ghost shadow-float">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-faint">{title}</p>
          <p className="font-display text-2xl font-black text-on-surface tracking-tight">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-soft text-primary">
          {icon}
        </div>
      </div>
      {delta && (
        <>
          <div className="mt-5 h-px bg-outline-soft"></div>
          <p className={`mt-4 text-sm font-medium ${toneClass}`}>{delta}</p>
        </>
      )}
    </article>
  );
};
