'use client';

import {
    X, Briefcase, MapPin, DollarSign,
    Check, Calendar, Sparkles, User, Edit2, Trash2, Power, Clock, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import moment from 'moment';

interface AdminJobDetailsProps {
    job: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleStatus: () => void;
}

export const AdminJobDetails = ({ job, isOpen, onClose, onEdit, onDelete, onToggleStatus }: AdminJobDetailsProps) => {
    if (!job) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200]"
                    />
                    
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[210] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-surface-soft flex items-center justify-center border border-outline-variant/10 shadow-sm overflow-hidden">
                                    {job.postedBy?.companyLogo ? (
                                        <Image src={job.postedBy.companyLogo} alt="" width={48} height={48} unoptimized className="h-full w-full object-contain" />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-text-faint/30" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none">{job.title}</h2>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5">{job.postedBy?.companyName || 'Private Organization'}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-surface-soft rounded-xl transition-colors">
                                <X className="h-5 w-5 text-on-surface-variant/40" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 custom-scrollbar">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-on-surface-variant/40">
                                        <MapPin className="h-3 w-3" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Location</p>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface">{job.location || 'Remote'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-on-surface-variant/40">
                                        <Clock className="h-3 w-3" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Type</p>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface uppercase">{job.type}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-on-surface-variant/40">
                                        <DollarSign className="h-3 w-3" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Compensation</p>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface">
                                        {job.salaryMin ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax?.toLocaleString()}` : 'Competitive'}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-on-surface-variant/40">
                                        <Calendar className="h-3 w-3" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Posted</p>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface">{moment(job.createdAt).format('LL')}</p>
                                </div>
                            </div>

                            <div className="h-px bg-outline-variant/10 w-full" />

                            {/* Detailed Content */}
                            <div className="space-y-10">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Overview
                                    </h3>
                                    <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Requirements
                                    </h3>
                                    <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements }} />
                                </section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-outline-variant/10 bg-surface-soft/30 flex items-center gap-4">
                            <button 
                                onClick={onEdit}
                                className="flex-1 h-14 bg-on-surface text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3"
                            >
                                <Edit2 className="h-4 w-4" /> Edit Parameters
                            </button>
                            <div className="flex gap-2">
                                <button 
                                    onClick={onToggleStatus}
                                    className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center ${job.isClosed ? 'border-emerald-500/20 text-emerald-600 bg-white' : 'border-error/20 text-error bg-white'}`}
                                >
                                    <Power className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={onDelete}
                                    className="w-14 h-14 rounded-2xl border border-error/20 text-error bg-white hover:bg-error hover:text-white transition-all flex items-center justify-center"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
