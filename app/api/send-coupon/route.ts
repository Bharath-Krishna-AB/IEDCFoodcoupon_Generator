import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateQRCodeURL } from '@/lib/coupon';
import { buildCouponEmailHTML } from '@/lib/email-template';

interface SendCouponBody {
    name: string;
    email: string;
    phone: string;
    college: string;
    teamName: string;
    foodPreference: string;
    registrationId?: string;
    verificationCode?: string;
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
        const { name, email, phone, college, teamName, foodPreference, verificationCode } = body;
        if (!name || !email || !phone || !college || !teamName || !foodPreference) {
            return NextResponse.json(
                { error: 'All fields are required.' },
                { status: 400 }
            );
        }

        // Use the verification code passed from the frontend (already generated and stored in Supabase)
        const couponCode = verificationCode || Math.floor(100000 + Math.random() * 900000).toString();

        // Generate QR code URL
        const qrCodeURL = generateQRCodeURL({
            id: body.registrationId || 'unknown',
            couponCode,
        });

        // Parse team-specific veg/non-veg counts from the food preference string
        // The frontend sends foodPreference as the full string like "1 Veg, 2 Non-Veg"
        // or as just 'veg' / 'non-veg' for legacy
        let teamVegCount = 0;
        let teamNonVegCount = 0;

        if (body.foodPreference) {
            const pref = body.foodPreference;
            if (pref === 'veg') {
                teamVegCount = 1;
            } else if (pref === 'non-veg') {
                teamNonVegCount = 1;
            } else {
                // Parse from string like "1 Veg, 2 Non-Veg"
                const parts = pref.split(', ');
                parts.forEach((part: string) => {
                    const num = parseInt(part);
                    if (!isNaN(num)) {
                        if (part.toLowerCase().includes('non-veg')) {
                            teamNonVegCount = num;
                        } else if (part.toLowerCase().includes('veg')) {
                            teamVegCount = num;
                        }
                    }
                });
            }
        }

        // Build email HTML
        const html = buildCouponEmailHTML({
            teamName,
            college,
            couponCode,
            qrCodeURL,
            teamVegCount,
            teamNonVegCount,
        });

        // Send email via Resend
        console.log(`[Email] Attempting to send to: ${email}`);
        const { data, error } = await resend.emails.send({
            from: 'IEDC Food Coupon <onboarding@resend.dev>',
            to: [email],
            subject: `Your IEDC Food Coupon — Code: ${couponCode}`,
            html,
        });

        if (error) {
            console.error('[Email] Resend error:', JSON.stringify(error, null, 2));
            console.error('[Email] NOTE: With onboarding@resend.dev, Resend only allows sending to the email you signed up with.');
            console.error('[Email] To send to any email, verify a custom domain at https://resend.com/domains');
            return NextResponse.json(
                { error: 'Failed to send email. Resend free tier only allows sending to your signup email. Verify a custom domain to send to others.' },
                { status: 500 }
            );
        }

        console.log(`[Email] Successfully sent to ${email}, ID: ${data?.id}`);
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
