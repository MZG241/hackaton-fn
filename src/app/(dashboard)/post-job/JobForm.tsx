'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";
import { jobCategories, jobTypes, experienceLevels } from "@/lib/data";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CustomIcon from "@/components/ui/CustomIcon";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import CustomDropdown from "@/components/ui/CustomDropdown";
import { FieldPath } from "react-hook-form";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface JobFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export const JobForm = ({ initialData, isEditing = false }: JobFormProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiProposals, setAiProposals] = useState<any[]>([]);
    const [aiPrompt, setAiPrompt] = useState("");
    const [requirementsArray, setRequirementsArray] = useState<string[]>(
        initialData?.requirements 
            ? (Array.isArray(initialData.requirements) ? initialData.requirements : initialData.requirements.split('\n')).filter((r: string) => r.trim()) 
            : []
    );
    const [tempReq, setTempReq] = useState("");
    const [skillsArray, setSkillsArray] = useState<string[]>(
        initialData?.skillsRequired 
            ? (Array.isArray(initialData.skillsRequired) ? initialData.skillsRequired : initialData.skillsRequired.split(',')).map((s: string) => s.trim()).filter((s: string) => s) 
            : []
    );
    const [tempSkill, setTempSkill] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: initialData || {
            title: "",
            type: "full-time",
            category: "technology",
            location: "",
            salaryMin: "",
            salaryMax: "",
            experienceLevel: "entry",
            educationLevel: "",
            skillsRequired: "",
            description: "",
            requirements: ""
        }
    });

    const formData = watch();

    const isStepValid = () => {
        if (currentStep === 1) {
            return formData.title && formData.category && formData.location && formData.type;
        }
        if (currentStep === 2) {
            return formData.description && requirementsArray.length > 0;
        }
        if (currentStep === 3) {
            return true; // Optional fields mainly
        }
        return true;
    };

    const nextStep = async () => {
        let fieldsToValidate: FieldPath<any>[] = [];
        if (currentStep === 1) fieldsToValidate = ["title", "category", "location", "type"];
        if (currentStep === 2) fieldsToValidate = ["description", "requirements"];
        if (currentStep === 3) fieldsToValidate = ["salaryMin", "salaryMax", "experienceLevel"];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error("Please complete all tactical parameters.");
        }
    };

    useEffect(() => {
        if (initialData) {
            const formattedData = {
                ...initialData,
                skillsRequired: initialData.skillsRequired?.join(", ") || "",
                requirements: initialData.requirements?.join("\n") || ""
            };
            reset(formattedData);
        }
    }, [initialData, reset]);

    const handleAIGenerate = async () => {
        if (!aiPrompt && !formData.title) {
            return toast.error("Please provide a job title or a prompt for the AI.");
        }

        try {
            setIsGenerating(true);
            const response = await axiosInstance.post("/api/ai/generate-job", { 
                idea: aiPrompt || formData.title,
                jobDetails: formData
            });
            setAiProposals(response.data.proposals || []);
            toast.success("AI generated comprehensive proposals!");
        } catch (error: any) {
            console.error('AI Generation failed:', error);
            const errorMessage = error.response?.data?.message || "Strategy synchronization failed.";
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const addRequirement = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tempReq.trim()) {
            e.preventDefault();
            const newArray = [...requirementsArray, tempReq.trim()];
            setRequirementsArray(newArray);
            setValue("requirements", newArray.join('\n'));
            trigger("requirements");
            setTempReq("");
        }
    };

    const removeRequirement = (index: number) => {
        const newArray = requirementsArray.filter((_, i) => i !== index);
        setRequirementsArray(newArray);
        setValue("requirements", newArray.join('\n'));
        trigger("requirements");
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tempSkill.trim()) {
            e.preventDefault();
            const newArray = [...skillsArray, tempSkill.trim()];
            setSkillsArray(newArray);
            setValue("skillsRequired", newArray.join(', '));
            setTempSkill("");
        }
    };

    const removeSkill = (index: number) => {
        const newArray = skillsArray.filter((_, i) => i !== index);
        setSkillsArray(newArray);
        setValue("skillsRequired", newArray.join(', '));
    };

    const selectProposal = (proposal: any) => {
        // 1. Set the description HTML
        if (proposal.descriptionHTML) {
            setValue("description", proposal.descriptionHTML);
            trigger("description");
        }

        // 2. Smart merge Requirements (Technical Arsenal) without duplicates
        if (proposal.requirements && Array.isArray(proposal.requirements)) {
            const currentReqLower = requirementsArray.map(r => r.toLowerCase().trim());
            const newReqs = proposal.requirements.filter((r: string) => !currentReqLower.includes(r.toLowerCase().trim()));
            if (newReqs.length > 0) {
                const updatedReqs = [...requirementsArray, ...newReqs];
                setRequirementsArray(updatedReqs);
                setValue("requirements", updatedReqs.join('\n'));
                trigger("requirements");
            }
        }

        // 3. Smart merge Skills without duplicates
        if (proposal.skills && Array.isArray(proposal.skills)) {
            const currentSkillsLower = skillsArray.map(s => s.toLowerCase().trim());
            const newSkills = proposal.skills.filter((s: string) => !currentSkillsLower.includes(s.toLowerCase().trim()));
            if (newSkills.length > 0) {
                const updatedSkills = [...skillsArray, ...newSkills];
                setSkillsArray(updatedSkills);
                setValue("skillsRequired", updatedSkills.join(', '));
            }
        }

        toast.success("Mission parameters strictly fused!");
    };

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const requirements = data.requirements
                .split("\n")
                .filter((item: string) => item.trim() !== "");

            const skillsRequired = data.skillsRequired
                .split(",")
                .map((s: string) => s.trim())
                .filter((s: string) => s !== "");

            const jobData = {
                ...data,
                requirements,
                skillsRequired,
                salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
                salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
            };

            if (isEditing && initialData?._id) {
                await axiosInstance.put(`/api/job/edit/${initialData._id}`, jobData);
                toast.success("Position updated successfully.");
            } else {
                await axiosInstance.post("/api/job/create", jobData);
                toast.success("Position published to the ecosystem.");
            }

            router.push('/manage-jobs');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Sync failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }],
            ['clean']
        ],
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-outline-variant/10 pb-10 sticky top-[-48px] z-50 bg-white/80 backdrop-blur-xl -mx-4 px-4 pt-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl font-black text-on-surface tracking-tighter font-headline leading-none">
                            {isEditing ? "Modify " : "Design "}<span className='text-primary'>{isEditing ? "tactical" : "mission"}</span>.
                        </h1>
                        <p className="text-sm text-on-surface-variant/40 font-normal max-w-xl leading-relaxed lowercase">
                            Define the parameters for your next strategic hire. Use neural assistance to optimize for the elite 5% of talent.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/10 self-start lg:self-end">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                                currentStep === step 
                                ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-110" 
                                : currentStep > step 
                                ? "bg-emerald-500 text-white" 
                                : "bg-white text-on-surface-variant/20 border border-outline-variant/5"
                            }`}>
                                {currentStep > step ? <CustomIcon name="verify" size={16} /> : <span className="font-black text-[10px] font-headline">0{step}</span>}
                            </div>
                            {step < 4 && <div className={`w-10 h-[1px] ${currentStep > step ? 'bg-emerald-500/30' : 'bg-outline-variant/10'}`}></div>}
                        </div>
                    ))}
                </div>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <section className="xl:col-span-8 space-y-10">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white p-10 md:p-12 rounded-[40px] border border-outline-variant/10 space-y-12"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                        <CustomIcon name="edit-2" size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-on-surface font-headline tracking-tighter uppercase">Mission Intel</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-normal text-on-surface-variant/60 lowercase tracking-[0.2em] ml-2">position title <span className="text-error">*</span></label>
                                        <div className="relative group">
                                            <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center text-on-surface-variant/20 group-focus-within:text-primary transition-colors pointer-events-none">
                                                <CustomIcon name="briefcase" size={18} />
                                            </div>
                                            <input 
                                                {...register("title", { required: "Title is essential" })}
                                                className={`w-full h-12 pl-12 pr-6 bg-surface-container-low border-none rounded-2xl font-bold text-on-surface font-body text-xs transition-all ${errors.title ? 'ring-2 ring-error/50 bg-error/5' : 'focus:ring-2 focus:ring-primary/10'}`}
                                                placeholder="e.g. Lead Neural Architect" 
                                            />
                                            {errors.title && <p className="text-[9px] text-error font-black uppercase tracking-widest mt-2 ml-2">Title is required</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className={`text-[10px] font-normal lowercase tracking-[0.2em] ml-2 ${errors.category ? 'text-error' : 'text-on-surface-variant/60'}`}>mission category <span className="text-error">*</span></label>
                                        <CustomDropdown 
                                            options={jobCategories}
                                            value={formData.category}
                                            onChange={(val) => {
                                                setValue("category", val);
                                                trigger("category");
                                            }}
                                            icon="category"
                                            placeholder="select category"
                                            className={errors.category ? 'ring-2 ring-error/20 rounded-2xl' : ''}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className={`text-[10px] font-normal lowercase tracking-[0.2em] ml-2 ${errors.location ? 'text-error' : 'text-on-surface-variant/60'}`}>tactical hub <span className="text-error">*</span></label>
                                        <div className="relative group">
                                            <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center text-on-surface-variant/20 group-focus-within:text-primary transition-colors pointer-events-none">
                                                <CustomIcon name="location" size={18} />
                                            </div>
                                            <input 
                                                {...register("location", { required: "Location is required" })}
                                                className={`w-full h-12 pl-12 pr-6 bg-surface-container-low border-none rounded-2xl font-bold text-on-surface font-body text-xs focus:ring-2 focus:ring-primary/10 transition-all ${errors.location ? 'ring-2 ring-error/50 bg-error/5' : ''}`} 
                                                placeholder="City, HQ or Remote Sync" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className={`text-[10px] font-normal lowercase tracking-[0.2em] ml-2 ${errors.type ? 'text-error' : 'text-on-surface-variant/60'}`}>engagement type <span className="text-error">*</span></label>
                                        <CustomDropdown 
                                            options={jobTypes}
                                            value={formData.type}
                                            onChange={(val) => {
                                                setValue("type", val);
                                                trigger("type");
                                            }}
                                            icon="archive-book"
                                            placeholder="select type"
                                            className={errors.type ? 'ring-2 ring-error/20 rounded-2xl' : ''}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white p-10 md:p-12 rounded-[40px] border border-outline-variant/10 space-y-10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                                        <CustomIcon name="document-text" size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-on-surface font-headline tracking-tighter uppercase">Strategic Narrative</h2>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className={`text-[10px] font-normal lowercase tracking-[0.2em] ml-2 ${errors.description ? 'text-error' : 'text-on-surface-variant/60'}`}>neural description <span className="text-error">*</span></label>
                                        <div className={`quill-container rounded-3xl overflow-hidden border border-outline-variant/5 bg-surface-container-low transition-all ${errors.description ? 'ring-2 ring-error/50' : ''}`}>
                                            <ReactQuill 
                                                theme="snow"
                                                value={formData.description}
                                                onChange={(val) => {
                                                    setValue("description", val === '<p><br></p>' ? '' : val);
                                                    trigger("description");
                                                }}
                                                modules={quillModules}
                                                className="min-h-[250px] text-on-surface text-sm font-medium"
                                                placeholder="Outline the tactical objectives..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className={`text-[10px] font-normal lowercase tracking-[0.2em] ml-2 ${errors.requirements ? 'text-error' : 'text-on-surface-variant/60'}`}>technical arsenal (type & press enter) <span className="text-error">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center text-on-surface-variant/20 group-focus-within:text-primary transition-colors pointer-events-none">
                                                    <CustomIcon name="task-square" size={18} />
                                                </div>
                                                <input 
                                                    value={tempReq}
                                                    onChange={(e) => setTempReq(e.target.value)}
                                                    onKeyDown={addRequirement}
                                                    className={`w-full h-12 pl-12 pr-6 bg-surface-container-low border-none rounded-2xl font-bold text-on-surface font-body text-xs focus:ring-2 focus:ring-primary/10 transition-all ${errors.requirements ? 'ring-2 ring-error/50 bg-error/5' : ''}`} 
                                                    placeholder="Add technical mastery..." 
                                                />
                                            </div>
                                        </div>

                                        {requirementsArray.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2 px-1">
                                                <AnimatePresence>
                                                    {requirementsArray.map((req, idx) => (
                                                        <motion.div 
                                                            key={idx}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-xl group"
                                                        >
                                                            <span className="text-[10px] font-black text-primary lowercase">{req}</span>
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeRequirement(idx)}
                                                                className="text-primary/20 hover:text-primary transition-colors"
                                                            >
                                                                <CustomIcon name="close-circle" size={14} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white p-10 md:p-12 rounded-[40px] border border-outline-variant/10 space-y-12"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10">
                                        <CustomIcon name="money-send" size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-on-surface font-headline tracking-tighter uppercase">Protocol Parameters</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-normal text-on-surface-variant/60 lowercase tracking-[0.2em] ml-2">base comp min ($)</label>
                                        <input 
                                            {...register("salaryMin")}
                                            className="w-full h-12 px-6 bg-surface-container-low border-none rounded-2xl font-bold text-on-surface font-body text-xs focus:ring-2 focus:ring-primary/10" 
                                            placeholder="e.g. 120000" 
                                            type="number"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-normal text-on-surface-variant/60 lowercase tracking-[0.2em] ml-2">base comp max ($)</label>
                                        <input 
                                            {...register("salaryMax")}
                                            className="w-full h-12 px-6 bg-surface-container-low border-none rounded-2xl font-bold text-on-surface font-body text-xs focus:ring-2 focus:ring-primary/10" 
                                            placeholder="e.g. 180000" 
                                            type="number"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-normal text-on-surface-variant/60 lowercase tracking-[0.2em] ml-2">experience level</label>
                                        <CustomDropdown 
                                            options={experienceLevels}
                                            value={formData.experienceLevel}
                                            onChange={(val) => setValue("experienceLevel", val)}
                                            icon="teacher"
                                            placeholder="select level"
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-normal text-on-surface-variant/60 lowercase tracking-[0.2em] ml-2">required skills (type & press enter)</label>
                                            <div className="relative group">
                                                <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center text-on-surface-variant/20 group-focus-within:text-primary transition-colors pointer-events-none">
                                                    <CustomIcon name="flash" size={18} />
                                                </div>
                                                <input 
                                                    value={tempSkill}
                                                    onChange={(e) => setTempSkill(e.target.value)}
                                                    onKeyDown={addSkill}
                                                    className="w-full h-12 pl-12 pr-6 bg-surface-container-low border-none rounded-2xl font-bold text-on-surface font-body text-xs focus:ring-2 focus:ring-primary/10 transition-all" 
                                                    placeholder="Add required skill..." 
                                                />
                                            </div>
                                        </div>

                                        {skillsArray.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2 px-1">
                                                <AnimatePresence>
                                                    {skillsArray.map((skill, idx) => (
                                                        <motion.div 
                                                            key={idx}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 px-4 py-2 rounded-xl group"
                                                        >
                                                            <span className="text-[10px] font-black text-amber-500 lowercase">{skill}</span>
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeSkill(idx)}
                                                                className="text-amber-500/20 hover:text-amber-500 transition-colors"
                                                            >
                                                                <CustomIcon name="close-circle" size={14} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white rounded-[40px] border border-outline-variant/10 overflow-hidden shadow-2xl shadow-primary/5"
                            >
                                <div className="bg-surface-container-low p-10 md:p-12 border-b border-outline-variant/10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black tracking-widest uppercase">{formData.category}</span>
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black tracking-widest uppercase">{formData.type}</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black text-on-surface font-headline leading-none uppercase tracking-tighter">{formData.title || "Untitled Mission"}</h2>
                                            <div className="flex items-center gap-4 text-on-surface-variant/60 font-medium text-xs">
                                                <div className="flex items-center gap-2"><CustomIcon name="location" size={16} /> {formData.location || "Location TBA"}</div>
                                                <div className="flex items-center gap-2"><CustomIcon name="teacher" size={16} /> {formData.experienceLevel || "Any Experience"}</div>
                                                {(formData.salaryMin || formData.salaryMax) && (
                                                    <div className="flex items-center gap-2"><CustomIcon name="money-send" size={16} /> ${formData.salaryMin || 0} - ${formData.salaryMax || 0}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 md:p-12 space-y-12">
                                    <div className="prose prose-sm prose-primary max-w-none text-on-surface-variant/80 font-medium leading-relaxed" 
                                        dangerouslySetInnerHTML={{ __html: formData.description || "<p>No narrative provided yet.</p>" }} 
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-2">
                                                <CustomIcon name="task-square" size={16} /> Technical Arsenal
                                            </h3>
                                            <ul className="space-y-3">
                                                {requirementsArray.map((req, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5"><CustomIcon name="verify" size={12} /></div>
                                                        <span className="text-sm font-medium text-on-surface-variant">{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-2">
                                                <CustomIcon name="flash" size={16} /> Core Competencies
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {skillsArray.map((skill, i) => (
                                                    <span key={i} className="px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/5 text-[10px] font-black uppercase tracking-widest text-on-surface">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-8">
                        <button 
                            type="button"
                            onClick={currentStep === 1 ? () => router.back() : prevStep}
                            className="px-8 h-12 text-on-surface-variant/40 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:text-primary transition-all rounded-2xl border border-outline-variant/10 hover:bg-white"
                        >
                            <CustomIcon name="arrow-left-1" size={16} />
                            {currentStep === 1 ? "Abort" : "Previous Step"}
                        </button>

                        <button 
                            type="button"
                            onClick={currentStep === 4 ? handleSubmit(onSubmit) : nextStep}
                            disabled={isSubmitting || (currentStep < 4 && !isStepValid())}
                            className={`px-10 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 ${
                                currentStep < 4 && !isStepValid()
                                ? "bg-surface-container-high text-on-surface-variant/20 cursor-not-allowed"
                                : "bg-primary text-on-primary shadow-primary/20 hover:scale-[1.02] active:scale-95"
                            }`}
                        >
                            {isSubmitting ? (
                                <CustomIcon name="refresh" size={18} className="animate-spin" />
                            ) : (
                                <CustomIcon name={currentStep === 4 ? "verify" : currentStep === 3 ? "eye" : "arrow-right-1"} size={18} />
                            )}
                            {currentStep === 4 ? (isEditing ? "Update Position" : "Publish Mission") : currentStep === 3 ? "Preview Posting" : "Next Intel Phase"}
                        </button>
                    </div>
                </section>

                {/* AI Tactical Sidebar */}
                <aside className="xl:col-span-4 h-full">
                    <div className="bg-white rounded-[40px] border border-outline-variant/10 overflow-hidden relative group shadow-sm h-full flex flex-col">
                        <div className="bg-linear-to-br from-primary to-[#7000FF] p-8 text-on-primary relative overflow-hidden">
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <CustomIcon name="magic-star" size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine</span>
                                </div>
                                <h3 className="text-2xl font-black font-headline tracking-tighter">AI <span className="opacity-50 lowercase font-medium">Assistant</span>.</h3>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-8 flex-1">
                            <div className="space-y-3">
                                <label className="text-[10px] font-normal text-on-surface-variant/60 lowercase tracking-[0.2em] ml-1">strategic prompt</label>
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    className="w-full bg-surface-container-low border-none rounded-2xl p-6 focus:ring-2 focus:ring-primary/10 transition-all resize-none font-bold text-on-surface font-body text-[11px] min-h-[220px]" 
                                    placeholder="Describe the ideal candidate vibe..." 
                                />
                            </div>
                            
                            <button 
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || currentStep !== 2}
                                className={`w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all group/gen border ${
                                    currentStep !== 2 
                                    ? 'bg-surface-container-high text-on-surface-variant/20 border-outline-variant/10 cursor-not-allowed' 
                                    : 'bg-primary/5 text-primary hover:bg-primary hover:text-on-primary border-primary/10'
                                }`}
                            >
                                {isGenerating ? (
                                    <CustomIcon name="refresh" size={16} className="animate-spin" />
                                ) : (
                                    <CustomIcon name={currentStep !== 2 ? "lock" : "flash"} size={16} />
                                )}
                                {currentStep !== 2 ? "Requires Step 2 active" : (isGenerating ? "Synthesizing..." : "Generate Description")}
                            </button>

                            {aiProposals.length > 0 && (
                                <div className="space-y-4 pt-8 border-t border-outline-variant/10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {aiProposals.map((p, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => selectProposal(p)}
                                            className="p-5 rounded-2xl bg-surface-container-low hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                                        >
                                            <div 
                                                className="text-[10px] text-on-surface-variant font-medium line-clamp-[8] leading-relaxed relative overflow-hidden" 
                                                dangerouslySetInnerHTML={{ __html: p.descriptionHTML || 'No preview available' }}
                                            />
                                            {(p.requirements?.length > 0 || p.skills?.length > 0) && (
                                                <div className="mt-4 flex gap-2 flex-wrap">
                                                    <span className="text-[8px] font-black uppercase text-primary/40 tracking-widest">+ Auto-fill data included</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </form>

            <style jsx global>{`
                .quill-container .ql-toolbar {
                    border: none !important;
                    background: rgba(255, 255, 255, 0.5);
                    border-bottom: 1px solid rgba(0,0,0,0.05) !important;
                    padding: 8px 16px !important;
                }
                .quill-container .ql-container {
                    border: none !important;
                    height: 250px !important;
                }
                .quill-container .ql-editor {
                    font-family: inherit;
                    padding: 20px !important;
                    color: var(--color-on-surface);
                    line-height: 1.6;
                }
                .quill-container .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: rgba(0,0,0,0.2) !important;
                    left: 20px !important;
                    font-size: 13px;
                }
            `}</style>
        </div>
    );
};
