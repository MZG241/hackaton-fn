import React, { useState, useEffect } from 'react';
import { Badge, AppleButton } from './Common';
import axiosInstance from '@/lib/axiosInstance';

interface PremiumJobCardProps {
  jobId: string;
  title: string;
  company: string;
  location: string;
  initialMatch?: string; // Keep for backward compatibility or initial display
  type: string;
  salary: string;
  skills: string[];
  isSaved?: boolean;
  isSaving?: boolean;
  hasApplied?: boolean;
  onView?: () => void;
  onApply?: () => void;
  onToggleSave?: () => void;
}

export const PremiumJobCard: React.FC<PremiumJobCardProps> = ({
  jobId,
  title,
  company,
  location,
  initialMatch,
  type,
  salary,
  skills,
  isSaved,
  isSaving,
  hasApplied,
  onView,
  onApply,
  onToggleSave,
}) => {
  const [matchScore, setMatchScore] = useState<string | null>(initialMatch || null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    const fetchRealMatch = async () => {
      if (matchScore && !initialMatch) return; // Already have it
      
      try {
        setLoadingMatch(true);
        const response = await axiosInstance.get(`/api/job/${jobId}/match`);
        if (response.data.success && response.data.data.score !== undefined) {
          setMatchScore(`${response.data.data.score}%`);
        }
      } catch (error) {
        console.error(`Failed to fetch match for job ${jobId}:`, error);
        // Fallback to "N/A" or some default if failed
        if (!matchScore) setMatchScore('??%');
      } finally {
        setLoadingMatch(false);
      }
    };

    fetchRealMatch();
  }, [jobId]);

  return (
    <article className="apple-card rounded-panel p-5 bg-white border border-outline-ghost shadow-shell hover:shadow-float transition-all duration-300 relative overflow-hidden group">
      {hasApplied && (
        <div className="absolute top-0 right-0 p-1.5 bg-success/10 border-b border-l border-success/20 rounded-bl-xl z-20 flex items-center gap-1.5 px-3">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-success">Mission Deployed</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge label={type} tone="primary" className="!text-[9px] !px-2 !py-0.5" />
          <h3 className="font-display text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[11px] font-medium text-text-soft">{company} • {location}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-text-faint font-bold text-[9px]">AI match</p>
            {loadingMatch ? (
              <div className="mt-1 h-4 w-12 bg-surface-soft rounded-lg animate-pulse" />
            ) : (
              <p className="mt-0.5 text-sm font-bold text-primary">{matchScore || "??%"}</p>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
            disabled={isSaving}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${isSaved ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-surface-soft border-outline-soft/40 text-text-soft hover:bg-white hover:text-primary'}`}
          >
            <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
               <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {skills.map((skill, index) => (
          <span key={index} className="rounded-pill bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-text-soft border border-outline-soft/30 hover:bg-surface-muted transition-colors">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-outline-soft pt-3">
        <p className="text-xs font-semibold text-on-surface">{salary}</p>
        <div className="flex gap-2">
          <AppleButton label="View" tone="secondary" onClick={onView} className="!h-8 !px-3 !text-[11px]" />
          {!hasApplied && (
            <AppleButton label="Apply" tone="primary" onClick={onApply} className="!h-8 !px-3 !text-[11px]" />
          )}
        </div>
      </div>
    </article>
  );
};
