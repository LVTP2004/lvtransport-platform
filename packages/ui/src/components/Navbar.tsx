import type { ReactNode } from 'react';

export function Navbar({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <header className='sticky top-0 z-30 flex h-14 items-center justify-between border-b border-lv-slate bg-lv-black/95 px-4 backdrop-blur md:h-16 md:px-6'>
      <div className='flex items-center gap-3'>{left}</div>
      {right ? <div className='flex items-center gap-2'>{right}</div> : null}
    </header>
  );
}
