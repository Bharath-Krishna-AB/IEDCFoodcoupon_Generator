import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
};

// GET /api/scan-verify?id=<registration_id> OR ?code=<verification_code>
// Look up a registration by its ID or 6-digit code and return all details
export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        const code = request.nextUrl.searchParams.get('code');

        if (!id && !code) {
            return NextResponse.json({ error: 'Missing registration ID or Code' }, { status: 400 });
        }

        let url = `${SUPABASE_URL}/rest/v1/registrations?select=*`;
        if (id) {
            url += `&id=eq.${id}`;
        } else if (code) {
            url += `&verification_code=eq.${code}`;
        }

        const res = await fetch(url, { headers });

        if (!res.ok) {
            const text = await res.text();
            console.error('[scan-verify GET] Supabase error:', text);
            return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 });
        }

        const data = await res.json();
        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        return NextResponse.json({ registration: data[0] });
    } catch (err) {
        console.error('[scan-verify GET] Error:', err);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// POST /api/scan-verify
// Body: { id: string, couponCode: string }
// Verifies the coupon code matches and marks is_verified = true
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, couponCode } = body;

        if (!id || !couponCode) {
            return NextResponse.json({ error: 'Missing id or couponCode' }, { status: 400 });
        }

        // 1. Look up the registration
        const lookupRes = await fetch(
            `${SUPABASE_URL}/rest/v1/registrations?select=*&id=eq.${id}`,
            { headers }
        );

        if (!lookupRes.ok) {
            return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 });
        }

        const rows = await lookupRes.json();
        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        const registration = rows[0];

        // 2. Check if already verified
        if (registration.is_verified) {
            return NextResponse.json({
                error: 'This coupon has already been verified.',
                alreadyVerified: true,
                registration,
            }, { status: 409 });
        }

        // 3. Check coupon code matches
        if (String(registration.verification_code) !== String(couponCode)) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 403 });
        }

        // 4. Mark as verified
        const updateRes = await fetch(
            `${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ is_verified: true }),
            }
        );

        if (!updateRes.ok) {
            const text = await updateRes.text();
            console.error('[scan-verify POST] Update error:', text);
            return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
        }

        const updated = await updateRes.json();

        return NextResponse.json({
            success: true,
            message: 'Coupon verified successfully!',
            registration: updated[0] || { ...registration, is_verified: true },
        });
    } catch (err) {
        console.error('[scan-verify POST] Error:', err);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
