const { MedplumClient } = require('@medplum/core');
const fetch = require('node-fetch');

async function testAuth() {
  try {
    const client = new MedplumClient({
      baseUrl: 'https://api.medplum.com',
      fetch: fetch,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    });
    
    // Try to get an access token using client credentials
    const response = await fetch('https://api.medplum.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'medplum-admin',
        client_secret: 'medplum-admin-secret',
        scope: 'openid profile'
      })
    });
    
    if (response.ok) {
      const tokenData = await response.json();
      console.log('✅ Successfully obtained access token');
      console.log('Token type:', tokenData.token_type);
      console.log('Access token (first 50 chars):', tokenData.access_token?.substring(0, 50) + '...');
      
      // Test the token with a FHIR request
      const fhirResponse = await fetch('https://api.medplum.com/fhir/R4/Patient?_summary=count', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/fhir+json'
        }
      });
      
      if (fhirResponse.ok) {
        const fhirData = await fhirResponse.json();
        console.log('✅ FHIR request successful with token');
        console.log('Patient count:', fhirData.total);
      } else {
        console.log('❌ FHIR request failed:', fhirResponse.status, fhirResponse.statusText);
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Token request failed:', response.status, response.statusText);
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();