"use client";
import React, { useState, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import styles from './VerificationView.module.css';

export default function VerificationView() {
    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<'success' | 'error' | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        // Only take the last character typed if they type fast
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Auto-focus previous input on backspace if current is empty
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').substring(0, 6);

        if (pastedData) {
            const newCode = [...code];
            pastedData.split('').forEach((char, i) => {
                newCode[i] = char;
            });
            setCode(newCode);

            // Focus the empty input after pasted data, or the last one if full
            const nextFocusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextFocusIndex]?.focus();
        }
    };

    const handleVerify = (e: FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');

        if (fullCode.length !== 6) return;

        setIsVerifying(true);
        setResult(null);

        // Simulate API call for verification
        setTimeout(() => {
            setIsVerifying(false);
            if (fullCode === '123456') {
                // Example generic failure
                setResult('error');
            } else {
                // Succeed on everything else for demo
                setResult('success');
            }
        }, 1500);
    };

    const handleReset = () => {
        setCode(Array(6).fill(''));
        setResult(null);
        inputRefs.current[0]?.focus();
    };

    const isComplete = code.every(digit => digit !== '');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Verify Code</h1>
                <p className={styles.subtitle}>Enter the 6-digit coupon code provided by the attendee.</p>
            </div>

            <div className={styles.verificationCard}>
                {!result ? (
                    <form onSubmit={handleVerify} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className={styles.inputGroup} onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength={2} // Allows catching fast typing
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={styles.codeInput}
                                    disabled={isVerifying}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className={styles.actionButton}
                            disabled={!isComplete || isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                ) : (
                    <div className={`${styles.resultCard} ${result === 'success' ? styles.successCard : styles.errorCard}`}>
                        <div className={styles.resultTitle}>
                            {result === 'success' ? 'Verification Successful!' : 'Invalid Code'}
                        </div>
                        <p className={result === 'success' ? styles.successText : styles.errorText}>
                            {result === 'success'
                                ? 'The code was valid. Food may be served.'
                                : 'The code entered does not match any valid registration.'}
                        </p>

                        <button
                            className={styles.actionButton}
                            onClick={handleReset}
                            style={{ margin: '16px 0 0', background: result === 'success' ? '#1f7a37' : '#cc0000' }}
                        >
                            Verify Another Code
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
