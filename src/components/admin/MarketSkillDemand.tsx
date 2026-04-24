'use client';

import { motion } from 'framer-motion';

interface MarketSkillDemandProps {
    topSkills: {
        name: string;
        count: number;
    }[];
}

export const MarketSkillDemand = ({ topSkills }: MarketSkillDemandProps) => {
    const maxCount = Math.max(...topSkills.map(s => s.count), 1);

    return (
        <div className="h-full flex flex-col py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 flex-1">
                {topSkills.map((skill, index) => (
                    <div key={index} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[140px]" title={skill.name}>
                                {skill.name}
                            </span>
                            <span className="text-xs font-bold text-gray-900">{skill.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(skill.count / maxCount) * 100}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "circOut", delay: index * 0.05 }}
                                className="bg-primary h-full rounded-full"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-700 text-center font-medium">
                    Based on active employer job postings.
                </p>
            </div>
        </div>
    );
};
