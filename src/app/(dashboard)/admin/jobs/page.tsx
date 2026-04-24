'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminJobForm } from '@/components/admin/AdminJobForm';
import { AdminJobDetails } from '@/components/admin/AdminJobDetails';
import Image from 'next/image';
import moment from 'moment';

import { 
    PlusIcon, 
    SearchIcon, 
    BriefcaseIcon, 
    TrendingUpIcon, 
    XCircleIcon, 
    ChevronDownIcon as ArrowDownIcon,
    MapPin,
    Edit3Icon as EditIcon,
    Trash2Icon as TrashIcon,
    AlertTriangle
} from 'lucide-react';

import { AppleButton } from '@/components/ui/premium/Common';

const AdminJobsPage = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, opened: 0, closed: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [currentJob, setCurrentJob] = useState<any>(null);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [localLoading, setLocalLoading] = useState(false);
    
    // Deletion Modal State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<any>(null);

    const fetchJobs = useCallback(async (page: number, limit: number) => {
        try {
            if (page === 1) setLocalLoading(true);
            const response = await axiosInstance.get(`/api/admin/jobs?page=${page}&limit=${limit}`);
            if (response.data.success) {
                const newData = response.data.data;
                const pagination = response.data.pagination;
                
                setJobs(prev => {
                    const combined = page === 1 ? newData : [...prev, ...newData];
                    return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
                });

                return page < pagination.pages;
            }
            return false;
        } catch (error) {
            console.error('Fetch jobs failed:', error);
            return false;
        } finally {
            setLocalLoading(false);
        }
    }, []);

    const { scrollRef, loading: infiniteLoading, reset } = useInfiniteScroll(fetchJobs, { limit: 20 });

    const fetchStats = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/api/admin/jobs/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Stats fetch failed:', error);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        reset();
    }, [searchTerm, reset]);

    const filteredJobs = useMemo(() => {
        return (jobs || []).filter(job => {
            const matchesSearch = 
                job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.postedBy?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFilter = 
                filter === 'all' || 
                (filter === 'active' && !job.isClosed) || 
                (filter === 'closed' && job.isClosed);
                
            return matchesSearch && matchesFilter;
        });
    }, [jobs, searchTerm, filter]);

    const initiateDelete = (job: any) => {
        setJobToDelete(job);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;
        try {
            await axiosInstance.delete(`/api/job/delete/${jobToDelete._id}`);
            toast.success('Listing decommissioned successfully');
            setJobs(prev => prev.filter(j => j._id !== jobToDelete._id));
            fetchStats();
            setShowDeleteConfirm(false);
            setJobToDelete(null);
            if (selectedJob?._id === jobToDelete._id) {
                setShowDetails(false);
                setSelectedJob(null);
            }
        } catch (error) {
            toast.error('Decommissioning sequence failed');
        }
    };

    const toggleJobStatus = async (job: any) => {
        try {
            await axiosInstance.patch(`/api/job/status/${job._id}`, { isClosed: !job.isClosed });
            toast.success(`Job ${job.isClosed ? 'reactivated' : 'closed'} successfully`);
            setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isClosed: !j.isClosed } : j));
            fetchStats();
        } catch (error) {
            toast.error('Status update failed');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <main className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10 pb-32">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <BriefcaseIcon className="w-5 h-5" />
                            </div>
                            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase leading-none">Job Management</h1>
                        </div>
                        <p className="text-[10px] font-black text-text-faint uppercase tracking-widest">Manage and oversee platform job listings</p>
                    </div>
                    
                    <AppleButton 
                        label="Post New Job" 
                        tone="primary" 
                        onClick={() => { setCurrentJob(null); setShowForm(true); }}
                        className="h-12 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    />
                </header>

                {/* Minimalist Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Nodes', value: stats.total, icon: BriefcaseIcon, color: 'text-primary' },
                        { label: 'Live Listings', value: stats.opened, icon: TrendingUpIcon, color: 'text-emerald-500' },
                        { label: 'Closed Record', value: stats.closed, icon: XCircleIcon, color: 'text-rose-500' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-[28px] border border-outline-variant/30 shadow-sm flex items-center gap-5">
                            <div className={`p-4 rounded-2xl bg-surface-soft ${s.color} border border-outline-variant/10 shadow-inner`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-faint uppercase tracking-widest leading-none mb-1">{s.label}</p>
                                <h4 className="text-xl font-black text-on-surface tracking-tighter leading-none">{s.value}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Minimalist Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-[24px] border border-outline-variant/30 shadow-sm">
                    <div className="flex-1 w-full relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by title, location or company..."
                            className="w-full pl-11 pr-5 py-3.5 bg-surface-soft/50 border-none rounded-xl text-xs font-bold text-on-surface placeholder:text-text-faint transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full md:w-[180px]">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full h-[46px] pl-5 pr-10 bg-surface-soft/50 border-none rounded-xl font-black text-[9px] uppercase tracking-widest text-on-surface focus:outline-none cursor-pointer appearance-none outline-none"
                        >
                            <option value="all">All Listings</option>
                            <option value="active">Active Only</option>
                            <option value="closed">Archived Only</option>
                        </select>
                        <ArrowDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 h-4 w-4 pointer-events-none" />
                    </div>
                </div>

                {/* Minimalist Card List */}
                <div 
                    ref={scrollRef}
                    className="space-y-3 overflow-y-auto max-h-[70vh] custom-scrollbar px-1"
                >
                    {localLoading && filteredJobs.length === 0 ? (
                        <div className="p-20 text-center space-y-4 bg-white rounded-[32px] border border-outline-variant/30 shadow-sm">
                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] font-black text-text-faint uppercase tracking-widest">Accessing Registry...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="p-20 text-center space-y-4 bg-white rounded-[32px] border border-outline-variant/30 shadow-sm">
                            <div className="w-16 h-16 bg-surface-soft rounded-2xl flex items-center justify-center mx-auto mb-4 text-text-faint/20">
                                <BriefcaseIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">No Listings Match</h3>
                            <p className="text-[10px] font-black text-text-faint uppercase tracking-widest">Adjust filters or search parameters</p>
                        </div>
                    ) : (
                        <>
                            {filteredJobs.map((job) => (
                                <motion.div
                                    key={job._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => { setSelectedJob(job); setShowDetails(true); }}
                                    className="group bg-white p-5 rounded-[20px] border border-outline-variant/30 shadow-sm hover:shadow-xl hover:shadow-black/5 hover:border-primary/40 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-surface-soft border border-outline-variant/20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                            {job.postedBy?.companyLogo ? (
                                                <Image src={job.postedBy.companyLogo} alt="" width={56} height={56} unoptimized className="h-full w-full object-contain" />
                                            ) : (
                                                <BriefcaseIcon className="h-6 w-6 text-text-faint/20" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
                                                <div className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${job.isClosed ? 'bg-error/5 text-error border-error/10' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'}`}>
                                                    {job.isClosed ? 'Closed' : 'Active'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5 text-text-faint">
                                                <p className="text-[9px] font-black uppercase tracking-widest">{job.postedBy?.companyName || 'Private Org'}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">{job.location || 'Remote'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-10">
                                        <div className="hidden lg:block text-right">
                                            <p className="text-[8px] font-black text-text-faint uppercase tracking-widest mb-0.5">Deployment</p>
                                            <p className="text-[10px] font-black text-on-surface uppercase tracking-tight">{moment(job.createdAt).fromNow()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setCurrentJob(job); setShowForm(true); }}
                                                className="h-10 w-10 flex items-center justify-center bg-surface-soft hover:bg-on-surface text-on-surface-variant/40 hover:text-white rounded-xl transition-all border border-outline-variant/5"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); initiateDelete(job); }}
                                                className="h-10 w-10 flex items-center justify-center bg-surface-soft hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all border border-outline-variant/5"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {infiniteLoading && (
                                <div className="py-8 text-center">
                                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Deletion Confirmation Dialog */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-outline-variant/10 text-center"
                            >
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                                    <AlertTriangle className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">Confirm Decommission</h3>
                                <p className="text-xs font-bold text-text-faint uppercase tracking-widest leading-relaxed mb-8">
                                    You are about to permanently remove this listing from the registry. This action is irreversible and all associated analytics will be lost.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="h-12 bg-surface-soft text-on-surface-variant rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-surface-variant/20 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        onClick={confirmDelete}
                                        className="h-12 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drawers */}
                <AdminJobForm 
                    isOpen={showForm}
                    job={currentJob}
                    onClose={() => { setShowForm(false); setCurrentJob(null); }}
                    onSuccess={() => { reset(); fetchStats(); }}
                />

                <AdminJobDetails 
                    isOpen={showDetails}
                    job={selectedJob}
                    onClose={() => { setShowDetails(false); setSelectedJob(null); }}
                    onEdit={() => { setShowDetails(false); setShowForm(true); setCurrentJob(selectedJob); }}
                    onDelete={() => initiateDelete(selectedJob)}
                    onToggleStatus={() => toggleJobStatus(selectedJob)}
                />
            </main>
        </ProtectedRoute>
    );
};

export default AdminJobsPage;
