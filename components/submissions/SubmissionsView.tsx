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

    // New state for the dedicated OTP Verification popup
    const [verificationModalSubmission, setVerificationModalSubmission] = useState<Registration | null>(null);
    // Use an array to store individual digits for the OTP UI
    const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));

    useEffect(() => {
        fetchRegistrations();
    }, []);

    // Prevent body scrolling when any modal is open
    useEffect(() => {
        if (selectedSubmission || verificationModalSubmission) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedSubmission, verificationModalSubmission]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const { data: regs, error: fetchError } = await supabase
                .from('registrations')
                .select('*');

            if (fetchError) throw fetchError;
            setData(regs || []);
        } catch (err: any) {
            console.error('Error fetching registrations:', err);
            setError(err.message || 'Failed to load submissions.');
        } finally {
            setLoading(false);
        }
    };

    const handleMainTableVerifyClick = (submission: Registration, e: React.MouseEvent) => {
        e.stopPropagation();
        if (submission.verification_code) {
            // Open OTP modal if they have a code
            setVerificationModalSubmission(submission);
            setOtpValues(Array(6).fill(''));
            setVerificationError('');
        } else {
            // Proceed with standard confirmation if no code required
            handleVerify(submission.id, undefined);
        }
    };

    const handleVerify = async (id: string, e?: React.MouseEvent, codeToVerify?: number) => {
        if (e) e.stopPropagation();

        // If a code is provided (from the OTP modal), check it
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

        try {
            const { error: updateError } = await supabase
                .from('registrations')
                .update({ is_verified: true })
                .eq('id', id);

            if (updateError) throw updateError;

            setData(data.map(d => d.id === id ? { ...d, is_verified: true } : d));

            // Update details modal if open
            if (selectedSubmission && selectedSubmission.id === id) {
                setSelectedSubmission({ ...selectedSubmission, is_verified: true });
                setVerificationInput('');
            }

            // Close OTP modal if open
            if (verificationModalSubmission && verificationModalSubmission.id === id) {
                setVerificationModalSubmission(null);
                setOtpValues(Array(6).fill(''));
            }

        } catch (err: any) {
            console.error('Verify error:', err);
            alert('Failed to verify: ' + err.message);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow numbers
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
                    Pending Food
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'verified' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('verified')}
                >
                    Verified (Received)
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
                            <th>Status & Code</th>
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
                            // Normalize status for capitalized badges
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
                                                // Handling legacy "veg"/"non-veg" strings:
                                                const isLegacyVeg = pref === 'veg';

                                                // Handle text formatting based on the new design (e.g. "1\nNON-VEG")
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

                        {/* Removed the inline verification logic from the detail modal to encourage use of the dedicated OTP modal */}
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

                        <div className={styles.otpInputContainer}>
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
                            onClick={(e) => {
                                const fullCode = otpValues.join('');
                                if (fullCode.length !== 6) {
                                    setVerificationError('Please enter all 6 digits.');
                                    return;
                                }
                                handleVerify(verificationModalSubmission.id, e, parseInt(fullCode, 10));
                            }}
                        >
                            Confirm Identity & Serve Food
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
