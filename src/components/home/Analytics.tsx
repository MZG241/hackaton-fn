'use client';

import { motion } from "framer-motion";
import {
    Users, Briefcase, Zap,
    ChevronUp, ChevronDown, TrendingUp, Moon, Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Line
} from "recharts";

const data = [
    { name: "Jan", jobs: 4200, users: 2400, matches: 1800 },
    { name: "Feb", jobs: 3800, users: 3200, matches: 2100 },
    { name: "Mar", jobs: 5200, users: 4100, matches: 2900 },
    { name: "Apr", jobs: 6100, users: 3800, matches: 3200 },
    { name: "May", jobs: 7300, users: 5200, matches: 4100 },
    { name: "Jun", jobs: 8900, users: 6800, matches: 5300 },
];

const ModernChart = ({ darkMode }: { darkMode: boolean }) => {
    // Fix for Recharts hydration issue in Next.js
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMounted(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    if (!mounted) return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl"></div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
                <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={darkMode ? "#3B82F6" : "#2563EB"}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={darkMode ? "#3B82F6" : "#2563EB"}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={darkMode ? "#10B981" : "#059669"}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={darkMode ? "#10B981" : "#059669"}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? "#374151" : "#E5E7EB"}
                    vertical={false}
                />
                <XAxis
                    dataKey="name"
                    tick={{ fill: darkMode ? "#9CA3AF" : "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: darkMode ? "#9CA3AF" : "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={{
                        background: darkMode ? "#1F2937" : "#FFFFFF",
                        borderColor: darkMode ? "#374151" : "#E5E7EB",
                        borderRadius: '1rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                    }}
                    itemStyle={{ color: darkMode ? "#F3F4F6" : "#111827" }}
                    labelStyle={{ fontWeight: 700, color: darkMode ? "#F3F4F6" : "#111827", marginBottom: '4px' }}
                />
                <Area
                    type="monotone"
                    dataKey="users"
                    stroke={darkMode ? "#3B82F6" : "#2563EB"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                />
                <Bar
                    dataKey="jobs"
                    fill="url(#colorJobs)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                />
                <Line
                    type="monotone"
                    dataKey="matches"
                    stroke={darkMode ? "#F59E0B" : "#D97706"}
                    strokeWidth={4}
                    dot={{ fill: darkMode ? "#F59E0B" : "#D97706", r: 6, strokeWidth: 2, stroke: "#FFFFFF" }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

const Analytics = () => {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className={darkMode ? "dark" : ""}>
            <section className="py-24 bg-white dark:bg-gray-950 transition-colors duration-500 overflow-hidden relative">
                {/* Background blobs */}
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl"
                        >
                            <h2 className="text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                                Platform <span className="text-blue-600 dark:text-blue-400">Analytics</span>
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Data-driven insights to propel your job search to success.
                            </p>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDarkMode(!darkMode)}
                            className="px-5 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow transition-all flex items-center gap-3 font-medium"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                        </motion.button>
                    </div>

                    {/* Modern Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 mb-16 backdrop-blur-xl"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                Monthly Growth
                            </h3>
                            <div className="flex flex-wrap gap-6 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex items-center text-sm font-medium">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm shadow-blue-200" />
                                    <span className="text-gray-600 dark:text-gray-300">Users</span>
                                </div>
                                <div className="flex items-center text-sm font-medium">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-200" />
                                    <span className="text-gray-600 dark:text-gray-300">Jobs</span>
                                </div>
                                <div className="flex items-center text-sm font-medium">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm shadow-amber-200" />
                                    <span className="text-gray-600 dark:text-gray-300">Matches</span>
                                </div>
                            </div>
                        </div>
                        <ModernChart darkMode={darkMode} />
                    </motion.div>

                    {/* Mini Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                value: "2.4M+",
                                label: "Active Users",
                                change: "+12%",
                                trend: "up",
                                color: "blue"
                            },
                            {
                                icon: Briefcase,
                                value: "150K+",
                                label: "Open Positions",
                                change: "+8%",
                                trend: "up",
                                color: "emerald"
                            },
                            {
                                icon: Zap,
                                value: "85%",
                                label: "Match Rate",
                                change: "+5%",
                                trend: "up",
                                color: "amber"
                            }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className={`group bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none hover:shadow-xl transition-all duration-300 ${stat.color === 'emerald' ? 'hover:border-emerald-200 dark:hover:border-emerald-900' :
                                        stat.color === 'amber' ? 'hover:border-amber-200 dark:hover:border-amber-900' :
                                            'hover:border-blue-200 dark:hover:border-blue-900'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-4 rounded-2xl ${stat.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                            stat.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                                                'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        } group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="h-7 w-7" />
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                            stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                                'bg-blue-50 text-blue-600'
                                        }`}>
                                        {stat.trend === 'up' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">
                                    {stat.value}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Analytics;
