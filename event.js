export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const PIXEL_ID = '771098088514086';
  const ACCESS_TOKEN = process.env.META_PIXEL_TOKEN;

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Token not configured' });
  }

  try {
    const { eventName, eventSourceUrl, clientIp, clientUserAgent, fbp, fbc } = req.body;

    const payload = {
      data: [
        {
          event_name: eventName || 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: eventSourceUrl || '',
          user_data: {
            client_ip_address: clientIp || req.headers['x-forwarded-for'] || '',
            client_user_agent: clientUserAgent || req.headers['user-agent'] || '',
            ...(fbp && { fbp }),
            ...(fbc && { fbc }),
          },
        },
      ],
      // test_event_code: 'TEST12345', // remover em produção
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
