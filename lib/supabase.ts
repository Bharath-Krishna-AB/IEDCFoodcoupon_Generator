const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
const configError = new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};


// Extremely lightweight wrapper to mimic Supabase-js syntax using REST API
export const supabase = {
    from: (table: string) => ({
        select: async (query = '*') => {
            if (!isConfigured) return { data: null, error: configError };
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${query}&order=created_at.desc`, { headers });
                if (!res.ok) throw new Error(await res.text());
                return { data: await res.json(), error: null };
            } catch (err: any) {
                return { data: null, error: err };
            }
        },
        insert: async (payload: any[]) => {
            if (!isConfigured) return { data: null, error: configError };
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error(await res.text());
                return { data: await res.json(), error: null };
            } catch (err: any) {
                return { data: null, error: err };
            }
        },
        update: (payload: any) => ({
            eq: async (column: string, value: any) => {
                if (!isConfigured) return { data: null, error: configError };
                try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error(await res.text());
                    return { data: await res.json(), error: null };
                } catch (err: any) {
                    return { data: null, error: err };
                }
            }
        })
    }),
    storage: {
        from: (bucket: string) => ({
            upload: async (path: string, file: File) => {
                if (!isConfigured) return { data: null, error: configError };
                try {
                    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': file.type || 'application/octet-stream'
                        },
                        body: file
                    });
                    if (!res.ok) throw new Error(await res.text());
                    return { data: await res.json(), error: null };
                } catch (err: any) {
                    return { data: null, error: err };
                }
            },
            getPublicUrl: (path: string) => ({
                data: {
                    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
                }
            })
        })
    }
};
