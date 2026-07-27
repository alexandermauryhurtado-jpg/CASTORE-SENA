'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Bell,
  ArrowLeftRight,
  Building2,
  Users,
  FolderTree,
  MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';
import styles from './Sidebar.module.css';

import { useAuth } from '../../../hooks/useAuth';
import { useAlertsSummary } from '../../../features/alerts/hooks/useAlerts';

const menuItems = [
  { group: 'Principal', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    { label: 'Productos', href: '/products', icon: Package, module: 'products' },
    { label: 'Alertas', href: '/alerts', icon: Bell, badge: true, module: 'alerts' },
    { label: 'Movimientos', href: '/movements', icon: ArrowLeftRight, module: 'movements' },
  ]},
  { group: 'Gestión', items: [
    { label: 'Proveedores', href: '/suppliers', icon: Building2, module: 'suppliers' },
    { label: 'Usuarios', href: '/users', icon: Users, module: 'users' },
    { label: 'Categorías', href: '/categories', icon: FolderTree, module: 'categories' },
    { label: 'Localizaciones', href: '/locations', icon: MapPin, module: 'locations' },
  ]}
];

export function Sidebar() {
  const pathname = usePathname();
  const { canRead } = useAuth();
  const { activeCount } = useAlertsSummary();

  const filteredMenu = menuItems.map(group => ({
    ...group,
    items: group.items.filter(item => canRead(item.module))
  })).filter(group => group.items.length > 0);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logoCircle}>
          <Package className={styles.logoIcon} />
        </div>
        <h1 className={styles.logoText}>CA STORE</h1>
      </div>

      <nav className={styles.nav}>
        {filteredMenu.map((group, idx) => (
          <div key={idx} className={styles.group}>
            <span className={styles.groupLabel}>{group.group}</span>
            <div className={styles.menu}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.menuItem, pathname === item.href && styles.active)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {item.badge && activeCount > 0 && (
                    <span className={styles.badge}>{activeCount > 99 ? '99+' : activeCount}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
}
