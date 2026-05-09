import type { ReactNode } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export function AdminDashboardLayout({
  brand,
  navActions,
  sidebar,
  children
}: {
  brand: ReactNode;
  navActions?: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className='min-h-screen bg-lv-black text-white'>
      <Navbar left={brand} right={navActions} />
      <div className='flex flex-col md:flex-row'>
        <Sidebar>{sidebar}</Sidebar>
        <main className='flex-1 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
