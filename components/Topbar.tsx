import styles from './Topbar.module.css';

export default function Topbar() {
    return (
        <header className={styles.topbar}>
            <div className={styles.searchContainer}>
                <span className={styles.searchIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </span>
                <input
                    type="text"
                    placeholder="Search for metrics or sett..."
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.actions}>
                <button className={styles.iconButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    <span className={styles.notificationDot}></span>
                </button>

                <div className={styles.profileBadge}>
                    <div className={styles.profileInfo}>
                        <span className={styles.profileName}>2007bharathab</span>
                        <span className={styles.profileStatus}>PRO USER</span>
                    </div>
                    <div className={styles.profileAvatar}>2</div>
                    <div className={styles.logoutButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </div>
                </div>
            </div>
        </header>
    );
}
