"use client";

import React from "react";
import { Topbar } from "../Topbar/Topbar";
import { Sidebar } from "../Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.layoutWrapper}>
      <Topbar />
      <div className={styles.mainContent}>
        <Sidebar />
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
