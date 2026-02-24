import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Convert File to ArrayBuffer for server-side upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const uploadRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/payment_screenshots/${fileName}`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': file.type || 'application/octet-stream',
                },
                body: buffer,
            }
        );

        if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error('Supabase storage upload error:', errorText);
            return NextResponse.json(
                { error: `Upload failed: ${errorText}` },
                { status: uploadRes.status }
            );
        }

        // Build public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/payment_screenshots/${fileName}`;

        return NextResponse.json({ url: publicUrl, fileName });
    } catch (err: any) {
        console.error('Upload API error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
