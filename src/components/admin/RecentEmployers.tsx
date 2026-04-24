'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import CustomIcon from '@/components/ui/CustomIcon';

interface RecentEmployersProps {
    employers: {
        _id: string;
        fullname: string;
        email: string;
        createdAt: string;
        profileImage?: string;
    }[];
}

export const RecentEmployers = ({ employers }: RecentEmployersProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 p-10 md:p-12 rounded-4xl border border-primary/10 flex flex-col h-full group border-l-4 border-l-primary"
        >
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-on-surface tracking-tighter uppercase font-headline">New Entities</h3>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] font-headline">Corporate Ingress</p>
                </div>
                <Link href="/admin/employers" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/5 transition-all border border-outline-variant/10 shadow-sm">
                    <CustomIcon name="arrow-right-1" size={20} className="text-primary" />
                </Link>
            </div>

            <div className="space-y-6 flex-1">
                {employers.length > 0 ? (
                    employers.map((employer) => (
                        <div key={employer._id} className="flex items-center gap-6 p-6 rounded-4xl bg-white border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all group/item cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5">
                            <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary overflow-hidden border border-primary/10 group-hover/item:scale-105 transition-transform duration-500 shadow-inner">
                                {employer.profileImage ? (
                                    <Image src={employer.profileImage} alt={employer.fullname} width={64} height={64} unoptimized className="h-full w-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" />
                                ) : (
                                    <CustomIcon name="building" size={32} className="text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <p className="font-black text-on-surface truncate uppercase tracking-tight text-lg font-headline">{employer.fullname}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">Verified Node</span>
                                    <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em]">{new Date(employer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <CustomIcon name="monitor-mobbile" size={64} className="text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] font-headline text-center">Zero Signal Detected</p>
                    </div>
                )}
            </div>

            <Link href="/admin/employers">
                <button className="w-full mt-10 py-6 bg-primary text-on-primary rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group/btn shadow-xl shadow-primary/20">
                    Global Registry
                    <CustomIcon name="cpu-setting" size={20} className="group-hover/btn:rotate-180 transition-transform duration-700 text-on-primary" />
                </button>
            </Link>
        </motion.div>
    );
};
