'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import {
    X, Briefcase, MapPin, DollarSign,
    Type, List, FileText, Check, Loader2,
    ChevronDown, Info, AlertTriangle, Star,
    GraduationCap, Tags, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-hot-toast';

interface AdminJobFormProps {
    job?: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Unified schema for all selectors to ensure casing compatibility with Backend
const JOB_TYPES = [
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Remote', value: 'remote' },
    { label: 'Internship', value: 'internship' },
    { label: 'Hybrid', value: 'hybrid' }
];

const EXPERIENCE_LEVELS = [
    { label: 'Entry', value: 'entry' },
    { label: 'Mid-Level', value: 'mid' },
    { label: 'Senior', value: 'senior' },
    { label: 'Lead', value: 'lead' }
];

const EDUCATION_LEVELS = [
    { label: 'High School', value: 'high school' },
    { label: 'Bachelor', value: 'bachelor' },
    { label: 'Master', value: 'master' },
    { label: 'PhD', value: 'phd' },
    { label: 'Doctorate', value: 'doctorate' },
    { label: 'Any', value: 'any' }
];

const CATEGORIES = [
    { label: 'Technology', value: 'technology' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Finance', value: 'finance' },
    { label: 'Education', value: 'education' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Customer Service', value: 'customer service' },
    { label: 'Other', value: 'other' }
];

export const AdminJobForm = ({ job, isOpen, onClose, onSuccess }: AdminJobFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingData, setPendingData] = useState<any>(null);
    const isEdit = !!job;

    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            requirements: '',
            location: '',
            type: 'full-time',
            category: 'technology',
            experienceLevel: 'mid',
            educationLevel: 'bachelor',
            salaryMin: '',
            salaryMax: '',
            isClosed: false,
        }
    });

    // Reset form when job prop changes or drawer opens
    useEffect(() => {
        if (isOpen) {
            if (job) {
                // Ensure values are lowercased to match selector values
                reset({
                    title: job.title || '',
                    description: job.description || '',
                    requirements: job.requirements || '',
                    location: job.location || '',
                    type: (job.type || 'full-time').toLowerCase(),
                    category: (job.category || 'technology').toLowerCase(),
                    experienceLevel: (job.experienceLevel || 'mid').toLowerCase(),
                    educationLevel: (job.educationLevel || 'bachelor').toLowerCase(),
                    salaryMin: job.salaryMin || '',
                    salaryMax: job.salaryMax || '',
                    isClosed: job.isClosed || false,
                });
                setSkills(job.skillsRequired || []);
            } else {
                reset({
                    title: '',
                    description: '',
                    requirements: '',
                    location: '',
                    type: 'full-time',
                    category: 'technology',
                    experienceLevel: 'mid',
                    educationLevel: 'bachelor',
                    salaryMin: '',
                    salaryMax: '',
                    isClosed: false,
                });
                setSkills([]);
            }
        }
    }, [job, reset, isOpen]);

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handlePreSubmit = (data: any) => {
        setPendingData({ ...data, skillsRequired: skills });
        setShowConfirm(true);
    };

    const onConfirmSubmit = async () => {
        if (!pendingData) return;
        try {
            setIsSubmitting(true);
            const payload = {
                ...pendingData,
                salaryMin: pendingData.salaryMin === '' ? null : Number(pendingData.salaryMin),
                salaryMax: pendingData.salaryMax === '' ? null : Number(pendingData.salaryMax),
            };

            if (isEdit) {
                await axiosInstance.patch(`/api/job/edit/${job._id}`, payload);
                toast.success('Listing parameters synchronized');
            } else {
                await axiosInstance.post('/api/job/create', payload);
                toast.success('New mission node deployed');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Network synchronization failure');
        } finally {
            setIsSubmitting(false);
            setShowConfirm(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200]"
                    />
                    
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[210] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none">
                                    {isEdit ? 'Modify Listing' : 'Deploy Listing'}
                                </h2>
                                <p className="text-[10px] font-black text-text-faint uppercase tracking-widest mt-1.5">Platform Governance Control</p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-surface-soft rounded-xl transition-colors">
                                <X className="h-5 w-5 text-on-surface-variant/40" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit(handlePreSubmit)} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                            {/* Section: Core Identity */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Position Title</label>
                                    <input
                                        {...register('title', { required: true })}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full px-5 py-4 bg-surface-soft border border-outline-variant/5 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold text-on-surface text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Location</label>
                                        <input
                                            {...register('location')}
                                            placeholder="Remote / City"
                                            className="w-full px-5 py-4 bg-surface-soft border border-outline-variant/5 rounded-xl focus:bg-white transition-all font-bold text-on-surface text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Category</label>
                                        <div className="relative">
                                            <select
                                                {...register('category')}
                                                className="w-full h-[54px] pl-5 pr-10 bg-surface-soft border border-outline-variant/5 rounded-xl appearance-none font-bold text-on-surface text-sm focus:bg-white transition-all outline-none"
                                            >
                                                {CATEGORIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Work Type</label>
                                        <div className="relative">
                                            <select
                                                {...register('type')}
                                                className="w-full h-[54px] pl-5 pr-10 bg-surface-soft border border-outline-variant/5 rounded-xl appearance-none font-bold text-on-surface text-sm focus:bg-white transition-all outline-none"
                                            >
                                                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Experience Level</label>
                                        <div className="relative">
                                            <select
                                                {...register('experienceLevel')}
                                                className="w-full h-[54px] pl-5 pr-10 bg-surface-soft border border-outline-variant/5 rounded-xl appearance-none font-bold text-on-surface text-sm focus:bg-white transition-all outline-none"
                                            >
                                                {EXPERIENCE_LEVELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Education Level</label>
                                    <div className="relative">
                                        <select
                                            {...register('educationLevel')}
                                            className="w-full h-[54px] pl-5 pr-10 bg-surface-soft border border-outline-variant/5 rounded-xl appearance-none font-bold text-on-surface text-sm focus:bg-white transition-all outline-none"
                                        >
                                            {EDUCATION_LEVELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/30 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Skills & Tags */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Tags className="h-3 w-3" /> Required Skills
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs font-bold border border-primary/10 flex items-center gap-2">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Add a skill..."
                                        className="flex-1 px-5 py-4 bg-surface-soft border border-outline-variant/5 rounded-xl font-bold text-sm"
                                    />
                                    <button 
                                        type="button"
                                        onClick={addSkill}
                                        className="w-14 h-14 bg-on-surface text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all shadow-lg"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Section: Content */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> Job Description
                                    </label>
                                    <div className="border border-outline-variant/10 rounded-2xl overflow-hidden [&_.ql-toolbar]:bg-surface-soft [&_.ql-toolbar]:border-none [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm">
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Check className="h-3 w-3" /> Requirements
                                    </label>
                                    <div className="border border-outline-variant/10 rounded-2xl overflow-hidden [&_.ql-toolbar]:bg-surface-soft [&_.ql-toolbar]:border-none [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm">
                                        <Controller
                                            name="requirements"
                                            control={control}
                                            render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Economics */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Salary Min</label>
                                        <input
                                            type="number"
                                            {...register('salaryMin')}
                                            className="w-full px-5 py-4 bg-surface-soft border border-outline-variant/5 rounded-xl font-bold text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Salary Max</label>
                                        <input
                                            type="number"
                                            {...register('salaryMax')}
                                            className="w-full px-5 py-4 bg-surface-soft border border-outline-variant/5 rounded-xl font-bold text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-5 bg-surface-soft rounded-2xl border border-outline-variant/5">
                                    <input type="checkbox" {...register('isClosed')} className="h-5 w-5 rounded border-outline-variant/20 text-primary" id="isClosed" />
                                    <label htmlFor="isClosed" className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest cursor-pointer">Archive listing (Stop applications)</label>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-8 border-t border-outline-variant/10 bg-white flex items-center gap-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-14 bg-surface-soft text-on-surface-variant font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-surface-variant/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit(handlePreSubmit)}
                                disabled={isSubmitting}
                                className="flex-[2] h-14 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                {isEdit ? 'Save Changes' : 'Deploy Node'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Confirmation Dialog */}
                    <AnimatePresence>
                        {showConfirm && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                            >
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-outline-variant/10 text-center"
                                >
                                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                                        <AlertTriangle className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">Confirm Registry Change</h3>
                                    <p className="text-xs font-bold text-text-faint uppercase tracking-widest leading-relaxed mb-8">
                                        You are about to modify platform listing parameters. This action will be synchronized across all candidate interfaces.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setShowConfirm(false)}
                                            className="h-12 bg-surface-soft text-on-surface-variant rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-surface-variant/20 transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button 
                                            onClick={onConfirmSubmit}
                                            disabled={isSubmitting}
                                            className="h-12 bg-on-surface text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg flex items-center justify-center"
                                        >
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
};
