'use client';

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'employer' | 'jobseeker')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user?.role as any)) {
                // If the user's role is not in the allowed list, redirect to their role-specific home
                const dashboard = user?.role === 'admin' ? '/admin-dashboard' :
                    user?.role === 'employer' ? '/employer-dashboard' :
                        '/candidate-dashboard';
                router.push(dashboard);
            } else {
                const frame = requestAnimationFrame(() => {
                    setIsAuthorized(true);
                });
                return () => cancelAnimationFrame(frame);
            }
        }
    }, [isInitialized, isAuthenticated, user, allowedRoles, router]);

    if (!isInitialized || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-bold">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
