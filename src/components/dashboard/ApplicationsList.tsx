'use client';

import { motion } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";
import Image from "next/image";

interface Application {
    _id: string;
    applicantName: string;
    applicantImage?: string;
    jobTitle: string;
    status: string;
}

interface ApplicationsListProps {
    applications: Application[];
}

const statusMap: any = {
    'Accepted': { color: 'bg-emerald-500/10 text-emerald-600', icon: 'check_circle', label: 'Accepted' },
    'Rejected': { color: 'bg-error/10 text-error', icon: 'cancel', label: 'Rejected' },
    'Applied': { color: 'bg-primary/10 text-primary', icon: 'pending', label: 'New' },
    'In Review': { color: 'bg-tertiary/10 text-tertiary', icon: 'visibility', label: 'In Review' },
    'Shortlisted': { color: 'bg-amber-500/10 text-amber-600', icon: 'auto_awesome', label: 'Shortlisted' },
};

export const ApplicationsList = ({ applications }: ApplicationsListProps) => {
    return (
        <div className="flex flex-col gap-2">
            {applications.slice(0, 3).map((app, i) => {
                const status = statusMap[app.status] || statusMap['Applied'];

                return (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={app._id}
                        className="flex items-center gap-3 px-3 py-2 bg-surface-container-lowest hover:bg-primary/5 rounded-xl transition-all cursor-pointer group border border-outline-variant/5 hover:border-primary/10"
                    >
                        {/* Avatar */}
                        <div className="h-7 w-7 shrink-0 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden border border-outline-variant/10 group-hover:scale-110 transition-transform shadow-sm relative">
                            {app.applicantImage ? (
                                <Image src={app.applicantImage} fill className="object-cover" alt={app.applicantName} />
                            ) : (
                                <span className="text-[10px] font-black text-on-surface-variant/30 group-hover:text-primary transition-colors uppercase">
                                    {app.applicantName?.charAt(0) || 'A'}
                                </span>
                            )}
                        </div>

                        {/* Name & Job */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-on-surface truncate font-headline group-hover:text-primary transition-colors uppercase tracking-tight">{app.applicantName}</p>
                            <p className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-tighter truncate leading-none mt-0.5">{app.jobTitle}</p>
                        </div>

                        {/* Status badge */}
                        <div className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter shrink-0 ${status.color}`}>
                            {status.label}
                        </div>
                    </motion.div>
                );
            })}

            {applications.length > 3 && (
                <button 
                    onClick={() => window.location.href = '/manage-jobs'}
                    className="w-full py-4 bg-white/50 hover:bg-white text-on-surface-variant/40 hover:text-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-dashed border-outline-variant/20 hover:border-primary/20 flex items-center justify-center gap-3 group mt-2"
                >
                    <span>Tout voir les candidats</span>
                    <CustomIcon name="arrow-right" size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            {applications.length === 0 && (
                <div className="py-10 text-center bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/20 flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant/20 text-3xl">person_off</span>
                    <p className="text-on-surface font-black text-[10px] font-headline uppercase tracking-tight">No applicants yet</p>
                </div>
            )}
        </div>
    );
};

