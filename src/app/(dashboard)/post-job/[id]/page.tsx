'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import { JobForm } from "../JobForm";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const EditJobPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchJob = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/job/${id}`);
            if (response.data.success) {
                setJob(response.data.data);
            }
        } catch (error) {
            toast.error("Échec du chargement de l'offre.");
            router.push('/manage-jobs');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) {
            fetchJob();
        }
    }, [id, fetchJob]);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['employer']}>
                
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        <p className="text-xl font-bold text-gray-400">Chargement de l'offre...</p>
                    </div>
                
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['employer']}>
            
                <div className="pb-20">
                    <JobForm initialData={job} isEditing={true} />
                </div>
            
        </ProtectedRoute>
    );
};

export default EditJobPage;
