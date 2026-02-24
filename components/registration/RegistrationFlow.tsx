"use client"
import React, { useState } from 'react';
import FoodSelection from './FoodSelection';
import CheckoutForm from '../checkout/CheckoutForm';

export default function RegistrationFlow() {
    const [step, setStep] = useState<1 | 2>(1);
    const [foodPreference, setFoodPreference] = useState<'veg' | 'non-veg' | null>(null);

    const handleProceed = (preference: 'veg' | 'non-veg') => {
        setFoodPreference(preference);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        // keeping the preference selected if they go back
    };

    // Determine price based on selection
    const totalPrice = foodPreference === 'veg' ? 100 : foodPreference === 'non-veg' ? 200 : 0;

    return (
        <>
            {step === 1 && (
                <FoodSelection
                    initialSelection={foodPreference}
                    onProceed={handleProceed}
                />
            )}
            {step === 2 && (
                <CheckoutForm
                    totalPrice={totalPrice}
                    foodPreference={foodPreference!}
                    onBack={handleBack}
                />
            )}
        </>
    );
}
