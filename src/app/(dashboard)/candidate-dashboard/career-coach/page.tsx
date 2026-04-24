'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";

import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { PremiumGlassCard, AppleButton, Badge } from "@/components/ui/premium/Common";
import { SparklesIcon, BoltIcon, ChartIcon, UsersIcon } from "@/components/ui/premium/PremiumIcons";
import CustomIcon from "@/components/ui/CustomIcon";

const CareerCoachPage = () => {
    const [messages, setMessages] = useState<any[]>([
        { 
            id: '1', 
            role: 'assistant', 
            content: "Hello! I am your Elevated AI Career Coach. I've analyzed your profile and I'm ready to help you architect your next professional breakthrough. How can I assist you today?" 
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const response = await axiosInstance.post('/api/ai/career-coach', {
                message: input,
                history: history
            });

            if (response.data.response) {
                setMessages(prev => [...prev, { 
                    id: (Date.now() + 1).toString(), 
                    role: 'assistant', 
                    content: response.data.response 
                }]);
            }
        } catch (err) {
            toast.error("Neural link disrupted.");
        } finally {
            setIsTyping(false);
        }
    };

    const suggestedPrompts = [
        "Optimize CV for AI filters",
        "Prep for technical interview",
        "Explain career gap strategy",
        "Skills to learn next"
    ];

    return (
        <ProtectedRoute allowedRoles={['jobseeker']}>
            
                <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col gap-4 pb-4 px-4">
                    {/* Ultra Compact Header */}
                    <div className="flex justify-between items-center px-6 py-3 bg-white/50 border border-outline-ghost/30 rounded-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-on-surface text-white rounded-lg flex items-center justify-center shadow-glow">
                                <SparklesIcon />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-on-surface tracking-tighter leading-none">Elevated Coach v1.0</h1>
                                <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">Strategic Multi-Agent Intel</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest">Neural Sync Active</span>
                             </div>
                             <button className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
                                <CustomIcon name="more-2" size={18} />
                             </button>
                        </div>
                    </div>

                    {/* 2-Column Command Interface */}
                    <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
                        {/* Chat Sector */}
                        <div className="flex-1 flex flex-col bg-white border border-outline-ghost/30 rounded-[2rem] overflow-hidden shadow-shell relative">
                            {/* Dialogue Stream */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                                <AnimatePresence initial={false}>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] flex flex-col gap-1.5 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div className={`flex items-center gap-2 px-1 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest">
                                                        {message.role === 'user' ? 'Explorer' : 'Coach Agent'}
                                                    </span>
                                                </div>
                                                <div className={`p-4 rounded-2xl leading-relaxed text-sm ${
                                                    message.role === 'user' 
                                                    ? 'bg-on-surface text-white font-medium' 
                                                    : 'bg-surface-soft border border-outline-ghost/20 text-on-surface shadow-sm'
                                                }`}>
                                                    <div className="prose prose-sm prose-on-surface max-w-none whitespace-pre-wrap">
                                                        {message.content}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                {isTyping && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-surface-soft p-4 rounded-2xl flex items-center gap-1.5 border border-outline-ghost/20">
                                            <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce"></span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={scrollRef} className="h-2 w-full"></div>
                            </div>

                            {/* Input Core Area */}
                            <div className="p-4 bg-white border-t border-outline-ghost/20">
                                <form 
                                    onSubmit={handleSendMessage} 
                                    className="relative group max-w-4xl mx-auto flex items-end gap-2 bg-surface-soft/50 border border-outline-ghost/30 rounded-xl px-4 py-2 focus-within:bg-white focus-within:border-primary/30 transition-all"
                                >
                                    <textarea
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        rows={1}
                                        placeholder="Command your career path..."
                                        className="flex-1 bg-transparent border-none py-2 font-bold text-[13px] text-on-surface outline-none resize-none max-h-[80px] scrollbar-hide"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!input.trim() || isTyping}
                                        className="mb-1 w-9 h-9 bg-on-surface text-white rounded-lg flex items-center justify-center hover:bg-primary transition-all active:scale-90 disabled:opacity-20 shrink-0"
                                    >
                                        <BoltIcon />
                                    </button>
                                </form>
                                <p className="text-center text-[8px] font-black text-on-surface-variant/20 uppercase tracking-[0.4em] mt-3">Neural output requires human validation.</p>
                            </div>
                        </div>

                        {/* Intelligence Sidebar (Desktop Only) */}
                        <div className="hidden lg:flex w-80 flex-col gap-4 overflow-y-auto scrollbar-hide">
                            <PremiumGlassCard variant="white" className="p-5 space-y-5">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-black text-on-surface uppercase tracking-widest">Strategic Prompts</h3>
                                    <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase">Optimized Query Templates</p>
                                </div>
                                <div className="space-y-2">
                                    {suggestedPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => setInput(prompt)}
                                            className="w-full text-left p-3 rounded-xl border border-outline-ghost/30 text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest hover:bg-white hover:border-primary/20 hover:text-primary transition-all active:scale-95 flex items-center gap-3"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </PremiumGlassCard>

                            <PremiumGlassCard variant="dark" className="p-5 space-y-4 bg-on-surface">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <BoltIcon />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Coach Insight</h4>
                                    <p className="text-[10px] font-medium text-white/40 leading-relaxed">
                                        Focus on quantifying your impact. Use phrases like "increased efficiency by 30%" or "managed 10+ agents".
                                    </p>
                                </div>
                                <Link href="/profile" className="block pt-2">
                                    <AppleButton label="Refine Profile Data" tone="primary" className="w-full !h-8 !text-[9px]" />
                                </Link>
                            </PremiumGlassCard>
                        </div>
                    </div>
                </div>
            
        </ProtectedRoute>
    );
};

export default CareerCoachPage;

