'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import axiosInstance from "@/lib/axiosInstance";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

import { AuthShell } from "@/components/ui/premium/AuthShell";
import { PremiumInput, PremiumButton } from "@/components/ui/premium/PremiumInput";
import { GoogleIcon} from "@/components/ui/premium/AuthIcons";

const Login = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            const path = getRedirectPath(user.role);
            console.log("[LOGIN] Redirecting to:", path);
            router.replace(path);
        }
    }, [isAuthenticated, user, router]);

    const getRedirectPath = (role: string) => {
        const r = role?.toLowerCase();
        switch (r) {
            case 'admin': return '/admin-dashboard';
            case 'employer': return '/employer-dashboard';
            case 'jobseeker': return '/candidate-dashboard';
            default: return '/';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosInstance.post("/api/auth/login", {
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe
            });

            const { token, user: userData } = data.data;

            if (token) {
                dispatch(setCredentials({ user: userData, token }));
                toast.success(data.message || "Login successful!");
                router.push(getRedirectPath(userData.role));
            }
        } catch (error) {
            const errorMessage = "Login failed. Please try again." + error;
            toast.error(errorMessage);
        } finally {
            setLoading(true);
            setLoading(false);
        }
    };

    if (isAuthenticated) return (
        <div className="flex h-screen w-full items-center justify-center bg-surface-strong">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-text-soft">Redirecting to your dashboard...</p>
            </div>
        </div>
    );

    const visual = {
        metric: "98.2%",
        metricLabel: "AI-powered matching precision.",
        heading: "Propel your career with strategic AI.",
        copy: "A modern approach to recruitment, connecting top talent with the most ambitious missions.",
        image: "/log2.jpg"
    };

    return (
        <AuthShell visual={visual}>
            <section className="flex h-full flex-col justify-center overflow-y-auto rounded-panel bg-surface-strong px-5 py-6 lg:px-8 lg:py-7">
                <div className="mx-auto w-full max-w-lg space-y-6">
                    <div className="space-y-4">
                        <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                            Welcome back.
                        </h1>
                        <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                            Sign in to continue your journey in the Akazi ecosystem.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <PremiumInput
                            label="Email address"
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <PremiumInput
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />

                        <div className="flex justify-end p-1">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary transition-colors duration-300 ease-auth hover:text-primary-dim"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <PremiumButton type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </PremiumButton>
                    </form>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-px flex-1 bg-outline-soft"></span>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-text-faint">Or continue with</span>
                            <span className="h-px flex-1 bg-outline-soft"></span>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="button"
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-field border border-outline-soft bg-surface-strong px-4 text-sm font-medium text-on-surface transition-all duration-300 ease-auth hover:border-primary/15 hover:bg-surface-soft"
                            >
                                <GoogleIcon />
                                Google
                            </button>
                        </div>

                        <div className="text-center text-sm text-text-soft">
                            Don&apos;t have an account?
                            <Link
                                href="/signup"
                                className="ml-1 font-semibold text-primary transition-colors duration-300 ease-auth hover:text-primary-dim"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </AuthShell>
    );
};

export default Login;
