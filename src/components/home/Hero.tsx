'use client';

import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

const Hero = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const handleFindJobs = () => {
        router.push(`${isAuthenticated && user?.role === 'jobseeker' ? '/find-jobs' : '/login'}`);
    };

    const handlePostJob = () => {
        router.push(
            isAuthenticated && user?.role === "employer"
                ? "/employer-dashboard"
                : "/login"
        );
    };

    return (
        <section className="relative bg-gradient-to-br from-blue-50 to-white py-16 md:py-24 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-200/40 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-6 tracking-tight"
                    >
                        Find your dream job or <br />
                        <span className="text-blue-600 relative inline-block">
                            the Ideal Candidate
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.6, duration: 1, ease: "easeInOut" }}
                                className="absolute bottom-1 left-0 h-1.5 bg-blue-100 -z-10 opacity-70"
                            ></motion.span>
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                        className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Connecting talented professionals with innovative companies. <br className="hidden md:block" />
                        Your next career step is just a click away.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium text-base shadow-lg shadow-blue-600/20 transition-all group"
                            onClick={handleFindJobs}
                        >
                            <Search className="h-4 w-4 transition-transform" />
                            <span>Find a job</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-3 rounded-xl font-medium text-base shadow-sm transition-all hover:border-blue-200 group"
                            onClick={handlePostJob}
                        >
                            <Briefcase className="h-4 w-4 text-blue-600 transition-transform" />
                            <span>Post a job</span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all -ml-6 group-hover:ml-0" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

import { Briefcase } from "lucide-react";

export default Hero;
