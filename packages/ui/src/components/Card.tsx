import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-lv-slate bg-lv-charcoal p-4 md:p-6 shadow-gold-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
