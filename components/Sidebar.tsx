"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoIcon}>K</div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>Kolpay</span>
          <span className={styles.logoTagline}>FINANCE</span>
        </div>
      </div>

      <div className={styles.menuLabel}>MENU</div>

      <nav className={styles.nav}>
        <Link href="/admin/registration" className={`${styles.navItem} ${pathname === '/admin/registration' ? styles.active : ''}`}>
          <span className={styles.icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          </span>
          Registration Form
        </Link>
        <Link href="/admin/submissions" className={`${styles.navItem} ${pathname === '/admin/submissions' ? styles.active : ''}`}>
          <span className={styles.icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </span>
          Submissions
        </Link>
      </nav>

      <div className={styles.bottomLink}>
        <div className={styles.iconCircle}>N</div>
      </div>
    </aside>
  );
}
