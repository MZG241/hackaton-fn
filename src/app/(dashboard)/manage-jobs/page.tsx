"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CustomIcon from "@/components/ui/CustomIcon";
import { PremiumGlassCard, Badge, AppleButton } from "@/components/ui/premium/Common";

const ManageJobsPage = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc" as "asc" | "desc");
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const JOBS_PER_PAGE = 12;

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/job/me");
            if (response.data.success) {
                setJobs(response.data.data);
            }
        } catch (err) {
            toast.error("Failed to sync your job positions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const filteredJobs = useMemo(() => {
        let result = [...jobs];

        if (searchTerm) {
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "All") {
            result = result.filter(job =>
                statusFilter === "Active" ? !job.isClosed : job.isClosed
            );
        }

        result.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [jobs, searchTerm, statusFilter, sortField, sortDirection]);

    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filteredJobs, currentPage]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

    const handleSort = (field: string) => {
        if (field === sortField) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Are you sure you want to delete this position permanently?")) return;
        try {
            const response = await axiosInstance.delete(`/api/job/delete/${jobId}`);
            if (response.data.success) {
                setJobs(prev => prev.filter(job => job._id !== jobId));
                toast.success("Position deleted from the ecosystem.");
            }
        } catch (err) {
            toast.error("Failed to eliminate the position.");
        }
    };

    const toggleJobStatus = async (jobId: string, isCurrentlyClosed: boolean) => {
        try {
            await axiosInstance.patch(`/api/job/status/${jobId}`);
            setJobs(prev => prev.map(job =>
                job._id === jobId ? { ...job, isClosed: !job.isClosed } : job
            ));
            toast.success(`Position updated to ${isCurrentlyClosed ? 'Active' : 'Closed'}`);
        } catch (err) {
            toast.error("Status sync failed.");
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedRoute allowedRoles={['admin', 'employer']}>
            
                <div className="max-w-[1400px] mx-auto space-y-6 pb-32 px-4 md:px-0">
                    
                    {/* Aurora Minimalist Header */}
                    <header className="flex items-center justify-between border-b border-outline-ghost/30 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                <CustomIcon name="briefcase" size={18} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-on-surface tracking-tight uppercase leading-none">Manage Positions</h1>
                                <p className="text-[9px] font-black text-text-faint uppercase tracking-widest mt-1">Ecosystem Infrastructure</p>
                            </div>
                        </div>
                        <AppleButton 
                            label="Launch Node" 
                            tone="primary" 
                            onClick={() => router.push('/post-job')}
                            className="h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        />
                    </header>

                    {/* Compact Integrated Tools */}
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 w-full relative group">
                            <CustomIcon name="search-normal" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Audit positions..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-outline-ghost focus:border-primary/30 transition-all font-bold text-on-surface placeholder:text-text-faint text-[11px] tracking-wide h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-[180px] relative">
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`w-full h-10 px-4 rounded-xl bg-white border border-outline-ghost flex items-center justify-between group hover:border-primary/30 transition-all ${isFilterOpen ? 'border-primary/30' : ''}`}
                            >
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <CustomIcon name="filter" size={14} className="text-text-faint group-hover:text-primary transition-colors cursor-pointer" />
                                    <span className="text-[10px] font-black tracking-widest text-on-surface uppercase cursor-pointer">{statusFilter}</span>
                                </div>
                                <CustomIcon name="arrow-down" size={12} className={`text-text-faint transition-transform duration-300 cursor-pointer ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsFilterOpen(false)}
                                            className="fixed inset-0 z-10"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                            className="absolute top-11 left-0 w-full bg-white border border-outline-ghost rounded-xl shadow-shell z-20 py-1 overflow-hidden"
                                        >
                                            {["All", "Active", "Inactive"].map((filter) => (
                                                <button
                                                    key={filter}
                                                    onClick={() => {
                                                        setStatusFilter(filter);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-surface-soft text-on-surface hover:text-primary transition-all text-left cursor-pointer"
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-wider cursor-pointer">{filter}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Job Grid - Dense & Premium */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-4 bg-surface-soft/30 rounded-3xl border border-outline-ghost/20">
                                <div className="w-8 h-8 border-3 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.3em]">Synthesizing Records...</p>
                            </div>
                        ) : (
                            <motion.div 
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            >
                                {paginatedJobs.length > 0 ? (
                                    paginatedJobs.map((job) => (
                                        <motion.div key={job._id} variants={item}>
                                            <PremiumGlassCard variant="white" className="p-5 h-full min-h-[220px] flex flex-col justify-between group hover:translate-y-[-4px] transition-all cursor-pointer">
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                                                            <CustomIcon name="briefcase" size={18} />
                                                        </div>
                                                        <Badge 
                                                            label={job.isClosed ? 'Paused' : 'Active'} 
                                                            tone={job.isClosed ? 'warning' : 'primary'} 
                                                            className="scale-90 origin-right"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 onClick={() => router.push(`/manage-jobs/${job._id}`)} className="text-[15px] font-black text-on-surface leading-tight tracking-tight uppercase cursor-pointer hover:text-primary transition-colors line-clamp-2">{job.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                            <span className="text-[9px] font-black text-text-faint uppercase tracking-widest flex items-center gap-1.5">
                                                                <CustomIcon name="location" size={10} />
                                                                {job.location || 'Remote'}
                                                            </span>
                                                            <span className="text-[9px] font-black text-text-faint uppercase tracking-widest flex items-center gap-1.5">
                                                                <CustomIcon name="calendar" size={10} />
                                                                {new Date(job.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-outline-ghost/30 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <button 
                                                            onClick={() => toggleJobStatus(job._id, job.isClosed)}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-surface-soft text-text-soft hover:bg-on-surface hover:text-white cursor-pointer`}
                                                            title={job.isClosed ? "Play" : "Pause"}
                                                        >
                                                            <CustomIcon name={job.isClosed ? 'play' : 'pause'} size={14} className="cursor-pointer" />
                                                        </button>
                                                        <button 
                                                            onClick={() => router.push(`/post-job/${job._id}`)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-surface-soft text-text-soft hover:bg-on-surface hover:text-white cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <CustomIcon name="edit-2" size={14} className="cursor-pointer" />
                                                        </button>
                                                        <button 
                                                            onClick={() => router.push(`/employer/ai-dashboard?jobId=${job._id}`)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer"
                                                            title="Analytics"
                                                        >
                                                            <CustomIcon name="flash" size={14} className="cursor-pointer" />
                                                        </button>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleDelete(job._id)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-error/10 text-error hover:bg-error hover:text-white"
                                                        title="Delete"
                                                    >
                                                        <CustomIcon name="trash" size={14} />
                                                    </button>
                                                </div>
                                            </PremiumGlassCard>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-dashed border-outline-ghost/50 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center text-text-faint">
                                            <CustomIcon name="search-status" size={24} />
                                        </div>
                                        <p className="text-[11px] font-black text-text-faint uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">No job nodes detected in the current filter.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Compact Pagination */}
                    {filteredJobs.length > JOBS_PER_PAGE && (
                        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-outline-ghost shadow-shell mt-8">
                            <p className="text-[10px] font-black text-on-surface uppercase tracking-widest">
                                Page <span className="text-primary">{currentPage}</span> / {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === 1}
                                    className="h-8 px-4 rounded-lg bg-surface-soft text-text-soft text-[9px] font-black uppercase tracking-widest hover:bg-on-surface hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage >= totalPages}
                                    className="h-8 px-4 rounded-lg bg-surface-soft text-text-soft text-[9px] font-black uppercase tracking-widest hover:bg-on-surface hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            
        </ProtectedRoute>
    );
};

export default ManageJobsPage;

