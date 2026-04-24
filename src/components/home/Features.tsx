'use client';

import { motion } from "framer-motion";
import {
    Search, Zap, DollarSign, BookOpen,
    Users, Building, BarChart2, TrendingUp,
    Bell, MessageSquare, Smartphone, Heart,
    LucideIcon
} from "lucide-react";
import { jobSeekerFeatures, employerFeatures, platformFeatures } from "@/lib/data";

const iconComponents: { [key: string]: LucideIcon } = {
    "🔍": Search,
    "⚡": Zap,
    "💰": DollarSign,
    "📚": BookOpen,
    "👥": Users,
    "🏢": Building,
    "📊": BarChart2,
    "📈": TrendingUp,
    "🔔": Bell,
    "💬": MessageSquare,
    "📱": Smartphone,
    "🌈": Heart
};

interface Feature {
    title: string;
    description: string;
    icon: string;
    benefits?: string[];
}

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
    const IconComponent = iconComponents[feature.icon] || Search;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/50 group"
        >
            <div className="flex items-center mb-6">
                <div className="p-4 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <IconComponent className="h-7 w-7" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 tracking-tight">{feature.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">{feature.description}</p>
            {feature.benefits && (
                <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start text-sm group/item">
                            <span className="text-blue-500 mr-3 mt-1 scale-125 group-hover/item:scale-150 transition-transform">✓</span>
                            <span className="text-gray-700 font-medium">{benefit}</span>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
};

const Features = () => {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-3xl md:text-3xl font-bold text-gray-800 mb-6 tracking-tight"
                    >
                        Powerful Features
                    </motion.h2>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "80px" }}
                        className="h-1.5 bg-blue-600 mx-auto rounded-full mb-6"
                    ></motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        Designed to connect talent with opportunities in the most efficient way.
                    </motion.p>
                </div>

                {/* Categories toggler or tabs could be here, but using the original scroll-reveal layout */}

                {/* Job Seeker Features */}
                <div className="mb-24">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-800 tracking-tight">For Candidates</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {jobSeekerFeatures.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </div>
                </div>

                {/* Employer Features */}
                <div className="mb-24">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-800 tracking-tight">For Recruiters</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {employerFeatures.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </div>
                </div>

                {/* Platform Features */}
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-800 tracking-tight">Platform Services</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {platformFeatures.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
