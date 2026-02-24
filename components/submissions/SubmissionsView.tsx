"use client";
import React, { useState } from 'react';
import styles from './SubmissionsView.module.css';

// Mock data interfaces
interface Submission {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    college: string;
    foodPreference: 'Vegetarian' | 'Non-Vegetarian';
    transactionId: string;
    status: 'Verified' | 'Pending' | 'Rejected';
    timestamp: string;
}

const mockData: Submission[] = [
    {
        id: '1',
        fullName: 'Rahul Sharma',
        phone: '+919876543210',
        email: 'rahul.s@example.com',
        college: 'NITC',
        foodPreference: 'Vegetarian',
        transactionId: '1234xxxx5678',
        status: 'Verified',
        timestamp: '2026-02-24T10:30:00Z'
    },
    {
        id: '2',
        fullName: 'Aisha Khan',
        phone: '+919988776655',
        email: 'aisha.k@example.com',
        college: 'GEC Kozhikode',
        foodPreference: 'Non-Vegetarian',
        transactionId: '8765xxxx4321',
        status: 'Pending',
        timestamp: '2026-02-24T11:15:00Z'
    },
    {
        id: '3',
        fullName: 'Vishnu Manjanath',
        phone: '+919123456789',
        email: 'vishnu.m@example.com',
        college: 'NIT Calicut',
        foodPreference: 'Non-Vegetarian',
        transactionId: '1122xxxx3344',
        status: 'Verified',
        timestamp: '2026-02-24T09:45:00Z'
    }
];

export default function SubmissionsView() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = mockData.filter(sub =>
        sub.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm)
    );

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
                        placeholder="Search by name, phone or UTR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Registrant Info</th>
                            <th>College</th>
                            <th>Preference</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(submission => (
                            <tr key={submission.id}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{submission.fullName}</div>
                                        <div className={styles.userContact}>{submission.phone} • {submission.email}</div>
                                    </div>
                                </td>
                                <td>{submission.college}</td>
                                <td>
                                    <span className={`${styles.badge} ${submission.foodPreference === 'Vegetarian' ? styles.badgeGreen : styles.badgeRed}`}>
                                        {submission.foodPreference}
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.transactionId}>{submission.transactionId}</span>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles['status' + submission.status]}`}>
                                        {submission.status}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.viewButton}>View Details</button>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>
                                    No submissions found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
