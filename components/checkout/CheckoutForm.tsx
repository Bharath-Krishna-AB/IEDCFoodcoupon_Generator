"use client"
import React, { useState } from 'react';
import styles from './CheckoutForm.module.css';

interface CheckoutFormProps {
    totalPrice: number;
    foodPreference: 'veg' | 'non-veg';
    onBack: () => void;
}

export default function CheckoutForm({ totalPrice, foodPreference, onBack }: CheckoutFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [college, setCollege] = useState('');
    const [teamName, setTeamName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [couponCode, setCouponCode] = useState('');

    const handleSubmit = async () => {
        // Clear previous error
        setError('');

        // Validate required fields
        if (!name || !phone || !email || !college || !teamName || !upiId) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/send-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    college,
                    teamName,
                    foodPreference,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                return;
            }

            setCouponCode(data.couponCode);
            setSuccess(true);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Success confirmation view
    if (success) {
        return (
            <div className={styles.checkoutContainer}>
                <div className={styles.header} style={{ textAlign: 'center' }}>
                    <h1 className={styles.title}>🎉 Registration Confirmed!</h1>
                    <p className={styles.subtitle}>
                        Your food coupon has been sent to your email.
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '32px 0',
                    gap: '16px',
                }}>
                    <p style={{ color: '#718096', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
                        Your Coupon Code
                    </p>
                    <div style={{
                        backgroundColor: '#1a1a2e',
                        color: '#ffffff',
                        fontSize: '32px',
                        fontWeight: 700,
                        letterSpacing: '8px',
                        padding: '16px 32px',
                        borderRadius: '8px',
                    }}>
                        {couponCode}
                    </div>
                    <p style={{ color: '#718096', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
                        Check your email <strong>{email}</strong> for the QR code and full details.<br />
                        Show the email at the food counter to claim your meal.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Secure Checkout</h1>
                <p className={styles.subtitle}>
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Payments are secure and encrypted
                </p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fff5f5',
                    color: '#c53030',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    border: '1px solid #feb2b2',
                }}>
                    {error}
                </div>
            )}

            <div className={styles.contentGrid}>
                {/* Left Column: Personal Information */}
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Personal Information</h2>
                        </div>

                        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Full Name <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Phone Number <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        placeholder="+91..."
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Email Address <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    College <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Enter your college name"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Team Name <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Enter your team name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    <button type="button" className={styles.returnLink} onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Food Selection
                    </button>
                </div>

                {/* Right Column: Payment & Confirmation */}
                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Complete Payment</h2>
                        </div>

                        <div className={styles.paymentSection}>
                            <div className={styles.qrCodeContainer}>
                                <div className={styles.qrCodePlaceholder}>
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=vishnumanjanath7-1@okaxis&pn=Vishnu&cu=INR" alt="QR Code" className={styles.qrImage} />
                                </div>
                            </div>

                            <form className={styles.form} style={{ width: '100%', marginTop: '24px' }} onSubmit={(e) => e.preventDefault()}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Your UPI ID / UTR Number <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. name@upi or UTR..."
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Payment Screenshot <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.uploadArea}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <span>Click to Upload Proof</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                    <button
                                        type="button"
                                        className={styles.confirmButton}
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                    >
                                        {loading ? 'Sending Coupon...' : 'Confirm Registration'}
                                        {!loading && (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.totalFloating}>
                <div className={styles.totalLabel}>TOTAL TO PAY</div>
                <div className={styles.totalAmount}>₹{totalPrice}</div>
            </div>
        </div >
    );
}
