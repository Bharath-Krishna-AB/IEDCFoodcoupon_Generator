/**
 * Load test script — inserts 60 test registrations into Supabase
 * and uploads the Sample SS.png to test storage capacity.
 * 
 * Run: node scripts/load-test.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase config (from .env.local)
const SUPABASE_URL = 'https://jwjfhzkjflioqwrlwjmc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3amZoemtqZmxpb3F3cmx3am1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTUzNDAsImV4cCI6MjA4NzQ5MTM0MH0.3UrNezDJJ9nQ_OBD5-f7hmy1q6WLAhwEDeJI2SViOw0';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
};

// Test data pools
const teamNames = [
    'ByteBusters', 'CodeCrafters', 'TechTitans', 'PixelPioneers', 'DataDriven',
    'LogicLords', 'SyntaxSquad', 'BugHunters', 'NullPointers', 'StackOverflow',
    'AlgoRhythm', 'BitBenders', 'CloudNine', 'DevOpsDemons', 'EliteCoders',
    'FrontendForce', 'GitGurus', 'HackHeroes', 'InfinityLoop', 'JavaJunkies',
    'KernelKings', 'LinuxLegends', 'MetaMinds', 'NodeNinjas', 'OpsOracle',
    'PythonPros', 'QueryQueens', 'ReactRangers', 'SwiftSailors', 'TurboTeam',
    'UnicornDev', 'VectorVibe', 'WebWizards', 'XcodeCrew', 'YieldYoda',
    'ZeroDay', 'ApexCoders', 'BrainBytes', 'CipherCell', 'DeltaForce',
    'EchoEngines', 'FluxTeam', 'GammaGroup', 'HyperHack', 'IonInnovators',
    'JetStream', 'KryptoKids', 'LambdaLabs', 'MegaMinds', 'NeonNerds',
    'OmegaOps', 'PrismPower', 'QuantumQuest', 'RubyRaiders', 'SigmaSquad',
    'ThetaTech', 'UltraUnit', 'VortexVenture', 'WarpWave', 'XenonXperts',
];

const colleges = [
    'MACE Kothamangalam', 'CET Trivandrum', 'NIT Calicut', 'GEC Thrissur',
    'CUSAT Kochi', 'RIT Kottayam', 'TKM Kollam', 'MES Kuttippuram',
    'SCT Trivandrum', 'LBS Kasaragod', 'NSSCE Palakkad', 'SCTCE Trivandrum',
    'FISAT Angamaly', 'VAST Thrissur', 'KMEA Ernakulam',
];

const memberPools = [
    'Anu', 'Arun', 'Deepa', 'Faiz', 'Gokul', 'Hana', 'Irfan', 'Jaya',
    'Kavya', 'Liam', 'Meera', 'Nikhil', 'Ojas', 'Priya', 'Rahul',
    'Sneha', 'Tara', 'Uma', 'Varun', 'Wafi', 'Xavier', 'Yash', 'Zara',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randPhone() { return `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`; }
function randEmail(team) { return `${team.toLowerCase().replace(/\s/g, '')}${Math.floor(Math.random() * 100)}@gmail.com`; }

// Step 1: Upload Sample SS.png once and get its public URL
async function uploadTestScreenshot() {
    const imgPath = path.join(__dirname, '..', 'public', 'Sample SS.png');

    if (!fs.existsSync(imgPath)) {
        console.log('⚠️  Sample SS.png not found in public/, using placeholder URL');
        return 'https://via.placeholder.com/400x600?text=Test+Screenshot';
    }

    const fileBuffer = fs.readFileSync(imgPath);
    const fileName = `load_test_screenshot_${Date.now()}.png`;

    const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/payment_screenshots/${fileName}`,
        {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'image/png',
            },
            body: fileBuffer,
        }
    );

    if (!uploadRes.ok) {
        const err = await uploadRes.text();
        console.log('⚠️  Screenshot upload failed:', err);
        return 'https://via.placeholder.com/400x600?text=Upload+Failed';
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/payment_screenshots/${fileName}`;
    console.log('✅ Screenshot uploaded:', publicUrl);
    return publicUrl;
}

// Step 2: Insert 60 test registrations
async function insertTestData(screenshotUrl) {
    const records = [];

    for (let i = 0; i < 60; i++) {
        const team = teamNames[i] || `TestTeam${i + 1}`;
        const vegCount = Math.floor(Math.random() * 5);
        const nonVegCount = Math.floor(Math.random() * 5) || (vegCount === 0 ? 1 : 0);
        const totalPrice = (vegCount * 50) + (nonVegCount * 80);
        const code = Math.floor(100000 + Math.random() * 900000);

        // Random 1-3 members
        const memberCount = Math.floor(Math.random() * 3) + 1;
        const members = [];
        for (let m = 0; m < memberCount; m++) {
            members.push(pick(memberPools));
        }

        records.push({
            team_name: team,
            full_name: members.length > 0 ? `${team} (Members: ${members.join(', ')})` : team,
            phone: randPhone(),
            email: randEmail(team),
            college: pick(colleges),
            food_preference: `${vegCount} Veg, ${nonVegCount} Non-Veg`,
            total_price: totalPrice,
            payment_ref: `UTR${Date.now()}${i}`,
            screenshot_url: screenshotUrl,
            payment_status: 'pending',
            verification_code: code,
            is_verified: false,
        });
    }

    // Insert in batches of 20
    for (let batch = 0; batch < records.length; batch += 20) {
        const batchRecords = records.slice(batch, batch + 20);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
            method: 'POST',
            headers,
            body: JSON.stringify(batchRecords),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`❌ Batch ${batch / 20 + 1} failed:`, err);
        } else {
            console.log(`✅ Batch ${batch / 20 + 1} inserted (${batchRecords.length} records)`);
        }
    }
}

// Step 3: Verify count
async function verifyCount() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations?select=id`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
    });
    const data = await res.json();
    console.log(`\n📊 Total registrations in database: ${data.length}`);
    return data.length;
}

// Run
async function main() {
    console.log('🚀 Starting load test...\n');

    console.log('📤 Uploading test screenshot...');
    const screenshotUrl = await uploadTestScreenshot();

    console.log('\n📝 Inserting 60 test registrations...');
    await insertTestData(screenshotUrl);

    const count = await verifyCount();

    console.log('\n✅ Load test complete!');
    console.log(`   ${count} total records in database`);
    console.log('\n🧹 To clean up, run this SQL in Supabase SQL Editor:');
    console.log('   DELETE FROM registrations;');
    console.log('   DELETE FROM verifications;');
}

main().catch(console.error);
