"use client"
import { useState } from 'react';
import styles from './CashFlowChart.module.css';

export default function CashFlowChart() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h3 className={styles.title}>Cash Flow</h3>
                    <p className={styles.subtitle}>Income vs Expenses (Simulated Range)</p>
                </div>
                <div className={styles.dropdown}>
                    <button
                        className={styles.dropdownBtn}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        Last 7 days
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                </div>
            </div>

            <div className={styles.chartArea}>
                <div className={styles.yAxis}>
                    <span>80000</span>
                    <span>35000</span>
                    <span>90000</span>
                    <span>45000</span>
                </div>

                <div className={styles.chartContainer}>
                    {/* Horizontal grid lines */}
                    <div className={styles.gridLine} style={{ top: '0%' }}></div>
                    <div className={styles.gridLine} style={{ top: '33.33%' }}></div>
                    <div className={styles.gridLine} style={{ top: '66.66%' }}></div>
                    <div className={styles.gridLine} style={{ top: '100%' }}></div>

                    {/* Simulated chart line */}
                    <svg className={styles.chartSvg} viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>

                        <path
                            d="M0 200 C50 150, 80 50, 150 120 C180 150, 220 250, 300 180 C350 130, 400 30, 500 80 L500 200 Z"
                            fill="url(#chartGradient)"
                        />

                        <path
                            d="M0 200 C50 150, 80 50, 150 120 C180 150, 220 250, 300 180 C350 130, 400 30, 500 80"
                            fill="none"
                            stroke="var(--text-green)"
                            strokeWidth="3"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
