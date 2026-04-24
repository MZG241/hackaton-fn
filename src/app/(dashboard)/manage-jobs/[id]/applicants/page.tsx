'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import {
    Mail, User, FileText, Calendar,
    ChevronDown, ChevronUp, Check, X,
    Clock, MoreVertical, Filter, Search,
    ChevronLeft, ChevronRight, MapPin,
    Briefcase, ArrowLeft, DollarSign,
    Sparkles, Zap, TrendingUp, Columns,
    Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const ApplicantsViewPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [sortConfig, setSortConfig] = useState({ key: "appliedAt", direction: "desc" as "asc" | "desc" });
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [applicantsPerPage] = useState(10);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [aiFiltering, setAiFiltering] = useState({ category: '', minScore: '' });
    const [isScreening, setIsScreening] = useState(false);
    const [compareList, setCompareList] = useState<any[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const fetchApplicants = useCallback(async () => {
        try {
            setLoading(true);
            const { category, minScore } = aiFiltering;
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (minScore) params.append('minScore', minScore);

            const response = await axiosInstance.get(`/api/applicant/view/${id}?${params.toString()}`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            toast.error("Échec du chargement des candidatures.");
            router.push('/manage-jobs');
        } finally {
            setLoading(false);
        }
    }, [id, aiFiltering, router]);

    useEffect(() => {
        if (id) {
            fetchApplicants();
        }
    }, [id, fetchApplicants]);

    const updateApplicantStatus = async (applicantId: string, newStatus: string) => {
        const loadingToast = toast.loading("Mise à jour du statut...");
        try {
            await axiosInstance.patch(`/api/applicant/status/${applicantId}`, { status: newStatus });
            toast.success("Statut mis à jour !", { id: loadingToast });
            fetchApplicants();
        } catch (error) {
            toast.error("Échec de la mise à jour.", { id: loadingToast });
        }
    };

    const runAIScreening = async (applicationId: string) => {
        try {
            setIsScreening(true);
            const loadingToast = toast.loading("L'IA analyse le candidat...");
            await axiosInstance.post(`/api/ai/screen/${applicationId}`);
            toast.success("Analyse IA terminée !", { id: loadingToast });
            fetchApplicants();
        } catch (error) {
            toast.error("L'analyse IA a échoué.");
        } finally {
            setIsScreening(false);
        }
    };

    const toggleCompare = (applicant: any) => {
        if (compareList.find(a => a._id === applicant._id)) {
            setCompareList(compareList.filter(a => a._id !== applicant._id));
        } else {
            if (compareList.length >= 2) {
                toast.error("Vous pouvez comparer 2 candidats à la fois.");
                return;
            }
            setCompareList([...compareList, applicant]);
        }
    };

    // Filter & Sort Logic
    const filteredApplicants = data?.applicants ? data.applicants.filter((app: any) => {
        const statusMatch = statusFilter === "All" || app.status === statusFilter;
        const name = app.user?.name || app.user?.fullname || "";
        const email = app.user?.email || "";
        const searchMatch = searchTerm === "" ||
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
    }) : [];

    const sortedApplicants = [...filteredApplicants].sort((a: any, b: any) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const paginatedApplicants = sortedApplicants.slice(
        (currentPage - 1) * applicantsPerPage,
        currentPage * applicantsPerPage
    );

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['employer']}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-on-surface/30 uppercase tracking-[0.3em]">Loading applicants...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['employer']}>
            
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-on-surface-variant/60 font-black uppercase tracking-widest text-[10px] hover:text-primary transition-all"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back
                            </button>
                            <h1 className="text-2xl font-black text-on-surface tracking-tight">{data.job.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                    {data.job.category}
                                </span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    {data.job.location}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setAiFiltering({ category: 'Strong', minScore: '80' })}
                                className={`flex-1 md:flex-none px-6 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    aiFiltering.category === 'Strong'
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white'
                                }`}
                            >
                                <Zap className="h-4 w-4" /> Top Matches
                            </button>
                            {compareList.length > 0 && (
                                <button
                                    onClick={() => setShowCompareModal(true)}
                                    className="flex-1 md:flex-none px-6 h-11 bg-amber-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Columns className="h-4 w-4" /> Compare ({compareList.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/40" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-soft bg-surface-container-low text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="pl-4 pr-8 py-2.5 rounded-xl border border-outline-soft bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 outline-none appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Applied">Applied</option>
                                <option value="In Review">In Review</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant/40 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                className="pl-4 pr-8 py-2.5 rounded-xl border border-outline-soft bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 outline-none appearance-none cursor-pointer"
                                value={aiFiltering.category}
                                onChange={(e) => setAiFiltering(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="">AI: All</option>
                                <option value="Strong">AI: Strong ✨</option>
                                <option value="Potential">AI: Potential</option>
                                <option value="Weak">AI: Weak</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant/40 pointer-events-none" />
                        </div>
                    </div>

                    {/* Applicants List */}
                    <div className="bg-surface-container-lowest rounded-3xl border border-outline-soft shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-outline-soft bg-surface-variant/2">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Candidate</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">AI Score</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">AI Category</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-soft">
                                    {paginatedApplicants.length > 0 ? (
                                        paginatedApplicants.map((app: any) => (
                                            <tr
                                                key={app._id}
                                                className="hover:bg-primary/5 transition-all group cursor-pointer"
                                                onClick={() => {
                                                    setSelectedApplicant(app);
                                                    setShowProfilePanel(true);
                                                }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 overflow-hidden relative flex items-center justify-center shrink-0">
                                                            {app.user.profileImage ? (
                                                                <Image src={app.user.profileImage} fill className="object-cover" alt="Avatar" />
                                                            ) : (
                                                                <span className="text-primary font-black text-xs uppercase">
                                                                    {(app.user.name || app.user.fullname || 'U').charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-on-surface group-hover:text-primary transition-colors text-xs">
                                                                {app.user.name || app.user.fullname}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-on-surface-variant/60">{app.user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {app.aiScreening ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${app.aiScreening.score >= 80 ? 'bg-emerald-500' : app.aiScreening.score >= 50 ? 'bg-primary' : 'bg-red-500'}`}
                                                                    style={{ width: `${app.aiScreening.score}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-black text-xs text-on-surface">{app.aiScreening.score}%</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); runAIScreening(app._id); }}
                                                            className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all"
                                                        >
                                                            <Sparkles className="h-3.5 w-3.5" /> Run AI
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {app.aiScreening ? (
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                                                            app.aiScreening.category === 'Strong' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            app.aiScreening.category === 'Potential' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-rose-50 text-rose-600 border-rose-100'
                                                        }`}>
                                                            <div className="w-1 h-1 rounded-full bg-current" />
                                                            {app.aiScreening.category === 'Strong' ? 'Strong' : app.aiScreening.category === 'Potential' ? 'Potential' : 'Weak'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-on-surface-variant/30 font-bold text-[10px] uppercase tracking-widest">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                                                        app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        app.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        app.status === 'In Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                        <div className="w-1 h-1 rounded-full bg-current" />
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleCompare(app); }}
                                                            className={`p-2 rounded-xl transition-all border ${
                                                                compareList.find(a => a._id === app._id)
                                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                                    : 'bg-surface-container-low text-on-surface-variant/60 border-outline-soft hover:border-amber-300 hover:text-amber-500'
                                                            }`}
                                                            title="Compare"
                                                        >
                                                            <Columns className="w-4 h-4" />
                                                        </button>
                                                        {app.user.resume && (
                                                            <a
                                                                href={app.user.resume}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-2 bg-primary/5 text-primary border border-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button
                                                            className="p-2 bg-surface-container-low text-on-surface-variant/60 border border-outline-soft rounded-xl group-hover:border-primary/20 group-hover:text-primary transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedApplicant(app);
                                                                setShowProfilePanel(true);
                                                            }}
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-soft">
                                                        <User className="h-10 w-10 text-on-surface-variant/20" />
                                                    </div>
                                                    <p className="text-on-surface-variant/40 font-black uppercase tracking-widest text-[10px]">No candidates match your search</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {sortedApplicants.length > applicantsPerPage && (
                        <div className="flex justify-between items-center bg-surface-container-lowest p-6 rounded-2xl border border-outline-soft">
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                Showing <span className="text-on-surface">{(currentPage - 1) * applicantsPerPage + 1}</span> to{' '}
                                <span className="text-on-surface">{Math.min(currentPage * applicantsPerPage, sortedApplicants.length)}</span> of{' '}
                                <span className="text-on-surface">{sortedApplicants.length}</span> candidates
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-outline-soft rounded-xl font-black text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedApplicants.length / applicantsPerPage)))}
                                    disabled={currentPage * applicantsPerPage >= sortedApplicants.length}
                                    className="px-4 py-2 border border-outline-soft rounded-xl font-black text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Profile Panel */}
                <AnimatePresence>
                    {showProfilePanel && selectedApplicant && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowProfilePanel(false)}
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150]"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="fixed inset-y-0 right-0 w-full max-w-xl bg-surface z-[151] shadow-2xl overflow-y-auto flex flex-col border-l border-outline-soft"
                            >
                                <div className="px-6 py-4 border-b border-outline-soft flex justify-between items-center bg-surface sticky top-0 z-10">
                                    <button onClick={() => setShowProfilePanel(false)} className="p-2 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low border border-transparent hover:border-outline-soft transition-all">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-sm font-black text-on-surface uppercase tracking-widest">Candidate Profile</h2>
                                    <div className="w-9" />
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Candidate Identity */}
                                    <div className="flex flex-col items-center text-center space-y-4 pt-2">
                                        <div className="h-28 w-28 rounded-2xl bg-primary/5 border-4 border-surface overflow-hidden shadow-lg relative flex items-center justify-center">
                                            {selectedApplicant.user.profileImage ? (
                                                <Image src={selectedApplicant.user.profileImage} fill className="object-cover" alt="Profile" />
                                            ) : (
                                                <span className="text-primary font-black text-5xl uppercase">
                                                    {selectedApplicant.user.name?.charAt(0) || selectedApplicant.user.fullname?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-on-surface tracking-tight">{selectedApplicant.user.name || selectedApplicant.user.fullname}</h3>
                                            <p className="text-primary font-bold mt-0.5 text-xs flex items-center justify-center gap-1.5">
                                                <Mail className="h-3.5 w-3.5" />
                                                {selectedApplicant.user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decision Area */}
                                    <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-soft space-y-4">
                                        <h4 className="text-[11px] font-black text-on-surface uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-1.5 h-5 bg-primary rounded-full" />
                                            Hiring Decision
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => updateApplicantStatus(selectedApplicant._id, 'Accepted')}
                                                className={`h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                    selectedApplicant.status === 'Accepted'
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                                }`}
                                            >
                                                <Check className="h-4 w-4" /> Accept
                                            </button>
                                            <button
                                                onClick={() => updateApplicantStatus(selectedApplicant._id, 'Rejected')}
                                                className={`h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                    selectedApplicant.status === 'Rejected'
                                                        ? 'bg-rose-500 text-white'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                                                }`}
                                            >
                                                <X className="h-4 w-4" /> Reject
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI Insights Section */}
                                    <div className="bg-on-surface p-6 rounded-2xl text-on-primary space-y-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5">
                                            <Sparkles className="w-32 h-32" />
                                        </div>
                                        <div className="flex justify-between items-center relative z-10">
                                            <h4 className="text-sm font-black flex items-center gap-3 tracking-tight">
                                                <div className="p-2 bg-primary rounded-xl">
                                                    <Sparkles className="h-4 w-4" />
                                                </div>
                                                Akazi AI Analysis
                                            </h4>
                                            {selectedApplicant.aiScreening && (
                                                <div className="text-2xl font-black text-primary tracking-tighter">
                                                    {selectedApplicant.aiScreening.score}%
                                                </div>
                                            )}
                                        </div>

                                        {selectedApplicant.aiScreening ? (
                                            <div className="space-y-6 relative z-10">
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Strengths</p>
                                                    <div className="space-y-2">
                                                        {selectedApplicant.aiScreening.strengths.slice(0, 4).map((s: string, i: number) => (
                                                            <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                                                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                                                <span className="text-xs font-bold text-on-primary/80">{s}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em]">Gaps & Risks</p>
                                                    <div className="space-y-2">
                                                        {selectedApplicant.aiScreening.gaps.concat(selectedApplicant.aiScreening.risks).slice(0, 4).map((g: string, i: number) => (
                                                            <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                                                <X className="h-4 w-4 text-rose-400 shrink-0" />
                                                                <span className="text-xs font-bold text-on-primary/80">{g}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center space-y-4 flex flex-col items-center relative z-10">
                                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                                    <Sparkles className="h-10 w-10 text-white/20" />
                                                </div>
                                                <p className="text-on-primary/40 font-bold text-xs max-w-xs">No AI analysis yet for this candidate.</p>
                                                <button
                                                    onClick={() => runAIScreening(selectedApplicant._id)}
                                                    disabled={isScreening}
                                                    className="px-6 h-10 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-dim transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {isScreening ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                                    {isScreening ? 'Analysing...' : 'Generate Analysis'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* CV */}
                                    {selectedApplicant.user.resume && (
                                        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-soft flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/10">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-on-surface">Curriculum Vitae</h4>
                                                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-0.5">PDF / Professional</p>
                                                </div>
                                            </div>
                                            <a
                                                href={selectedApplicant.user.resume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 h-9 bg-primary/5 text-primary border border-primary/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center"
                                            >
                                                View
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Compare Modal */}
                <AnimatePresence>
                    {showCompareModal && (
                        <div className="fixed inset-0 flex items-center justify-center p-8 z-[200]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCompareModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-surface rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 shadow-2xl border border-outline-soft"
                            >
                                <div className="px-6 py-4 border-b border-outline-soft flex justify-between items-center">
                                    <div>
                                        <h2 className="text-base font-black text-on-surface uppercase tracking-widest flex items-center gap-3">
                                            <Columns className="h-5 w-5 text-primary" />
                                            Candidate Comparison
                                        </h2>
                                        <p className="text-on-surface-variant/60 font-bold mt-0.5 text-[10px] uppercase tracking-widest">Side-by-side AI analysis</p>
                                    </div>
                                    <button onClick={() => setShowCompareModal(false)} className="p-2 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low border border-transparent hover:border-outline-soft transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-x-auto flex-1">
                                    <div className="grid grid-cols-2 gap-6 min-w-[700px]">
                                        {compareList.map((app, idx) => (
                                            <div key={idx} className="bg-surface-container-low rounded-2xl p-6 flex flex-col space-y-6 border border-outline-soft hover:border-primary/20 transition-all">
                                                <div className="flex flex-col items-center text-center space-y-4">
                                                    <div className="h-24 w-24 rounded-2xl bg-primary/5 border-4 border-surface overflow-hidden shadow-lg relative flex items-center justify-center">
                                                        {app.user.profileImage ? (
                                                            <Image src={app.user.profileImage} fill className="object-cover" alt="Avatar" />
                                                        ) : (
                                                            <span className="text-primary font-black text-3xl uppercase">
                                                                {app.user.fullname?.charAt(0) || 'U'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-on-surface tracking-tight">{app.user.fullname}</h3>
                                                        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full text-sm font-black">
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                            {app.aiScreening?.score || '0'}%
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 flex-1">
                                                    <h5 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Key Strengths</h5>
                                                    <div className="space-y-2">
                                                        {app.aiScreening?.strengths.slice(0, 5).map((s: string, i: number) => (
                                                            <div key={i} className="flex gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                                                <span className="text-xs font-bold text-on-surface">{s}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => updateApplicantStatus(app._id, 'Accepted')}
                                                    className="w-full h-11 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
                                                >
                                                    Hire This Candidate
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            
        </ProtectedRoute>
    );
};

export default ApplicantsViewPage;
