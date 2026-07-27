"use client";

import React from "react";
import { Bell } from "lucide-react";
import styles from "./Topbar.module.css";
import { UserDropdown } from "./UserDropdown";

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.logo}>CA STORE</h1>

      <div className={styles.rightSection}>
        <div className={styles.notificationsWrapper}>
          <button className={styles.iconButton} aria-label="Notificaciones">
            <Bell size={20} />
            <span className={styles.badge}>5</span>
          </button>
        </div>

        <div className={styles.verticalDivider} />

        <UserDropdown />
      </div>
    </header>
  );
}
