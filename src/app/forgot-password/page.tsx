'use client';

import { useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { AuthShell } from "@/components/ui/premium/AuthShell";
import { PremiumInput, PremiumButton } from "@/components/ui/premium/PremiumInput";
import { ArrowLeftIcon } from "@/components/ui/premium/AuthIcons";
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/auth/forgot-password', { email });
            if (response.data.success) {
                setSuccess(true);
                toast.success("Reset instructions sent!");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send reset instructions');
        } finally {
            setLoading(false);
        }
    };

    const visual = {
        metric: "Identity Secured",
        metricLabel: "Military-grade encryption for your credentials.",
        heading: "Secure your access.",
        copy: "We use advanced encryption protocols to ensure your account remains safe even during recovery.",
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

                    {!success ? (
                        <>
                            <div className="space-y-4">
                                <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                                    Forgot password?
                                </h1>
                                <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                                    No worries, we'll send you reset instructions.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                <PremiumInput
                                    label="Email address"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="pt-2">
                                    <PremiumButton type="submit" disabled={loading}>
                                        {loading ? "Sending..." : "Send reset link"}
                                    </PremiumButton>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-6 text-center lg:text-left py-8">
                            <div className="space-y-4">
                                <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                                    Check your email.
                                </h1>
                                <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                                    We've sent reset instructions to <span className="font-semibold text-primary">{email}</span>.
                                </p>
                            </div>

                            <div className="bg-primary-ghost rounded-[24px] px-4 py-4 text-sm text-text-soft leading-6 border border-primary/10">
                                Please check your spam folder if you don't see the email within a few minutes.
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <PremiumButton onClick={() => setSuccess(false)}>
                                    Resend email
                                </PremiumButton>
                                <Link href="/login" className="text-center w-full text-sm font-semibold text-text-soft hover:text-on-surface transition-colors">
                                    Return to sign in
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AuthShell>
    );
};

export default ForgotPassword;
