'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axiosInstance';
import { RootState } from '@/store';
import {
    Loader2, X, Search, Sparkles, Filter, CheckCircle2, UserCircle, Briefcase, FileText, MapPin, Mail, GraduationCap, Edit2, Trash2
} from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const cleanAIOutput = (text: string | null | undefined): string => {
    if (!text) return '';
    let clean = text.trim();
    
    if (clean.startsWith('```json')) {
        const match = clean.match(/```json([\s\S]*?)```/);
        if (match) clean = match[1].trim();
    } else if (clean.startsWith('```')) {
        const match = clean.match(/```([\s\S]*?)```/);
        if (match) clean = match[1].trim();
    }

    if (clean.startsWith('{') && clean.endsWith('}')) {
        try {
            const parsed = JSON.parse(clean);
            return parsed.summary || parsed.aiSummary || parsed.recommendation || parsed.matchReason || parsed.text || Object.values(parsed)[0] || clean;
        } catch (e) {
            return clean.replace(/[{}]/g, '').replace(/"(summary|recommendation|matchReason)":/g, '').replace(/"/g, '').trim();
        }
    }

    return clean;
};

const ListJobSeekersPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isEmployer = user?.role === 'employer';

    const [jobSeekers, setJobSeekers] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiSearching, setAiSearching] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeeker, setSelectedSeeker] = useState<any>(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        withResume: 0,
        newThisMonth: 0
    });
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [viewApplications, setViewApplications] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editData, setEditData] = useState<any>({});

    const handleCloseDrawer = () => {
        setShowDrawer(false);
        setTimeout(() => {
            setViewApplications(false);
            setIsEditing(false);
            setAppliedJobs([]);
            setShowDeleteConfirm(false);
        }, 300);
    };

    const fetchJobSeekers = useCallback(async (pageToFetch: number, limit: number) => {
        try {
            if (pageToFetch === 1) setLoading(true);
            const response = await axiosInstance.get(`/api/admin/jobseekers?page=${pageToFetch}&limit=${limit}&search=${searchTerm}`);
            if (response.data.success) {
                const newData = response.data.data;
                const pagin = response.data.pagination;
                
                setJobSeekers(prev => {
                    const combined = pageToFetch === 1 ? newData : [...prev, ...newData];
                    return Array.from(new Map(combined.map((item: any) => [item._id, item])).values());
                });
                setPagination(pagin);
                
                return pageToFetch < pagin.pages;
            }
            return false;
        } catch (error) {
            toast.error("Failed to fetch candidates." + error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const { scrollRef, loading: infiniteLoading, reset } = useInfiniteScroll(fetchJobSeekers, { limit: 20 });

    useEffect(() => {
        reset();
    }, [searchTerm, reset]);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await axiosInstance.get('/api/admin/jobseekers/stats');
            if (res.data.success) {
                setStats(res.data.data);
            }
        };
        fetchStats();
    }, []);

    const fetchAppliedJobs = async (id: string) => {
        try {
            setLoadingApplications(true);
            setViewApplications(true);
            const res = await axiosInstance.get(`/api/admin/jobseekers/${id}/applications`);
            if (res.data.success) {
                setAppliedJobs(res.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch applications" + error);
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await axiosInstance.patch(`/api/admin/users/${selectedSeeker._id}`, editData);
            if (res.data.success) {
                toast.success("Candidate updated successfully");
                setJobSeekers(prev => prev.map(s => s._id === selectedSeeker._id ? { ...s, ...editData } : s));
                setSelectedSeeker({ ...selectedSeeker, ...editData });
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await axiosInstance.delete(`/api/admin/users/${selectedSeeker._id}`);
            if (res.data.success) {
                toast.success("Candidate deleted successfully");
                setJobSeekers(prev => prev.filter(s => s._id !== selectedSeeker._id));
                handleCloseDrawer();
            }
        } catch (error) {
            toast.error("Deletion failed");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleAiRecommend = async () => {
        if (!aiQuery.trim()) return;
        try {
            setAiSearching(true);
            const response = await axiosInstance.post('/api/ai/recommend-candidates', { query: aiQuery });
            if (response.data.recommendations) {
                setRecommendations(response.data.recommendations);
                toast.success(`Found ${response.data.recommendations.length} matching candidates.`);
            }
        } catch (error) {
            toast.error("AI recommendation engine encountered an error." + error);
        } finally {
            setAiSearching(false);
        }
    };

    const parseSkills = (skills: any): string[] => {
        if (!skills) return [];

        if (Array.isArray(skills)) {
            return skills.map(s => {
                if (typeof s === 'string') return s;
                if (typeof s === 'object' && s !== null) {
                    return s.name || s.label || s.title || s.skill || Object.values(s)[0] || '';
                }
                return String(s);
            }).filter(s => s && s.length > 0 && s !== '[]' && s !== '[ ]');
        }

        if (typeof skills === 'string') {
            const s = skills.trim();
            if (s.startsWith('[') && s.endsWith(']')) {
                try {
                    const parsed = JSON.parse(s);
                    return parseSkills(parsed);
                } catch (e) {
                    return s.replace(/[\[\]"']/g, '').split(',').map(item => item.trim()).filter(Boolean);
                }
            }
            return s.split(',').map(item => item.trim()).filter(Boolean);
        }

        return [];
    };

    const displayCandidates = useMemo(() => {
        if (recommendations.length > 0) {
            return recommendations.map(r => ({
                ...r.candidate,
                aiScore: r.matchScore,
                aiReason: r.matchReason,
                aiRole: r.recommendedRole
            }));
        }

        return jobSeekers;
    }, [jobSeekers, recommendations]);

    return (
        <ProtectedRoute allowedRoles={['admin', 'employer']}>
            <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidates</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Browse, search, and review candidate profiles in the talent pool.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Candidates</p>
                                <h4 className="text-3xl font-bold text-gray-900">{stats.total}</h4>
                            </div>
                            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                                <UserCircle className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">With Resumes</p>
                                <h4 className="text-3xl font-bold text-gray-900">{stats.withResume}</h4>
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                                <FileText className="w-5 h-5 text-emerald-600" />
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
                                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* AI Search */}
                    <div className="bg-white rounded-xl border border-primary/20 p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sparkles className="w-24 h-24 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-3 items-center">
                            <div className="w-full relative flex-1">
                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="AI Search: Describe the ideal candidate (e.g. Senior frontend dev with 5 years React)..."
                                    className="w-full bg-primary/5 border border-primary/10 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiRecommend()}
                                />
                                {(recommendations.length > 0 || aiQuery.length > 0) && (
                                    <button 
                                        onClick={() => { setAiQuery(''); setRecommendations([]); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={handleAiRecommend}
                                disabled={aiSearching || !aiQuery.trim()}
                                className="w-full md:w-auto px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {aiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                AI Search
                            </button>
                        </div>
                    </div>

                    {/* Standard Search */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or skills..."
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-gray-500">Loading candidates...</p>
                        </div>
                    ) : (
                        <div 
                            ref={scrollRef}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {displayCandidates.length > 0 ? (
                                displayCandidates.map((seeker) => (
                                    <div 
                                        key={seeker._id}
                                        onClick={() => {
                                            setSelectedSeeker(seeker);
                                            setShowDrawer(true);
                                        }}
                                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full relative overflow-hidden group"
                                    >
                                        {seeker.aiScore && (
                                            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 text-xs font-bold rounded-bl-lg">
                                                {seeker.aiScore}% Match
                                            </div>
                                        )}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                                                {seeker.profileImage ? (
                                                    <Image src={seeker.profileImage} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                                                ) : (
                                                    <UserCircle className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 pr-8">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{seeker.fullname}</h3>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{seeker.position || 'Candidate'}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{seeker.location || 'Location unlisted'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {parseSkills(seeker.skills).slice(0, 4).map((skill: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-md border border-gray-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {parseSkills(seeker.skills).length > 4 && (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-semibold rounded-md border border-gray-200">
                                                        +{parseSkills(seeker.skills).length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${seeker.resume ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {seeker.resume ? 'Resume attached' : 'No resume'}
                                            </span>
                                            <span className="text-xs font-semibold text-primary group-hover:underline">View Profile</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">No candidates found</p>
                                    <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria.</p>
                                </div>
                            )}
                            {infiniteLoading && (
                                <div className="col-span-full py-8 text-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Candidate Drawer */}
                <AnimatePresence>
                    {showDrawer && selectedSeeker && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={handleCloseDrawer} 
                                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 cursor-pointer" 
                            />
                            <motion.div
                                initial={{ x: '100%' }} 
                                animate={{ x: 0 }} 
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                            >
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <h2 className="text-lg font-bold text-gray-900">Candidate Profile</h2>
                                    <button onClick={handleCloseDrawer} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
                                    
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="h-24 w-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                            {selectedSeeker.profileImage ? (
                                                <Image src={selectedSeeker.profileImage} alt="" width={64} height={64} unoptimized className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    <UserCircle size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-gray-900">{selectedSeeker.fullname}</h3>
                                                {!selectedSeeker.isActive && selectedSeeker.isActive !== undefined && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Suspended
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 mt-1">{selectedSeeker.position || 'Professional'}</p>
                                            
                                            <div className="flex flex-wrap gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {selectedSeeker.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {selectedSeeker.location || 'Location not specified'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {typeof selectedSeeker.experience === 'object' ? (Array.isArray(selectedSeeker.experience) ? selectedSeeker.experience.length : '1+') : (selectedSeeker.experience || 'Entry')} roles
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Match Context */}
                                    {selectedSeeker.aiReason && (
                                        <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 flex gap-4">
                                            <div className="shrink-0 mt-0.5">
                                                <Sparkles className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-primary mb-1">AI Recommendation Match: {selectedSeeker.aiScore}%</h4>
                                                <p className="text-xs font-medium text-gray-700 leading-relaxed">{cleanAIOutput(selectedSeeker.aiReason)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills Section */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-gray-400" />
                                            Skills & Expertise
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {parseSkills(selectedSeeker.skills).map((skill, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                                                    {skill}
                                                </span>
                                            ))}
                                            {parseSkills(selectedSeeker.skills).length === 0 && (
                                                <p className="text-sm text-gray-500">No skills listed.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {selectedSeeker.bio && (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-900 mb-4">About</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedSeeker.bio}</p>
                                        </div>
                                    )}

                                    {/* Work Experience */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            Experience
                                        </h4>
                                        <div className="space-y-6">
                                            {Array.isArray(selectedSeeker.experience) && selectedSeeker.experience.length > 0 ? (
                                                selectedSeeker.experience.map((exp: any, i: number) => (
                                                    <div key={i} className={`relative pl-4 ${i !== selectedSeeker.experience.length - 1 ? 'border-l-2 border-gray-100 pb-6' : ''}`}>
                                                        <div className="absolute w-2.5 h-2.5 bg-gray-200 rounded-full -left-[6px] top-1.5 border-2 border-white"></div>
                                                        <h5 className="text-sm font-bold text-gray-900">{exp.role || exp.title || 'Role'}</h5>
                                                        <p className="text-xs font-semibold text-primary mt-0.5">{exp.company || 'Company'}</p>
                                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-1">
                                                            {exp.startDate ? new Date(exp.startDate).getFullYear() : 'Unknown'} — {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : 'Unknown')}
                                                        </p>
                                                        {exp.description && (
                                                            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No experience data available.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            Education
                                        </h4>
                                        <div className="space-y-4">
                                            {Array.isArray(selectedSeeker.education) && selectedSeeker.education.length > 0 ? (
                                                selectedSeeker.education.map((edu: any, i: number) => (
                                                    <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                                                        <h5 className="text-sm font-bold text-gray-900">{edu.degree || 'Degree'}</h5>
                                                        <p className="text-xs font-semibold text-gray-700 mt-1">{edu.institution || 'Institution'}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[10px] font-medium text-gray-500">{edu.fieldOfStudy || 'Field of study'}</span>
                                                            <span className="text-[10px] font-medium text-gray-400">•</span>
                                                            <span className="text-[10px] font-medium text-gray-500">Class of {edu.graduationYear || edu.endYear || '?'}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No education data available.</p>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                <div className="p-6 border-t border-gray-200 bg-white flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {selectedSeeker.resume && (
                                            <a href={selectedSeeker.resume} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                <button className="w-full h-10 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                                                    <FileText size={16} />
                                                    View Resume
                                                </button>
                                            </a>
                                        )}
                                        {!isEmployer && (
                                            <button 
                                                onClick={() => fetchAppliedJobs(selectedSeeker._id)}
                                                className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <Briefcase size={16} />
                                                View Applications
                                            </button>
                                        )}
                                    </div>
                                    {!isEmployer && (
                                        <div className="flex flex-col sm:flex-row gap-3 mt-1 pt-4 border-t border-gray-100">
                                            <button 
                                                onClick={() => {
                                                    setEditData({
                                                        fullname: selectedSeeker.fullname,
                                                        email: selectedSeeker.email,
                                                        position: selectedSeeker.position,
                                                        location: selectedSeeker.location,
                                                        isActive: selectedSeeker.isActive !== undefined ? selectedSeeker.isActive : true
                                                    });
                                                    setIsEditing(true);
                                                }}
                                                className="flex-1 h-10 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <Edit2 size={16} />
                                                Edit Details
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="flex-1 h-10 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            >
                                                <Trash2 size={16} />
                                                Delete Candidate
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Applications Overlay */}
                                <AnimatePresence>
                                    {viewApplications && (
                                        <motion.div 
                                            key="applications-overlay"
                                            initial={{ opacity: 0, x: '100%' }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: '100%' }}
                                            transition={{ type: 'tween', duration: 0.3 }}
                                            className="absolute inset-0 bg-white z-[60] flex flex-col"
                                        >
                                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => setViewApplications(false)} 
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                        title="Back to Candidate Profile"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                                    </button>
                                                    <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                                            {selectedSeeker?.profileImage ? (
                                                                <Image src={selectedSeeker.profileImage} alt="" width={32} height={32} unoptimized className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserCircle size={16} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Application History</p>
                                                            <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{selectedSeeker?.fullname}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setViewApplications(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
                                                {loadingApplications ? (
                                                    <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                                                ) : appliedJobs.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {appliedJobs.map(app => (
                                                            <div key={app._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col gap-3">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h6 className="font-bold text-gray-900 text-sm">{app.job?.title}</h6>
                                                                        <p className="text-xs font-medium text-gray-500 mt-0.5">{app.job?.postedBy?.companyName || 'Company'}</p>
                                                                    </div>
                                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                                                                        app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                                                        app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 
                                                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                                                    }`}>
                                                                        {app.status}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100 text-xs text-gray-400 font-medium">
                                                                    <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-12 text-center bg-white rounded-lg border border-gray-200 border-dashed">
                                                        <p className="text-sm text-gray-500">No applications found for this candidate.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                                                <h2 className="text-lg font-bold text-gray-900">Edit Candidate</h2>
                                                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-6 flex-1 overflow-y-auto space-y-5">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        value={editData.fullname || ''}
                                                        onChange={(e) => setEditData({...editData, fullname: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-gray-50"
                                                        value={editData.email || ''}
                                                        disabled
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Position / Headline</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        value={editData.position || ''}
                                                        onChange={(e) => setEditData({...editData, position: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                                                    <input 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                        value={editData.location || ''}
                                                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-900">Account Status</label>
                                                        <p className="text-xs text-gray-500">Toggle candidate access to the platform</p>
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
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Candidate?</h3>
                                                    <p className="text-sm text-gray-500">This action cannot be undone. All applications and data associated with this candidate will be permanently removed.</p>
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

export default ListJobSeekersPage;
