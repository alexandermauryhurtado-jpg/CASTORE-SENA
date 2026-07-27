'use client';

import React from 'react';
import styles from './ProfilePage.module.css';
import skeletonStyles from './ProfileSkeleton.module.css';

export function ProfileSkeleton() {
  return (
    <div className={styles.container}>
      <aside className={styles.sideCol}>
        <div className={skeletonStyles.identityCard}>
          <div className={skeletonStyles.avatar} />
          <div className={skeletonStyles.lineShort} />
          <div className={skeletonStyles.lineMedium} />
          <div className={skeletonStyles.lineShort} />
        </div>
      </aside>

      <main className={styles.mainCol}>
        <div className={styles.contentWrap}>
          <section className={skeletonStyles.section}>
            <div className={skeletonStyles.sectionTitle} />
            <div className={skeletonStyles.fieldGrid}>
              <div className={skeletonStyles.lineLong} />
              <div className={skeletonStyles.lineLong} />
            </div>
            <div className={skeletonStyles.button} />
          </section>
          <div className={styles.divider} />
          <section className={skeletonStyles.section}>
            <div className={skeletonStyles.sectionTitle} />
            <div className={skeletonStyles.fieldGrid}>
              <div className={skeletonStyles.lineLong} />
              <div className={skeletonStyles.lineLong} />
              <div className={skeletonStyles.lineLong} />
            </div>
            <div className={skeletonStyles.reqBlock} />
            <div className={skeletonStyles.button} />
          </section>
          <div className={styles.divider} />
          <section className={skeletonStyles.section}>
            <div className={skeletonStyles.sectionTitle} />
            <div className={skeletonStyles.toggleRows} />
          </section>
          <div className={styles.divider} />
          <section className={skeletonStyles.section}>
            <div className={skeletonStyles.sectionTitle} />
            <div className={skeletonStyles.sessionRows} />
          </section>
        </div>
      </main>
    </div>
  );
}
