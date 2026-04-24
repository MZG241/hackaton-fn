'use client';

import { IJob } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CustomIcon from "@/components/ui/CustomIcon";
import moment from "moment";

interface JobDetailsModalProps {
    job: IJob | null;
    isOpen: boolean;
    onClose: () => void;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    onApply: (id: string) => void;
    isSaving?: boolean;
}

const JobDetailsModal = ({ job, isOpen, onClose, isSaved, onToggleSave, onApply, isSaving }: JobDetailsModalProps) => {
    if (!job) return null;

    const company = typeof job.postedBy === 'object' ? job.postedBy : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-on-surface/40 z-200"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[700px] lg:w-[850px] bg-surface rounded-l-[2rem] rounded-r-none shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.15)] z-201 overflow-hidden flex flex-col border-l border-outline-variant/10"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-6 flex justify-between items-center bg-surface sticky top-0 z-10 border-b border-outline-variant/5">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-on-surface hover:text-white transition-all rotate-180"
                                >
                                    <CustomIcon name="arrow-right" size={18} />
                                </button>
                                <h2 className="text-lg font-black text-on-surface font-headline tracking-tighter">Job Details</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onToggleSave(job._id)}
                                    disabled={isSaving}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSaved
                                            ? "bg-amber-500/10 text-amber-600"
                                            : "bg-surface-container-high text-on-surface-variant/40 hover:bg-on-surface hover:text-white"
                                        }`}
                                >
                                    <CustomIcon name={isSaved ? "archive-tick" : "archive-add"} size={20} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-error/10 hover:text-error transition-all"
                                >
                                    <CustomIcon name="close-circle" size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-12 scrollbar-hide">
                            {/* Hero Segment */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/5 flex items-center justify-center overflow-hidden shrink-0 relative">
                                    {company?.companyLogo ? (
                                        <Image src={company.companyLogo} fill className="object-cover" alt={company.companyName || "Company Logo"} />
                                    ) : (
                                        <CustomIcon name="building-3" size={24} className="text-on-surface-variant/20" />
                                    )}
                                </div>
                                <div className="text-center md:text-left space-y-1.5">
                                    <h1 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-tight">{job.title}</h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <p className="text-xs font-black text-primary uppercase tracking-widest">{company?.companyName || 'Strategic Partner'}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                                            <CustomIcon name="verify" size={12} className="mr-1.5" />
                                            Verified Post
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rapid Metadata Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { icon: 'briefcase', label: 'Job Type', value: job.type, color: 'text-primary' },
                                    { icon: 'location', label: 'Location', value: job.location, color: 'text-blue-500' },
                                    { icon: 'money-send', label: 'Salary', value: `${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || 'N/A'}`, color: 'text-emerald-500' },
                                    { icon: 'clock', label: 'Posted', value: moment(job.createdAt).fromNow(), color: 'text-amber-500' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5 group hover:bg-surface-container-high transition-colors">
                                        <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm ${stat.color}`}>
                                            <CustomIcon name={stat.icon} size={16} />
                                        </div>
                                        <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                        <p className="font-black text-on-surface font-headline text-[10px] capitalize leading-none">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                                        <h3 className="text-base font-black text-on-surface font-headline tracking-tighter">Job Description</h3>
                                    </div>
                                    <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 text-on-surface-variant/80 font-medium text-sm shadow-sm overflow-hidden break-words">
                                        <div 
                                            className="prose prose-sm max-w-none text-inherit [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-3 [&>h1]:text-xl [&>h1]:font-black [&>h2]:text-lg [&>h2]:font-black [&>h3]:text-base [&>h3]:font-black"
                                            dangerouslySetInnerHTML={{ __html: job.description }} 
                                        />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                        <h3 className="text-base font-black text-on-surface font-headline tracking-tighter">Required Skills</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(Array.isArray(job.skillsRequired) ? job.skillsRequired.flat() : (typeof job.skillsRequired === 'string' && (job.skillsRequired as string).startsWith('[') ? JSON.parse(job.skillsRequired).flat() : [job.skillsRequired])).map((skill: any, index: number) => (
                                            <span key={index} className="px-5 py-2.5 bg-surface-container-low text-on-surface rounded-xl font-black text-[9px] uppercase tracking-widest border border-outline-variant/5 hover:bg-primary hover:text-on-primary transition-all cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                {job.requirements && job.requirements.length > 0 && (
                                <section className="space-y-4 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                                        <h3 className="text-base font-black text-on-surface font-headline tracking-tighter">Requirements</h3>
                                    </div>
                                    <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 text-on-surface-variant/80 font-medium text-sm shadow-sm overflow-hidden break-words">
                                        <div 
                                            className="prose prose-sm max-w-none text-inherit [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-3"
                                            dangerouslySetInnerHTML={{ __html: job.requirements || '' }} 
                                        />
                                    </div>
                                </section>
                                )}
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="p-4 sm:p-6 bg-surface border-t border-outline-variant/5 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-surface-container-high text-on-surface rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface-container-highest transition-all"
                            >
                                Revert
                            </button>
                            {job.hasApplied ? (
                                <div className="flex-2 flex items-center justify-center gap-3 py-4 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.3em] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <CustomIcon name="tick-circle" size={18} />
                                    Applied
                                </div>
                            ) : job.isClosed ? (
                                <div className="flex-2 flex items-center justify-center py-4 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.3em] bg-surface-container-low text-on-surface-variant/20">
                                    Job Closed
                                </div>
                            ) : (
                                <button
                                    onClick={() => onApply(job._id)}
                                    className="flex-2 flex items-center justify-center gap-3 py-4 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.3em] bg-primary text-on-primary hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                                >
                                    <CustomIcon name="flash" size={18} />
                                    Apply Now
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JobDetailsModal;
