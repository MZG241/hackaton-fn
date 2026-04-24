'use client';

import { motion } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";

interface AdminStatsCardProps {
    title: string;
    value: number | string;
    icon: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color: "blue" | "emerald" | "amber" | "purple";
    description?: string;
    compact?: boolean;
}

export const AdminStatsCard = ({ title, value, icon, trend, color, description, compact = false }: AdminStatsCardProps) => {
    const colors = {
        blue: "bg-primary/5 text-primary border-primary/20",
        emerald: "bg-emerald-500/5 text-emerald-500 border-emerald-500/20",
        amber: "bg-amber-500/5 text-amber-500 border-amber-500/20",
        purple: "bg-secondary/5 text-secondary border-secondary/20",
    };

    const bgColors = {
        blue: "bg-primary/10",
        emerald: "bg-emerald-500/10",
        amber: "bg-amber-500/10",
        purple: "bg-secondary/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${compact ? 'p-6 rounded-3xl' : 'p-10 rounded-[40px]'} border border-outline-variant/10 ${bgColors[color]} flex flex-col justify-between h-full group hover:border-primary/40 transition-all relative overflow-hidden ${!compact ? 'border-l-4 shadow-sm hover:shadow-2xl hover:shadow-primary/5' : ''} ${!compact && (color === 'blue' ? 'border-l-primary' : color === 'emerald' ? 'border-l-emerald-500' : color === 'amber' ? 'border-l-amber-500' : 'border-l-secondary')}`}
        >
            <div className={`relative z-10 flex flex-col h-full justify-between items-start`}>
                <div className={`${compact ? 'space-y-1' : 'space-y-3'}`}>
                    <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-black text-on-surface-variant/40 uppercase tracking-[0.2em] font-headline`}>{title}</p>
                    <div className="flex items-baseline gap-3">
                        <h3 className={`${compact ? 'text-2xl' : 'text-4xl'} font-black text-on-surface tracking-tighter font-headline leading-none`}>{value}</h3>
                        {description && <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">Sync</span>}
                    </div>
                </div>

                <div className={`flex justify-between items-center w-full mt-6`}>
                    <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-full flex items-center justify-center border ${colors[color]} group-hover:scale-110 transition-transform duration-500 shadow-inner shadow-black/5 bg-white/80 backdrop-blur-md`}>
                        <CustomIcon name={icon} size={compact ? 18 : 24} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${trend.isUp ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-error/10 text-error border-error/20"
                            } border backdrop-blur-sm`}>
                            <CustomIcon name={trend.isUp ? 'trend-up' : 'trend-down'} size={12} />
                            {trend.value}%
                        </div>
                    )}
                </div>
            </div>
            
            {description && <p className="text-[10px] font-bold text-on-surface-variant/30 leading-relaxed uppercase tracking-tighter relative z-10 mt-2">{description}</p>}
            
            {/* Trace Decoration */}
            <div className={`absolute -bottom-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700 pointer-events-none ${compact ? 'scale-75' : ''}`}>
                <CustomIcon name="chart-21" size={120} className={colors[color].split(' ')[1]} />
            </div>
        </motion.div>
    );
};
