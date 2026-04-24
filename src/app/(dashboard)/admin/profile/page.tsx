'use client';

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { IUser } from "@/types";
import Image from "next/image";
import CustomIcon from "@/components/ui/CustomIcon";

const AdminProfilePage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        fullname: '',
        email: '',
        profileImage: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/auth/profile');
            if (response.data.success) {
                const userData = response.data.data;
                setProfileData({
                    fullname: userData.fullname || '',
                    email: userData.email || '',
                    profileImage: userData.profileImage || ''
                });
                setImagePreview(userData.profileImage || '');
            }
        } catch (error) {
            toast.error("Error retrieving administrative profile." + error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Payload exceeded limit (5MB max)");
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('fullname', profileData.fullname);
            formData.append('email', profileData.email);

            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            const response = await axiosInstance.patch('/api/auth/edit/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success("Profile sync complete.");
                const updatedUser = {
                    ...user,
                    ...response.data.data,
                    profileImage: response.data.data.profileImage || user?.profileImage
                } as IUser;
                dispatch(setCredentials({ user: updatedUser, token: localStorage.getItem('token') || '' }));
                setEditing(false);
            }
        } catch (error) {
            toast.error( "Sync failure." + error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['admin']}>
                
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-4xl animate-pulse">fingerprint</span>
                        </div>
                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] font-headline">Authenticating Session...</p>
                    </div>
                
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            
                <div className="max-w-[1400px] mx-auto space-y-16 pb-24">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-outline-variant/10 pb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                                <span className="w-12 h-[2px] bg-primary"></span>
                                Identity Management Protocol
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-6xl md:text-8xl font-black text-on-surface tracking-tighter font-headline leading-none uppercase">
                                    Root <span className="text-primary">Access</span>.
                                </h1>
                                <p className="text-xl text-on-surface-variant/40 font-medium max-w-2xl leading-relaxed">
                                    Manage your administrative architectural nodes and neural network permissions.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-on-surface text-on-primary rounded-2xl border border-outline-variant/10 shadow-xl">
                            <CustomIcon name="shield-tick" size={20} className="text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Super Administrator v1.0</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Side - Identity Card */}
                        <div className="lg:col-span-4 space-y-10">
                            <div className="bg-surface-container-lowest p-12 rounded-[3.5rem] border border-outline-variant/10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
                                
                                <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                                    <div className="relative group/avatar">
                                        <div className="w-56 h-56 rounded-4xl bg-surface-container-highest border border-outline-variant/10 overflow-hidden group-hover/avatar:scale-105 transition-transform duration-700 shadow-2xl">
                                            {imagePreview ? (
                                                <Image src={imagePreview} alt="" width={224} height={224} unoptimized className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20 bg-linear-to-br from-surface-container-low to-surface-container-high">
                                                    <CustomIcon name="profile" size={80} />
                                                </div>
                                            )}
                                        </div>
                                        {editing && (
                                            <label className="absolute -bottom-4 -right-4 w-16 h-16 bg-on-surface text-on-primary rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary transition-all border-4 border-surface-container-lowest shadow-2xl group">
                                                <CustomIcon name="camera" size={24} className="group-hover:scale-110 transition-transform" />
                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-black text-on-surface tracking-tighter uppercase font-headline">{profileData.fullname || 'Administrator'}</h2>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Active Node: {profileData.email}</p>
                                    </div>

                                    <div className="w-full pt-10 border-t border-outline-variant/10">
                                        {!editing ? (
                                            <button
                                                onClick={() => setEditing(true)}
                                                className="w-full py-4 bg-on-surface text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group/btn shadow-2xl shadow-black/20"
                                            >
                                                Edit Identity
                                                <CustomIcon name="edit-2" size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                            </button>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditing(false);
                                                        fetchProfile();
                                                    }}
                                                    className="w-14 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-black flex items-center justify-center hover:bg-error/10 hover:text-error transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                    className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <CustomIcon name="cloud-add" size={20} />}
                                                    Commit Changes
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-on-surface p-10 rounded-[3rem] border border-outline-variant/10 space-y-6 group">
                                <p className="text-[10px] font-black text-on-primary/30 uppercase tracking-[0.3em]">Access Permissions</p>
                                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/50 transition-all duration-500">
                                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                                        <CustomIcon name="lock" size={24} />
                                    </div>
                                    <div className="space-y-1 text-on-primary">
                                        <p className="font-black text-sm uppercase tracking-tight font-headline">Full System Authority</p>
                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">Root Protocol Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Configuration Forms */}
                        <div className="lg:col-span-8 space-y-10">
                            <section className="bg-surface-container-lowest p-12 rounded-[3.5rem] border border-outline-variant/10 space-y-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center border border-primary/10 shadow-sm">
                                        <CustomIcon name="personalcard" size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-on-surface tracking-tighter uppercase font-headline underline decoration-primary decoration-4 underline-offset-8">Account Parameters</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Legal Identity</label>
                                        <div className="relative group/field h-12">
                                            <CustomIcon name="profile" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/field:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                disabled={!editing}
                                                value={profileData.fullname}
                                                onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                                                className="w-full h-full pl-16 pr-8 bg-surface-container-low border border-transparent rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white font-black text-on-surface transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-inner"
                                                placeholder="Global admin name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Secure Broadcast Address</label>
                                        <div className="relative group/field h-12">
                                            <CustomIcon name="sms" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/field:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                disabled={!editing}
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full h-full pl-16 pr-8 bg-surface-container-low border border-transparent rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white font-black text-on-surface transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-inner"
                                                placeholder="admin@akazi.hq"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-surface-container-lowest p-12 rounded-[3.5rem] border border-info border-dashed space-y-10 group/security">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-info/5 text-info rounded-xl flex items-center justify-center border border-info/10 shadow-sm">
                                        <CustomIcon name="security-safe" size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-on-surface tracking-tighter uppercase font-headline">Security Protocols</h3>
                                </div>
                                
                                <div className="p-10 bg-white rounded-4xl border border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-10 group-hover/security:border-info/30 transition-all duration-700 shadow-sm">
                                    <div className="space-y-3 text-center md:text-left">
                                        <p className="text-2xl font-black text-on-surface uppercase tracking-tight font-headline">Credential Rotation</p>
                                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                                            Last Node Sync: 12 cycles ago
                                        </p>
                                    </div>
                                    <button className="px-8 py-4 bg-on-surface text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-info hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-black/20 group">
                                        Update Cypher
                                        <CustomIcon name="key" size={18} className="group-hover:rotate-45 transition-transform" />
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            
        </ProtectedRoute>
    );
};

export default AdminProfilePage;

