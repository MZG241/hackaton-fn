import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './AuthIcons';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({ label, type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-text-soft">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`h-12 w-full appearance-none rounded-field border border-outline-soft bg-surface-soft px-4 ${isPassword ? 'pr-12' : ''} text-sm text-on-surface caret-primary outline-none placeholder:text-text-faint transition-all duration-300 ease-auth focus:border-primary/30 focus:bg-surface-strong`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-text-soft transition-colors duration-300 ease-auth hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </label>
  );
};

export const PremiumButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`inline-flex h-12 w-full items-center justify-center rounded-field bg-primary-gradient px-5 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-auth hover:scale-[0.995] hover:shadow-float disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
};
