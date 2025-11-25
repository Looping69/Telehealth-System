
import { MedplumClient } from '@medplum/core';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server directory
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

async function main() {
    console.log('Testing Medplum Connection...');

    const baseUrl = process.env.MEDPLUM_BASE_URL || 'https://api.medplum.com';
    const clientId = process.env.MEDPLUM_CLIENT_ID;
    const clientSecret = process.env.MEDPLUM_CLIENT_SECRET;

    console.log(`Base URL: ${baseUrl}`);
    console.log(`Client ID: ${clientId ? '***' : 'Missing'}`);
    console.log(`Client Secret: ${clientSecret ? '***' : 'Missing'}`);

    if (!clientId || !clientSecret) {
        console.error('Missing credentials in .env');
        return;
    }

    const client = new MedplumClient({
        baseUrl,
        clientId,
        clientSecret
    });

    console.log('Client initialized. Attempting search without explicit login...');
    try {
        const bundle = await client.searchResources('Patient');
        console.log('Search success (No login)! Total:', bundle.total);
    } catch (err) {
        console.log('Search failed without login:', err.message);

        console.log('Attempting startClientLogin...');
        try {
            await client.startClientLogin(clientId, clientSecret);
            console.log('Login success!');
            const bundle = await client.searchResources('Patient');
            console.log('Search success (After login)! Total:', bundle.total);
        } catch (loginErr) {
            console.error('Login failed:', loginErr);
        }
    }
}

main().catch(console.error);
