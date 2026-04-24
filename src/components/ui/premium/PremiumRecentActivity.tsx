import React from 'react';
import { AppleButton, Badge } from './Common';
import CustomIcon from '../CustomIcon';

interface ActivityItem {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  avatar?: string;
  status?: string;
  initials?: string;
  iconName?: string;
}

interface PremiumRecentActivityProps {
  title: string;
  eyebrow: string;
  items: ActivityItem[];
  emptyText: string;
  actionLabel?: string;
  onAction?: () => void;
  itemsCount?: number;
}

export const PremiumRecentActivity: React.FC<PremiumRecentActivityProps> = ({
  title,
  eyebrow,
  items,
  emptyText,
  actionLabel,
  onAction,
  itemsCount
}) => {
  return (
    <article className="apple-card rounded-panel p-6 bg-white border border-outline-ghost shadow-shell hover:shadow-float transition-all duration-300 flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-faint">{eyebrow}</p>
          <div className="flex items-center gap-3">
            <h3 className="mt-1 font-display text-base font-extrabold text-on-surface uppercase tracking-tight">{title}</h3>
            {itemsCount !== undefined && (
               <span className="mt-1 text-[9px] font-black px-2 py-0.5 bg-primary-ghost text-primary rounded-full">{itemsCount}</span>
            )}
          </div>
        </div>
        <button onClick={onAction} className="h-8 w-8 flex items-center justify-center rounded-xl bg-surface-soft text-text-soft hover:text-primary hover:bg-primary-ghost transition-all ring-1 ring-outline-soft/20 shadow-sm">
          <CustomIcon name="arrow-right-2" size={14} />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center justify-between rounded-[18px] border border-outline-soft/40 bg-surface-soft/50 px-4 py-2 hover:bg-white hover:border-primary/20 hover:shadow-shell transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-gradient font-display text-[9px] font-bold text-white shadow-glow group-hover:scale-105 transition-transform">
                  {item.iconName ? <CustomIcon name={item.iconName} size={14} color="white" /> : (item.initials || (item.name ? item.name.split(" ").map(n => n[0]).join("") : "")) }
                </div>
                <div>
                  <p className="font-bold text-on-surface text-[13px] group-hover:text-primary transition-colors leading-tight">{item.name}</p>
                  <p className="text-[11px] text-text-faint font-medium tracking-wide mt-0.5">{item.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 self-center">
                {item.status && <Badge label={item.status} tone="success" className="px-2 py-0.5 scale-[0.85] origin-right" />}
                <p className="text-[9px] text-text-faint font-black uppercase tracking-widest">{item.date}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-30">
             <CustomIcon name="document-text" size={48} className="text-text-faint" />
             <p className="text-[11px] font-black uppercase tracking-[0.3em] font-headline text-center">{emptyText}</p>
          </div>
        )}
      </div>

      {actionLabel && (
        <div className="mt-8 pt-6 border-t border-outline-soft">
          <AppleButton label={actionLabel} tone="secondary" className="w-full" onClick={onAction} />
        </div>
      )}
    </article>
  );
};
