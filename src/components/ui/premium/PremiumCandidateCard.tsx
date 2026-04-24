import React from 'react';
import { Badge, AppleButton } from './Common';
import { PencilIcon, ApplyIcon, UsersIcon } from './PremiumIcons';

interface PremiumCandidateCardProps {
  name: string;
  role: string;
  experience: string;
  location: string;
  status: string;
  score: string;
  variant?: 'default' | 'recommendation' | 'actions';
  onEdit?: () => void;
  onDelete?: () => void;
  onApply?: () => void;
}

export const PremiumCandidateCard: React.FC<PremiumCandidateCardProps> = ({
  name,
  role,
  experience,
  location,
  status,
  score,
  variant = 'default',
  onEdit,
  onDelete,
  onApply,
}) => {
  const initials = name.split(" ").map(n => n[0]).join("");
  
  return (
    <article className="apple-card rounded-panel p-5 bg-white border border-outline-ghost shadow-shell hover:shadow-float transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-gradient font-display text-lg font-bold text-white shadow-glow">
          {initials}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-extrabold text-on-surface truncate">{name}</h3>
              <p className="text-sm text-text-soft truncate">{role} • {experience}</p>
            </div>
            <Badge label={status} tone={variant === 'recommendation' ? 'primary' : 'success'} />
          </div>
          <p className="text-sm text-text-soft">{location}</p>
        </div>
      </div>
      
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border border-outline-soft bg-surface-soft p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-text-faint font-bold">Match score</p>
          <p className="mt-2 text-2xl font-bold text-primary">{score}</p>
        </div>
        <div className="rounded-[24px] border border-outline-soft bg-surface-soft p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-text-faint font-bold">Quick Actions</p>
          <div className="mt-3 flex gap-2 text-text-soft">
            <button onClick={onEdit} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white border border-outline-soft/40 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
              <PencilIcon />
            </button>
            <button onClick={onApply} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white border border-outline-soft/40 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
              <ApplyIcon />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white border border-outline-soft/40 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
              <UsersIcon />
            </button>
          </div>
        </div>
      </div>

      {variant === 'recommendation' && (
        <div className="mt-4 rounded-[24px] bg-primary-ghost px-4 py-4 text-sm leading-6 text-text-soft border border-primary/10 animate-slide-up">
          <p><span className="font-bold text-primary">AI Recommendation:</span> Strong alignment with product experience, high execution speed, and design system maturity.</p>
        </div>
      )}

      {variant === 'actions' && (
        <div className="mt-5 flex gap-2 pt-1">
          <AppleButton label="Edit Profile" tone="secondary" onClick={onEdit} className="flex-1" />
          <AppleButton label="Delete" tone="ghost" onClick={onDelete} className="flex-1" />
        </div>
      )}
    </article>
  );
};
