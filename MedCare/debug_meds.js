
const BASE_URL = 'http://localhost:3000';

async function run() {
    let cookie = '';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'linlin_husky' })
    });

    // Get cookie
    const rawCookie = loginRes.headers.get('set-cookie');
    if (rawCookie) {
        cookie = rawCookie.split(';')[0];
    }
    console.log('Login status:', loginRes.status);

    // 2. Get Meds for Peter (before add)
    console.log('Fetching meds for peter_husky (initial)...');
    const getRes1 = await fetch(`${BASE_URL}/api/medications?username=peter_husky`, {
        headers: { 'Cookie': cookie }
    });
    const getJson1 = await getRes1.json();
    console.log('Initial Meds:', JSON.stringify(getJson1, null, 2));

    // 3. Add Med for Peter
    console.log('Adding med for peter_husky...');
    const addRes = await fetch(`${BASE_URL}/api/medications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            username: 'peter_husky',
            name: 'DebugPill',
            dosage: '10mg',
            frequency: 'Daily',
            startDate: new Date().toISOString()
        })
    });
    const addJson = await addRes.json();
    console.log('Add result:', JSON.stringify(addJson, null, 2));

    // 4. Get Meds for Peter (after add)
    console.log('Fetching meds for peter_husky (after add)...');
    const getRes2 = await fetch(`${BASE_URL}/api/medications?username=peter_husky`, {
        headers: { 'Cookie': cookie }
    });
    const getJson2 = await getRes2.json();
    console.log('Final Meds:', JSON.stringify(getJson2, null, 2));
    // 4. Get Meds for linlin_husky
    console.log('Fetching meds for linlin_husky...');
    const getRes3 = await fetch(`${BASE_URL}/api/medications?username=linlin_husky`, {
        headers: { 'Cookie': cookie }
    });
    const getJson3 = await getRes3.json();
    console.log('Linlin Meds:', JSON.stringify(getJson3, null, 2));
}

run().catch(console.error);
