'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";

import { toast } from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { IUser } from "@/types";

const CompanyProfilePage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState<{
        fullname: string;
        email: string;
        location: string;
        companyName: string;
        companyDescription: string;
        profileImage: string;
        companyLogo: string;
        companyPhone: string;
        companyLocation: string;
    }>({
        fullname: "",
        email: "",
        location: "",
        companyName: "",
        companyDescription: "",
        profileImage: "",
        companyLogo: "",
        companyPhone: "",
        companyLocation: ""
    });

    const [previews, setPreviews] = useState({
        profileImage: "",
        companyLogo: ""
    });

    const [files, setFiles] = useState({
        profileImage: null as File | null,
        companyLogo: null as File | null
    });

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/auth/profile');
            if (response.data.success) {
                const data = response.data.data;
                setProfileData({
                    fullname: data.fullname || "",
                    email: data.email || "",
                    location: data.location || "",
                    companyName: data.companyName || "",
                    companyDescription: data.companyDescription || "",
                    profileImage: data.profileImage || "",
                    companyLogo: data.companyLogo || "",
                    companyPhone: data.companyPhone || "",
                    companyLocation: data.companyLocation || ""
                });
                setPreviews({
                    profileImage: data.profileImage || "",
                    companyLogo: data.companyLogo || ""
                });
            }
        } catch (error) {
            toast.error("Failed to load profile intelligence." + error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: fileList } = e.target;
        const file = fileList?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File exceeds 5MB tactical limit.");
                return;
            }

            setFiles(prev => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => ({ ...prev, [name]: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append("fullname", profileData.fullname);
            formData.append("email", profileData.email);
            formData.append("location", profileData.location);
            formData.append("companyName", profileData.companyName);
            formData.append("companyDescription", profileData.companyDescription);
            formData.append("companyPhone", profileData.companyPhone);
            formData.append("companyLocation", profileData.companyLocation);

            if (files.profileImage) formData.append("profileImage", files.profileImage);
            if (files.companyLogo) formData.append("companyLogo", files.companyLogo);

            const response = await axiosInstance.patch('/api/auth/edit/profile', formData);

            if (response.data.success) {
                toast.success("Profile records synchronized.");

                const updatedUser = {
                    ...user,
                    ...response.data.data,
                    profileImage: response.data.data.profileImage || user?.profileImage,
                    companyLogo: response.data.data.companyLogo || user?.companyLogo
                } as IUser;
                dispatch(setCredentials({ user: updatedUser, token: localStorage.getItem('token') || '' }));

                setIsEditing(false);
                setFiles({ profileImage: null, companyLogo: null });
            }
        } catch (error) {
            toast.error("Sync operation failed." + error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employer']}>
            
                <div className="max-w-[1400px] mx-auto space-y-12 pb-24 px-4">
                    {/* Hero Header */}
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                                <span className="material-symbols-outlined text-primary text-sm">business_center</span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Enterprise Identity</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter font-headline leading-none">Corporate <span className="text-primary">DNA</span>.</h1>
                            <p className="text-on-surface-variant text-lg font-bold max-w-xl">Manage your brand intelligence and global contact parameters.</p>
                        </div>
                        
                        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4">
                             {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full xl:w-auto bg-on-surface text-on-primary-container px-10 py-5 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:-translate-y-1 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">edit_note</span>
                                    Modify Integrity
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setIsEditing(false); fetchProfile(); }}
                                        className="w-full xl:w-auto bg-surface-container-high text-on-surface-variant px-10 py-5 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-error hover:text-white transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full xl:w-auto bg-primary text-on-primary px-10 py-5 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:-translate-y-1 transition-all disabled:opacity-50"
                                    >
                                        {saving ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">save</span>}
                                        Synchronize
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-10">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-4xl animate-pulse">fingerprint</span>
                            </div>
                            <p className="text-on-surface-variant font-black uppercase tracking-[0.3em] font-headline text-xs">Accessing Identity Records...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            {/* Visual Calibration Column */}
                            <div className="xl:col-span-4 space-y-10">
                                {/* Recruiter Mesh */}
                                <div className="bg-surface-container-lowest p-10 rounded-4xl border border-outline-variant/10 flex flex-col items-center text-center space-y-8 group relative overflow-hidden">
                                     <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                     <div className="relative">
                                        <div className="w-48 h-48 rounded-[3rem] bg-surface-container-high border-8 border-surface-container-lowest shadow-none ring-1 ring-outline-variant/10 overflow-hidden transition-all duration-700 group-hover:rounded-full group-hover:scale-105 relative flex items-center justify-center">
                                            {previews.profileImage ? (
                                                <Image src={previews.profileImage} fill alt="" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-on-surface-variant/20 bg-primary/5">
                                                    <span className="text-6xl font-black text-primary/20 uppercase">
                                                        {profileData.fullname?.charAt(0) || 'R'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-primary text-on-primary rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-none">
                                                <span className="material-symbols-outlined">add_a_photo</span>
                                                <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        )}
                                     </div>
                                     <div className="space-y-2 relative z-10">
                                        <p className="text-2xl font-black text-on-surface uppercase tracking-tight font-headline">{profileData.fullname || 'Recruiter Delta'}</p>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Recruitment Operations Lead</p>
                                     </div>
                                </div>

                                {/* Enterprise Core Logo */}
                                <div className="bg-surface-container-lowest p-10 rounded-4xl border border-outline-variant/10 flex flex-col items-center text-center space-y-8 group relative">
                                     <div className="relative">
                                        <div className="w-48 h-48 rounded-4xl bg-surface-container-high border-8 border-surface-container-lowest ring-1 ring-outline-variant/10 flex items-center justify-center p-8 active:scale-95 transition-transform duration-500 relative">
                                            {previews.companyLogo ? (
                                                <Image src={previews.companyLogo} fill alt="" className="object-contain transition-all duration-500 group-hover:scale-110 p-8" />
                                            ) : (
                                                <span className="text-6xl font-black text-on-surface-variant/20 uppercase">{profileData.companyName?.charAt(0) || 'D'}</span>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-on-surface text-on-primary-container rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                                                <span className="material-symbols-outlined">upload_file</span>
                                                <input type="file" name="companyLogo" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        )}
                                     </div>
                                     <p className="text-xl font-black text-on-surface-variant uppercase tracking-tighter font-headline">{profileData.companyName || "Unassigned Entity"}</p>
                                </div>
                            </div>

                            {/* Tactical Data Column */}
                            <div className="xl:col-span-8 space-y-10">
                                <section className="bg-surface-container-lowest p-10 md:p-16 rounded-4xl border border-outline-variant/10 space-y-16">
                                    <div className="flex-1 lg:grow min-w-0 pr-4">
                                        <div className="w-1.5 h-10 bg-primary rounded-full"></div>
                                        <h3 className="text-3xl font-black text-on-surface tracking-tighter uppercase font-headline">Operational Profile</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Contact Node</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={profileData.fullname}
                                                onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                                                className="w-full px-8 py-6 bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold text-on-surface transition-all disabled:opacity-30 placeholder:opacity-20"
                                                placeholder="e.g. Jean Dupont"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Nexus Email</label>
                                            <input
                                                type="email"
                                                disabled={!isEditing}
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-8 py-6 bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold text-on-surface transition-all disabled:opacity-30"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Geographic HQ</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={profileData.companyLocation}
                                                onChange={(e) => setProfileData({ ...profileData, companyLocation: e.target.value })}
                                                className="w-full px-8 py-6 bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold text-on-surface transition-all disabled:opacity-30"
                                                placeholder="e.g. Paris, France"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Entity Phone</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={profileData.companyPhone}
                                                onChange={(e) => setProfileData({ ...profileData, companyPhone: e.target.value })}
                                                className="w-full px-8 py-6 bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold text-on-surface transition-all disabled:opacity-30"
                                                placeholder="e.g. +33 1 23 45 67 89"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Entity Title</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={profileData.companyName}
                                                onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                                                className="w-full px-8 py-6 bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold text-on-surface transition-all disabled:opacity-30"
                                                placeholder="e.g. Tech Solutions Inc"
                                            />
                                        </div>
                                         <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Mission Statement / Description</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={profileData.companyDescription}
                                                    onChange={(e) => setProfileData({ ...profileData, companyDescription: e.target.value })}
                                                    rows={8}
                                                    className="w-full px-8 py-8 bg-surface-container-low border-none rounded-4xl focus:ring-4 focus:ring-primary/10 font-bold text-on-surface transition-all leading-relaxed resize-none min-h-[200px]"
                                                    placeholder="Present your enterprise mission to the candidate ecosystem..."
                                                />
                                            ) : (
                                                <div className="w-full px-8 py-8 bg-surface-container-low border-none rounded-4xl font-bold text-on-surface whitespace-pre-wrap leading-relaxed min-h-[150px]">
                                                    {profileData.companyDescription || "No mission statement provided."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-on-surface p-10 md:p-16 rounded-4xl text-on-primary-container space-y-12 relative overflow-hidden group">
                                    <div className="flex items-center gap-6 relative z-10">
                                        <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-125 transition-transform duration-700">security</span>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter font-headline">Account Cryptography</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        <div className="p-10 bg-white/5 rounded-4xl border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                                            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Clearance Level</p>
                                            <p className="text-xl font-black uppercase tracking-tighter font-headline">Verified Employer</p>
                                        </div>
                                        <div className="p-10 bg-white/5 rounded-4xl border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                                            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Activation Timestamp</p>
                                            <p className="text-xl font-black uppercase tracking-tighter font-headline">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[20rem] text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">verified_user</span>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            
        </ProtectedRoute>
    );
};

export default CompanyProfilePage;

