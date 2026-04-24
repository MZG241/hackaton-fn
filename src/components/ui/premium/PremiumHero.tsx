'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from './PremiumIcons';
import { PremiumGlassCard } from './Common';

interface PremiumHeroProps {
    title: string;
    subtitle?: string;
    userName?: string;
    stats?: {
        label: string;
        value: string | number;
        icon?: React.ReactNode;
    }[];
    actions?: React.ReactNode;
    backgroundVariant?: 'blue' | 'purple' | 'dark';
}

export const PremiumHero: React.FC<PremiumHeroProps> = ({
    title,
    subtitle,
    userName,
    stats,
    actions,
    backgroundVariant = 'blue'
}) => {
    const gradients = {
        blue: 'from-primary/20 via-primary/5 to-transparent',
        purple: 'from-purple-600/20 via-purple-600/5 to-transparent',
        dark: 'from-on-surface/10 via-on-surface/5 to-transparent'
    };

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-outline-ghost/30 bg-surface-container-lowest shadow-sm">
            {/* Background Decorations */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[backgroundVariant]} pointer-events-none`} />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute top-1/2 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 px-8 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-outline-ghost/50 shadow-sm"
                    >
                        <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Command Center</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-[1.1]">
                            {title} {userName && <span className="text-primary">{userName}.</span>}
                        </h1>
                        {subtitle && (
                            <p className="mt-4 text-base md:text-lg text-text-faint font-medium leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>

                    {actions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="pt-2 flex flex-wrap justify-center md:justify-start gap-4"
                        >
                            {actions}
                        </motion.div>
                    )}
                </div>

                {stats && stats.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center md:justify-end gap-4"
                    >
                        {stats.map((stat, i) => (
                            <PremiumGlassCard
                                key={i}
                                variant="white"
                                className="p-5 min-w-[140px] flex flex-col items-center md:items-start gap-1 group hover:scale-105 transition-transform"
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-faint group-hover:text-primary transition-colors">
                                    {stat.label}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-on-surface tracking-tighter">
                                        {stat.value}
                                    </span>
                                    {stat.icon && <span className="text-primary/40">{stat.icon}</span>}
                                </div>
                            </PremiumGlassCard>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
