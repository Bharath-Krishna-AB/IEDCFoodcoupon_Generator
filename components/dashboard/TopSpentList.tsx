import styles from './TopSpentList.module.css';

const MOCK_DATA = [
    {
        id: 1,
        name: 'Shopping',
        amount: '₹15,600',
        percent: 60,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
    },
    {
        id: 2,
        name: 'Food & Dining',
        amount: '₹6,260',
        percent: 30,
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    },
    {
        id: 3,
        name: 'Marketing',
        amount: '₹4,500',
        percent: 20,
        color: '#e6f6ec',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    }
];

export default function TopSpentList() {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Top Spent</h3>
                <button className={styles.arrowBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
            </div>

            <div className={styles.list}>
                {MOCK_DATA.map((item, index) => (
                    <div key={item.id} className={styles.listItem}>
                        <div className={styles.itemHeader}>
                            <div className={styles.itemInfo}>
                                <div className={styles.iconWrapper}>
                                    {item.icon}
                                </div>
                                <span className={styles.itemName}>{item.name}</span>
                            </div>
                            <span className={styles.itemAmount}>{item.amount}</span>
                        </div>
                        <div className={styles.progressBarBg}>
                            <div
                                className={styles.progressBarFill}
                                style={{
                                    width: `${item.percent}%`,
                                    backgroundColor: index === 2 ? 'var(--color-green)' : 'var(--color-black)'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
