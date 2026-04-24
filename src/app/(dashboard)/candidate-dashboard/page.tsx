'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axiosInstance from "@/lib/axiosInstance";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge, PremiumGlassCard } from "@/components/ui/premium/Common";
import { 
    BriefcaseIcon, 
    EyeIcon, 
    SparklesIcon, 
    ChartIcon, 
    SendIcon, 
    CalendarIcon, 
    XCircleIcon, 
    BookmarkIcon,
    GraduationIcon,
    SearchIcon,
    ArrowRightIcon,
    MoreIcon,
    TrendingUpIcon,
    ArrowDownIcon
} from "@/components/ui/premium/PremiumIcons";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import toast from "react-hot-toast";

const CandidateDashboard = () => {
    const router = useRouter();
    const { user: authUser } = useAppSelector((state) => state.auth);
    const [user, setUser] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [userRes, appRes, analyticRes] = await Promise.all([
                axiosInstance.get('/api/auth/profile'),
                axiosInstance.get('/api/applicant'),
                axiosInstance.get('/api/analytic/jobseeker')
            ]);
            
            if (userRes.data.success) setUser(userRes.data.data);
            if (appRes.data.success) setApplications(appRes.data.data || []);
            if (analyticRes.data.success) setAnalytics(analyticRes.data.data);
        } catch (err) {
            console.error("Data sync failed:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper for Skill Matching
    const calculateMatch = (jobSkills: string[]) => {
        if (!user?.skills || !jobSkills || jobSkills.length === 0) return 0;
        const userSkillNames = user.skills.map((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase());
        const matches = jobSkills.filter(s => userSkillNames.includes(s.toLowerCase()));
        return Math.round((matches.length / jobSkills.length) * 100);
    };

    const handleSaveJob = async (jobId: string) => {
        try {
            const res = await axiosInstance.patch(`/api/saved/${jobId}`);
            if (res.data.success) {
                toast.success(res.data.message || "Job status updated");
                fetchData(); // Refresh to get updated isSaved status
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update job status" + err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-on-surface/30 uppercase tracking-[0.3em]">Loading ...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { 
            title: 'Total Applications', 
            value: analytics?.applicationStats?.total || 0, 
            icon: <SendIcon className="h-5 w-5 text-emerald-500" />, 
            trend: '+12% vs last month',
            trendUp: true
        },
        { 
            title: 'Total Interviews', 
            value: analytics?.applicationStats?.byStatus?.['In Review'] || 0, 
            icon: <EyeIcon className="h-5 w-5 text-blue-500" />, 
            trend: '+18% vs last month',
            trendUp: true
        },
        { 
            title: 'Profile Views', 
            value: user?.aiScores?.overallScore || 63, 
            icon: <CalendarIcon className="h-5 w-5 text-orange-500" />, 
            trend: '+23% vs last month',
            trendUp: true
        },
        { 
            title: 'Rejected Applications', 
            value: analytics?.applicationStats?.byStatus?.Rejected || 0, 
            icon: <XCircleIcon className="h-5 w-5 text-rose-500" />, 
            trend: '-8% vs last month',
            trendUp: false
        },
    ];

    return (
        <ProtectedRoute allowedRoles={['jobseeker']}>
            <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-0">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-on-surface tracking-tight">
                            Welcome back, {user?.fullname?.split(' ')[0] || 'Visionary'}
                        </h1>
                        <p className="text-sm text-on-surface-variant font-medium">
                            Welcome back! Here&apos;s an overview of your dashboard activity.
                        </p>
                    </div>
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
                                <p className={`text-[10px] font-bold ${stat.trendUp ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                                    {stat.trend}
                                </p>
                            </div>
                        </PremiumGlassCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content: Latest Applications */}
                    <div className="lg:col-span-8 space-y-8">
                        <PremiumGlassCard variant="white" className="border border-outline-soft shadow-sm overflow-hidden">
                            <div className="p-6 flex justify-between items-center border-b border-outline-soft">
                                <h3 className="text-base font-black text-on-surface uppercase tracking-widest">Latest Applications</h3>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                                    <input 
                                        type="text" 
                                        placeholder="Search job" 
                                        className="pl-9 pr-4 py-2 bg-surface-variant/5 border border-outline-soft rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary outline-none w-48 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-outline-soft bg-surface-variant/2">
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Job Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Job Type</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Applied Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-soft">
                                        {(analytics?.recentApplications || []).map((app: any, idx: number) => (
                                            <tr key={idx} className="group hover:bg-surface-variant/2 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xs overflow-hidden relative">
                                                            {app.companyLogo ? (
                                                                <Image src={app.companyLogo} fill className="object-cover" alt={app.company} />
                                                            ) : (
                                                                app.company?.charAt(0) || 'J'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-on-surface">{app.jobTitle}</p>
                                                            <p className="text-[10px] font-bold text-on-surface-variant/60">{app.company}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase">Full Time</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-on-surface-variant">
                                                    {moment(app.appliedAt).format('DD MMM YYYY')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={app.status} />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link 
                                                        href={`/applications/${app.id}`}
                                                        className="p-2 hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/10 inline-flex items-center justify-center group/btn"
                                                    >
                                                        <MoreIcon className="w-4 h-4 text-on-surface-variant group-hover/btn:text-primary transition-colors" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!analytics?.recentApplications || analytics.recentApplications.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                                                    No recent applications found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </PremiumGlassCard>

                        {/* Recommended Jobs */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-black text-on-surface uppercase tracking-widest">Recommended Job</h3>
                                <Link href="/find-jobs" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                                    View All <ArrowRightIcon className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(analytics?.recommendedJobs || []).slice(0, 2).map((job: any, i: number) => {
                                    const matchScore = calculateMatch(job.skillsRequired);
                                    return (
                                        <PremiumGlassCard key={i} variant="white" className="p-4 border border-outline-soft hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/companies/${job.postedBy?._id || job.postedBy}`} className="w-12 h-12 rounded-xl bg-white border border-outline-soft flex items-center justify-center p-2 group-hover:border-primary/20 transition-all relative">
                                                        {job.postedBy?.companyLogo ? (
                                                            <Image src={job.postedBy.companyLogo} fill className="object-contain p-2" alt={job.postedBy.companyName || 'Logo'} />
                                                        ) : (
                                                            <BriefcaseIcon className="w-6 h-6 text-on-surface-variant/10" />
                                                        )}
                                                    </Link>
                                                    <div>
                                                        <h4 className="text-sm font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{job.title}</h4>
                                                        <Link href={`/companies/${job.postedBy?._id || job.postedBy}`} className="text-[10px] font-bold text-on-surface-variant/40 hover:text-primary transition-colors">{job.postedBy?.companyName || 'Global Entity'}</Link>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleSaveJob(job.id)}
                                                    className={`p-2 rounded-full transition-colors border border-transparent hover:border-outline-soft ${job.isSaved ? 'bg-primary/5 text-primary' : 'hover:bg-surface-variant text-on-surface-variant'}`}
                                                >
                                                    <BookmarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex justify-between items-center pt-4 border-t border-outline-soft">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">{matchScore}% Match</span>
                                                </div>
                                                <Link 
                                                    href={`/jobs/${job.id}`}
                                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                                >
                                                    Apply Now
                                                </Link>
                                            </div>
                                        </PremiumGlassCard>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Profile & Progress */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Profile Card */}
                        <PremiumGlassCard variant="white" className="p-6 border border-outline-soft shadow-sm relative overflow-hidden">
                            <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-surface-variant/5">
                                            {user?.profileImage ? (
                                                <Image 
                                                    src={user.profileImage} 
                                                    fill
                                                    className="object-cover" 
                                                    alt={user?.fullname || 'Profile'} 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-primary flex items-center justify-center">
                                                    <span className="text-2xl font-black text-white uppercase tracking-tighter">
                                                        {user?.fullname?.charAt(0) || 'A'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                <div>
                                    <h3 className="text-lg font-black text-on-surface tracking-tight">{user?.fullname || 'Molly Alexander'}</h3>
                                    <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">{user?.headline || user?.position || 'Sr. UI/UX Designer'}</p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Profile Completion</p>
                                    <p className="text-[10px] font-black text-emerald-500">
                                        {user?.aiScores?.completenessScore || 96}%
                                    </p>
                                </div>
                                <div className="h-2 w-full bg-emerald-500/10 rounded-full overflow-hidden border border-emerald-500/5">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                                        style={{ width: `${user?.aiScores?.completenessScore || 96}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-10 space-y-8">
                                {/* Work Experience */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <BriefcaseIcon className="w-3 h-3 text-blue-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-on-surface uppercase tracking-widest">Work Experience</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {user?.experience?.length > 0 ? user.experience.slice(0, 2).map((exp: any, i: number) => (
                                            <div key={i} className="pl-6 border-l border-outline-soft relative py-1">
                                                <div className="absolute -left-[4.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
                                                <h5 className="text-xs font-black text-on-surface leading-tight">{exp.role || exp.title}</h5>
                                                <p className="text-[10px] font-bold text-on-surface-variant/60">{exp.company} . {exp.isCurrent ? 'Present' : 'Completed'}</p>
                                            </div>
                                        )) : (
                                            <p className="text-[10px] font-bold text-on-surface-variant/30 italic uppercase tracking-widest">No experience listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                                            <GraduationIcon className="w-3 h-3 text-orange-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-on-surface uppercase tracking-widest">Education</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {user?.education?.length > 0 ? user.education.slice(0, 2).map((edu: any, i: number) => (
                                            <div key={i} className="pl-6 border-l border-outline-soft relative py-1">
                                                <div className="absolute -left-[4.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
                                                <h5 className="text-xs font-black text-on-surface leading-tight">{edu.degree}</h5>
                                                <p className="text-[10px] font-bold text-on-surface-variant/60">{edu.institution}</p>
                                                <p className="text-[9px] font-medium text-on-surface-variant/40">{edu.startYear || 'N/A'} - {edu.endYear || 'N/A'}</p>
                                            </div>
                                        )) : (
                                            <p className="text-[10px] font-bold text-on-surface-variant/30 italic uppercase tracking-widest">No education listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                                            <ChartIcon className="w-3 h-3 text-purple-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-on-surface uppercase tracking-widest">Skills Nodes</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(user?.skills || []).map((skill: any, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-surface-variant/5 border border-outline-soft rounded-lg text-[9px] font-black text-on-surface-variant uppercase tracking-tighter">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PremiumGlassCard>

                        {/* Application Progress */}
                        <PremiumGlassCard variant="white" className="p-6 border border-outline-soft shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest">Neural Progress</h3>
                                <div className="relative group/select">
                                    <select className="appearance-none pl-3 pr-8 py-1.5 text-[9px] font-black bg-surface-variant/5 border border-outline-soft rounded-lg outline-none text-on-surface-variant/60 cursor-pointer hover:border-primary/30 transition-colors">
                                        <option>Last 30 Days</option>
                                        <option>Last 6 Months</option>
                                        <option>All Time</option>
                                    </select>
                                    <ArrowDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant/40 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-bold text-on-surface">Mission Flux</p>
                                    <p className="text-[10px] font-black text-primary">{applications.length} <span className="text-on-surface-variant/40">(Current)</span></p>
                                </div>
                                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/5">
                                    <div className="h-full bg-primary w-[70%] rounded-full shadow-[0_0_10px_rgba(69,105,224,0.4)]" />
                                </div>
                            </div>
                        </PremiumGlassCard>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const tones: any = {
        'Applied': 'bg-blue-50 text-blue-600 border-blue-100',
        'In Review': 'bg-amber-50 text-amber-600 border-amber-100',
        'Interview': 'bg-purple-50 text-purple-600 border-purple-100',
        'Shortlisted': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Job Offered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Accepted': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Rejected': 'bg-rose-50 text-rose-600 border-rose-100',
        'Reject': 'bg-rose-50 text-rose-600 border-rose-100',
    };

    const tone = tones[status] || 'bg-surface-variant/10 text-on-surface-variant/60 border-outline-soft';

    return (
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${tone}`}>
            <div className="w-1 h-1 rounded-full bg-current" />
            {status}
        </div>
    );
};

export default CandidateDashboard;



