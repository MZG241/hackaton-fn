'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/ProtectedRoute';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-hot-toast';
import CustomIcon from '@/components/ui/CustomIcon';
import { motion } from 'framer-motion';

const parseSkills = (skills: any): string[] => {
    if (!skills) return [];
    let str = '';
    if (typeof skills === 'string') str = skills;
    else if (Array.isArray(skills)) str = JSON.stringify(skills);
    const clean = str.replace(/[\[\]"'\\]/g, '');
    if (!clean.trim()) return [];
    return clean.split(',').map((s: string) => s.trim()).filter(Boolean);
};

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await axiosInstance.get(`/api/job/${id}`);
                setJob(response.data.data);
            } catch (error: any) {
                console.error("Job load error:", error);
                toast.error("Failed to retrieve the job details.");
                router.push('/manage-jobs');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJob();
    }, [id, router]);

    if (loading) {
        return (
            <ProtectedRoute>
                
                    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Loading job details...</p>
                    </div>
                
            </ProtectedRoute>
        );
    }

    if (!job) return null;

    return (
        <ProtectedRoute>
            
                <div className="max-w-[1000px] mx-auto space-y-8">
                    {/* Header Nav */}
                    <button 
                        onClick={() => router.push('/manage-jobs')}
                        className="flex items-center gap-3 text-on-surface-variant/60 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        <CustomIcon name="arrow-left" size={16} /> Back to Hub
                    </button>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] border border-outline-variant/10 overflow-hidden shadow-2xl shadow-primary/5"
                    >
                        {/* Status Bar */}
                        <div className={`h-2 w-full ${job.isClosed ? 'bg-error' : 'bg-emerald-500'}`} />

                        {/* Top Context */}
                        <div className="bg-surface-container-low p-10 md:p-14 border-b border-outline-variant/10 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                                <div className="space-y-6 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black tracking-widest uppercase border border-primary/10">{job.category}</span>
                                        <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black tracking-widest uppercase border border-emerald-500/10">{job.type}</span>
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border ${job.isClosed ? 'bg-error/10 text-error border-error/10' : 'bg-blue-500/10 text-blue-500 border-blue-500/10'}`}>
                                            {job.isClosed ? 'Closed Job' : 'Active Job'}
                                        </span>
                                    </div>
                                    
                                    <h1 className="text-4xl md:text-6xl font-black text-on-surface font-headline leading-[0.9] tracking-tighter uppercase">
                                        {job.title}
                                    </h1>
                                    
                                    <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-medium text-sm pt-2">
                                        <div className="flex items-center gap-2"><CustomIcon name="location" size={18} className="text-primary" /> {job.location || 'Remote Sync'}</div>
                                        <div className="flex items-center gap-2"><CustomIcon name="teacher" size={18} className="text-primary" /> {job.experienceLevel || 'Any Experience'}</div>
                                        {(job.salaryMin || job.salaryMax) && (
                                            <div className="flex items-center gap-2"><CustomIcon name="money-send" size={18} className="text-emerald-500" /> ${job.salaryMin || 0} - ${job.salaryMax || 0}</div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <CustomIcon name="calendar" size={18} className="text-amber-500" /> 
                                            Published {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <button 
                                        onClick={() => router.push(`/employer/ai-dashboard?jobId=${job._id}`)}
                                        className="w-full h-12 bg-primary text-on-primary rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                    >
                                        <CustomIcon name="flash" size={16} /> AI Dashboard
                                    </button>
                                    <button 
                                        onClick={() => router.push(`/post-job/${job._id}`)}
                                        className="w-full h-12 bg-white text-on-surface-variant/60 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:text-primary border border-outline-variant/20 hover:border-primary/20 transition-all"
                                    >
                                        <CustomIcon name="edit-2" size={16} /> Edit Job
                                    </button>
                                </div>
                            </div>
                            
                            {/* Watermark */}
                            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-x-1/4 translate-y-1/4">
                                <CustomIcon name="briefcase" size={300} />
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-10 md:p-14 space-y-16">
                            <div className="prose prose-sm md:prose-base prose-primary max-w-none text-on-surface-variant font-medium leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: job.description || '<p>No description provided.</p>' }} 
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-outline-variant/10">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-3">
                                        <CustomIcon name="task-square" size={18} /> Requirements
                                    </h3>
                                    <div className="prose prose-sm max-w-none text-on-surface-variant font-medium leading-relaxed" 
                                        dangerouslySetInnerHTML={{ __html: job.requirements || '<p>No requirements specified.</p>' }} 
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-3">
                                        <CustomIcon name="flash" size={18} /> Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {parseSkills(job.skillsRequired).length > 0 ? parseSkills(job.skillsRequired).map((skill: string, i: number) => (
                                            <span key={i} className="px-5 py-3 rounded-2xl bg-amber-500/5 text-amber-600 border border-amber-500/10 text-[10px] font-black uppercase tracking-widest shadow-sm">{skill}</span>
                                        )) : <p className="text-sm text-on-surface-variant/40">Not specified</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            
        </ProtectedRoute>
    );
}
