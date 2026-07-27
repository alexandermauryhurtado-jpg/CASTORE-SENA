"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  Users,
  Grid,
  MapPin
} from "lucide-react";
import styles from "./Sidebar.module.css";

const MAIN_MENU = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Productos", href: "/products", icon: Package },
  { name: "Alertas de stock", href: "/alerts", icon: AlertTriangle },
  { name: "Movimiento de productos", href: "/movements", icon: ArrowRightLeft },
  { name: "Ubicaciones", href: "/locations", icon: MapPin },
];

const OTHERS_MENU = [
  { name: "Proveedores", href: "/suppliers", icon: Truck },
  { name: "Manejo de usuarios", href: "/users", icon: Users },
  { name: "Categorias", href: "/categories", icon: Grid },
  { name: "Roles", href: "/roles", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderLinks = (links: typeof MAIN_MENU) => {
    return (
      <ul className={styles.menuList}>
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <li key={link.name} className={styles.menuItem}>
              <Link
                href={link.href}
                className={clsx(styles.menuLink, {
                  [styles.menuLinkActive]: isActive,
                })}
              >
                <Icon className={styles.icon} />
                <span>{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Menú principal</h3>
        {renderLinks(MAIN_MENU)}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Otros</h3>
        {renderLinks(OTHERS_MENU)}
      </div>
    </aside>
  );
}
