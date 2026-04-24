'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PremiumGlassCard } from "@/components/ui/premium/Common";
import {
    BriefcaseIcon,
    UsersIcon,
    SparklesIcon,
    TrendingUpIcon,
    ArrowRightIcon,
    SearchIcon,
    MoreIcon,
} from "@/components/ui/premium/PremiumIcons";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import {
    PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import Link from "next/link";
import moment from "moment";

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const tones: any = {
        'Applied':      'bg-blue-50 text-blue-600 border-blue-100',
        'In Review':    'bg-amber-50 text-amber-600 border-amber-100',
        'Interviewing': 'bg-purple-50 text-purple-600 border-purple-100',
        'Shortlisted':  'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Screening':    'bg-sky-50 text-sky-600 border-sky-100',
        'Job Offer':    'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Accepted':     'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Rejected':     'bg-rose-50 text-rose-600 border-rose-100',
    };
    const tone = tones[status] || 'bg-surface-variant/10 text-on-surface-variant/60 border-outline-soft';
    return (
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${tone}`}>
            <div className="w-1 h-1 rounded-full bg-current" />
            {status}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployerDashboardPage = () => {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/analytic/employer');
            if (response.data.success) setDashboardData(response.data.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['admin', 'employer']}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-on-surface/30 uppercase tracking-[0.3em]">Loading...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // ── Derived Data ──────────────────────────────────────────────────────────
    const activeJobs       = dashboardData?.jobStats?.opened || 0;
    const totalApplicants  = dashboardData?.jobStats?.total_applicants || 0;
    const interviews       = dashboardData?.jobStats?.interviews || 0;
    const matchRate        = dashboardData?.matchPercentage || 0;

    const stats = [
        { title: 'Active Jobs',       value: activeJobs,      icon: <BriefcaseIcon className="h-5 w-5 text-primary" />,     trendUp: true,  trend: 'Open positions' },
        { title: 'Total Applicants',  value: totalApplicants, icon: <UsersIcon className="h-5 w-5 text-blue-500" />,        trendUp: true,  trend: 'Across all jobs' },
        { title: 'Pending Interviews',value: interviews,      icon: <SparklesIcon className="h-5 w-5 text-amber-500" />,    trendUp: true,  trend: 'Awaiting confirmation' },
        { title: 'Match Rate',        value: `${matchRate}%`, icon: <TrendingUpIcon className="h-5 w-5 text-emerald-500" />, trendUp: true, trend: 'Avg acceptance rate' },
    ];

    const weeklyFlux = dashboardData?.weeklyFlux || [
        { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 },
    ];

    const pipelineData = [
        { name: 'Applied',    value: dashboardData?.pipelineDistribution?.Applied || 0,      color: '#4569e0' },
        { name: 'In Review',  value: dashboardData?.pipelineDistribution?.['In Review'] || 0, color: '#f59e0b' },
        { name: 'Accepted',   value: dashboardData?.pipelineDistribution?.Accepted || 0,      color: '#77dd77' },
        { name: 'Rejected',   value: dashboardData?.pipelineDistribution?.Rejected || 0,      color: '#ff4d4d' },
    ];

    const recentApplications: any[] = (dashboardData?.recentApplications || []).map((app: any) => ({
        id:     app._id,
        name:   app.applicantName,
        email:  app.applicantEmail || '',
        avatar: app.applicantImage || null,
        resume: app.applicantResume || null,
        role:   app.jobTitle,
        date:   app.appliedAt,
        status: app.status || 'Applied',
    }));

    const recentJobs: any[] = (dashboardData?.recentJobs || []).map((job: any, i: number) => ({
        id:         job._id,
        title:      job.title,
        type:       job.type || 'Full-time',
        location:   job.location || 'Remote',
        salary:     (job.salaryMin && job.salaryMax) ? `$${job.salaryMin}K–$${job.salaryMax}K` : 'Competitive',
        applicants: job.applicantsCount || 0,
        isClosed:   job.isClosed,
        bg: ['bg-primary/10', 'bg-emerald-500/10', 'bg-purple-500/10', 'bg-amber-500/10'][i % 4],
        text: ['text-primary', 'text-emerald-600', 'text-purple-600', 'text-amber-600'][i % 4],
    }));

    const highAffinityMatches: any[] = dashboardData?.highAffinityMatches || [];

    // ── Tab filter ────────────────────────────────────────────────────────────
    const tabs = ['All', 'Applied', 'In Review', 'Accepted', 'Rejected'];
    const filteredApplicants = recentApplications
        .filter(app => activeTab === 'All' || app.status === activeTab)
        .filter(app =>
            search.trim() === '' ||
            app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.role.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <ProtectedRoute allowedRoles={['admin', 'employer']}>
            <div className="space-y-8 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-on-surface tracking-tight">
                            Welcome back, {user?.fullname?.split(' ')[0] || 'Recruiter'} 👋
                        </h1>
                        <p className="text-sm text-on-surface-variant font-medium">
                            Here&apos;s an overview of your hiring pipeline.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/post-job')}
                        className="flex items-center gap-2 px-6 h-11 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-dim transition-colors"
                    >
                        + Post New Job
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <PremiumGlassCard key={i} variant="white" className="p-6 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border border-outline-soft">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-xl bg-surface-variant/5 border border-outline-soft flex items-center justify-center">
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <TrendingUpIcon className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <h4 className="text-3xl font-black text-on-surface tracking-tighter">{stat.value}</h4>
                                <p className="text-xs font-bold text-on-surface-variant/60">{stat.title}</p>
                                <p className="text-[10px] font-bold text-emerald-500/80">{stat.trend}</p>
                            </div>
                        </PremiumGlassCard>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Applicants Table */}
                        <PremiumGlassCard variant="white" className="border border-outline-soft shadow-sm overflow-hidden">
                            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-soft">
                                <h3 className="text-base font-black text-on-surface uppercase tracking-widest">
                                    Recent Applicants
                                </h3>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or role"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-surface-variant/5 border border-outline-soft rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary outline-none w-52 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="px-6 pt-4 flex gap-2 overflow-x-auto scrollbar-hide border-b border-outline-soft pb-4">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                            activeTab === tab
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'text-on-surface-variant bg-surface-variant/5 border-outline-soft hover:border-primary/20'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-outline-soft bg-surface-variant/2">
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Candidate</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Role</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Applied</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Resume</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-soft">
                                        {filteredApplicants.map((app, idx) => (
                                            <tr key={idx} className="group hover:bg-surface-variant/2 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xs overflow-hidden relative shrink-0">
                                                            {app.avatar ? (
                                                                <Image src={app.avatar} alt={app.name} width={40} height={40} unoptimized className="object-cover w-full h-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                            ) : (
                                                                app.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-on-surface">{app.name}</p>
                                                            <p className="text-[10px] font-bold text-on-surface-variant/60">{app.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-on-surface-variant">{app.role}</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-on-surface-variant">
                                                    {moment(app.date).format('DD MMM YYYY')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.resume ? (
                                                        <a
                                                            href={app.resume}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
                                                        >
                                                            View CV
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-on-surface-variant/30 uppercase">No CV</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={app.status} />
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredApplicants.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                                                    No applicants found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </PremiumGlassCard>

                        {/* Active Vacancies */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-black text-on-surface uppercase tracking-widest">Active Vacancies</h3>
                                <Link href="/manage-jobs" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                                    View All <ArrowRightIcon className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentJobs.slice(0, 4).map((job, i) => (
                                    <PremiumGlassCard key={i} variant="white" className="p-5 border border-outline-soft hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${job.bg}`}>
                                                <BriefcaseIcon className={`w-5 h-5 ${job.text}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-on-surface group-hover:text-primary transition-colors truncate">{job.title}</h4>
                                                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase mt-0.5">{job.type} · {job.location}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${job.isClosed ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {job.isClosed ? 'Closed' : 'Open'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-outline-soft">
                                            <div className="flex items-center gap-1.5">
                                                <UsersIcon className="w-3.5 h-3.5 text-on-surface-variant/40" />
                                                <span className="text-[10px] font-black text-on-surface-variant uppercase">{job.applicants} Applicants</span>
                                            </div>
                                            <Link
                                                href={`/manage-jobs/${job.id}/applicants`}
                                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                            >
                                                Review →
                                            </Link>
                                        </div>
                                    </PremiumGlassCard>
                                ))}
                                {recentJobs.length === 0 && (
                                    <div className="col-span-2 text-center py-10 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                                        No active jobs. Post your first position!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Pipeline Donut */}
                        <PremiumGlassCard variant="white" className="p-6 border border-outline-soft shadow-sm">
                            <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest mb-6">Pipeline Overview</h3>
                            <div className="relative h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                                            {pipelineData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-on-surface leading-none">{totalApplicants}</span>
                                    <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase mt-1">Total</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                {pipelineData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-bold text-on-surface-variant/60">{item.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-on-surface">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </PremiumGlassCard>

                        {/* Weekly Flow Chart */}
                        <PremiumGlassCard variant="white" className="p-6 border border-outline-soft shadow-sm">
                            <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest mb-6">Weekly Applications</h3>
                            <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyFlux}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4569e0" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#4569e0" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 9, fontWeight: 700 }} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="value" stroke="#4569e0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </PremiumGlassCard>

                        {/* High Affinity Matches */}
                        <PremiumGlassCard variant="white" className="p-6 border border-outline-soft shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest">Top Matches</h3>
                                <Link href="/applications" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {highAffinityMatches.map((match: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden flex items-center justify-center shrink-0 bg-primary/5 text-primary font-black text-xs uppercase">
                                            {match.avatar ? (
                                                <Image src={match.avatar} width={40} height={40} alt={match.name} className="object-cover" />
                                            ) : (
                                                match.name?.charAt(0) || 'M'
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-black text-on-surface truncate">{match.name}</p>
                                            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase truncate">{match.jobTitle}</p>
                                        </div>
                                        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase">
                                            {match.score}%
                                        </div>
                                    </div>
                                ))}
                                {highAffinityMatches.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">No high-affinity matches yet</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => router.push('/applications')}
                                className="w-full mt-6 h-11 border border-outline-soft rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-primary hover:text-white hover:border-primary transition-all"
                            >
                                Review Pipeline
                            </button>
                        </PremiumGlassCard>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default EmployerDashboardPage;
