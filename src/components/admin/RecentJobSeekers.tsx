'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import CustomIcon from '@/components/ui/CustomIcon';

interface RecentJobSeekersProps {
    jobSeekers: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
        avatar?: string;
    }[];
}

export const RecentJobSeekers = ({ jobSeekers }: RecentJobSeekersProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-500/5 p-10 md:p-12 rounded-4xl border border-emerald-500/10 flex flex-col h-full group border-l-4 border-l-emerald-500"
        >
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-on-surface tracking-tighter uppercase font-headline">New Talent</h3>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] font-headline">Candidate Ingress</p>
                </div>
                <Link href="/admin/jobseekers" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-on-surface-variant/40 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all border border-outline-variant/10 shadow-sm">
                    <CustomIcon name="arrow-right-1" size={20} className="text-emerald-500" />
                </Link>
            </div>

            <div className="space-y-6 flex-1">
                {jobSeekers.length > 0 ? (
                    jobSeekers.map((seeker) => (
                        <div key={seeker.id} className="flex items-center gap-6 p-6 rounded-4xl bg-white border border-outline-variant/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group/item cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
                            <div className="h-16 w-16 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-500 overflow-hidden border border-emerald-500/10 group-hover/item:scale-105 transition-transform duration-500 shadow-inner">
                                {seeker.avatar ? (
                                    <Image src={seeker.avatar} alt={seeker.name} width={64} height={64} unoptimized className="h-full w-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" />
                                ) : (
                                    <CustomIcon name="user-tag" size={32} className="text-emerald-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <p className="font-black text-on-surface truncate uppercase tracking-tight text-lg font-headline">{seeker.name}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">Active Sync</span>
                                    <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em]">{new Date(seeker.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <CustomIcon name="profile-2user" size={64} className="text-emerald-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] font-headline text-center">No Signals Detected</p>
                    </div>
                )}
            </div>

            <Link href="/admin/jobseekers">
                <button className="w-full mt-10 py-6 bg-emerald-500 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group/btn shadow-xl shadow-emerald-500/20">
                    Talent Ecosystem
                    <CustomIcon name="mask" size={20} className="group-hover/btn:scale-125 transition-transform text-white" />
                </button>
            </Link>
        </motion.div>
    );
};
