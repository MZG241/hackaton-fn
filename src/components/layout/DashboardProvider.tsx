'use client';

import { useAppSelector } from "@/store/hooks";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomIcon from "@/components/ui/CustomIcon";
import React from "react";

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { isInitialized } = useAppSelector((state) => state.auth);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-[20px] animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-primary animate-pulse">
                            <CustomIcon name="vuesax" size={32} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">
                        Initialization...
                    </p>
                </div>
            </div>
        );
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
