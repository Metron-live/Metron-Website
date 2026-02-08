// Beta Signup Function - Sends signup link via email

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { type, value } = JSON.parse(event.body);
    
    // Your beta signup link - UPDATE THIS
    const SIGNUP_LINK = 'https://testflight.apple.com/join/YOUR_CODE'; // Update with actual TestFlight link
    
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    if (type === 'email') {
      // Send email via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Metron AI <beta@metron.live>',
          to: value,
          subject: "🎉 You're in! Welcome to Metron AI™ Beta",
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; padding: 40px 20px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background: #fafaf8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">
    
    <!-- Header -->
    <div style="background: #1a1a1a; padding: 32px; text-align: center;">
      <img src="https://metron.live/brand/brand%20preview/metron_logo_(white).png" alt="Metron AI" height="32" style="margin-bottom: 16px;">
      <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">You're In! 🎉</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6; margin: 0 0 20px;">
        Welcome to the beta! You're one of the first to experience the <strong>world's first fully integrated AI trainer</strong>.
      </p>
      
      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6; margin: 0 0 24px;">
        Metron AI™ connects your sleep, recovery, training, and nutrition into one intelligent system that adapts to YOU.
      </p>
      
      <!-- What You Get -->
      <div style="background: #f0f0ee; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px;">What you're getting:</p>
        <p style="font-size: 14px; color: #444; margin: 0 0 8px;">✓ Complete 12-week personalized plan</p>
        <p style="font-size: 14px; color: #444; margin: 0 0 8px;">✓ Daily workout & nutrition adjustments</p>
        <p style="font-size: 14px; color: #444; margin: 0 0 8px;">✓ Unlimited Arete AI™ coaching</p>
        <p style="font-size: 14px; color: #444; margin: 0;">✓ Locked-in \$6.99/mo beta pricing (normally \$9.99)</p>
      </div>
      
      <!-- CTA Button -->
      <a href="${SIGNUP_LINK}" style="display: block; background: #E8734A; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; margin: 32px 0;">
        Download Metron AI™ →
      </a>
      
      <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 24px 0 0; text-align: center;">
        Questions? Just reply to this email.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 24px; text-align: center;">
      <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;">
        © 2026 Metron Health AI, Inc.
      </p>
    </div>
    
  </div>
</body>
</html>
          `
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Resend error:', error);
        throw new Error('Failed to send email');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Email sent!' })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
    };
  }
};
