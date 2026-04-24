'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import axiosInstance from "@/lib/axiosInstance";
import { useAppSelector } from "@/store/hooks";

import { AuthShell } from "@/components/ui/premium/AuthShell";
import { PremiumInput, PremiumButton } from "@/components/ui/premium/PremiumInput";
import { RoleSelector } from "@/components/ui/premium/RoleSelector";
import { ArrowLeftIcon } from "@/components/ui/premium/AuthIcons";

const SignUp = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker' as 'jobseeker' | 'employer',
        terms: true // Default to true if design doesn't show a checkbox, but usually it's required
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            router.replace(getRedirectPath(user.role));
        }
    }, [isAuthenticated, user, router]);

    const getRedirectPath = (role: string) => {
        switch (role) {
            case 'admin': return '/admin-dashboard';
            case 'employer': return '/employer-dashboard';
            case 'jobseeker': return '/find-jobs';
            default: return '/';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const { data } = await axiosInstance.post("/api/auth/create-account", {
                fullname: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                terms: formData.terms
            });

            if (data.success) {
                toast.success(data.message || "Account created! Please verify your email.");
                router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) return null;

    const visual = {
        metric: "Smart Algorithm",
        metricLabel: "Optimized candidate matching workflows.",
        heading: "Join the recruitment revolution.",
        copy: "Create your profile today and connect with companies that value your strategic impact.",
        image: "/log2.jpg"
    };

    return (
        <AuthShell visual={visual}>
            <section className="flex h-full flex-col justify-center overflow-y-auto rounded-panel bg-surface-strong px-5 py-6 lg:px-8 lg:py-7">
                <div className="mx-auto w-full max-w-lg space-y-6">
                    <div className="flex items-center justify-start">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-pill border border-outline-soft bg-white/88 px-3.5 py-2 text-sm font-medium text-on-surface shadow-[0_14px_30px_-18px_rgba(43,52,55,0.22)] backdrop-blur-xl transition-colors duration-300 ease-auth hover:border-primary/20 hover:bg-primary-ghost hover:text-primary"
                        >
                            <ArrowLeftIcon />
                            <span>Back to login</span>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                            Register now.
                        </h1>
                        <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                            Join the Akazi ecosystem and enter a new dimension of AI recruitment.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <RoleSelector 
                            activeRole={formData.role} 
                            onChange={(role) => setFormData(prev => ({ ...prev, role }))} 
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <PremiumInput
                                label="First name"
                                name="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                            <PremiumInput
                                label="Last name"
                                name="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

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
                            placeholder="At least 8 characters"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />

                        <PremiumInput
                            label="Confirm password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Type it again"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                        />

                        <div className="pt-2">
                            <PremiumButton type="submit" disabled={loading}>
                                {loading ? "Creating account..." : "Create my account"}
                            </PremiumButton>
                        </div>
                    </form>

                    <div className="text-center text-sm text-text-soft">
                        Already have an account?
                        <Link
                            href="/login"
                            className="ml-1 font-semibold text-primary transition-colors duration-300 ease-auth hover:text-primary-dim"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>
        </AuthShell>
    );
};

export default SignUp;
