import React from 'react';

export const SparkleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
    <path d="M20 5.5c1.1 4.8 2.4 6.1 7.2 7.2-4.8 1.1-6.1 2.4-7.2 7.2-1.1-4.8-2.4-6.1-7.2-7.2 4.8-1.1 6.1-2.4 7.2-7.2Z" fill="currentColor"/>
    <path d="M30.2 19.4c.62 2.68 1.34 3.4 4.02 4.02-2.68.62-3.4 1.34-4.02 4.02-.62-2.68-1.34-3.4-4.02-4.02 2.68-.62 3.4-1.34 4.02-4.02Z" fill="currentColor"/>
    <path d="M11 21.4c.82 3.56 1.78 4.52 5.34 5.34-3.56.82-4.52 1.78-5.34 5.34-.82-3.56-1.78-4.52-5.34-5.34 3.56-.82 4.52-1.78 5.34-5.34Z" fill="currentColor"/>
  </svg>
);

export const ArrowLeftIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowRightIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChartIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M4 17.5 9 12l3.2 3.2 7.8-8.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 7h2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ShieldIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 3.7 5.7 6v5.7c0 4.03 2.51 7.55 6.3 8.87 3.79-1.32 6.3-4.84 6.3-8.87V6L12 3.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m9.8 12 1.45 1.45L14.8 9.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GoogleIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.32-2.04 3.04l3.3 2.56c1.92-1.76 3.04-4.36 3.04-7.46 0-.72-.06-1.4-.2-2.04H12Z"/>
    <path fill="#34A853" d="M12 22c2.76 0 5.08-.9 6.77-2.44l-3.3-2.56c-.92.62-2.1 1-3.47 1-2.66 0-4.92-1.8-5.72-4.22l-3.42 2.64A10.23 10.23 0 0 0 12 22Z"/>
    <path fill="#4A90E2" d="M6.28 13.78A6.15 6.15 0 0 1 5.96 12c0-.62.1-1.22.32-1.78L2.86 7.58A10.07 10.07 0 0 0 1.78 12c0 1.62.38 3.16 1.08 4.42l3.42-2.64Z"/>
    <path fill="#FBBC05" d="M12 5.96c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.08 2.96 14.76 2 12 2a10.23 10.23 0 0 0-9.14 5.58l3.42 2.64C7.08 7.76 9.34 5.96 12 5.96Z"/>
  </svg>
);

export const AppleIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M15.1 3.5c0 1-.4 2-1 2.7-.8.8-1.9 1.3-2.9 1.2-.1-1 .3-2 .9-2.7.8-.8 2-1.3 3-1.2ZM18.2 17.5c-.5 1.1-.8 1.6-1.4 2.5-.8 1.2-1.9 2.8-3.3 2.8-1.2 0-1.5-.8-3.1-.8-1.6 0-2 .8-3.1.8-1.4 0-2.4-1.4-3.2-2.6C1.9 17.2 1.6 13.8 3 11.6c1-1.5 2.5-2.4 4-2.4 1.5 0 2.4.8 3.6.8 1.1 0 1.8-.8 3.6-.8 1.4 0 2.9.8 3.9 2.2-3.4 1.9-2.9 6.8.1 8.1Z"/>
  </svg>
);

export const EyeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M2.5 12S6.2 5.75 12 5.75 21.5 12 21.5 12 17.8 18.25 12 18.25 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

export const EyeOffIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M3.5 3.5 20.5 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10.58 6.02A8.8 8.8 0 0 1 12 5.9c5.8 0 9.5 6.1 9.5 6.1a16.2 16.2 0 0 1-3.05 3.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.14 7.64A16.64 16.64 0 0 0 2.5 12s3.7 6.1 9.5 6.1c1.44 0 2.75-.38 3.9-.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.88 9.88A3 3 0 0 0 14.12 14.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
