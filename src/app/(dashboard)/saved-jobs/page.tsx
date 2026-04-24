'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import JobCard from "@/components/jobs/JobCard";
import JobDetailsModal from "@/components/jobs/JobDetailsModal";
import { IJob } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const SavedJobsPage = () => {
    const [savedJobsData, setSavedJobsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
    const [showJobDetails, setShowJobDetails] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const fetchSavedJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/api/saved');
            if (response.data.success) {
                setSavedJobsData(response.data.data || []);
            }
        } catch (err: any) {
            console.error("Error fetching saved jobs:", err);
            setError("Mission data retrieval failed. Neural sync disrupted.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedJobs();
    }, [fetchSavedJobs]);

    const removeSavedJob = async (jobId: string) => {
        if (isSaving) return;
        try {
            setIsSaving(true);
            const response = await axiosInstance.patch(`/api/saved/${jobId}`);
            if (response.data.success) {
                setSavedJobsData(prev => prev.filter(item => item.job._id !== jobId));
                toast.success("Mission data removed from secure vault.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Operation failed.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleApply = async (id: string) => {
        try {
            const response = await axiosInstance.post(`/api/applicant/apply/${id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSavedJobs();
                setShowJobDetails(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Deployment failed.");
        }
    };

    return (
        <ProtectedRoute allowedRoles={['jobseeker']}>
            
                <div className="max-w-[1600px] mx-auto space-y-16 pb-20">
                    {/* Tactical Archive Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-primary font-black uppercase text-xs tracking-[0.4em]">
                                <span className="w-12 h-[2px] bg-primary"></span>
                                Secure Intel Vault
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-on-surface font-headline tracking-tighter leading-none">
                                Tactical <span className="text-primary italic">favorites</span>.
                            </h1>
                            <p className="text-xl text-on-surface-variant/40 font-medium max-w-2xl leading-relaxed">
                                Missions prioritized for deployment. Review and execute with precision.
                            </p>
                        </div>

                        <div className="bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/10 flex items-center gap-1 self-start">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-primary text-on-primary" : "text-on-surface-variant/40 hover:bg-surface-container-high"}`}
                            >
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${viewMode === "list" ? "bg-primary text-on-primary" : "text-on-surface-variant/40 hover:bg-surface-container-high"}`}
                            >
                                <span className="material-symbols-outlined">format_list_bulleted</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-[600px] flex flex-col items-center justify-center gap-8 bg-surface-container-lowest rounded-[3rem] border border-outline-variant/10">
                            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="text-center space-y-2">
                                <p className="text-2xl font-black text-on-surface font-headline tracking-tighter uppercase">Synchronizing Neural Archive</p>
                                <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-[10px]">Retrieving prioritized data...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-16 bg-error/5 rounded-[3rem] border border-error/10 text-center space-y-8">
                            <p className="text-2xl font-black text-error font-headline tracking-tighter uppercase">{error}</p>
                            <button
                                onClick={() => fetchSavedJobs()}
                                className="px-10 py-5 bg-error text-white rounded-full font-headline font-black text-xs uppercase tracking-widest shadow-xl shadow-error/20"
                            >
                                Recalibrate Sync
                            </button>
                        </div>
                    ) : savedJobsData.length === 0 ? (
                        <div className="p-32 bg-surface-container-lowest rounded-[3rem] border border-outline-variant/10 text-center space-y-12">
                            <div className="w-32 h-32 bg-surface-container-high rounded-[2.5rem] flex items-center justify-center mx-auto border border-outline-variant/5">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant/10">bookmark</span>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter uppercase">Vault is Empty</h3>
                                <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-xs">Target tactical missions to secure them in your vault.</p>
                            </div>
                            <Link
                                href="/find-jobs"
                                className="inline-flex items-center gap-6 px-12 py-6 bg-primary text-on-primary rounded-full font-headline font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                Discover Active Missions
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    ) : (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "flex flex-col gap-8"}>
                            <AnimatePresence mode="popLayout">
                                {savedJobsData.map((item) => (
                                    <JobCard
                                        key={item._id}
                                        job={item.job}
                                        viewMode={viewMode}
                                        isSaved={true}
                                        onToggleSave={() => removeSavedJob(item.job._id)}
                                        onViewDetails={(j) => {
                                            setSelectedJob(j);
                                            setShowJobDetails(true);
                                        }}
                                        isSaving={isSaving}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <JobDetailsModal
                    job={selectedJob}
                    isOpen={showJobDetails}
                    onClose={() => setShowJobDetails(false)}
                    isSaved={true}
                    onToggleSave={() => selectedJob && removeSavedJob(selectedJob._id)}
                    onApply={handleApply}
                    isSaving={isSaving}
                />
            
        </ProtectedRoute>
    );
};

export default SavedJobsPage;

