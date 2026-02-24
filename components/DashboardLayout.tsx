import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className={styles.layoutWrapper}>
            <Sidebar />
            <div className={styles.mainContent}>
                <Topbar />
                <main className={styles.pageContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}
