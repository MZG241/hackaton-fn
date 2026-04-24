'use client';

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';

import ProtectedRoute from "@/components/ProtectedRoute";
import { PremiumJobCard } from "@/components/ui/premium/PremiumJobCard";
import JobDetailsModal from "@/components/jobs/JobDetailsModal";
import { IJob, IUser } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";
import { PremiumGlassCard } from "@/components/ui/premium/Common";

const formatSalary = (min?: number, max?: number) => {
    if (!min) return "Competitive";
    if (!max) return `$${min.toLocaleString()}/yr`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

const JobSeekerDashboard = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [savedJobs, setSavedJobs] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
    const [showJobDetails, setShowJobDetails] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState({
        keyword: "",
        location: "",
        category: "",
        type: "",
        onlySaved: false
    });

    const jobCategories = [
        "Technology", "Healthcare", "Finance", "Education",
        "Marketing", "Design", "Engineering", "Customer Service"
    ];

    const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

    const fetchJobs = useCallback(async (filterParams = filters, pageNum = 1) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setIsFetchingMore(true);
            setError(null);
            const queryParams = new URLSearchParams();

            if (filterParams.keyword) queryParams.append('title', filterParams.keyword);
            if (filterParams.location) queryParams.append('location', filterParams.location);
            if (filterParams.category) queryParams.append('category', filterParams.category);
            if (filterParams.type) {
                const typeMapping: any = {
                    'Full-time': 'full-time',
                    'Part-time': 'part-time',
                    'Contract': 'contract',
                    'Internship': 'internship',
                    'Remote': 'remote'
                };
                queryParams.append('type', typeMapping[filterParams.type] || filterParams.type.toLowerCase());
            }
            if (filterParams.onlySaved) {
                queryParams.append('onlySaved', 'true');
            }
            
            queryParams.append('page', pageNum.toString());
            queryParams.append('limit', '20');

            const response = await axiosInstance.get(`/api/job?${queryParams.toString()}`);
            const newJobs = response.data.data || [];

            if (pageNum === 1) {
                setJobs(newJobs);
            } else {
                setJobs(prev => {
                    const existingIds = new Set(prev.map(j => j._id));
                    const filteredNew = newJobs.filter((j: any) => !existingIds.has(j._id));
                    return [...prev, ...filteredNew];
                });
            }

            if (response.data.totalPages !== undefined) {
                setHasMore(pageNum < response.data.totalPages);
            } else {
                setHasMore(newJobs.length === 20);
            }

            if (user && pageNum === 1) {
                try {
                    const savedResponse = await axiosInstance.get(`/api/saved`);
                    setSavedJobs(savedResponse.data.data.map((item: any) => item.job._id));
                } catch {
                    // Non-critical: saved jobs list may not be available
                }
            }
        } catch (err: any) {
            console.error("Error fetching jobs:", err);
            if (pageNum === 1) setError("Mission data retrieval failed. Please recalibrate.");
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    }, [filters, user]);

    const toggleSaveJob = async (id: string) => {
        if (isSaving) return;
        try {
            setIsSaving(true);
            const response = await axiosInstance.patch(`/api/saved/${id}`);
            toast.success(response.data.message);

            setSavedJobs(prev =>
                prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
            );
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleApply = async (id: string) => {
        try {
            const response = await axiosInstance.post(`/api/applicant/apply/${id}`);
            toast.success(response.data.message);
            fetchJobs();
            setShowJobDetails(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deployment failed");
        }
    };

    useEffect(() => {
        setPage(1);
        const timer = setTimeout(() => {
            fetchJobs(filters, 1);
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchJobs]);

    useEffect(() => {
        if (page > 1) {
            fetchJobs(filters, page);
        }
    }, [page, fetchJobs]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, isFetchingMore, loading]);

    const clearFilters = () => {
        setFilters({ keyword: "", location: "", category: "", type: "", onlySaved: false });
    };

    return (
        <ProtectedRoute allowedRoles={['jobseeker']}>
            
                <div className="space-y-6 pb-20">
                    {/* Search Hub - Compact & Clean */}
                    <div className="space-y-4">
                        <h1 className="text-xl font-black text-on-surface tracking-tighter">
                            Find Jobs
                        </h1>
                        
                        <div className="w-full flex flex-col md:flex-row p-2 md:p-1 bg-surface-soft rounded-xl border border-outline-ghost/30 gap-3 md:gap-1.5 shadow-none!">
                            <div className="flex-1 flex items-center px-4 gap-3 bg-white rounded-lg border border-outline-ghost/10 h-12 sm:h-11 focus-within:shadow-none! focus-within:ring-0! focus-within:border-outline-ghost/10!">
                                <CustomIcon name="search-normal" size={16} className="text-on-surface-variant/40 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Keyword or Stack..."
                                    value={filters.keyword}
                                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                    className="w-full bg-transparent text-[13px] font-bold border-none h-full focus:outline-none! focus:ring-0! focus-visible:outline-none! focus-visible:ring-0! placeholder:text-on-surface-variant/20 shadow-none! outline-none!"
                                />
                            </div>
                            <div className="flex-1 flex items-center px-4 gap-3 bg-white rounded-lg border border-outline-ghost/10 h-12 sm:h-11 focus-within:shadow-none! focus-within:ring-0! focus-within:border-outline-ghost/10!">
                                <CustomIcon name="location" size={16} className="text-on-surface-variant/40 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Location..."
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    className="w-full bg-transparent text-[13px] font-bold border-none h-full focus:outline-none! focus:ring-0! focus-visible:outline-none! focus-visible:ring-0! placeholder:text-on-surface-variant/20 shadow-none! outline-none!"
                                />
                            </div>
                            <button
                                onClick={() => fetchJobs()}
                                className="h-12 sm:h-11 px-8 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary-dim transition-all shadow-glow w-full md:w-auto"
                            >
                                Execute Scan
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Parameters Control Bar */}
                    <div className="sticky top-[-32px] z-40 pt-2 pb-4 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-ghost/10 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
                        <div className="space-y-4">
                            {/* Domain Selector (Scrollable) */}
                             <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="shrink-0 flex items-center gap-2 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest sm:border-r border-outline-ghost/30 sm:pr-4 h-auto sm:h-6">
                                    <CustomIcon name="grid-5" size={14} />
                                    Domains
                                </div>
                                <div className="flex-1 flex flex-wrap sm:flex-nowrap sm:overflow-x-auto scrollbar-hide items-center gap-2 pb-1">
                                    <button
                                        onClick={() => setFilters({ ...filters, category: "" })}
                                         className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${!filters.category ? 'bg-on-surface text-white border-on-surface shadow-sm' : 'bg-surface-soft border-outline-ghost/10 text-on-surface-variant/60 hover:bg-surface-muted'}`}
                                    >
                                        All Signal
                                    </button>
                                    {jobCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilters({ ...filters, category: cat })}
                                             className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${filters.category === cat ? 'bg-on-surface text-white border-on-surface shadow-sm' : 'bg-surface-soft border-outline-ghost/10 text-on-surface-variant/60 hover:bg-surface-muted'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Engagement Selector */}
                             <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="shrink-0 flex items-center gap-2 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest sm:border-r border-outline-ghost/30 sm:pr-4 h-auto sm:h-6">
                                    <CustomIcon name="timer-1" size={14} />
                                    Type
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {jobTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilters({ ...filters, type: filters.type === type ? "" : type })}
                                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${filters.type === type ? 'bg-on-surface text-white border-on-surface' : 'bg-white border-outline-ghost/20 text-on-surface-variant/60 hover:border-primary/30'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setFilters({ ...filters, onlySaved: !filters.onlySaved })}
                                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-2 ${filters.onlySaved ? 'bg-warning text-white border-warning' : 'bg-white border-warning/10 text-warning hover:border-warning/30 hover:bg-warning/5'}`}
                                    >
                                        <CustomIcon name="archive-add" size={14} className={filters.onlySaved ? "text-white" : "text-warning"} />
                                        Favorites
                                    </button>

                                    {(filters.category || filters.type || filters.keyword || filters.location || filters.onlySaved) && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-1.5 rounded-full text-[11px] font-black text-error bg-error/5 border border-error/10 hover:bg-error/10 transition-all flex items-center gap-2"
                                        >
                                            Clear Scan
                                            <CustomIcon name="refresh" size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Header */}
                    <div className="flex justify-between items-end pb-2">
                        <div className="space-y-1">
                            <h2 className="text-[15px] font-black text-on-surface tracking-tighter flex items-center gap-3">
                                Matching Intelligence
                                <span className="text-[9px] font-black px-2 py-0.5 bg-surface-soft text-on-surface-variant/60 rounded-full border border-outline-ghost/20">
                                    {jobs.length} Nodes
                                </span>
                            </h2>
                        </div>
                        <div className="flex bg-surface-soft p-1 rounded-xl border border-outline-ghost/20">
                            {[
                                { id: 'grid', icon: 'grid-1' },
                                { id: 'list', icon: 'textalign-justifyleft' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id as any)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === mode.id ? "bg-white text-on-surface shadow-sm border border-outline-ghost/20" : "text-on-surface-variant/30 hover:text-on-surface-variant"}`}
                                >
                                    <CustomIcon name={mode.icon} size={14} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="min-h-[600px]">
                        {loading ? (
                            <div className="h-[500px] flex flex-col items-center justify-center gap-4 bg-surface-soft/30 rounded-[3rem] border border-outline-ghost/10">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <div className="text-center">
                                    <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant/40">Synchronizing Signals...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-20 bg-error/5 rounded-[3rem] border border-error/10 text-center space-y-4">
                                <p className="text-xl font-black text-error tracking-tighter uppercase">{error}</p>
                                <button onClick={() => fetchJobs()} className="px-8 py-3 bg-error text-white rounded-xl font-bold text-xs uppercase tracking-widest">Retry Scan</button>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="p-32 bg-surface-soft/20 rounded-[3rem] border border-outline-ghost/10 text-center space-y-6">
                                <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mx-auto border border-outline-ghost/10">
                                    <CustomIcon name="search-status" size={40} className="text-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-on-surface tracking-tighter uppercase">No Match Detected</h3>
                                    <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-[9px]">The nebula is quiet. Adjust your spectrum.</p>
                                </div>
                                <button onClick={clearFilters} className="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mx-auto hover:scale-105 transition-all">
                                    Reset System Search
                                    <CustomIcon name="refresh" size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                                <AnimatePresence mode="popLayout">
                                    {jobs.map(job => {
                                        const company = typeof job.postedBy === 'object' ? (job.postedBy as IUser) : null;
                                        return (
                                            <motion.div
                                                key={job._id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <PremiumJobCard
                                                    jobId={job._id}
                                                    title={job.title}
                                                    company={company?.companyName || 'Akazi Partner'}
                                                    location={job.location}
                                                    type={job.type}
                                                    salary={formatSalary(job.salaryMin, job.salaryMax)}
                                                    skills={job.skillsRequired || []}
                                                    isSaved={savedJobs.includes(job._id)}
                                                    isSaving={isSaving}
                                                    hasApplied={(job as any).hasApplied}
                                                    onView={() => {
                                                        setSelectedJob(job);
                                                        setShowJobDetails(true);
                                                    }}
                                                    onApply={() => {
                                                        setSelectedJob(job);
                                                        setShowJobDetails(true);
                                                    }}
                                                    onToggleSave={() => toggleSaveJob(job._id)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {!loading && !error && jobs.length > 0 && (
                            <div ref={loaderRef} className="py-12 flex justify-center items-center m-auto w-full">
                                {isFetchingMore ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Expanding Neural Feed...</p>
                                    </div>
                                ) : hasMore ? (
                                    <div className="w-1 h-1 bg-transparent" />
                                ) : (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30 mt-6">End of neural feed reached</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <JobDetailsModal
                    job={selectedJob}
                    isOpen={showJobDetails}
                    onClose={() => setShowJobDetails(false)}
                    isSaved={selectedJob ? savedJobs.includes(selectedJob._id) : false}
                    onToggleSave={toggleSaveJob}
                    onApply={handleApply}
                    isSaving={isSaving}
                />
            
        </ProtectedRoute>
    );
};

export default JobSeekerDashboard;

