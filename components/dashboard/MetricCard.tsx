import { ReactNode } from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
    title: string;
    amount: string;
    badgeText?: string;
    badgeType?: 'green' | 'red' | 'default';
    icon: ReactNode;
}

export default function MetricCard({ title, amount, badgeText, badgeType = 'default', icon }: MetricCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={`${styles.iconWrapper} ${styles[`icon-${badgeType}`]}`}>
                    {icon}
                </div>
                {badgeText && (
                    <span className={`${styles.badge} ${styles[`badge-${badgeType}`]}`}>
                        {badgeText}
                    </span>
                )}
            </div>
            <div className={styles.content}>
                <span className={styles.title}>{title}</span>
                <span className={styles.amount}>{amount}</span>
            </div>
        </div>
    );
}
