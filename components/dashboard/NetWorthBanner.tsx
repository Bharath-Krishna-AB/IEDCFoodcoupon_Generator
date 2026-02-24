import styles from './NetWorthBanner.module.css';

export default function NetWorthBanner() {
    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <h2 className={styles.title}>Total Net Worth</h2>
                <div className={styles.amountContainer}>
                    <span className={styles.amount}>₹821,510</span>
                    <span className={styles.badge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        +4.2% SINCE LAST MONTH
                    </span>
                </div>
                <p className={styles.description}>
                    Your overall financial health across all connected accounts. Cash flow is positive this period with a net surplus of ₹333,281.
                </p>
            </div>

            <div className={styles.graphicArea}>
                <div className={styles.bankGraphic}>
                    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 20L180 60H20L100 20Z" fill="var(--bg-body)" />
                        <rect x="40" y="70" width="20" height="60" rx="4" fill="var(--bg-body)" />
                        <rect x="90" y="70" width="20" height="60" rx="4" fill="var(--bg-body)" />
                        <rect x="140" y="70" width="20" height="60" rx="4" fill="var(--bg-body)" />
                        <rect x="20" y="140" width="160" height="10" rx="4" fill="var(--bg-body)" />
                    </svg>
                </div>
                <button className={styles.actionButton}>View Ledger</button>
            </div>
        </div>
    );
}
