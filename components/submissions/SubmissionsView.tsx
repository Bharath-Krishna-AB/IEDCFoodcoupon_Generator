"use client";
import React, { useState, useEffect } from 'react';
import styles from './SubmissionsView.module.css';
import { supabase } from '@/lib/supabase';

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
    payment_status: 'Verified' | 'Pending' | 'Rejected' | 'pending';
    verification_code: number | null;
    screenshot_url: string;
    created_at: string;
    is_verified: boolean;
}

export default function SubmissionsView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
    const [data, setData] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedSubmission, setSelectedSubmission] = useState<Registration | null>(null);
    const [verificationInput, setVerificationInput] = useState('');
    const [verificationError, setVerificationError] = useState('');

    // OTP Verification popup
    const [verificationModalSubmission, setVerificationModalSubmission] = useState<Registration | null>(null);
    const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState<Registration | null>(null);

    useEffect(() => {
        // Initial fetch
        fetchRegistrations();

        // Setup polling every 5 seconds since we are using REST API wrapper without WebSockets
        const intervalId = setInterval(() => {
            fetchRegistrations(false); // pass false to avoid showing loading state on refresh
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Prevent body scrolling when any modal is open
    useEffect(() => {
        if (selectedSubmission || verificationModalSubmission || verifySuccess) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedSubmission, verificationModalSubmission, verifySuccess]);

    const fetchRegistrations = async (showLoadingState = true) => {
        try {
            if (showLoadingState) setLoading(true);
            const { data: regs, error: fetchError } = await supabase
                .from('registrations')
                .select('*');

            if (fetchError) throw fetchError;
            setData(regs || []);
            setError('');
        } catch (err: any) {
            console.error('Error fetching registrations:', err);
            setError(err.message || 'Failed to load submissions.');
        } finally {
            if (showLoadingState) setLoading(false);
        }
    };

    const handleMainTableVerifyClick = (submission: Registration, e: React.MouseEvent) => {
        e.stopPropagation();
        if (submission.verification_code) {
            setVerificationModalSubmission(submission);
            setOtpValues(Array(6).fill(''));
            setVerificationError('');
            setVerifySuccess(null);
        } else {
            handleVerify(submission.id, undefined);
        }
    };

    const handleVerify = async (id: string, e?: React.MouseEvent, codeToVerify?: number) => {
        if (e) e.stopPropagation();

        const targetSubmission = verificationModalSubmission || selectedSubmission;

        if (codeToVerify !== undefined && targetSubmission) {
            if (codeToVerify !== targetSubmission.verification_code) {
                setVerificationError('Invalid verification code.');
                return;
            }
            setVerificationError('');
        } else if (!codeToVerify && !confirm('Mark this team as verified (Food Received)?')) {
            return;
        }

        setIsVerifying(true);

        try {
            // 1. Update registration as verified (only is_verified — safe for any schema)
            const { error: updateError } = await supabase
                .from('registrations')
                .update({ is_verified: true })
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Try to log to verifications table (non-blocking — table may not exist)
            const targetReg = data.find(d => d.id === id);
            if (targetReg) {
                // Parse veg/non-veg counts from food_preference string
                let vegCount = 0;
                let nonVegCount = 0;
                const parts = targetReg.food_preference?.split(', ') || [];
                parts.forEach(part => {
                    const num = parseInt(part);
                    if (!isNaN(num)) {
                        if (part.toLowerCase().includes('non-veg')) {
                            nonVegCount = num;
                        } else if (part.toLowerCase().includes('veg')) {
                            vegCount = num;
                        }
                    }
                });

                try {
                    await supabase.from('verifications').insert([{
                        registration_id: id,
                        team_name: targetReg.team_name,
                        verification_code: targetReg.verification_code,
                        food_preference: targetReg.food_preference,
                        veg_count: vegCount,
                        non_veg_count: nonVegCount,
                        verified_by: 'admin',
                    }]);
                } catch (logErr) {
                    console.warn('Verifications log insert failed (table may not exist):', logErr);
                }
            }

            // 3. Immediately update local state
            const updatedData = data.map(d => d.id === id ? { ...d, is_verified: true } : d);
            setData(updatedData);

            // 4. Show success in modal
            if (verificationModalSubmission && verificationModalSubmission.id === id) {
                setVerifySuccess({ ...verificationModalSubmission, is_verified: true });
                setVerificationModalSubmission(null);
                setOtpValues(Array(6).fill(''));
            }

            // Update details modal if open
            if (selectedSubmission && selectedSubmission.id === id) {
                setSelectedSubmission({ ...selectedSubmission, is_verified: true });
                setVerificationInput('');
            }

            // 5. Refresh from Supabase for accurate data
            await fetchRegistrations(false);

        } catch (err: any) {
            console.error('Verify error:', err);
            setVerificationError('Failed to verify: ' + err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpValues];
        newOtp[index] = value;
        setOtpValues(newOtp);
        setVerificationError('');

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').substring(0, 6);
        if (pastedData) {
            const newOtp = [...otpValues];
            pastedData.split('').forEach((char, i) => {
                newOtp[i] = char;
            });
            setOtpValues(newOtp);
            const nextFocusIndex = Math.min(pastedData.length, 5);
            document.getElementById(`otp-input-${nextFocusIndex}`)?.focus();
        }
    };

    // Dynamic counts
    const pendingCount = data.filter(d => !d.is_verified).length;
    const verifiedCount = data.filter(d => d.is_verified).length;

    // Dynamic food totals
    const totalVegMeals = data.reduce((sum, d) => {
        const parts = d.food_preference?.split(', ') || [];
        let veg = 0;
        parts.forEach(part => {
            const num = parseInt(part);
            if (!isNaN(num) && part.toLowerCase().includes('veg') && !part.toLowerCase().includes('non-veg')) {
                veg = num;
            }
        });
        return sum + veg;
    }, 0);

    const totalNonVegMeals = data.reduce((sum, d) => {
        const parts = d.food_preference?.split(', ') || [];
        let nonVeg = 0;
        parts.forEach(part => {
            const num = parseInt(part);
            if (!isNaN(num) && part.toLowerCase().includes('non-veg')) {
                nonVeg = num;
            }
        });
        return sum + nonVeg;
    }, 0);

    const totalRevenue = data.reduce((sum, d) => sum + (d.total_price || 0), 0);

    const filteredData = data.filter(sub => {
        const matchesSearch = sub.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.payment_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.phone?.includes(searchTerm) ||
            sub.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab = activeTab === 'pending' ? !sub.is_verified : sub.is_verified;
        // Filter out rejected items (only showing pending and verified)
        const isNotRejected = sub.payment_status?.toLowerCase() !== 'rejected';

        return matchesSearch && matchesTab && isNotRejected;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Submissions</h1>
                    <p className={styles.subtitle}>Manage and verify food coupon registrations</p>
                </div>

                <div className={styles.searchContainer}>
                    <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by team, email, phone or UTR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Dynamic Stats Bar */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {[
                    { label: 'Total Teams', value: data.length, color: '#6366f1' },
                    { label: 'Pending', value: pendingCount, color: '#f59e0b' },
                    { label: 'Verified', value: verifiedCount, color: '#10b981' },
                    { label: 'Veg Meals', value: totalVegMeals, color: '#22c55e' },
                    { label: 'Non-Veg', value: totalNonVegMeals, color: '#ef4444' },
                    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#8b5cf6' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        flex: '1 1 130px',
                        background: 'var(--bg-card, #fff)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary, #94a3b8)', fontWeight: '600' }}>
                            {stat.label}
                        </span>
                        <span style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>
                            {loading ? '...' : stat.value}
                        </span>
                    </div>
                ))}
            </div>

            {error && (
                <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' }}>
                    {error}
                </div>
            )}

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Food ({pendingCount})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'verified' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('verified')}
                >
                    Verified ({verifiedCount})
                </button>
                <button
                    onClick={() => fetchRegistrations()}
                    style={{
                        marginLeft: 'auto',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        background: 'var(--bg-card, #fff)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-secondary, #64748b)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Team Contact</th>
                            <th>College</th>
                            <th>Meals</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
                                    Loading submissions...
                                </td>
                            </tr>
                        )}
                        {!loading && filteredData.map(submission => {
                            const statusLabel = submission.payment_status?.charAt(0).toUpperCase() + submission.payment_status?.slice(1) || 'Pending';

                            return (
                                <tr key={submission.id}>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.userName}>{submission.team_name}</div>
                                            <div className={styles.userContact}>{submission.phone} • {submission.email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.userName}>{submission.college}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                            {submission.food_preference?.split(', ').map(pref => {
                                                const isVeg = pref.toLowerCase().includes(' veg') && !pref.toLowerCase().includes('non-veg');
                                                const isLegacyVeg = pref === 'veg';

                                                // Handle text formatting based on the new design
                                                let displayPref: React.ReactNode = pref;
                                                if (pref === 'veg' || (pref.toLowerCase().includes(' veg') && !pref.toLowerCase().includes('non-veg'))) {
                                                    displayPref = pref === 'veg' ? '1 VEG' : pref.toUpperCase();
                                                } else if (pref === 'non-veg' || pref.toLowerCase().includes('non-veg')) {
                                                    const count = pref === 'non-veg' ? '1' : pref.split(' ')[0];
                                                    displayPref = (
                                                        <>
                                                            {count}<br />NON-<br />VEG
                                                        </>
                                                    );
                                                }

                                                // hide 0 counts gracefully
                                                if (typeof displayPref === 'string' && displayPref.startsWith('0 ')) return null;

                                                return (
                                                    <span key={pref} className={`${styles.badge} ${isVeg || isLegacyVeg ? styles.badgeGreen : styles.badgeRed}`}>
                                                        {displayPref}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.transactionId}>{submission.payment_ref}</span>
                                    </td>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <span className={`${styles.statusBadge} ${styles['status' + statusLabel]}`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!submission.is_verified && (
                                                <button
                                                    className={styles.verifyButton}
                                                    onClick={(e) => handleMainTableVerifyClick(submission, e)}
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            <button className={styles.viewButton} onClick={() => setSelectedSubmission(submission)}>
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!loading && filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>
                                    No submissions found in this tab
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for full details */}
            {selectedSubmission && (
                <div className={styles.modalOverlay} onClick={() => setSelectedSubmission(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setSelectedSubmission(null)}>&times;</button>

                        <h2 className={styles.modalTitle}>Team Details</h2>

                        <div className={styles.modalGrid}>
                            <div className={styles.modalSection}>
                                <h3>Contact Information</h3>
                                <p><strong>Team Name:</strong> {selectedSubmission.team_name}</p>
                                <p><strong>Phone:</strong> {selectedSubmission.phone}</p>
                                <p><strong>Email:</strong> {selectedSubmission.email}</p>
                                <p><strong>College:</strong> {selectedSubmission.college}</p>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>Registration Information</h3>
                                <p><strong>Food Preferences:</strong> {selectedSubmission.food_preference}</p>
                                <p><strong>Payment Status:</strong> {selectedSubmission.payment_status}</p>
                                <p><strong>Verification Code:</strong> {selectedSubmission.verification_code || 'None'}</p>
                                <p><strong>Food Received:</strong> {selectedSubmission.is_verified ? 'Yes' : 'No'}</p>
                                <p><strong>Transaction ID / UTR:</strong> {selectedSubmission.payment_ref}</p>
                            </div>
                        </div>

                        {selectedSubmission.screenshot_url && (
                            <div className={styles.modalProof}>
                                <h3>Payment Proof Image</h3>
                                <div className={styles.proofImageContainer}>
                                    <img
                                        src={selectedSubmission.screenshot_url}
                                        alt="Payment Screenshot Proof"
                                        className={styles.proofImage}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button className={styles.closeButton} onClick={() => {
                                setSelectedSubmission(null);
                            }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dedicated OTP Verification Modal */}
            {verificationModalSubmission && (
                <div className={styles.modalOverlay} onClick={() => setVerificationModalSubmission(null)}>
                    <div className={styles.otpModalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setVerificationModalSubmission(null)}>&times;</button>

                        <div className={styles.otpHeader}>
                            <div className={styles.otpIconContainer}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <h2 className={styles.modalTitle} style={{ marginBottom: '8px', textAlign: 'center' }}>Food Coupon <br />Verification</h2>
                            <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '32px' }}>
                                Enter the 6-digit pin for team <strong>{verificationModalSubmission.team_name}</strong>
                            </p>
                        </div>

                        <div className={styles.otpInputContainer} onPaste={handleOtpPaste}>
                            {otpValues.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className={styles.otpDigitInput}
                                    autoFocus={index === 0}
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>

                        {verificationError && (
                            <div className={styles.otpErrorBounce}>
                                <span className={styles.errorTextLarge}>{verificationError}</span>
                            </div>
                        )}

                        <button
                            className={`${styles.otpVerifyBtn} ${otpValues.join('').length === 6 ? styles.otpVerifyBtnActive : ''}`}
                            disabled={isVerifying}
                            onClick={(e) => {
                                const fullCode = otpValues.join('');
                                if (fullCode.length !== 6) {
                                    setVerificationError('Please enter all 6 digits.');
                                    return;
                                }
                                handleVerify(verificationModalSubmission.id, e, parseInt(fullCode, 10));
                            }}
                        >
                            {isVerifying ? 'Verifying...' : 'Confirm Identity & Serve Food'}
                        </button>
                    </div>
                </div>
            )}

            {/* Verification Success Modal */}
            {verifySuccess && (
                <div className={styles.modalOverlay} onClick={() => setVerifySuccess(null)}>
                    <div className={styles.otpModalContent} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 6px 24px rgba(16, 185, 129, 0.3)'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary, #1a1a2e)', margin: '0 0 8px' }}>
                            Verified Successfully!
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', margin: '0 0 24px' }}>
                            Food can be served to team <strong>{verifySuccess.team_name}</strong>
                        </p>

                        <div style={{
                            background: 'var(--bg-card, #f8fafc)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                            border: '1px solid var(--border-color, #e5e7eb)',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Team</span>
                                    <strong>{verifySuccess.team_name}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>College</span>
                                    <strong>{verifySuccess.college}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Food</span>
                                    <strong>{verifySuccess.food_preference}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Phone</span>
                                    <strong>{verifySuccess.phone}</strong>
                                </div>
                            </div>
                        </div>

                        <button
                            className={styles.otpVerifyBtn}
                            style={{ background: '#10b981', width: '100%' }}
                            onClick={() => setVerifySuccess(null)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
