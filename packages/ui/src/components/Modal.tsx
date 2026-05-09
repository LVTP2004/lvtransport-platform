import type { ReactNode } from 'react';

export function Modal({ open, title, children }: { open: boolean; title: string; children: ReactNode }) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 md:items-center'>
      <div className='w-full max-w-lg rounded-2xl border border-lv-gold/30 bg-lv-charcoal p-5 shadow-gold-lg'>
        <h2 className='mb-3 font-display text-xl font-semibold text-white'>{title}</h2>
        <div className='text-sm text-lv-mist'>{children}</div>
      </div>
    </div>
  );
}
