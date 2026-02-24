"use client"
import React, { useState } from 'react';
import CheckoutForm from '../checkout/CheckoutForm';

export default function RegistrationFlow() {
    return (
        <CheckoutForm
            onSuccess={() => console.log('Registration Complete')}
        />
    );
}
