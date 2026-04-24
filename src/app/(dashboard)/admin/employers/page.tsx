'use client';

import { 
    SearchIcon, 
    BuildingIcon, 
    VerifyIcon, 
    RefreshIcon,
} from '@/components/ui/premium/PremiumIcons';
import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomIcon from '@/components/ui/CustomIcon';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, User as UserIcon, Building2, MapPin, Mail, Calendar, Edit2, Trash2, Eye, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';
import Image from 'next/image';

const ListEmployersPage = () => {
    const [employers, setEmployers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        newThisMonth: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewJobs, setViewJobs] = useState(false);
    const [employerJobs, setEmployerJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [jobApplicants, setJobApplicants] = useState<any[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [viewApplicants, setViewApplicants] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    const handleCloseModal = () => {
        setShowModal(false);
        setTimeout(() => {
            setViewJobs(false);
            setViewApplicants(false);
            setIsEditing(false);
            setEmployerJobs([]);
            setJobApplicants([]);
            setShowDeleteConfirm(false);
        }, 300);
    };

    const filteredEmployers = employers.filter(emp => 
        emp.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchEmployers = useCallback(async (pageToFetch: number, limit: number) => {
        try {
            if (pageToFetch === 1) setLoading(true);
            const response = await axiosInstance.get(`/api/admin/employers?page=${pageToFetch}&limit=${limit}&search=${searchTerm}`);
            if (response.data.success) {
                const newData = response.data.data;
                const pagin = response.data.pagination;
                
                setEmployers(prev => {
                    const combined = pageToFetch === 1 ? newData : [...prev, ...newData];
                    return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
                });
                setPagination(pagin);

                if (pageToFetch === 1) {
                    const total = pagin.total;
                    const active = newData.filter((e: any) => e.isActive).length;
                    setStats(prev => ({ ...prev, total, active }));
                }
                return pageToFetch < pagin.pages;
            }
            return false;
        } catch (error) {
            toast.error("Failed to retrieve employers data.");
            return false;
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const { scrollRef, loading: infiniteLoading, reset } = useInfiniteScroll(fetchEmployers, { limit: 20 });

    useEffect(() => {
        reset();
    }, [searchTerm, reset]);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await axiosInstance.get('/api/admin/employers/stats');
            if (res.data.success) setStats(res.data.data);
        };
        fetchStats();
    }, []);

    const handleUpdate = async () => {
        try {
            const res = await axiosInstance.patch(`/api/admin/users/${selectedEmployer._id}`, editData);
            if (res.data.success) {
                toast.success("Employer updated successfully");
                setEmployers(prev => prev.map(e => e._id === selectedEmployer._id ? { ...e, ...editData } : e));
                setSelectedEmployer({ ...selectedEmployer, ...editData });
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await axiosInstance.delete(`/api/admin/users/${selectedEmployer._id}`);
            if (res.data.success) {
                toast.success("Employer deleted successfully");
                setEmployers(prev => prev.filter(e => e._id !== selectedEmployer._id));
                handleCloseModal();
            }
        } catch (error) {
            toast.error("Deletion failed");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const fetchEmployerJobs = async (id: string) => {
        try {
            setLoadingJobs(true);
            setViewJobs(true);
            const res = await axiosInstance.get(`/api/admin/jobs/company/${id}`);
            if (res.data.success) setEmployerJobs(res.data.data || []);
        } catch (error) {
            toast.error("Failed to fetch jobs");
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchJobApplicants = async (jobId: string) => {
        try {
            setLoadingApplicants(true);
            setViewApplicants(true);
            const res = await axiosInstance.get(`/api/admin/jobs/${jobId}/applicants`);
            if (res.data.success) setJobApplicants(res.data.data || []);
        } catch (error) {
            toast.error("Failed to fetch applicants");
        } finally {
            setLoadingApplicants(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employers</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage employer accounts, view their job postings, and track activities.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Employers</p>
                                <h4 className="text-3xl font-bold text-gray-900">{stats.total}</h4>
                            </div>
                            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                                <BuildingIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Accounts</p>
                                <h4 className="text-3xl font-bold text-gray-900">{stats.active}</h4>
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                                <VerifyIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">New This Month</p>
                                <h4 className="text-3xl font-bold text-gray-900">{stats.newThisMonth}</h4>
                            </div>
                            <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                                <RefreshIcon className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search by name, company, or email..."
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-gray-500">Loading employers...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Manager</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEmployers.length > 0 ? (
                                        filteredEmployers.map((employer) => (
                                            <tr key={employer._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                                            {employer.profileImage ? (
                                                                <Image src={employer.profileImage} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                                                            ) : (
                                                                <UserIcon size={18} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{employer.fullname}</div>
                                                            <div className="text-xs text-gray-500">{employer.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center p-1">
                                                            {employer.companyLogo ? (
                                                                <Image src={employer.companyLogo} width={24} height={24} unoptimized className="w-full h-full object-contain" alt="" />
                                                            ) : (
                                                                <Building2 size={16} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{employer.companyName || 'Not specified'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${employer.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                        }`}>
                                                        {employer.isActive ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {moment(employer.createdAt).format('MMM D, YYYY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmployer(employer);
                                                            setShowModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <SearchIcon className="h-8 w-8 text-gray-400 mb-3" />
                                                    <p className="text-sm font-medium">No employers found</p>
                                                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search query.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {infiniteLoading && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                <AnimatePresence>
                    {showModal && selectedEmployer && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleCloseModal}
                                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                            >
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <h2 className="text-lg font-bold text-gray-900">Employer Details</h2>
                                    <button 
                                        onClick={handleCloseModal} 
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 flex-1 overflow-y-auto">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                            {selectedEmployer.profileImage ? (
                                                <Image src={selectedEmployer.profileImage} alt="" width={64} height={64} unoptimized className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    <UserIcon size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{selectedEmployer.fullname}</h3>
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedEmployer.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}>
                                                    {selectedEmployer.isActive ? 'Active Account' : 'Suspended'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Info Cards */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4">
                                                <Building2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedEmployer.companyName || 'Not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4">
                                                <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedEmployer.email}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4">
                                                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedEmployer.location || 'Not specified'}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4">
                                                <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined On</p>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">{moment(selectedEmployer.createdAt).format('MMMM D, YYYY')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedEmployer.companyDescription && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">About Company</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selectedEmployer.companyDescription}</p>
                                            </div>
                                        )}
                                        
                                        {!viewJobs ? (
                                            <div className="border-t border-gray-200 pt-6 flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            setEditData({
                                                                fullname: selectedEmployer.fullname,
                                                                email: selectedEmployer.email,
                                                                companyName: selectedEmployer.companyName,
                                                                location: selectedEmployer.location,
                                                                isActive: selectedEmployer.isActive
                                                            });
                                                            setIsEditing(true);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit Details
                                                    </button>
                                                    <button 
                                                        onClick={() => fetchEmployerJobs(selectedEmployer._id)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                    >
                                                        <Briefcase className="w-4 h-4" />
                                                        View Job Posts
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete Employer
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-t border-gray-200 pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-base font-bold text-gray-900">Job Postings</h4>
                                                    <button 
                                                        onClick={() => setViewJobs(false)} 
                                                        className="text-sm font-medium text-primary hover:text-primary/80"
                                                    >
                                                        Back to Details
                                                    </button>
                                                </div>
                                                
                                                {loadingJobs ? (
                                                    <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                                                ) : employerJobs.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {employerJobs.map(job => (
                                                            <div key={job._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <h5 className="font-semibold text-gray-900 text-sm">{job.title}</h5>
                                                                        <p className="text-xs text-gray-500 mt-1">{job.category} • {job.location}</p>
                                                                    </div>
                                                                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${job.isClosed ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                                                        {job.isClosed ? 'Closed' : 'Active'}
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        setSelectedJob(job);
                                                                        fetchJobApplicants(job._id);
                                                                    }}
                                                                    className="w-full py-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                                                >
                                                                    View Applicants
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-12 text-center bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                                                        <p className="text-sm text-gray-500">No job postings found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Modal Overlay */}
                                <AnimatePresence>
                                    {isEditing && (
                                        <motion.div 
                                            key="edit-overlay"
                                            initial={{ opacity: 0, y: '100%' }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: '100%' }}
                                            transition={{ type: 'tween', duration: 0.3 }}
                                            className="absolute inset-0 bg-white z-50 flex flex-col"
                                        >
                                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                                                <h2 className="text-lg font-bold text-gray-900">Edit Employer</h2>
                                                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-6 flex-1 overflow-y-auto space-y-5">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        value={editData.fullname}
                                                        onChange={(e) => setEditData({...editData, fullname: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        value={editData.companyName}
                                                        onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        value={editData.location}
                                                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-900">Account Status</label>
                                                        <p className="text-xs text-gray-500">Toggle employer access to the platform</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setEditData({...editData, isActive: !editData.isActive})}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${editData.isActive ? 'bg-primary' : 'bg-gray-300'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                                <button 
                                                    onClick={handleUpdate}
                                                    className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Applicants Modal Overlay */}
                                <AnimatePresence>
                                    {viewApplicants && (
                                        <motion.div 
                                            key="applicants-overlay"
                                            initial={{ opacity: 0, x: '100%' }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: '100%' }}
                                            transition={{ type: 'tween', duration: 0.3 }}
                                            className="absolute inset-0 bg-white z-[60] flex flex-col"
                                        >
                                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => setViewApplicants(false)} 
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                        title="Back to Job Postings"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                                    </button>
                                                    <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                                                            {selectedEmployer?.companyLogo ? (
                                                                <Image src={selectedEmployer.companyLogo} alt="" width={32} height={32} unoptimized className="w-full h-full object-contain" />
                                                            ) : (
                                                                <Building2 size={14} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{selectedEmployer?.companyName || 'Employer'} • Applicants</p>
                                                            <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{selectedJob?.title}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setViewApplicants(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30">
                                                {loadingApplicants ? (
                                                    <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                                                ) : jobApplicants.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {jobApplicants.map(app => (
                                                            <div key={app._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                                        {app.applicant.profileImage ? (
                                                                            <Image src={app.applicant.profileImage} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="h-full w-full flex items-center justify-center text-gray-400"><UserIcon size={16} /></div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h6 className="font-semibold text-gray-900 text-sm truncate">{app.applicant.fullname}</h6>
                                                                        <p className="text-xs text-gray-500 truncate">{app.applicant.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0">
                                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                                                                        app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                                                        app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                                                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                                                    }`}>
                                                                        {app.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-12 text-center bg-white rounded-lg border border-gray-200 border-dashed">
                                                        <p className="text-sm text-gray-500">No applications received yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Delete Confirmation Modal */}
                                <AnimatePresence>
                                    {showDeleteConfirm && (
                                        <motion.div 
                                            key="delete-confirm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
                                        >
                                            <motion.div 
                                                initial={{ scale: 0.95, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.95, opacity: 0 }}
                                                className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
                                            >
                                                <div className="p-6 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                                        <Trash2 className="w-6 h-6 text-red-600" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Employer?</h3>
                                                    <p className="text-sm text-gray-500">This action cannot be undone. All job posts, applications, and data associated with this employer will be permanently removed.</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                                    <button 
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={handleDelete}
                                                        disabled={isDeleting}
                                                        className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
};

export default ListEmployersPage;
