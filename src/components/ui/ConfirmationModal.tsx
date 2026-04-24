'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'primary' | 'error' | 'warning' | 'success';
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'primary'
}: ConfirmationModalProps) => {
    const [loading, setLoading] = useState(false);

    const config = {
        primary: {
            btn: 'bg-primary text-white hover:opacity-90',
            icon: <Info className="w-8 h-8" />,
            ring: 'bg-primary/10 text-primary',
        },
        error: {
            btn: 'bg-rose-500 text-white hover:bg-rose-600',
            icon: <AlertCircle className="w-8 h-8" />,
            ring: 'bg-rose-50 text-rose-500',
        },
        warning: {
            btn: 'bg-amber-500 text-white hover:bg-amber-600',
            icon: <AlertTriangle className="w-8 h-8" />,
            ring: 'bg-amber-50 text-amber-500',
        },
        success: {
            btn: 'bg-emerald-500 text-white hover:bg-emerald-600',
            icon: <CheckCircle className="w-8 h-8" />,
            ring: 'bg-emerald-50 text-emerald-500',
        },
    };

    const { btn, icon, ring } = config[type];

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 text-center"
                    >
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${ring}`}>
                            {icon}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase mb-3">
                            {title}
                        </h2>

                        {/* Message */}
                        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 h-11 bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all border border-gray-100 disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${btn}`}
                            >
                                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {loading ? 'Processing...' : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
