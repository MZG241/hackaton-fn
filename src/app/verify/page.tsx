'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
ArrowLeft,
    UserCheck, Loader2, AlertCircle,
} from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { AuthShell } from "@/components/ui/premium/AuthShell";

const VerifyContent = () => {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get('email');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [resendDisabled, setResendDisabled] = useState(true);

    useEffect(() => {
        if (!email) {
            toast.error('Missing verification information');
            router.replace('/signup');
        }
    }, [email, router]);

    useEffect(() => {
        if (resendDisabled && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setResendDisabled(false);
        }
    }, [resendDisabled, countdown]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 1) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                (document.getElementById(`digit-${index + 1}`) as HTMLInputElement)?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            (document.getElementById(`digit-${index - 1}`) as HTMLInputElement)?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain').trim();
        if (/^\d{6}$/.test(pasteData)) {
            const digits = pasteData.split('');
            setCode(digits);
            (document.getElementById('verify-button') as HTMLButtonElement)?.focus();
        }
    };

    const getRedirectPath = (role: string) => {
        const r = role?.toLowerCase();
        switch (r) {
            case 'admin': return '/admin-dashboard';
            case 'employer': return '/employer-dashboard';
            case 'jobseeker': return '/candidate-dashboard';
            default: return '/';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError('Please enter a complete 6-digit code');
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/auth/verify', {
                email,
                code: verificationCode
            });

            if (response.data.success) {
                const { user, token } = response.data.data; // Note: user and token are in data.data
                dispatch(setCredentials({ user, token }));
                setSuccess(true);
                toast.success('Email verified successfully!');
                setTimeout(() => {
                    router.push(getRedirectPath(user.role));
                }, 2000);
            }
        } catch (err) {
            setError('Invalid or expired code' + err);
            setCode(['', '', '', '', '', '']);
            (document.getElementById('digit-0') as HTMLInputElement)?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setResending(true);
            setError(null);
            setResendDisabled(true);
            setCountdown(60);
            const response = await axiosInstance.post('/api/auth/resend-verification', { email });
            if (response.data.success) {
                toast.success('New code sent!');
                setCode(['', '', '', '', '', '']);
                (document.getElementById('digit-0') as HTMLInputElement)?.focus();
            }
        } catch (err) {
            setError('Failed to send code.' + err);
        } finally {
            setResending(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-6 text-center lg:text-left py-8">
                <div className="space-y-4">
                    <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                        Account verified!
                    </h1>
                    <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                        Your account is now active. Redirecting to your dashboard...
                    </p>
                </div>

                <div className="bg-emerald-50/50 rounded-[24px] px-4 py-4 text-sm text-emerald-700 leading-6 border border-emerald-100 flex items-center gap-3">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Preparing your session...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="flex h-full flex-col justify-center overflow-y-auto rounded-panel bg-surface-strong px-5 py-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-lg space-y-6">
                <div className="flex items-center justify-start">
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-pill border border-outline-soft bg-white/88 px-3.5 py-2 text-sm font-medium text-on-surface shadow-[0_14px_30px_-18px_rgba(43,52,55,0.22)] backdrop-blur-xl transition-colors duration-300 ease-auth hover:border-primary/20 hover:bg-primary-ghost hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to signup</span>
                    </Link>
                </div>

                <div className="space-y-4">
                    <h1 className="font-display text-[1.65rem] font-extrabold leading-tight text-on-surface lg:text-[2rem]">
                        Verify your email.
                    </h1>
                    <p className="max-w-lg text-[0.95rem] leading-6 text-text-soft">
                        We&apos;ve sent a 6-digit code to <span className="font-semibold text-primary">{email}</span>.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm font-medium">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                    <div className="flex justify-between gap-2 sm:gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`digit-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                autoFocus={index === 0}
                                className="w-full aspect-square text-center text-2xl font-bold border border-outline-soft bg-white rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <button
                            id="verify-button"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white rounded-xl hover:bg-primary-dim shadow-lg shadow-primary/20 transition-all font-semibold text-base disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-5 w-5" />
                                    Verify account
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-text-soft font-medium">
                                Didn&apos;t receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resending || resendDisabled}
                                    className={`font-semibold ml-1 transition-colors ${resending || resendDisabled ? 'text-text-faint' : 'text-primary hover:text-primary-dim'}`}
                                >
                                    {resending ? 'Sending...' :
                                        resendDisabled ? `Resend in ${countdown}s` :
                                            'Resend code'}
                                </button>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
};

const Verify = () => {
    const visual = {
        metric: "Identity Verification",
        metricLabel: "Authorized access only.",
        heading: "Secure your presence.",
        copy: "One final step to ensure your account security and verify your digital signature in the Akazi ecosystem.",
        image: "/log2.jpg"
    };

    return (
        <AuthShell visual={visual}>
            <Suspense fallback={<div className="flex h-full items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
                <VerifyContent />
            </Suspense>
        </AuthShell>
    );
};

export default Verify;
