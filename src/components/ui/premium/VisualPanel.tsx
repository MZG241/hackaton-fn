import React from 'react';
import Image from 'next/image';
import { ChartIcon, ShieldIcon } from './AuthIcons';

interface VisualPanelProps {
  visual: {
    metric: string;
    metricLabel: string;
    heading: string;
    copy: string;
    image?: string;
  };
}

export const VisualPanel: React.FC<VisualPanelProps> = ({ visual }) => {
  if (visual.image) {
    return (
      <section className="relative h-full overflow-hidden rounded-panel bg-surface-soft border border-outline-ghost/30">
        <Image
          src={visual.image}
          alt="Auth visual"
          fill
          className="object-cover rounded-panel transition-transform duration-700 hover:scale-105"
        />
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden rounded-panel bg-hero-glow p-5 text-white shadow-glow lg:min-h-[min(700px,calc(100vh-3.5rem))] lg:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%)]"></div>
      <div className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
      <div className="absolute bottom-12 right-8 h-44 w-44 rounded-full bg-accent/20 blur-3xl"></div>

      <div className="relative flex h-full w-full flex-col justify-center gap-8">
        <div className="flex items-start justify-end gap-3">
          <div className="flex gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur-xl">
              <ChartIcon />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur-xl">
              <ShieldIcon />
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[240px] flex-1 items-center justify-center">
          <div className="absolute h-[64%] w-[64%] rounded-full border border-white/10 bg-white/5 blur-2xl"></div>
          <div className="relative z-10 h-auto max-h-[clamp(220px,38vh,420px)] w-full max-w-[min(100%,22rem)] aspect-square">
            <Image
              src="/auth-visual.svg"
              alt="Premium auth illustration"
              fill
              className="animate-floaty select-none object-contain"
            />
          </div>
          <div className="absolute left-0 top-4 rounded-[24px] border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-xl sm:left-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Smart match</p>
            <p className="mt-1.5 text-sm font-bold sm:text-base">{visual.metric}</p>
            <p className="mt-1 max-w-[9rem] text-xs leading-5 text-white/70">{visual.metricLabel}</p>
          </div>
          <div className="absolute bottom-2 right-0 max-w-[12rem] rounded-[24px] border border-white/10 bg-white/10 p-3 backdrop-blur-xl sm:right-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Workflow</p>
            <div className="mt-2.5 flex gap-2">
              <span className="h-1.5 w-8 rounded-full bg-white"></span>
              <span className="h-1.5 w-8 rounded-full bg-white/35"></span>
              <span className="h-1.5 w-8 rounded-full bg-white/20"></span>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="font-display text-xl font-extrabold leading-tight text-white lg:text-[1.55rem]">
            {visual.heading}
          </h2>
          <p className="max-w-md text-[0.94rem] leading-6 text-white/72">
            {visual.copy}
          </p>
        </div>
      </div>
    </section>
  );
};
