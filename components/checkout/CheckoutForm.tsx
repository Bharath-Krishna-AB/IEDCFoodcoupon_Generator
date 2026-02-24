import React, { useState } from 'react';
import styles from './CheckoutForm.module.css';
import { supabase } from '@/lib/supabase';

interface CheckoutFormProps {
    onSuccess: () => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
    const [teamName, setTeamName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [college, setCollege] = useState('');
    const [vegCount, setVegCount] = useState(0);
    const [nonVegCount, setNonVegCount] = useState(0);

    const [upiRef, setUpiRef] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const totalPrice = (vegCount * 50) + (nonVegCount * 80);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setScreenshotFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!teamName || !phone || !email || !college || !upiRef || !screenshotFile) {
            setError('Please fill in all required fields and upload a screenshot.');
            return;
        }

        if (vegCount === 0 && nonVegCount === 0) {
            setError('Please select at least one meal for your team.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload screenshot
            const fileExt = screenshotFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('payment_screenshots')
                .upload(fileName, screenshotFile);

            if (uploadError) throw new Error('Failed to upload screenshot: ' + uploadError.message);

            // Get the public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('payment_screenshots')
                .getPublicUrl(fileName);

            const screenshotUrl = publicUrlData.publicUrl;

            // 2. Generate 6-digit verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000);

            // 3. Insert into database
            const payload = {
                team_name: teamName,
                full_name: teamName, // Required by DB but we use Team Name
                phone: phone,
                email: email,
                college: college,
                food_preference: `${vegCount} Veg, ${nonVegCount} Non-Veg`,
                total_price: totalPrice,
                payment_ref: upiRef,
                screenshot_url: screenshotUrl,
                payment_status: 'pending',
                verification_code: verificationCode,
                is_verified: false
            };

            const { error: insertError } = await supabase
                .from('registrations')
                .insert([payload]);

            if (insertError) throw new Error('Failed to save registration: ' + insertError.message);

            // Success!
            onSuccess();

        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'An error occurred during submission.');
            setIsSubmitting(false);
        }
    };

    const increment = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => setter(current + 1);
    const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => setter(current > 0 ? current - 1 : 0);

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
                <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.contentGrid}>
                {/* Left Column: Personal Information & Food */}
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Team Information</h2>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Team Name <span className={styles.required}>*</span>
                                </label>
                                <input type="text" className={styles.input} placeholder="Enter your team name" value={teamName} onChange={e => setTeamName(e.target.value)} required disabled={isSubmitting} />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Phone Number <span className={styles.required}>*</span>
                                    </label>
                                    <input type="tel" className={styles.input} placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} required disabled={isSubmitting} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Email Address <span className={styles.required}>*</span>
                                    </label>
                                    <input type="email" className={styles.input} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isSubmitting} />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    College <span className={styles.required}>*</span>
                                </label>
                                <input type="text" className={styles.input} placeholder="Enter your college name" value={college} onChange={e => setCollege(e.target.value)} required disabled={isSubmitting} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Food Selection</h2>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.counterGroup}>
                                <div className={styles.counterLabel}>
                                    Vegetarian Meals
                                    <span className={styles.counterSub}>₹50 per meal</span>
                                </div>
                                <div className={styles.counterControls}>
                                    <button type="button" className={styles.counterBtn} onClick={() => decrement(setVegCount, vegCount)} disabled={isSubmitting}>-</button>
                                    <span className={styles.counterValue}>{vegCount}</span>
                                    <button type="button" className={styles.counterBtn} onClick={() => increment(setVegCount, vegCount)} disabled={isSubmitting}>+</button>
                                </div>
                            </div>

                            <div className={styles.counterGroup}>
                                <div className={styles.counterLabel}>
                                    Non-Vegetarian Meals
                                    <span className={styles.counterSub}>₹80 per meal</span>
                                </div>
                                <div className={styles.counterControls}>
                                    <button type="button" className={styles.counterBtn} onClick={() => decrement(setNonVegCount, nonVegCount)} disabled={isSubmitting}>-</button>
                                    <span className={styles.counterValue}>{nonVegCount}</span>
                                    <button type="button" className={styles.counterBtn} onClick={() => increment(setNonVegCount, nonVegCount)} disabled={isSubmitting}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=vishnumanjanath7-1@okaxis&pn=Vishnu&cu=INR&am=${totalPrice}`} alt="QR Code" className={styles.qrImage} />
                                </div>
                            </div>

                            <div className={styles.form} style={{ width: '100%', marginTop: '24px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Your UPI ID / UTR Number <span className={styles.required}>*</span>
                                    </label>
                                    <input type="text" className={styles.input} placeholder="e.g. name@upi or UTR..." value={upiRef} onChange={e => setUpiRef(e.target.value)} required disabled={isSubmitting} />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Payment Screenshot <span className={styles.required}>*</span>
                                    </label>
                                    <label className={styles.uploadArea} style={{ opacity: isSubmitting ? 0.5 : 1, borderColor: screenshotFile ? '#10B981' : undefined }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={screenshotFile ? '#10B981' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {screenshotFile ? (
                                                <>
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </>
                                            ) : (
                                                <>
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </>
                                            )}
                                        </svg>
                                        <span style={{ color: screenshotFile ? '#10B981' : undefined }}>
                                            {screenshotFile ? screenshotFile.name : 'Click to Upload Proof'}
                                        </span>
                                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={isSubmitting} required />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                    <button type="submit" className={styles.confirmButton} disabled={isSubmitting || totalPrice === 0}>
                                        {isSubmitting ? 'Processing...' : 'Confirm Registration'}
                                        {!isSubmitting && (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div className={styles.totalFloating}>
                <div className={styles.totalLabel}>TOTAL TO PAY</div>
                <div className={styles.totalAmount}>₹{totalPrice}</div>
            </div>
        </div >
    );
}
