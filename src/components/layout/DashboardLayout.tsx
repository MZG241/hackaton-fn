'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import CustomIcon from '@/components/ui/CustomIcon';

const EMPLOYER_MENU = [
    { id: "employer-dashboard", name: "Dashboard", icon: "category", href: "/employer-dashboard" },
    { id: "manage-jobs", name: "Jobs", icon: "briefcase", href: "/manage-jobs" },
    { id: "candidates", name: "Candidates", icon: "profile-2user", href: "/admin/jobseekers" },
];

const ADMIN_MENU = [
    { id: "admin-dashboard", name: "Dashboard", icon: "category", href: "/admin-dashboard" },
    { id: "list-employers", name: "Recruiters", icon: "buildings", href: "/admin/employers" },
    { id: "list-jobseekers", name: "Candidates", icon: "profile-2user", href: "/admin/jobseekers" },
    { id: "jobs", name: "All Jobs", icon: "briefcase", href: "/admin/jobs" },
];

const CANDIDATE_MENU = [
    { id: "candidate-dashboard", name: "Dashboard", icon: "category", href: "/candidate-dashboard" },
    { id: "job-search", name: "Find Jobs", icon: "search-normal", href: "/find-jobs" },
    { id: "applications", name: "My Applications", icon: "task", href: "/applications" },
    { id: "profile", name: "Profile", icon: "user", href: "/profile" },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const DUMMY_NOTIFICATIONS = [
        { id: 1, title: 'Neural Match Found', desc: 'A candidate matches 98% of your React Dev job.', time: '2m ago', type: 'match' },
        { id: 2, title: 'Application Received', desc: 'Sarah Connor applied for your Cybersecurity role.', time: '1h ago', type: 'app' },
        { id: 3, title: 'CV Analysis Complete', desc: '300 new profiles synthesized into the Nexus.', time: '5h ago', type: 'system' }
    ];

    let menuItems = EMPLOYER_MENU;
    if (user?.role === 'admin') menuItems = ADMIN_MENU;
    if (user?.role === 'jobseeker') menuItems = CANDIDATE_MENU;

    const handleLogout = () => {
        dispatch(logout());
        router.push("/");
    };

    return (
        <div className="flex bg-surface-container-lowest font-body min-h-screen overflow-hidden selection:bg-primary/10 selection:text-primary">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-60 bg-primary z-50 border-r border-white/10">
                {/* Logo Section */}
                <div className="px-8 pt-10 pb-8 border-b border-white/10 mb-2">
                    <Link href="/" className="group flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-500 border border-white/20">
                                <CustomIcon name="vuesax" size={24} />
                             </div>
                             <span className="text-2xl font-black text-white tracking-normal font-headline leading-none uppercase">Akazi</span>
                        </div>
                    </Link>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative group border ${
                                    isActive
                                        ? "bg-white/10 text-white border-white/20 shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
                                }`}
                            >
                                <CustomIcon 
                                    name={item.icon} 
                                    size={20} 
                                    className={`mr-3 transition-all duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 text-white/60'}`} 
                                />
                                <span className="text-xs font-normal font-headline tracking-widest uppercase">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="mt-auto px-6 pb-12 space-y-6">
                    {user?.role !== 'jobseeker' && (
                        <button 
                            onClick={() => router.push('/post-job')}
                            className="w-full bg-white/10 text-white py-3 rounded-xl font-headline font-normal text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-primary transition-all duration-500 border border-white/20 hover:border-transparent group"
                        >
                            <CustomIcon name="flash" size={16} className="group-hover:animate-bounce" />
                            Post New Job
                        </button>
                    )}
                    
                    <div className="pt-8 border-t border-white/10 space-y-3">
                        <Link href="/settings" className="flex items-center px-3 py-2 text-white/70 hover:text-white text-[9px] font-normal font-headline uppercase tracking-widest transition-all duration-300 rounded-xl hover:bg-white/5 group border border-transparent hover:border-white/10">
                            <CustomIcon name="setting-2" size={18} className="mr-3 group-hover:rotate-45 transition-transform" />
                            Settings
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-white/70 font-normal font-headline hover:text-error hover:bg-error/5 text-[9px] uppercase tracking-widest transition-all duration-300 rounded-xl group border border-transparent hover:border-error/10"
                        >
                            <CustomIcon name="logout" size={18} className="mr-3 group-hover:translate-x-1 transition-transform" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Container */}
            <div className="flex-1 flex flex-col h-screen relative bg-surface-container-lowest">
                {/* Header Navbar */}
                <header className="h-[72px] bg-white/60 backdrop-blur-2xl border-b border-outline-variant/5 flex items-center justify-between px-4 md:px-10 sticky top-0 z-100">
                    <div className="flex items-center gap-8 flex-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center text-on-surface border border-outline-variant/10"
                        >
                            <CustomIcon name="menu" size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-10">
                        
                        <div className="flex items-center gap-5">
                            {/* Notification Engine */}
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        setIsProfileOpen(false);
                                    }}
                                    className={`w-12 h-12 rounded-2xl transition-all duration-300 relative group flex items-center justify-center border shadow-sm ${
                                        isNotificationsOpen 
                                            ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" 
                                            : "bg-surface-container-low text-on-surface-variant/40 hover:text-primary hover:bg-primary/5 border-outline-variant/10 hover:border-primary/20"
                                    }`}
                                >
                                    <CustomIcon name="notification" size={22} />
                                    {!isNotificationsOpen && (
                                        <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-error border-2 border-white rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <>
                                            <div className="fixed inset-0 z-190" onClick={() => setIsNotificationsOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-6 w-80 bg-white/95 backdrop-blur-3xl rounded-[40px] border border-outline-variant/10 p-6 z-200 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05] overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between mb-6 px-2">
                                                    <h3 className="text-[11px] font-black text-on-surface uppercase tracking-[0.2em] font-headline">Intelligence Feed</h3>
                                                    <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest">3 New</span>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {DUMMY_NOTIFICATIONS.map((notif) => (
                                                        <button 
                                                            key={notif.id}
                                                            className="w-full p-4 rounded-3xl bg-surface-container-low hover:bg-white transition-all text-left group border border-transparent hover:border-outline-variant/10 shadow-xs hover:shadow-md"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                                    notif.type === 'match' ? 'bg-primary/20 text-primary' : 
                                                                    notif.type === 'app' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-blue-500/20 text-blue-600'
                                                                }`}>
                                                                    <CustomIcon name={notif.type === 'match' ? 'magic-star' : notif.type === 'app' ? 'user-add' : 'activity'} size={14} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <p className="text-[10px] font-black text-on-surface uppercase tracking-tight truncate">{notif.title}</p>
                                                                        <span className="text-[8px] font-medium text-on-surface-variant/40 whitespace-nowrap">{notif.time}</span>
                                                                    </div>
                                                                    <p className="text-[9px] text-on-surface-variant/60 leading-tight mt-0.5 line-clamp-2">{notif.desc}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                <button className="w-full mt-6 py-4 text-[9px] font-black text-primary uppercase tracking-[0.3em] font-headline hover:bg-primary/5 rounded-2xl transition-all border border-primary/10">
                                                    Archive All
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* User Identity Section */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(!isProfileOpen);
                                        setIsNotificationsOpen(false);
                                    }}
                                    className="flex items-center gap-3 p-1.5 rounded-2xl bg-surface-container-low hover:bg-primary/5 transition-all duration-300 group shadow-sm border border-outline-variant/5 hover:border-primary/10"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-black text-sm border-2 border-surface-container-lowest group-hover:scale-110 transition-transform overflow-hidden relative">
                                        {user?.profileImage ? (
                                            <Image src={user.profileImage} fill className="object-cover" alt="Avatar" />
                                        ) : (
                                            user?.fullname?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="pr-2 hidden sm:block text-left">
                                        <p className="text-[10px] font-black text-on-surface tracking-tight truncate max-w-[120px] uppercase">{user?.fullname}</p>
                                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest">{user?.role === 'employer' ? 'Recruiter' : user?.role}</p>
                                    </div>
                                    <CustomIcon name="arrow-down" size={16} className="text-on-surface-variant/10 group-hover:translate-y-1 transition-transform" />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-190" 
                                                onClick={() => setIsProfileOpen(false)} 
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                                                className="absolute right-0 mt-5 w-80 bg-white rounded-[40px] border border-primary/10 p-5 z-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.02]"
                                            >
                                                <div className="px-6 py-6 bg-white rounded-[32px] mb-4 text-center border border-outline-variant/10 shadow-sm">
                                                    <div className="w-16 h-16 rounded-[24px] bg-primary mx-auto mb-3 flex items-center justify-center text-on-primary font-black text-2xl shadow-lg shadow-primary/10 border-4 border-surface-soft overflow-hidden relative">
                                                        {user?.profileImage ? (
                                                            <Image src={user.profileImage} fill className="object-cover" alt="Avatar" />
                                                        ) : (
                                                            user?.fullname?.charAt(0).toUpperCase() || 'U'
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-[0.3em] font-headline">{user?.role === 'employer' ? 'Senior Recruiter' : user?.role}</p>
                                                        <p className="text-base font-black text-on-surface tracking-tighter uppercase leading-none">{user?.fullname}</p>
                                                        <p className="text-[9px] font-bold text-on-surface-variant/30 truncate">{user?.email}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <button
                                                        onClick={() => { router.push('/settings'); setIsProfileOpen(false); }}
                                                        className="w-full flex items-center gap-4 px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all group"
                                                    >
                                                        <CustomIcon name="setting-2" size={18} className="opacity-40 group-hover:opacity-100" />
                                                        Account Settings
                                                    </button>
                                                    {user?.role !== 'employer' && (
                                                        <button
                                                            onClick={() => { router.push(user?.role === 'admin' ? '/admin/profile' : '/profile'); setIsProfileOpen(false); }}
                                                            className="w-full flex items-center gap-4 px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all group"
                                                        >
                                                            <CustomIcon name="profile" size={18} className="opacity-40 group-hover:opacity-100" />
                                                            Personal Profile
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-4 px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-error/60 hover:bg-error/5 hover:text-error rounded-2xl transition-all group"
                                                    >
                                                        <CustomIcon name="logout" size={18} className="opacity-40 group-hover:opacity-100" />
                                                        End Session
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Hub */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden max-w-[1600px] mx-auto w-full px-4 md:px-8 lg:px-12 pt-8 pb-4 scroll-smooth bg-surface-container-lowest">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation Engine */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-on-surface/60 backdrop-blur-md z-1000 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-80 bg-primary z-1001 lg:hidden flex flex-col p-8"
                        >
                            <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20">
                                        <CustomIcon name="vuesax" size={24} />
                                    </div>
                                    <span className="text-xl font-black text-white font-headline uppercase">Akazi</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
                                    <CustomIcon name="close-circle" size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-4">
                                 {menuItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-5 px-5 py-4 rounded-xl transition-all font-headline font-normal text-[10px] uppercase tracking-widest border ${
                                                isActive
                                                    ? "bg-white/10 text-white border-white/20"
                                                    : "text-white/80 hover:bg-white/5 border-transparent"
                                            }`}
                                        >
                                            <CustomIcon name={item.icon} size={20} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto space-y-6 pt-8 border-t border-white/10">
                                 <Link 
                                    href="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-5 px-5 py-4 rounded-xl text-white/80 font-normal font-headline text-[10px] uppercase tracking-widest bg-white/5 border border-white/5"
                                >
                                    <CustomIcon name="setting-2" size={20} />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-5 w-full px-5 py-4 rounded-xl text-white/80 font-normal font-headline text-[10px] uppercase tracking-widest border border-white/10 hover:bg-error/10 hover:text-white transition-all text-left"
                                >
                                    <CustomIcon name="logout" size={20} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
