'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { AuthShell } from "@/components/ui/premium/AuthShell";
import { PremiumInput, PremiumButton } from "@/components/ui/premium/PremiumInput";
import { ArrowLeftIcon } from "@/components/ui/premium/AuthIcons";
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post(`/api/auth/reset-password/${token}`, {
                password: formData.password
            });

            if (response.data.success) {
                setSuccess(true);
                toast.success('Password reset successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'The reset link is invalid or expired');
        } finally {
            setLoading(false);
        }
    };

    const visual = {
        metric: "Password Strength",
        metricLabel: "Advanced entropy checks for maximum security.",
        heading: "Secure your account.",
        copy: "Create a password that combines complexity and memorability to protect your Akazi dashboard.",
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
                                    Set new password.
                                </h1>
                                <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                                    Your new password must be different from previous ones.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                <PremiumInput
                                    label="New password"
                                    type="password"
                                    name="password"
                                    placeholder="At least 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <PremiumInput
                                    label="Confirm new password"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Type it again"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="pt-2">
                                    <PremiumButton type="submit" disabled={loading}>
                                        {loading ? "Resetting..." : "Reset password"}
                                    </PremiumButton>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-6 text-center lg:text-left py-8">
                            <div className="space-y-4">
                                <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                                    Password reset!
                                </h1>
                                <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                                    Your password has been successfully updated.
                                </p>
                            </div>

                            <div className="bg-primary-ghost rounded-[24px] px-4 py-4 text-sm text-text-soft leading-6 border border-primary/10">
                                You will be redirected to the login page automatically.
                            </div>

                            <div className="pt-4">
                                <Link href="/login">
                                    <PremiumButton>
                                        Go to login now
                                    </PremiumButton>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AuthShell>
    );
};

export default ResetPassword;
