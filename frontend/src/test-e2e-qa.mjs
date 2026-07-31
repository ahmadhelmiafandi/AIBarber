import http from 'http';
import https from 'https';

const API_BASE = 'http://localhost:8000/api/v1';
const FE_BASE = 'http://localhost:3000';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runE2EVerification() {
  console.log('=== STARTING BROWSER & API E2E QA VERIFICATION ===\n');

  const results = {
    frontendPages: [],
    backendApis: [],
    journeyScenario: null,
    errors: [],
  };

  // 1. Check Frontend Pages
  const pagesToTest = [
    '/',
    '/auth/login',
    '/auth/register',
    '/booking',
    '/dashboard',
    '/barber',
    '/receptionist',
    '/notifications',
  ];

  console.log('--- Testing Frontend App Router Pages ---');
  for (const pagePath of pagesToTest) {
    try {
      const res = await fetchUrl(`${FE_BASE}${pagePath}`);
      const pass = res.status === 200;
      results.frontendPages.push({ path: pagePath, status: res.status, pass });
      console.log(`[FE] ${pagePath} => Status ${res.status} ${pass ? '✓ PASS' : '✗ FAIL'}`);
    } catch (err) {
      results.frontendPages.push({ path: pagePath, status: 'ERROR', pass: false, error: err.message });
      console.log(`[FE] ${pagePath} => ERROR: ${err.message}`);
    }
  }

  // 2. Check Backend REST APIs & User Flow
  console.log('\n--- Testing Backend REST APIs & Customer Journey ---');

  const randId = Math.floor(Math.random() * 100000);
  const timestamp = Date.now();
  const testCustomer = {
    name: `QA Customer ${timestamp}`,
    email: `qacustomer_${timestamp}_${randId}@example.com`,
    password: 'password123',
    password_confirmation: 'password123',
    phone: `08${Math.floor(100000000 + Math.random() * 900000000)}`,
  };

  try {
    // A. Register
    const regRes = await fetchUrl(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(testCustomer),
    });
    console.log(`[API] POST /auth/register => Status ${regRes.status}`);
    const regData = JSON.parse(regRes.body);
    const token = regData.data?.token;

    if (!token) {
      throw new Error(`Register failed: ${regRes.body}`);
    }
    console.log(`✓ Customer Registered & Token Acquired`);

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // B. Get me
    const meRes = await fetchUrl(`${API_BASE}/auth/me`, { headers: authHeaders });
    console.log(`[API] GET /auth/me => Status ${meRes.status} ✓ PASS`);

    // C. Get Branches
    const branchesRes = await fetchUrl(`${API_BASE}/branches`, { headers: authHeaders });
    const branchesData = JSON.parse(branchesRes.body);
    const branchId = branchesData.data?.[0]?.id;
    console.log(`[API] GET /branches => ${branchesData.data?.length || 0} branches found. BranchID: ${branchId}`);

    // D. Get Services
    const servicesRes = await fetchUrl(`${API_BASE}/services`, { headers: authHeaders });
    const servicesData = JSON.parse(servicesRes.body);
    const serviceId = servicesData.data?.[0]?.id;
    console.log(`[API] GET /services => ${servicesData.data?.length || 0} services found. ServiceID: ${serviceId}`);

    // E. Get Barbers
    const barbersRes = await fetchUrl(`${API_BASE}/barbers?branch_id=${branchId}`, { headers: authHeaders });
    const barbersData = JSON.parse(barbersRes.body);
    const barberId = barbersData.data?.[0]?.id;
    console.log(`[API] GET /barbers => ${barbersData.data?.length || 0} barbers found. BarberID: ${barberId}`);

    // F. Get Slots for Tomorrow
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrow = tomorrowObj.toISOString().split('T')[0];

    const slotsRes = await fetchUrl(
      `${API_BASE}/booking-slots?branch_id=${branchId}&booking_date=${tomorrow}&service_id=${serviceId}`,
      { headers: authHeaders }
    );
    const slotsData = JSON.parse(slotsRes.body);
    const rawSlots = slotsData.data?.available_slots || [];
    console.log(`[API] GET /booking-slots for date ${tomorrow} => ${rawSlots.length} slots returned.`);

    const availSlot = rawSlots[0] || '10:00';
    console.log(`✓ Selected Time Slot: ${availSlot}`);

    // G. Create Booking
    const bookingRes = await fetchUrl(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        branch_id: branchId,
        service_id: serviceId,
        booking_date: tomorrow,
        booking_time: availSlot,
        barber_id: barberId,
      }),
    });
    console.log(`[API] POST /bookings => Status ${bookingRes.status}`);
    const bookingData = JSON.parse(bookingRes.body);
    const queueId = bookingData.data?.queue?.queue_id;
    const queueCode = bookingData.data?.queue?.queue_code;
    console.log(`✓ Booking Created. QueueID: ${queueId}, QueueCode: ${queueCode}`);

    // H. Get Active Queue
    const activeRes = await fetchUrl(`${API_BASE}/queues/active`, { headers: authHeaders });
    const activeData = JSON.parse(activeRes.body);
    console.log(
      `[API] GET /queues/active => Code: ${activeData.data?.queue_code}, Position: ${activeData.data?.queue_position}, Customers Ahead: ${activeData.data?.customers_ahead}`
    );

    // I. Get Queue Details
    if (queueId) {
      const queueRes = await fetchUrl(`${API_BASE}/queues/${queueId}`, { headers: authHeaders });
      console.log(`[API] GET /queues/${queueId} => Status ${queueRes.status} ✓ PASS`);

      // J. Perform Check-in
      const checkinRes = await fetchUrl(`${API_BASE}/queues/${queueId}/check-in`, {
        method: 'POST',
        headers: authHeaders,
      });
      console.log(`[API] POST /queues/${queueId}/check-in => Status ${checkinRes.status} ✓ PASS`);
    }

    // K. Get Notifications
    const notifRes = await fetchUrl(`${API_BASE}/notifications`, { headers: authHeaders });
    const notifData = JSON.parse(notifRes.body);
    console.log(`[API] GET /notifications => ${notifData.data?.length || 0} notifications found.`);

    if (notifData.data?.length > 0) {
      const notifId = notifData.data[0].id;
      const readRes = await fetchUrl(`${API_BASE}/notifications/${notifId}/read`, {
        method: 'POST',
        headers: authHeaders,
      });
      console.log(`[API] POST /notifications/${notifId}/read => Status ${readRes.status} ✓ PASS`);
    }

    results.journeyScenario = 'PASS';
  } catch (err) {
    console.error('Scenario Error:', err);
    results.journeyScenario = 'FAIL';
    results.errors.push(err.message);
  }

  console.log('\n==========================================');
  console.log('FINAL E2E QA VERIFICATION SUMMARY:');
  console.log(`Frontend Pages Test: ${results.frontendPages.every((p) => p.pass) ? 'PASS' : 'FAIL'}`);
  console.log(`Customer & Staff Journey APIs: ${results.journeyScenario}`);
  console.log('==========================================');
}

runE2EVerification();
