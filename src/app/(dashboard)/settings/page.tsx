'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axiosInstance';

import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CustomIcon from '@/components/ui/CustomIcon';

const SettingsPage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security'>('profile');

    // Security Flow State
    const [securityStep, setSecurityStep] = useState<'idle' | 'email-request' | 'email-confirm-old' | 'email-verify-new' | 'password'>('idle');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        newEmail: '',
        code: ''
    });

    // File State
    const profileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bioRef = useRef<HTMLTextAreaElement>(null);
    const companyDescRef = useRef<HTMLTextAreaElement>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState({
        profile: user?.profileImage || '',
        logo: (user as any)?.companyLogo || ''
    });

    const [form, setForm] = useState({
        fullname: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        position: '',
        skills: [] as string[],
        companyName: '',
        companyDescription: '',
        companyPhone: '',
        companyLocation: '',
    });

    useEffect(() => {
        if (user) {
            setForm({
                fullname: user.fullname || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                location: (user as any).location || '',
                bio: (user as any).bio || '',
                position: (user as any).position || '',
                skills: (user as any).skills || [],
                companyName: (user as any).companyName || '',
                companyDescription: (user as any).companyDescription || '',
                companyPhone: (user as any).companyPhone || '',
                companyLocation: (user as any).companyLocation || '',
            });
            setPreviews({
                profile: user.profileImage || '',
                logo: (user as any).companyLogo || ''
            });
        }
    }, [user]);

    // Auto-resize for Bio
    useEffect(() => {
        if (bioRef.current) {
            bioRef.current.style.height = 'auto';
            bioRef.current.style.height = `${bioRef.current.scrollHeight}px`;
        }
    }, [form.bio, activeTab]);

    // Auto-resize for Company Description
    useEffect(() => {
        if (companyDescRef.current) {
            companyDescRef.current.style.height = 'auto';
            companyDescRef.current.style.height = `${companyDescRef.current.scrollHeight}px`;
        }
    }, [form.companyDescription, activeTab]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'profile') setProfileFile(file);
            else setLogoFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();
            
            // Add all form fields
            Object.entries(form).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            });

            // Add files if changed
            if (profileFile) formData.append('profileImage', profileFile);
            if (logoFile) formData.append('companyLogo', logoFile);

            const response = await axiosInstance.patch('/api/auth/edit/profile', formData);

            if (response.data.success) {
                dispatch(updateUser(response.data.data));
                toast.success('Profile updated successfully!');
                setProfileFile(null);
                setLogoFile(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleSecurityUpdate = async (type: 'email' | 'password' | 'confirm-old' | 'verify-new') => {
        try {
            setSecurityLoading(true);
            let endpoint = '';
            let payload: any = {};

            if (type === 'password') {
                if (securityData.newPassword !== securityData.confirmPassword) {
                    toast.error("Passwords don't match");
                    return;
                }
                endpoint = '/api/auth/change-password';
                payload = { 
                    currentPassword: securityData.currentPassword, 
                    newPassword: securityData.newPassword 
                };
            } else if (type === 'email') {
                endpoint = '/api/auth/request-email-change';
                payload = { 
                    newEmail: securityData.newEmail, 
                    password: securityData.currentPassword 
                };
            } else if (type === 'confirm-old') {
                endpoint = '/api/auth/confirm-email-old';
                payload = { code: securityData.code };
            } else if (type === 'verify-new') {
                endpoint = '/api/auth/verify-email-new';
                payload = { code: securityData.code };
            }

            const method = type === 'password' ? 'patch' : 'post';
            const res = await (axiosInstance[method] as any)(endpoint, payload);

            if (res.data.success) {
                toast.success(res.data.message);
                if (type === 'password') {
                    setSecurityStep('idle');
                    setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
                } else if (type === 'email') {
                    setSecurityStep('email-confirm-old');
                    setSecurityData({ ...securityData, code: '' });
                } else if (type === 'confirm-old') {
                    setSecurityStep('email-verify-new');
                    setSecurityData({ ...securityData, code: '' });
                } else if (type === 'verify-new') {
                    setSecurityStep('idle');
                    if (res.data.data?.email) {
                        setForm({ ...form, email: res.data.data.email });
                    }
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Security update failed');
        } finally {
            setSecurityLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'profile' },
        ...(user?.role === 'employer' ? [{ id: 'company', label: 'Company', icon: 'building' }] : []),
        { id: 'security', label: 'Security', icon: 'lock' },
    ] as const;

    const inputClass = "w-full h-12 bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 text-sm font-bold text-on-surface focus:border-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/30";

    return (
        <ProtectedRoute>
            
                <div className="max-w-[900px] mx-auto space-y-8 pb-24">
                    {/* Header */}
                    <div className="flex items-center gap-5 border-b border-outline-variant/10 pb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <CustomIcon name="setting-2" size={22} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-on-surface tracking-tighter font-headline uppercase">
                                Neural <span className="text-primary">Parameters.</span>
                            </h1>
                            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Account configuration & identity management</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                                        : 'text-on-surface-variant/50 hover:text-primary hover:bg-primary/5'
                                }`}
                            >
                                <CustomIcon name={tab.icon} size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] border border-outline-variant/10 p-10 space-y-8 shadow-sm"
                    >
                        {activeTab === 'profile' && (
                            <>
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-outline-variant/10">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-surface-container-low">
                                            {previews.profile ? (
                                                <Image src={previews.profile} alt="Profile" width={128} height={128} unoptimized className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/40">
                                                    <CustomIcon name="profile" size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => profileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-white"
                                        >
                                            <CustomIcon name="camera" size={16} />
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={profileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileChange(e, 'profile')} 
                                        />
                                    </div>
                                    <div className="text-center md:text-left space-y-1">
                                        <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Identity <span className="text-primary text-sm">Visual.</span></h3>
                                        <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">JPG, PNG or AVIF. Max 5MB.</p>
                                    </div>
                                </div>

                                {user?.role !== 'jobseeker' && (
                                    <>
                                        <h2 className="text-lg font-black text-on-surface uppercase tracking-tight font-headline">Personal Information</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Full Name</label>
                                                <input className={inputClass} value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})} placeholder="Your full name" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Email</label>
                                                <input className={`${inputClass} opacity-60 cursor-not-allowed`} value={form.email} readOnly />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Phone</label>
                                                <input className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+243 xxx xxx xxx" />
                                            </div>
                                            {user?.role !== 'employer' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Location</label>
                                                    <input className={inputClass} value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, Country" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Bio / About</label>
                                            <textarea
                                                ref={bioRef}
                                                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold text-on-surface focus:border-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/30 resize-none overflow-hidden min-h-[120px]"
                                                value={form.bio}
                                                onChange={e => setForm({...form, bio: e.target.value})}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === 'company' && (
                            <>
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-outline-variant/10">
                                    <div className="relative group">
                                        <div className="w-48 h-32 rounded-2xl overflow-hidden border-4 border-primary/20 bg-surface-container-low">
                                            {previews.logo ? (
                                                <Image src={previews.logo} alt="Company Logo" width={192} height={128} unoptimized className="w-full h-full object-contain p-4" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/40">
                                                    <CustomIcon name="building" size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => logoInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-white"
                                        >
                                            <CustomIcon name="camera" size={16} />
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={logoInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileChange(e, 'logo')} 
                                        />
                                    </div>
                                    <div className="text-center md:text-left space-y-1">
                                        <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Corporate <span className="text-primary text-sm">Branding.</span></h3>
                                        <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Logo Picker. PNG or SVG recommended.</p>
                                    </div>
                                </div>

                                <h2 className="text-lg font-black text-on-surface uppercase tracking-tight font-headline">Company Identity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Company Name</label>
                                        <input className={inputClass} value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="Acme Corp." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Company Phone</label>
                                        <input className={inputClass} value={form.companyPhone} onChange={e => setForm({...form, companyPhone: e.target.value})} placeholder="+243 xxx xxx xxx" />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Headquarters / Location</label>
                                        <input className={inputClass} value={form.companyLocation} onChange={e => setForm({...form, companyLocation: e.target.value})} placeholder="Full address..." />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Company Description</label>
                                         <textarea
                                            ref={companyDescRef}
                                            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold text-on-surface focus:border-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/30 resize-none overflow-hidden min-h-[150px]"
                                            value={form.companyDescription}
                                            onChange={e => setForm({...form, companyDescription: e.target.value})}
                                            placeholder="Describe your company culture and mission..."
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-10">
                                {/* Section Header */}
                                <div className="space-y-2">
                                    <h2 className="text-lg font-black text-on-surface uppercase tracking-tight font-headline">Security Protocol</h2>
                                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-relaxed">Manage your authentication matrix and communication channels.</p>
                                </div>

                                {/* Flow Content */}
                                <AnimatePresence mode="wait">
                                    {securityStep === 'idle' ? (
                                        <motion.div 
                                            key="idle"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <button 
                                                onClick={() => setSecurityStep('email-request')}
                                                className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[32px] text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                                                    <CustomIcon name="sms" size={20} />
                                                </div>
                                                <p className="font-black text-sm text-on-surface uppercase tracking-tight">Identity Email</p>
                                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">Update your communication node</p>
                                            </button>

                                            <button 
                                                onClick={() => setSecurityStep('password')}
                                                className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[32px] text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform">
                                                    <CustomIcon name="lock" size={20} />
                                                </div>
                                                <p className="font-black text-sm text-on-surface uppercase tracking-tight">Access Matrix</p>
                                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">Rotate your security credentials</p>
                                            </button>
                                        </motion.div>
                                    ) : securityStep === 'password' ? (
                                        <motion.div 
                                            key="password"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6 max-w-md"
                                        >
                                            <div className="flex items-center gap-4 mb-2">
                                                <button onClick={() => setSecurityStep('idle')} className="text-on-surface-variant hover:text-primary transition-colors">
                                                    <CustomIcon name="arrow-left" size={18} />
                                                </button>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Password Rotation</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Current Password</label>
                                                    <input type="password" className={inputClass} value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">New Password</label>
                                                    <input type="password" className={inputClass} value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Confirm New Password</label>
                                                    <input type="password" className={inputClass} value={securityData.confirmPassword} onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                                                </div>
                                                <button 
                                                    disabled={securityLoading}
                                                    onClick={() => handleSecurityUpdate('password')}
                                                    className="w-full h-12 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {securityLoading ? 'Processing...' : 'Apply New Credentials'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : securityStep === 'email-request' ? (
                                        <motion.div 
                                            key="email-request"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6 max-w-md"
                                        >
                                            <div className="flex items-center gap-4 mb-2">
                                                <button onClick={() => setSecurityStep('idle')} className="text-on-surface-variant hover:text-primary transition-colors">
                                                    <CustomIcon name="arrow-left" size={18} />
                                                </button>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Identity Change Request</h3>
                                            </div>
                                            <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl mb-6">
                                                <p className="text-[11px] font-bold text-primary/80 leading-relaxed uppercase tracking-tighter">
                                                    Step 1/3: Provide your new endpoint and confirm with your current matrix password.
                                                </p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">New Email Address</label>
                                                    <input type="email" className={inputClass} value={securityData.newEmail} onChange={e => setSecurityData({...securityData, newEmail: e.target.value})} placeholder="new.node@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Verify Identity (Password)</label>
                                                    <input type="password" className={inputClass} value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                                                </div>
                                                <button 
                                                    disabled={securityLoading}
                                                    onClick={() => handleSecurityUpdate('email')}
                                                    className="w-full h-12 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {securityLoading ? 'Initiating...' : 'Send Confirmation to current email'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (securityStep === 'email-confirm-old' || securityStep === 'email-verify-new') && (
                                        <motion.div 
                                            key="code-entry"
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-6 max-w-md"
                                        >
                                            <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                                                {securityStep === 'email-confirm-old' ? 'Phase 2: Origin Confirmation' : 'Phase 3: Destination Verification'}
                                            </h3>
                                            <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest leading-relaxed">
                                                Enter the 6-digit binary code sent to your <span className="text-primary">{securityStep === 'email-confirm-old' ? 'CURRENT' : 'NEW'}</span> email.
                                            </p>
                                            <div className="space-y-4">
                                                <input 
                                                    className={`${inputClass} text-center text-2xl tracking-[12px] h-20 placeholder:tracking-normal placeholder:text-sm`} 
                                                    value={securityData.code} 
                                                    maxLength={6}
                                                    onChange={e => setSecurityData({...securityData, code: e.target.value})} 
                                                    placeholder="000000" 
                                                />
                                                <button 
                                                    disabled={securityLoading || securityData.code.length !== 6}
                                                    onClick={() => handleSecurityUpdate(securityStep === 'email-confirm-old' ? 'confirm-old' : 'verify-new')}
                                                    className="w-full h-12 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {securityLoading ? 'Validating...' : 'Verify Protocol Code'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {activeTab !== 'security' && (
                            <div className="flex justify-end pt-4 border-t border-outline-variant/10">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="h-12 px-8 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CustomIcon name="tick-square" size={16} />
                                    )}
                                    {saving ? 'Saving...' : 'Save Parameters'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            
        </ProtectedRoute>
    );
};

export default SettingsPage;

