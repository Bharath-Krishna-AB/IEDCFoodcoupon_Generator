import React from 'react';
import styles from './CheckoutForm.module.css';

interface CheckoutFormProps {
    totalPrice: number;
    onBack: () => void;
}

export default function CheckoutForm({ totalPrice, onBack }: CheckoutFormProps) {
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

            <div className={styles.contentGrid}>
                {/* Left Column: Personal Information */}
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Personal Information</h2>
                        </div>

                        <form className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Full Name <span className={styles.required}>*</span>
                                </label>
                                <input type="text" className={styles.input} placeholder="Enter your full name" />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Phone Number <span className={styles.required}>*</span>
                                    </label>
                                    <input type="tel" className={styles.input} placeholder="+91..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Email Address <span className={styles.required}>*</span>
                                    </label>
                                    <input type="email" className={styles.input} placeholder="your@email.com" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    College <span className={styles.required}>*</span>
                                </label>
                                <input type="text" className={styles.input} placeholder="Enter your college name" />
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

                            <form className={styles.form} style={{ width: '100%', marginTop: '24px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Your UPI ID / UTR Number <span className={styles.required}>*</span>
                                    </label>
                                    <input type="text" className={styles.input} placeholder="e.g. name@upi or UTR..." />
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
                                    <button type="button" className={styles.confirmButton}>
                                        Confirm Registration
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
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
