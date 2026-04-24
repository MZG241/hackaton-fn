'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import axiosInstance from "@/lib/axiosInstance";
import { PremiumGlassCard, AppleButton } from "@/components/ui/premium/Common";
import { 
    BriefcaseIcon, 
    EyeIcon, 
    SparklesIcon, 
    SendIcon, 
    CalendarIcon, 
    XCircleIcon, 
    SearchIcon,
    TrendingUpIcon
} from "@/components/ui/premium/PremiumIcons";
import moment from "moment";
import { ChevronLeft, MapPin, DollarSign} from "lucide-react";

const ApplicationDetailPage = () => {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const [application, setApplication] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplicationDetail = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/api/applicant');
            if (response.data.success) {
                const found = response.data.data.find((app: any) => app._id === id);
                if (found) {
                    setApplication(found);
                } else {
                    setError("Application not found in the secure registry.");
                }
            }
        } catch (err: any) {
            console.error("Error fetching detail:", err);
            setError(err.response?.data?.message || "Synchronization failure.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchApplicationDetail();
    }, [fetchApplicationDetail]);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['jobseeker']}>
                <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-primary/10 rounded-full"></div>
                        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface/30">Loading Intelligence...</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !application) {
        return (
            <ProtectedRoute allowedRoles={['jobseeker']}>
                <div className="max-w-xl mx-auto py-20 px-6 text-center">
                    <PremiumGlassCard variant="white" className="p-12 space-y-8 border-rose-100/50 shadow-2xl shadow-rose-500/5">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-100">
                            <XCircleIcon className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-on-surface tracking-tighter">Access Aborted</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{error || "Data sync failure"}</p>
                        </div>
                        <AppleButton label="Return to Dashboard" onClick={() => router.push('/candidate-dashboard')} className="w-full !h-12" />
                    </PremiumGlassCard>
                </div>
            </ProtectedRoute>
        );
    }

    const job = application.job || null;
    const company = job?.company || null;
    const currentStatus = application.status || 'Applied';

    const stages = [
        { name: "Applied", id: "Applied", icon: <SendIcon className="w-5 h-5" /> },
        { name: "In Review", id: "In Review", icon: <EyeIcon className="w-5 h-5" /> },
        { name: "Shortlisted", id: "Shortlisted", icon: <SparklesIcon className="w-5 h-5" /> },
        { name: "Accepted", id: "Accepted", icon: <BriefcaseIcon className="w-5 h-5" /> }
    ];

    const currentStageIndex = stages.findIndex(s => s.id === currentStatus);

    return (
        <ProtectedRoute allowedRoles={['jobseeker']}>
            <div className="max-w-[1500px] mx-auto space-y-8 pb-32 px-4 md:px-6">
                
                {/* Floating Header Card */}
                <div className="relative">
                    <PremiumGlassCard variant="white" className="p-8 border border-outline-soft shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-start gap-6">
                                <Link href="/candidate-dashboard" className="mt-1 w-10 h-10 rounded-xl bg-white border border-outline-soft flex items-center justify-center text-on-surface-variant hover:bg-on-surface hover:text-white transition-all shadow-sm">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-black text-on-surface tracking-tight leading-none uppercase">
                                            {job?.title || "Position Detail"}
                                        </h1>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                                            {currentStatus}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 text-on-surface-variant/60">
                                            <div className="p-1.5 bg-surface-variant/5 rounded-lg border border-outline-soft">
                                                <BriefcaseIcon className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{company?.name || "Global Partner"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-on-surface-variant/60">
                                            <div className="p-1.5 bg-surface-variant/5 rounded-lg border border-outline-soft">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{job?.location || "Remote"}</span>
                                        </div>
                                        {(job?.salaryRange?.min || job?.salaryRange?.max) && (
                                            <div className="flex items-center gap-2 text-on-surface-variant/60">
                                                <div className="p-1.5 bg-surface-variant/5 rounded-lg border border-outline-soft">
                                                    <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest">
                                                    {job?.salaryRange?.min ? `$${(job.salaryRange.min/1000).toFixed(0)}k` : "TBD"} 
                                                    {job?.salaryRange?.max ? ` - $${(job.salaryRange.max/1000).toFixed(0)}k` : ""}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 lg:border-l border-outline-soft lg:pl-10">
                                <p className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.3em]">Neural ID</p>
                                <p className="text-base font-black text-on-surface tracking-[0.2em]">{application._id?.slice(-8).toUpperCase()}</p>
                                <div className="mt-1 px-2 py-0.5 bg-blue-500/5 text-blue-500 rounded-md border border-blue-500/10">
                                    <span className="text-[8px] font-black uppercase tracking-widest">Active Application</span>
                                </div>
                            </div>
                        </div>
                    </PremiumGlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Grid: Pipeline & Specs */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* High-Contrast Pipeline */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    Hiring Lifecycle
                                </h3>
                                <p className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-[0.2em]">Live Tracking</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {stages.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex;
                                    const isCurrent = idx === currentStageIndex;
                                    
                                    return (
                                        <PremiumGlassCard 
                                            key={stage.id} 
                                            className={`p-6 border transition-all duration-500 relative overflow-hidden ${
                                                isCurrent ? '!bg-primary text-white border-primary shadow-2xl shadow-primary/30' : 
                                                isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 
                                                'bg-white border-outline-soft shadow-sm hover:border-primary/20 transition-colors'
                                            }`}
                                        >
                                            <div className="space-y-4 relative z-10">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                                    isCurrent ? 'bg-white text-primary shadow-glow scale-110' : 
                                                    isCompleted ? 'bg-emerald-500 text-white' : 
                                                    'bg-surface-variant/10 text-on-surface-variant/40 border border-outline-soft'
                                                }`}>
                                                    {isCompleted ? <TrendingUpIcon className="w-5 h-5" /> : stage.icon}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isCurrent ? 'text-white/70' : 'text-on-surface-variant/50'}`}>Phase 0{idx + 1}</p>
                                                    <h4 className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : 'text-on-surface'}`}>{stage.name}</h4>
                                                </div>
                                            </div>
                                        </PremiumGlassCard>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Specification Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pl-1">
                                <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/20" />
                                <h3 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em]">Operational Brief</h3>
                            </div>
                            
                            <PremiumGlassCard variant="white" className="p-10 border border-outline-soft shadow-sm">
                                {job?.description ? (
                                    <div className="prose prose-on-surface max-w-none">
                                        <div className="text-[13px] font-bold text-on-surface-variant/80 leading-relaxed space-y-6" dangerouslySetInnerHTML={{ __html: job.description }} />
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center gap-6 text-on-surface-variant/20">
                                        <SearchIcon className="w-12 h-12 animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Metadata synchronization in progress...</p>
                                    </div>
                                )}
                            </PremiumGlassCard>

                            {job?.skillsRequired && job.skillsRequired.length > 0 && (
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3 pl-1">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
                                        <h3 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em]">Skill Requirements</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {job.skillsRequired.map((skill: string, i: number) => (
                                            <div key={i} className="px-5 py-2.5 bg-white border border-outline-soft rounded-xl text-[9px] font-black text-on-surface-variant uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all shadow-sm">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Grid: Entity & Insights */}
                    <div className="lg:col-span-4 space-y-10">
                        
                        {/* Company Profile Card */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] pl-1">Organization Profile</h3>
                            <PremiumGlassCard variant="white" className="p-8 border border-outline-soft shadow-sm">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 p-4 bg-surface-variant/5 rounded-2xl border border-outline-soft">
                                        <div className="w-14 h-14 rounded-xl bg-white border border-outline-soft shadow-sm flex items-center justify-center p-3 overflow-hidden relative">
                                            {company?.logo ? (
                                                <Image src={company.logo} fill className="object-contain p-2" alt={company?.name || "Company Logo"} />
                                            ) : (
                                                <span className="text-2xl font-black text-on-surface-variant/20 uppercase">
                                                    {company?.name?.charAt(0) || 'C'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-on-surface tracking-tight uppercase">{company?.name || "Global Entity"}</h4>
                                            <div className="flex items-center gap-1.5">
                                                <SparklesIcon className="w-3 h-3 text-primary" />
                                                <span className="text-[9px] text-primary font-black uppercase tracking-widest">Verified Partner</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: 'Applied', val: moment(application.appliedAt || application.createdAt).format('MMM DD, YYYY'), icon: <CalendarIcon className="w-3.5 h-3.5" /> },
                                            { label: 'Format', val: job?.type || 'Full Time', icon: <SearchIcon className="w-3.5 h-3.5" /> },
                                            { label: 'Deployment', val: job?.location || 'Remote', icon: <MapPin className="w-3.5 h-3.5" /> }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center px-4 py-3.5 bg-surface-variant/5 rounded-xl border border-outline-soft/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-on-surface-variant/30">{item.icon}</div>
                                                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <AppleButton 
                                        label="View Company" 
                                        tone="secondary" 
                                        className="w-full !h-12 !text-[9px] !font-black uppercase tracking-widest shadow-sm" 
                                        onClick={() => router.push(`/companies/${company?._id || company?.id}`)}
                                    />
                                </div>
                            </PremiumGlassCard>
                        </div>

                       
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ApplicationDetailPage;
