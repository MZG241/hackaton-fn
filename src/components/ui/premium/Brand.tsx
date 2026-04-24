import React from 'react';
import { SparkleIcon } from './AuthIcons';

export const Brand: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-gradient text-white shadow-glow">
        <SparkleIcon />
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold tracking-tight text-on-surface">Akazi</p>
        <p className="mt-0.5 text-xs text-text-soft">AI recruitment ecosystem</p>
      </div>
    </div>
  );
};
