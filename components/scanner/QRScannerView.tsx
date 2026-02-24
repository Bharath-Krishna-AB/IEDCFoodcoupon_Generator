"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import styles from './QRScannerView.module.css';

interface Registration {
    id: string;
    team_name: string;
    full_name: string;
    phone: string;
    email: string;
    college: string;
    food_preference: string;
    total_price: number;
    payment_ref: string;
    payment_status: string;
    verification_code: number;
    is_verified: boolean;
    created_at: string;
}

type ViewState = 'scanning' | 'loading' | 'details' | 'result';
type ResultType = 'success' | 'error' | 'warning';

export default function QRScannerView() {
    const [viewState, setViewState] = useState<ViewState>('scanning');
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [scannedCode, setScannedCode] = useState<string>('');
    const [scannedId, setScannedId] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [resultType, setResultType] = useState<ResultType>('success');
    const [resultTitle, setResultTitle] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = 'qr-scanner-region';
    const isStartingRef = useRef(false);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                    await scannerRef.current.stop();
                }
            } catch {
                // Scanner may already be stopped
            }
        }
    }, []);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        // Immediately stop scanning to prevent duplicate reads
        await stopScanner();

        setViewState('loading');

        try {
            // Parse QR data — expects {"id": "...", "couponCode": "..."}
            let parsed: { id: string; couponCode: string };
            try {
                parsed = JSON.parse(decodedText);
            } catch {
                setResultType('error');
                setResultTitle('Invalid QR Code');
                setResultMessage('This QR code is not a valid food coupon.');
                setViewState('result');
                return;
            }

            if (!parsed.id || !parsed.couponCode) {
                setResultType('error');
                setResultTitle('Invalid QR Code');
                setResultMessage('The scanned QR code does not contain valid coupon data.');
                setViewState('result');
                return;
            }

            setScannedId(parsed.id);
            setScannedCode(parsed.couponCode);

            // Look up registration
            const res = await fetch(`/api/scan-verify?id=${encodeURIComponent(parsed.id)}`);
            const data = await res.json();

            if (!res.ok) {
                setResultType('error');
                setResultTitle('Not Found');
                setResultMessage(data.error || 'Registration not found for this QR code.');
                setViewState('result');
                return;
            }

            setRegistration(data.registration);
            setViewState('details');
        } catch (err) {
            console.error('Scan processing error:', err);
            setResultType('error');
            setResultTitle('Error');
            setResultMessage('Something went wrong while looking up this coupon.');
            setViewState('result');
        }
    }, [stopScanner]);

    const startScanner = useCallback(async () => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        try {
            await stopScanner();

            // Small delay to ensure DOM is ready
            await new Promise(r => setTimeout(r, 200));

            const el = document.getElementById(scannerContainerId);
            if (!el) {
                isStartingRef.current = false;
                return;
            }

            // Clear any leftover content
            el.innerHTML = '';

            const scanner = new Html5Qrcode(scannerContainerId, {
                verbose: false,
            });
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 15,             // High FPS for fast scanning
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    disableFlip: false,
                },
                handleScanSuccess,
                () => { /* ignore scan failures (no QR in frame) */ }
            );
        } catch (err) {
            console.error('Failed to start scanner:', err);
            // If camera access fails, show error
            setResultType('error');
            setResultTitle('Camera Access Denied');
            setResultMessage('Please allow camera access to scan QR codes. Check your browser settings and try again.');
            setViewState('result');
        } finally {
            isStartingRef.current = false;
        }
    }, [handleScanSuccess, stopScanner]);

    useEffect(() => {
        if (viewState === 'scanning') {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [viewState, startScanner, stopScanner]);

    const handleVerify = async () => {
        if (!scannedId || !scannedCode || !registration) return;

        setIsVerifying(true);

        try {
            const res = await fetch('/api/scan-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: scannedId, couponCode: scannedCode }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setResultType('success');
                setResultTitle('Verified Successfully!');
                setResultMessage(`${registration.team_name}'s coupon has been verified. Food may be served.`);
            } else if (data.alreadyVerified) {
                setResultType('warning');
                setResultTitle('Already Verified');
                setResultMessage(`This coupon for ${registration.team_name} has already been used.`);
            } else {
                setResultType('error');
                setResultTitle('Verification Failed');
                setResultMessage(data.error || 'The verification code does not match.');
            }
        } catch (err) {
            console.error('Verify error:', err);
            setResultType('error');
            setResultTitle('Error');
            setResultMessage('Something went wrong during verification.');
        } finally {
            setIsVerifying(false);
            setViewState('result');
        }
    };

    const handleScanAgain = () => {
        setRegistration(null);
        setScannedCode('');
        setScannedId('');
        setResultType('success');
        setResultTitle('');
        setResultMessage('');
        setViewState('scanning');
    };

    const handleBack = () => {
        setRegistration(null);
        setScannedCode('');
        setScannedId('');
        setViewState('scanning');
    };

    // ===== SCANNING VIEW =====
    if (viewState === 'scanning' || viewState === 'loading') {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Scan Coupon</h1>
                    <p className={styles.subtitle}>Point your camera at the QR code on the food coupon.</p>
                </div>

                <div className={styles.scannerCard}>
                    <div className={styles.scannerWrapper}>
                        <div id={scannerContainerId} style={{ width: '100%' }} />
                    </div>

                    {viewState === 'loading' ? (
                        <div className={styles.scannerHint}>
                            <div className={styles.spinner} />
                            <span>Looking up registration...</span>
                        </div>
                    ) : (
                        <div className={styles.scannerHint}>
                            <div className={styles.scannerHintDot} />
                            <span>Scanner active — waiting for QR code</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ===== DETAILS VIEW =====
    if (viewState === 'details' && registration) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Registration Details</h1>
                    <p className={styles.subtitle}>Review the details below and verify the coupon.</p>
                </div>

                <div className={styles.detailsCard}>
                    <div className={styles.detailsTitle}>{registration.team_name}</div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Team / Name</span>
                            <span className={styles.detailValue}>{registration.full_name || registration.team_name}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>College</span>
                            <span className={styles.detailValue}>{registration.college}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Phone</span>
                            <span className={styles.detailValue}>{registration.phone}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Email</span>
                            <span className={styles.detailValue}>{registration.email}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Food</span>
                            <span className={styles.detailValue}>{registration.food_preference}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Total Paid</span>
                            <span className={styles.detailValue}>₹{registration.total_price}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Payment</span>
                            <span className={styles.detailValue}>
                                {registration.payment_status === 'pending' ? (
                                    <span className={styles.badgePending}>⏳ Pending</span>
                                ) : (
                                    <span className={styles.badgeVerified}>✓ Paid</span>
                                )}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Verified</span>
                            <span className={styles.detailValue}>
                                {registration.is_verified ? (
                                    <span className={styles.badgeVerified}>✓ Yes</span>
                                ) : (
                                    <span className={styles.badgeNotVerified}>✗ Not Yet</span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.backButton} onClick={handleBack}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back
                        </button>
                        <button
                            className={styles.verifyButton}
                            onClick={handleVerify}
                            disabled={isVerifying || registration.is_verified}
                        >
                            {isVerifying ? (
                                <>
                                    <div className={styles.spinner} />
                                    Verifying...
                                </>
                            ) : registration.is_verified ? (
                                'Already Verified'
                            ) : (
                                <>
                                    Verify Coupon
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== RESULT VIEW =====
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Scan Coupon</h1>
                <p className={styles.subtitle}>Point your camera at the QR code on the food coupon.</p>
            </div>

            <div className={styles.resultCard}>
                <div className={`${styles.resultIcon} ${resultType === 'success' ? styles.resultIconSuccess :
                        resultType === 'warning' ? styles.resultIconWarning :
                            styles.resultIconError
                    }`}>
                    {resultType === 'success' ? (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : resultType === 'warning' ? (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    ) : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    )}
                </div>

                <div className={styles.resultTitle}>{resultTitle}</div>
                <p className={styles.resultMessage}>{resultMessage}</p>

                <button className={styles.scanAgainButton} onClick={handleScanAgain}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6" />
                        <path d="M1 20v-6h6" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Scan Another
                </button>
            </div>
        </div>
    );
}
