'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Briefcase, MapPin, DollarSign, Calendar,
    ArrowLeft, ChevronDown, ChevronUp,
    Building2, Globe, BookOpen, X,
    Eye, Edit, Trash2, Loader2, Link as LinkIcon
} from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';

import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { AdminJobForm } from '@/components/admin/AdminJobForm';
import { AdminJobDetails } from '@/components/admin/AdminJobDetails';
import Link from 'next/link';
import Image from 'next/image';

const JobsByCompanyPage = () => {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [jobs, setJobs] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [showJobDetails, setShowJobDetails] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const fetchCompanyJobs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/admin/jobs/company/${id}`);

            if (response.data.success) {
                const jobsData = response.data.data || [];
                setJobs(jobsData);

                if (jobsData.length > 0 && jobsData[0].postedBy) {
                    setCompany(jobsData[0].postedBy);
                } else {
                    const companyResponse = await axiosInstance.get(`/api/user/${id}`);
                    if (companyResponse.data.success) {
                        setCompany(companyResponse.data.data);
                    }
                }
            }
        } catch (error) {
            toast.error("Erreur lors du chargement des offres de l'entreprise.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCompanyJobs();
    }, [fetchCompanyJobs]);

    const handleDelete = async (jobId: string) => {
        if (window.confirm('Supprimer cette offre ?')) {
            try {
                await axiosInstance.delete(`/api/admin/jobs/${jobId}`);
                setJobs(jobs.filter(j => j._id !== jobId));
                toast.success("Offre supprimée.");
                setShowJobDetails(false);
            } catch (error) {
                toast.error("Erreur de suppression.");
            }
        }
    };

    const toggleJobStatus = async (job: any) => {
        try {
            await axiosInstance.patch(`/api/admin/jobs/${job._id}/status`, {
                isClosed: !job.isClosed
            });
            setJobs(jobs.map(j =>
                j._id === job._id ? { ...j, isClosed: !job.isClosed } : j
            ));
            toast.success(`Offre ${!job.isClosed ? 'fermée' : 'réouverte'}.`);
        } catch (error) {
            toast.error("Erreur de mise à jour.");
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            
                <div className="max-w-6xl mx-auto space-y-12 pb-20">
                    {/* Navigation Back */}
                    <Link
                        href="/admin/employers"
                        className="inline-flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all group"
                    >
                        <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        Retour à l'annuaire employeurs
                    </Link>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-6">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Chargement du profil entreprise...</p>
                        </div>
                    ) : (
                        <>
                            {/* Company Detail Header */}
                            {company && (
                                <div className="bg-white rounded-2xl border-2 border-gray-50 shadow-sm p-8 md:p-16">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="h-40 w-40 rounded-2xl bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0 ring-4 ring-gray-50">
                                            {company.companyLogo ? (
                                                <Image src={company.companyLogo} alt="" width={160} height={160} unoptimized className="h-full w-full object-cover" />
                                            ) : (
                                                <Building2 className="h-16 w-16 text-gray-200" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-8">
                                            <div className="space-y-4">
                                                <h1 className="text-3xl font-bold text-gray-900 tracking-tighter uppercase">{company.companyName}</h1>
                                                <div className="flex flex-wrap gap-4">
                                                    {company.location && (
                                                        <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            <MapPin className="h-3 w-3 text-red-500" /> {company.location}
                                                        </span>
                                                    )}
                                                    {company.website && (
                                                        <a href={company.website} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                                            <Globe className="h-3 w-3" /> Site Web
                                                        </a>
                                                    )}
                                                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                        <Briefcase className="h-3 w-3" /> {jobs.length} Offres
                                                    </span>
                                                </div>
                                            </div>

                                            {company.companyDescription && (
                                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        <BookOpen className="h-3 w-3" /> À propos de l'entreprise
                                                    </h3>
                                                    <div className={`text-gray-600 font-bold leading-relaxed ${!expanded && "line-clamp-3"}`}>
                                                        {company.companyDescription}
                                                    </div>
                                                    {company.companyDescription.length > 200 && (
                                                        <button
                                                            onClick={() => setExpanded(!expanded)}
                                                            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:translate-x-2 transition-transform"
                                                        >
                                                            {expanded ? "Réduire ↑" : "Lire la suite →"}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Jobs Grid */}
                            <div className="space-y-8">
                                <div className="flex justify-between items-center px-4">
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Offres en cours</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{jobs.length} Résultats disponibles</p>
                                </div>

                                {jobs.length === 0 ? (
                                    <div className="bg-white rounded-2xl border-2 border-gray-50 p-20 text-center animate-pulse">
                                        <Briefcase className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                                        <p className="text-gray-300 font-bold uppercase tracking-widest">Aucune offre publiée par cette entreprise</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {jobs.map((job) => (
                                            <motion.div
                                                key={job._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white rounded-2xl border-2 border-gray-50 p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
                                            >
                                                <div className="space-y-8">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-4">
                                                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight uppercase group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                <MapPin className="h-3 w-3 text-red-500" /> {job.location || "Remote"}
                                                            </div>
                                                        </div>
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 ${job.isClosed
                                                                ? "bg-red-50 text-red-600 border-red-100"
                                                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            }`}>
                                                            {job.isClosed ? "Fermée" : "Active"}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4">
                                                        <span className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            {job.type}
                                                        </span>
                                                        {job.salaryMin && (
                                                            <span className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                                <DollarSign className="h-3 w-3 inline mr-1" /> {job.salaryMin} - {job.salaryMax}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedJob(job);
                                                                setShowJobDetails(true);
                                                            }}
                                                            className="p-4 bg-white border-2 border-gray-50 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showJobDetails && selectedJob && (
                        <AdminJobDetails
                            isOpen={showJobDetails}
                            job={selectedJob}
                            onClose={() => setShowJobDetails(false)}
                            onEdit={() => {
                                setShowJobDetails(false);
                                setShowEditForm(true);
                            }}
                            onDelete={() => handleDelete(selectedJob._id)}
                            onToggleStatus={() => toggleJobStatus(selectedJob)}
                        />
                    )}

                    {showEditForm && selectedJob && (
                        <AdminJobForm
                            isOpen={showEditForm}
                            job={selectedJob}
                            onClose={() => setShowEditForm(false)}
                            onSuccess={() => {
                                setShowEditForm(false);
                                fetchCompanyJobs();
                            }}
                        />
                    )}
                </AnimatePresence>
            
        </ProtectedRoute>
    );
};

export default JobsByCompanyPage;
