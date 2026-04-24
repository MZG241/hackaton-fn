'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import CustomIcon from "@/components/ui/CustomIcon";

const Header = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
    const closeUserMenu = () => setIsUserMenuOpen(false);

    const handleNavigation = (path: string) => {
        router.push(path);
        closeMobileMenu();
        closeUserMenu();
    };

    const handleEmployerNavigation = () => {
        if (isAuthenticated) {
            switch (user?.role) {
                case "employer":
                    handleNavigation("/employer-dashboard");
                    break;
                case "jobseeker":
                    handleNavigation("/candidate-dashboard");
                    break;
                case "admin":
                    handleNavigation("/admin-dashboard");
                    break;
                default:
                    handleNavigation("/");
            }
        } else {
            handleNavigation("/login");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        closeUserMenu();
        closeMobileMenu();
        router.push("/");
    };

    // Get user initials for profile placeholder
    const getUserInitials = () => {
        if (user?.fullname) {
            const names = user.fullname.split(' ');
            return names.map((name: string) => name[0]?.toUpperCase()).join('');
        }
        return user?.role?.[0]?.toUpperCase() || 'U';
    };

    // Get greeting name based on available user data
    const getGreetingName = () => {
        if (user?.fullname) {
            const firstName = user.fullname.split(' ')[0];
            return firstName.length > 12 ? firstName.substring(0, 10) + '...' : firstName;
        }
        return user?.role || 'User';
    };

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between h-12">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md group"
                        aria-label="Home"
                    >
                         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500 border border-primary/20">
                            <CustomIcon name="vuesax" size={24} />
                         </div>
                        <span className="font-bold text-xl text-gray-800 tracking-tight">Akazi</span>
                    </Link>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full py-1 px-2 hover:bg-gray-50 transition-colors"
                                    aria-label="User menu"
                                    aria-expanded={isUserMenuOpen}
                                >
                                    <div className="h-9 w-9 rounded-full border border-gray-100 relative overflow-hidden shadow-sm">
                                        {user?.profileImage ? (
                                            <Image
                                                src={user.profileImage}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-primary flex items-center justify-center">
                                                <span className="text-white text-[10px] font-black uppercase">
                                                    {user?.fullname?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Hi, {getGreetingName()}</span>
                                </button>

                                {/* User Dropdown Menu */}
                                
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200"
                                            onMouseLeave={closeUserMenu}
                                        >
                                            <button
                                                onClick={() => handleNavigation(
                                                    user?.role === "employer" ? "/employer-dashboard" :
                                                        user?.role === "admin" ? "/admin-dashboard" : "/candidate-dashboard"
                                                )}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                                                Dashboard
                                            </button>
                                            <button
                                                onClick={() => handleNavigation("/profile")}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                                            >
                                                <User className="h-4 w-4 text-blue-500" />
                                                My Profile
                                            </button>
                                            <div className="my-1 border-t border-gray-100"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-600 transition-all px-4 py-2 rounded-lg text-sm font-semibold"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all focus:outline-none"
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden fixed inset-0 top-[73px] bg-white z-40 p-4"
                        >
                            <div className="space-y-3 pt-4">
                                <button
                                    onClick={() => handleNavigation("/find-jobs")}
                                    className="w-full text-left px-5 py-4 rounded-xl text-lg font-bold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                >
                                    Find a Job
                                </button>
                                <button
                                    onClick={handleEmployerNavigation}
                                    className="w-full text-left px-5 py-4 rounded-xl text-lg font-bold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                >
                                    {isAuthenticated ? "Dashboard" : "For Recruiters"}
                                </button>

                                {isAuthenticated ? (
                                    <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
                                        <div className="flex items-center gap-4 px-5 py-4 bg-blue-50 rounded-2xl mb-4">
                                            <div className="h-12 w-12 rounded-full border-2 border-white shadow-sm relative overflow-hidden flex-shrink-0">
                                                {user?.profileImage ? (
                                                    <Image
                                                        src={user.profileImage}
                                                        alt="Profile"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                                                        <span className="text-blue-600 font-bold text-lg">
                                                            {getUserInitials()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Welcome,</p>
                                                <p className="text-lg font-bold text-gray-900">{user?.fullname}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleNavigation("/profile")}
                                            className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-all"
                                        >
                                            <User className="h-6 w-6 text-blue-500" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl text-lg font-semibold text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            <LogOut className="h-6 w-6" />
                                            Log Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-6 border-t border-gray-100 mt-6 grid grid-cols-2 gap-4">
                                        <Link
                                            href="/login"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center py-4 rounded-xl text-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center py-4 rounded-xl text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;
