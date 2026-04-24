'use client';

import { useState } from "react";
import {
    Briefcase, Bookmark, User, LogOut,
    ChevronDown, ChevronUp, Menu, X, Book,
    Search, Bell
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        router.push("/");
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { label: "Explorer", href: "/find-jobs" },
        { label: "Enregistrés", href: "/saved-jobs", protected: true, role: 'jobseeker' },
        { label: "Candidatures", href: "/applications", protected: true, role: 'jobseeker' },
        { label: "Tableau de Bord", href: "/employer-dashboard", protected: true, role: 'employer' },
        { label: "Publier", href: "/post-job", protected: true, role: 'employer' },
        { label: "Admin", href: "/admin-dashboard", protected: true, role: 'admin' },
    ];

    const filteredLinks = navLinks.filter(link => {
        if (!link.protected) return true;
        if (!isAuthenticated) return false;
        if (link.role && user?.role !== link.role) return false;
        return true;
    });

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[80] border-b border-gray-100 px-5 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group transition-all hover:scale-105">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 group-hover:bg-blue-700 transition-colors">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 tracking-tighter">Akazi</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {filteredLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-blue-600 ${pathname === link.href ? 'text-blue-600' : 'text-gray-400'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Search & Profile */}
                <div className="hidden lg:flex items-center gap-6">
                    <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-all">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-4 p-1.5 pr-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="h-10 w-10 rounded-xl object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                                        {user?.fullname?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-900 leading-none mb-1">{user?.fullname}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{user?.role}</p>
                                </div>
                                {isDropdownOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-xl shadow-blue-900/10 py-4 z-50 border border-gray-50 p-2"
                                    >
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-2xl transition-all"
                                        >
                                            <User size={18} />
                                            Mon Profil
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <LogOut size={18} />
                                            Déconnexion
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-blue-600 transition-all">
                                Connexion
                            </Link>
                            <Link href="/signup" className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                S'inscrire
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-3 rounded-2xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-all"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white mt-4 border-t border-gray-50 pt-6 pb-8"
                    >
                        <div className="flex flex-col gap-4">
                            {filteredLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-5 py-4 rounded-2xl text-lg font-bold tracking-tight transition-all ${pathname === link.href ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-2 mx-6"></div>
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-5 py-4 text-lg font-bold text-gray-600"
                                    >
                                        <User size={20} />
                                        Profil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-5 py-4 text-lg font-bold text-red-500"
                                    >
                                        <LogOut size={20} />
                                        Déconnexion
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 px-5">
                                    <Link href="/login" className="py-4 text-center bg-gray-50 rounded-2xl font-bold text-gray-900">
                                        Connexion
                                    </Link>
                                    <Link href="/signup" className="py-4 text-center bg-blue-600 rounded-2xl font-bold text-white">
                                        S'inscrire
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
