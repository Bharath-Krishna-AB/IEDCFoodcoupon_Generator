"use client";
import React, { useState, useEffect } from 'react';
import styles from './ScannerView.module.css';

export default function ScannerView() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    // Simulate a scan after 3 seconds for demonstration
    useEffect(() => {
        if (!isScanning) return;
        const timer = setTimeout(() => {
            setScanResult('COUPON-V7X9-2026');
            setIsScanning(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [isScanning]);

    const handleScanAgain = () => {
        setScanResult(null);
        setIsScanning(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Scan Food Coupon</h1>
                <p className={styles.subtitle}>Align the QR code within the frame to scan</p>
            </div>

            <div className={styles.scannerCard}>
                {!scanResult ? (
                    <>
                        <div className={styles.scannerWrapper}>
                            <div className={styles.cameraSim}>
                                <div className={styles.cameraIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <p style={{ marginTop: '12px', color: '#999', fontSize: '14px', fontWeight: 600 }}>Camera Active (Simulated)</p>
                                </div>
                            </div>
                            <div className={styles.overlay}></div>
                            <div className={styles.scanLine}></div>
                        </div>
                        <button className={styles.actionButton}>
                            Enter Code Manually
                        </button>
                    </>
                ) : (
                    <div className={styles.resultCard}>
                        <div className={styles.resultTitle}>Scan Successful!</div>
                        <div className={styles.resultData}>{scanResult}</div>
                        <button
                            className={styles.actionButton}
                            onClick={handleScanAgain}
                            style={{ margin: '16px 0 0', background: '#1e1e1e' }}
                        >
                            Scan Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
