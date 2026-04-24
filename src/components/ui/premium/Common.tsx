import React from 'react';

export const Badge: React.FC<{ label: string; tone?: 'default' | 'success' | 'warning' | 'primary', className?: string }> = ({ label, tone = "default", className = "" }) => {
  const tones = {
    default: "bg-surface-soft text-text-soft",
    success: "bg-[rgba(15,159,114,0.14)] text-success",
    warning: "bg-[rgba(255,182,72,0.16)] text-[#a86d15]",
    primary: "bg-primary-ghost text-primary",
  };
  return (
    <span className={`inline-flex rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tones[tone]} ${className}`}>
      {label}
    </span>
  );
};

export const AppleButton: React.FC<{ label: string; tone?: 'primary' | 'secondary' | 'ghost', onClick?: () => void, className?: string }> = ({ label, tone = "primary", onClick, className = "" }) => {
  const styles = {
    primary: "bg-primary-gradient text-white border-transparent shadow-glow hover:shadow-float",
    secondary: "bg-surface-strong text-on-surface border border-outline-soft hover:bg-surface-soft",
    ghost: "bg-transparent text-primary border border-primary/15 hover:bg-primary-ghost",
  };

  return (
    <button 
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-pill px-5 text-sm font-semibold transition-all duration-300 ease-auth cursor-pointer ${styles[tone]} ${className}`}
    >
      {label}
    </button>
  );
};

export const PremiumGlassCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string;
    onClick?: () => void;
    variant?: 'white' | 'glass' | 'aurora' | 'dark';
}> = ({ children, className = "", variant = 'white', onClick }) => {
    const variants = {
        white: "bg-white border-outline-ghost shadow-shell hover:shadow-float",
        glass: "bg-white/40 backdrop-blur-xl border-white/20 shadow-shell hover:bg-white/50",
        aurora: "aurora-card",
        dark: "bg-on-surface text-white shadow-float"
    };

    return (
        <div 
            onClick={onClick}
            className={`rounded-panel border transition-all duration-500 overflow-hidden ${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
