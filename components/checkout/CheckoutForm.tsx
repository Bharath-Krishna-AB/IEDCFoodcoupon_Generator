"use client";
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
    const [teamMembers, setTeamMembers] = useState<string[]>([]);
    const [currentMember, setCurrentMember] = useState('');
    const [vegCount, setVegCount] = useState(0);
    const [nonVegCount, setNonVegCount] = useState(0);

    const [upiRef, setUpiRef] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Success state
    const [isSuccess, setIsSuccess] = useState(false);
    const [successCode, setSuccessCode] = useState('');

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
            // 1. Upload screenshot via server-side API route
            const uploadFormData = new FormData();
            uploadFormData.append('file', screenshotFile);

            const uploadRes = await fetch('/api/upload-screenshot', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!uploadRes.ok) {
                const uploadErr = await uploadRes.json();
                throw new Error('Failed to upload screenshot: ' + (uploadErr.error || 'Unknown error'));
            }

            const { url: screenshotUrl } = await uploadRes.json();

            // 2. Check for duplicate UTR
            const { data: existingReg } = await supabase
                .from('registrations')
                .selectFilter({ payment_ref: upiRef.trim() }, 'team_name,payment_ref');

            if (existingReg && existingReg.length > 0) {
                throw new Error(`This UTR / UPI ID has already been used by team "${existingReg[0].team_name}". Please use a unique transaction reference.`);
            }

            // 3. Generate 6-digit verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000);

            // 3. Insert into database
            const payload = {
                team_name: teamName,
                full_name: teamMembers.length > 0 ? `${teamName} (Members: ${teamMembers.join(', ')})` : teamName,
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

            const { data: insertedData, error: insertError } = await supabase
                .from('registrations')
                .insert([payload]);

            if (insertError) throw new Error('Failed to save registration: ' + insertError.message);

            // 4. Send verification email in background (fire-and-forget — don't block success screen)
            const registrationId = insertedData?.[0]?.id || '';
            fetch('/api/send-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName,
                    email: email,
                    phone: phone,
                    college: college,
                    teamName: teamName,
                    foodPreference: `${vegCount} Veg, ${nonVegCount} Non-Veg`,
                    registrationId: registrationId,
                    verificationCode: verificationCode.toString(),
                }),
            }).catch(emailErr => {
                console.warn('Email sending failed (registration still saved):', emailErr);
            });

            // 5. Show success
            setSuccessCode(verificationCode.toString());
            setIsSuccess(true);
            onSuccess();

        } catch (err: any) {
            console.error('Submission error full details:', err);
            if (err.message) console.error('Error message:', err.message);
            if (err.details) console.error('Error details:', err.details);
            if (err.hint) console.error('Error hint:', err.hint);
            setError(err.message || 'An error occurred during submission. Check console for details.');
            setIsSubmitting(false);
        }
    };

    const increment = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => setter(current + 1);
    const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => setter(current > 0 ? current - 1 : 0);

    const handleNewRegistration = () => {
        setTeamName('');
        setPhone('');
        setEmail('');
        setCollege('');
        setTeamMembers([]);
        setCurrentMember('');
        setVegCount(0);
        setNonVegCount(0);
        setUpiRef('');
        setScreenshotFile(null);
        setIsSubmitting(false);
        setError('');
        setIsSuccess(false);
        setSuccessCode('');
    };

    const handleAddMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = currentMember.trim();
            if (trimmed && !teamMembers.includes(trimmed)) {
                setTeamMembers([...teamMembers, trimmed]);
                setCurrentMember('');
            }
        }
    };

    const handleRemoveMember = (memberToRemove: string) => {
        setTeamMembers(teamMembers.filter(m => m !== memberToRemove));
    };

    // Success screen
    if (isSuccess) {
        return (
            <div className={styles.checkoutContainer}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 40px',
                    textAlign: 'center',
                    gap: '24px',
                    minHeight: '400px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary, #1a1a2e)', margin: '0 0 8px' }}>
                            Registration Successful!
                        </h2>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary, #64748b)', margin: 0, lineHeight: 1.6 }}>
                            A verification email has been sent to <strong>{email}</strong>
                        </p>
                    </div>

                    <div style={{
                        background: 'var(--bg-card, #f8fafc)',
                        border: '2px dashed var(--border-color, #e2e8f0)',
                        borderRadius: '16px',
                        padding: '24px 40px',
                        marginTop: '8px'
                    }}>
                        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary, #94a3b8)', margin: '0 0 8px' }}>
                            Verification Code
                        </p>
                        <p style={{
                            fontSize: '36px',
                            fontWeight: '800',
                            letterSpacing: '8px',
                            color: 'var(--text-primary, #1a1a2e)',
                            margin: 0,
                            fontFamily: 'var(--font-geist-mono), monospace'
                        }}>
                            {successCode}
                        </p>
                    </div>

                    <div style={{
                        background: 'var(--bg-card, #f0f9ff)',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid var(--border-color, #bae6fd)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span style={{ fontSize: '13px', color: '#0369a1' }}>
                            Share this code with the participant. It will be used for food verification.
                        </span>
                    </div>

                    <button
                        onClick={handleNewRegistration}
                        className={styles.confirmButton}
                        style={{ marginTop: '8px' }}
                    >
                        Register Another Team
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
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
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Team Name <span className={styles.required}>*</span>
                                    </label>
                                    <input type="text" className={styles.input} placeholder="Enter your team name" value={teamName} onChange={e => setTeamName(e.target.value)} required disabled={isSubmitting} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Extra Members <span className={styles.optional}>(Optional)</span>
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Type name & press Enter"
                                            value={currentMember}
                                            onChange={e => setCurrentMember(e.target.value)}
                                            onKeyDown={handleAddMember}
                                            disabled={isSubmitting}
                                        />
                                        {teamMembers.length > 0 && (
                                            <div className={styles.tagsContainer}>
                                                {teamMembers.map((member, idx) => (
                                                    <span key={idx} className={styles.tag}>
                                                        {member}
                                                        <button
                                                            type="button"
                                                            className={styles.tagRemove}
                                                            onClick={(e) => { e.preventDefault(); handleRemoveMember(member); }}
                                                            aria-label={`Remove ${member}`}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                    <img src="/payment-qr.png" alt="UPI Payment QR Code" className={styles.qrImage} />
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
