import React from 'react';
import { VisualPanel } from './VisualPanel';

interface AuthShellProps {
  children: React.ReactNode;
  visual: {
    metric: string;
    metricLabel: string;
    heading: string;
    copy: string;
    image?: string;
  };
  swapLayout?: boolean;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children, visual, swapLayout = false }) => {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-5 lg:px-8 bg-surface">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-shell border border-outline-ghost bg-white/92 p-2.5 shadow-shell backdrop-blur-2xl lg:p-3 animate-slide-up">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(67,85,185,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(134,151,255,0.12),transparent_28%)]"></div>

          <div className="relative grid gap-3 lg:h-[min(700px,calc(100vh-3.5rem))] lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
            <div className={`h-full min-h-0 ${swapLayout ? "lg:order-2" : "lg:order-1"}`}>
              {children}
            </div>
            <div className={`hidden h-full min-h-0 lg:block ${swapLayout ? "lg:order-1" : "lg:order-2"}`}>
              <VisualPanel visual={visual} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
