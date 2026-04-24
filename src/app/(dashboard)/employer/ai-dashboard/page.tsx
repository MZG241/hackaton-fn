'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import ProtectedRoute from '@/components/ProtectedRoute';
import CustomIcon from '@/components/ui/CustomIcon';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

// ============================================================
// TYPES
// ============================================================
interface Candidate {
  _id: string;
  fullname: string;
  email: string;
  profileImage?: string;
  skills?: any[];
  location?: string;
  resume?: string;
  experience?: any[];
  education?: any[];
  resumeContent?: string;
}

interface ScreeningResult {
  _id: string;
  // After populate("application", "status"), this is an object; otherwise a raw ObjectId string
  application: string | { _id: string; status: string };
  candidate: Candidate;
  score: number;
  category: 'Strong' | 'Potential' | 'Weak';
  jobMatchScore?: number;
  cultureFitScore?: number;
  hiringSuccessProbability?: number;
  strengths?: string[];
  gaps?: string[];
  risks?: string[];
  recommendation?: string;
  whyNotSelected?: string;
  interviewQuestions?: string[];
  careerRecommendations?: string[];
  yearsOfExperience?: number;
  skillGapAnalysis?: {
    matchingSkills?: string[];
    missingSkills?: string[];
    gapSeverity?: string;
    recommendation?: string;
    estimatedTrainingTime?: string;
  };
  aiSummary?: string;
  isFavorite?: boolean;
  isShortlisted?: boolean;
  rank?: number;
}

interface DashboardStats {
  total: number;
  averageScore: number;
  byCategory: { _id: string; count: number; avgScore: number }[];
  topCandidates: ScreeningResult[];
  favoriteCount: number;
  shortlistedCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

// ============================================================
// UTILS
// ============================================================
const cleanAIOutput = (text: string | null | undefined): string => {
  if (!text) return '';
  let clean = text.trim();
  
  // Handle JSON wrapped in markdown or raw
  if (clean.startsWith('```json')) {
    const match = clean.match(/```json([\s\S]*?)```/);
    if (match) clean = match[1].trim();
  } else if (clean.startsWith('```')) {
    const match = clean.match(/```([\s\S]*?)```/);
    if (match) clean = match[1].trim();
  }

  // If it's a JSON string, try to extract the primary field
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const parsed = JSON.parse(clean);
      return parsed.summary || parsed.aiSummary || parsed.recommendation || parsed.matchReason || parsed.text || Object.values(parsed)[0] || clean;
    } catch (e) {
      // Not valid JSON, just return stripped version
      return clean.replace(/[{}]/g, '').replace(/"(summary|recommendation|matchReason)":/g, '').replace(/"/g, '').trim();
    }
  }

  return clean;
};

// ============================================================
// UI COMPONENTS
// ============================================================

function ScoreCircle({ score }: { score: number }) {
  const colorClass = 
    score >= 75 ? 'text-emerald-500' : 
    score >= 50 ? 'text-amber-500' : 'text-error';
  
  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3"
          className="text-outline-variant/10"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={125.6}
          strokeDashoffset={125.6 - (125.6 * score) / 100}
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className={`absolute font-black text-[10px] font-headline ${colorClass}`}>{score}</span>
    </div>
  );
}

function MiniProgress({ label, value, colorClass = 'bg-primary' }: { label: string; value?: number; colorClass?: string }) {
  const v = value ?? 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-on-surface font-sora font-bold opacity-70">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} rounded-full transition-all duration-1000`} 
          style={{ width: `${v}%` }} 
        />
      </div>
    </div>
  );
}

function CandidateCard({
  result,
  onSelect,
  onToggleFavorite,
  onQuickDecision,
  isSelected,
  compareIds,
  onAddCompare,
  decidedIds,
}: {
  result: ScreeningResult;
  onSelect: (r: ScreeningResult) => void;
  onToggleFavorite: (id: string) => void;
  onQuickDecision: (screeningId: string, applicationId: string, decision: string) => void;
  isSelected: boolean;
  compareIds: string[];
  onAddCompare: (id: string) => void;
  decidedIds: Record<string, 'Accepted' | 'Rejected'>;
}) {
  const c = result.candidate;
  const inCompare = compareIds.includes(result._id);

  return (
    <motion.div
      layout
      onClick={() => onSelect(result)}
      className={`group p-5 rounded-3xl cursor-pointer transition-all border-2 ${
        isSelected 
        ? 'bg-surface-container-low border-primary' 
        : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant/40'
      }`}
    >
      <div className="flex gap-4 items-start mb-4">
        <ScoreCircle score={result.score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
             {result.rank && (
              <span className="bg-primary/10 text-primary text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                #{result.rank}
              </span>
            )}
            <h3 className="font-black text-on-surface truncate font-headline text-xs">{c.fullname}</h3>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest font-sora ${
              result.category === 'Strong' ? 'bg-emerald-500/10 text-emerald-600' :
              result.category === 'Potential' ? 'bg-amber-500/10 text-amber-600' : 'bg-error/10 text-error'
            }`}>
              {result.category}
            </span>
          </div>
          <div className="text-[9px] text-black/80 font-normal truncate mt-0.5 font-sora">{c.email}</div>
        </div>
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onToggleFavorite(result._id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${result.isFavorite ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20' : 'bg-surface-container-high/50 text-on-surface-variant/40 hover:bg-white hover:text-amber-500 hover:border-amber-500/30 border border-transparent'}`}
            title="Toggle Favorite"
          >
            <CustomIcon name={result.isFavorite ? 'star' : 'star'} size={14} />
          </button>
          <button 
            onClick={() => onAddCompare(result._id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${inCompare ? 'text-primary bg-primary/10 border border-primary/20' : 'bg-surface-container-high/50 text-on-surface-variant/40 hover:bg-white hover:text-primary hover:border-primary/30 border border-transparent'}`}
            title="Compare Candidate"
          >
            <CustomIcon name="arrow-swap-horizontal" size={14} />
          </button>
          {c.resume && (
            <a 
              href={c.resume} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high/50 text-on-surface-variant/40 hover:bg-white hover:text-emerald-500 hover:border-emerald-500/30 border border-transparent transition-all shadow-sm"
              title="Download CV"
            >
              <CustomIcon name="document-download" size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MiniProgress label="Match" value={result.jobMatchScore} />
        <MiniProgress label="Culture" value={result.cultureFitScore} colorClass="bg-secondary" />
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {(() => {
          const status = decidedIds[result._id] || (result as any).applicationStatus;
          if (status === 'Accepted' || status === 'Rejected') {
            return (
              <div className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${
                status === 'Accepted'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-error/10 text-error border border-error/20'
              }`}>
                <CustomIcon name={status === 'Accepted' ? 'tick-circle' : 'close-circle'} size={14} />
                {status}
              </div>
            );
          }
          return (
            <>
              <button 
                onClick={() => onQuickDecision(result._id, result._id, 'Accepted')}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/5 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <CustomIcon name="tick-circle" size={14} />
                Accept
              </button>
              <button 
                onClick={() => onQuickDecision(result._id, result._id, 'Rejected')}
                className="flex-1 py-3 px-4 rounded-xl bg-error/5 text-error font-black text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <CustomIcon name="close-circle" size={14} />
                Reject
              </button>
            </>
          );
        })()}
      </div>
    </motion.div>
  );
}

function DetailPanel({ result }: { result: ScreeningResult }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'gaps' | 'career' | 'parcours'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'status-up' },
    { id: 'parcours', label: 'Parcours', icon: 'routing' },
    { id: 'questions', label: 'Interview', icon: 'microphone-2' },
    { id: 'gaps', label: 'Skill Gap', icon: 'search-status' },
    { id: 'career', label: 'Growth', icon: 'ranking' },
  ] as const;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-8 h-full overflow-y-auto space-y-8 no-scrollbar font-body">
      <div className="flex justify-between items-start">
        <div>
           <h2 className="text-xl font-black text-on-surface font-headline uppercase tracking-normal">{result.candidate.fullname}</h2>
           {result.aiSummary && (
            <p className="text-xs font-normal text-on-surface-variant mt-1 leading-relaxed font-sora">
              {cleanAIOutput(result.aiSummary)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
           {/* Message functionality disabled for employers as per request */}
        </div>
      </div>

      <div className="flex p-1.5 bg-surface-container-low rounded-xl gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${
              activeTab === t.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <CustomIcon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           className="space-y-6"
        >
          {activeTab === 'parcours' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <CustomIcon name="briefcase" size={14} /> Professional Experience
                </h3>
                {result.candidate.experience && result.candidate.experience.length > 0 ? (
                  result.candidate.experience.map((exp: any, i: number) => (
                    <div key={i} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 relative group hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-on-surface uppercase text-sm font-headline tracking-tight">{exp.role || exp.title}</h4>
                        <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">
                          {exp.startDate ? new Date(exp.startDate).getFullYear() : 'N/A'} — {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-3">{exp.company}</p>
                      {exp.description && (
                        <p className="text-xs font-normal text-on-surface-variant/80 leading-relaxed font-sora line-clamp-3 group-hover:line-clamp-none transition-all">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">No formal experience records detected.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] flex items-center gap-2">
                  <CustomIcon name="teacher" size={14} /> Academic Background
                </h3>
                {result.candidate.education && result.candidate.education.length > 0 ? (
                  result.candidate.education.map((edu: any, i: number) => (
                    <div key={i} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 group hover:border-tertiary/30 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-on-surface uppercase text-sm font-headline tracking-tight">{edu.degree || 'Degree'} in {edu.fieldOfStudy || 'Module Specified'}</h4>
                        <span className="text-[9px] font-black text-tertiary/50 uppercase tracking-widest">
                          {edu.startYear || edu.graduationYear || 'N/A'}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{edu.institution}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">No formal education records detected.</p>
                  </div>
                )}
              </div>

              {result.candidate.resumeContent && (
                <div className="mt-10 p-6 bg-on-surface/5 rounded-3xl border border-on-surface/10">
                  <h4 className="text-[9px] font-black text-on-surface uppercase tracking-[0.4em] mb-4 opacity-40">Neural Extraction (Raw CV Text)</h4>
                  <div className="text-[11px] font-medium text-on-surface-variant/70 leading-relaxed font-sora max-h-60 overflow-y-auto pr-4 scrollbar-hide">
                    {result.candidate.resumeContent}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Overall Score', value: `${result.score}%`, color: 'text-primary' },
                  { label: 'Job Match', value: `${result.jobMatchScore ?? 0}%`, color: 'text-amber-600' },
                  { label: 'Culture Fit', value: `${result.cultureFitScore ?? 0}%`, color: 'text-tertiary' },
                  { label: 'Hiring Luck', value: `${result.hiringSuccessProbability ?? 0}%`, color: 'text-emerald-500' },
                  { label: 'Experience', value: result.yearsOfExperience ? `${result.yearsOfExperience}+ Years` : '5+ Years', color: 'text-amber-600' },
                  { label: 'Risk Level', value: (result.risks && result.risks.length > 0) ? 'High' : 'Low', color: 'text-on-surface' },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5">
                    <p className="text-[10px] font-normal text-on-surface-variant uppercase tracking-widest mb-1 font-sora">{item.label}</p>
                    <p className={`text-xl font-black font-headline ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {result.recommendation && (
                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                      <CustomIcon name="magicpen" size={16} />
                      <span className="text-[10px] font-normal uppercase tracking-widest font-sora">AI Recommendation</span>
                    </div>
                    <p className="text-sm font-normal text-on-surface-variant leading-relaxed font-sora">
                      {cleanAIOutput(result.recommendation)}
                    </p>
                  </div>
                  <CustomIcon name="computing" size={80} className="absolute -right-4 -bottom-4 text-primary/5 transition-transform group-hover:scale-110" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                  <h4 className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-4">
                    <CustomIcon name="medal-star" size={14} /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="flex gap-2 text-xs font-bold text-on-surface-variant">
                        <span className="text-emerald-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-error/5 p-4 rounded-2xl border border-error/10">
                   <h4 className="flex items-center gap-2 text-error font-black text-[10px] uppercase tracking-widest mb-4">
                    <CustomIcon name="danger" size={14} /> Risks
                  </h4>
                  <ul className="space-y-2">
                    {result.risks?.map((r, i) => (
                      <li key={i} className="flex gap-2 text-xs font-bold text-on-surface-variant">
                        <span className="text-error">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <CustomIcon name="message-question" size={14} /> Smart Interview Questions
              </h3>
              {result.interviewQuestions && result.interviewQuestions.length > 0 ? (
                result.interviewQuestions.map((q, i) => (
                  <div key={i} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/10 flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                    <p className="text-sm font-bold text-on-surface leading-relaxed">{q}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-on-surface-variant font-bold">No questions generated.</p>
              )}
            </div>
          )}

           {activeTab === 'gaps' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Gap Severity</p>
                    <p className={`text-lg font-black font-headline ${result.skillGapAnalysis?.gapSeverity === 'High' ? 'text-error' : 'text-amber-500'}`}>
                      {result.skillGapAnalysis?.gapSeverity || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Est. Training</p>
                    <p className="text-lg font-black font-headline text-on-surface">
                      {result.skillGapAnalysis?.estimatedTrainingTime || '2 Weeks'}
                    </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                    <h4 className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-4">Matching Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.skillGapAnalysis?.matchingSkills?.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-emerald-600 border border-emerald-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-error/5 p-5 rounded-2xl border border-error/10">
                    <h4 className="flex items-center gap-2 text-error font-black text-[10px] uppercase tracking-widest mb-4">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                       {result.skillGapAnalysis?.missingSkills?.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-error border border-error/20">{s}</span>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10">
                  <h4 className="text-amber-600 font-normal text-[10px] uppercase tracking-widest mb-2 font-sora">Bridge Recommendation</h4>
                  <p className="text-sm font-normal text-on-surface-variant leading-relaxed font-sora">
                    {result.skillGapAnalysis?.recommendation || 'The candidate has a solid foundation. Focusing on specific tools will bridge the remaining gap.'}
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="space-y-4">
               {result.careerRecommendations && result.careerRecommendations.length > 0 ? (
                 result.careerRecommendations.map((r, i) => (
                   <div key={i} className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10 flex gap-4 group">
                      <CustomIcon name="flash" size={20} className="text-tertiary group-hover:scale-125 transition-transform" />
                      <p className="text-xs font-bold text-on-surface-variant leading-relaxed">{r}</p>
                   </div>
                 ))
               ) : (
                 <p className="text-center py-10 text-on-surface-variant font-bold">No recommendations generated.</p>
               )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CompareModal({ ids, results, jobId, onClose }: {
  ids: string[]; results: ScreeningResult[]; jobId: string; onClose: () => void;
}) {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runCompare = async () => {
    if (ids.length < 2) return;
    const candidates = results.filter((r) => ids.includes(r._id));
    if (candidates.length < 2) return;
    
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/ai/compare', {
        candidateAId: candidates[0].candidate._id,
        candidateBId: candidates[1].candidate._id,
        jobId,
      });
      setComparison(data);
    } catch (e) {
      toast.error('AI Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 sm:p-12 font-body">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-surface-container-lowest rounded-[3rem] p-10 w-full max-w-5xl max-h-full overflow-y-auto no-scrollbar border border-outline-variant/10"
      >
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-black text-on-surface font-headline tracking-tighter flex items-center gap-3 uppercase">
             <CustomIcon name="arrow-swap-horizontal" size={24} className="text-primary" />
             Talent Comparison
           </h2>
           <button onClick={onClose} className="p-2 bg-surface-container-low rounded-full text-on-surface-variant hover:text-error transition-colors">
             <CustomIcon name="close-circle" size={20} />
           </button>
        </div>

        {!comparison ? (
           <div className="text-center space-y-8 py-10">
              <div className="flex justify-center items-center gap-4">
                  <div className="p-6 bg-surface-container-low rounded-3xl border-2 border-primary/20">
                    <span className="text-lg font-black text-on-surface">{results.find(r => r._id === ids[0])?.candidate.fullname}</span>
                  </div>
                  <span className="text-xl font-black text-primary/20 tracking-tighter font-headline">VS</span>
                 <div className="p-6 bg-surface-container-low rounded-3xl border-2 border-secondary/20">
                    <span className="text-lg font-black text-on-surface">{results.find(r => r._id === ids[1])?.candidate.fullname}</span>
                 </div>
              </div>
              <button 
                onClick={runCompare} 
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'AI Analyzing...' : '🤖 Start Deep Comparison'}
              </button>
           </div>
        ) : (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['A', 'B'].map((side, i) => {
                  const c = side === 'A' ? comparison.candidateA : comparison.candidateB;
                  const isWinner = comparison.winner === side;
                  return (
                    <div key={side} className={`p-6 rounded-3xl border-2 space-y-4 ${isWinner ? 'bg-primary/5 border-primary' : 'bg-surface-container-low border-transparent'}`}>
                       <div className="flex justify-between items-start">
                          <h4 className="text-lg font-black font-headline text-on-surface">{c.name}</h4>
                          <span className={`text-lg font-black ${isWinner ? 'text-primary' : 'text-on-surface-variant'}`}>{c.score}%</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Advantages</p>
                          {c.advantages?.map((a: string, k: number) => (
                             <div key={k} className="flex gap-2 text-[11px] font-bold text-on-surface-variant">
                               <span className="text-emerald-500">✓</span> {a}
                             </div>
                          ))}
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-error uppercase tracking-widest">Limitations</p>
                          {c.disadvantages?.map((d: string, k: number) => (
                             <div key={k} className="flex gap-2 text-[11px] font-bold text-on-surface-variant">
                               <span className="text-error">·</span> {d}
                             </div>
                          ))}
                       </div>
                    </div>
                  );
                })}
             </div>

             <div className="bg-primary p-6 rounded-3xl text-on-primary relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-md font-black font-headline mb-2 flex items-center gap-2 uppercase tracking-tighter">
                     <CustomIcon name="status-up" size={16} />
                     The Verdict
                   </h4>
                   <p className="text-[11px] font-bold opacity-90 leading-relaxed">
                      {comparison.recommendation}
                   </p>
                </div>
                <CustomIcon name="verify" size={100} className="absolute -right-8 -bottom-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function AIDashboardContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';

  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selected, setSelected] = useState<ScreeningResult | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decidedIds, setDecidedIds] = useState<Record<string, 'Accepted' | 'Rejected'>>({});

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'primary' | 'error' | 'warning' | 'success';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinScore, setFilterMinScore] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [sort, setSort] = useState('score');

  const loadData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const params: any = { sort };
      if (filterCategory) params.category = filterCategory;
      if (filterMinScore) params.minScore = filterMinScore;
      if (filterFavorite) params.isFavorite = 'true';
      if (filterStatus) params.applicationStatus = filterStatus;

      const [screeningRes, dashRes] = await Promise.allSettled([
        axiosInstance.get(`/api/ai/screening/${jobId}`, { params }),
        axiosInstance.get(`/api/ai/dashboard/${jobId}`),
      ]);

      if (screeningRes.status === 'fulfilled') {
        const found = screeningRes.value.data.results || [];
        setResults(found);
        if (found.length > 0 && !selected) setSelected(found[0]);

        // Restore decided state from the real Applicant status (persists across refreshes)
        const initialDecided: Record<string, 'Accepted' | 'Rejected'> = {};
        found.forEach((r: any) => {
          const appStatus = r.applicationStatus;
          if (appStatus === 'Accepted' || appStatus === 'Rejected') {
            initialDecided[r._id] = appStatus as 'Accepted' | 'Rejected';
          }
        });
        setDecidedIds(initialDecided);
      }
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data);
    } catch (e) {
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [jobId, sort, filterCategory, filterMinScore, filterFavorite, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleFavorite = async (screeningId: string) => {
    try {
      const { data } = await axiosInstance.patch(`/api/ai/favorite/${screeningId}`);
      setResults((prev) => prev.map((r) => r._id === screeningId ? { ...r, isFavorite: data.isFavorite } : r));
      if (selected?._id === screeningId) setSelected((s) => s ? { ...s, isFavorite: data.isFavorite } : s);
      toast.success(data.isFavorite ? 'Candidate favorited' : 'Favorite removed');
    } catch (e) { console.error(e); }
  };

  const handleQuickDecision = (screeningId: string, applicationId: string, decision: string) => {
    setModalConfig({
      isOpen: true,
      title: `${decision} Candidate?`,
      message: `Are you sure you want to mark this candidate as ${decision.toLowerCase()}? This action will move them in the pipeline.`,
      type: decision === 'Accepted' ? 'success' : 'error',
      confirmText: decision,
      onConfirm: async () => {
        try {
          await axiosInstance.post(`/api/ai/quick-decision-sync/${applicationId}`, { decision });
          toast.success(`Candidate ${decision}!`);
          // Mark as decided — hide buttons, show status badge
          setDecidedIds(prev => ({ ...prev, [screeningId]: decision as 'Accepted' | 'Rejected' }));
        } catch (e) {
          console.error(e);
          toast.error("Failed to update decision");
        }
      }
    });
  };

  const handleRescanAll = () => {
    if (!jobId) return;
    
    setModalConfig({
      isOpen: true,
      title: 'Rescan All Candidates?',
      message: 'This will delete current AI analysis and rerun the full screening engine for all applicants. This may take a few moments.',
      type: 'warning',
      confirmText: 'Start Rescan',
      onConfirm: async () => {
        setLoading(true);
        try {
          const { data } = await axiosInstance.post(`/api/ai/rescan/${jobId}`);
          toast.success(data.message || "Rescan triggered!");
          setTimeout(() => loadData(), 2000);
        } catch (e: any) {
          toast.error(e.response?.data?.message || "Rescan failed");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleAddCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) { toast.error('Max 2 candidates'); return prev; }
      return [...prev, id];
    });
  };

  return (
    <ProtectedRoute allowedRoles={['employer']}>
      
        {!jobId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <CustomIcon name="psychology-alt" size={64} className="text-primary/20" />
            <h2 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tighter">AI Hub Missing Access</h2>
            <p className="text-on-surface-variant font-bold max-w-sm text-[10px] uppercase tracking-widest leading-relaxed">
              Please select a specific job from your dashboard to view its AI insights.
            </p>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto space-y-6 pb-20 px-4 md:px-8">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-black text-on-surface tracking-normal font-headline uppercase leading-none">AI Analysis Engine</h1>
                <p className="text-on-surface-variant max-w-lg font-normal text-[10px] uppercase tracking-widest leading-relaxed font-sora">
                  Gemini-powered screening with real-time skill matching and cultural fit predictors.
                </p>
              </div>

              <div className="flex gap-3">
                {compareIds.length > 0 && (
                  <button 
                    onClick={() => setShowCompare(true)}
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:-translate-y-1 transition-all"
                  >
                    <CustomIcon name="arrow-swap-horizontal" size={14} />
                    Compare ({compareIds.length}/2)
                  </button>
                )}
                <button 
                  onClick={handleRescanAll}
                  className="px-5 py-2.5 bg-primary-dark-custom text-white rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  <CustomIcon name="refresh" size={14} />
                  Rescan All
                </button>
                <button className="px-5 py-2.5 bg-surface-container-low text-black rounded-full font-black text-[9px] uppercase tracking-widest border border-outline-variant/20 flex items-center gap-2 hover:bg-surface-container-high transition-colors">
                  <CustomIcon name="export-1" size={14} /> Export Report
                </button>
              </div>
            </header>

            {/* Stats Cards (Bento) */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              {[
                { label: 'Analysed', value: stats?.total || 0, color: 'text-primary' },
                { label: 'Strong', value: stats?.byCategory.find(c => c._id === 'Strong')?.count || 0, color: 'text-emerald-500' },
                { label: 'Accepted', value: stats?.acceptedCount || 0, color: 'text-emerald-600' },
                { label: 'Rejected', value: stats?.rejectedCount || 0, color: 'text-error' },
                { label: 'Shortlist', value: stats?.shortlistedCount || 0, color: 'text-tertiary' },
                { label: 'Favorites', value: stats?.favoriteCount || 0, color: 'text-amber-500' },
              ].map((s, i) => (
                <div key={i} className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5">
                  <p className="text-[9px] font-normal uppercase tracking-widest text-on-surface-variant mb-1 font-sora">{s.label}</p>
                  <p className={`text-lg font-black font-headline tracking-normal ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start">
              <aside className="space-y-6">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 space-y-3">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <CustomIcon name="filter" size={12} /> Filters
                  </h3>
                  <div className="space-y-2">
                    <select 
                      value={filterCategory} 
                      onChange={e => setFilterCategory(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-lg p-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="">All Categories</option>
                      <option value="Strong">Strong Only</option>
                      <option value="Potential">Potential</option>
                      <option value="Weak">Weak</option>
                    </select>
                    <select 
                      value={filterStatus} 
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-lg p-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Applied">Applied</option>
                      <option value="Accepted">Accepted Only</option>
                      <option value="Rejected">Rejected Only</option>
                    </select>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Min Score" 
                        type="number" 
                        value={filterMinScore}
                        onChange={e => setFilterMinScore(e.target.value)}
                        className="flex-1 bg-surface-container-low border-none rounded-lg p-2.5 text-[10px] font-bold text-on-surface focus:ring-2 focus:ring-primary/20"
                      />
                      <select 
                        value={sort} 
                        onChange={e => setSort(e.target.value)}
                        className="flex-1 bg-surface-container-low border-none rounded-lg p-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant focus:ring-2 focus:ring-primary/20 appearance-none"
                      >
                        <option value="score">Sort by Score</option>
                        <option value="rank">Sort by Rank</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setFilterFavorite(!filterFavorite)}
                      className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                        filterFavorite 
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-inner' 
                          : 'bg-surface-container-low text-on-surface-variant/60 border-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      <CustomIcon name="star" size={14} className={filterFavorite ? 'text-amber-500' : 'opacity-40'} />
                      {filterFavorite ? 'Favorites Selected' : 'Show Favorites Only'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[700px] pr-2 no-scrollbar">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 bg-surface-container-low rounded-2xl animate-pulse" />
                    ))
                  ) : results.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">No candidates found</p>
                    </div>
                  ) : (
                    results.map((r) => (
                      <CandidateCard
                        key={r._id}
                        result={r}
                        onSelect={setSelected}
                        onToggleFavorite={handleToggleFavorite}
                        onQuickDecision={handleQuickDecision}
                        isSelected={selected?._id === r._id}
                        compareIds={compareIds}
                        onAddCompare={handleAddCompare}
                        decidedIds={decidedIds}
                      />
                    ))
                  )}
                </div>
              </aside>

              <main className="h-full min-h-[700px]">
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div
                      key={selected._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <DetailPanel result={selected} />
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 bg-surface-container-low rounded-4xl border border-dashed border-outline-variant/30 text-center">
                      <CustomIcon name="user-search" size={64} className="text-outline-variant/20 mb-4" />
                      <p className="text-lg font-headline font-black text-on-surface-variant tracking-tighter uppercase leading-none">Choose a profile to start analysis</p>
                    </div>
                  )}
                </AnimatePresence>
              </main>
            </div>

            {showCompare && (
              <CompareModal ids={compareIds} results={results} jobId={jobId} onClose={() => setShowCompare(false)} />
            )}

            <ConfirmationModal
              isOpen={modalConfig.isOpen}
              onClose={closeModal}
              onConfirm={modalConfig.onConfirm}
              title={modalConfig.title}
              message={modalConfig.message}
              type={modalConfig.type}
              confirmText={modalConfig.confirmText}
            />
          </div>
        )}
      
    </ProtectedRoute>
  );
}

export default function AIDashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black uppercase tracking-widest text-on-surface-variant animate-pulse">Loading Analysis Engine...</div>}>
      <AIDashboardContent />
    </Suspense>
  );
}

