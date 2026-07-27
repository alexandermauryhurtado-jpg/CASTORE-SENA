'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '../../src/components/layout/Sidebar/Sidebar';
import { Topbar } from '../../src/components/layout/Topbar/Topbar';
import { useAuthStore } from '../../src/store/auth.store';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.firstLogin && pathname !== '/change-password') {
      router.replace('/change-password');
    }
  }, [user?.firstLogin, pathname, router]);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
