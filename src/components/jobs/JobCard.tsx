'use client';

import { IJob } from "@/types";
import { motion } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";
import Image from "next/image";
import moment from "moment";

interface JobCardProps {
    job: IJob;
    viewMode: 'grid' | 'list';
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    onViewDetails: (job: IJob) => void;
    isSaving?: boolean;
}

const JobCard = ({ job, viewMode, isSaved, onToggleSave, onViewDetails, isSaving }: JobCardProps) => {
    const company = typeof job.postedBy === 'object' ? job.postedBy : null;

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-surface-container-lowest rounded-4xl border border-outline-variant/10 p-6 hover:border-primary/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500 relative">
                        {company?.companyLogo ? (
                            <Image src={company.companyLogo} fill className="object-cover" alt={company.companyName as string} />
                        ) : (
                            <CustomIcon name="building-3" size={28} className="text-on-surface-variant/20" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-on-surface-variant/40 font-bold text-[10px]">
                            <span className="text-primary font-black uppercase tracking-widest">{company?.companyName || 'Strategic Partner'}</span>
                            <span className="w-1 h-1 bg-outline-variant/30 rounded-full"></span>
                            <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                                <CustomIcon name="location" size={14} />
                                {job.location}
                            </div>
                            <span className="w-1 h-1 bg-outline-variant/30 rounded-full"></span>
                            <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                                <CustomIcon name="clock" size={14} />
                                {job.type}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {job.salaryMin && (
                        <div className="hidden md:flex flex-col items-end px-4 border-r border-outline-variant/10">
                            <p className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-widest leading-none mb-1">Compensation</p>
                            <p className="text-emerald-600 font-headline font-black text-base tabular-nums">
                                ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                            </p>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onToggleSave(job._id)}
                            disabled={isSaving}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isSaved
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-surface-container-high text-on-surface-variant/40 hover:bg-on-surface hover:text-white"
                                }`}
                        >
                            <CustomIcon name={isSaved ? "archive-tick" : "archive-add"} size={20} />
                        </button>
                        <button
                            onClick={() => onViewDetails(job)}
                            className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
                        >
                            View Specs
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-surface-container-lowest rounded-4xl border border-outline-variant/10 p-6 hover:border-primary/20 transition-all flex flex-col h-full relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-700 relative">
                    {company?.companyLogo ? (
                        <Image src={company.companyLogo} fill className="object-cover" alt={company.companyName as string} />
                    ) : (
                        <CustomIcon name="building-3" size={28} className="text-on-surface-variant/20" />
                    )}
                </div>
                <button
                    onClick={() => onToggleSave(job._id)}
                    disabled={isSaving}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSaved
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-surface-container-high text-on-surface-variant/40 hover:bg-on-surface hover:text-white"
                        }`}
                >
                    <CustomIcon name={isSaved ? "archive-tick" : "archive-add"} size={18} />
                </button>
            </div>

            <div className="grow space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">{job.type}</span>
                    <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest leading-none">
                        <CustomIcon name="clock" size={14} />
                        {moment(job.createdAt).fromNow()}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="font-black text-on-surface-variant/60 text-[10px] uppercase tracking-widest">{company?.companyName || 'Strategic Partner'}</p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 font-bold text-on-surface-variant/40 text-xs">
                        <CustomIcon name="location" size={14} className="text-primary" />
                        {job.location}
                    </div>
                    {job.salaryMin && (
                        <div className="flex items-center gap-1.5 font-headline font-black text-emerald-600 text-xs">
                            <CustomIcon name="money-send" size={14} />
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                        </div>
                    )}
                </div>

                <div 
                    className="text-on-surface-variant/60 font-medium text-sm leading-relaxed line-clamp-3 pt-4 border-t border-outline-variant/5 prose prose-sm max-w-none *:m-0"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                />
            </div>

            <button
                onClick={() => onViewDetails(job)}
                className="w-full mt-8 py-4 bg-surface-container-high text-on-surface rounded-full font-headline font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all shadow-primary/20 hover:shadow-2xl"
            >
                Analyze Mission
            </button>
            
            {/* Design Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.div>
    );
};

export default JobCard;
