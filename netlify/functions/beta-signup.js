const RESERVATION_RECIPIENT = process.env.SIGNUP_NOTIFICATION_EMAIL || 'beta@metron.live';

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

const normalizePhone = (value) => String(value || '').trim().replace(/[\s().-]/g, '');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid request' });
  }

  if (payload.type !== 'phone') {
    return jsonResponse(400, { error: 'A mobile phone number is required' });
  }

  const phone = normalizePhone(payload.value);
  if (!/^\+?[0-9]{10,15}$/.test(phone)) {
    return jsonResponse(422, { error: 'Enter a valid mobile phone number' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return jsonResponse(503, { error: 'Reservation service is temporarily unavailable' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Metron Reservations <beta@metron.live>',
        to: RESERVATION_RECIPIENT,
        subject: 'New Metron free-year reservation',
        text: `Mobile: ${phone}\nOffer: founding free-year reservation\nSource: metron.live`
      })
    });

    if (!response.ok) {
      console.error('Resend reservation notification failed', { status: response.status });
      return jsonResponse(502, { error: 'Could not save the reservation' });
    }

    return jsonResponse(200, { success: true });
  } catch (error) {
    console.error('Reservation function failed', { message: error.message });
    return jsonResponse(500, { error: 'Something went wrong. Please try again.' });
  }
};
