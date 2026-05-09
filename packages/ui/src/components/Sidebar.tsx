import type { ReactNode } from 'react';

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className='w-full max-w-[280px] border-r border-lv-slate bg-lv-charcoal p-3 md:p-4'>
      <nav className='space-y-2'>{children}</nav>
    </aside>
  );
}
