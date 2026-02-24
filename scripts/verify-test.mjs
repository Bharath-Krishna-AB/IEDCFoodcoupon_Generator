/**
 * Verification test script — fetches registrations, then verifies ~30 of them
 * by updating is_verified (same as the UI does via the OTP modal).
 * 
 * Run: node scripts/verify-test.mjs
 */

const SUPABASE_URL = 'https://jwjfhzkjflioqwrlwjmc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3amZoemtqZmxpb3F3cmx3am1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTUzNDAsImV4cCI6MjA4NzQ5MTM0MH0.3UrNezDJJ9nQ_OBD5-f7hmy1q6WLAhwEDeJI2SViOw0';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
};

async function main() {
    console.log('🔍 Fetching all unverified registrations...\n');

    // 1. Fetch all pending registrations
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/registrations?is_verified=eq.false&select=id,team_name,verification_code,food_preference`,
        { headers }
    );
    const pending = await res.json();
    console.log(`📋 Found ${pending.length} unverified registrations\n`);

    // 2. Verify ~30 of them (simulating OTP entry in the UI)
    const toVerify = pending.slice(0, 30);
    let successCount = 0;
    let failCount = 0;

    for (const reg of toVerify) {
        // Simulate: admin enters the verification_code correctly → update is_verified = true
        const updateRes = await fetch(
            `${SUPABASE_URL}/rest/v1/registrations?id=eq.${reg.id}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ is_verified: true }),
            }
        );

        if (updateRes.ok) {
            successCount++;
            console.log(`  ✅ Verified: ${reg.team_name} (code: ${reg.verification_code})`);
        } else {
            failCount++;
            const err = await updateRes.text();
            console.log(`  ❌ Failed: ${reg.team_name} — ${err}`);
        }
    }

    console.log(`\n📊 Verification Results:`);
    console.log(`   ✅ Verified: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    // 3. Show final counts
    const allRes = await fetch(
        `${SUPABASE_URL}/rest/v1/registrations?select=id,is_verified`,
        { headers }
    );
    const allData = await allRes.json();
    const verified = allData.filter(r => r.is_verified).length;
    const stillPending = allData.filter(r => !r.is_verified).length;

    console.log(`\n📈 Database State:`);
    console.log(`   Total: ${allData.length}`);
    console.log(`   Verified: ${verified}`);
    console.log(`   Pending: ${stillPending}`);
    console.log('\n✅ Verification stress test complete!');
}

main().catch(console.error);
