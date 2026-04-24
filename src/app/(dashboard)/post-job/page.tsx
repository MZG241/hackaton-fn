'use client';


import ProtectedRoute from "@/components/ProtectedRoute";
import { JobForm } from "./JobForm";

const PostJobPage = () => {
    return (
        <ProtectedRoute allowedRoles={['employer']}>
            
                <div className="pb-20">
                    <JobForm />
                </div>
            
        </ProtectedRoute>
    );
};

export default PostJobPage;

