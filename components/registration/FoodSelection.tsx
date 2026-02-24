"use client"
import React, { useState } from 'react';
import styles from './FoodSelection.module.css';

interface FoodSelectionProps {
    initialSelection: 'veg' | 'non-veg' | null;
    onProceed: (preference: 'veg' | 'non-veg') => void;
}

export default function FoodSelection({ initialSelection, onProceed }: FoodSelectionProps) {
    const [selected, setSelected] = useState<'veg' | 'non-veg' | null>(initialSelection);

    const handleSelect = (option: 'veg' | 'non-veg') => {
        setSelected(option);
    };

    const handleContinue = () => {
        if (selected) {
            onProceed(selected);
        }
    };

    return (
        <div className={styles.selectionContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Food Preference</h1>
                <p className={styles.subtitle}>
                    Select your meal type for the event
                </p>
            </div>

            <div className={styles.cardsGrid}>
                {/* Veg Option */}
                <div
                    className={`${styles.optionCard} ${selected === 'veg' ? styles.active : ''}`}
                    onClick={() => handleSelect('veg')}
                >
                    <div className={styles.iconContainer}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#25a153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            <rect x="4" y="4" width="16" height="16" rx="4" />
                            <circle cx="12" cy="12" r="4" fill="#25a153" />
                        </svg>
                    </div>
                    <div className={styles.optionDetails}>
                        <h3 className={styles.optionName}>Vegetarian</h3>
                        <p className={styles.optionPrice}>₹50</p>
                    </div>
                    <div className={styles.radioIndicator}>
                        {selected === 'veg' && <div className={styles.radioInner} />}
                    </div>
                </div>

                {/* Non-Veg Option */}
                <div
                    className={`${styles.optionCard} ${selected === 'non-veg' ? styles.active : ''}`}
                    onClick={() => handleSelect('non-veg')}
                >
                    <div className={styles.iconContainer}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e12d39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            <rect x="4" y="4" width="16" height="16" rx="4" />
                            <path d="M16 12L8 12M12 8l-4 4 4 4" stroke="#e12d39" />
                        </svg>
                    </div>
                    <div className={styles.optionDetails}>
                        <h3 className={styles.optionName}>Non-Vegetarian</h3>
                        <p className={styles.optionPrice}>₹80</p>
                    </div>
                    <div className={styles.radioIndicator}>
                        {selected === 'non-veg' && <div className={styles.radioInner} />}
                    </div>
                </div>
            </div>

            <div className={styles.actionContainer}>
                <button
                    className={`${styles.proceedButton} ${!selected ? styles.disabled : ''}`}
                    onClick={handleContinue}
                    disabled={!selected}
                >
                    Proceed to Checkout
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
