import { motion } from "framer-motion";
import Image from "next/image";
import moment from "moment";
import CustomIcon from "@/components/ui/CustomIcon";

interface Job {
    _id: string;
    title: string;
    location: string;
    type: string;
    createdAt: string;
    isClosed: boolean;
    companyLogo?: string;
}

interface JobsListProps {
    jobs: Job[];
    onJobClick: (id: string) => void;
    isExpanded?: boolean;
}

export const JobsList = ({ jobs, onJobClick, isExpanded = false }: JobsListProps) => {
    return (
        <div className="flex flex-col gap-3">
            {jobs.slice(0, 2).map((job, i) => (
                <motion.div
                    key={job._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onJobClick(job._id)}
                    className="group bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl p-4 transition-all cursor-pointer border border-outline-variant/10 hover:border-primary/50 flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-outline-variant/10 group-hover:scale-105 transition-transform">
                            {job.companyLogo ? (
                                <Image src={job.companyLogo} alt="Logo" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                            ) : (
                                <CustomIcon name="briefcase" size={18} className="text-primary" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-on-surface truncate font-headline group-hover:text-primary transition-colors uppercase tracking-tight">{job.title}</h4>
                                <span className={`px-2 py-0.5 rounded-md text-[7px] font-black tracking-widest ${job.isClosed
                                    ? 'bg-error/10 text-error'
                                    : 'bg-emerald-500/10 text-emerald-600'
                                }`}>
                                    {job.isClosed ? 'Closed' : 'Active'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none">
                                    <CustomIcon name="location" size={10} className="mr-1 opacity-40 text-primary" />
                                    {job.location}
                                </div>
                                <div className="flex items-center text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none">
                                    <CustomIcon name="clock" size={10} className="mr-1 opacity-40 text-primary" />
                                    {moment(job.createdAt).fromNow()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 px-2 border-l border-outline-variant/10 ml-4">
                         <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-[8px] font-black tracking-widest rounded-lg border border-primary/5">
                            <CustomIcon name="magic-star" size={10} />
                            Neural
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-surface-container-low group-hover:bg-primary group-hover:text-on-primary transition-all flex items-center justify-center border border-outline-variant/10 shadow-sm">
                            <CustomIcon name="arrow-right-1" size={20} />
                        </div>
                    </div>
                </motion.div>
            ))}

            {jobs.length > 2 && (
                <button 
                    onClick={() => window.location.href = '/manage-jobs'}
                    className="w-full py-4 bg-white/50 hover:bg-white text-on-surface-variant/40 hover:text-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-dashed border-outline-variant/20 hover:border-primary/20 flex items-center justify-center gap-3 group"
                >
                    <span>Tout voir les managed nodes</span>
                    <CustomIcon name="arrow-right" size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            {jobs.length === 0 && (
                <div className={`col-span-full text-center bg-white rounded-[40px] border border-dashed border-outline-variant/20 flex flex-col items-center justify-center gap-8 ${isExpanded ? 'flex-1 min-h-[300px]' : 'py-24'}`}>
                    <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center shadow-inner relative group border border-outline-variant/10">
                        <CustomIcon name="briefcase" size={32} className="text-on-surface-variant/10" />
                    </div>
                    <p className="text-on-surface-variant/40 text-[9px] font-black uppercase tracking-[0.2em]">Node matrix idle</p>
                </div>
            )}
        </div>
    );
};

