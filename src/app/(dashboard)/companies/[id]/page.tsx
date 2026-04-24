'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import axiosInstance from "@/lib/axiosInstance";
import { PremiumGlassCard, AppleButton, Badge } from "@/components/ui/premium/Common";
import { 
    BriefcaseIcon, 
    SparklesIcon, 
    SearchIcon,
    ArrowRightIcon,
    TrendingUpIcon,
    CalendarIcon,
    XCircleIcon
} from "@/components/ui/premium/PremiumIcons";
import moment from "moment";
import { IUser, IJob } from "@/types";
import { ChevronLeft, MapPin, Globe, Users, Building2, ExternalLink, DollarSign, Clock } from "lucide-react";

const CompanyProfilePage = () => {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const [company, setCompany] = useState<IUser | null>(null);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            
            // Parallel fetch for profile and jobs
            const [profileRes, jobsRes] = await Promise.all([
                axiosInstance.get(`/api/user/${id}`),
                axiosInstance.get(`/api/user/jobs/${id}`)
            ]);

            if (profileRes.data.success) {
                setCompany(profileRes.data.data);
            } else {
                throw new Error("Failed to fetch profile");
            }

            if (jobsRes.data.success) {
                setJobs(Array.isArray(jobsRes.data.data) ? jobsRes.data.data : []);
            }

        } catch (err: any) {
            console.error("Error fetching company data:", err);
            setError(err.response?.data?.message || "Failed to synchronize company profile.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['jobseeker', 'employer', 'admin']}>
                <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-primary/10 rounded-full"></div>
                        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface/30">Loading..</p>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !company) {
        return (
            <ProtectedRoute allowedRoles={['jobseeker', 'employer', 'admin']}>
                <div className="max-w-xl mx-auto py-20 px-6 text-center">
                    <PremiumGlassCard variant="white" className="p-12 space-y-8 border-rose-100/50 shadow-2xl shadow-rose-500/5">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-100">
                            <XCircleIcon className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-on-surface tracking-tighter">Access Denied</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                                {error || "Profile synchronization failure"}
                            </p>
                        </div>
                        <AppleButton label="Return to Dashboard" onClick={() => router.push('/candidate-dashboard')} className="w-full !h-12" />
                    </PremiumGlassCard>
                </div>
            </ProtectedRoute>
        );
    }

    const companyName = company.companyName || company.fullname || "Anonymous Entity";
    const companyBio = company.companyDescription || company.bio || "No tactical brief available for this organization.";

    return (
        <ProtectedRoute allowedRoles={['jobseeker', 'employer', 'admin']}>
            <div className="max-w-[1500px] mx-auto space-y-10 pb-32 px-4 md:px-6">
                
                {/* Hero Profile Header */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2.5rem] blur-3xl opacity-50" />
                    <PremiumGlassCard variant="white" className="relative p-10 border border-outline-soft shadow-sm overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
                            <div className="relative group">
                                <Link href="/candidate-dashboard" className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-white border border-outline-soft flex items-center justify-center text-on-surface-variant hover:bg-on-surface hover:text-white transition-all shadow-xl z-20">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-40 h-40 bg-white border-2 border-outline-soft rounded-[2.5rem] p-6 shadow-2xl flex items-center justify-center overflow-hidden relative">
                                    {company.companyLogo ? (
                                        <Image src={company.companyLogo} fill className="object-contain p-6" alt={companyName} />
                                    ) : (
                                        <Building2 className="w-16 h-16 text-on-surface-variant/10" />
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                        <h1 className="text-4xl font-black text-on-surface tracking-tight leading-none uppercase">
                                            {companyName}
                                        </h1>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                                            Verified Entity
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface-variant/60 max-w-2xl leading-relaxed">
                                        {companyBio}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-surface-variant/5 rounded-xl border border-outline-soft">
                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/60">
                                            {company.location || "Global Remote"}
                                        </span>
                                    </div>
                                    {company.website && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 bg-surface-variant/5 rounded-xl border border-outline-soft">
                                                <Globe className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                                {company.website.replace(/^https?:\/\//, '')}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                   
                                </div>
                            </div>
                            
                            
                        </div>
                    </PremiumGlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left: Jobs List */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow" />
                                <h2 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em]">Active Acquisitions</h2>
                            </div>
                            <Badge label={`${jobs.length} Positions`} tone="default" className="!px-3 !py-1 !text-[9px]" />
                        </div>
                        
                        <div className="space-y-6">
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <PremiumGlassCard variant="white" className="p-8 border border-outline-soft hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer" onClick={() => router.push(`/jobs/${job._id}`)}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" />
                                                                {job.createdAt ? moment(job.createdAt).fromNow() : "Recently Posted"}
                                                            </span>
                                                            {(job.salaryMin !== undefined || job.salaryMax !== undefined) && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    {job.salaryMin ? `$${(job.salaryMin/1000).toFixed(0)}k` : "TBD"}
                                                                    {job.salaryMax ? ` - $${(job.salaryMax/1000).toFixed(0)}k` : ""}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2">
                                                        {job.skillsRequired?.slice(0, 5).map((skill, i) => (
                                                            <span key={i} className="px-3 py-1 bg-surface-variant/5 border border-outline-soft rounded-lg text-[8px] font-black uppercase tracking-widest text-on-surface-variant/60">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {job.skillsRequired && job.skillsRequired.length > 5 && (
                                                            <span className="px-3 py-1 bg-surface-variant/5 border border-outline-soft rounded-lg text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30">
                                                                +{job.skillsRequired.length - 5}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                        <ArrowRightIcon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </PremiumGlassCard>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-32 flex flex-col items-center gap-6 text-center border-2 border-dashed border-outline-soft rounded-[2.5rem]">
                                    <div className="w-16 h-16 rounded-2xl bg-surface-variant/5 flex items-center justify-center">
                                        <SearchIcon className="w-8 h-8 text-on-surface-variant/10" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-on-surface uppercase tracking-widest">No active vacancies</p>
                                        <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Check back later for new opportunities</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Right: Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] pl-1">Organizational Intelligence</h3>
                            <PremiumGlassCard variant="white" className="p-8 border border-outline-soft shadow-sm">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-surface-variant/5 border border-outline-soft rounded-2xl space-y-2">
                                            <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Hiring Rate</p>
                                            <p className="text-2xl font-black text-on-surface tracking-tighter">94%</p>
                                        </div>
                                        <div className="p-5 bg-surface-variant/5 border border-outline-soft rounded-2xl space-y-2">
                                            <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Culture Score</p>
                                            <p className="text-2xl font-black text-primary tracking-tighter">4.9</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-black text-on-surface uppercase tracking-widest">Market Influence</span>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Elite Tier</span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-variant/5 rounded-full overflow-hidden border border-outline-soft/10">
                                            <div className="h-full w-[92%] bg-primary rounded-full shadow-glow" />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-outline-soft space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <p className="text-[9px] font-bold text-on-surface-variant leading-tight uppercase tracking-widest">Peak Talent Engagement</p>
                                        </div>
                                    </div>
                                </div>
                            </PremiumGlassCard>
                        </div>
                        
        
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CompanyProfilePage;
