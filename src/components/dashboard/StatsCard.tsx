import { motion } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: string;
    color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'primary';
    trend?: {
        value: number;
        isUp: boolean;
    };
}

const colorMap = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    primary: "bg-primary/10 text-primary border-primary/20"
};

export const StatsCard = ({ title, value, icon, color = 'primary', trend }: StatsCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-outline-variant/20 transition-all group relative overflow-hidden flex flex-col justify-between h-full min-h-[160px] shadow-sm hover:shadow-xl hover:shadow-on-surface/5`}
        >
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 ${colorMap[color]}`}>
                            <CustomIcon name={icon} size={20} />
                         </div>
                        <p className="text-[10px] font-black text-on-surface-variant/40 tracking-widest font-body">{title}</p>
                    </div>
                    
                    <h3 className="text-4xl font-black text-on-surface tracking-tighter font-headline leading-none">{value}</h3>
                </div>

                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${trend.isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-error/10 text-error'}`}>
                        <CustomIcon name={trend.isUp ? 'trend-up' : 'trend-down'} size={12} />
                        {trend.value}%
                    </div>
                )}
            </div>
            
            {/* Subtle Gradient Background Splash */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />
        </motion.div>
    );
};

