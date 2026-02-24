import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateCode, generateQRDataURL } from '@/lib/coupon';
import { buildCouponEmailHTML } from '@/lib/email-template';
import { saveRegistration } from '@/lib/mock-data';

interface SendCouponBody {
    name: string;
    email: string;
    phone: string;
    college: string;
    teamName: string;
    foodPreference: 'veg' | 'non-veg';
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Email service is not configured. Please set RESEND_API_KEY.' },
                { status: 500 }
            );
        }

        const resend = new Resend(apiKey);
        const body: SendCouponBody = await request.json();

        // Validate required fields
        const { name, email, phone, college, teamName, foodPreference } = body;
        if (!name || !email || !phone || !college || !teamName || !foodPreference) {
            return NextResponse.json(
                { error: 'All fields are required.' },
                { status: 400 }
            );
        }

        // Generate coupon code and QR
        const couponCode = generateCode();
        const qrDataURL = await generateQRDataURL({ couponCode, name, teamName });

        // Save to mock data store
        saveRegistration({
            name,
            email,
            phone,
            college,
            teamName,
            foodPreference,
            couponCode,
        });

        // Build email HTML
        const html = buildCouponEmailHTML({
            name,
            teamName,
            couponCode,
            qrDataURL,
            foodPreference,
        });

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: 'IEDC Food Coupon <onboarding@resend.dev>',
            to: [email],
            subject: `Your IEDC Food Coupon — Code: ${couponCode}`,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: 'Failed to send email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            couponCode,
            emailId: data?.id,
        });
    } catch (err) {
        console.error('Send coupon error:', err);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
