'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";
import { PremiumStatCard } from "@/components/ui/premium/PremiumStatCard";
import { AppleButton, Badge, PremiumGlassCard } from "@/components/ui/premium/Common";
import { BriefcaseIcon, EyeIcon, SparklesIcon, ChartIcon, MoreIcon } from "@/components/ui/premium/PremiumIcons";

const StatusBadge = ({ status }: { status: string }) => {
    const tones: any = {
        'Applied': 'bg-blue-50 text-blue-600 border-blue-100',
        'In Review': 'bg-amber-50 text-amber-600 border-amber-100',
        'Interview': 'bg-purple-50 text-purple-600 border-purple-100',
        'Shortlisted': 'bg-purple-50 text-purple-600 border-purple-100',
        'Job Offered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Accepted': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Rejected': 'bg-rose-50 text-rose-600 border-rose-100',
        'Reject': 'bg-rose-50 text-rose-600 border-rose-100',
    };

    const tone = tones[status] || 'bg-surface-variant/10 text-on-surface-variant/60 border-outline-soft';

    return (
        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${tone}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
        </div>
    );
};

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: "all",
        sort: "newest"
    });
    const [showFilters, setShowFilters] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [, setTick] = useState(0);
    const router = useRouter();

    const statusConfig: any = {
        'Applied': {
            bg: 'bg-primary/5',
            text: 'text-primary',
            border: 'border-primary/10',
            icon: 'send-2',
            label: 'Sent'
        },
        'In Review': {
            bg: 'bg-amber-500/5',
            text: 'text-amber-600',
            border: 'border-amber-500/10',
            icon: 'eye',
            label: 'Review'
        },
        'Shortlisted': {
            bg: 'bg-purple-500/5',
            text: 'text-purple-600',
            border: 'border-purple-500/10',
            icon: 'magicpen',
            label: 'Elite'
        },
        'Accepted': {
            bg: 'bg-emerald-500/5',
            text: 'text-emerald-600',
            border: 'border-emerald-500/10',
            icon: 'tick-circle',
            label: 'Approved'
        },
        'Rejected': {
            bg: 'bg-error/5',
            text: 'text-error',
            border: 'border-error/10',
            icon: 'close-circle',
            label: 'Terminated'
        }
    };

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/api/applicant');
            if (response.data.success) {
                setApplications(response.data.data || []);
                setLastUpdated(new Date());
            }
        } catch (err: any) {
            console.error("Error fetching applications:", err);
            setError("Synchronization failed.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Force re-render every 60s to update "fromNow" timestamps
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredApplications = applications.filter(app => {
        if (filters.status === "all") return true;
        return app.status === filters.status;
    }).sort((a, b) => {
        const dateA = moment(a.createdAt).valueOf();
        const dateB = moment(b.createdAt).valueOf();
        return filters.sort === "newest" ? dateB - dateA : dateA - dateB;
    });

    const stats = {
        total: applications.length,
        inReview: applications.filter(app => app.status === 'In Review').length,
        accepted: applications.filter(app => app.status === 'Accepted').length,
        pending: applications.filter(app => ['Applied', 'In Review', 'Shortlisted'].includes(app.status)).length,
    };

    return (
        <ProtectedRoute allowedRoles={['jobseeker']}>
            
                <div className="space-y-6 pb-20">
                    {/* Compact Page Header */}
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-on-surface tracking-tighter">
                                My Applications
                            </h1>
                            <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em]">
                                Tracking {applications.length} active deployments
                            </p>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2.5 px-5 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${showFilters 
                                ? 'bg-on-surface text-white border-on-surface' 
                                : 'bg-white text-on-surface border-outline-ghost/30 hover:border-primary/30'}`}
                        >
                            <CustomIcon name="setting-4" size={16} />
                            Protocol
                            <CustomIcon name="arrow-down-1" size={12} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Compact Stat Bar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <PremiumStatCard
                            title="Total Missions"
                            value={stats.total}
                            delta={`Synced ${moment(lastUpdated).fromNow()}`}
                            tone="primary"
                            icon={<BriefcaseIcon className="h-4 w-4" />}
                        />
                        <PremiumStatCard
                            title="In Review"
                            value={stats.inReview}
                            delta={`Last scan ${moment(lastUpdated).fromNow()}`}
                            tone="warning"
                            icon={<EyeIcon className="h-4 w-4" />}
                        />
                        <PremiumStatCard
                            title="Approved"
                            value={stats.accepted}
                            delta="Mission finalized"
                            tone="success"
                            icon={<SparklesIcon className="h-4 w-4" />}
                        />
                        <PremiumStatCard
                            title="Active Pulse"
                            value={stats.pending}
                            delta="Processing status"
                            tone="primary"
                            icon={<ChartIcon className="h-4 w-4" />}
                        />
                    </div>

                    {/* Dense Filters Section */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-surface-soft/50 p-6 rounded-2xl border border-outline-ghost/30"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Status Protocol</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-outline-ghost/30 bg-white font-bold text-[11px] uppercase tracking-wider text-on-surface outline-none focus:border-primary/30 transition-all cursor-pointer h-11"
                                        >
                                            <option value="all">All Tactical Statuses</option>
                                            {Object.keys(statusConfig).map(status => (
                                                <option key={status} value={status}>{statusConfig[status].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Temporal Sort</label>
                                        <select
                                            value={filters.sort}
                                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-outline-ghost/30 bg-white font-bold text-[11px] uppercase tracking-wider text-on-surface outline-none focus:border-primary/30 transition-all cursor-pointer h-11"
                                        >
                                            <option value="newest">Recent Chronology</option>
                                            <option value="oldest">Legacy Chronology</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dense Application Feed */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4 bg-surface-soft/20 rounded-3xl border border-outline-ghost/10">
                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30">Synchronizing Intel...</p>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="p-16 bg-surface-soft/10 rounded-3xl border border-outline-ghost/10 text-center space-y-4">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto border border-outline-ghost/10 shadow-sm">
                                    <CustomIcon name="radar-2" size={32} className="text-on-surface-variant/10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-on-surface tracking-tighter">EMPTY SIGNAL</h3>
                                    <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-[9px]">No active deployments detected in this sector.</p>
                                </div>
                                <button 
                                    onClick={() => router.push('/find-jobs')}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow hover:scale-105 transition-all"
                                >
                                    Launch Mission Discovery
                                </button>
                            </div>
                        ) : (
                            <PremiumGlassCard variant="white" className="border border-outline-soft shadow-sm overflow-hidden mt-6">
                                <div className="p-6 flex justify-between items-center border-b border-outline-soft bg-surface-variant/5">
                                    <h3 className="text-base font-black text-on-surface uppercase tracking-widest">Active Applications</h3>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{filteredApplications.length} Nodes</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-outline-soft bg-white">
                                                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Mission Name</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Location</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Applied Date</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-soft bg-white">
                                            {filteredApplications.map((app, i) => {
                                                const job = app.job;
                                                const company = job?.company || (typeof job?.postedBy === 'object' ? job.postedBy : null);
                                                const companyLogo = company?.logo || company?.companyLogo;
                                                const companyName = company?.name || company?.companyName || 'Strategic Entity';

                                                return (
                                                    <tr key={app._id} className="group hover:bg-surface-variant/5 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-surface-variant/10 border border-outline-soft flex items-center justify-center text-on-surface-variant font-black text-sm overflow-hidden relative shadow-sm group-hover:border-primary/20 transition-colors">
                                                                    {companyLogo ? (
                                                                        <Image src={companyLogo} fill className="object-cover" alt={companyName} />
                                                                    ) : (
                                                                        <span className="uppercase text-lg">{companyName.charAt(0)}</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{job?.title || 'Unknown Mission'}</p>
                                                                    <p className="text-[11px] font-bold text-on-surface-variant/60">{companyName}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-[11px] font-bold text-on-surface-variant uppercase whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <CustomIcon name="location" size={14} className="text-on-surface-variant/50" />
                                                                {job?.location || 'Remote'}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-[11px] font-bold text-on-surface-variant whitespace-nowrap">
                                                            {moment(app.appliedAt || app.createdAt).format('DD MMM YYYY')}
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <StatusBadge status={app.status} />
                                                        </td>
                                                        <td className="px-8 py-5 text-center">
                                                            <Link 
                                                                href={`/applications/${app._id}`}
                                                                className="px-4 py-2 bg-white hover:bg-primary/5 rounded-lg transition-all border border-outline-soft hover:border-primary/20 inline-flex items-center justify-center group/btn gap-2 text-[10px] font-black text-on-surface hover:text-primary uppercase tracking-widest shadow-sm"
                                                            >
                                                                <span>Specs</span>
                                                                <MoreIcon className="w-4 h-4 text-on-surface-variant group-hover/btn:text-primary transition-colors" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </PremiumGlassCard>
                        )}
                    </div>
                </div>
            
        </ProtectedRoute>
    );
};

export default MyApplicationsPage;

