'use client';

import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAppSelector } from "@/store/hooks";
import { 
    UsersIcon, 
    BriefcaseIcon, 
    SparklesIcon, 
    ChartIcon,
    VerifyIcon,
    RefreshIcon
} from "@/components/ui/premium/PremiumIcons";
import { ApplicationsChart } from "@/components/admin/ApplicationsChart";
import { AdminJobsStatus } from "@/components/admin/AdminJobsStatus";
import { MarketSkillDemand } from "@/components/admin/MarketSkillDemand";
import Link from "next/link";
import moment from "moment";

const AdminDashboardPage = () => {
    useAppSelector((state) => state.auth);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/analytic/administrator');
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading || !dashboardData) {
        return (
            <ProtectedRoute allowedRoles={['admin']}>
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Loading Dashboard...</p>
                </div>
            </ProtectedRoute>
        );
    }

    const kpis = [
        { title: 'Total Talent', value: dashboardData.jobseekers, icon: <UsersIcon className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50', border: 'border-indigo-100', trend: '+12% this month' },
        { title: 'Active Employers', value: dashboardData.employers, icon: <BriefcaseIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-100', trend: '+5% this month' },
        { title: 'Open Jobs', value: dashboardData.jobOpened, icon: <ChartIcon className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Live positions' },
        { title: 'Closed Jobs', value: dashboardData.jobClosed, icon: <VerifyIcon className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-50', border: 'border-gray-200', trend: 'Successfully filled' },
        { title: 'Total Applications', value: dashboardData.applications?.total || 0, icon: <RefreshIcon className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50', border: 'border-orange-100', trend: 'Across all jobs' },
        { title: 'AI Screenings', value: dashboardData.aiMetrics?.aiScreeningAppsCount || 0, icon: <SparklesIcon className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-100', trend: 'Automated processing' }
    ];

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor recruitment operations, user acquisition, and overall platform health.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-md border border-emerald-100">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">System Online</span>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{kpi.title}</p>
                                    <h4 className="text-3xl font-bold text-gray-900">{kpi.value}</h4>
                                </div>
                                <div className={`p-2.5 rounded-lg ${kpi.bg} ${kpi.border} border`}>
                                    {kpi.icon}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
                                <span>{kpi.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-900">Application Pipeline</h3>
                            <p className="text-xs text-gray-500 mt-1">Current status distribution of all applications across the platform</p>
                        </div>
                        <div className="h-[300px]">
                            <ApplicationsChart
                                statuses={dashboardData.applications?.statuses || []}
                                total={dashboardData.applications?.total || 0}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-900">Job Fulfillment</h3>
                            <p className="text-xs text-gray-500 mt-1">Ratio of open versus closed positions</p>
                        </div>
                        <div className="h-[300px]">
                            <AdminJobsStatus
                                opened={dashboardData.jobOpened || 0}
                                closed={dashboardData.jobClosed || 0}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-gray-900">Top Market Skills</h3>
                            <p className="text-xs text-gray-500 mt-1">Most requested skills in job postings</p>
                        </div>
                        <div className="h-[300px] overflow-hidden">
                            <MarketSkillDemand topSkills={dashboardData.aiMetrics?.topSkills || []} />
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Recent Candidates */}
                        <div className="bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                                <h3 className="text-sm font-bold text-gray-900">Recent Candidates</h3>
                                <Link href="/admin/jobseekers" className="text-xs font-semibold text-primary hover:text-primary/80">
                                    View All
                                </Link>
                            </div>
                            <div className="p-0 flex-1 divide-y divide-gray-100">
                                {dashboardData.recentJobSeekers?.slice(0, 5).map((s: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold border border-indigo-200">
                                            {s.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{s.email || 'No email provided'}</p>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {moment(s.createdAt).fromNow(true)}
                                        </div>
                                    </div>
                                ))}
                                {!dashboardData.recentJobSeekers?.length && (
                                    <div className="p-8 text-center text-sm text-gray-500">No recent candidates</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Employers */}
                        <div className="bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                                <h3 className="text-sm font-bold text-gray-900">Recent Employers</h3>
                                <Link href="/admin/employers" className="text-xs font-semibold text-primary hover:text-primary/80">
                                    View All
                                </Link>
                            </div>
                            <div className="p-0 flex-1 divide-y divide-gray-100">
                                {dashboardData.recentEmployers?.slice(0, 5).map((e: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold border border-blue-200">
                                            {e.name?.charAt(0) || 'E'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{e.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{e.email || 'No email provided'}</p>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {moment(e.createdAt).fromNow(true)}
                                        </div>
                                    </div>
                                ))}
                                {!dashboardData.recentEmployers?.length && (
                                    <div className="p-8 text-center text-sm text-gray-500">No recent employers</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminDashboardPage;
