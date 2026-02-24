"use client"
import React, { useState } from 'react';
import CheckoutForm from '../checkout/CheckoutForm';

export default function RegistrationFlow() {
    const [isSuccess, setIsSuccess] = useState(false);

    if (isSuccess) {
        return (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '40px auto' }}>
                <div style={{ width: '80px', height: '80px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Registration Successful!</h2>
                <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px', lineHeight: '1.6' }}>
                    Your food coupon registration has been submitted and is pending verification. Please check the submissions page or wait for confirmation.
                </p>
                <button
                    onClick={() => setIsSuccess(false)}
                    style={{ background: '#000', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
                >
                    Register Another Team
                </button>
            </div>
        );
    }

    return (
        <CheckoutForm
            onSuccess={() => setIsSuccess(true)}
        />
    );
}
